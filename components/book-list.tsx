"use client"

import { bibleBooks, type Book } from "@/lib/bible-data"
import { cn } from "@/lib/utils"

interface BookListProps {
  onSelectBook: (book: Book) => void
  filter: "all" | "old" | "new"
}

export function BookList({ onSelectBook, filter }: BookListProps) {
  const filteredBooks = bibleBooks.filter((book) => {
    if (filter === "all") return true
    return book.testament === filter
  })

  const oldTestament = filteredBooks.filter((b) => b.testament === "old")
  const newTestament = filteredBooks.filter((b) => b.testament === "new")

  return (
    <div className="space-y-8">
      {(filter === "all" || filter === "old") && oldTestament.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Old Testament
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {oldTestament.map((book) => (
              <BookButton key={book.id} book={book} onClick={() => onSelectBook(book)} />
            ))}
          </div>
        </section>
      )}
      
      {(filter === "all" || filter === "new") && newTestament.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            New Testament
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {newTestament.map((book) => (
              <BookButton key={book.id} book={book} onClick={() => onSelectBook(book)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BookButton({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-h-[52px] items-center justify-start rounded-lg px-4 py-3 text-left",
        "bg-secondary/50 text-secondary-foreground",
        "transition-colors hover:bg-secondary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <span className="text-sm font-medium">{book.name}</span>
    </button>
  )
}
