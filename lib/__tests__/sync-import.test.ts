import { describe, it, expect, vi } from 'vitest'

// lib/db는 브라우저(IndexedDB) 의존이므로 모킹한다.
const bulkSaveTodos = vi.fn()
const setSetting = vi.fn()
const getAllTodos = vi.fn(async () => [])
vi.mock('../db', () => ({
  getAllTodos: (...a: Parameters<typeof getAllTodos>) => getAllTodos(...a),
  bulkSaveTodos: (...a: unknown[]) => bulkSaveTodos(...a),
  setSetting: (...a: unknown[]) => setSetting(...a),
  getSetting: vi.fn(),
  deleteSetting: vi.fn(),
}))

import { importSyncData } from '../sync'
import type { SyncData } from '../types'

const data = {
  metadata: { deviceId: 'd1', deviceName: 'x', lastSyncAt: 't', version: 1 },
  todos: [{ id: '1', date: 'today', title: 't', content: 'c', createdAt: 'now' }],
  settings: {},
} as unknown as SyncData

describe('importSyncData', () => {
  it('merges remote todos that are not local', async () => {
    getAllTodos.mockResolvedValueOnce([])
    await importSyncData(data, 'merge')
    expect(bulkSaveTodos).toHaveBeenCalledWith(data.todos)
  })

  it('rejects malformed data', async () => {
    await expect(importSyncData({} as SyncData, 'merge')).rejects.toThrow(/Invalid/)
  })
})
