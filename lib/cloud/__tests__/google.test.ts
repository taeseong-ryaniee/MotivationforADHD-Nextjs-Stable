import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { GoogleDriveProvider } from '../google'
import { SyncData } from '@/lib/types'

// Mock global fetch
global.fetch = vi.fn()

describe('GoogleDriveProvider', () => {
  let provider: GoogleDriveProvider

  beforeEach(() => {
    provider = new GoogleDriveProvider('fake-token')
    vi.clearAllMocks()
  })

  it('should be authenticated when token is provided', () => {
    expect(provider.isAuthenticated()).toBe(true)
  })

  it('should upload file successfully', async () => {
    // Mock success response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'file-123' }),
    })

    const mockData = { metadata: { deviceId: 'test' }, todos: [], settings: {} } as unknown as SyncData
    const fileId = await provider.upload(mockData)

    expect(fileId).toBe('file-123')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('upload/drive/v3/files'),
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer fake-token' }
      })
    )
  })

  it('should list files successfully', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        files: [{ id: '1', name: 'backup.json', modifiedTime: '2024-01-01' }] 
      }),
    })

    const files = await provider.list()
    expect(files).toHaveLength(1)
    expect(files[0].name).toBe('backup.json')
  })
})
