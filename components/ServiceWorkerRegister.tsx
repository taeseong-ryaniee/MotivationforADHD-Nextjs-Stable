'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // FORCE UNREGISTER OLD WORKERS FIRST
          // This ensures any broken or zombie workers are killed immediately.
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            // Optional: Only unregister if it's NOT the current one we want?
            // For safety in this "fix" phase, we unregister everything to be clean.
            // But usually we just register over it.
            // However, if the old one is blocking fetch, we want it GONE.
            // We will unregister ONLY if the scope matches or just rely on the new register overwriting.
            // Actually, 'register' should overwrite. But if the old one is serving a broken cache...
            // Let's force update.
            await registration.update()
          }

          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('[Service Worker] Registered successfully:', registration)

          // Force update immediately
          await registration.update()

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Service Worker] Update available - forcing activation')
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          })

          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[Service Worker] New version activated - reloading')
            window.location.reload()
          })
        } catch (error) {
          console.error('[Service Worker] Registration failed:', error)
        }
      }

      // Register immediately to fix the issue ASAP
      registerSW()
    }
  }, [])

  return null
}
