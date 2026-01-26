export interface Book {
  id: string
  name: string
  abbrev: string
  chapters: number
  testament: "old" | "new"
}

export const bibleBooks: Book[] = [
  // Old Testament
  { id: "gen", name: "Genesis", abbrev: "Gen", chapters: 50, testament: "old" },
  { id: "exo", name: "Exodus", abbrev: "Exo", chapters: 40, testament: "old" },
  { id: "lev", name: "Leviticus", abbrev: "Lev", chapters: 27, testament: "old" },
  { id: "num", name: "Numbers", abbrev: "Num", chapters: 36, testament: "old" },
  { id: "deu", name: "Deuteronomy", abbrev: "Deu", chapters: 34, testament: "old" },
  { id: "jos", name: "Joshua", abbrev: "Jos", chapters: 24, testament: "old" },
  { id: "jdg", name: "Judges", abbrev: "Jdg", chapters: 21, testament: "old" },
  { id: "rut", name: "Ruth", abbrev: "Rut", chapters: 4, testament: "old" },
  { id: "1sa", name: "1 Samuel", abbrev: "1Sa", chapters: 31, testament: "old" },
  { id: "2sa", name: "2 Samuel", abbrev: "2Sa", chapters: 24, testament: "old" },
  { id: "1ki", name: "1 Kings", abbrev: "1Ki", chapters: 22, testament: "old" },
  { id: "2ki", name: "2 Kings", abbrev: "2Ki", chapters: 25, testament: "old" },
  { id: "1ch", name: "1 Chronicles", abbrev: "1Ch", chapters: 29, testament: "old" },
  { id: "2ch", name: "2 Chronicles", abbrev: "2Ch", chapters: 36, testament: "old" },
  { id: "ezr", name: "Ezra", abbrev: "Ezr", chapters: 10, testament: "old" },
  { id: "neh", name: "Nehemiah", abbrev: "Neh", chapters: 13, testament: "old" },
  { id: "est", name: "Esther", abbrev: "Est", chapters: 10, testament: "old" },
  { id: "job", name: "Job", abbrev: "Job", chapters: 42, testament: "old" },
  { id: "psa", name: "Psalms", abbrev: "Psa", chapters: 150, testament: "old" },
  { id: "pro", name: "Proverbs", abbrev: "Pro", chapters: 31, testament: "old" },
  { id: "ecc", name: "Ecclesiastes", abbrev: "Ecc", chapters: 12, testament: "old" },
  { id: "sng", name: "Song of Solomon", abbrev: "Sng", chapters: 8, testament: "old" },
  { id: "isa", name: "Isaiah", abbrev: "Isa", chapters: 66, testament: "old" },
  { id: "jer", name: "Jeremiah", abbrev: "Jer", chapters: 52, testament: "old" },
  { id: "lam", name: "Lamentations", abbrev: "Lam", chapters: 5, testament: "old" },
  { id: "ezk", name: "Ezekiel", abbrev: "Ezk", chapters: 48, testament: "old" },
  { id: "dan", name: "Daniel", abbrev: "Dan", chapters: 12, testament: "old" },
  { id: "hos", name: "Hosea", abbrev: "Hos", chapters: 14, testament: "old" },
  { id: "jol", name: "Joel", abbrev: "Jol", chapters: 3, testament: "old" },
  { id: "amo", name: "Amos", abbrev: "Amo", chapters: 9, testament: "old" },
  { id: "oba", name: "Obadiah", abbrev: "Oba", chapters: 1, testament: "old" },
  { id: "jon", name: "Jonah", abbrev: "Jon", chapters: 4, testament: "old" },
  { id: "mic", name: "Micah", abbrev: "Mic", chapters: 7, testament: "old" },
  { id: "nam", name: "Nahum", abbrev: "Nam", chapters: 3, testament: "old" },
  { id: "hab", name: "Habakkuk", abbrev: "Hab", chapters: 3, testament: "old" },
  { id: "zep", name: "Zephaniah", abbrev: "Zep", chapters: 3, testament: "old" },
  { id: "hag", name: "Haggai", abbrev: "Hag", chapters: 2, testament: "old" },
  { id: "zec", name: "Zechariah", abbrev: "Zec", chapters: 14, testament: "old" },
  { id: "mal", name: "Malachi", abbrev: "Mal", chapters: 4, testament: "old" },
  // New Testament
  { id: "mat", name: "Matthew", abbrev: "Mat", chapters: 28, testament: "new" },
  { id: "mrk", name: "Mark", abbrev: "Mrk", chapters: 16, testament: "new" },
  { id: "luk", name: "Luke", abbrev: "Luk", chapters: 24, testament: "new" },
  { id: "jhn", name: "John", abbrev: "Jhn", chapters: 21, testament: "new" },
  { id: "act", name: "Acts", abbrev: "Act", chapters: 28, testament: "new" },
  { id: "rom", name: "Romans", abbrev: "Rom", chapters: 16, testament: "new" },
  { id: "1co", name: "1 Corinthians", abbrev: "1Co", chapters: 16, testament: "new" },
  { id: "2co", name: "2 Corinthians", abbrev: "2Co", chapters: 13, testament: "new" },
  { id: "gal", name: "Galatians", abbrev: "Gal", chapters: 6, testament: "new" },
  { id: "eph", name: "Ephesians", abbrev: "Eph", chapters: 6, testament: "new" },
  { id: "php", name: "Philippians", abbrev: "Php", chapters: 4, testament: "new" },
  { id: "col", name: "Colossians", abbrev: "Col", chapters: 4, testament: "new" },
  { id: "1th", name: "1 Thessalonians", abbrev: "1Th", chapters: 5, testament: "new" },
  { id: "2th", name: "2 Thessalonians", abbrev: "2Th", chapters: 3, testament: "new" },
  { id: "1ti", name: "1 Timothy", abbrev: "1Ti", chapters: 6, testament: "new" },
  { id: "2ti", name: "2 Timothy", abbrev: "2Ti", chapters: 4, testament: "new" },
  { id: "tit", name: "Titus", abbrev: "Tit", chapters: 3, testament: "new" },
  { id: "phm", name: "Philemon", abbrev: "Phm", chapters: 1, testament: "new" },
  { id: "heb", name: "Hebrews", abbrev: "Heb", chapters: 13, testament: "new" },
  { id: "jas", name: "James", abbrev: "Jas", chapters: 5, testament: "new" },
  { id: "1pe", name: "1 Peter", abbrev: "1Pe", chapters: 5, testament: "new" },
  { id: "2pe", name: "2 Peter", abbrev: "2Pe", chapters: 3, testament: "new" },
  { id: "1jn", name: "1 John", abbrev: "1Jn", chapters: 5, testament: "new" },
  { id: "2jn", name: "2 John", abbrev: "2Jn", chapters: 1, testament: "new" },
  { id: "3jn", name: "3 John", abbrev: "3Jn", chapters: 1, testament: "new" },
  { id: "jud", name: "Jude", abbrev: "Jud", chapters: 1, testament: "new" },
  { id: "rev", name: "Revelation", abbrev: "Rev", chapters: 22, testament: "new" },
]

export function getBook(id: string): Book | undefined {
  return bibleBooks.find((book) => book.id === id)
}

export function getOldTestamentBooks(): Book[] {
  return bibleBooks.filter((book) => book.testament === "old")
}

export function getNewTestamentBooks(): Book[] {
  return bibleBooks.filter((book) => book.testament === "new")
}
