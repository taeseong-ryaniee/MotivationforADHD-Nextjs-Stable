import { describe, it, expect } from 'vitest'
import { getTodoTimestamp } from '../todo-utils'

const legacy = {
  date: '2026년 6월 23일 화요일',
  createdAt: '2026. 6. 23. 오후 5:46:35',
}

describe('getTodoTimestamp', () => {
  it('returns createdAtMs verbatim when present and finite', () => {
    const ms = new Date(2026, 5, 23, 17, 46, 35).getTime()
    expect(getTodoTimestamp({ ...legacy, createdAtMs: ms })).toBe(ms)
  })

  it('ignores a non-finite createdAtMs and falls back', () => {
    expect(getTodoTimestamp({ ...legacy, createdAtMs: NaN })).not.toBeNaN()
  })

  it('treats createdAtMs <= 0 as unset and re-derives (poisoned-backfill guard)', () => {
    const d = new Date(getTodoTimestamp({ ...legacy, createdAtMs: 0 }))
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5)
  })

  // Legacy records (saved before schema v4) have no createdAtMs. The fallback
  // must attribute them to the month/year they were actually written, so the
  // history "이번 달 달성" count includes them. (Implemented in getTodoTimestamp.)
  it('attributes a legacy record to its written month and year', () => {
    const d = new Date(getTodoTimestamp(legacy))
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5) // June, 0-indexed
  })
})
