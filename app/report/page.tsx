"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, ArrowLeft, MoreHorizontal, Printer, Share2 } from "lucide-react"
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { viabilityWhenSaving } from "@/lib/viability-score"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  snapshot: {
    oneLiner: string
    problem: string
    targetCustomer: string
    clarityScore: number
  }
  market: {
    tam: string
    tamSource: string
    tamMethodology: string
    sam: string
    samMethodology: string
    som: string
    somMethodology: string
    growthRate: string
    marketTiming: "Early" | "Peak" | "Late"
    marketTimingReason: string
  }
  competitors: {
    competitors: {
      name: string
      website: string
      funding: string
      pricing: string
      lastActivity: string
    }[]
    gapStatement: string
  }
  entryScore: {
    entryScore: number
    barrierLevel: "Low" | "Medium" | "High" | "Very High"
    barriers: string[]
    advantages: string[]
    fastestEntryPath: string
  }
  verdict: {
    verdict: "GO" | "CONDITIONAL GO" | "NO-GO"
    viabilityScore: number
    topReasons: string[]
    topRisks: string[]
    nextAction: string
  }
  devilsAdvocate: {
    failures: {
      name: string
      what: string
      why: string
      year: string
    }[]
    thePattern: string
    survivalRule: string
  }
  confidence: Record<string, string>
  citations?: {
    snapshot?: string[]
    market?: string[]
    competitors?: string[]
    entryScore?: string[]
    verdict?: string[]
    devilsAdvocate?: string[]
  }
  sources?: { url: string; section: string }[]
}

interface Survey {
  stage: string
  technical: string
  budget: string
  time: string
  network: string
  geography: string
}

interface ChatMessage {
  role: "user" | "bot"
  content: string
}

const SURVEY_OPTIONS: Record<keyof Survey, string[]> = {
  stage: ["Just an idea", "Building MVP", "Have early users", "Pre-revenue", "Generating revenue"],
  technical: ["Non-technical", "Some technical skills", "Technical / developer", "Technical co-founder"],
  budget: ["Under $1K", "$1K – $10K", "$10K – $50K", "$50K – $100K", "$100K+"],
  time: ["A few hours a week", "Nights and weekends", "Part-time (20hrs/week)", "Full-time"],
  network: ["No connections", "A few contacts", "Active network in this space", "Deep domain expertise"],
  geography: ["United States", "North America", "Europe", "Asia Pacific", "Global", "Other"],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} style={{ color: "#ffffff", fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      : part
  )
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n").filter((l) => l.trim() !== "")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim()

        // Bullet line: starts with -
        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color: "var(--report-accent)", fontSize: 10, marginTop: 2, flexShrink: 0 }}>●</span>
              <span style={{ color: "var(--report-body)", fontSize: 12, lineHeight: 1.5 }}>{renderInline(trimmed.slice(2))}</span>
            </div>
          )
        }

        // Today line: starts with →
        if (trimmed.startsWith("→")) {
          return (
            <div key={i} style={{
              marginTop: 2,
              padding: "5px 8px",
              borderRadius: 6,
              background: "var(--report-elevated)",
              border: "1px solid var(--report-border)",
              fontSize: 11,
              color: "var(--report-orange)",
              lineHeight: 1.5,
            }}>
              {renderInline(trimmed)}
            </div>
          )
        }

        // Normal / bold heading line
        return (
          <p key={i} style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "var(--report-body)" }}>
            {renderInline(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

function extractGrowthRate(val: string): string {
  const match = val.match(/[\d.,]+\s*%/)
  return match ? match[0] : (val.length > 15 ? val.slice(0, 15) + "…" : val)
}

function buildTrendData(growthRate: string, timing: string) {
  const match = growthRate.match(/([\d.]+)/)
  const rate = match ? parseFloat(match[1]) / 100 : 0.15
  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]
  let base = 100
  return years.map((year, i) => {
    const noise = 1 + (Math.sin(i * 2.3) * 0.04)
    const multiplier = timing === "Late" ? Math.max(1, 1 + rate * noise * (1 - i * 0.08)) : 1 + rate * noise
    if (i > 0) base = base * multiplier
    return { year, value: Math.round(base) }
  })
}

function TrendChart({ growthRate, timing }: { growthRate: string; timing: string }) {
  const data = buildTrendData(growthRate, timing)
  const gradId = useId().replace(/:/g, "")
  // Teal = growth / early; amber = mature peak; slate = late — avoids “error” red for positive memos
  const color =
    timing === "Early" ? "#14b8a6" : timing === "Peak" ? "#f59e0b" : "#94a3b8"
  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#555]">Market trend</p>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: "#aaa" }}
            itemStyle={{ color }}
            formatter={(v: number) => [`${v}`, "Index"]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function extractMarketValue(val: string): string {
  if (!val) return "—"
  const dollarMatch = val.match(/\$([\d.,]+)\s*([BMKTbmkt]+)/)
  if (dollarMatch) {
    const suffix = dollarMatch[2].toUpperCase().replace("T", "T").replace("B", "B").replace("M", "M").replace("K", "K")
    return `$${dollarMatch[1]}${suffix[0]}`
  }
  const usdMatch = val.match(/USD\s*([\d.,]+)\s*(trillion|billion|million|thousand)/i)
  if (usdMatch) {
    const num = usdMatch[1]
    const unit = usdMatch[2].toLowerCase()
    const suffix = unit === "trillion" ? "T" : unit === "billion" ? "B" : unit === "million" ? "M" : "K"
    return `$${num}${suffix}`
  }
  const numMatch = val.match(/([\d.,]+)\s*(trillion|billion|million|thousand)/i)
  if (numMatch) {
    const num = numMatch[1]
    const unit = numMatch[2].toLowerCase()
    const suffix = unit === "trillion" ? "T" : unit === "billion" ? "B" : unit === "million" ? "M" : "K"
    return `$${num}${suffix}`
  }
  return val.length > 12 ? val.slice(0, 12) + "…" : val
}

// ─── Count-up animation hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target * 10) / 10)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return val
}

// ─── Score helpers ────────────────────────────────────────────────────────────

// viabilityScore is 0–10; entryScore is 0–10
function safeScore(raw: unknown): number {
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
  if (isNaN(n)) return 5
  return Math.round(n * 10) / 10
}

// Entry: out of 10
function getBarrierLevel(score: number): string {
  if (score >= 8) return "Low barrier"
  if (score >= 6) return "Medium barrier"
  if (score >= 4) return "High barrier"
  return "Very high barrier"
}

function getBarrierColors(score: number) {
  if (score >= 8)
    return { bg: "rgba(20,184,166,0.1)", color: "var(--landing-accent)", border: "rgba(20,184,166,0.3)", bar: "var(--landing-accent)" }
  if (score >= 6)
    return { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.3)", bar: "#fbbf24" }
  return { bg: "rgba(230,57,70,0.12)", color: "var(--report-accent-bright)", border: "rgba(230,57,70,0.3)", bar: "var(--report-accent-bright)" }
}


// ─── Small shared components ──────────────────────────────────────────────────

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-[5px] h-[5px] rounded-full shrink-0 mt-[5px]"
      style={{ background: color }}
    />
  )
}

// ─── Memo hero (dossier-style) ────────────────────────────────────────────────

function ReportHero({
  snapshot,
  verdict,
  onViewCitations,
  reportDateStr,
}: {
  snapshot: ReportData["snapshot"]
  verdict: ReportData["verdict"]
  onViewCitations: () => void
  reportDateStr: string
}) {
  const viabilityScore = safeScore(verdict.viabilityScore)
  const animScore = useCountUp(viabilityScore, 900)
  const verdictText = typeof verdict.verdict === "string" ? verdict.verdict.trim() : ""
  const verdictBadgeClass =
    verdictText === "GO"
      ? "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-400 bg-teal-500/10 border border-teal-500/30"
      : verdictText === "CONDITIONAL GO"
        ? "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30"
        : verdictText
          ? "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-400 bg-red-500/10 border border-red-500/30"
          : ""

  return (
    <div className="rounded-2xl border border-[#1e1e1e] bg-[#111] p-6 mb-4 print:break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        {verdictText ? (
          <span role="status" className={`min-w-[7.5rem] self-start text-center ${verdictBadgeClass}`}>
            {verdictText}
          </span>
        ) : null}
        <div className="text-right">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555]">Viability score</p>
          <p className="text-3xl font-bold tabular-nums leading-none text-white md:text-4xl">
            {(Math.round(animScore * 10) / 10).toFixed(1)}
            <span className="text-xl font-semibold text-[#555] md:text-2xl">/10</span>
          </p>
        </div>
      </div>
      <h1 className="mb-4 max-w-xl text-2xl font-bold leading-snug text-white">{snapshot.oneLiner}</h1>
      {verdict.topReasons?.[0] && (
        <p className="mb-5 text-[15px] leading-relaxed text-[#aaa]">{verdict.topReasons[0]}</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] px-3 py-2.5">
        <span className="text-[11px] leading-snug text-[#555]">
          Sources cited in memo · {reportDateStr}
        </span>
        <button
          type="button"
          onClick={onViewCitations}
          className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-teal-400 transition hover:opacity-90"
        >
          View citations
        </button>
      </div>
    </div>
  )
}

// ─── Left Panel — Idea Profile Tab ───────────────────────────────────────────

function IdeaProfileTab({
  survey,
  onFieldSelect,
}: {
  survey: Survey
  onFieldSelect: (key: keyof Survey, value: string) => void
}) {
  const [openField, setOpenField] = useState<keyof Survey | null>(null)

  const rows: { label: string; key: keyof Survey }[] = [
    { label: "Stage", key: "stage" },
    { label: "Technical", key: "technical" },
    { label: "Budget", key: "budget" },
    { label: "Time", key: "time" },
    { label: "Network", key: "network" },
    { label: "Geography", key: "geography" },
  ]

  const initials =
    `${survey.stage?.[0] ?? "?"}${survey.geography?.[0] ?? "?"}`.toUpperCase()

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#444]">YOUR FOUNDER PROFILE</p>
      <div className="flex flex-col divide-y divide-[#1a1a1a]">
        {rows.map(({ label, key }) => (
          <div key={key} className="flex flex-col">
            <button
              type="button"
              onClick={() => setOpenField(openField === key ? null : key)}
              className="flex items-center justify-between py-2 text-left"
            >
              <span className="text-[10px] uppercase tracking-widest text-[#444] w-20 shrink-0">{label}</span>
              <span className="flex-1 truncate text-xs font-semibold text-white">{survey[key]}</span>
              <span className="ml-2 text-[10px] text-[#333]">{openField === key ? "▲" : "▼"}</span>
            </button>
            {openField === key && (
              <div className="flex flex-wrap gap-1 pb-2">
                {SURVEY_OPTIONS[key].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setOpenField(null); onFieldSelect(key, opt) }}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] transition-colors"
                    style={{
                      background: survey[key] === opt ? "var(--report-accent)" : "transparent",
                      borderColor: survey[key] === opt ? "var(--report-accent)" : "var(--report-border)",
                      color: survey[key] === opt ? "#ffffff" : "var(--report-body)",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2.5 border-t border-[#1a1a1a] pt-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] text-xs font-semibold text-white">
          A
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white">Analyst</p>
          <p className="text-[10px] text-[#444]">Standard Tier</p>
        </div>
      </div>
    </div>
  )
}

// ─── Left Panel — Sources Tab ─────────────────────────────────────────────────

function SourcesTab({ report }: { report: ReportData }) {
  const SECTION_LABELS: Record<string, string> = {
    snapshot: "Idea Snapshot",
    market: "Market",
    competitors: "Competitors",
    entryScore: "Entry Score",
    verdict: "Verdict",
    devilsAdvocate: "Devil's Advocate",
  }

  // Build sources from citations object (new API) or legacy sources array
  const allSources: { url: string; section: string }[] = []

  if (report.citations) {
    for (const [key, urls] of Object.entries(report.citations)) {
      if (urls && urls.length > 0) {
        urls.forEach((url) => {
          if (url) allSources.push({ url, section: SECTION_LABELS[key] ?? key })
        })
      }
    }
  }

  // Fallback: legacy sources array
  if (allSources.length === 0 && report.sources && report.sources.length > 0) {
    report.sources.forEach((s) => allSources.push(s))
  }

  // Fallback: competitor websites
  if (allSources.length === 0 && report.competitors?.competitors) {
    report.competitors.competitors.forEach((c) => {
      if (c.website) {
        const url = c.website.startsWith("http") ? c.website : `https://${c.website}`
        allSources.push({ url, section: "Competitors" })
      }
    })
  }

  if (allSources.length === 0) {
    return (
      <div className="px-4 py-4 text-[11px] text-[#555]">No sources available for this report.</div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {allSources.map((s, i) => {
        let domain = s.url
        try { domain = new URL(s.url).hostname } catch {}
        const truncatedUrl = s.url.length > 50 ? s.url.slice(0, 50) + "…" : s.url
        return (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-bold rounded px-1 py-0.5 shrink-0"
                style={{ background: "var(--report-accent-dim)", color: "var(--report-orange)" }}
              >
                [{i + 1}]
              </span>
              <span className="text-[11px] font-semibold text-white">{domain}</span>
            </div>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] hover:underline pl-6"
              style={{ color: "var(--report-orange)" }}
            >
              {truncatedUrl}
            </a>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded self-start ml-6"
              style={{ background: "var(--report-accent-dim)", color: "var(--report-orange)" }}
            >
              {s.section}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Left Panel — Chatbot ─────────────────────────────────────────────────────

function Chatbot({
  report,
  inputValue,
  onInputChange,
  inputRef,
}: {
  report: ReportData
  inputValue: string
  onInputChange: (v: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [chatHeight, setChatHeight] = useState(80)
  const chatHeightRef = useRef(80)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const rafRef = useRef<number | null>(null)

  function onDragStart(e: React.MouseEvent) {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startHeight: chatHeightRef.current }
    document.body.style.cursor = "ns-resize"
    document.body.style.userSelect = "none"

    function onMouseMove(ev: MouseEvent) {
      if (!dragRef.current) return
      if (rafRef.current) return // skip if frame pending
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        if (!dragRef.current) return
        const delta = dragRef.current.startY - ev.clientY
        const next = Math.min(480, Math.max(80, dragRef.current.startHeight + delta))
        chatHeightRef.current = next
        // Write directly to DOM — no React re-render during drag
        if (chatScrollRef.current) chatScrollRef.current.style.height = `${next}px`
      })
    }

    function onMouseUp() {
      // Commit final value to React state once on release
      setChatHeight(chatHeightRef.current)
      dragRef.current = null
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const SUGGESTIONS = [
    "Why this score?",
    "Biggest risk to fix",
    "Compare with Segment Median",
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: "user", content: text }
    const history = messages.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.content,
    }))
    setMessages((prev) => [...prev, userMsg])
    onInputChange("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, reportContext: report, history }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col border-t border-[#1e1e1e] px-4 pb-4 pt-4">
      <div
        onMouseDown={onDragStart}
        className="flex cursor-ns-resize select-none items-center justify-center border-b border-[#1a1a1a] py-2 transition-colors hover:border-[#2a2a2a]"
        title="Drag to resize"
      >
        <div className="h-[2px] w-6 rounded-full bg-[#222]" />
      </div>

      <div className="flex items-center gap-2 pt-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[9px] font-bold text-[#0d0d0d]">
          V
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white">Dossier AI</p>
      </div>

      {messages.length === 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="w-full rounded-xl border border-[#1e1e1e] bg-transparent px-4 py-3 text-left text-sm text-[#888] transition hover:border-[#3a3a3a] hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={(el) => {
          ;(scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          ;(chatScrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        className="mt-3 flex flex-col gap-1.5 overflow-y-auto"
        style={{ height: messages.length > 0 ? chatHeight : 0, minHeight: messages.length > 0 ? 120 : 0 }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-1.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "bot" && (
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[8px] font-bold text-[#0d0d0d]">
                V
              </div>
            )}
            <div
              className="max-w-[85%] rounded-md border border-[#1e1e1e] px-2.5 py-1.5"
              style={{
                fontSize: "13px",
                lineHeight: "1.75",
                background: m.role === "bot" ? "#111" : "#0d0d0d",
                color: m.role === "bot" ? "#aaa" : "#e5e5e5",
              }}
            >
              {m.role === "bot" ? renderMarkdown(m.content) : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1.5">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[8px] font-bold text-[#0d0d0d]">
              V
            </div>
            <div className="rounded-md border border-[#1e1e1e] bg-[#111] px-2 py-1.5 text-[12px] text-[#666]">Thinking…</div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage(inputValue)
          }}
          placeholder="Type a command…"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#333]"
        />
        <button
          type="button"
          onClick={() => sendMessage(inputValue)}
          title="Send message"
          aria-label="Send message"
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[#0d0d0d] transition-opacity hover:opacity-90"
        >
          <ArrowUp size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

// ─── Report Cards ─────────────────────────────────────────────────────────────

function CardShell({
  sectionNum,
  title,
  confidence,
  onEdit,
  children,
  dangerBorder,
  anchorId,
  showConfidencePill = true,
}: {
  sectionNum?: string
  title: string
  confidence?: string
  onEdit?: () => void
  children: React.ReactNode
  dangerBorder?: boolean
  anchorId?: string
  showConfidencePill?: boolean
}) {
  const heading = sectionNum ? `${sectionNum} | ${title.toUpperCase()}` : title
  return (
    <div
      id={anchorId}
      className={`mb-4 flex flex-col rounded-2xl border border-[#1e1e1e] bg-[#111] p-6 print:break-inside-avoid ${
        dangerBorder ? "ring-1 ring-red-500/25" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white">{heading}</span>
      </div>
      {confidence && showConfidencePill ? (
        <div className="-mt-2 mb-4">
          <span className="inline-block rounded-full border border-[#2a2a2a] px-3 py-1 text-[10px] text-[#666]">
            CONFIDENCE · {confidence.toUpperCase()}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  )
}

function Card1Snapshot({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["snapshot"]
  confidence: string
  onEdit: () => void
}) {
  const clarityUnit = data.clarityScore <= 1 ? data.clarityScore : data.clarityScore / 10
  const clarityHigh = data.clarityScore >= 8 || clarityUnit >= 0.8
  const clarityModerate = data.clarityScore >= 4 || clarityUnit >= 0.4
  const clarityShort = clarityHigh ? "HIGH" : clarityModerate ? "MODERATE" : "LOW"
  const problemDefined = Boolean(data.problem?.trim())
  const customerDefined = Boolean(data.targetCustomer?.trim())

  return (
    <CardShell
      sectionNum="01"
      title="Snapshot"
      onEdit={onEdit}
      anchorId="report-section-snapshot"
      showConfidencePill={false}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">
            CORE PROBLEM · {problemDefined ? "DEFINED" : "NOT DEFINED"}
          </p>
          <p className="text-sm leading-relaxed text-[#aaa]">{data.problem?.trim() || "—"}</p>
        </div>
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">
            PRIMARY CUSTOMER · {customerDefined ? "DEFINED" : "NOT DEFINED"}
          </p>
          <p className="text-sm leading-relaxed text-[#aaa]">{data.targetCustomer?.trim() || "—"}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full border border-[#2a2a2a] px-3 py-1 text-[10px] text-[#666]">
          CLARITY · {clarityShort}
        </span>
        <span className="inline-block rounded-full border border-[#2a2a2a] px-3 py-1 text-[10px] text-[#666]">
          CONFIDENCE · {confidence.toUpperCase()}
        </span>
      </div>
    </CardShell>
  )
}

function Card2Market({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["market"]
  confidence: string
  onEdit: () => void
}) {
  return (
    <CardShell sectionNum="02" title="Market opportunity" confidence={confidence} onEdit={onEdit} anchorId="report-section-market">
      <div className="grid grid-cols-3 divide-x divide-[#1e1e1e] rounded-xl border border-[#1e1e1e] bg-[#0d0d0d]">
        {[
          { label: "TAM", desc: "Total addressable market", value: data.tam, methodology: data.tamMethodology, source: data.tamSource },
          { label: "SAM", desc: "Serviceable addressable market", value: data.sam, methodology: data.samMethodology, source: undefined },
          { label: "SOM", desc: "Serviceable obtainable market", value: data.som, methodology: data.somMethodology, source: undefined },
        ].map(({ label, desc, value, methodology, source }) => (
          <div key={label} className="flex flex-col p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">{label}</span>
            <span className="text-[28px] font-bold tabular-nums text-white leading-none">{extractMarketValue(value)}</span>
            <span className="mt-1 text-[11px] text-[#555]">{desc}</span>
            {methodology && (
              <p className="mt-3 text-[11px] leading-relaxed text-[#444] border-t border-[#1a1a1a] pt-3">{methodology}</p>
            )}
            {source && (
              <p className="mt-1 text-[10px] text-[#333] italic">{source}</p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">Path</p>
          <p className="m-0 text-[14px] font-medium leading-snug text-white">
            {data.growthRate ? `${extractGrowthRate(data.growthRate)} growth curve` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">Timing</p>
          <p className="m-0 text-[14px] font-medium leading-snug text-white">
            {data.marketTiming ? `${data.marketTiming} stage` : "—"}
            {data.marketTiming === "Late" ? " / consolidation" : ""}
          </p>
        </div>
      </div>
      {data.growthRate ? <TrendChart growthRate={data.growthRate} timing={data.marketTiming ?? "Early"} /> : null}
      <p className="mt-5 max-w-3xl text-[15px] font-normal leading-relaxed text-[#aaa]">{data.marketTimingReason}</p>
    </CardShell>
  )
}

function competitorImpactLabel(i: number): { label: string; color: string } {
  if (i === 0) return { label: "High impact", color: "var(--report-accent-bright)" }
  if (i === 1) return { label: "Mid impact", color: "var(--report-orange)" }
  return { label: "Low impact", color: "var(--report-muted)" }
}

function Card3Competitors({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["competitors"]
  confidence: string
  onEdit: () => void
}) {
  return (
    <CardShell sectionNum="03" title="Competitors" confidence={confidence} onEdit={onEdit} anchorId="report-section-due">
      <div className="flex flex-col divide-y" style={{ borderColor: "var(--report-border)" }}>
        {(data.competitors ?? []).map((c, i) => {
          const imp = competitorImpactLabel(i)
          return (
            <div
              key={i}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              style={{ borderColor: "var(--report-border)" }}
            >
              <div className="flex flex-col gap-0.5 min-w-0 max-w-2xl">
                <span className="text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                  {c.name}
                </span>
                <span style={{ fontSize: "13px", color: "var(--report-muted)" }}>
                  {c.funding} · {c.pricing} · {c.lastActivity}
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide" style={{ color: imp.color }}>
                {imp.label}
              </span>
            </div>
          )
        })}
      </div>
      <div
        className="rounded-md p-3 mt-3"
        style={{ background: "var(--report-elevated)", border: "1px solid var(--report-border)" }}
      >
        <p className="font-bold mb-1.5" style={{ fontSize: "11px", color: "var(--landing-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Gap identified
        </p>
        <p style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.75", color: "var(--report-body)" }}>
          {data.gapStatement}
        </p>
      </div>
    </CardShell>
  )
}

function Card4EntryScore({
  data,
  confidence,
  onEdit,
  nextAction,
}: {
  data: ReportData["entryScore"]
  confidence: string
  onEdit: () => void
  nextAction?: string
}) {
  const score = safeScore(data.entryScore)
  const bc = getBarrierColors(score)
  return (
    <CardShell sectionNum="04" title="Entry strategy" confidence={confidence} onEdit={onEdit}>
      {/* Score + bar row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span style={{ fontSize: "36px", fontWeight: 700, color: bc.color, lineHeight: 1 }}>
          {score}<span style={{ fontSize: "16px", fontWeight: 400, color: "var(--report-muted)" }}>/10</span>
        </span>
        <span
          className="px-2.5 py-1 rounded-full font-semibold"
          style={{ fontSize: "11px", background: bc.bg, color: bc.color, border: `1px solid ${bc.border}` }}
        >
          {getBarrierLevel(score)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p style={{ fontSize: "12px", color: "var(--report-muted)" }}>Based on your founder profile</p>
        <div className="w-full" style={{ height: "4px", background: "var(--report-border)", borderRadius: "99px" }}>
          <div style={{ width: `${(score / 10) * 100}%`, height: "100%", borderRadius: "99px", background: bc.bar }} />
        </div>
        <div className="flex justify-between">
          <span style={{ fontSize: "10px", color: "var(--report-muted)" }}>Low Risk</span>
          <span style={{ fontSize: "10px", color: "var(--report-muted)" }}>High Risk</span>
        </div>
      </div>

      {/* Two-column: barriers + advantages */}
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="flex flex-col gap-2">
          <p className="uppercase tracking-widest" style={{ fontSize: "10px", fontWeight: 700, color: "var(--report-muted)" }}>Barriers</p>
          {(data.barriers ?? []).map((b, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Dot color="var(--report-accent-bright)" />
              <span style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-body)" }}>{b}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="uppercase tracking-widest" style={{ fontSize: "10px", fontWeight: 700, color: "var(--report-muted)" }}>Advantages</p>
          {(data.advantages ?? []).map((a, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Dot color="var(--landing-accent)" />
              <span style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-body)" }}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {data.fastestEntryPath ? (
        <div className="rounded-md p-3 mt-1" style={{ background: "var(--report-elevated)", border: "1px solid var(--report-border)" }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
            Fastest entry path
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.75", color: "var(--report-body)" }}>{data.fastestEntryPath}</p>
        </div>
      ) : null}

      {nextAction ? (
        <div className="rounded-md p-3 mt-1" style={{ background: "var(--report-elevated)", border: "1px solid var(--report-border)" }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
            Next action
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.75", color: "var(--report-body)" }}>{nextAction}</p>
        </div>
      ) : null}
    </CardShell>
  )
}

function KillCriteriaCard({
  data,
  confidence,
  onEdit,
  anchorId,
}: {
  data: ReportData["verdict"]
  confidence: string
  onEdit: () => void
  anchorId?: string
}) {
  const risks = data.topRisks ?? []
  if (risks.length === 0) return null
  return (
    <CardShell sectionNum="05" title="Kill criteria" confidence={confidence} onEdit={onEdit} dangerBorder anchorId={anchorId}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--report-accent-bright)" }}>
        We&apos;d change our mind if…
      </p>
      <ol className="m-0 list-decimal space-y-2 pl-5" style={{ color: "var(--report-body)", fontSize: 15, lineHeight: 1.65 }}>
        {risks.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ol>
    </CardShell>
  )
}

function Card6DevilsAdvocate({
  data,
  confidence,
  onEdit,
  anchorId,
}: {
  data: ReportData["devilsAdvocate"]
  confidence: string
  onEdit: () => void
  anchorId?: string
}) {
  return (
    <CardShell sectionNum="06" title="Devil's advocate" confidence={confidence} onEdit={onEdit} anchorId={anchorId}>
      <div className="flex flex-col divide-y divide-[#1e1e1e]">
        {(data.failures ?? []).map((f, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr] gap-6 py-4 first:pt-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--report-accent-bright)" }}>
                  Failed
                </span>
                {f.year ? <span className="text-[10px] text-[#444]">{f.year}</span> : null}
              </div>
              <span className="font-bold text-white" style={{ fontSize: "15px" }}>{f.name}</span>
              <p className="mt-1.5" style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-muted)" }}>{f.what}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
                So what for you
              </p>
              <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-body)" }}>{f.why}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-[#1e1e1e] bg-[#0d0d0d] p-4 mt-2">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
          The pattern
        </p>
        <p style={{ fontSize: "14px", lineHeight: "1.75", color: "var(--report-body)" }}>{renderMarkdown(data.thePattern)}</p>
      </div>

      {data.survivalRule && (
        <p className="italic mt-3 border-l-2 border-[#2a2a2a] pl-4" style={{ fontSize: "13px", lineHeight: "1.75", color: "var(--report-muted)" }}>
          {renderMarkdown(data.survivalRule)}
        </p>
      )}
    </CardShell>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const router = useRouter()
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const [report, setReport] = useState<ReportData | null>(null)
  const [idea, setIdea] = useState("")
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "sources">("profile")
  const [chatInput, setChatInput] = useState("")
  const [pdfLoading, setPdfLoading] = useState(false)
  const [reportDate, setReportDate] = useState<string>("")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [activeNavKey, setActiveNavKey] = useState<"snapshot" | "market" | "due" | "risk">("snapshot")

  useEffect(() => {
    const raw = localStorage.getItem("validateiq_report")
    const ideaStr = localStorage.getItem("validateiq_idea") ?? ""
    const surveyStr = localStorage.getItem("validateiq_survey")
    const demo = localStorage.getItem("isDemoMode") === "true"

    if (!raw) {
      router.replace("/workspace")
      return
    }

    try {
      const parsed = stripCitations(JSON.parse(raw)) as ReportData
      const surveyParsed: Survey = surveyStr ? JSON.parse(surveyStr) : null
      setReport(parsed)
      setIdea(ideaStr)
      setSurvey(surveyParsed)
      setIsDemoMode(demo)

      // Save to persistent saved reports — deduplicate by idea text (normalized)
      const existing = JSON.parse(localStorage.getItem("validateiq_saved_reports") || "[]")
      const normalizedIdea = ideaStr.trim().toLowerCase()
      const newEntry = {
        id: Date.now().toString(),
        idea: ideaStr,
        date: new Date().toISOString(),
        verdict: parsed.verdict?.verdict ?? "CONDITIONAL GO",
        viabilityScore: viabilityWhenSaving(parsed.verdict),
        report: parsed,
        survey: surveyParsed,
      }
      // Remove any existing entry with the same idea, then prepend the latest
      const deduped = (existing as { idea: string }[]).filter(
        (r) => r.idea.trim().toLowerCase() !== normalizedIdea
      )
      const updated = [newEntry, ...deduped].slice(0, 10)
      localStorage.setItem("validateiq_saved_reports", JSON.stringify(updated))
      setReportDate(newEntry.date)
    } catch {
      router.replace("/workspace")
    }
  }, [router])

  function focusChatInput(msg: string) {
    setChatInput(msg)
    setTimeout(() => {
      chatInputRef.current?.focus()
      chatInputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 50)
  }

  async function handleDownloadPDF() {
    if (!rightPanelRef.current || pdfLoading) return
    setPdfLoading(true)
    try {
      const { toPng } = await import("html-to-image")
      const { default: jsPDF } = await import("jspdf")

      const element = rightPanelRef.current

      // Expand overflow so full content renders, not just the visible portion
      const prevOverflow = element.style.overflowY
      const prevHeight = element.style.height
      const prevMaxHeight = element.style.maxHeight
      element.style.overflowY = "visible"
      element.style.height = "auto"
      element.style.maxHeight = "none"
      await new Promise((resolve) => setTimeout(resolve, 80))

      const domWidth = element.scrollWidth
      const domHeight = element.scrollHeight

      const dataUrl = await toPng(element, {
        backgroundColor: "var(--report-bg)",
        pixelRatio: 2,
        width: domWidth,
        height: domHeight,
      }).finally(() => {
        element.style.overflowY = prevOverflow
        element.style.height = prevHeight
        element.style.maxHeight = prevMaxHeight
      })

      // Now create the PDF using the locked mathematical dimensions
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calculate the image's height in PDF pixels (maintaining exact aspect ratio of the 800px element)
      const imgHeight = (domHeight * pdfWidth) / domWidth

      let heightLeft = imgHeight
      let position = 0

      // Add the first page
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight)
      heightLeft -= pdfHeight

      // Loop for subsequent pages
      while (heightLeft > 10) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      const slug = idea.split(" ").slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "")
      pdf.save(`Verdict-${slug || "Report"}.pdf`)
    } catch (err) {
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleFieldSelect(key: keyof Survey, value: string) {
    if (!survey || !idea) return
    const updatedSurvey = { ...survey, [key]: value }
    setSurvey(updatedSurvey)
    localStorage.setItem("validateiq_survey", JSON.stringify(updatedSurvey))
    setIsRegenerating(true)
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, survey: updatedSurvey, existingReport: report }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const reportData = await res.json()
      const parsed = stripCitations(reportData) as ReportData
      setReport(parsed)
      localStorage.setItem("validateiq_report", JSON.stringify(parsed))
      toast.success("Report updated.")
    } catch {
      toast.error("Failed to regenerate. Please try again.")
    } finally {
      setIsRegenerating(false)
    }
  }

  function handleRevalidate() {
    localStorage.removeItem("validateiq_report")
    localStorage.removeItem("validateiq_idea")
    localStorage.removeItem("validateiq_survey")
    localStorage.removeItem("isDemoMode")
    localStorage.removeItem("demoIdea")
    router.push("/workspace")
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.share) {
        await navigator.share({ title: "Verdict memo", text: idea || "Validation report", url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied")
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ""
      if (name === "AbortError") return
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied")
      } catch {
        toast.error("Could not share")
      }
    }
  }

  if (!report || !survey) {
    return (
      <div
        className="flex items-center justify-center min-h-screen text-sm"
        style={{ background: "var(--report-bg)", color: "var(--report-muted)" }}
      >
        Loading…
      </div>
    )
  }

  const CARD_EDIT_MESSAGES: Record<string, string> = {
    snapshot: "Edit the idea snapshot — help me refine my one-liner to be more specific and compelling",
    market: "Edit market signals — re-run the market sizing with different geography or a broader market definition",
    competitors: "Edit competitor intel — find more specific or different competitors in my exact space",
    entryScore: "Edit market entry score — recalculate based on my updated founder profile and resources",
    verdict: "Edit verdict — explain the viability score in detail and what changes would improve it",
    devilsAdvocate: "Edit devil's advocate — find different or more recent failure examples in my category",
  }

  const memoDateStr = reportDate
    ? new Date(reportDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Today"

  const hasKillRisks = (report.verdict.topRisks ?? []).length > 0

  const NAV_LINKS: { key: "snapshot" | "market" | "due" | "risk"; label: string; id: string }[] = [
    { key: "snapshot", label: "SNAPSHOT", id: "report-section-snapshot" },
    { key: "market", label: "MARKET", id: "report-section-market" },
    { key: "due", label: "DUE DILIGENCE", id: "report-section-due" },
    { key: "risk", label: "RISK", id: "report-section-risk" },
  ]

  function goNavSection(key: "snapshot" | "market" | "due" | "risk", id: string) {
    setActiveNavKey(key)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0d0d0d]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {isRegenerating && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)" }}
        >
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "var(--report-accent)",
              borderRightColor: "color-mix(in srgb, var(--report-accent) 32%, transparent)",
            }}
          />
          <p className="text-[13px] text-[#aaa]">Regenerating report…</p>
        </div>
      )}

      <header className="print-hide flex shrink-0 items-center justify-between gap-4 border-b border-[#1e1e1e] bg-[#0d0d0d] px-6 py-3">
        <div className="min-w-0 shrink">
          <span className="block text-sm font-bold uppercase tracking-widest text-white">INTELLIGENCE MEMO</span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[#555]">
            {memoDateStr} · 6 SECTIONS · {survey.geography}
          </span>
        </div>
        <nav className="hidden min-w-0 flex-1 justify-center gap-1 lg:flex" aria-label="Section navigation">
          {NAV_LINKS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => goNavSection(item.key, item.id)}
              className={`cursor-pointer px-3 pb-[11px] text-xs uppercase tracking-widest transition ${
                activeNavKey === item.key
                  ? "border-b border-teal-400 text-white"
                  : "border-b border-transparent text-[#555] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleRevalidate}
            className="rounded-lg border border-[#2a2a2a] bg-transparent px-3 py-1.5 text-xs uppercase text-white transition hover:bg-white/5"
          >
            RE-VALIDATE
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            aria-label={pdfLoading ? "Generating PDF…" : "Print or save PDF"}
            className="inline-flex items-center justify-center rounded-lg border border-[#2a2a2a] bg-transparent px-3 py-1.5 text-white transition hover:bg-white/5 disabled:opacity-60"
          >
            {pdfLoading ? <span className="text-xs">…</span> : <Printer size={16} strokeWidth={1.75} />}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            aria-label="Share memo"
            className="inline-flex items-center justify-center rounded-lg border border-[#2a2a2a] bg-transparent px-3 py-1.5 text-white transition hover:bg-white/5"
          >
            <Share2 size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="More options"
            className="inline-flex items-center justify-center rounded-lg border border-[#2a2a2a] bg-transparent px-3 py-1.5 text-white transition hover:bg-white/5"
          >
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <div ref={rightPanelRef} className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#0d0d0d] px-8 py-6">
          {isDemoMode && (
            <div
              className="text-[10px] px-3 py-1.5 rounded-md border"
              style={{ background: "var(--report-surface)", borderColor: "var(--report-border)", color: "var(--report-orange)", borderWidth: "0.5px" }}
            >
              Demo mode — results are pre-loaded for speed
            </div>
          )}
          <ReportHero
            snapshot={report.snapshot}
            verdict={report.verdict}
            onViewCitations={() => setActiveTab("sources")}
            reportDateStr={memoDateStr}
          />
          <Card1Snapshot
            data={report.snapshot}
            confidence={report.confidence?.snapshot ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.snapshot)}
          />
          <Card2Market
            data={report.market}
            confidence={report.confidence?.market ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.market)}
          />
          <Card3Competitors
            data={report.competitors}
            confidence={report.confidence?.competitors ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.competitors)}
          />
          <Card4EntryScore
            data={report.entryScore}
            confidence={report.confidence?.entryScore ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.entryScore)}
            nextAction={report.verdict.nextAction}
          />
          <KillCriteriaCard
            data={report.verdict}
            confidence={report.confidence?.verdict ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.verdict)}
            anchorId={hasKillRisks ? "report-section-risk" : undefined}
          />
          <Card6DevilsAdvocate
            data={report.devilsAdvocate}
            confidence={report.confidence?.devilsAdvocate ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.devilsAdvocate)}
            anchorId={!hasKillRisks ? "report-section-risk" : undefined}
          />
        </div>

        <aside className="print-hide flex w-[340px] shrink-0 flex-col overflow-hidden border-l border-[#1e1e1e] bg-[#0d0d0d]">
          <div className="flex shrink-0 items-start justify-between border-b border-[#1e1e1e] px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/workspace")}
                  aria-label="Back to Workspace"
                  className="text-[#555] transition hover:text-white"
                  title="Back to Workspace"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="text-base font-bold text-white">VERDICT</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" aria-hidden />
                <span className="text-[10px] uppercase tracking-wider text-teal-400">Forensic analysis active</span>
              </div>
            </div>
          </div>

          <div role="tablist" className="flex shrink-0 border-b border-[#1e1e1e]">
            {(["profile", "sources"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab ? true : false}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition ${
                  activeTab === tab
                    ? "border-b-2 border-teal-400 text-white"
                    : "border-b-2 border-transparent text-[#444]"
                }`}
              >
                {tab === "profile" ? "Idea profile" : "SOURCES"}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeTab === "profile" ? (
              <IdeaProfileTab survey={survey} onFieldSelect={handleFieldSelect} />
            ) : (
              <SourcesTab report={report} />
            )}
          </div>

          <Chatbot report={report} inputValue={chatInput} onInputChange={setChatInput} inputRef={chatInputRef} />
        </aside>
      </div>
    </div>
  )
}
