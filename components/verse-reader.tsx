"use client"

import { useRef, useEffect } from "react"
import { type Book, bibleBooks, getBook } from "@/lib/bible-data"
import { useSettings } from "@/components/settings-provider"
import { useLanguage } from "@/components/language-provider"
import { useReadingHistory } from "@/components/reading-history-provider"
import { useVerses } from "@/hooks/use-verses"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Home, CheckCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerseReaderProps {
  book: Book
  chapter: number
  onNavigate: (bookId: string, chapter: number) => void
  onHome: () => void
}

export function VerseReader({ book, chapter, onNavigate, onHome }: VerseReaderProps) {
  const { fontSize, versionId, currentVersion } = useSettings()
  const { t } = useLanguage()
  const {
    selectedVerses,
    setChapterContext,
    toggleVerse,
    selectAllVerses,
    clearSelection,
  } = useReadingHistory()
  const { verses, isLoading, error } = useVerses(versionId, book.id, chapter)

  // Set chapter context when entering a chapter (loads existing read verses)
  useEffect(() => {
    setChapterContext(book.id, chapter, versionId)
  }, [book.id, chapter, versionId, setChapterContext])

  // Handle verse click - toggle read status
  const handleVerseClick = (verseNumber: number) => {
    toggleVerse(verseNumber)
  }

  // Handle select all toggle
  const handleSelectAllToggle = () => {
    if (selectedVerses.size === verses.length && verses.length > 0) {
      clearSelection()
    } else {
      selectAllVerses(verses.length)
    }
  }

  // Get translated book name
  const getBookName = (b: Book) => {
    return t.books[b.id as keyof typeof t.books] || b.name
  }

  const getPreviousChapter = () => {
    if (chapter > 1) {
      return { bookId: book.id, chapter: chapter - 1 }
    }
    // Go to previous book's last chapter
    const bookIndex = bibleBooks.findIndex((b) => b.id === book.id)
    if (bookIndex > 0) {
      const prevBook = bibleBooks[bookIndex - 1]
      return { bookId: prevBook.id, chapter: prevBook.chapters }
    }
    return null
  }

  const getNextChapter = () => {
    if (chapter < book.chapters) {
      return { bookId: book.id, chapter: chapter + 1 }
    }
    // Go to next book's first chapter
    const bookIndex = bibleBooks.findIndex((b) => b.id === book.id)
    if (bookIndex < bibleBooks.length - 1) {
      const nextBook = bibleBooks[bookIndex + 1]
      return { bookId: nextBook.id, chapter: 1 }
    }
    return null
  }

  const prev = getPreviousChapter()
  const next = getNextChapter()
  const prevBook = prev ? getBook(prev.bookId) : null
  const nextBook = next ? getBook(next.bookId) : null

  // Swipe gesture handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y
    const swipeThreshold = 50

    // Only navigate if horizontal swipe is dominant (not scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0 && next) {
        // Swipe left = next chapter
        onNavigate(next.bookId, next.chapter)
      } else if (deltaX > 0 && prev) {
        // Swipe right = previous chapter
        onNavigate(prev.bookId, prev.chapter)
      }
    }

    touchStartRef.current = null
  }

  const allSelected = selectedVerses.size === verses.length && verses.length > 0

  return (
    <div
      className="flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <article
        className="prose prose-neutral dark:prose-invert mx-auto max-w-2xl px-4 pb-24 pt-6"
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Version indicator */}
        {currentVersion && (
          <div className="mb-4 text-center">
            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
              {currentVersion.abbreviation}
            </span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t.errorTryAgain}
            </p>
          </div>
        )}

        {/* Verses with eye icon for read status */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {verses.map((verse, index) => {
              const verseNumber = index + 1
              const isSelected = selectedVerses.has(verseNumber)
              return (
                <p
                  key={index}
                  onClick={() => handleVerseClick(verseNumber)}
                  className="font-serif leading-relaxed cursor-pointer rounded-lg px-2 py-1 -mx-2 transition-colors hover:bg-secondary/30 active:bg-secondary/50"
                >
                  <span className="inline-flex items-baseline gap-1 mr-1">
                    <sup className="text-xs font-sans text-muted-foreground select-none">
                      {verseNumber}
                    </sup>
                    {isSelected && (
                      <Check className="inline-block h-3 w-3 text-primary translate-y-[-2px]" />
                    )}
                  </span>
                  {verse}
                </p>
              )
            })}
          </div>
        )}
      </article>

      {/* Chapter Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => prev && onNavigate(prev.bookId, prev.chapter)}
            disabled={!prev}
            className={cn(
              "gap-1 text-muted-foreground hover:text-foreground",
              !prev && "invisible"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {prevBook?.id === book.id
                ? `${t.chapter} ${prev?.chapter}`
                : `${prevBook ? getBookName(prevBook) : ''} ${prev?.chapter}`
              }
            </span>
            <span className="sm:hidden">{t.prev}</span>
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSelectAllToggle}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              title={allSelected ? (t.clearSelection || "Clear selection") : (t.selectAll || "Select all")}
            >
              <CheckCheck className={cn(
                "h-5 w-5",
                allSelected && "text-primary"
              )} />
              <span className="sr-only">{t.selectAll || "Select all"}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onHome}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              <span className="sr-only">{t.home}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => next && onNavigate(next.bookId, next.chapter)}
            disabled={!next}
            className={cn(
              "gap-1 text-muted-foreground hover:text-foreground",
              !next && "invisible"
            )}
          >
            <span className="hidden sm:inline">
              {nextBook?.id === book.id
                ? `${t.chapter} ${next?.chapter}`
                : `${nextBook ? getBookName(nextBook) : ''} ${next?.chapter}`
              }
            </span>
            <span className="sm:hidden">{t.next}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
