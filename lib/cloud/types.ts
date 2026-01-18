import { SyncData } from '@/lib/types'

export type CloudProviderType = 's3' | 'google' | 'onedrive' | 'filesystem'

export interface CloudConfig {
  type: CloudProviderType
  // S3 specific
  s3?: {
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucketName: string
  }
  // OAuth specific (Google, OneDrive)
  oauth?: {
    accessToken: string
    expiresAt?: number
  }
}

export interface CloudFile {
  id: string
  name: string
  updatedAt: string
}

export interface CloudProvider {
  name: string
  type: CloudProviderType
  
  isAuthenticated(): boolean
  login(): Promise<void>
  logout(): Promise<void>
  
  upload(data: SyncData, filename?: string): Promise<string> // Returns file ID or URL
  download(fileId: string): Promise<SyncData>
  list(): Promise<CloudFile[]>
}
