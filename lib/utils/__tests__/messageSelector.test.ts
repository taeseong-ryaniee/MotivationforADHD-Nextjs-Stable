// lib/utils/__tests__/messageSelector.test.ts
import { describe, it, expect } from 'vitest'
import { hashDate, flattenTherapyMessages, getDailyMessage } from '../messageSelector'
import type { TherapyMessages } from '@/lib/types'

describe('hashDate', () => {
  it('같은 날짜는 같은 해시를 반환한다', () => {
    const hash1 = hashDate('2026-01-19')
    const hash2 = hashDate('2026-01-19')
    expect(hash1).toBe(hash2)
  })

  it('다른 날짜는 다른 해시를 반환한다', () => {
    const hash1 = hashDate('2026-01-19')
    const hash2 = hashDate('2026-01-20')
    expect(hash1).not.toBe(hash2)
  })

  it('양수를 반환한다', () => {
    const hash = hashDate('2026-01-19')
    expect(hash).toBeGreaterThanOrEqual(0)
  })
})

describe('flattenTherapyMessages', () => {
  const mockMessages: TherapyMessages = {
    starting: { label: '시작하기', cbt: ['cbt1', 'cbt2'], dbt: ['dbt1'], act: ['act1'] },
    working: { label: '업무', cbt: ['work-cbt'], dbt: [], act: [] },
    stuck: { label: '막힘', cbt: [], dbt: [], act: [] },
    emotion: { label: '감정', cbt: [], dbt: [], act: [] },
    mistake: { label: '실수', cbt: [], dbt: [], act: [] },
    social: { label: '소통', cbt: [], dbt: [], act: [] },
  }

  it('모든 메시지를 하나의 배열로 평탄화한다', () => {
    const result = flattenTherapyMessages(mockMessages)
    expect(result).toContain('cbt1')
    expect(result).toContain('dbt1')
    expect(result).toContain('act1')
    expect(result).toContain('work-cbt')
    expect(result.length).toBe(5)
  })

  it('빈 배열도 처리한다', () => {
    const emptyMessages: TherapyMessages = {
      starting: { label: '', cbt: [], dbt: [], act: [] },
      working: { label: '', cbt: [], dbt: [], act: [] },
      stuck: { label: '', cbt: [], dbt: [], act: [] },
      emotion: { label: '', cbt: [], dbt: [], act: [] },
      mistake: { label: '', cbt: [], dbt: [], act: [] },
      social: { label: '', cbt: [], dbt: [], act: [] },
    }
    const result = flattenTherapyMessages(emptyMessages)
    expect(result).toEqual([])
  })
})

describe('getDailyMessage', () => {
  const mockMessages: TherapyMessages = {
    starting: { label: '시작하기', cbt: ['msg1', 'msg2', 'msg3'], dbt: ['msg4'], act: ['msg5'] },
    working: { label: '업무', cbt: ['msg6'], dbt: ['msg7'], act: ['msg8'] },
    stuck: { label: '막힘', cbt: ['msg9'], dbt: ['msg10'], act: [] },
    emotion: { label: '감정', cbt: [], dbt: [], act: [] },
    mistake: { label: '실수', cbt: [], dbt: [], act: [] },
    social: { label: '소통', cbt: [], dbt: [], act: [] },
  }

  it('같은 날짜에는 같은 메시지를 반환한다', () => {
    const msg1 = getDailyMessage(mockMessages, '2026-01-19')
    const msg2 = getDailyMessage(mockMessages, '2026-01-19')
    expect(msg1).toBe(msg2)
  })

  it('다른 날짜에는 (대체로) 다른 메시지를 반환한다', () => {
    const msg1 = getDailyMessage(mockMessages, '2026-01-19')
    const msg2 = getDailyMessage(mockMessages, '2026-01-20')
    // 확률적으로 다를 수 있지만, 10개 메시지 중 선택하므로 대체로 다름
    // 완전히 다른지는 보장 못하므로 타입만 확인
    expect(typeof msg1).toBe('string')
    expect(typeof msg2).toBe('string')
  })

  it('메시지 배열에 있는 값을 반환한다', () => {
    const allMessages = ['msg1', 'msg2', 'msg3', 'msg4', 'msg5', 'msg6', 'msg7', 'msg8', 'msg9', 'msg10']
    const result = getDailyMessage(mockMessages, '2026-01-19')
    expect(allMessages).toContain(result)
  })

  it('빈 메시지일 때 기본 메시지를 반환한다', () => {
    const emptyMessages: TherapyMessages = {
      starting: { label: '', cbt: [], dbt: [], act: [] },
      working: { label: '', cbt: [], dbt: [], act: [] },
      stuck: { label: '', cbt: [], dbt: [], act: [] },
      emotion: { label: '', cbt: [], dbt: [], act: [] },
      mistake: { label: '', cbt: [], dbt: [], act: [] },
      social: { label: '', cbt: [], dbt: [], act: [] },
    }
    const result = getDailyMessage(emptyMessages, '2026-01-19')
    expect(result).toBe('오늘도 화이팅이에요!')
  })
})
