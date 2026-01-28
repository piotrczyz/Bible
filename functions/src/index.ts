import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

// Define the secret for OpenAI API key
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// Bible books data
const bibleBooks = [
  { id: "gen", name: "Genesis", chapters: 50 },
  { id: "exo", name: "Exodus", chapters: 40 },
  { id: "lev", name: "Leviticus", chapters: 27 },
  { id: "num", name: "Numbers", chapters: 36 },
  { id: "deu", name: "Deuteronomy", chapters: 34 },
  { id: "jos", name: "Joshua", chapters: 24 },
  { id: "jdg", name: "Judges", chapters: 21 },
  { id: "rut", name: "Ruth", chapters: 4 },
  { id: "1sa", name: "1 Samuel", chapters: 31 },
  { id: "2sa", name: "2 Samuel", chapters: 24 },
  { id: "1ki", name: "1 Kings", chapters: 22 },
  { id: "2ki", name: "2 Kings", chapters: 25 },
  { id: "1ch", name: "1 Chronicles", chapters: 29 },
  { id: "2ch", name: "2 Chronicles", chapters: 36 },
  { id: "ezr", name: "Ezra", chapters: 10 },
  { id: "neh", name: "Nehemiah", chapters: 13 },
  { id: "est", name: "Esther", chapters: 10 },
  { id: "job", name: "Job", chapters: 42 },
  { id: "psa", name: "Psalms", chapters: 150 },
  { id: "pro", name: "Proverbs", chapters: 31 },
  { id: "ecc", name: "Ecclesiastes", chapters: 12 },
  { id: "sng", name: "Song of Solomon", chapters: 8 },
  { id: "isa", name: "Isaiah", chapters: 66 },
  { id: "jer", name: "Jeremiah", chapters: 52 },
  { id: "lam", name: "Lamentations", chapters: 5 },
  { id: "ezk", name: "Ezekiel", chapters: 48 },
  { id: "dan", name: "Daniel", chapters: 12 },
  { id: "hos", name: "Hosea", chapters: 14 },
  { id: "jol", name: "Joel", chapters: 3 },
  { id: "amo", name: "Amos", chapters: 9 },
  { id: "oba", name: "Obadiah", chapters: 1 },
  { id: "jon", name: "Jonah", chapters: 4 },
  { id: "mic", name: "Micah", chapters: 7 },
  { id: "nam", name: "Nahum", chapters: 3 },
  { id: "hab", name: "Habakkuk", chapters: 3 },
  { id: "zep", name: "Zephaniah", chapters: 3 },
  { id: "hag", name: "Haggai", chapters: 2 },
  { id: "zec", name: "Zechariah", chapters: 14 },
  { id: "mal", name: "Malachi", chapters: 4 },
  { id: "mat", name: "Matthew", chapters: 28 },
  { id: "mrk", name: "Mark", chapters: 16 },
  { id: "luk", name: "Luke", chapters: 24 },
  { id: "jhn", name: "John", chapters: 21 },
  { id: "act", name: "Acts", chapters: 28 },
  { id: "rom", name: "Romans", chapters: 16 },
  { id: "1co", name: "1 Corinthians", chapters: 16 },
  { id: "2co", name: "2 Corinthians", chapters: 13 },
  { id: "gal", name: "Galatians", chapters: 6 },
  { id: "eph", name: "Ephesians", chapters: 6 },
  { id: "php", name: "Philippians", chapters: 4 },
  { id: "col", name: "Colossians", chapters: 4 },
  { id: "1th", name: "1 Thessalonians", chapters: 5 },
  { id: "2th", name: "2 Thessalonians", chapters: 3 },
  { id: "1ti", name: "1 Timothy", chapters: 6 },
  { id: "2ti", name: "2 Timothy", chapters: 4 },
  { id: "tit", name: "Titus", chapters: 3 },
  { id: "phm", name: "Philemon", chapters: 1 },
  { id: "heb", name: "Hebrews", chapters: 13 },
  { id: "jas", name: "James", chapters: 5 },
  { id: "1pe", name: "1 Peter", chapters: 5 },
  { id: "2pe", name: "2 Peter", chapters: 3 },
  { id: "1jn", name: "1 John", chapters: 5 },
  { id: "2jn", name: "2 John", chapters: 1 },
  { id: "3jn", name: "3 John", chapters: 1 },
  { id: "jud", name: "Jude", chapters: 1 },
  { id: "rev", name: "Revelation", chapters: 22 },
];

const SYSTEM_PROMPT = `You are a Bible verse search assistant. When a user describes a verse or passage in their own words (even with inaccurate wording), identify the most likely Bible verse(s) they're looking for.

Available Bible books with their IDs:
${bibleBooks.map((b) => `${b.id}: ${b.name} (${b.chapters} chapters)`).join("\n")}

IMPORTANT: You must respond with a valid JSON array of objects with this exact structure:
[
  {
    "bookId": "string (use the exact ID from the list above, e.g., 'gen', 'mat', 'jhn')",
    "chapter": number,
    "verse": number,
    "confidence": number (0-100, how confident you are this is the verse they're looking for)
  }
]

Return up to 5 most relevant results, ordered by confidence (highest first).
If you cannot find any matching verses, return an empty array: []

Do NOT include any explanation or text outside the JSON array.`;

interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  confidence: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export const search = onRequest(
  {
    secrets: [openaiApiKey],
    cors: true,
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { query } = req.body as { query: string };

      if (!query || typeof query !== "string") {
        res.status(400).json({ error: "Query is required" });
        return;
      }

      const apiKey = openaiApiKey.value();
      if (!apiKey) {
        res.status(500).json({ error: "OpenAI API key not configured" });
        return;
      }

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Find Bible verse(s) matching this description: "${query}"` },
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as OpenAIResponse;
        res.status(response.status).json({
          error: errorData.error?.message || "OpenAI API error",
        });
        return;
      }

      const data = (await response.json()) as OpenAIResponse;
      const content = data.choices[0]?.message?.content;

      if (!content) {
        res.status(500).json({ error: "No response from OpenAI" });
        return;
      }

      // Parse the JSON response
      let results: Array<{
        bookId: string;
        chapter: number;
        verse: number;
        confidence: number;
      }>;

      try {
        let jsonStr = content.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
        }
        results = JSON.parse(jsonStr);
      } catch {
        console.error("Failed to parse OpenAI response:", content);
        res.status(500).json({ error: "Failed to parse search results" });
        return;
      }

      // Validate and enrich results with book names
      const validResults: SearchResult[] = results
        .filter((r) => {
          const book = bibleBooks.find((b) => b.id === r.bookId);
          return book && r.chapter > 0 && r.chapter <= book.chapters && r.verse > 0;
        })
        .map((r) => {
          const book = bibleBooks.find((b) => b.id === r.bookId)!;
          return {
            bookId: r.bookId,
            bookName: book.name,
            chapter: r.chapter,
            verse: r.verse,
            text: "",
            confidence: r.confidence,
          };
        })
        .slice(0, 5);

      res.json({ results: validResults });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
