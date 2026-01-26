"use client"

import { type Book, getVerses, bibleBooks, getBook } from "@/lib/bible-data"
import { useSettings } from "@/components/settings-provider"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerseReaderProps {
  book: Book
  chapter: number
  onNavigate: (bookId: string, chapter: number) => void
}

export function VerseReader({ book, chapter, onNavigate }: VerseReaderProps) {
  const { fontSize, versionId, currentVersion } = useSettings()
  const verses = getVerses(book.id, chapter, versionId)

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

  return (
    <div className="flex flex-col">
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

        <div className="space-y-4">
          {verses.map((verse, index) => (
            <p key={index} className="font-serif leading-relaxed">
              <sup className="mr-1 text-xs font-sans text-muted-foreground select-none">
                {index + 1}
              </sup>
              {verse}
            </p>
          ))}
        </div>
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
                ? `Chapter ${prev?.chapter}`
                : `${prevBook?.abbrev} ${prev?.chapter}`
              }
            </span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
            {book.abbrev} {chapter}
          </span>

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
                ? `Chapter ${next?.chapter}`
                : `${nextBook?.abbrev} ${next?.chapter}`
              }
            </span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
