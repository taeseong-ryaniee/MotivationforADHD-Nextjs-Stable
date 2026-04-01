import { useQuery } from '@tanstack/react-query'
import { getContent } from '@/lib/db'
import { seedContent } from '@/lib/content-seed'
import type { ContentData } from '@/lib/types'

// Query key factory
export const contentKeys = {
  all: ['content'] as const,
  locale: (locale: string) => [...contentKeys.all, locale] as const,
}

// IndexedDB에서 콘텐츠를 읽고, 없으면 시드 후 재시도
async function fetchContentFromDB(locale: string): Promise<ContentData> {
  const record = await getContent(locale)
  if (record) {
    return record.data
  }

  // 시드가 아직 안 된 경우 직접 시드 실행
  return await seedContent(locale)
}

// Hook to fetch motivation content from IndexedDB
export function useContent(locale: string = 'ko') {
  return useQuery({
    queryKey: contentKeys.locale(locale),
    queryFn: () => fetchContentFromDB(locale),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  })
}
