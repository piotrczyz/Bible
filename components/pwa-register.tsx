'use client'

import { useEffect, useState } from 'react'

export function PWARegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        // Service worker registered successfully

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setUpdateAvailable(true)
                // New version available
              }
            })
          }
        })

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error)
      }
    }

    registerSW()
  }, [])

  // Handle update prompt
  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  if (!updateAvailable) {
    return null
  }

  // Simple update banner
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg bg-primary p-4 text-primary-foreground shadow-lg md:left-auto md:right-4 md:w-auto">
      <span className="text-sm">A new version is available</span>
      <button
        onClick={handleUpdate}
        className="rounded-md bg-primary-foreground px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-foreground/90"
      >
        Update
      </button>
    </div>
  )
}
