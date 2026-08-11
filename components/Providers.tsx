'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { seedContent } from '@/lib/content-seed'
import { runStartupMigration } from '@/lib/migration'
import { showError } from '@/lib/toast'
import { schedulePush, pullOnce } from '@/lib/sync-engine'
import { shouldSyncMutation } from '@/lib/sync-trigger'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnMount: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  // 앱 시작 시 콘텐츠 시드 + (연결돼 있으면) 원격 변경 pull
  useEffect(() => {
    seedContent('ko').catch((err) => {
      console.error('[ContentSeed] 시드 실패:', err)
      showError(
        '오늘의 문구를 아직 못 불러왔어요',
        '연결이 되면 자동으로 다시 불러와요. 적어둔 기록은 이 기기에 그대로 있어요.'
      )
    })
    void runStartupMigration().catch((err) =>
      console.error('[Migration] 시작 마이그레이션 실패:', err)
    )
    void pullOnce()
  }, [])

  // todo 변경 시 디바운스 push (활성 프로바이더 없으면 엔진이 no-op)
  useEffect(() => {
    const unsub = queryClient.getMutationCache().subscribe((event) => {
      if (shouldSyncMutation(event)) schedulePush()
    })
    return unsub
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
