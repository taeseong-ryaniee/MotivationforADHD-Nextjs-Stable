import { describe, it, expect, vi, beforeEach } from 'vitest'

// lib/db는 브라우저(IndexedDB) 의존이므로 모킹한다.
const bulkSaveTodos = vi.fn()
const setSetting = vi.fn()
const getAllTodos = vi.fn(async () => [])
const getDeletedTodoIds = vi.fn(async (): Promise<string[]> => [])
const getSetting = vi.fn(async (): Promise<string | undefined> => undefined)
vi.mock('../db', () => ({
  getAllTodos: (...a: Parameters<typeof getAllTodos>) => getAllTodos(...a),
  bulkSaveTodos: (...a: unknown[]) => bulkSaveTodos(...a),
  setSetting: (...a: unknown[]) => setSetting(...a),
  getSetting: (...a: Parameters<typeof getSetting>) => getSetting(...a),
  getDeletedTodoIds: (...a: Parameters<typeof getDeletedTodoIds>) => getDeletedTodoIds(...a),
  deleteSetting: vi.fn(),
}))

import { importSyncData, isRemoteNewer } from '../sync'
import type { SyncData } from '../types'

const data = {
  metadata: { deviceId: 'd1', deviceName: 'x', lastSyncAt: 't', version: 1 },
  todos: [{ id: '1', date: 'today', title: 't', content: 'c', createdAt: 'now' }],
  settings: {},
} as unknown as SyncData

describe('importSyncData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merges remote todos that are not local', async () => {
    getAllTodos.mockResolvedValueOnce([])
    await importSyncData(data, 'merge')
    expect(bulkSaveTodos).toHaveBeenCalledWith(data.todos)
  })

  it('rejects malformed data', async () => {
    await expect(importSyncData({} as SyncData, 'merge')).rejects.toThrow(/Invalid/)
  })

  it('삭제한 todo 는 pull 로 되살아나지 않는다', async () => {
    getAllTodos.mockResolvedValueOnce([])
    getDeletedTodoIds.mockResolvedValueOnce([data.todos[0].id])
    await importSyncData(data, 'merge')
    expect(bulkSaveTodos).not.toHaveBeenCalled()
  })
})

describe('isRemoteNewer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('흡수된 기록이 없으면 true 를 반환한다', async () => {
    getSetting.mockResolvedValueOnce(undefined)
    const remote = { metadata: { lastSyncAt: '2026-08-11T00:00:00.000Z' } } as unknown as SyncData
    await expect(isRemoteNewer(remote)).resolves.toBe(true)
  })

  it('원격 시각이 흡수값보다 이르면 false 를 반환한다', async () => {
    getSetting.mockResolvedValueOnce('2026-08-11T12:00:00.000Z')
    const remote = { metadata: { lastSyncAt: '2026-08-11T00:00:00.000Z' } } as unknown as SyncData
    await expect(isRemoteNewer(remote)).resolves.toBe(false)
  })
})
