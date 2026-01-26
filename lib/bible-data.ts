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

/**
 * Sample verses organized by version ID
 * In a real app, this would come from a Bible API
 *
 * Structure: sampleVersesByVersion[versionId][bookId][chapter] = string[]
 */
const sampleVersesByVersion: Record<string, Record<string, Record<number, string[]>>> = {
  // King James Version (English)
  kjv: {
    gen: {
      1: [
        "In the beginning God created the heaven and the earth.",
        "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
        "And God said, Let there be light: and there was light.",
        "And God saw the light, that it was good: and God divided the light from the darkness.",
        "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
        "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.",
        "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.",
        "And God called the firmament Heaven. And the evening and the morning were the second day.",
        "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.",
        "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.",
      ],
    },
    jhn: {
      1: [
        "In the beginning was the Word, and the Word was with God, and the Word was God.",
        "The same was in the beginning with God.",
        "All things were made by him; and without him was not any thing made that was made.",
        "In him was life; and the life was the light of men.",
        "And the light shineth in darkness; and the darkness comprehended it not.",
        "There was a man sent from God, whose name was John.",
        "The same came for a witness, to bear witness of the Light, that all men through him might believe.",
        "He was not that Light, but was sent to bear witness of that Light.",
        "That was the true Light, which lighteth every man that cometh into the world.",
        "He was in the world, and the world was made by him, and the world knew him not.",
      ],
    },
    psa: {
      23: [
        "The LORD is my shepherd; I shall not want.",
        "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
        "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
        "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
        "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.",
        "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.",
      ],
    },
  },

  // American Standard Version (English)
  asv: {
    gen: {
      1: [
        "In the beginning God created the heavens and the earth.",
        "And the earth was waste and void; and darkness was upon the face of the deep: and the Spirit of God moved upon the face of the waters.",
        "And God said, Let there be light: and there was light.",
        "And God saw the light, that it was good: and God divided the light from the darkness.",
        "And God called the light Day, and the darkness he called Night. And there was evening and there was morning, one day.",
        "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.",
        "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.",
        "And God called the firmament Heaven. And there was evening and there was morning, a second day.",
        "And God said, Let the waters under the heavens be gathered together unto one place, and let the dry land appear: and it was so.",
        "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.",
      ],
    },
    jhn: {
      1: [
        "In the beginning was the Word, and the Word was with God, and the Word was God.",
        "The same was in the beginning with God.",
        "All things were made through him; and without him was not anything made that hath been made.",
        "In him was life; and the life was the light of men.",
        "And the light shineth in the darkness; and the darkness apprehended it not.",
        "There came a man, sent from God, whose name was John.",
        "The same came for witness, that he might bear witness of the light, that all might believe through him.",
        "He was not the light, but came that he might bear witness of the light.",
        "There was the true light, even the light which lighteth every man, coming into the world.",
        "He was in the world, and the world was made through him, and the world knew him not.",
      ],
    },
    psa: {
      23: [
        "Jehovah is my shepherd; I shall not want.",
        "He maketh me to lie down in green pastures; He leadeth me beside still waters.",
        "He restoreth my soul: He guideth me in the paths of righteousness for his name's sake.",
        "Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me; Thy rod and thy staff, they comfort me.",
        "Thou preparest a table before me in the presence of mine enemies: Thou hast anointed my head with oil; My cup runneth over.",
        "Surely goodness and lovingkindness shall follow me all the days of my life; And I shall dwell in the house of Jehovah for ever.",
      ],
    },
  },

  // World English Bible (English)
  web: {
    gen: {
      1: [
        "In the beginning, God created the heavens and the earth.",
        "The earth was formless and empty. Darkness was on the surface of the deep and God's Spirit was hovering over the surface of the waters.",
        "God said, \"Let there be light,\" and there was light.",
        "God saw the light, and saw that it was good. God divided the light from the darkness.",
        "God called the light \"day\", and the darkness he called \"night\". There was evening and there was morning, the first day.",
        "God said, \"Let there be an expanse in the middle of the waters, and let it divide the waters from the waters.\"",
        "God made the expanse, and divided the waters which were under the expanse from the waters which were above the expanse; and it was so.",
        "God called the expanse \"sky\". There was evening and there was morning, a second day.",
        "God said, \"Let the waters under the sky be gathered together to one place, and let the dry land appear;\" and it was so.",
        "God called the dry land \"earth\", and the gathering together of the waters he called \"seas\". God saw that it was good.",
      ],
    },
    jhn: {
      1: [
        "In the beginning was the Word, and the Word was with God, and the Word was God.",
        "The same was in the beginning with God.",
        "All things were made through him. Without him, nothing was made that has been made.",
        "In him was life, and the life was the light of men.",
        "The light shines in the darkness, and the darkness hasn't overcome it.",
        "There came a man sent from God, whose name was John.",
        "The same came as a witness, that he might testify about the light, that all might believe through him.",
        "He was not the light, but was sent that he might testify about the light.",
        "The true light that enlightens everyone was coming into the world.",
        "He was in the world, and the world was made through him, and the world didn't recognize him.",
      ],
    },
    psa: {
      23: [
        "Yahweh is my shepherd: I shall lack nothing.",
        "He makes me lie down in green pastures. He leads me beside still waters.",
        "He restores my soul. He guides me in the paths of righteousness for his name's sake.",
        "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.",
        "You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.",
        "Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh's house forever.",
      ],
    },
  },

  // Biblia Gdańska (Polish)
  bg: {
    gen: {
      1: [
        "Na początku stworzył Bóg niebo i ziemię.",
        "A ziemia była niekształtowna i próżna, i ciemność była nad przepaścią, a Duch Boży unaszał się nad wodami.",
        "I rzekł Bóg: Niech będzie światłość; i stała się światłość.",
        "I widział Bóg światłość, że była dobra; i uczynił Bóg rozdział między światłością i między ciemnością.",
        "I nazwał Bóg światłość dniem, a ciemność nazwał nocą; i stał się wieczór, i stał się zaranek, dzień pierwszy.",
        "Potem rzekł Bóg: Niech będzie rozpostarcie w pośrodku wód, a niech dzieli wody od wód.",
        "I uczynił Bóg rozpostarcie; uczynił też rozdział między wodami, które są pod rozpostarciem; i między wodami, które są nad rozpostarciem; i stało się tak.",
        "I nazwał Bóg rozpostarcie niebem. I stał się wieczór, i stał się zaranek, dzień wtóry.",
        "I rzekł Bóg: Niech się zbiorą wody, które są pod niebem, na jedno miejsce, a niech się okaże miejsce suche; i stało się tak.",
        "I nazwał Bóg suche miejsce ziemią, a zebranie wód nazwał morzem; i widział Bóg, że to było dobre.",
      ],
    },
    jhn: {
      1: [
        "Na początku było Słowo, a ono Słowo było u Boga, a Bogiem było ono Słowo.",
        "To było na początku u Boga.",
        "Wszystkie rzeczy przez nie się stały, a bez niego nic się nie stało, co się stało.",
        "W niem był żywot, a żywot był oną światłością ludzką.",
        "A ta światłość w ciemnościach świeci, ale ciemności jej nie ogarnęły.",
        "Był człowiek posłany od Boga, któremu imię było Jan.",
        "Ten przyszedł na świadectwo, aby świadczył o tej światłości, aby przezeń wszyscy uwierzyli.",
        "Nie byłci on tą światłością, ale przyszedł, aby świadczył o tej światłości.",
        "Tenci był tą prawdziwą światłością, która oświeca każdego człowieka przychodzącego na świat.",
        "Na świecie był, a świat przezeń uczyniony jest, ale go świat nie poznał.",
      ],
    },
    psa: {
      23: [
        "Pan jest pasterzem moim, na niczem mi nie zejdzie.",
        "Na paszach zielonych położy mię; a do wód cichych poprowadzi mię.",
        "Duszę moję posilił; poprowadzi mię ścieżkami sprawiedliwości dla imienia swego.",
        "Choćbym też chodził w dolinie cienia śmierci, nie będę się bał złego; albowiemeś ty ze mną, laska twoja i kij twój, te mię cieszą.",
        "Przed obliczem mojem gotujesz stół przeciwko nieprzyjaciołom moim; olejkiem namaszczasz głowę moję, kubek mój jest opływający.",
        "Nawet dobroć i miłosierdzie twe pójdą za mną po wszystkie dni żywota mego, a będę mieszkał w domu Pańskim na długie czasy.",
      ],
    },
  },

  // Uwspółcześniona Biblia Gdańska (Polish)
  ubg: {
    gen: {
      1: [
        "Na początku Bóg stworzył niebo i ziemię.",
        "A ziemia była bezkształtna i pusta i ciemność była nad głębią, a Duch Boży unosił się nad wodami.",
        "I Bóg powiedział: Niech stanie się światłość. I stała się światłość.",
        "I Bóg widział, że światłość była dobra. I Bóg oddzielił światłość od ciemności.",
        "I Bóg nazwał światłość dniem, a ciemność nazwał nocą. I nastał wieczór i nastał poranek – dzień pierwszy.",
        "Potem Bóg powiedział: Niech powstanie sklepienie pośród wód i niech oddzieli wody od wód.",
        "I Bóg uczynił sklepienie, i oddzielił wody, które były pod sklepieniem, od wód, które były nad sklepieniem. I tak się stało.",
        "I Bóg nazwał sklepienie niebem. I nastał wieczór i nastał poranek – dzień drugi.",
        "Potem Bóg powiedział: Niech wody pod niebem zbiorą się w jedno miejsce i niech się ukaże sucha powierzchnia. I tak się stało.",
        "I Bóg nazwał suchą powierzchnię ziemią, a zbiorowisko wód nazwał morzami. I Bóg widział, że to było dobre.",
      ],
    },
    jhn: {
      1: [
        "Na początku było Słowo, a Słowo było u Boga i Bogiem było Słowo.",
        "Ono było na początku u Boga.",
        "Wszystko przez nie powstało, a bez niego nic nie powstało, co powstało.",
        "W nim było życie, a życie było światłością ludzi.",
        "A ta światłość świeci w ciemności, ale ciemność jej nie ogarnęła.",
        "Był człowiek posłany od Boga, któremu na imię było Jan.",
        "Przyszedł on, aby dać świadectwo, aby zaświadczyć o tej światłości, żeby wszyscy przez niego uwierzyli.",
        "Nie był on tą światłością, ale przyszedł, aby zaświadczyć o tej światłości.",
        "Była tą prawdziwą światłością, która oświeca każdego człowieka przychodzącego na świat.",
        "Był na świecie, a świat przez niego powstał, lecz świat go nie poznał.",
      ],
    },
    psa: {
      23: [
        "PAN jest moim pasterzem, niczego mi nie zabraknie.",
        "Kładzie mnie na zielonych pastwiskach, prowadzi mnie nad spokojne wody.",
        "Pokrzepia moją duszę i wiedzie mnie ścieżkami sprawiedliwości ze względu na swoje imię.",
        "Choćbym nawet chodził doliną cienia śmierci, zła się nie ulęknę, bo ty jesteś ze mną; twoja laska i kij pocieszają mnie.",
        "Zastawiasz przede mną stół wobec moich wrogów, namaszczasz mi głowę olejkiem, mój kielich przelewa się.",
        "Zaprawdę dobroć i miłosierdzie będą mi towarzyszyć przez wszystkie dni mego życia i będę mieszkał w domu PANA przez długie dni.",
      ],
    },
  },
}

/**
 * Get verses for a specific book, chapter, and Bible version
 *
 * @param bookId - The book identifier (e.g., "gen", "jhn")
 * @param chapter - The chapter number
 * @param versionId - The Bible version ID (e.g., "kjv", "bg")
 * @returns Array of verse strings
 */
export function getVerses(bookId: string, chapter: number, versionId: string): string[] {
  // Try to get verses for the specific version
  const versionData = sampleVersesByVersion[versionId]
  if (versionData) {
    const bookData = versionData[bookId]
    if (bookData && bookData[chapter]) {
      return bookData[chapter]
    }
  }

  // Fallback: return placeholder verses
  const book = getBook(bookId)
  const bookName = book?.name || "Book"
  const versionLabel = versionId.toUpperCase()

  return Array.from({ length: 10 }, (_, i) =>
    `[${versionLabel}] This is verse ${i + 1} of ${bookName} chapter ${chapter}. In a complete implementation, actual Bible text would be loaded from a Bible API or database.`
  )
}

/**
 * @deprecated Use getVerses(bookId, chapter, versionId) instead
 * Kept for backward compatibility
 */
export function getSampleVerses(bookId: string, chapter: number): string[] {
  return getVerses(bookId, chapter, "kjv")
}
