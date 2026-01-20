import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { OneDriveProvider } from '../onedrive'
import { SyncData } from '@/lib/types'

global.fetch = vi.fn()

describe('OneDriveProvider', () => {
  let provider: OneDriveProvider

  beforeEach(() => {
    provider = new OneDriveProvider('fake-token')
    vi.clearAllMocks()
  })

  it('should upload file successfully', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'file-456' }),
    })

    const mockData = { metadata: { deviceId: 'test' }, todos: [], settings: {} } as unknown as SyncData
    const fileId = await provider.upload(mockData)

    expect(fileId).toBe('file-456')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('graph.microsoft.com'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' })
      })
    )
  })
})
