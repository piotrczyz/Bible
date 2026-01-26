"use client"

import * as React from "react"
import {
  type ReadingRecord,
  createReadingRecord,
} from "@/lib/reading-history"

const STORAGE_KEY = "bible-reading-history"
const MAX_RECORDS = 1000 // Limit to prevent excessive storage usage

interface ReadingHistoryContextType {
  /** All reading records, sorted by timestamp (newest first) */
  records: ReadingRecord[]
  /** Currently selected verses for the active chapter */
  selectedVerses: Set<number>
  /** Set current chapter context - creates a new timeline record */
  setChapterContext: (bookId: string, chapter: number, versionId: string) => void
  /** Toggle a verse selection (auto-saves to current record) */
  toggleVerse: (verse: number) => void
  /** Select all verses (auto-saves to current record) */
  selectAllVerses: (totalVerses: number) => void
  /** Clear current selection (auto-saves to current record) */
  clearSelection: () => void
  /** Reset selection UI without saving (for fresh starts) */
  resetSelection: () => void
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
  const [currentRecordId, setCurrentRecordId] = React.useState<string | null>(null)
  const [currentContext, setCurrentContext] = React.useState<{
    bookId: string
    chapter: number
    versionId: string
  } | null>(null)
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

  // Update current record's verses
  const updateCurrentRecord = React.useCallback((newVerses: Set<number>) => {
    if (!currentRecordId) return

    setRecords(prev => {
      const updated = prev.map(record => {
        if (record.id === currentRecordId) {
          return { ...record, verses: Array.from(newVerses).sort((a, b) => a - b) }
        }
        return record
      })
      saveRecords(updated)
      return updated
    })
  }, [currentRecordId, saveRecords])

  // Set chapter context - stores context for later record creation
  const setChapterContext = React.useCallback(
    (bookId: string, chapter: number, versionId: string) => {
      // Store context but don't create record until verses are selected
      setCurrentContext({ bookId, chapter, versionId })
      setCurrentRecordId(null)
      setSelectedVerses(new Set())
    },
    []
  )

  // Create a new record for the current context
  const createRecord = React.useCallback((verses: Set<number>) => {
    if (!currentContext || verses.size === 0) return null

    const newRecord = createReadingRecord(
      currentContext.bookId,
      currentContext.chapter,
      Array.from(verses),
      currentContext.versionId
    )

    setRecords(prev => {
      let updated = [newRecord, ...prev]
      if (updated.length > MAX_RECORDS) {
        updated = updated.slice(0, MAX_RECORDS)
      }
      saveRecords(updated)
      return updated
    })

    setCurrentRecordId(newRecord.id)
    return newRecord.id
  }, [currentContext, saveRecords])

  // Toggle verse selection (auto-saves)
  const toggleVerse = React.useCallback((verse: number) => {
    setSelectedVerses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(verse)) {
        newSet.delete(verse)
      } else {
        newSet.add(verse)
      }

      // Create record on first verse selection, update on subsequent
      if (newSet.size > 0) {
        if (currentRecordId) {
          updateCurrentRecord(newSet)
        } else {
          createRecord(newSet)
        }
      } else if (currentRecordId) {
        // All verses deselected - remove the record
        setRecords(prevRecords => {
          const updated = prevRecords.filter(r => r.id !== currentRecordId)
          saveRecords(updated)
          return updated
        })
        setCurrentRecordId(null)
      }

      return newSet
    })
  }, [currentRecordId, updateCurrentRecord, createRecord, saveRecords])

  // Select all verses (auto-saves)
  const selectAllVerses = React.useCallback((totalVerses: number) => {
    const allVerses = new Set<number>()
    for (let i = 1; i <= totalVerses; i++) {
      allVerses.add(i)
    }
    setSelectedVerses(allVerses)

    if (currentRecordId) {
      updateCurrentRecord(allVerses)
    } else {
      createRecord(allVerses)
    }
  }, [currentRecordId, updateCurrentRecord, createRecord])

  // Clear selection (removes record if exists)
  const clearSelection = React.useCallback(() => {
    setSelectedVerses(new Set())

    if (currentRecordId) {
      // Remove the record since no verses are selected
      setRecords(prev => {
        const updated = prev.filter(r => r.id !== currentRecordId)
        saveRecords(updated)
        return updated
      })
      setCurrentRecordId(null)
    }
  }, [currentRecordId, saveRecords])

  // Reset selection UI without saving (for fresh starts on mount)
  const resetSelection = React.useCallback(() => {
    setSelectedVerses(new Set())
  }, [])

  // Delete a specific record
  const deleteRecord = React.useCallback(
    (recordId: string) => {
      setRecords(prev => {
        const updated = prev.filter(r => r.id !== recordId)
        saveRecords(updated)
        return updated
      })
      // If deleting current record, clear selection
      if (recordId === currentRecordId) {
        setCurrentRecordId(null)
        setSelectedVerses(new Set())
      }
    },
    [saveRecords, currentRecordId]
  )

  // Clear all history
  const clearHistory = React.useCallback(() => {
    setRecords([])
    setSelectedVerses(new Set())
    setCurrentRecordId(null)
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
        resetSelection,
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
