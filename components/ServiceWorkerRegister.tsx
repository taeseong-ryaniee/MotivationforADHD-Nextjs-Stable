'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // DEVELOPMENT: Unregister all service workers AND clear caches to prevent
      // stale content. unregister만으로는 Cache Storage가 남아 옛 화면이 계속 보임.
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            console.log('[Service Worker] Unregistering in dev mode:', registration)
            registration.unregister()
          }
        })
        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              console.log('[Service Worker] Clearing cache in dev mode:', key)
              caches.delete(key)
            }
          })
        }
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
