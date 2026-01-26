"use client"

import * as React from "react"
import { useReadingHistory } from "@/components/reading-history-provider"
import { useLanguage } from "@/components/language-provider"
import { getBook, type Book } from "@/lib/bible-data"
import { getBibleVersion } from "@/lib/bible-versions"
import {
  groupRecordsByDate,
  formatDateForDisplay,
  formatTimeForDisplay,
  type ReadingRecord,
} from "@/lib/reading-history"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, BookOpen, Trash2 } from "lucide-react"

interface TimelineSheetProps {
  onNavigate?: (bookId: string, chapter: number) => void
}

export function TimelineSheet({ onNavigate }: TimelineSheetProps) {
  const { records, clearHistory, isLoading } = useReadingHistory()
  const { t, language } = useLanguage()
  const [open, setOpen] = React.useState(false)

  const groupedRecords = React.useMemo(() => {
    return groupRecordsByDate(records)
  }, [records])

  const getBookName = (bookId: string): string => {
    const book = getBook(bookId)
    if (!book) return bookId
    return t.books[book.id as keyof typeof t.books] || book.name
  }

  const handleItemClick = (record: ReadingRecord) => {
    if (onNavigate) {
      onNavigate(record.bookId, record.chapter)
      setOpen(false)
    }
  }

  const handleClearHistory = () => {
    if (window.confirm(t.confirmClearHistory || "Are you sure you want to clear all reading history?")) {
      clearHistory()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <History className="h-5 w-5" />
          <span className="sr-only">{t.timeline || "Timeline"}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t.timeline || "Reading Timeline"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-8rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">{t.loading || "Loading..."}</div>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                {t.noReadingHistory || "No reading history yet. Start reading to see your timeline here."}
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-4">
                <div className="px-4 py-4 space-y-6">
                  {Array.from(groupedRecords.entries()).map(([date, dayRecords]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                        {formatDateForDisplay(date, language)}
                      </h3>
                      <div className="space-y-1">
                        {dayRecords.map((record) => (
                          <TimelineItem
                            key={record.id}
                            record={record}
                            bookName={getBookName(record.bookId)}
                            locale={language}
                            onClick={() => handleItemClick(record)}
                            clickable={!!onNavigate}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Clear History Button */}
              <div className="pt-4 border-t border-border mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.clearHistory || "Clear History"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface TimelineItemProps {
  record: ReadingRecord
  bookName: string
  locale: string
  onClick: () => void
  clickable: boolean
}

function TimelineItem({ record, bookName, locale, onClick, clickable }: TimelineItemProps) {
  const version = getBibleVersion(record.versionId)

  const content = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-foreground/30" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {bookName} {record.chapter}
          </p>
          {version && (
            <p className="text-xs text-muted-foreground">
              {version.abbreviation}
            </p>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {formatTimeForDisplay(record.timestamp, locale)}
      </span>
    </div>
  )

  if (clickable) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-lg px-3 py-2 transition-colors hover:bg-secondary/50"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="px-3 py-2">
      {content}
    </div>
  )
}
