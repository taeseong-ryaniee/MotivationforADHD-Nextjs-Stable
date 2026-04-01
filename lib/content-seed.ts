import { getContent, saveContent } from '@/lib/db'
import type { ContentData, ContentRecord } from '@/lib/types'

/**
 * ko.json을 IndexedDB에 시드합니다.
 * - 최초 실행: IndexedDB에 콘텐츠가 없으면 시드
 * - 버전 업데이트: ko.json 버전이 더 높으면 재시드
 * - 멱등성: 이미 최신이면 스킵
 */
export async function seedContent(locale: string = 'ko'): Promise<ContentData> {
  if (typeof window === 'undefined') {
    throw new Error('seedContent는 브라우저 환경에서만 실행 가능합니다')
  }

  const existing = await getContent(locale)

  // static asset에서 콘텐츠 가져오기
  const freshData = await fetchContentFromStatic(locale)

  // 이미 최신이면 스킵
  if (existing && existing.version === freshData.version) {
    return existing.data
  }

  // IndexedDB에 시드
  const record: ContentRecord = {
    locale,
    data: freshData,
    version: freshData.version,
    seededAt: new Date().toISOString(),
  }

  await saveContent(record)

  return freshData
}

async function fetchContentFromStatic(locale: string): Promise<ContentData> {
  try {
    const response = await fetch(`/content/${locale}.json`)
    if (!response.ok) {
      throw new Error(`콘텐츠 로딩 실패: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    // fetch 실패 시 (오프라인 등) 기존 IndexedDB 데이터 반환 시도
    const existing = await getContent(locale)
    if (existing) {
      return existing.data
    }
    throw new Error(
      `콘텐츠를 로딩할 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    )
  }
}
