export interface TodoData {
  id: string
  date: string
  title: string
  content: string
  /** 표시 전용 한국어 문자열. 날짜 연산에 쓰지 말 것 — createdAtMs를 쓴다. */
  createdAt: string
  /** 정렬·월별 집계용 기계 타임스탬프(epoch ms). 스키마 v4부터 채워짐. */
  createdAtMs?: number
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
  categories: string[]
}

export interface ContentData {
  version: string
  updatedAt: string
  locale: string
  motivationMessages: string[]
  antiBrainFogTips: string[]
  practicalTips: PracticalTip[]
  daySpecificMessages: Record<string, string>
  cheers: string[]
}

// IndexedDB에 저장되는 콘텐츠 레코드
export interface ContentRecord {
  locale: string
  data: ContentData
  version: string
  seededAt: string
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

