"use client"

import * as React from "react"
import { Search, X, Loader2, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import type { SearchResult } from "@/app/api/search/route"

interface AISearchProps {
  onNavigate: (bookId: string, chapter: number, verse: number) => void
}

export function AISearch({ onNavigate }: AISearchProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { t } = useLanguage()

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClose = () => {
    setIsExpanded(false)
    setQuery("")
    setResults([])
    setError(null)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t.aiSearchError)
        return
      }

      if (data.results.length === 0) {
        setError(t.aiSearchNoResults)
        return
      }

      setResults(data.results)
    } catch {
      setError(t.aiSearchError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    // Navigate to the verse (will show highlight with fade-out animation)
    onNavigate(result.bookId, result.chapter, result.verse)

    // Close the search
    handleClose()
  }

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isExpanded])

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExpand}
        className="h-9 w-9"
        aria-label={t.aiSearch}
      >
        <Search className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header with search input */}
      <div className="sticky top-0 border-b border-border bg-background px-4 py-3 safe-area-inset-top">
        <div className="mx-auto max-w-2xl flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.aiSearchPlaceholder}
                className="pl-10 pr-4 h-11"
                disabled={isLoading}
              />
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-11 w-11 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-2xl px-4 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 70px)' }}>
        {/* Instructions */}
        {!isLoading && results.length === 0 && !error && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.aiSearchInstructions}
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t.searching}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <button
                key={`${result.bookId}-${result.chapter}-${result.verse}-${index}`}
                onClick={() => handleSelectResult(result)}
                className={cn(
                  "w-full rounded-lg border border-border bg-card p-4 text-left transition-colors",
                  "hover:border-foreground/20 hover:bg-accent active:bg-accent"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {t.books[result.bookId as keyof typeof t.books] || result.bookName} {result.chapter}:{result.verse}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={cn(
                        "rounded-full px-2 py-0.5",
                        result.confidence >= 80 ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                        result.confidence >= 50 ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {result.confidence}% match
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
