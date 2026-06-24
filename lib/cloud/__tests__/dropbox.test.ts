import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { DropboxProvider } from '../dropbox'
import { SyncData } from '@/lib/types'

global.fetch = vi.fn()

const mockData = { metadata: { deviceId: 'test' }, todos: [], settings: {} } as unknown as SyncData

describe('DropboxProvider', () => {
  let provider: DropboxProvider

  beforeEach(() => {
    provider = new DropboxProvider('fake-token')
    vi.clearAllMocks()
  })

  it('is authenticated when token is provided', () => {
    expect(provider.isAuthenticated()).toBe(true)
  })

  it('uploads to the Dropbox content endpoint with overwrite mode', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'id:abc', name: 'motivation-sync.json' }),
    })

    const id = await provider.upload(mockData)

    expect(id).toBe('id:abc')
    const [url, init] = (global.fetch as Mock).mock.calls[0]
    expect(url).toBe('https://content.dropboxapi.com/2/files/upload')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer fake-token')
    expect(JSON.parse(init.headers['Dropbox-API-Arg'])).toMatchObject({
      path: '/motivation-sync.json',
      mode: 'overwrite',
    })
  })

  it('lists files newest first', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        entries: [
          { '.tag': 'file', id: 'id:1', name: 'old.json', server_modified: '2024-01-01T00:00:00Z' },
          { '.tag': 'file', id: 'id:2', name: 'motivation-sync.json', server_modified: '2024-06-01T00:00:00Z' },
        ],
      }),
    })

    const files = await provider.list()
    expect(files).toHaveLength(2)
    expect(files[0].name).toBe('motivation-sync.json') // newest first
  })

  it('throws with the status code on a failed upload (for 401 detection)', async () => {
    (global.fetch as Mock).mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized' })
    await expect(provider.upload(mockData)).rejects.toThrow(/401/)
  })
})
