"use client"

import { useEffect, useRef, useCallback } from "react"

// Minimal silent MP4 with both video and audio tracks.
// Source: NoSleep.js (MIT license) — https://github.com/richtr/NoSleep.js
// This is a tiny valid MP4 that iOS recognizes as media playback,
// preventing the screen from dimming.
const SILENT_MP4 =
  "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAAhtZGF0AAAA1m1vb3YAAABsbXZoZAAAAAAAAAAAAAAAAAAD6AAAAAAAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAADF1ZHRhAAAAKW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXIAAAAAAAAAAAAAAAA="

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

/**
 * Keeps the screen awake while the app is in the foreground.
 *
 * Strategy:
 * 1. Try the Wake Lock API first (works in Safari tabs iOS 16.4+,
 *    PWA mode iOS 18.4+, Chrome 84+, Edge 84+).
 * 2. If Wake Lock fails or is unavailable (older iOS PWA), fall back
 *    to playing a tiny silent video on loop (the NoSleep.js technique).
 *
 * Both strategies require a user gesture on iOS to activate.
 * The hook listens for the first tap/click and activates then.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const enabledRef = useRef(false)
  const timerId = useRef<ReturnType<typeof setInterval> | null>(null)

  const enableWakeLock = useCallback(async () => {
    if (enabledRef.current) return
    enabledRef.current = true

    // Try Wake Lock API first
    const wakeLockAcquired = await tryWakeLockAPI(wakeLockRef)
    if (wakeLockAcquired) return

    // Fall back to video trick (mainly for iOS PWA on < 18.4)
    enableVideoWakeLock(videoRef, timerId)
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return

    // Try to enable immediately (works if Wake Lock API is available
    // and doesn't require gesture, e.g. Chrome desktop)
    enableWakeLock()

    // Also enable on first user interaction (required for iOS)
    function handleInteraction() {
      enableWakeLock()
      cleanup()
    }

    function cleanup() {
      document.removeEventListener("touchstart", handleInteraction)
      document.removeEventListener("click", handleInteraction)
    }

    document.addEventListener("touchstart", handleInteraction, { once: true })
    document.addEventListener("click", handleInteraction, { once: true })

    // Re-acquire wake lock when app returns to foreground
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && enabledRef.current) {
        reacquire(wakeLockRef, videoRef, timerId)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      cleanup()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      wakeLockRef.current?.release()
      wakeLockRef.current = null
      videoRef.current?.pause()
      videoRef.current?.remove()
      videoRef.current = null
      if (timerId.current) clearInterval(timerId.current)
      enabledRef.current = false
    }
  }, [enableWakeLock])
}

type Ref<T> = { current: T }

/** Try the native Wake Lock API. Returns true if acquired. */
async function tryWakeLockAPI(
  ref: Ref<WakeLockSentinel | null>
): Promise<boolean> {
  if (!("wakeLock" in navigator)) return false
  try {
    ref.current = await navigator.wakeLock.request("screen")
    return true
  } catch {
    return false
  }
}

/** Create and play a silent video to prevent iOS screen dimming. */
function enableVideoWakeLock(
  videoRef: Ref<HTMLVideoElement | null>,
  timerId: Ref<ReturnType<typeof setInterval> | null>
) {
  // Remove any existing video first
  if (videoRef.current) {
    videoRef.current.pause()
    videoRef.current.remove()
  }

  const video = document.createElement("video")
  video.setAttribute("playsinline", "")
  video.setAttribute("loop", "")
  video.muted = true
  video.style.position = "fixed"
  video.style.top = "0"
  video.style.left = "0"
  video.style.width = "1px"
  video.style.height = "1px"
  video.style.opacity = "0.01"
  video.style.pointerEvents = "none"
  video.src = SILENT_MP4
  document.body.appendChild(video)
  videoRef.current = video

  video.play().catch(() => {
    // Will retry on next user interaction via visibilitychange
  })

  // Periodically nudge the video to keep iOS from ignoring it.
  // NoSleep.js uses this technique — resetting currentTime prevents
  // Safari from optimizing away the "idle" video.
  if (timerId.current) clearInterval(timerId.current)
  timerId.current = setInterval(() => {
    if (video && !video.paused && video.readyState >= 2) {
      video.currentTime = Math.random() * 0.001
    }
  }, 500)
}

/** Re-acquire the wake lock after the app returns to foreground. */
async function reacquire(
  wakeLockRef: Ref<WakeLockSentinel | null>,
  videoRef: Ref<HTMLVideoElement | null>,
  timerId: Ref<ReturnType<typeof setInterval> | null>
) {
  // Try native API first
  const acquired = await tryWakeLockAPI(wakeLockRef)
  if (acquired) return

  // Re-enable video fallback — recreate the element for reliability
  if (isIOS()) {
    enableVideoWakeLock(videoRef, timerId)
  }
}
