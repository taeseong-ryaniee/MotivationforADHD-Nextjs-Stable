import { useQuery } from '@tanstack/react-query'
import type { ContentData } from '@/lib/types'

// Query key factory
export const contentKeys = {
  all: ['content'] as const,
  locale: (locale: string) => [...contentKeys.all, locale] as const,
}

// Fetch content from API
async function fetchContent(locale: string): Promise<ContentData> {
  const response = await fetch(`/api/content/${locale}`)

  if (!response.ok) {
    throw new Error('Failed to fetch content')
  }

  return response.json()
}

// Hook to fetch motivation content
export function useContent(locale: string = 'ko') {
  return useQuery({
    queryKey: contentKeys.locale(locale),
    queryFn: () => fetchContent(locale),
    staleTime: 1000 * 60 * 60, // 1 hour (content rarely changes)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache time
    retry: 2,
  })
}
