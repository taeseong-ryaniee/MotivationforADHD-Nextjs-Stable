import { describe, it, expect, vi, beforeEach } from 'vitest'

const exportData = vi.fn(async () => ({ metadata: {}, todos: [], settings: {} }))
const importSyncData = vi.fn(async () => {})
vi.mock('../sync', () => ({
  exportData: (...a: unknown[]) => exportData(...a),
  importSyncData: (...a: unknown[]) => importSyncData(...a),
}))

const showError = vi.fn()
vi.mock('../toast', () => ({ showError: (...a: unknown[]) => showError(...a) }))

import { setActiveProvider, clearActiveProvider } from '../cloud/activeProvider'
import { schedulePush, runPush, pullOnce, PUSH_DEBOUNCE_MS, SYNC_FILENAME } from '../sync-engine'
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
  beforeEach(() => { clearActiveProvider(); vi.clearAllMocks(); vi.useRealTimers() })

  it('schedulePush coalesces rapid calls into one upload', async () => {
    vi.useFakeTimers()
    const p = makeProvider()
    setActiveProvider(p)

    schedulePush(); schedulePush(); schedulePush()
    expect(p.upload).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(PUSH_DEBOUNCE_MS)
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
})
