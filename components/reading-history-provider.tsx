"use client"

import * as React from "react"
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore"
import {
  type ReadingRecord,
  createReadingRecord,
  fromFirestoreDoc,
  generateId,
  toFirestoreDoc,
} from "@/lib/reading-history"
import {
  enqueue,
  listPending,
  removePending,
  type PendingOp,
} from "@/lib/reading-sync-queue"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"

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

function sortByTimestampDesc(records: ReadingRecord[]): ReadingRecord[] {
  return [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

export function ReadingHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [selectedVerses, setSelectedVerses] = React.useState<Set<number>>(new Set())
  const [currentRecordId, setCurrentRecordId] = React.useState<string | null>(null)
  const [currentContext, setCurrentContext] = React.useState<{
    bookId: string
    chapter: number
    versionId: string
  } | null>(null)

  // Signed-out path: local-only storage, unchanged from before account sync
  // existed. Never read again once signed in (FR-009, FR-011).
  const [localRecords, setLocalRecords] = React.useState<ReadingRecord[]>([])
  const [isLocalLoading, setIsLocalLoading] = React.useState(true)

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
        setLocalRecords(sortByTimestampDesc(migrated))
      }
    } catch (error) {
      console.error("Failed to load reading history:", error)
    } finally {
      setIsLocalLoading(false)
    }
  }, [])

  const saveLocalRecords = React.useCallback((newRecords: ReadingRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))
    } catch (error) {
      console.error("Failed to save reading history:", error)
    }
  }, [])

  // Signed-in path: Firestore-backed, with a localStorage pending queue for
  // writes made while offline (or whose direct write failed).
  const [remoteRecords, setRemoteRecords] = React.useState<ReadingRecord[]>([])
  const [isRemoteLoading, setIsRemoteLoading] = React.useState(true)
  const [pendingOps, setPendingOps] = React.useState<PendingOp[]>([])

  const refreshPendingOps = React.useCallback(() => {
    setPendingOps(uid ? listPending(uid) : [])
  }, [uid])

  const flushPending = React.useCallback(async () => {
    if (!uid) return
    if (typeof navigator !== "undefined" && !navigator.onLine) return

    const pending = listPending(uid)
    if (pending.length === 0) return

    const flushedIds: string[] = []
    for (const op of pending) {
      try {
        if (op.type === "clear") {
          const snapshot = await getDocs(collection(db, "users", uid, "readingHistory"))
          await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)))
        } else if (op.type === "upsert" && op.record) {
          await setDoc(
            doc(db, "users", uid, "readingHistory", op.record.id),
            toFirestoreDoc(op.record)
          )
        } else if (op.type === "delete" && op.recordId) {
          await deleteDoc(doc(db, "users", uid, "readingHistory", op.recordId))
        }
        flushedIds.push(op.id)
      } catch (error) {
        console.error("Failed to sync reading history:", error)
        // Leave this and any remaining items queued for the next trigger.
        break
      }
    }

    if (flushedIds.length > 0) {
      removePending(uid, flushedIds)
      refreshPendingOps()
    }
  }, [uid, refreshPendingOps])

  // Every mutation goes through the pending queue, then an immediate flush
  // attempt. When online the flush resolves right away, so this behaves the
  // same as a direct write; when offline the op simply stays queued until
  // the "online" event (or the next sign-in) drains it. Each of these is
  // only ever invoked while `uid` is set (every call site checks `uid`
  // first), but the guard below keeps the queue correctly scoped even if
  // that changes, and lets TS narrow `uid` from `string | null`.
  const persistUpsert = React.useCallback(
    (record: ReadingRecord) => {
      if (!uid) return
      enqueue(uid, { id: generateId(), type: "upsert", record })
      refreshPendingOps()
      void flushPending()
    },
    [uid, refreshPendingOps, flushPending]
  )

  const persistDelete = React.useCallback(
    (recordId: string) => {
      if (!uid) return
      enqueue(uid, { id: generateId(), type: "delete", recordId })
      refreshPendingOps()
      void flushPending()
    },
    [uid, refreshPendingOps, flushPending]
  )

  const persistClear = React.useCallback(() => {
    if (!uid) return
    enqueue(uid, { id: generateId(), type: "clear" })
    refreshPendingOps()
    void flushPending()
  }, [uid, refreshPendingOps, flushPending])

  // Subscribe to the signed-in user's Firestore history; drop it immediately
  // on sign-out (the `records` memo below falls back to `localRecords` the
  // instant `uid` becomes null, before this effect's cleanup even runs).
  React.useEffect(() => {
    if (!uid) {
      setRemoteRecords([])
      setPendingOps([])
      setIsRemoteLoading(true)
      return
    }

    setIsRemoteLoading(true)
    refreshPendingOps()
    void flushPending()

    const q = query(
      collection(db, "users", uid, "readingHistory"),
      orderBy("timestamp", "desc"),
      limit(MAX_RECORDS)
    )
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        setRemoteRecords(snapshot.docs.map(d => fromFirestoreDoc(d.id, d.data())))
        setIsRemoteLoading(false)
      },
      error => {
        console.error("Reading history subscription failed:", error)
        setIsRemoteLoading(false)
      }
    )
    return () => unsubscribe()
  }, [uid, flushPending, refreshPendingOps])

  // Drain the queue once connectivity returns.
  React.useEffect(() => {
    if (!uid) return
    const handleOnline = () => {
      void flushPending()
    }
    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [uid, flushPending])

  // Merge queued-but-not-yet-flushed ops into the Firestore snapshot for
  // optimistic UI.
  const { pendingUpserts, pendingDeletes, pendingClear } = React.useMemo(() => {
    const upserts = new Map<string, ReadingRecord>()
    const deletes = new Set<string>()
    let clear = false

    for (const op of pendingOps) {
      if (op.type === "clear") {
        clear = true
        upserts.clear()
        deletes.clear()
      } else if (op.type === "upsert" && op.record) {
        upserts.set(op.record.id, op.record)
        deletes.delete(op.record.id)
      } else if (op.type === "delete" && op.recordId) {
        deletes.add(op.recordId)
        upserts.delete(op.recordId)
      }
    }

    return { pendingUpserts: upserts, pendingDeletes: deletes, pendingClear: clear }
  }, [pendingOps])

  const remoteMergedRecords = React.useMemo(() => {
    const base = pendingClear ? [] : remoteRecords.filter(r => !pendingDeletes.has(r.id))
    const merged = new Map<string, ReadingRecord>()
    for (const record of base) merged.set(record.id, record)
    for (const record of pendingUpserts.values()) merged.set(record.id, record)
    return sortByTimestampDesc(Array.from(merged.values()))
  }, [remoteRecords, pendingUpserts, pendingDeletes, pendingClear])

  const records = uid ? remoteMergedRecords : localRecords
  const isLoading = uid ? isRemoteLoading : isLocalLoading

  // Update current record's verses
  const updateCurrentRecord = React.useCallback(
    (newVerses: Set<number>) => {
      if (!currentRecordId) return
      const sortedVerses = Array.from(newVerses).sort((a, b) => a - b)

      if (uid) {
        const existing = records.find(record => record.id === currentRecordId)
        if (!existing) return
        persistUpsert({ ...existing, verses: sortedVerses })
      } else {
        setLocalRecords(prev => {
          const updated = prev.map(record =>
            record.id === currentRecordId ? { ...record, verses: sortedVerses } : record
          )
          saveLocalRecords(updated)
          return updated
        })
      }
    },
    [currentRecordId, uid, records, persistUpsert, saveLocalRecords]
  )

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
  const createRecord = React.useCallback(
    (verses: Set<number>) => {
      if (!currentContext || verses.size === 0) return null

      const newRecord = createReadingRecord(
        currentContext.bookId,
        currentContext.chapter,
        Array.from(verses),
        currentContext.versionId
      )

      if (uid) {
        persistUpsert(newRecord)
      } else {
        setLocalRecords(prev => {
          let updated = [newRecord, ...prev]
          if (updated.length > MAX_RECORDS) {
            updated = updated.slice(0, MAX_RECORDS)
          }
          saveLocalRecords(updated)
          return updated
        })
      }

      setCurrentRecordId(newRecord.id)
      return newRecord.id
    },
    [currentContext, uid, persistUpsert, saveLocalRecords]
  )

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
        if (uid) {
          persistDelete(currentRecordId)
        } else {
          setLocalRecords(prevRecords => {
            const updated = prevRecords.filter(r => r.id !== currentRecordId)
            saveLocalRecords(updated)
            return updated
          })
        }
        setCurrentRecordId(null)
      }

      return newSet
    })
  }, [currentRecordId, updateCurrentRecord, createRecord, uid, persistDelete, saveLocalRecords])

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
      if (uid) {
        persistDelete(currentRecordId)
      } else {
        // Remove the record since no verses are selected
        setLocalRecords(prev => {
          const updated = prev.filter(r => r.id !== currentRecordId)
          saveLocalRecords(updated)
          return updated
        })
      }
      setCurrentRecordId(null)
    }
  }, [currentRecordId, uid, persistDelete, saveLocalRecords])

  // Reset selection UI without saving (for fresh starts on mount)
  const resetSelection = React.useCallback(() => {
    setSelectedVerses(new Set())
  }, [])

  // Delete a specific record
  const deleteRecord = React.useCallback(
    (recordId: string) => {
      if (uid) {
        persistDelete(recordId)
      } else {
        setLocalRecords(prev => {
          const updated = prev.filter(r => r.id !== recordId)
          saveLocalRecords(updated)
          return updated
        })
      }
      // If deleting current record, clear selection
      if (recordId === currentRecordId) {
        setCurrentRecordId(null)
        setSelectedVerses(new Set())
      }
    },
    [uid, persistDelete, saveLocalRecords, currentRecordId]
  )

  // Clear all history
  const clearHistory = React.useCallback(() => {
    setSelectedVerses(new Set())
    setCurrentRecordId(null)

    if (uid) {
      persistClear()
    } else {
      setLocalRecords([])
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error("Failed to clear reading history:", error)
      }
    }
  }, [uid, persistClear])

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
