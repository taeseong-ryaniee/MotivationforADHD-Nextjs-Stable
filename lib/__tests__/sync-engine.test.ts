import { describe, it, expect, vi, beforeEach } from 'vitest'

const exportData = vi.fn(async () => ({ metadata: {}, todos: [], settings: {} }))
const importSyncData = vi.fn(async () => {})
const isRemoteNewer = vi.fn(async (): Promise<boolean> => false)
vi.mock('../sync', () => ({
  exportData: (...a: Parameters<typeof exportData>) => exportData(...a),
  importSyncData: (...a: Parameters<typeof importSyncData>) => importSyncData(...a),
  isRemoteNewer: (...a: Parameters<typeof isRemoteNewer>) => isRemoteNewer(...a),
}))

const showError = vi.fn()
vi.mock('../toast', () => ({ showError: (...a: unknown[]) => showError(...a) }))

import { setActiveProvider, clearActiveProvider, getActiveProvider } from '../cloud/activeProvider'
import { schedulePush, runPush, pullOnce, SYNC_FILENAME } from '../sync-engine'
import type { CloudProvider } from '../cloud/types'

function makeProvider(over: Partial<CloudProvider> = {}): CloudProvider {
  return {
    name: 'Fake', type: 'dropbox',
    isAuthenticated: () => true,
    login: async () => {}, logout: async () => {},
    upload: vi.fn(async () => 'id:1'),
    download: vi.fn(async () => ({ metadata: {}, todos: [], settings: {} }) as never),
    list: vi.fn(async () => [{ id: 'id:1', name: SYNC_FILENAME, updatedAt: 't' }]),
    ...over,
  } as CloudProvider
}

describe('sync-engine', () => {
  beforeEach(() => { clearActiveProvider(); vi.clearAllMocks() })

  it('schedulePush coalesces rapid calls into one upload', async () => {
    const p = makeProvider()
    setActiveProvider(p)

    schedulePush(10); schedulePush(10); schedulePush(10)
    expect(p.upload).not.toHaveBeenCalled()

    await new Promise((r) => setTimeout(r, 40))
    expect(p.upload).toHaveBeenCalledTimes(1)
    expect((p.upload as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe(SYNC_FILENAME)
  })

  it('runPush is a no-op when no provider is connected', async () => {
    await runPush() // no throw
    expect(exportData).not.toHaveBeenCalled()
  })

  it('clears the provider and toasts on a 401 upload error', async () => {
    const p = makeProvider({ upload: vi.fn(async () => { throw new Error('Dropbox upload failed: 401') }) })
    setActiveProvider(p)

    await runPush()

    const { getActiveProvider } = await import('../cloud/activeProvider')
    expect(getActiveProvider()).toBeNull()
    expect(showError).toHaveBeenCalled()
  })

  it('pullOnce downloads the canonical file and merges it', async () => {
    const p = makeProvider()
    setActiveProvider(p)
    await pullOnce()
    expect(p.download).toHaveBeenCalledWith('id:1')
    expect(importSyncData).toHaveBeenCalledWith(expect.anything(), 'merge')
  })

  it('runPush merges remote data before uploading when remote is newer', async () => {
    isRemoteNewer.mockResolvedValueOnce(true)
    const p = makeProvider()
    setActiveProvider(p)

    await runPush()

    expect(p.download).toHaveBeenCalledWith('id:1')
    expect(importSyncData).toHaveBeenCalledWith(expect.anything(), 'merge')
    expect(p.upload).toHaveBeenCalled()

    const downloadOrder = (p.download as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    const importOrder = importSyncData.mock.invocationCallOrder[0]
    const uploadOrder = (p.upload as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]
    expect(downloadOrder).toBeLessThan(importOrder)
    expect(importOrder).toBeLessThan(uploadOrder)
  })

  it('runPush skips merge and still uploads when remote is not newer', async () => {
    isRemoteNewer.mockResolvedValueOnce(false)
    const p = makeProvider()
    setActiveProvider(p)

    await runPush()

    expect(importSyncData).not.toHaveBeenCalled()
    expect(p.upload).toHaveBeenCalled()
  })

  it('runPush uploads without downloading when no remote file exists', async () => {
    const p = makeProvider({ list: vi.fn(async () => []) })
    setActiveProvider(p)

    await runPush()

    expect(p.download).not.toHaveBeenCalled()
    expect(p.upload).toHaveBeenCalled()
  })

  it('pullOnce clears the provider and toasts on a 401 error', async () => {
    const p = makeProvider({
      list: vi.fn(async () => { throw new Error('401 Unauthorized') }),
    })
    setActiveProvider(p)

    await pullOnce()

    expect(getActiveProvider()).toBeNull()
    expect(showError).toHaveBeenCalled()
  })

  it('runPush toasts on a non-401 upload failure and keeps the provider connected', async () => {
    const p = makeProvider({
      upload: vi.fn(async () => { throw new Error('Network request failed') }),
    })
    setActiveProvider(p)

    await runPush()

    expect(showError).toHaveBeenCalled()
    expect(getActiveProvider()).not.toBeNull()
  })

  it('runPush falls back to the first file when the remote filename does not match', async () => {
    isRemoteNewer.mockResolvedValueOnce(true)
    const p = makeProvider({
      list: vi.fn(async () => [{ id: 'other-id', name: 'backup.json', updatedAt: 't' }]),
    })
    setActiveProvider(p)

    await runPush()

    expect(p.download).toHaveBeenCalledWith('other-id')
    expect(importSyncData).toHaveBeenCalledWith(expect.anything(), 'merge')
    expect(p.upload).toHaveBeenCalled()
  })
})
