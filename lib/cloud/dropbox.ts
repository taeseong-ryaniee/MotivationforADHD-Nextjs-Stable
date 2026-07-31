import { CloudProvider, CloudProviderType, CloudFile } from './types'
import { SyncData } from '@/lib/types'

interface DropboxEntry {
  '.tag': string
  id: string
  name: string
  server_modified: string
}

export class DropboxProvider implements CloudProvider {
  name = 'Dropbox'
  type: CloudProviderType = 'dropbox'
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

  async upload(data: SyncData, filename: string = 'motivation-sync.json'): Promise<string> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: `/${filename}`, mode: 'overwrite', mute: true }),
        'Content-Type': 'application/octet-stream',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Dropbox upload failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return result.id
  }

  async list(): Promise<CloudFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '' }),
    })

    if (!response.ok) throw new Error(`Dropbox list failed: ${response.status}`)

    const result = await response.json()
    return (result.entries as DropboxEntry[])
      .filter((e) => e['.tag'] === 'file')
      .map((e) => ({ id: e.id, name: e.name, updatedAt: e.server_modified }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) // newest first
  }

  async download(fileId: string): Promise<SyncData> {
    if (!this.accessToken) throw new Error('Not authenticated')

    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: fileId }),
      },
    })

    if (!response.ok) throw new Error(`Dropbox download failed: ${response.status}`)
    return await response.json()
  }
}
