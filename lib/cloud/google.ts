import { CloudProvider, CloudProviderType, CloudFile } from './types'
import { SyncData } from '@/lib/types'

export class GoogleDriveProvider implements CloudProvider {
  name = 'Google Drive'
  type: CloudProviderType = 'google'
  private accessToken: string | null = null

  constructor(token?: string) {
    this.accessToken = token || null
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  async login(): Promise<void> {
    throw new Error('Login should be handled by UI component')
  }

  async logout(): Promise<void> {
    this.accessToken = null
  }

  setToken(token: string) {
    this.accessToken = token
  }

  async upload(data: SyncData, filename: string = 'backup.json'): Promise<string> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const fileContent = JSON.stringify(data)
    const file = new Blob([fileContent], { type: 'application/json' })
    
    const metadata = {
      name: filename,
      mimeType: 'application/json',
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    })

    if (!response.ok) {
      throw new Error(`Google Drive upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.id
  }

  async list(): Promise<CloudFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType="application/json"&fields=files(id, name, modifiedTime)',
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )

    if (!response.ok) throw new Error('List failed')

    const result = await response.json()
    return result.files.map((f: any) => ({
      id: f.id,
      name: f.name,
      updatedAt: f.modifiedTime
    }))
  }

  async download(fileId: string): Promise<SyncData> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )

    if (!response.ok) throw new Error('Download failed')
    return await response.json()
  }
}
