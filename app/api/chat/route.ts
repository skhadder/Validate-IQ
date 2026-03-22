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

    const systemPrompt = `You are ValidateIQ, an expert startup advisor with access to live market data. You have already analyzed the founder's idea and generated their validation report.

Be specific, direct, and actionable. Never give generic startup advice. Every answer must reference the founder's specific idea, their market, their competitors, or their score from the report.

Format your responses clearly:
- Use short paragraphs, not walls of text
- Use bullet points when listing multiple items
- Bold the most important insight in each response using **bold**
- Keep responses under 150 words unless the question genuinely requires more detail
- End every response with one specific actionable next step the founder can take today
- NEVER output raw JSON, code blocks, or data dumps — always respond in plain conversational prose
- If asked to "regenerate" or "update" the report, explain that they should go back to the workspace to run a new validation

The founder's full validation report:
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
        max_tokens: 800,
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
