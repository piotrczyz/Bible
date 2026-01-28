"use client"

import React from "react"

import { useTheme } from "next-themes"
import { useSettings } from "@/components/settings-provider"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Settings, Sun, Moon, Monitor, Book, Globe, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailableLanguages } from "@/lib/bible-versions"

export function SettingsSheet() {
  const { theme, setTheme } = useTheme()
  const { fontSize, setFontSize, versionId, setVersionId, currentVersion, openaiApiKey, setOpenaiApiKey } = useSettings()
  const { t, language, setLanguage, languages } = useLanguage()
  const bibleLanguages = getAvailableLanguages()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t.settings}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t.settings}</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8 px-4">
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.language}
            </label>
            <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "pl" | "no")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bible Version Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Book className="h-4 w-4" />
              {t.bibleVersion}
            </label>
            <Select value={versionId} onValueChange={setVersionId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.selectVersion} />
              </SelectTrigger>
              <SelectContent>
                {bibleLanguages.map((lang) => (
                  <SelectGroup key={lang.code}>
                    <SelectLabel>{lang.name}</SelectLabel>
                    {lang.versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        <span className="font-medium">{version.abbreviation}</span>
                        <span className="text-muted-foreground ml-2">
                          {version.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {currentVersion && (
              <p className="text-xs text-muted-foreground">
                {currentVersion.description}
              </p>
            )}
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t.openaiApiKey}
            </label>
            <Input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder={t.openaiApiKeyPlaceholder}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t.openaiApiKeyDescription}
            </p>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t.theme}</label>
            <div className="flex gap-2">
              <ThemeButton
                active={theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun className="h-4 w-4" />}
                label={t.light}
              />
              <ThemeButton
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<Moon className="h-4 w-4" />}
                label={t.dark}
              />
              <ThemeButton
                active={theme === "system"}
                onClick={() => setTheme("system")}
                icon={<Monitor className="h-4 w-4" />}
                label={t.system}
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t.fontSize}</label>
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
              <span>{t.small}</span>
              <span>{t.large}</span>
            </div>
          </div>

          {/* Sample Text Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t.preview}</label>
            <div className="rounded-lg border border-border bg-card p-4">
              <p
                className="font-serif leading-relaxed text-card-foreground"
                style={{ fontSize: `${fontSize}px` }}
              >
                <sup className="mr-1 text-xs font-sans text-muted-foreground">1</sup>
                {t.previewText}
              </p>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3 border-t border-border pt-6">
            <h3 className="text-sm font-medium">{t.about}</h3>
            <p className="text-sm text-muted-foreground">
              {t.aboutDescription}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.version} 1.0.0
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
