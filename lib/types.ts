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

// Therapy Messages (인지치료 기반 메시지)
export type TherapyType = 'cbt' | 'dbt' | 'act'

export interface TherapyCategory {
  label: string
  cbt: string[]
  dbt: string[]
  act: string[]
}

export interface TherapyMessages {
  starting: TherapyCategory    // 시작하기
  working: TherapyCategory     // 업무/공부 진행
  stuck: TherapyCategory       // 막힘/멈춤
  emotion: TherapyCategory     // 감정 다스리기
  mistake: TherapyCategory     // 실수/자책 대응
  social: TherapyCategory      // 대인관계/소통
}

// ContentData 확장 (기존 호환성 유지)
export interface ContentDataV2 extends Omit<ContentData, 'motivationMessages'> {
  version: string
  therapyMessages?: TherapyMessages
  motivationMessages?: string[] // 하위 호환성
}
