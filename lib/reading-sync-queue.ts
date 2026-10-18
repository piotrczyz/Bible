/**
 * Offline pending-write queue for account-backed reading history.
 *
 * Mirrors the app's existing localStorage-based storage pattern (see
 * lib/reading-history.ts) rather than introducing Dexie/IndexedDB. The
 * reading-history provider is the only consumer: it enqueues writes made
 * while offline (or while a direct Firestore write fails) and drains the
 * queue once connectivity is restored.
 */

import type { ReadingRecord } from "@/lib/reading-history"

const QUEUE_STORAGE_KEY = "bible-reading-sync-queue"

export interface PendingOp {
  /** Unique id for this queued operation (not the record id) */
  id: string
  type: "upsert" | "delete" | "clear"
  /** Present for "upsert" */
  record?: ReadingRecord
  /** Present for "delete" */
  recordId?: string
}

function readQueue(): PendingOp[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? (parsed as PendingOp[]) : []
  } catch (error) {
    console.error("Failed to read reading history sync queue:", error)
    return []
  }
}

function writeQueue(queue: PendingOp[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error("Failed to write reading history sync queue:", error)
  }
}

/** Add a pending write operation to the queue. */
export function enqueue(op: PendingOp): void {
  const queue = readQueue()
  queue.push(op)
  writeQueue(queue)
}

/** List all pending write operations, in the order they were queued. */
export function listPending(): PendingOp[] {
  return readQueue()
}

/** Remove queued operations by their own `id` once they have been synced. */
export function removePending(ids: string[]): void {
  if (ids.length === 0) return
  const idSet = new Set(ids)
  const queue = readQueue().filter((op) => !idSet.has(op.id))
  writeQueue(queue)
}
