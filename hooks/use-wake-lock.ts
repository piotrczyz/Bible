"use client"

import { useEffect, useRef } from "react"

// Tiny 0-second silent MP4 video (base64-encoded) used to prevent
// iOS from dimming the screen. Playing a looping video tricks the OS
// into thinking media is active, keeping the display awake.
const SILENT_MP4 =
  "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMAAAAAAPZYiEAD//8m+P5OXfBeLGOfKE3xkODvFZuBflq/AAAAHMYXV0bwAAAA9IYW5kbGVyAAAAAE1ldGEAAAAAAAAgc3R0cwAAAAAAAAACAAAAAgAAAAEAAAABAAAAFAAAABBjdHRzAAAAAAAAAAIAAAABAAAAAQAAAAEAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAIAAAABAAAAFHN0c3oAAAAAAAAAAAAAAAACAAAAFHN0Y28AAAAAAAAAAAEAAAA0AAAAYXVkdHMAAAAAAAAhc3R0cwAAAAAAAAABAAAAAgAAAAEAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAAAAAAAABAAAAFHN0Y28AAAAAAAAAAQAAADQAAAAidWR0YQAAABptZXRhAAAAAAAAACFoZGxyAAAAAE1ldGEAAAEMbXZoZAAAAAAAAAAAAAAAAAAAA+gAAAACAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAABdnRyYWsAAABcdGtoZAAAAA8AAAAAAAAAAAAAAAEAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAABAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAA+G1kaWEAAAAgbWRoZAAAAAAAAAAAAAAAAAAAAAIAAAACVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAjG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAATHN0YmwAAAAoc3RzZAAAAAAAAAABAAAAGGF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAACAAIASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAA5jb2xybmNseAABABAAAAB0dHJhawAAAFx0a2hkAAAADwAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAN1tZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAAACAAAAAlXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAIhtaW5mAAAAEHNtaGQAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAExzdGJsAAAAKHN0c2QAAAAAAAAAAQAAABhtcDRhAAAAAAAAAAEAAAAAAAAAAAACABAAAAAANC5oZGxyAAAAAE1ldGEA"

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
 * - On browsers that support the Wake Lock API (Chrome, Edge): uses it directly.
 * - On iOS Safari / PWA: plays a tiny silent video on loop as a fallback,
 *   which prevents the OS from dimming the screen.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (typeof document === "undefined") return

    const useNativeWakeLock =
      "wakeLock" in navigator && !isIOS()

    // --- Native Wake Lock API (non-iOS) ---
    if (useNativeWakeLock) {
      async function requestWakeLock() {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen")
        } catch {
          // Can fail (e.g., low battery, background tab)
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
    }

    // --- iOS fallback: silent video loop ---
    if (isIOS()) {
      const video = document.createElement("video")
      video.setAttribute("playsinline", "")
      video.setAttribute("muted", "")
      video.setAttribute("loop", "")
      video.muted = true
      video.style.position = "fixed"
      video.style.top = "-1px"
      video.style.left = "-1px"
      video.style.width = "1px"
      video.style.height = "1px"
      video.style.opacity = "0.01"
      video.src = SILENT_MP4
      document.body.appendChild(video)
      videoRef.current = video

      function playVideo() {
        video.play().catch(() => {
          // Autoplay may be blocked until user interaction
        })
      }

      function handleVisibilityChange() {
        if (document.visibilityState === "visible") {
          playVideo()
        } else {
          video.pause()
        }
      }

      // Start on first user interaction if autoplay is blocked
      function handleInteraction() {
        playVideo()
        document.removeEventListener("touchstart", handleInteraction)
        document.removeEventListener("click", handleInteraction)
      }

      playVideo()
      document.addEventListener("visibilitychange", handleVisibilityChange)
      document.addEventListener("touchstart", handleInteraction, { once: true })
      document.addEventListener("click", handleInteraction, { once: true })

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        document.removeEventListener("touchstart", handleInteraction)
        document.removeEventListener("click", handleInteraction)
        video.pause()
        video.remove()
        videoRef.current = null
      }
    }
  }, [])
}
