import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60; // Allow up to 60s for Perplexity API calls


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
    `Budget=${survey.budget}, DomainExperience=${survey.time}, Network=${survey.network}, ` +
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
  // Strip <think>...</think> blocks from sonar-reasoning-pro
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "")
  // Strip markdown fences
  cleaned = cleaned
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
  messages: PerplexityMessage[],
  model = "sonar-pro",
  max_tokens = 2000
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
        model,
        messages,
        max_tokens,
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
    return { parsed: { error: true, message: "Section unavailable" }, citations: [] as PerplexityCitation[] }
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

function normalizeEntryScore(raw: unknown): number {
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
  if (isNaN(n)) return 5
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10))
}

function normalizeViabilityScore(raw: unknown): number {
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
  if (isNaN(n)) return 5
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10))
}

function extractUrls(citations: PerplexityCitation[]): string[] {
  return citations
    .map((c) => (typeof c === "string" ? c : c.url))
    .filter((url): url is string => Boolean(url))
}

function buildFinalResponse(
  results: ReturnType<typeof parseSection>[],
  existingReport: Record<string, unknown> | undefined
) {
  const [snapR, mktR, compR, entryR, verdictR, devilR, somR] = results

  const entryParsed = entryR.parsed as Record<string, unknown>
  if (entryParsed && !entryParsed.error) {
    entryParsed.entryScore = normalizeEntryScore(entryParsed.entryScore)
  }

  const verdictParsed = verdictR.parsed as Record<string, unknown>
  if (verdictParsed && !verdictParsed.error) {
    verdictParsed.viabilityScore = normalizeViabilityScore(verdictParsed.viabilityScore)
    const vs = verdictParsed.viabilityScore as number
    if (typeof vs === "number") {
      verdictParsed.verdict = vs >= 7.0 ? "GO" : vs >= 4.5 ? "CONDITIONAL GO" : "NO-GO"
    }
  }

  // Merge fresh SOM into market data (always up-to-date with founder profile)
  const baseMarket = existingReport ? existingReport.market : mktR.parsed
  const somParsed = somR.parsed as Record<string, unknown>
  const market = (!somParsed.error && baseMarket && typeof baseMarket === "object")
    ? { ...(baseMarket as Record<string, unknown>), som: somParsed.som, somMethodology: somParsed.somMethodology }
    : baseMarket

  return {
    snapshot:       existingReport ? existingReport.snapshot : snapR.parsed,
    market,
    competitors:    existingReport ? existingReport.competitors : compR.parsed,
    entryScore:     entryR.parsed,
    verdict:        verdictR.parsed,
    devilsAdvocate: existingReport ? existingReport.devilsAdvocate : devilR.parsed,
    confidence: {
      snapshot:       existingReport ? (existingReport.confidence as Record<string, unknown>)?.snapshot : getConfidenceLevel(snapR.citations),
      market:         existingReport ? (existingReport.confidence as Record<string, unknown>)?.market : getConfidenceLevel(mktR.citations),
      competitors:    existingReport ? (existingReport.confidence as Record<string, unknown>)?.competitors : getConfidenceLevel(compR.citations),
      entryScore:     getConfidenceLevel(entryR.citations),
      verdict:        getConfidenceLevel(verdictR.citations),
      devilsAdvocate: existingReport ? (existingReport.confidence as Record<string, unknown>)?.devilsAdvocate : getConfidenceLevel(devilR.citations),
    },
    citations: {
      snapshot:       existingReport ? (existingReport.citations as Record<string, unknown>)?.snapshot : extractUrls(snapR.citations),
      market:         existingReport ? (existingReport.citations as Record<string, unknown>)?.market : extractUrls(mktR.citations),
      competitors:    existingReport ? (existingReport.citations as Record<string, unknown>)?.competitors : extractUrls(compR.citations),
      entryScore:     extractUrls(entryR.citations),
      verdict:        extractUrls(verdictR.citations),
      devilsAdvocate: existingReport ? (existingReport.citations as Record<string, unknown>)?.devilsAdvocate : extractUrls(devilR.citations),
    },
  }
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idea, survey, existingReport, stream: useStream } = body as {
      idea: string
      survey: Survey
      existingReport?: Record<string, unknown>
      stream?: boolean
    }

    if (!idea || typeof idea !== "string") {
      return NextResponse.json({ error: true, message: "Missing idea" }, { status: 400 })
    }

    const founderCtx = survey ? buildFounderContext(survey) : ""
    const geo = survey?.geography ?? "Global"

    const systemPrompt = (extra = "") =>
      `You are a senior startup analyst with live web access. ${founderCtx}${extra}
IMPORTANT RULES:
- If the idea is niche or hyper-specific, look at the broader parent market it belongs to and reason from there. Do NOT give up or return low scores just because direct data is scarce.
- Always provide substantive, specific insight — never generic filler like "market data unavailable".
- Scores should reflect real opportunity, not how much data exists about the niche.
Return JSON only. No markdown. No preamble. No explanation. Just the raw JSON object.`

    // ── Define all 6 calls ────────────────────────────────────────────────────

    const snapCall = existingReport
      ? Promise.resolve({ data: null, error: null })
      : callPerplexity([
          { role: "system", content: systemPrompt() },
          {
            role: "user",
            content: `For this startup idea: "${idea}"
Analyze it carefully. If the idea is niche, identify the specific problem it solves and the precise customer segment — do not generalize.

First reason through these 3 dimensions, then score each 0-10:
- problemClarity: How clearly is the problem defined? (1-3=vague, 4-6=clear enough, 7-10=razor sharp)
- solutionClarity: How clearly is the solution defined? (1-3=vague, 4-6=clear enough, 7-10=specific and concrete)
- customerClarity: How precisely is the target customer defined? (1-3=everyone/generic, 4-6=a segment, 7-10=a specific person with a specific pain)

Compute clarityScore as the average of the 3 sub-scores, rounded to 1 decimal.

Return this exact JSON:
{
  "oneLiner": string,
  "problem": string,
  "targetCustomer": string,
  "problemClarity": number,
  "solutionClarity": number,
  "customerClarity": number,
  "clarityScore": number
}`,
          },
        ])

    const mktCall = existingReport
      ? Promise.resolve({ data: null, error: null })
      : callPerplexity([
          { role: "system", content: systemPrompt() },
          {
            role: "user",
            content: `For this startup idea: "${idea}"

Work through this step by step before producing the JSON:

STEP 1 — MARKET CATEGORY: Identify the specific market category this idea belongs to. If niche, name the broader parent category (e.g. "AI-powered B2B workflow tools" not just "software"). Use this category for all sizing.

STEP 2 — TAM: Find the total global market size for this category using a cited industry report or analyst source (Gartner, IBISWorld, Grand View Research, Statista, etc.). State the source and year. Provide a single dollar figure. If no exact source exists, triangulate from adjacent data and say so.

STEP 3 — SAM: Narrow TAM by geography (${geo}) and by customer profile (who specifically can use this product). Explain the narrowing logic in one sentence.

STEP 4 — GROWTH: Find the CAGR for this market category. Express as a percentage (e.g. "34% CAGR").

STEP 5 — TIMING: Is this market Early (trend emerging, <20% adoption), Peak (mainstream, 20–60% adoption), or Late (mature, >60% adoption or declining)?

Return this exact JSON with no markdown, no preamble:
{
  "tam": string,
  "tamSource": string,
  "tamMethodology": string,
  "sam": string,
  "samMethodology": string,
  "growthRate": string,
  "marketTiming": "Early" | "Peak" | "Late",
  "marketTimingReason": string
}`,
          },
        ], "sonar-pro", 3000)

    const compCall = existingReport
      ? Promise.resolve({ data: null, error: null })
      : callPerplexity([
          { role: "system", content: systemPrompt() },
          {
            role: "user",
            content: `For this startup idea: "${idea}"
Find 3-5 real companies competing in this space. If there are no direct competitors, find adjacent competitors solving a related problem or serving the same customer. Include at least 3 entries — use adjacent market players if needed, and note that in their "name" field.
- "funding": total capital raised (e.g. "$12M Series A") or "Bootstrapped" if no funding
- "pricing": actual pricing tier or model (e.g. "$49/mo", "Freemium", "Enterprise only") — not vague descriptions
- "lastActivity": most recent notable event with year (e.g. "Series B raised 2024", "Acquired by Salesforce 2023", "Launched v2 2024")
- "gapStatement": one specific sentence naming what customer pain these solutions leave unaddressed and how this idea fills it

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
        ])

    const entryCall = callPerplexity([
      { role: "system", content: systemPrompt() },
      {
        role: "user",
        content: `For this startup idea: "${idea}"
${founderCtx}

Score how easy market entry is for THIS specific founder (higher = easier entry). Use these 4 dimensions, each 0-10:

- regulatoryScore: How free is this market from regulation/compliance barriers? (1-3=heavily regulated, 4-6=some compliance needed, 7-10=no significant regulation)
- capitalScore: How low are the capital requirements to get started? (1-3=needs $1M+, 4-6=needs $50K-$500K, 7-10=can start with <$10K)
- technicalScore: How achievable is the MVP technically for this founder's profile? (1-3=requires rare expertise, 4-6=hard but possible, 7-10=straightforward to build)
- competitionScore: How much room is there to enter given existing players? (1-3=dominated by giants, 4-6=competitive but beatable, 7-10=clear gap exists)

Compute entryScore as the average of the 4 sub-scores, rounded to 1 decimal.
List the 3 biggest real barriers and 2 genuine advantages specific to this founder's profile.

Return this exact JSON:
{
  "regulatoryScore": number,
  "capitalScore": number,
  "technicalScore": number,
  "competitionScore": number,
  "entryScore": number,
  "barriers": [string, string, string],
  "advantages": [string, string],
  "fastestEntryPath": string
}`,
      },
    ], "sonar-reasoning-pro")

    const verdictCall = callPerplexity([
      { role: "system", content: systemPrompt() },
      {
        role: "user",
        content: `For this startup idea: "${idea}"
${founderCtx}

Score viability using 4 dimensions, each 0-10:

- demandScore: Is there real, proven demand for this? (1-3=speculative/no evidence, 4-6=some signals, 7-10=strong evidence of demand. Reference: a todo app=3, Stripe in 2010=9)
- founderFitScore: How well does this founder's profile match what this idea needs? (1-3=major skill/resource gaps, 4-6=workable fit, 7-10=strong match. Reference: non-technical founder building dev tools=2, developer building dev tools=9)
- defensibilityScore: Can this build a moat over time? (1-3=easily copied, 4-6=some differentiation, 7-10=strong moat potential. Reference: generic SaaS dashboard=2, network-effect marketplace=9)
- monetizationScore: How clear and proven is the path to revenue? (1-3=unclear how to charge, 4-6=plausible model, 7-10=clear willingness to pay. Reference: free consumer app=2, B2B workflow tool=8)

Compute viabilityScore as the average of the 4 sub-scores, rounded to 1 decimal.
Then decide verdict: "GO" if viabilityScore >= 7.0, "CONDITIONAL GO" if >= 4.5, "NO-GO" if below.
topReasons: 3 specific reasons grounded in a real market dynamic, named competitor, or this founder's specific profile — not generic startup advice.
topRisks: 3 specific risks, each ending with one concrete mitigation this founder could take.
nextAction = the single most important thing this founder should do in the next 7 days. Be specific — name a channel, person type, or tool.

Return this exact JSON:
{
  "demandScore": number,
  "founderFitScore": number,
  "defensibilityScore": number,
  "monetizationScore": number,
  "viabilityScore": number,
  "verdict": "GO" | "CONDITIONAL GO" | "NO-GO",
  "topReasons": [string, string, string],
  "topRisks": [string, string, string],
  "nextAction": string
}`,
      },
    ], "sonar-reasoning-pro")

    const devilCall = existingReport
      ? Promise.resolve({ data: null, error: null })
      : callPerplexity([
          { role: "system", content: systemPrompt() },
          {
            role: "user",
            content: `For this startup idea: "${idea}"
Find 3 real companies that tried something similar and failed. If no direct matches exist, use companies that failed in the broader problem space or adjacent niche — always return exactly 3 entries.
- "what": one sentence on what they built and who they targeted
- "why": the specific decision, market condition, or structural flaw that killed them — not vague ("ran out of money") but precise ("burned on enterprise sales cycles with a consumer-priced product")
- "year": the year they shut down or pivoted away
- "thePattern": the single recurring failure mode across all 3 — what is the common trap?
- "survivalRule": one concrete, actionable thing THIS founder must do differently to avoid that fate

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
        ])

    // Always runs — SOM must reflect the current founder profile even on re-runs
    const somCall = callPerplexity([
      { role: "system", content: systemPrompt() },
      {
        role: "user",
        content: `For this startup idea: "${idea}"

What is the realistic SOM (Serviceable Obtainable Market) this specific founder can capture in the first 18 months?

Reason from their actual constraints:
- Budget: ${survey.budget}
- Stage: ${survey.stage}
- Network: ${survey.network}
- Geography: ${geo}

Do not use a generic percentage of TAM. Derive a specific dollar figure from what this founder can realistically sell, to how many customers, at what price point. A first-time founder with under $1K budget and no network realistically captures $10K–$50K. Be honest and specific.

Return this exact JSON:
{
  "som": string,
  "somMethodology": string
}`,
      },
    ])

    const allCalls = [snapCall, mktCall, compCall, entryCall, verdictCall, devilCall, somCall]

    // ── Streaming path ────────────────────────────────────────────────────────

    if (useStream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const send = (data: object) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }

          try {
            const results: ReturnType<typeof parseSection>[] = new Array(7)
            let completedCount = 0

            await Promise.all(
              allCalls.map((call, i) =>
                call.then((result) => {
                  results[i] = parseSection(result as { data: PerplexityResponse | null; error: string | null })
                  completedCount++
                  send({ type: "progress", step: completedCount })
                }).catch(() => {
                  results[i] = { parsed: { error: true, message: "Section unavailable" }, citations: [] }
                  completedCount++
                  send({ type: "progress", step: completedCount })
                })
              )
            )

            send({ type: "done", data: buildFinalResponse(results, existingReport) })
          } catch (err) {
            send({ type: "error", message: String(err) })
          }

          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      })
    }

    // ── Standard (non-streaming) path ─────────────────────────────────────────

    const rawResults = await Promise.all(allCalls)
    const results = rawResults.map((r) =>
      parseSection(r as { data: PerplexityResponse | null; error: string | null })
    )

    return NextResponse.json(buildFinalResponse(results, existingReport))
  } catch (err) {
    return NextResponse.json(
      { error: true, message: "Unexpected server error", detail: String(err) },
      { status: 500 }
    )
  }
}
