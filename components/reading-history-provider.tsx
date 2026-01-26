"use client"

import * as React from "react"
import {
  type ReadingRecord,
  createReadingRecord,
} from "@/lib/reading-history"

const STORAGE_KEY = "bible-reading-history"
const MAX_RECORDS = 1000 // Limit to prevent excessive storage usage

interface ChapterContext {
  bookId: string
  chapter: number
  versionId: string
}

interface ReadingHistoryContextType {
  /** All reading records, sorted by timestamp (newest first) */
  records: ReadingRecord[]
  /** Currently selected verses for the active chapter */
  selectedVerses: Set<number>
  /** Set current chapter context (clears selection) */
  setChapterContext: (bookId: string, chapter: number, versionId: string) => void
  /** Toggle a verse selection */
  toggleVerse: (verse: number) => void
  /** Select all verses */
  selectAllVerses: (totalVerses: number) => void
  /** Clear current selection */
  clearSelection: () => void
  /** Save current selection as a new timeline entry */
  saveToTimeline: () => void
  /** Delete a specific reading record */
  deleteRecord: (recordId: string) => void
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
  const [currentChapter, setCurrentChapter] = React.useState<ChapterContext | null>(null)
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

  // Save records to localStorage
  const saveRecords = React.useCallback((newRecords: ReadingRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))
    } catch (error) {
      console.error("Failed to save reading history:", error)
    }
  }, [])

  // Set chapter context - always starts with empty selection
  const setChapterContext = React.useCallback(
    (bookId: string, chapter: number, versionId: string) => {
      setCurrentChapter({ bookId, chapter, versionId })
      setSelectedVerses(new Set())
    },
    []
  )

  // Toggle verse selection
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

  // Select all verses
  const selectAllVerses = React.useCallback((totalVerses: number) => {
    const allVerses = new Set<number>()
    for (let i = 1; i <= totalVerses; i++) {
      allVerses.add(i)
    }
    setSelectedVerses(allVerses)
  }, [])

  // Clear selection
  const clearSelection = React.useCallback(() => {
    setSelectedVerses(new Set())
  }, [])

  // Save current selection as a new timeline entry
  const saveToTimeline = React.useCallback(() => {
    if (!currentChapter || selectedVerses.size === 0) return

    const { bookId, chapter, versionId } = currentChapter
    const newRecord = createReadingRecord(bookId, chapter, Array.from(selectedVerses), versionId)

    setRecords(prev => {
      let updated = [newRecord, ...prev]

      // Trim if exceeding max records
      if (updated.length > MAX_RECORDS) {
        updated = updated.slice(0, MAX_RECORDS)
      }

      saveRecords(updated)
      return updated
    })

    // Clear selection after saving
    setSelectedVerses(new Set())
  }, [currentChapter, selectedVerses, saveRecords])

  // Delete a specific record
  const deleteRecord = React.useCallback(
    (recordId: string) => {
      setRecords(prev => {
        const updated = prev.filter(r => r.id !== recordId)
        saveRecords(updated)
        return updated
      })
    },
    [saveRecords]
  )

  // Clear all history
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
        setChapterContext,
        toggleVerse,
        selectAllVerses,
        clearSelection,
        saveToTimeline,
        deleteRecord,
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
