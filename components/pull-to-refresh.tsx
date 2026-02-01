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
      {/* Pull indicator - positioned below iOS safe area */}
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
            "flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg border border-border transition-all duration-200",
            isThresholdReached && !isRefreshing && "scale-110",
            isRefreshing && "scale-100"
          )}
          style={{
            transform: `translateY(${Math.max(8, pullDistance - 32)}px)`,
            opacity: Math.min(1, pullDistance / 40),
          }}
        >
          {isRefreshing ? (
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ArrowDown
              className={cn(
                "h-5 w-5 transition-transform duration-200 text-muted-foreground",
                isThresholdReached && "text-primary"
              )}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
              }}
            />
          )}
        </div>
      </div>

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
