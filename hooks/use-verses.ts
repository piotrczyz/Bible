"use client"

import { useState, useEffect } from "react"
import { loadVerses } from "@/lib/bible-loader"

interface UseVersesResult {
  verses: string[]
  isLoading: boolean
  error: string | null
}

/**
 * Hook to load Bible verses for a specific book, chapter, and version
 */
export function useVerses(
  versionId: string,
  bookId: string,
  chapter: number
): UseVersesResult {
  const [verses, setVerses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchVerses() {
      setIsLoading(true)
      setError(null)

      try {
        const loadedVerses = await loadVerses(versionId, bookId, chapter)
        if (!cancelled) {
          setVerses(loadedVerses)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load verses")
          setVerses([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchVerses()

    return () => {
      cancelled = true
    }
  }, [versionId, bookId, chapter])

  return { verses, isLoading, error }
}
