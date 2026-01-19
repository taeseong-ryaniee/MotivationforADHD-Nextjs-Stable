// lib/utils/messageSelector.ts
import type { TherapyMessages } from '@/lib/types'

/**
 * 날짜 문자열을 해시값으로 변환
 * 같은 날짜는 항상 같은 해시를 반환
 */
export function hashDate(dateString: string): number {
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * TherapyMessages 구조를 단일 배열로 평탄화
 */
export function flattenTherapyMessages(messages: TherapyMessages): string[] {
  const categories = Object.values(messages)
  const allMessages: string[] = []

  for (const category of categories) {
    allMessages.push(...category.cbt)
    allMessages.push(...category.dbt)
    allMessages.push(...category.act)
  }

  return allMessages
}

/**
 * 오늘 날짜 기반으로 메시지 선택
 * 같은 날은 같은 메시지를 반환
 */
export function getDailyMessage(
  messages: TherapyMessages,
  dateString?: string
): string {
  const today = dateString || new Date().toISOString().split('T')[0]
  const allMessages = flattenTherapyMessages(messages)

  if (allMessages.length === 0) {
    return '오늘도 화이팅이에요!'
  }

  const seed = hashDate(today)
  const index = seed % allMessages.length

  return allMessages[index]
}

/**
 * 오늘의 메시지 가져오기 (편의 함수)
 */
export function getTodayMessage(messages: TherapyMessages): string {
  return getDailyMessage(messages)
}
