/**
 * Bible Data Loader
 *
 * Loads and normalizes Bible data from different JSON formats.
 * Supports three source formats:
 * 1. thiagobodruk format (KJV): [{ abbrev, chapters: [["verse", ...], ...] }]
 * 2. scrollmapper format (ASV, BG, UBG): { translation, books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
 * 3. arron-taylor format (WEB): { "BookName": { "1": { "1": "verse", ... }, ... } }
 */

import { bibleBooks } from "./bible-data"

/** Normalized verse data */
export interface VerseData {
  verse: number
  text: string
}

/** Normalized chapter data */
export interface ChapterData {
  chapter: number
  verses: VerseData[]
}

/** Normalized book data */
export interface BookData {
  id: string
  name: string
  chapters: ChapterData[]
}

/** Complete Bible data */
export interface BibleData {
  versionId: string
  books: BookData[]
}

/** Version ID to file mapping */
const VERSION_FILES: Record<string, string> = {
  kjv: "/bibles/kjv.json",
  asv: "/bibles/asv.json",
  web: "/bibles/web.json",
  bg: "/bibles/bg.json",
  ubg: "/bibles/ubg.json",
}

/** Book name normalization map */
const BOOK_NAME_MAP: Record<string, string> = {
  // Standard names
  genesis: "gen",
  exodus: "exo",
  leviticus: "lev",
  numbers: "num",
  deuteronomy: "deu",
  joshua: "jos",
  judges: "jdg",
  ruth: "rut",
  "1 samuel": "1sa",
  "2 samuel": "2sa",
  "1 kings": "1ki",
  "2 kings": "2ki",
  "1 chronicles": "1ch",
  "2 chronicles": "2ch",
  ezra: "ezr",
  nehemiah: "neh",
  esther: "est",
  job: "job",
  psalms: "psa",
  psalm: "psa",
  proverbs: "pro",
  ecclesiastes: "ecc",
  "song of solomon": "sng",
  "song of songs": "sng",
  isaiah: "isa",
  jeremiah: "jer",
  lamentations: "lam",
  ezekiel: "ezk",
  daniel: "dan",
  hosea: "hos",
  joel: "jol",
  amos: "amo",
  obadiah: "oba",
  jonah: "jon",
  micah: "mic",
  nahum: "nam",
  habakkuk: "hab",
  zephaniah: "zep",
  haggai: "hag",
  zechariah: "zec",
  malachi: "mal",
  matthew: "mat",
  mark: "mrk",
  luke: "luk",
  john: "jhn",
  acts: "act",
  romans: "rom",
  "1 corinthians": "1co",
  "2 corinthians": "2co",
  galatians: "gal",
  ephesians: "eph",
  philippians: "php",
  colossians: "col",
  "1 thessalonians": "1th",
  "2 thessalonians": "2th",
  "1 timothy": "1ti",
  "2 timothy": "2ti",
  titus: "tit",
  philemon: "phm",
  hebrews: "heb",
  james: "jas",
  "1 peter": "1pe",
  "2 peter": "2pe",
  "1 john": "1jn",
  "2 john": "2jn",
  "3 john": "3jn",
  jude: "jud",
  revelation: "rev",
  "revelation of john": "rev",
  // Roman numeral variants (used in scrollmapper format)
  "i samuel": "1sa",
  "ii samuel": "2sa",
  "i kings": "1ki",
  "ii kings": "2ki",
  "i chronicles": "1ch",
  "ii chronicles": "2ch",
  "i corinthians": "1co",
  "ii corinthians": "2co",
  "i thessalonians": "1th",
  "ii thessalonians": "2th",
  "i timothy": "1ti",
  "ii timothy": "2ti",
  "i peter": "1pe",
  "ii peter": "2pe",
  "i john": "1jn",
  "ii john": "2jn",
  "iii john": "3jn",
  // Abbreviations used in thiagobodruk format
  gn: "gen",
  ex: "exo",
  lv: "lev",
  nm: "num",
  dt: "deu",
  js: "jos",
  jg: "jdg",
  rt: "rut",
  "1sm": "1sa",
  "2sm": "2sa",
  "1kgs": "1ki",
  "2kgs": "2ki",
  "1ch": "1ch",
  "2ch": "2ch",
  esr: "ezr",
  ne: "neh",
  et: "est",
  jb: "job",
  ps: "psa",
  prv: "pro",
  ec: "ecc",
  so: "sng",
  is: "isa",
  jr: "jer",
  lm: "lam",
  ez: "ezk",
  dn: "dan",
  ho: "hos",
  jl: "jol",
  am: "amo",
  ob: "oba",
  jn: "jon",
  mc: "mic",
  na: "nam",
  hk: "hab",
  zp: "zep",
  hg: "hag",
  zc: "zec",
  ml: "mal",
  mt: "mat",
  mk: "mrk",
  lk: "luk",
  jo: "jhn",
  at: "act",
  rm: "rom",
  "1co": "1co",
  "2co": "2co",
  gl: "gal",
  ef: "eph",
  ph: "php",
  cl: "col",
  "1ts": "1th",
  "2ts": "2th",
  "1tm": "1ti",
  "2tm": "2ti",
  tt: "tit",
  fm: "phm",
  hb: "heb",
  jm: "jas",
  "1pe": "1pe",
  "2pe": "2pe",
  "1jo": "1jn",
  "2jo": "2jn",
  "3jo": "3jn",
  jd: "jud",
  re: "rev",
  rv: "rev",
}

/** Normalize book name to standard ID */
function normalizeBookName(name: string): string {
  const normalized = name.toLowerCase().trim()
  return BOOK_NAME_MAP[normalized] || normalized
}

/** Cache for loaded Bible data */
const bibleCache = new Map<string, BibleData>()

/** Cache for individual chapter data to avoid reprocessing */
const chapterCache = new Map<string, string[]>()

/**
 * Detect the format of the JSON data
 */
function detectFormat(
  data: unknown
): "thiagobodruk" | "scrollmapper" | "arron-taylor" {
  if (Array.isArray(data) && data[0]?.abbrev !== undefined) {
    return "thiagobodruk"
  }
  if (
    typeof data === "object" &&
    data !== null &&
    "books" in data &&
    Array.isArray((data as { books: unknown }).books)
  ) {
    return "scrollmapper"
  }
  return "arron-taylor"
}

/**
 * Parse thiagobodruk format
 * Structure: [{ abbrev: "gn", chapters: [["verse1", "verse2"], ...] }]
 */
function parseThiagobodruk(
  data: Array<{ abbrev: string; chapters: string[][] }>,
  versionId: string
): BibleData {
  const books: BookData[] = []

  for (const bookData of data) {
    const bookId = normalizeBookName(bookData.abbrev)
    const bookInfo = bibleBooks.find((b) => b.id === bookId)
    if (!bookInfo) continue

    const chapters: ChapterData[] = bookData.chapters.map(
      (verses, chapterIndex) => ({
        chapter: chapterIndex + 1,
        verses: verses.map((text, verseIndex) => ({
          verse: verseIndex + 1,
          text: cleanVerseText(text),
        })),
      })
    )

    books.push({
      id: bookId,
      name: bookInfo.name,
      chapters,
    })
  }

  return { versionId, books }
}

/**
 * Parse scrollmapper format
 * Structure: { translation, books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
 */
function parseScrollmapper(
  data: {
    translation: string
    books: Array<{
      name: string
      chapters: Array<{
        chapter: number
        verses: Array<{ verse: number; text: string }>
      }>
    }>
  },
  versionId: string
): BibleData {
  const books: BookData[] = []

  for (const bookData of data.books) {
    const bookId = normalizeBookName(bookData.name)
    const bookInfo = bibleBooks.find((b) => b.id === bookId)
    if (!bookInfo) continue

    const chapters: ChapterData[] = bookData.chapters.map((chapterData) => ({
      chapter: chapterData.chapter,
      verses: chapterData.verses.map((v) => ({
        verse: v.verse,
        text: cleanVerseText(v.text),
      })),
    }))

    books.push({
      id: bookId,
      name: bookInfo.name,
      chapters,
    })
  }

  return { versionId, books }
}

/**
 * Parse arron-taylor format
 * Structure: { "Genesis": { "1": { "1": "verse", "2": "verse" }, "2": {...} } }
 */
function parseArronTaylor(
  data: Record<string, Record<string, Record<string, string>>>,
  versionId: string
): BibleData {
  const books: BookData[] = []

  for (const [bookName, chaptersData] of Object.entries(data)) {
    const bookId = normalizeBookName(bookName)
    const bookInfo = bibleBooks.find((b) => b.id === bookId)
    if (!bookInfo) continue

    const chapters: ChapterData[] = []
    const chapterNumbers = Object.keys(chaptersData)
      .map(Number)
      .sort((a, b) => a - b)

    for (const chapterNum of chapterNumbers) {
      const versesData = chaptersData[String(chapterNum)]
      const verseNumbers = Object.keys(versesData)
        .map(Number)
        .sort((a, b) => a - b)

      const verses: VerseData[] = verseNumbers.map((verseNum) => ({
        verse: verseNum,
        text: cleanVerseText(versesData[String(verseNum)]),
      }))

      chapters.push({ chapter: chapterNum, verses })
    }

    books.push({
      id: bookId,
      name: bookInfo.name,
      chapters,
    })
  }

  return { versionId, books }
}

/**
 * Clean verse text - remove extra annotations and normalize whitespace
 */
function cleanVerseText(text: string): string {
  return (
    text
      // Remove curly brace annotations like {was}
      .replace(/\{[^}]*\}/g, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
  )
}

/**
 * Load Bible data for a specific version
 */
export async function loadBibleData(versionId: string): Promise<BibleData> {
  // Check cache first
  const cached = bibleCache.get(versionId)
  if (cached) return cached

  const filePath = VERSION_FILES[versionId]
  if (!filePath) {
    throw new Error(`Unknown Bible version: ${versionId}`)
  }

  const response = await fetch(filePath)
  if (!response.ok) {
    throw new Error(`Failed to load Bible data: ${response.statusText}`)
  }

  const rawData = await response.json()
  const format = detectFormat(rawData)

  let bibleData: BibleData

  switch (format) {
    case "thiagobodruk":
      bibleData = parseThiagobodruk(rawData, versionId)
      break
    case "scrollmapper":
      bibleData = parseScrollmapper(rawData, versionId)
      break
    case "arron-taylor":
      bibleData = parseArronTaylor(rawData, versionId)
      break
  }

  // Cache the result
  bibleCache.set(versionId, bibleData)

  return bibleData
}

/**
 * Get verses for a specific book and chapter
 */
export async function loadVerses(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<string[]> {
  // Check chapter cache first
  const cacheKey = `${versionId}:${bookId}:${chapter}`
  const cachedVerses = chapterCache.get(cacheKey)
  if (cachedVerses) return cachedVerses

  const bibleData = await loadBibleData(versionId)
  const book = bibleData.books.find((b) => b.id === bookId)

  if (!book) {
    return [`Book "${bookId}" not found in ${versionId}`]
  }

  const chapterData = book.chapters.find((c) => c.chapter === chapter)

  if (!chapterData) {
    return [`Chapter ${chapter} not found in ${book.name}`]
  }

  const verses = chapterData.verses.map((v) => v.text)

  // Cache the result
  chapterCache.set(cacheKey, verses)

  return verses
}

/**
 * Preload a Bible version (useful for initial loading)
 */
export async function preloadBibleVersion(versionId: string): Promise<void> {
  await loadBibleData(versionId)
}

/**
 * Clear the cache (useful for testing or memory management)
 */
export function clearBibleCache(): void {
  bibleCache.clear()
  chapterCache.clear()
}
