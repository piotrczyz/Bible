"use client"

import { useEffect, useRef } from "react"

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return
    }

    async function requestWakeLock() {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
      } catch {
        // Wake lock request can fail (e.g., low battery)
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        requestWakeLock()
      }
    }

    requestWakeLock()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [])
}
