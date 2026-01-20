'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // DEVELOPMENT: Unregister all service workers to prevent caching issues
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            console.log('[Service Worker] Unregistering in dev mode:', registration)
            registration.unregister()
          }
        })
        return
      }

      // PRODUCTION: Register service worker
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('[Service Worker] Registered successfully:', registration)

          registration.update()

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Service Worker] Update available')
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          })

          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[Service Worker] New version activated')
            window.location.reload()
          })
        } catch (error) {
          console.error('[Service Worker] Registration failed:', error)
        }
      }

      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
      }
    }
  }, [])

  return null
}
