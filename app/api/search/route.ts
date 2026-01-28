import { NextRequest, NextResponse } from "next/server"
import { bibleBooks } from "@/lib/bible-data"

export interface SearchResult {
  bookId: string
  bookName: string
  chapter: number
  verse: number
  text: string
  confidence: number
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  error?: {
    message: string
  }
}

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

Do NOT include any explanation or text outside the JSON array.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body as { query: string }

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const messages: OpenAIMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Find Bible verse(s) matching this description: "${query}"` },
    ]

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
    })

    if (!response.ok) {
      const errorData = (await response.json()) as OpenAIResponse
      return NextResponse.json(
        { error: errorData.error?.message || "OpenAI API error" },
        { status: response.status }
      )
    }

    const data = (await response.json()) as OpenAIResponse
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let results: Array<{
      bookId: string
      chapter: number
      verse: number
      confidence: number
    }>

    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      let jsonStr = content.trim()
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim()
      }
      results = JSON.parse(jsonStr)
    } catch {
      console.error("Failed to parse OpenAI response:", content)
      return NextResponse.json(
        { error: "Failed to parse search results" },
        { status: 500 }
      )
    }

    // Validate and enrich results with book names
    const validResults: SearchResult[] = results
      .filter((r) => {
        const book = bibleBooks.find((b) => b.id === r.bookId)
        return book && r.chapter > 0 && r.chapter <= book.chapters && r.verse > 0
      })
      .map((r) => {
        const book = bibleBooks.find((b) => b.id === r.bookId)!
        return {
          bookId: r.bookId,
          bookName: book.name,
          chapter: r.chapter,
          verse: r.verse,
          text: "", // Will be filled by the client when loading verses
          confidence: r.confidence,
        }
      })
      .slice(0, 5) // Limit to 5 results

    return NextResponse.json({ results: validResults })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
