'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('[Service Worker] Registered successfully:', registration)

          // Check for updates on registration
          registration.update()

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('[Service Worker] Update available')
                // TODO: Show toast notification in Phase 2
                // For now, auto-activate the new worker
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          })

          // Reload page when new service worker takes control
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[Service Worker] New version activated')
            // Reload to get the latest version
            window.location.reload()
          })
        } catch (error) {
          console.error('[Service Worker] Registration failed:', error)
        }
      }

      // Register after page load
      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
      }
    }
  }, [])

  return null
}
