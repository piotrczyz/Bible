"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Language, Translations, getTranslation, LANGUAGES, LanguageInfo } from "@/lib/translations";

const STORAGE_KEY = "bible-language";
const DEFAULT_LANGUAGE: Language = "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "en" || stored === "pl" || stored === "no")) {
      setLanguageState(stored as Language);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
