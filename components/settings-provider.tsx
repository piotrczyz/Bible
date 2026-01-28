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
  openaiApiKey: string
  setOpenaiApiKey: (key: string) => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = React.useState(18)
  const [versionId, setVersionId] = React.useState(DEFAULT_VERSION_ID)
  const [openaiApiKey, setOpenaiApiKey] = React.useState("")

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

    const savedApiKey = localStorage.getItem("bible-openai-api-key")
    if (savedApiKey) {
      setOpenaiApiKey(savedApiKey)
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

  const handleSetOpenaiApiKey = React.useCallback((key: string) => {
    setOpenaiApiKey(key)
    if (key) {
      localStorage.setItem("bible-openai-api-key", key)
    } else {
      localStorage.removeItem("bible-openai-api-key")
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
        openaiApiKey,
        setOpenaiApiKey: handleSetOpenaiApiKey,
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
