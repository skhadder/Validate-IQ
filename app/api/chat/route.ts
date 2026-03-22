import { NextRequest, NextResponse } from "next/server"

const FALLBACK_REPLY = "Something went wrong. Please try again."

interface HistoryMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      message,
      reportContext,
      history = [],
    } = body as {
      message: string
      reportContext: object
      history: HistoryMessage[]
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 400 })
    }

    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: FALLBACK_REPLY })
    }

    const systemPrompt = `You are Verdict, a sharp startup advisor. The founder's validation report is attached below.

STRICT OUTPUT FORMAT — follow this exactly, every time:

**[One bold sentence: the single most important thing to know]**

- [Point 1 — specific, max 15 words]
- [Point 2 — specific, max 15 words]
- [Point 3 — specific, max 15 words, only if truly needed]

→ **Today:** [One concrete action they can do right now, max 20 words]

RULES:
- Total response must be under 100 words
- Every point must reference their specific idea, market, competitor, or score — never generic advice
- No nested bullets, no sub-bullets, no paragraphs, no headers, no extra lines
- No raw JSON, no code blocks
- If asked to regenerate the report, reply: "Go back to the workspace to run a new validation."

Founder's validation report:
${JSON.stringify(reportContext)}`

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: message },
    ]

    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages,
        max_tokens: 300,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ reply: FALLBACK_REPLY })
    }

    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content ?? FALLBACK_REPLY
    const reply = raw.replace(/\[\d+\]/g, "").trim()

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ reply: FALLBACK_REPLY })
  }
}
