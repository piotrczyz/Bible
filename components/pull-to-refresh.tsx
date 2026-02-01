"use client"

import * as React from "react"
import { RefreshCw, ArrowDown } from "lucide-react"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh?: () => void | Promise<void>
  disabled?: boolean
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const handleRefresh = React.useCallback(() => {
    if (onRefresh) {
      return onRefresh()
    }
    // Default behavior: reload the page
    window.location.reload()
  }, [onRefresh])

  const { pullDistance, isPulling, isRefreshing, pullProgress } =
    usePullToRefresh({
      threshold: 80,
      maxPull: 120,
      onRefresh: handleRefresh,
      disabled,
    })

  const showIndicator = pullDistance > 0 || isRefreshing
  const isThresholdReached = pullProgress >= 1

  return (
    <div className={cn("relative", className)}>
      {/* Refreshing overlay - highly visible during refresh */}
      {isRefreshing && (
        <div
          className="fixed inset-x-0 flex flex-col items-center justify-center gap-3 z-[200] pt-4"
          style={{
            top: "env(safe-area-inset-top, 0px)",
          }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl">
            <RefreshCw className="h-7 w-7 animate-spin text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground bg-background/90 px-3 py-1 rounded-full shadow-md">
            Refreshing...
          </span>
        </div>
      )}

      {/* Pull indicator - shown while pulling (before refresh) */}
      {!isRefreshing && (
        <div
          className={cn(
            "pointer-events-none fixed left-0 right-0 flex justify-center transition-opacity duration-200",
            showIndicator ? "opacity-100" : "opacity-0"
          )}
          style={{
            top: "env(safe-area-inset-top, 0px)",
            zIndex: 100,
          }}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-lg border border-border transition-all duration-200",
              isThresholdReached && "scale-110 bg-primary"
            )}
            style={{
              transform: `translateY(${Math.max(8, pullDistance - 32)}px)`,
              opacity: Math.min(1, pullDistance / 40),
            }}
          >
            <ArrowDown
              className={cn(
                "h-6 w-6 transition-transform duration-200",
                isThresholdReached ? "text-primary-foreground" : "text-muted-foreground"
              )}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Content container */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform:
            isPulling || isRefreshing
              ? `translateY(${pullDistance}px)`
              : "translateY(0)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
