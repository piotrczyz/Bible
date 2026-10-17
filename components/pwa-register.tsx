'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/components/language-provider'

export function PWARegister() {
  const { t } = useLanguage()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  // Tracks whether the first update detected this page lifetime has already
  // been applied. A ref (not state) so handling it never triggers a render.
  const firstUpdateHandledRef = useRef(false)
  // Tracks whether the page has ever gone to the background and come back.
  // The page's JS context (and firstUpdateHandledRef) survives a
  // background/foreground cycle, so "first update this page has ever seen"
  // is not the same as "full launch": once the page has been hidden at
  // least once, any update found afterwards must prompt, never apply
  // silently, even if it is still the first one this lifetime.
  const hasBeenHiddenRef = useRef(false)
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)
  const reloadingRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // A single reload mechanism for both the silent path and the
    // "tap to update" path: once the new worker takes control, reload once.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadingRef.current) {
        return
      }
      reloadingRef.current = true
      window.location.reload()
    })

    const applySilently = (worker: ServiceWorker) => {
      firstUpdateHandledRef.current = true
      worker.postMessage({ type: 'SKIP_WAITING' })
    }

    const promptForUpdate = (worker: ServiceWorker) => {
      waitingWorkerRef.current = worker
      setUpdateAvailable(true)
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        // A worker may already be waiting right after registration (e.g. it
        // finished installing before this page attached its listeners). If
        // the page already has a controller, this is the first update found
        // this session: apply it silently.
        if (registration.waiting && navigator.serviceWorker.controller) {
          applySilently(registration.waiting)
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) {
            return
          }
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (!firstUpdateHandledRef.current && !hasBeenHiddenRef.current) {
                applySilently(newWorker)
              } else {
                promptForUpdate(newWorker)
              }
            }
          })
        })

        // Check for updates periodically (every hour) while the app stays open.
        setInterval(() => {
          registration.update().catch(() => {})
        }, 60 * 60 * 1000)

        // Check immediately whenever the page becomes visible again, e.g.
        // returning from the background - without blocking on the network.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            hasBeenHiddenRef.current = true
          } else if (document.visibilityState === 'visible') {
            registration.update().catch(() => {})
          }
        })
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error)
      }
    }

    registerSW()
  }, [])

  // Handle update prompt - only posts SKIP_WAITING; the controllerchange
  // listener above performs the actual reload.
  const handleUpdate = () => {
    waitingWorkerRef.current?.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!updateAvailable) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg bg-primary p-4 text-primary-foreground shadow-lg md:left-auto md:right-4 md:w-auto">
      <span className="text-sm">{t.updateAvailable}</span>
      <button
        onClick={handleUpdate}
        className="rounded-md bg-primary-foreground px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-foreground/90"
      >
        {t.updateRefresh}
      </button>
    </div>
  )
}
