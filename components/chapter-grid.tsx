"use client"

import { type Book } from "@/lib/bible-data"
import { cn } from "@/lib/utils"

interface ChapterGridProps {
  book: Book
  onSelectChapter: (chapter: number) => void
}

export function ChapterGrid({ book, onSelectChapter }: ChapterGridProps) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
      {chapters.map((chapter) => (
        <button
          key={chapter}
          onClick={() => onSelectChapter(chapter)}
          className={cn(
            "flex aspect-square min-h-[44px] min-w-[44px] items-center justify-center rounded-lg",
            "bg-secondary/50 text-secondary-foreground",
            "transition-colors hover:bg-secondary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "text-sm font-medium"
          )}
        >
          {chapter}
        </button>
      ))}
    </div>
  )
}
