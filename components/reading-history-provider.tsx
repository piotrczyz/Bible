"use client"

import * as React from "react"
import {
  type ReadingRecord,
  createReadingRecord,
} from "@/lib/reading-history"

const STORAGE_KEY = "bible-reading-history"
const MAX_RECORDS = 1000 // Limit to prevent excessive localStorage usage

interface ReadingHistoryContextType {
  /** All reading records, sorted by timestamp (newest first) */
  records: ReadingRecord[]
  /** Currently selected verses for the active chapter */
  selectedVerses: Set<number>
  /** Toggle a verse selection (add if not selected, remove if selected) */
  toggleVerse: (verse: number) => void
  /** Select all verses in the chapter */
  selectAllVerses: (totalVerses: number) => void
  /** Clear current verse selection */
  clearSelection: () => void
  /** Save the current selection as a reading record */
  saveReadingRecord: (bookId: string, chapter: number, versionId: string) => void
  /** Clear all reading history */
  clearHistory: () => void
  /** Check if history is loading */
  isLoading: boolean
}

const ReadingHistoryContext = React.createContext<ReadingHistoryContextType | undefined>(
  undefined
)

export function ReadingHistoryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = React.useState<ReadingRecord[]>([])
  const [selectedVerses, setSelectedVerses] = React.useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = React.useState(true)

  // Load records from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ReadingRecord[]
        // Migrate old records that don't have verses array
        const migrated = parsed.map(record => ({
          ...record,
          verses: record.verses || []
        }))
        // Sort by timestamp descending (newest first)
        const sorted = migrated.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setRecords(sorted)
      }
    } catch (error) {
      console.error("Failed to load reading history:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save records to localStorage whenever they change
  const saveRecords = React.useCallback((newRecords: ReadingRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))
    } catch (error) {
      console.error("Failed to save reading history:", error)
    }
  }, [])

  const toggleVerse = React.useCallback((verse: number) => {
    setSelectedVerses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(verse)) {
        newSet.delete(verse)
      } else {
        newSet.add(verse)
      }
      return newSet
    })
  }, [])

  const selectAllVerses = React.useCallback((totalVerses: number) => {
    const allVerses = new Set<number>()
    for (let i = 1; i <= totalVerses; i++) {
      allVerses.add(i)
    }
    setSelectedVerses(allVerses)
  }, [])

  const clearSelection = React.useCallback(() => {
    setSelectedVerses(new Set())
  }, [])

  const saveReadingRecord = React.useCallback(
    (bookId: string, chapter: number, versionId: string) => {
      if (selectedVerses.size === 0) return

      const record = createReadingRecord(bookId, chapter, Array.from(selectedVerses), versionId)

      setRecords((prev) => {
        // Add new record at the beginning (newest first)
        let updated = [record, ...prev]

        // Trim if exceeding max records
        if (updated.length > MAX_RECORDS) {
          updated = updated.slice(0, MAX_RECORDS)
        }

        saveRecords(updated)
        return updated
      })

      // Clear selection after saving
      setSelectedVerses(new Set())
    },
    [selectedVerses, saveRecords]
  )

  const clearHistory = React.useCallback(() => {
    setRecords([])
    setSelectedVerses(new Set())
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear reading history:", error)
    }
  }, [])

  return (
    <ReadingHistoryContext.Provider
      value={{
        records,
        selectedVerses,
        toggleVerse,
        selectAllVerses,
        clearSelection,
        saveReadingRecord,
        clearHistory,
        isLoading,
      }}
    >
      {children}
    </ReadingHistoryContext.Provider>
  )
}

export function useReadingHistory() {
  const context = React.useContext(ReadingHistoryContext)
  if (context === undefined) {
    throw new Error("useReadingHistory must be used within a ReadingHistoryProvider")
  }
  return context
}
