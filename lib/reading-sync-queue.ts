/**
 * Offline pending-write queue for account-backed reading history.
 *
 * Mirrors the app's existing localStorage-based storage pattern (see
 * lib/reading-history.ts) rather than introducing Dexie/IndexedDB. The
 * reading-history provider is the only consumer: it enqueues writes made
 * while offline (or while a direct Firestore write fails) and drains the
 * queue once connectivity is restored.
 *
 * The queue is namespaced per signed-in `uid` (one `localStorage` key per
 * account) so that a different Google account signing in on the same
 * browser never inherits another account's still-pending writes. See
 * reviews/impl-review-inc-2.md F1.
 */

import type { ReadingRecord } from "@/lib/reading-history"

const QUEUE_STORAGE_KEY_PREFIX = "bible-reading-sync-queue"

export interface PendingOp {
  /** Unique id for this queued operation (not the record id) */
  id: string
  type: "upsert" | "delete" | "clear"
  /** Present for "upsert" */
  record?: ReadingRecord
  /** Present for "delete" */
  recordId?: string
}

function storageKeyFor(uid: string): string {
  return `${QUEUE_STORAGE_KEY_PREFIX}:${uid}`
}

function readQueue(uid: string): PendingOp[] {
  try {
    const stored = localStorage.getItem(storageKeyFor(uid))
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? (parsed as PendingOp[]) : []
  } catch (error) {
    console.error("Failed to read reading history sync queue:", error)
    return []
  }
}

function writeQueue(uid: string, queue: PendingOp[]): void {
  try {
    localStorage.setItem(storageKeyFor(uid), JSON.stringify(queue))
  } catch (error) {
    console.error("Failed to write reading history sync queue:", error)
  }
}

/** Add a pending write operation to the given account's queue. */
export function enqueue(uid: string, op: PendingOp): void {
  const queue = readQueue(uid)
  queue.push(op)
  writeQueue(uid, queue)
}

/** List all pending write operations for the given account, in queued order. */
export function listPending(uid: string): PendingOp[] {
  return readQueue(uid)
}

/** Remove queued operations by their own `id` once they have been synced. */
export function removePending(uid: string, ids: string[]): void {
  if (ids.length === 0) return
  const idSet = new Set(ids)
  const queue = readQueue(uid).filter((op) => !idSet.has(op.id))
  writeQueue(uid, queue)
}
