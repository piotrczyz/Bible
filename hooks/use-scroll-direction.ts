"use client"

import { useState, useEffect, useRef } from "react"

type ScrollDirection = "up" | "down" | null

interface UseScrollDirectionOptions {
  threshold?: number // Minimum scroll distance to trigger direction change
  initialVisible?: boolean // Whether bars should be visible initially
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 10, initialVisible = true } = options
  const [isVisible, setIsVisible] = useState(initialVisible)
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY

      // Always show bars at the top of the page
      if (scrollY < 50) {
        setIsVisible(true)
        setScrollDirection(null)
        lastScrollY.current = scrollY
        ticking.current = false
        return
      }

      const difference = scrollY - lastScrollY.current

      // Only update if scroll distance exceeds threshold
      if (Math.abs(difference) < threshold) {
        ticking.current = false
        return
      }

      if (difference > 0) {
        // Scrolling down
        setScrollDirection("down")
        setIsVisible(false)
      } else {
        // Scrolling up
        setScrollDirection("up")
        setIsVisible(true)
      }

      lastScrollY.current = scrollY
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [threshold])

  return { isVisible, scrollDirection }
}
