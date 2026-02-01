"use client"

import * as React from "react"
import {
  DEFAULT_VERSION_ID,
  isValidVersionId,
  type BibleVersion,
  getBibleVersion,
} from "@/lib/bible-versions"

interface SettingsContextType {
  fontSize: number
  setFontSize: (size: number) => void
  versionId: string
  setVersionId: (id: string) => void
  currentVersion: BibleVersion | undefined
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = React.useState(18)
  const [versionId, setVersionId] = React.useState(DEFAULT_VERSION_ID)

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedFontSize = localStorage.getItem("bible-font-size")
    if (savedFontSize) {
      setFontSize(Number(savedFontSize))
    }

    const savedVersionId = localStorage.getItem("bible-version-id")
    if (savedVersionId && isValidVersionId(savedVersionId)) {
      setVersionId(savedVersionId)
    }
  }, [])

  const handleSetFontSize = React.useCallback((size: number) => {
    setFontSize(size)
    localStorage.setItem("bible-font-size", String(size))
  }, [])

  const handleSetVersionId = React.useCallback((id: string) => {
    if (isValidVersionId(id)) {
      setVersionId(id)
      localStorage.setItem("bible-version-id", id)
    }
  }, [])

  const currentVersion = React.useMemo(() => getBibleVersion(versionId), [versionId])

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        setFontSize: handleSetFontSize,
        versionId,
        setVersionId: handleSetVersionId,
        currentVersion,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = React.useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
