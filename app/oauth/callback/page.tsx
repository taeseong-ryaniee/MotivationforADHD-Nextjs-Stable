'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function OAuthCallbackPage() {
  useEffect(() => {
    // 1. Hash(#) 또는 Query(?)에서 토큰 파싱
    const hash = window.location.hash.substring(1)
    const query = window.location.search.substring(1)
    const params = new URLSearchParams(hash || query)

    const accessToken = params.get('access_token')
    const error = params.get('error')

    // 2. 부모 창(Opener)으로 메시지 전송
    if (window.opener) {
      if (accessToken) {
        window.opener.postMessage(
          { type: 'OAUTH_SUCCESS', token: accessToken },
          window.location.origin
        )
      } else {
        window.opener.postMessage(
          { type: 'OAUTH_ERROR', error: error || 'No token found' },
          window.location.origin
        )
      }
      // 3. 팝업 닫기
      window.close()
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">인증 처리 중...</p>
    </div>
  )
}
