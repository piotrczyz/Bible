export type Language = "en" | "pl" | "no";

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
];

export interface Translations {
  // App
  appTitle: string;
  appDescription: string;

  // Navigation
  back: string;
  home: string;
  prev: string;
  next: string;

  // PWA Install Prompt
  installApp: string;
  installDescription: string;
  install: string;
  notNow: string;
  iosInstallTitle: string;
  iosInstallStep1: string;
  iosInstallStep2: string;
  iosInstallStep3: string;

  // Testament filters
  all: string;
  oldTestament: string;
  newTestament: string;

  // Chapter view
  chaptersCount: string;
  chapter: string;

  // Settings
  settings: string;
  bibleVersion: string;
  selectVersion: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  fontSize: string;
  small: string;
  large: string;
  preview: string;
  previewText: string;
  about: string;
  aboutDescription: string;
  version: string;
  language: string;

  // Errors
  errorTryAgain: string;

  // Timeline
  timeline: string;
  noReadingHistory: string;
  clearHistory: string;
  confirmClearHistory: string;
  loading: string;

  // Verse selection
  verseSelected: string;
  versesSelected: string;
  selectAll: string;
  clearSelection: string;
  saveToTimeline: string;
  markAllRead: string;
  markAllUnread: string;
  save: string;

  // AI Search
  aiSearch: string;
  aiSearchPlaceholder: string;
  aiSearchInstructions: string;
  aiSearchNoResults: string;
  aiSearchError: string;
  searching: string;

  // Bible book names
  books: {
    gen: string;
    exo: string;
    lev: string;
    num: string;
    deu: string;
    jos: string;
    jdg: string;
    rut: string;
    "1sa": string;
    "2sa": string;
    "1ki": string;
    "2ki": string;
    "1ch": string;
    "2ch": string;
    ezr: string;
    neh: string;
    est: string;
    job: string;
    psa: string;
    pro: string;
    ecc: string;
    sng: string;
    isa: string;
    jer: string;
    lam: string;
    ezk: string;
    dan: string;
    hos: string;
    jol: string;
    amo: string;
    oba: string;
    jon: string;
    mic: string;
    nam: string;
    hab: string;
    zep: string;
    hag: string;
    zec: string;
    mal: string;
    mat: string;
    mrk: string;
    luk: string;
    jhn: string;
    act: string;
    rom: string;
    "1co": string;
    "2co": string;
    gal: string;
    eph: string;
    php: string;
    col: string;
    "1th": string;
    "2th": string;
    "1ti": string;
    "2ti": string;
    tit: string;
    phm: string;
    heb: string;
    jas: string;
    "1pe": string;
    "2pe": string;
    "1jn": string;
    "2jn": string;
    "3jn": string;
    jud: string;
    rev: string;
  };
}

const en: Translations = {
  // App
  appTitle: "Bible",
  appDescription: "Your reading assistant",

  // Navigation
  back: "Back",
  home: "Home",
  prev: "Prev",
  next: "Next",

  // PWA Install Prompt
  installApp: "Install Bible",
  installDescription: "Install the app for offline reading and a better experience.",
  install: "Install",
  notNow: "Not now",
  iosInstallTitle: "Install on iOS",
  iosInstallStep1: "Tap the Share button",
  iosInstallStep2: "Scroll down and tap \"Add to Home Screen\"",
  iosInstallStep3: "Tap \"Add\" to install",

  // Testament filters
  all: "All",
  oldTestament: "Old Testament",
  newTestament: "New Testament",

  // Chapter view
  chaptersCount: "{count} chapters",
  chapter: "Chapter",

  // Settings
  settings: "Settings",
  bibleVersion: "Bible Version",
  selectVersion: "Select a version",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  fontSize: "Font Size",
  small: "Small",
  large: "Large",
  preview: "Preview",
  previewText: "In the beginning God created the heaven and the earth.",
  about: "About",
  aboutDescription: "Bible is your reading assistant. Open source, focused on clean reading experience.",
  version: "Version",
  language: "Language",

  // Errors
  errorTryAgain: "Please try again or select a different version.",

  // Timeline
  timeline: "Reading Timeline",
  noReadingHistory: "No reading history yet. Start reading to see your timeline here.",
  clearHistory: "Clear History",
  confirmClearHistory: "Are you sure you want to clear all reading history?",
  loading: "Loading...",

  // Verse selection
  verseSelected: "verse",
  versesSelected: "verses",
  selectAll: "Select all",
  clearSelection: "Clear selection",
  saveToTimeline: "Save to timeline",
  markAllRead: "Mark all read",
  markAllUnread: "Mark all unread",
  save: "Save",

  // Search
  aiSearch: "Search",
  aiSearchPlaceholder: "Describe the verse you're looking for...",
  aiSearchInstructions: "Describe a Bible verse in your own words. You don't need to remember the exact text - just describe what it's about and we'll find it for you.",
  aiSearchNoResults: "No matching verses found. Try describing the verse differently.",
  aiSearchError: "Search failed. Please try again later.",
  searching: "Searching...",

  // Bible book names
  books: {
    gen: "Genesis",
    exo: "Exodus",
    lev: "Leviticus",
    num: "Numbers",
    deu: "Deuteronomy",
    jos: "Joshua",
    jdg: "Judges",
    rut: "Ruth",
    "1sa": "1 Samuel",
    "2sa": "2 Samuel",
    "1ki": "1 Kings",
    "2ki": "2 Kings",
    "1ch": "1 Chronicles",
    "2ch": "2 Chronicles",
    ezr: "Ezra",
    neh: "Nehemiah",
    est: "Esther",
    job: "Job",
    psa: "Psalms",
    pro: "Proverbs",
    ecc: "Ecclesiastes",
    sng: "Song of Solomon",
    isa: "Isaiah",
    jer: "Jeremiah",
    lam: "Lamentations",
    ezk: "Ezekiel",
    dan: "Daniel",
    hos: "Hosea",
    jol: "Joel",
    amo: "Amos",
    oba: "Obadiah",
    jon: "Jonah",
    mic: "Micah",
    nam: "Nahum",
    hab: "Habakkuk",
    zep: "Zephaniah",
    hag: "Haggai",
    zec: "Zechariah",
    mal: "Malachi",
    mat: "Matthew",
    mrk: "Mark",
    luk: "Luke",
    jhn: "John",
    act: "Acts",
    rom: "Romans",
    "1co": "1 Corinthians",
    "2co": "2 Corinthians",
    gal: "Galatians",
    eph: "Ephesians",
    php: "Philippians",
    col: "Colossians",
    "1th": "1 Thessalonians",
    "2th": "2 Thessalonians",
    "1ti": "1 Timothy",
    "2ti": "2 Timothy",
    tit: "Titus",
    phm: "Philemon",
    heb: "Hebrews",
    jas: "James",
    "1pe": "1 Peter",
    "2pe": "2 Peter",
    "1jn": "1 John",
    "2jn": "2 John",
    "3jn": "3 John",
    jud: "Jude",
    rev: "Revelation",
  },
};

const pl: Translations = {
  // App
  appTitle: "Biblia",
  appDescription: "Twój asystent do czytania",

  // Navigation
  back: "Wstecz",
  home: "Strona główna",
  prev: "Poprz.",
  next: "Nast.",

  // PWA Install Prompt
  installApp: "Zainstaluj Biblię",
  installDescription: "Zainstaluj aplikację, aby czytać offline i mieć lepsze doświadczenie.",
  install: "Zainstaluj",
  notNow: "Nie teraz",
  iosInstallTitle: "Zainstaluj na iOS",
  iosInstallStep1: "Dotknij przycisk Udostępnij",
  iosInstallStep2: "Przewiń w dół i dotknij \"Dodaj do ekranu głównego\"",
  iosInstallStep3: "Dotknij \"Dodaj\", aby zainstalować",

  // Testament filters
  all: "Wszystkie",
  oldTestament: "Stary Testament",
  newTestament: "Nowy Testament",

  // Chapter view
  chaptersCount: "{count} rozdziałów",
  chapter: "Rozdział",

  // Settings
  settings: "Ustawienia",
  bibleVersion: "Przekład Biblii",
  selectVersion: "Wybierz przekład",
  theme: "Motyw",
  light: "Jasny",
  dark: "Ciemny",
  system: "Systemowy",
  fontSize: "Rozmiar czcionki",
  small: "Mały",
  large: "Duży",
  preview: "Podgląd",
  previewText: "Na początku stworzył Bóg niebo i ziemię.",
  about: "O aplikacji",
  aboutDescription: "Biblia to Twój asystent do czytania. Open source, skupiona na czystym doświadczeniu czytania.",
  version: "Wersja",
  language: "Język",

  // Errors
  errorTryAgain: "Spróbuj ponownie lub wybierz inny przekład.",

  // Timeline
  timeline: "Historia czytania",
  noReadingHistory: "Brak historii czytania. Zacznij czytać, aby zobaczyć swoją oś czasu.",
  clearHistory: "Wyczyść historię",
  confirmClearHistory: "Czy na pewno chcesz wyczyścić całą historię czytania?",
  loading: "Ładowanie...",

  // Verse selection
  verseSelected: "werset",
  versesSelected: "wersetów",
  selectAll: "Zaznacz wszystko",
  clearSelection: "Wyczyść zaznaczenie",
  saveToTimeline: "Zapisz do historii",
  markAllRead: "Oznacz wszystko jako przeczytane",
  markAllUnread: "Oznacz wszystko jako nieprzeczytane",
  save: "Zapisz",

  // Search
  aiSearch: "Wyszukiwanie",
  aiSearchPlaceholder: "Opisz werset, którego szukasz...",
  aiSearchInstructions: "Opisz werset biblijny własnymi słowami. Nie musisz pamiętać dokładnego tekstu - wystarczy opisać, o czym jest, a znajdziemy go za Ciebie.",
  aiSearchNoResults: "Nie znaleziono pasujących wersetów. Spróbuj opisać werset inaczej.",
  aiSearchError: "Wyszukiwanie nie powiodło się. Spróbuj ponownie później.",
  searching: "Szukam...",

  // Bible book names
  books: {
    gen: "Księga Rodzaju",
    exo: "Księga Wyjścia",
    lev: "Księga Kapłańska",
    num: "Księga Liczb",
    deu: "Księga Powtórzonego Prawa",
    jos: "Księga Jozuego",
    jdg: "Księga Sędziów",
    rut: "Księga Rut",
    "1sa": "1 Księga Samuela",
    "2sa": "2 Księga Samuela",
    "1ki": "1 Księga Królewska",
    "2ki": "2 Księga Królewska",
    "1ch": "1 Księga Kronik",
    "2ch": "2 Księga Kronik",
    ezr: "Księga Ezdrasza",
    neh: "Księga Nehemiasza",
    est: "Księga Estery",
    job: "Księga Hioba",
    psa: "Księga Psalmów",
    pro: "Księga Przysłów",
    ecc: "Księga Koheleta",
    sng: "Pieśń nad Pieśniami",
    isa: "Księga Izajasza",
    jer: "Księga Jeremiasza",
    lam: "Lamentacje",
    ezk: "Księga Ezechiela",
    dan: "Księga Daniela",
    hos: "Księga Ozeasza",
    jol: "Księga Joela",
    amo: "Księga Amosa",
    oba: "Księga Abdiasza",
    jon: "Księga Jonasza",
    mic: "Księga Micheasza",
    nam: "Księga Nahuma",
    hab: "Księga Habakuka",
    zep: "Księga Sofoniasza",
    hag: "Księga Aggeusza",
    zec: "Księga Zachariasza",
    mal: "Księga Malachiasza",
    mat: "Ewangelia Mateusza",
    mrk: "Ewangelia Marka",
    luk: "Ewangelia Łukasza",
    jhn: "Ewangelia Jana",
    act: "Dzieje Apostolskie",
    rom: "List do Rzymian",
    "1co": "1 List do Koryntian",
    "2co": "2 List do Koryntian",
    gal: "List do Galatów",
    eph: "List do Efezjan",
    php: "List do Filipian",
    col: "List do Kolosan",
    "1th": "1 List do Tesaloniczan",
    "2th": "2 List do Tesaloniczan",
    "1ti": "1 List do Tymoteusza",
    "2ti": "2 List do Tymoteusza",
    tit: "List do Tytusa",
    phm: "List do Filemona",
    heb: "List do Hebrajczyków",
    jas: "List Jakuba",
    "1pe": "1 List Piotra",
    "2pe": "2 List Piotra",
    "1jn": "1 List Jana",
    "2jn": "2 List Jana",
    "3jn": "3 List Jana",
    jud: "List Judy",
    rev: "Apokalipsa",
  },
};

const no: Translations = {
  // App
  appTitle: "Bibelen",
  appDescription: "Din leseassistent",

  // Navigation
  back: "Tilbake",
  home: "Hjem",
  prev: "Forrige",
  next: "Neste",

  // PWA Install Prompt
  installApp: "Installer Bibelen",
  installDescription: "Installer appen for offline lesing og en bedre opplevelse.",
  install: "Installer",
  notNow: "Ikke nå",
  iosInstallTitle: "Installer på iOS",
  iosInstallStep1: "Trykk på Del-knappen",
  iosInstallStep2: "Rull ned og trykk \"Legg til på Hjem-skjerm\"",
  iosInstallStep3: "Trykk \"Legg til\" for å installere",

  // Testament filters
  all: "Alle",
  oldTestament: "Det gamle testamentet",
  newTestament: "Det nye testamentet",

  // Chapter view
  chaptersCount: "{count} kapitler",
  chapter: "Kapittel",

  // Settings
  settings: "Innstillinger",
  bibleVersion: "Bibeloversettelse",
  selectVersion: "Velg en oversettelse",
  theme: "Tema",
  light: "Lys",
  dark: "Mørk",
  system: "System",
  fontSize: "Skriftstørrelse",
  small: "Liten",
  large: "Stor",
  preview: "Forhåndsvisning",
  previewText: "I begynnelsen skapte Gud himmelen og jorden.",
  about: "Om",
  aboutDescription: "Bibelen er din leseassistent. Åpen kildekode, fokus på ren leseopplevelse.",
  version: "Versjon",
  language: "Språk",

  // Errors
  errorTryAgain: "Vennligst prøv igjen eller velg en annen oversettelse.",

  // Timeline
  timeline: "Lesetidslinje",
  noReadingHistory: "Ingen lesehistorikk ennå. Begynn å lese for å se tidslinjen din her.",
  clearHistory: "Tøm historikk",
  confirmClearHistory: "Er du sikker på at du vil slette all lesehistorikk?",
  loading: "Laster...",

  // Verse selection
  verseSelected: "vers",
  versesSelected: "vers",
  selectAll: "Velg alle",
  clearSelection: "Fjern valg",
  saveToTimeline: "Lagre til tidslinje",
  markAllRead: "Merk alle som lest",
  markAllUnread: "Merk alle som ulest",
  save: "Lagre",

  // Search
  aiSearch: "Søk",
  aiSearchPlaceholder: "Beskriv verset du leter etter...",
  aiSearchInstructions: "Beskriv et bibelvers med egne ord. Du trenger ikke huske den nøyaktige teksten - bare beskriv hva det handler om, så finner vi det for deg.",
  aiSearchNoResults: "Ingen matchende vers funnet. Prøv å beskrive verset annerledes.",
  aiSearchError: "Søket mislyktes. Vennligst prøv igjen senere.",
  searching: "Søker...",

  // Bible book names
  books: {
    gen: "1. Mosebok",
    exo: "2. Mosebok",
    lev: "3. Mosebok",
    num: "4. Mosebok",
    deu: "5. Mosebok",
    jos: "Josva",
    jdg: "Dommerne",
    rut: "Rut",
    "1sa": "1. Samuelsbok",
    "2sa": "2. Samuelsbok",
    "1ki": "1. Kongebok",
    "2ki": "2. Kongebok",
    "1ch": "1. Krønikebok",
    "2ch": "2. Krønikebok",
    ezr: "Esra",
    neh: "Nehemja",
    est: "Ester",
    job: "Job",
    psa: "Salmene",
    pro: "Ordspråkene",
    ecc: "Forkynneren",
    sng: "Høysangen",
    isa: "Jesaja",
    jer: "Jeremia",
    lam: "Klagesangene",
    ezk: "Esekiel",
    dan: "Daniel",
    hos: "Hosea",
    jol: "Joel",
    amo: "Amos",
    oba: "Obadja",
    jon: "Jona",
    mic: "Mika",
    nam: "Nahum",
    hab: "Habakkuk",
    zep: "Sefanja",
    hag: "Haggai",
    zec: "Sakarja",
    mal: "Malaki",
    mat: "Matteus",
    mrk: "Markus",
    luk: "Lukas",
    jhn: "Johannes",
    act: "Apostlenes gjerninger",
    rom: "Romerne",
    "1co": "1. Korinterbrev",
    "2co": "2. Korinterbrev",
    gal: "Galaterne",
    eph: "Efeserne",
    php: "Filipperne",
    col: "Kolosserne",
    "1th": "1. Tessalonikerbrev",
    "2th": "2. Tessalonikerbrev",
    "1ti": "1. Timoteusbrev",
    "2ti": "2. Timoteusbrev",
    tit: "Titus",
    phm: "Filemon",
    heb: "Hebreerne",
    jas: "Jakob",
    "1pe": "1. Petersbrev",
    "2pe": "2. Petersbrev",
    "1jn": "1. Johannesbrev",
    "2jn": "2. Johannesbrev",
    "3jn": "3. Johannesbrev",
    jud: "Judas",
    rev: "Johannes' åpenbaring",
  },
};

export const translations: Record<Language, Translations> = {
  en,
  pl,
  no,
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export function formatString(template: string, values: Record<string, string | number>): string {
  return template.replace(/{(\w+)}/g, (_, key) => String(values[key] ?? `{${key}}`));
}
