import type { TodoData, SyncData, SyncMetadata, S3Config, SyncStrategy, SyncConflict } from './types'
import { getAllTodos, bulkSaveTodos, getSetting, setSetting, getDB } from './db'

let deviceId: string | null = null

function getOrCreateDeviceId(): string {
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
  const allSettings = await getAllSettings()

  const metadata: SyncMetadata = {
    deviceId: getOrCreateDeviceId(),
    deviceName: getDeviceName(),
    lastSyncAt: new Date().toISOString(),
    version: 1,
  }

  return {
    metadata,
    todos,
    settings: allSettings,
  }
}

async function getAllSettings(): Promise<Record<string, unknown>> {
  const settings: Record<string, unknown> = {}

  try {
    const db = getDB()
    const all = await db.settings.toArray()

    for (const setting of all) {
      settings[setting.key] = setting.value
    }
  } catch (error) {
    console.error('[Sync] Failed to load settings:', error)
  }

  return settings
}

export function downloadSyncFile(data: SyncData, filename?: string): void {
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

  const conflicts = detectConflicts(data)

  if (conflicts.length > 0 && strategy === 'manual') {
    throw new Error(`${conflicts.length} conflicts detected. Please resolve manually.`)
  }

  if (strategy === 'overwrite') {
    await applySyncData(data)
  } else if (strategy === 'merge') {
    await mergeSyncData(data)
  }
}

function detectConflicts(remoteData: SyncData): SyncConflict[] {
  const conflicts: SyncConflict[] = []

  for (const remoteTodo of remoteData.todos) {
    const localModifiedAt = localStorage.getItem(`todo_modified_${remoteTodo.id}`)
    const remoteModifiedAt = remoteData.metadata.lastSyncAt

    if (localModifiedAt && remoteModifiedAt) {
      const localTime = new Date(localModifiedAt).getTime()
      const remoteTime = new Date(remoteModifiedAt).getTime()

      if (Math.abs(localTime - remoteTime) < 1000) {
        conflicts.push({
          type: 'todo',
          id: remoteTodo.id,
          localValue: remoteTodo,
          remoteValue: remoteTodo,
          localModifiedAt: localModifiedAt,
          remoteModifiedAt: remoteModifiedAt,
        })
      }
    }
  }

  return conflicts
}

async function applySyncData(data: SyncData): Promise<void> {
  await bulkSaveTodos(data.todos)

  for (const [key, value] of Object.entries(data.settings)) {
    await setSetting(key, value)
  }

  await setSetting('lastSyncAt', data.metadata.lastSyncAt)
  await setSetting('syncedWith', data.metadata.deviceId)
}

async function mergeSyncData(data: SyncData): Promise<void> {
  const localTodos = await getAllTodos()
  const localTodoIds = new Set(localTodos.map((t) => t.id))

  const todosToSave: TodoData[] = []

  for (const remoteTodo of data.todos) {
    if (!localTodoIds.has(remoteTodo.id)) {
      todosToSave.push(remoteTodo)
    }
  }

  if (todosToSave.length > 0) {
    await bulkSaveTodos(todosToSave)
  }

  const lastSyncAt = await getSetting<string>('lastSyncAt')
  if (!lastSyncAt || new Date(data.metadata.lastSyncAt) > new Date(lastSyncAt)) {
    await setSetting('lastSyncAt', data.metadata.lastSyncAt)
    await setSetting('syncedWith', data.metadata.deviceId)
  }
}

export async function uploadToS3(config: S3Config, data: SyncData): Promise<string> {
  const key = config.keyPrefix
    ? `${config.keyPrefix}/sync-${new Date().toISOString().split('T')[0]}.json`
    : `sync-${new Date().toISOString().split('T')[0]}.json`

  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    mode: 'cors',
  })

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`)
  }

  return url
}

export async function downloadFromS3(config: S3Config, filename: string): Promise<SyncData> {
  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${filename}`

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
  })

  if (!response.ok) {
    throw new Error(`S3 download failed: ${response.statusText}`)
  }

  const text = await response.text()
  return JSON.parse(text) as SyncData
}

export async function listS3Files(config: S3Config): Promise<string[]> {
  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/`

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
  })

  if (!response.ok) {
    throw new Error(`S3 list failed: ${response.statusText}`)
  }

  const text = await response.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')

  const keys = Array.from(xml.querySelectorAll('Key')).map((key) => key.textContent || '')

  return keys.filter((key) => key.startsWith(config.keyPrefix || '') && key.endsWith('.json'))
}

export async function saveS3Config(config: S3Config): Promise<void> {
  await setSetting('s3_config', config)
}

export async function getS3Config(): Promise<S3Config | undefined> {
  return await getSetting<S3Config>('s3_config')
}

export async function clearS3Config(): Promise<void> {
  const db = getDB()
  await db.settings.delete('s3_config')
}

export function getSyncStatus(): {
  lastSyncAt: string | undefined
  syncedWith: string | undefined
} {
  return {
    lastSyncAt: localStorage.getItem('lastSyncAt') || undefined,
    syncedWith: localStorage.getItem('syncedWith') || undefined,
  }
}
