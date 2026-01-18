import { CloudProvider, CloudProviderType, CloudFile } from './types'
import { SyncData } from '@/lib/types'

export class OneDriveProvider implements CloudProvider {
  name = 'OneDrive'
  type: CloudProviderType = 'onedrive'
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

    const url = `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${filename}:/content`
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`OneDrive upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.id
  }

  async list(): Promise<CloudFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/drive/special/approot/children',
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )

    if (!response.ok) throw new Error('List failed')

    const result = await response.json()
    return result.value.map((f: any) => ({
      id: f.id,
      name: f.name,
      updatedAt: f.lastModifiedDateTime
    }))
  }

  async download(fileId: string): Promise<SyncData> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )

    if (!response.ok) throw new Error('Download failed')
    return await response.json()
  }
}
