/**
 * Bible Version Configuration
 *
 * This file defines the standard format for Bible versions/translations.
 * To add a new version, simply add a new entry to the `bibleVersions` array
 * following the BibleVersion interface structure.
 *
 * Standard abbreviations follow the SBL Handbook of Style conventions.
 * See: https://guide.unwsp.edu/SBL_guide/abbreviations/bible
 */

export interface BibleVersion {
  /** Unique identifier (lowercase, no spaces) */
  id: string
  /** Standard abbreviation (e.g., KJV, NIV, BG) */
  abbreviation: string
  /** Full name of the translation */
  name: string
  /** ISO 639-1 language code (e.g., "en", "pl") */
  language: string
  /** Human-readable language name */
  languageName: string
  /** Brief description of the translation */
  description: string
  /** Whether this version is in the public domain */
  isPublicDomain: boolean
  /** Year of publication (optional) */
  year?: number
  /** Copyright notice (optional, for non-public domain) */
  copyright?: string
}

/**
 * Available Bible versions
 *
 * To add a new version:
 * 1. Add a new object to this array
 * 2. Ensure the `id` is unique
 * 3. Use standard abbreviations where available
 * 4. Include accurate copyright/public domain information
 */
export const bibleVersions: BibleVersion[] = [
  // English Versions
  {
    id: "kjv",
    abbreviation: "KJV",
    name: "King James Version",
    language: "en",
    languageName: "English",
    description: "The authorized King James Version from 1611, a classic English translation known for its literary beauty.",
    isPublicDomain: true,
    year: 1611,
  },
  {
    id: "asv",
    abbreviation: "ASV",
    name: "American Standard Version",
    language: "en",
    languageName: "English",
    description: "A revision of the KJV completed in 1901, known for its literal accuracy.",
    isPublicDomain: true,
    year: 1901,
  },
  {
    id: "web",
    abbreviation: "WEB",
    name: "World English Bible",
    language: "en",
    languageName: "English",
    description: "A modern English translation in the public domain, based on the ASV.",
    isPublicDomain: true,
    year: 2000,
  },

  // Polish Versions
  {
    id: "bg",
    abbreviation: "BG",
    name: "Biblia Gdańska",
    language: "pl",
    languageName: "Polski",
    description: "Protestanckie tłumaczenie Biblii z 1632 roku, zaktualizowane w 1881. Klasyczny polski przekład.",
    isPublicDomain: true,
    year: 1632,
  },
  {
    id: "ubg",
    abbreviation: "UBG",
    name: "Uwspółcześniona Biblia Gdańska",
    language: "pl",
    languageName: "Polski",
    description: "Uwspółcześniona wersja Biblii Gdańskiej z zachowaniem wierności oryginałowi.",
    isPublicDomain: true,
    year: 2017,
  },
]

/** Default Bible version ID */
export const DEFAULT_VERSION_ID = "kjv"

/**
 * Get a Bible version by its ID
 */
export function getBibleVersion(id: string): BibleVersion | undefined {
  return bibleVersions.find((version) => version.id === id)
}

/**
 * Get all Bible versions for a specific language
 */
export function getBibleVersionsByLanguage(language: string): BibleVersion[] {
  return bibleVersions.filter((version) => version.language === language)
}

/**
 * Get all available languages with their versions
 */
export function getAvailableLanguages(): { code: string; name: string; versions: BibleVersion[] }[] {
  const languageMap = new Map<string, { name: string; versions: BibleVersion[] }>()

  for (const version of bibleVersions) {
    if (!languageMap.has(version.language)) {
      languageMap.set(version.language, {
        name: version.languageName,
        versions: [],
      })
    }
    languageMap.get(version.language)!.versions.push(version)
  }

  return Array.from(languageMap.entries()).map(([code, data]) => ({
    code,
    name: data.name,
    versions: data.versions,
  }))
}

/**
 * Validate if a version ID exists
 */
export function isValidVersionId(id: string): boolean {
  return bibleVersions.some((version) => version.id === id)
}
