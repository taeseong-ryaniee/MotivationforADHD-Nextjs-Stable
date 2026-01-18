export interface TodoData {
  id: string
  date: string
  title: string
  content: string
  createdAt: string
}

export interface Settings<T = unknown> {
  key: string
  value: T
  id?: string // For compatibility with some storage adapters
}

export interface PracticalTip {
  category: string
  tips: string[]
}

export interface TodayTips {
  tip1: string
  tip2: string
  antiFogTip: string
  categories: string[]
}

export interface ContentData {
  version: string
  updatedAt: string
  locale: string
  motivationMessages: string[]
  antiBrainFogTips: string[]
  practicalTips: PracticalTip[]
  daySpecificMessages: Record<number, string>
}

export interface SyncMetadata {
  deviceId: string
  deviceName: string
  lastSyncAt: string
  version: number
}

export interface SyncData {
  metadata: SyncMetadata
  todos: TodoData[]
  settings: Record<string, unknown>
}

export interface S3Config {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucketName: string
  keyPrefix?: string
}

export type SyncStrategy = 'overwrite' | 'merge' | 'manual'

export interface SyncConflict {
  type: 'todo' | 'setting'
  id: string
  localValue: TodoData | unknown
  remoteValue: TodoData | unknown
  localModifiedAt: string
  remoteModifiedAt: string
}
