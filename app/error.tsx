'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * Next.js error page component
 * Automatically catches errors in route segments and displays a fallback UI
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    console.error('Route error:', error)

    // TODO: Send to error tracking service in production
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error)
    // }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="heading-font text-xl font-bold text-primary mb-2">
            페이지 오류
          </h2>

          <p className="text-secondary text-sm mb-6">
            페이지를 불러오는 중 오류가 발생했습니다.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-mono text-red-800 dark:text-red-300 break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3 w-full">
            <Button variant="default" size="lg" className="w-full" onClick={reset}>
              <RefreshCcw className="h-4 w-4" />
              다시 시도
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </div>

          <p className="text-xs text-secondary mt-6">
            문제가 계속되면 브라우저를 새로고침해주세요
          </p>
        </div>
      </Card>
    </div>
  )
}
