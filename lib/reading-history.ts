/**
 * Reading history types and utilities
 *
 * Data structure is designed for Firebase Firestore compatibility:
 * - ISO 8601 timestamps convert to Firestore Timestamp
 * - UUIDs prevent conflicts when syncing from multiple devices
 * - Verse-level tracking for detailed reading analytics
 */

export interface ReadingRecord {
  /** Unique identifier (UUID v4) for sync conflict resolution */
  id: string
  /** Book identifier, e.g., "gen", "mat" */
  bookId: string
  /** Chapter number */
  chapter: number
  /** Array of verse numbers that were read (1-indexed) */
  verses: number[]
  /** Bible version used, e.g., "kjv", "asv" */
  versionId: string
  /** ISO 8601 timestamp when the verses were read */
  timestamp: string
}

/**
 * Generate a UUID v4 for reading records
 * Uses crypto.randomUUID when available, falls back to manual generation
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Create a new reading record
 */
export function createReadingRecord(
  bookId: string,
  chapter: number,
  verses: number[],
  versionId: string
): ReadingRecord {
  return {
    id: generateId(),
    bookId,
    chapter,
    verses: [...verses].sort((a, b) => a - b), // Sort verses in order
    versionId,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Group reading records by date for display
 */
export function groupRecordsByDate(
  records: ReadingRecord[]
): Map<string, ReadingRecord[]> {
  const groups = new Map<string, ReadingRecord[]>()

  for (const record of records) {
    const date = record.timestamp.split("T")[0] // Get YYYY-MM-DD
    const existing = groups.get(date) || []
    groups.set(date, [...existing, record])
  }

  return groups
}

/**
 * Format a date string for display
 */
export function formatDateForDisplay(dateStr: string, locale: string = "en"): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateOnly = dateStr.split("T")[0]
  const todayStr = today.toISOString().split("T")[0]
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  if (dateOnly === todayStr) {
    return locale === "pl" ? "Dzisiaj" : locale === "no" ? "I dag" : "Today"
  }
  if (dateOnly === yesterdayStr) {
    return locale === "pl" ? "Wczoraj" : locale === "no" ? "I g\u00e5r" : "Yesterday"
  }

  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format time from ISO timestamp
 */
export function formatTimeForDisplay(timestamp: string, locale: string = "en"): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format verse numbers as ranges (e.g., [1,2,3,5,7,8,9] -> "1-3, 5, 7-9")
 */
export function formatVerseRanges(verses: number[]): string {
  if (verses.length === 0) return ""

  const sorted = [...verses].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
      start = sorted[i]
      end = sorted[i]
    }
  }

  ranges.push(start === end ? `${start}` : `${start}-${end}`)
  return ranges.join(", ")
}
