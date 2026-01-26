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
  /** Currently read verses for the active chapter */
  readVerses: Set<number>
  /** Set current chapter context and load its read verses */
  setChapterContext: (bookId: string, chapter: number, versionId: string) => void
  /** Toggle a verse as read/unread (auto-saves) */
  toggleVerse: (verse: number) => void
  /** Mark all verses as read (auto-saves) */
  markAllRead: (totalVerses: number) => void
  /** Mark all verses as unread (auto-saves) */
  markAllUnread: () => void
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
  const [readVerses, setReadVerses] = React.useState<Set<number>>(new Set())
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

  // Find existing record for a chapter
  const findChapterRecord = React.useCallback(
    (bookId: string, chapter: number, versionId: string) => {
      return records.find(
        r => r.bookId === bookId && r.chapter === chapter && r.versionId === versionId
      )
    },
    [records]
  )

  // Set chapter context and load read verses
  const setChapterContext = React.useCallback(
    (bookId: string, chapter: number, versionId: string) => {
      setCurrentChapter({ bookId, chapter, versionId })

      // Load existing read verses for this chapter
      const existingRecord = findChapterRecord(bookId, chapter, versionId)
      if (existingRecord) {
        setReadVerses(new Set(existingRecord.verses))
      } else {
        setReadVerses(new Set())
      }
    },
    [findChapterRecord]
  )

  // Update or create record for current chapter
  const updateChapterRecord = React.useCallback(
    (newVerses: Set<number>) => {
      if (!currentChapter) return

      const { bookId, chapter, versionId } = currentChapter
      const versesArray = Array.from(newVerses)

      setRecords(prev => {
        // Find existing record index
        const existingIndex = prev.findIndex(
          r => r.bookId === bookId && r.chapter === chapter && r.versionId === versionId
        )

        let updated: ReadingRecord[]

        if (versesArray.length === 0) {
          // No verses read - remove the record if it exists
          if (existingIndex >= 0) {
            updated = prev.filter((_, i) => i !== existingIndex)
          } else {
            return prev // No changes needed
          }
        } else if (existingIndex >= 0) {
          // Update existing record
          updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            verses: versesArray.sort((a, b) => a - b),
            timestamp: new Date().toISOString(),
          }
          // Move to front (most recent)
          const [record] = updated.splice(existingIndex, 1)
          updated.unshift(record)
        } else {
          // Create new record
          const newRecord = createReadingRecord(bookId, chapter, versesArray, versionId)
          updated = [newRecord, ...prev]

          // Trim if exceeding max records
          if (updated.length > MAX_RECORDS) {
            updated = updated.slice(0, MAX_RECORDS)
          }
        }

        saveRecords(updated)
        return updated
      })
    },
    [currentChapter, saveRecords]
  )

  // Toggle verse read status
  const toggleVerse = React.useCallback(
    (verse: number) => {
      setReadVerses(prev => {
        const newSet = new Set(prev)
        if (newSet.has(verse)) {
          newSet.delete(verse)
        } else {
          newSet.add(verse)
        }
        // Auto-save
        updateChapterRecord(newSet)
        return newSet
      })
    },
    [updateChapterRecord]
  )

  // Mark all verses as read
  const markAllRead = React.useCallback(
    (totalVerses: number) => {
      const allVerses = new Set<number>()
      for (let i = 1; i <= totalVerses; i++) {
        allVerses.add(i)
      }
      setReadVerses(allVerses)
      updateChapterRecord(allVerses)
    },
    [updateChapterRecord]
  )

  // Mark all verses as unread
  const markAllUnread = React.useCallback(() => {
    setReadVerses(new Set())
    updateChapterRecord(new Set())
  }, [updateChapterRecord])

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
    setReadVerses(new Set())
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
        readVerses,
        setChapterContext,
        toggleVerse,
        markAllRead,
        markAllUnread,
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
