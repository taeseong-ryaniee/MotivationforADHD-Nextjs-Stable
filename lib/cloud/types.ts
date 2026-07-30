import { SyncData } from '@/lib/types'

export type CloudProviderType = 'google' | 'onedrive' | 'dropbox'

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
