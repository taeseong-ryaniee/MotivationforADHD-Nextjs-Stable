import { describe, it, expect, vi, afterEach } from 'vitest'
import { getRandomItem, buildTodoContent, getSpecialEventAdvice, getTodayTips } from '../content-utils'
import type { PracticalTip } from '../types'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getRandomItem', () => {
  it('고정된 Math.random 에서 예상 인덱스의 원소를 돌려준다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    // floor(0.5 * 3) = 1
    expect(getRandomItem(['a', 'b', 'c'])).toBe('b')
  })
})

describe('buildTodoContent', () => {
  const base = {
    dateString: '2026년 8월 11일 화요일',
    motivation: '오늘도 잘하고 있어요',
    dayMessage: '화요일 메시지',
    antiFogTip: '물 한 잔 마시기',
    tip1: '팁 하나',
    tip2: '팁 둘',
    createdAt: '오전 9:00:00',
  }

  it('title 에 dateString 이 들어가고 content 에 필수 필드가 전부 들어간다', () => {
    const { title, content } = buildTodoContent({
      ...base,
      specialEventItems: [],
      specialAdvice: '',
    })

    expect(title).toContain(base.dateString)
    expect(content).toContain(base.motivation)
    expect(content).toContain(base.antiFogTip)
    expect(content).toContain(base.tip1)
    expect(content).toContain(base.tip2)
    expect(content).toContain(base.createdAt)
  })

  it('specialEventItems 가 빈 배열이면 특별 일정 블록이 없다', () => {
    const { content } = buildTodoContent({ ...base, specialEventItems: [], specialAdvice: '' })
    expect(content).not.toContain('오늘의 특별 일정')
  })

  it('specialEventItems 가 있으면 항목과 specialAdvice 가 들어간다', () => {
    const { content } = buildTodoContent({
      ...base,
      specialEventItems: ['오후 회의'],
      specialAdvice: '핵심만 준비하세요',
    })
    expect(content).toContain('오늘의 특별 일정')
    expect(content).toContain('오후 회의')
    expect(content).toContain('핵심만 준비하세요')
  })
})

describe('getSpecialEventAdvice', () => {
  it('빈 문자열이면 빈 문자열을 돌려준다', () => {
    expect(getSpecialEventAdvice('')).toBe('')
  })

  it('회의·발표·면접·평가·마감·교육 6분기와 기본 분기가 서로 다른 문자열을 돌려준다', () => {
    const results = [
      getSpecialEventAdvice('회의'),
      getSpecialEventAdvice('발표'),
      getSpecialEventAdvice('면접'),
      getSpecialEventAdvice('평가'),
      getSpecialEventAdvice('마감'),
      getSpecialEventAdvice('교육'),
      getSpecialEventAdvice('기타 일정'),
    ]
    expect(new Set(results).size).toBe(results.length)
    results.forEach((r) => expect(r.length).toBeGreaterThan(0))
  })
})

describe('getTodayTips', () => {
  const practicalTips: PracticalTip[] = [
    { category: '집중', tips: ['타이머 쓰기'] },
    { category: '정리', tips: ['책상 치우기'] },
  ]

  it('tip1 과 tip2 가 서로 다른 카테고리에서 나온다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = getTodayTips(practicalTips)
    expect(result.categories[0]).not.toBe(result.categories[1])
    expect(result.tip1).toBe('타이머 쓰기')
    expect(result.tip2).toBe('책상 치우기')
  })
})
