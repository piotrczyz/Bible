"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UsePullToRefreshOptions {
  threshold?: number // Distance in pixels to trigger refresh
  maxPull?: number // Maximum pull distance
  onRefresh?: () => void | Promise<void>
  disabled?: boolean
}

interface UsePullToRefreshReturn {
  pullDistance: number
  isPulling: boolean
  isRefreshing: boolean
  pullProgress: number // 0 to 1, representing progress toward threshold
}

export function usePullToRefresh(
  options: UsePullToRefreshOptions = {}
): UsePullToRefreshReturn {
  const {
    threshold = 80,
    maxPull = 120,
    onRefresh,
    disabled = false,
  } = options

  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const touchStartY = useRef(0)
  const touchStartScrollY = useRef(0)
  const isPullingRef = useRef(false)

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || !onRefresh) return

    setIsRefreshing(true)

    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }, [isRefreshing, onRefresh])

  useEffect(() => {
    if (disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      // Only start tracking if at the top of the page
      if (window.scrollY > 0) return

      touchStartY.current = e.touches[0].clientY
      touchStartScrollY.current = window.scrollY
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Don't process if we started the touch while scrolled
      if (touchStartScrollY.current > 0) return

      // Don't process during refresh
      if (isRefreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - touchStartY.current

      // Only activate when pulling down and at the top
      if (diff > 0 && window.scrollY <= 0) {
        // Prevent default scroll behavior when pulling
        if (diff > 10) {
          e.preventDefault()
        }

        isPullingRef.current = true
        setIsPulling(true)

        // Apply resistance to the pull (the further you pull, the harder it gets)
        const resistance = 0.5
        const adjustedDiff = Math.min(diff * resistance, maxPull)
        setPullDistance(adjustedDiff)
      } else if (isPullingRef.current && diff <= 0) {
        // Reset if user scrolls back up
        isPullingRef.current = false
        setIsPulling(false)
        setPullDistance(0)
      }
    }

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return

      isPullingRef.current = false
      setIsPulling(false)

      // Trigger refresh if threshold was reached
      if (pullDistance >= threshold) {
        handleRefresh()
      } else {
        setPullDistance(0)
      }
    }

    // Use passive: false for touchmove to allow preventDefault
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [disabled, isRefreshing, maxPull, pullDistance, threshold, handleRefresh])

  const pullProgress = Math.min(pullDistance / threshold, 1)

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    pullProgress,
  }
}
