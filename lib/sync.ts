import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getAllTodos, bulkSaveTodos, getSetting, setSetting, deleteSetting, getDeletedTodoIds } from './db'
import type { TodoData, SyncData, SyncMetadata, S3Config, SyncStrategy } from './types'

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
  const todos = await getAllTodos()

  // ponytail: settings are not exported yet (always empty). lib/db reads settings
  // by key only — add a getAllSettings() to lib/db when settings need to round-trip.
  const settings: Record<string, unknown> = {}

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

export async function importSyncData(data: SyncData, strategy: SyncStrategy = 'merge'): Promise<void> {
  if (!data.metadata || !Array.isArray(data.todos)) {
    throw new Error('Invalid sync file format')
  }

  if (strategy === 'overwrite') {
    await applySyncData(data)
  } else {
    await mergeSyncData(data)
  }
}

export async function importData(file: File, strategy: SyncStrategy = 'merge'): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text) as SyncData
  await importSyncData(data, strategy)
}

async function applySyncData(data: SyncData): Promise<void> {
  
  // 기존 데이터 삭제 후 대량 삽입 (bulkSaveTodos가 덮어쓰기 모드라면 삭제 불필요할 수도 있음)
  // Dexie의 bulkPut은 키가 같으면 덮어쓰고 없으면 추가함.
  // 완전한 덮어쓰기(기존 것 삭제)를 원한다면 clear가 필요함.
  // 여기서는 안전하게 bulkPut 사용 (기존 데이터 유지 + 덮어쓰기)
  await bulkSaveTodos(data.todos)

  // 설정 복원
  for (const [key, value] of Object.entries(data.settings)) {
    await setSetting(key, value)
  }

  await setSetting('lastSyncAt', data.metadata.lastSyncAt)
  await setSetting('syncedWith', data.metadata.deviceId)
}

async function mergeSyncData(data: SyncData): Promise<void> {
  const localTodos = await getAllTodos()
  const localTodoIds = new Set(localTodos.map((t) => t.id))
  const deletedIds = new Set(await getDeletedTodoIds())

  const todosToSave: TodoData[] = []

  for (const remoteTodo of data.todos) {
    // 로컬에 없다고 곧바로 추가하지 않는다 — 여기서 지운 것일 수 있다.
    if (!localTodoIds.has(remoteTodo.id) && !deletedIds.has(remoteTodo.id)) {
      todosToSave.push(remoteTodo)
    }
  }

  if (todosToSave.length > 0) {
    await bulkSaveTodos(todosToSave)
  }


  // 메타데이터 업데이트
  await setSetting('lastSyncAt', data.metadata.lastSyncAt)
  await setSetting('syncedWith', data.metadata.deviceId)
}

/**
 * 원격 스냅샷이 "우리가 마지막으로 반영한 것"보다 새로운가.
 *
 * mergeSyncData / applySyncData 가 settings 의 lastSyncAt 에 남긴 값(마지막으로 반영한
 * 원격 시각)과 비교한다. 기록이 없으면(첫 동기화) 새로운 것으로 본다 — 덮어쓰기보다
 * 병합이 안전하다. ISO 8601 문자열은 사전식 비교가 시간순 비교와 같다.
 *
 * IndexedDB 를 읽으므로 sync-engine 이 아니라 여기 있다(루트 CLAUDE.md 의 접근 규칙).
 */
export async function isRemoteNewer(remote: SyncData): Promise<boolean> {
  const absorbed = await getSetting<string>('lastSyncAt')
  if (!absorbed) return true
  return remote.metadata.lastSyncAt > absorbed
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
  await setSetting('s3_config', config)
}

export async function getS3Config(): Promise<S3Config | undefined> {
  const config = await getSetting<S3Config>('s3_config')
  return config || undefined
}

export async function clearS3Config(): Promise<void> {
  await deleteSetting('s3_config')
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
