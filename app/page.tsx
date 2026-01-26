"use client"

import * as React from "react"
import { type Book, getBook } from "@/lib/bible-data"
import { formatString } from "@/lib/translations"
import { BookList } from "@/components/book-list"
import { ChapterGrid } from "@/components/chapter-grid"
import { VerseReader } from "@/components/verse-reader"
import { SettingsSheet } from "@/components/settings-sheet"
import { TimelineSheet } from "@/components/timeline-sheet"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BookOpen, Home } from "lucide-react"
import { cn } from "@/lib/utils"

type View = "books" | "chapters" | "reader"
type TestamentFilter = "all" | "old" | "new"

export default function BibleApp() {
  const [view, setView] = React.useState<View>("books")
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null)
  const [selectedChapter, setSelectedChapter] = React.useState<number>(1)
  const [filter, setFilter] = React.useState<TestamentFilter>("all")
  const { t } = useLanguage()

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book)
    setView("chapters")
  }

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter)
    setView("reader")
  }

  const handleNavigate = (bookId: string, chapter: number) => {
    const book = getBook(bookId)
    if (book) {
      setSelectedBook(book)
      setSelectedChapter(chapter)
    }
  }

  const handleNavigateFromTimeline = (bookId: string, chapter: number) => {
    const book = getBook(bookId)
    if (book) {
      setSelectedBook(book)
      setSelectedChapter(chapter)
      setView("reader")
    }
  }

  const handleBack = () => {
    if (view === "reader") {
      setView("chapters")
    } else if (view === "chapters") {
      setView("books")
      setSelectedBook(null)
    }
  }

  const handleHome = () => {
    setView("books")
    setSelectedBook(null)
  }

  // Get translated book name
  const getBookName = (book: Book) => {
    return t.books[book.id as keyof typeof t.books] || book.name
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {view !== "books" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">{t.back}</span>
              </Button>
            )}

            {view === "books" && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h1 className="text-lg font-semibold">{t.appTitle}</h1>
              </div>
            )}

            {view === "chapters" && selectedBook && (
              <h1 className="text-lg font-semibold">{getBookName(selectedBook)}</h1>
            )}

            {view === "reader" && selectedBook && (
              <button
                onClick={() => setView("chapters")}
                className="text-lg font-semibold hover:underline underline-offset-4"
              >
                {getBookName(selectedBook)} {selectedChapter}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <TimelineSheet onNavigate={handleNavigateFromTimeline} />
            <SettingsSheet />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl">
        {/* Book Selection View */}
        {view === "books" && (
          <div className="px-4 py-6">
            {/* Testament Filter */}
            <div className="mb-6 flex gap-2">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                {t.all}
              </FilterButton>
              <FilterButton
                active={filter === "old"}
                onClick={() => setFilter("old")}
              >
                {t.oldTestament}
              </FilterButton>
              <FilterButton
                active={filter === "new"}
                onClick={() => setFilter("new")}
              >
                {t.newTestament}
              </FilterButton>
            </div>

            <BookList onSelectBook={handleSelectBook} filter={filter} />
          </div>
        )}

        {/* Chapter Selection View */}
        {view === "chapters" && selectedBook && (
          <>
            <div className="px-4 py-6 pb-24">
              <p className="mb-4 text-sm text-muted-foreground">
                {formatString(t.chaptersCount, { count: selectedBook.chapters })}
              </p>
              <ChapterGrid book={selectedBook} onSelectChapter={handleSelectChapter} />
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
              <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sm:hidden">{t.back}</span>
                  <span className="hidden sm:inline">{t.back}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleHome}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">{t.home}</span>
                </Button>

                <div className="w-[68px]" />
              </div>
            </div>
          </>
        )}

        {/* Reader View */}
        {view === "reader" && selectedBook && (
          <VerseReader
            book={selectedBook}
            chapter={selectedChapter}
            onNavigate={handleNavigate}
            onHome={handleHome}
          />
        )}
      </main>
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
      )}
    >
      {children}
    </button>
  )
}
