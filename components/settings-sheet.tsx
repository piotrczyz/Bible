"use client"

import React from "react"

import { useTheme } from "next-themes"
import { useSettings } from "@/components/settings-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Settings, Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsSheet() {
  const { theme, setTheme } = useTheme()
  const { fontSize, setFontSize } = useSettings()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              <ThemeButton
                active={theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun className="h-4 w-4" />}
                label="Light"
              />
              <ThemeButton
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<Moon className="h-4 w-4" />}
                label="Dark"
              />
              <ThemeButton
                active={theme === "system"}
                onClick={() => setTheme("system")}
                icon={<Monitor className="h-4 w-4" />}
                label="System"
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Font Size</label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={14}
              max={24}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Sample Text Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Preview</label>
            <div className="rounded-lg border border-border bg-card p-4">
              <p
                className="font-serif leading-relaxed text-card-foreground"
                style={{ fontSize: `${fontSize}px` }}
              >
                <sup className="mr-1 text-xs font-sans text-muted-foreground">1</sup>
                In the beginning God created the heaven and the earth.
              </p>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3 border-t border-border pt-6">
            <h3 className="text-sm font-medium">About</h3>
            <p className="text-sm text-muted-foreground">
              Scripture is a minimal, open source Bible reading app focused on 
              clean reading experience and easy navigation.
            </p>
            <p className="text-xs text-muted-foreground">
              Version 1.0.0
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-3 transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
