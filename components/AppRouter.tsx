'use client'

import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/lib/router'

export function AppRouter() {
  useEffect(() => {
    // Next.js HistoryUpdater calls window.history.replaceState inside useInsertionEffect
    // with state.__NA = true (Next.js App Router marker). TanStack History patches
    // replaceState globally and fires synchronous subscriber notifications, which schedules
    // React state updates inside useInsertionEffect — violating React 19 rules.
    // Fix: suppress TanStack's notification for Next.js-internal replaceState calls.
    const tanstackReplace = window.history.replaceState
    window.history.replaceState = function (data: unknown, ...rest: [string, string?]) {
      const isNextjsInternal = typeof data === 'object' && data !== null && '__NA' in data
      if (isNextjsInternal) {
        ;(router.history as unknown as { _ignoreSubscribers: boolean })._ignoreSubscribers = true
      }
      try {
        return tanstackReplace.apply(window.history, [data, ...rest] as Parameters<typeof tanstackReplace>)
      } finally {
        if (isNextjsInternal) {
          ;(router.history as unknown as { _ignoreSubscribers: boolean })._ignoreSubscribers = false
        }
      }
    }
    return () => {
      window.history.replaceState = tanstackReplace
    }
  }, [])

  return <RouterProvider router={router} />
}
