"use client"

import * as React from "react"

interface SettingsContextType {
  fontSize: number
  setFontSize: (size: number) => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = React.useState(18)

  React.useEffect(() => {
    const saved = localStorage.getItem("bible-font-size")
    if (saved) {
      setFontSize(Number(saved))
    }
  }, [])

  const handleSetFontSize = React.useCallback((size: number) => {
    setFontSize(size)
    localStorage.setItem("bible-font-size", String(size))
  }, [])

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize: handleSetFontSize }}>
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
