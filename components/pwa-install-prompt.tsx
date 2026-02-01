'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { X, Share, Plus } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function PWAInstallPrompt() {
  const { t } = useLanguage()
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)

    if (isStandalone) {
      return
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return
      }
    }

    // Detect iOS Safari
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)

    if (isIOSDevice && isSafari) {
      setIsIOS(true)
      // Delay showing prompt to not interrupt initial experience
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    // Listen for beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Delay showing prompt
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Hide prompt if app gets installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIOSInstructions(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  const handleShowIOSInstructions = () => {
    setShowIOSInstructions(true)
  }

  if (!showPrompt) {
    return null
  }

  // iOS Instructions Modal
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t.iosInstallTitle}</h3>
            <Button variant="ghost" size="icon-sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ol className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                1
              </span>
              <div className="flex items-center gap-2">
                <span>{t.iosInstallStep1}</span>
                <Share className="h-4 w-4 text-muted-foreground" />
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                2
              </span>
              <span>{t.iosInstallStep2}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                3
              </span>
              <div className="flex items-center gap-2">
                <span>{t.iosInstallStep3}</span>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            </li>
          </ol>

          <Button className="mt-6 w-full" variant="outline" onClick={handleDismiss}>
            {t.notNow}
          </Button>
        </div>
      </div>
    )
  }

  // Standard Install Banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80 md:rounded-lg md:border">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <h3 className="pr-6 font-semibold">{t.installApp}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t.installDescription}
      </p>

      <div className="mt-4 flex gap-2">
        {isIOS ? (
          <Button className="flex-1" onClick={handleShowIOSInstructions}>
            {t.install}
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleInstall} disabled={!deferredPrompt}>
            {t.install}
          </Button>
        )}
        <Button variant="outline" onClick={handleDismiss}>
          {t.notNow}
        </Button>
      </div>
    </div>
  )
}
