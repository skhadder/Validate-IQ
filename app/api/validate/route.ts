import { NextRequest, NextResponse } from "next/server"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Survey {
  stage: string
  technical: string
  budget: string
  time: string
  network: string
  geography: string
}

interface PerplexityMessage {
  role: "system" | "user"
  content: string
}

interface PerplexityCitation {
  url?: string
}

interface PerplexityResponse {
  choices: {
    message: {
      content: string
    }
  }[]
  citations?: PerplexityCitation[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFounderContext(survey: Survey): string {
  return (
    `Founder profile: Stage=${survey.stage}, Technical=${survey.technical}, ` +
    `Budget=${survey.budget}, Time=${survey.time}, Network=${survey.network}, ` +
    `Geography=${survey.geography}. Use this context to personalize every insight ` +
    `specifically for this founder — not a generic founder.`
  )
}

function getConfidenceLevel(citations: PerplexityCitation[] | undefined): string {
  const count = citations?.length ?? 0
  if (count >= 4) return "High"
  if (count >= 2) return "Medium"
  return "Low"
}

function stripCitations(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\[\d+\]/g, "").trim()
  if (Array.isArray(value)) return value.map(stripCitations)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stripCitations(v)])
    )
  }
  return value
}

function extractJSON(raw: string): unknown {
  // Strip markdown fences
  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()

  // Strip anything before the first { or [
  const firstBrace = cleaned.indexOf("{")
  const firstBracket = cleaned.indexOf("[")
  let start = -1
  if (firstBrace === -1) start = firstBracket
  else if (firstBracket === -1) start = firstBrace
  else start = Math.min(firstBrace, firstBracket)

  if (start === -1) throw new Error("No JSON object found")
  cleaned = cleaned.slice(start)

  // Strip anything after the last } or ]
  const lastBrace = cleaned.lastIndexOf("}")
  const lastBracket = cleaned.lastIndexOf("]")
  const end = Math.max(lastBrace, lastBracket)
  if (end === -1) throw new Error("No JSON closing found")
  cleaned = cleaned.slice(0, end + 1)

  return JSON.parse(cleaned)
}

async function callPerplexity(
  messages: PerplexityMessage[]
): Promise<{ data: PerplexityResponse; error: null } | { data: null; error: string }> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) return { data: null, error: "PERPLEXITY_API_KEY not set" }

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages,
        max_tokens: 1000,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { data: null, error: `Perplexity ${res.status}: ${text}` }
    }

    const data = (await res.json()) as PerplexityResponse
    return { data, error: null }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}

function parseSection(result: { data: PerplexityResponse | null; error: string | null }) {
  if (result.error || !result.data) {
    return { parsed: { error: true, message: "Section unavailable" }, citations: [] }
  }

  const raw = result.data.choices?.[0]?.message?.content ?? ""
  const citations = result.data.citations ?? []

  try {
    const parsed = stripCitations(extractJSON(raw))
    return { parsed, citations }
  } catch {
    return { parsed: { error: true, message: "Section unavailable" }, citations }
  }
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idea, survey } = body as { idea: string; survey: Survey }

    if (!idea || typeof idea !== "string") {
      return NextResponse.json({ error: true, message: "Missing idea" }, { status: 400 })
    }

    const founderCtx = survey ? buildFounderContext(survey) : ""
    const geo = survey?.geography ?? "Global"

    const systemPrompt = (extra = "") =>
      `You are a startup analyst with live web access. ${founderCtx}${extra}\nReturn JSON only. No markdown. No preamble. No explanation. Just the raw JSON object.`

    // ── 6 parallel Perplexity calls ───────────────────────────────────────────

    const [snap, mkt, comp, entry, verdict, devil] = await Promise.all([

      // CALL 1 — Idea Snapshot
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: ${idea}
Return this exact JSON:
{
  "oneLiner": string,
  "problem": string,
  "targetCustomer": string,
  "clarityScore": number
}`,
        },
      ]),

      // CALL 2 — Market Signals
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: ${idea}
Geography: ${geo}
Return this exact JSON:
{
  "tam": string,
  "tamSource": string,
  "sam": string,
  "som": string,
  "growthRate": string,
  "marketTiming": "Early" | "Peak" | "Late",
  "marketTimingReason": string
}`,
        },
      ]),

      // CALL 3 — Competitor Intel
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: ${idea}
Find 3-5 real active competitors.
Return this exact JSON:
{
  "competitors": [
    {
      "name": string,
      "website": string,
      "funding": string,
      "pricing": string,
      "lastActivity": string
    }
  ],
  "gapStatement": string
}`,
        },
      ]),

      // CALL 4 — Market Entry Score
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: ${idea}
${founderCtx}
Return this exact JSON:
{
  "entryScore": number (0-10),
  "barrierLevel": "Low" | "Medium" | "High" | "Very High",
  "barriers": [string, string, string],
  "advantages": [string, string],
  "fastestEntryPath": string
}`,
        },
      ]),

      // CALL 5 — Go/No-Go Verdict
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: ${idea}
${founderCtx}
Return this exact JSON:
{
  "verdict": "GO" | "CONDITIONAL GO" | "NO-GO",
  "viabilityScore": number (0-9),
  "topReasons": [string, string, string],
  "topRisks": [string, string, string],
  "nextAction": string
}`,
        },
      ]),

      // CALL 6 — Devil's Advocate
      callPerplexity([
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: `For this startup idea: ${idea}
Find 3 real companies that tried this and failed.
Return this exact JSON:
{
  "failures": [
    {
      "name": string,
      "what": string,
      "why": string,
      "year": string
    }
  ],
  "thePattern": string,
  "survivalRule": string
}`,
        },
      ]),
    ])

    // ── Parse each section ────────────────────────────────────────────────────

    const sections = {
      snapshot: parseSection(snap),
      market:   parseSection(mkt),
      competitors: parseSection(comp),
      entryScore:  parseSection(entry),
      verdict:     parseSection(verdict),
      devilsAdvocate: parseSection(devil),
    }

    function extractUrls(citations: PerplexityCitation[]): string[] {
      return citations
        .map((c) => (typeof c === "string" ? c : c.url))
        .filter((url): url is string => Boolean(url))
    }

    return NextResponse.json({
      snapshot:       sections.snapshot.parsed,
      market:         sections.market.parsed,
      competitors:    sections.competitors.parsed,
      entryScore:     sections.entryScore.parsed,
      verdict:        sections.verdict.parsed,
      devilsAdvocate: sections.devilsAdvocate.parsed,
      confidence: {
        snapshot:       getConfidenceLevel(sections.snapshot.citations),
        market:         getConfidenceLevel(sections.market.citations),
        competitors:    getConfidenceLevel(sections.competitors.citations),
        entryScore:     getConfidenceLevel(sections.entryScore.citations),
        verdict:        getConfidenceLevel(sections.verdict.citations),
        devilsAdvocate: getConfidenceLevel(sections.devilsAdvocate.citations),
      },
      citations: {
        snapshot:       extractUrls(sections.snapshot.citations),
        market:         extractUrls(sections.market.citations),
        competitors:    extractUrls(sections.competitors.citations),
        entryScore:     extractUrls(sections.entryScore.citations),
        verdict:        extractUrls(sections.verdict.citations),
        devilsAdvocate: extractUrls(sections.devilsAdvocate.citations),
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: true, message: "Unexpected server error", detail: String(err) },
      { status: 500 }
    )
  }
}
