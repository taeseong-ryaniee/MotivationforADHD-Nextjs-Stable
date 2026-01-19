import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { storage } from './storage/StorageManager'
import type { TodoData, SyncData, SyncMetadata, S3Config, SyncStrategy, SyncConflict, Settings } from './types'

let deviceId: string | null = null

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  
  if (deviceId) {
    return deviceId
  }

  const cached = localStorage.getItem('sync_device_id')
  if (cached) {
    deviceId = cached
    return deviceId
  }

  deviceId = crypto.randomUUID()
  localStorage.setItem('sync_device_id', deviceId)
  return deviceId
}

function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Server'

  const platform = getPlatform()
  const saved = localStorage.getItem('sync_device_name')
  if (saved) {
    return saved
  }

  const name = `${platform} - ${new Date().toLocaleDateString('ko-KR')}`
  localStorage.setItem('sync_device_name', name)
  return name
}

function getPlatform(): string {
  if (typeof navigator === 'undefined') return 'Unknown'
  
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'Mac'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Unknown'
}

export async function exportData(): Promise<SyncData> {
  const adapter = storage.getAdapter()
  const todos = await adapter.getTodos()
  
  // Settings 가져오기 (현재 어댑터에는 getSettings가 단일 키 조회만 지원할 수 있으므로 주의)
  // 여기서는 로컬 어댑터의 특성을 고려하여 모든 설정을 가져오는 로직이 필요할 수 있음
  // 일단은 주요 설정만 가져오거나, 어댑터에 getAllSettings를 추가하는 것이 좋음.
  // 임시로 빈 객체 또는 주요 설정만 포함
  const settings: Record<string, unknown> = {}
  
  // TODO: StorageAdapter에 getAllSettings 메서드 추가 권장
  
  const metadata: SyncMetadata = {
    deviceId: getOrCreateDeviceId(),
    deviceName: getDeviceName(),
    lastSyncAt: new Date().toISOString(),
    version: 1,
  }

  return {
    metadata,
    todos,
    settings,
  }
}

export function downloadSyncFile(data: SyncData, filename?: string): void {
  if (typeof window === 'undefined') return

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `motivation-adhd-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function uploadSyncFile(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        resolve(file)
      } else {
        reject(new Error('No file selected'))
      }
    }
    input.oncancel = () => {
      reject(new Error('File selection cancelled'))
    }
    input.click()
  })
}

export async function importData(file: File, strategy: SyncStrategy = 'merge'): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text) as SyncData

  if (!data.metadata || !Array.isArray(data.todos)) {
    throw new Error('Invalid sync file format')
  }

  if (strategy === 'overwrite') {
    await applySyncData(data)
  } else if (strategy === 'merge') {
    await mergeSyncData(data)
  }
}

async function applySyncData(data: SyncData): Promise<void> {
  const adapter = storage.getAdapter()
  
  // 기존 데이터 삭제 후 대량 삽입 (bulkSaveTodos가 덮어쓰기 모드라면 삭제 불필요할 수도 있음)
  // Dexie의 bulkPut은 키가 같으면 덮어쓰고 없으면 추가함.
  // 완전한 덮어쓰기(기존 것 삭제)를 원한다면 clear가 필요함.
  // 여기서는 안전하게 bulkPut 사용 (기존 데이터 유지 + 덮어쓰기)
  await adapter.bulkSaveTodos(data.todos)

  // 설정 복원
  for (const [key, value] of Object.entries(data.settings)) {
    await adapter.saveSetting(key, value)
  }

  await adapter.saveSetting('lastSyncAt', data.metadata.lastSyncAt)
  await adapter.saveSetting('syncedWith', data.metadata.deviceId)
}

async function mergeSyncData(data: SyncData): Promise<void> {
  const adapter = storage.getAdapter()
  const localTodos = await adapter.getTodos()
  const localTodoIds = new Set(localTodos.map((t) => t.id))

  const todosToSave: TodoData[] = []

  for (const remoteTodo of data.todos) {
    if (!localTodoIds.has(remoteTodo.id)) {
      todosToSave.push(remoteTodo)
    }
  }

  if (todosToSave.length > 0) {
    await adapter.bulkSaveTodos(todosToSave)
  }


  // 메타데이터 업데이트
  await adapter.saveSetting('lastSyncAt', data.metadata.lastSyncAt)
  await adapter.saveSetting('syncedWith', data.metadata.deviceId)
}

// === AWS S3 Integration ===

function createS3Client(config: S3Config) {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

export async function uploadToS3(config: S3Config, data: SyncData): Promise<string> {
  const client = createS3Client(config)
  const key = config.keyPrefix
    ? `${config.keyPrefix}/sync-${new Date().toISOString().split('T')[0]}.json`
    : `sync-${new Date().toISOString().split('T')[0]}.json`

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  })

  await client.send(command)
  return key
}

export async function downloadFromS3(config: S3Config, filename: string): Promise<SyncData> {
  const client = createS3Client(config)
  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: filename,
  })

  const response = await client.send(command)
  if (!response.Body) {
    throw new Error('Empty response body')
  }

  const text = await response.Body.transformToString()
  return JSON.parse(text) as SyncData
}

export async function listS3Files(config: S3Config): Promise<string[]> {
  const client = createS3Client(config)
  const command = new ListObjectsV2Command({
    Bucket: config.bucketName,
    Prefix: config.keyPrefix,
  })

  const response = await client.send(command)
  
  if (!response.Contents) {
    return []
  }

  return response.Contents
    .map(item => item.Key || '')
    .filter(key => key.endsWith('.json'))
    .sort()
    .reverse()
}

export async function saveS3Config(config: S3Config): Promise<void> {
  const adapter = storage.getAdapter()
  await adapter.saveSetting('s3_config', config)
}

export async function getS3Config(): Promise<S3Config | undefined> {
  const adapter = storage.getAdapter()
  const config = await adapter.getSetting<S3Config>('s3_config')
  return config || undefined
}

export async function clearS3Config(): Promise<void> {
  const adapter = storage.getAdapter()
  await adapter.deleteSetting('s3_config')
}

export function getSyncStatus(): {
  lastSyncAt: string | undefined
  syncedWith: string | undefined
} {
  if (typeof window === 'undefined') return { lastSyncAt: undefined, syncedWith: undefined }
  
  // 이것도 DB에서 가져오는 것이 정확함
  return {
    lastSyncAt: localStorage.getItem('lastSyncAt') || undefined,
    syncedWith: localStorage.getItem('syncedWith') || undefined,
  }
}
