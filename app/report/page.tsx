"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, ArrowLeft, Home } from "lucide-react"
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

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
    sam: string
    som: string
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
              <span style={{ color: "#10B981", fontSize: 10, marginTop: 2, flexShrink: 0 }}>●</span>
              <span style={{ color: "#9CA3AF", fontSize: 12, lineHeight: 1.5 }}>{renderInline(trimmed.slice(2))}</span>
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
              background: "#111318",
              border: "1px solid #2A2D35",
              fontSize: 11,
              color: "#34D399",
              lineHeight: 1.5,
            }}>
              {renderInline(trimmed)}
            </div>
          )
        }

        // Normal / bold heading line
        return (
          <p key={i} style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "#9CA3AF" }}>
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
  const color = timing === "Early" ? "#60A5FA" : timing === "Peak" ? "#FCD34D" : "#F87171"
  return (
    <div>
      <p className="uppercase tracking-wide mb-2" style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>
        Market trend
      </p>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#4B5563" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#4B5563" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#1C1F26", border: "1px solid #2A2D35", borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: "#9CA3AF" }}
            itemStyle={{ color }}
            formatter={(v: number) => [`${v}`, "Index"]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#trendGrad)" dot={false} />
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
  const rafRef = useRef<number>()
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

// viabilityScore is 0-9; entryScore is 0-10
function safeScore(raw: unknown): number {
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
  if (isNaN(n)) return 5
  return Math.round(n * 10) / 10
}

// Viability: out of 9
function getVerdict(score: number): string {
  if (score >= 7) return "GO"
  if (score >= 4.5) return "CONDITIONAL GO"
  return "NO-GO"
}

function getVerdictColors(score: number) {
  if (score >= 7) return { bg: "#052E16", color: "#4ADE80", border: "1px solid #16A34A" }
  if (score >= 4.5) return { bg: "#1C1007", color: "#FCD34D", border: "1px solid #92400E" }
  return { bg: "#1C0507", color: "#F87171", border: "1px solid #991B1B" }
}

// Entry: out of 10
function getBarrierLevel(score: number): string {
  if (score >= 8) return "Low barrier"
  if (score >= 6) return "Medium barrier"
  if (score >= 4) return "High barrier"
  return "Very high barrier"
}

function getBarrierColors(score: number) {
  if (score >= 8) return { bg: "#052E16", color: "#4ADE80", border: "#16A34A" }
  if (score >= 6) return { bg: "#1C1007", color: "#FCD34D", border: "#92400E" }
  return { bg: "#1C0507", color: "#F87171", border: "#991B1B" }
}


// ─── Small shared components ──────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: string }) {
  const styles =
    level === "High"
      ? { color: "#4ADE80", background: "#052E16", border: "0.5px solid #166534" }
      : level === "Medium"
      ? { color: "#FCD34D", background: "#1C1007", border: "0.5px solid #92400E" }
      : { color: "#F87171", background: "#1C0507", border: "0.5px solid #991B1B" }
  return (
    <span className="px-2 py-0.5 rounded-full font-semibold" style={{ fontSize: "10px", ...styles }}>
      {level} confidence
    </span>
  )
}

function EditButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border transition-colors"
      style={{ fontSize: "10px", color: "#6B7280", borderColor: "#2A2D35", background: "transparent", padding: "3px 10px" }}
    >
      Edit
    </button>
  )
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-[5px] h-[5px] rounded-full shrink-0 mt-[5px]"
      style={{ background: color }}
    />
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ verdict, entryScore }: { verdict: ReportData["verdict"]; entryScore: ReportData["entryScore"] }) {
  const viabilityScore = safeScore(verdict.viabilityScore)
  const entryScoreNum = safeScore(entryScore.entryScore)
  const vc = getVerdictColors(viabilityScore)
  const bc = getBarrierColors(entryScoreNum)

  const animViability = useCountUp(viabilityScore)
  const animEntry = useCountUp(entryScoreNum)

  const [barReady, setBarReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setBarReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="rounded-lg border flex flex-col"
      style={{ background: "#1C1F26", borderColor: "#2A2D35", borderWidth: "0.5px", padding: "16px 18px", marginBottom: "12px" }}
    >
      <div className="flex items-start flex-wrap mb-3">
        {/* Verdict */}
        <div className="flex flex-col mr-6 mb-4">
          <span className="uppercase mb-1" style={{ fontSize: "10px", fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em" }}>Verdict</span>
          <span
            className="px-3 py-1 rounded-md self-start uppercase tracking-wide"
            style={{ fontSize: "14px", fontWeight: 700, color: vc.color, background: vc.bg, border: vc.border }}
          >
            {getVerdict(viabilityScore)}
          </span>
        </div>
        {/* Viability Score */}
        <div className="flex flex-col mr-6 mb-4">
          <span className="uppercase mb-1" style={{ fontSize: "10px", fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em" }}>Viability Score</span>
          <span className="mb-1" style={{ fontSize: "36px", fontWeight: 700, lineHeight: 1, color: vc.color, display: "block" }}>
            {animViability}<span style={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}>/9</span>
          </span>
          <div className="w-24 rounded-full mt-1" style={{ height: "6px", background: "#2A2D35", borderRadius: "99px" }}>
            <div style={{ width: barReady ? `${(viabilityScore / 9) * 100}%` : "0%", height: "100%", borderRadius: "99px", background: vc.color, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <div className="flex justify-between w-24">
            <span style={{ fontSize: "8px", color: "#6B7280" }}>Low</span>
            <span style={{ fontSize: "8px", color: "#6B7280" }}>High</span>
          </div>
        </div>
        {/* Entry Score */}
        <div className="flex flex-col mb-4">
          <span className="uppercase mb-1" style={{ fontSize: "10px", fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em" }}>Entry Score</span>
          <span className="mb-1" style={{ fontSize: "36px", fontWeight: 700, lineHeight: 1, color: bc.color, display: "block" }}>
            {animEntry}<span style={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}>/10</span>
          </span>
          <div className="w-24 rounded-full mt-1" style={{ height: "6px", background: "#2A2D35", borderRadius: "99px" }}>
            <div style={{ width: barReady ? `${(entryScoreNum / 10) * 100}%` : "0%", height: "100%", borderRadius: "99px", background: bc.color, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <div className="flex justify-between w-24">
            <span style={{ fontSize: "8px", color: "#6B7280" }}>Low</span>
            <span style={{ fontSize: "8px", color: "#6B7280" }}>High</span>
          </div>
        </div>
      </div>
      {verdict.nextAction && (
        <>
          <div className="h-px w-full" style={{ background: "#2A2D35" }} />
          <p style={{ fontSize: "12px", lineHeight: "1.65", color: "#9CA3AF" }}>
            <span style={{ color: "#10B981", fontWeight: 600 }}>→ Next: </span>
            {verdict.nextAction}
          </p>
        </>
      )}
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

  return (
    <div className="px-3 py-2 flex-1 overflow-y-auto">
      <p className="uppercase mb-3" style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.08em" }}>
        Your founder profile
      </p>
      <div className="flex flex-col gap-1.5">
        {rows.map(({ label, key }) => (
          <div key={key} className="flex flex-col gap-1">
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2.5 border"
              style={{
                background: "#1C1F26",
                borderColor: openField === key ? "#10B981" : "#2A2D35",
              }}
            >
              <span className="shrink-0 mr-3" style={{ fontSize: "12px", color: "#6B7280" }}>
                {label}
              </span>
              <span className="font-semibold text-white flex-1 truncate mr-2" style={{ fontSize: "15px" }}>
                {survey[key]}
              </span>
              <EditButton
                onClick={() => setOpenField(openField === key ? null : key)}
              />
            </div>

            {openField === key && (
              <div
                className="rounded-md border p-2 flex flex-wrap gap-1"
                style={{ background: "#111318", borderColor: "#2A2D35" }}
              >
                {SURVEY_OPTIONS[key].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setOpenField(null)
                      onFieldSelect(key, opt)
                    }}
                    className="rounded-full border px-3 py-1 transition-colors text-left"
                    style={{
                      fontSize: "12px",
                      background: survey[key] === opt ? "#10B981" : "transparent",
                      borderColor: survey[key] === opt ? "#10B981" : "#2A2D35",
                      color: survey[key] === opt ? "#ffffff" : "#9CA3AF",
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
      <div className="px-3 py-4 text-[11px]" style={{ color: "#6B7280" }}>
        No sources available for this report.
      </div>
    )
  }

  return (
    <div className="px-3 py-2 flex-1 overflow-y-auto flex flex-col gap-3">
      {allSources.map((s, i) => {
        let domain = s.url
        try { domain = new URL(s.url).hostname } catch {}
        const truncatedUrl = s.url.length > 50 ? s.url.slice(0, 50) + "…" : s.url
        return (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-bold rounded px-1 py-0.5 shrink-0"
                style={{ background: "rgba(5,150,105,0.15)", color: "#34D399" }}
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
              style={{ color: "#34D399" }}
            >
              {truncatedUrl}
            </a>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded self-start ml-6"
              style={{ background: "rgba(5,150,105,0.1)", color: "#34D399" }}
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
  const [chatHeight, setChatHeight] = useState(200)
  const chatHeightRef = useRef(200)
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
    "How do I get first customers?",
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
    <div className="border-t flex flex-col gap-2" style={{ borderColor: "#2A2D35" }}>
      {/* Drag handle */}
      <div
        onMouseDown={onDragStart}
        className="flex flex-col items-center justify-center gap-1 py-2 cursor-ns-resize select-none hover:bg-[#1C1F26] transition-colors"
        style={{ borderBottom: "1px solid #2A2D35" }}
        title="Drag to resize"
      >
        <div className="w-8 h-[3px] rounded-full" style={{ background: "#3A3D45" }} />
        <div className="w-8 h-[3px] rounded-full" style={{ background: "#3A3D45" }} />
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3">
        <p className="uppercase" style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.08em" }}>
          Ask Verdict
        </p>

        {/* Suggestion pills */}
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-3 py-1 rounded-full border transition-colors hover:border-[#10B981] hover:text-white"
              style={{ fontSize: "12px", borderColor: "#2A2D35", color: "#6B7280", background: "transparent" }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Message area */}
        <div
          ref={(el) => { (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el; (chatScrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el }}
          className="flex flex-col gap-1.5 overflow-y-auto"
          style={{ height: chatHeight, minHeight: 80 }}
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-1.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "bot" && (
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5"
                  style={{ background: "#10B981" }}
                >
                  V
                </div>
              )}
              <div
                className="px-2.5 py-1.5 rounded-md border max-w-[85%]"
                style={{
                  fontSize: "13px",
                  lineHeight: "1.75",
                  background: m.role === "bot" ? "#1C1F26" : "#111318",
                  borderColor: "#2A2D35",
                  color: m.role === "bot" ? "#9CA3AF" : "#E4E4E7",
                }}
              >
                {m.role === "bot" ? renderMarkdown(m.content) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-1.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                style={{ background: "#10B981" }}
              >
                V
              </div>
              <div
                className="px-2 py-1.5 rounded-md border"
                style={{ fontSize: "12px", background: "#1C1F26", borderColor: "#2A2D35", color: "#6B7280" }}
              >
                Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Input row */}
        <div className="flex gap-1.5 items-center">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage(inputValue)
            }}
            placeholder="Ask anything about your report…"
            className="flex-1 px-2 py-1.5 rounded-md border outline-none"
            style={{
              fontSize: "13px",
              background: "#1C1F26",
              borderColor: "#2A2D35",
              color: "#9CA3AF",
            }}
          />
          <button
            onClick={() => sendMessage(inputValue)}
            title="Send message"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center shrink-0 transition-opacity hover:opacity-80"
            style={{ background: "#10B981" }}
          >
            <ArrowUp size={12} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Report Cards ─────────────────────────────────────────────────────────────

function CardShell({
  title,
  confidence,
  onEdit,
  children,
}: {
  title: string
  confidence?: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg border flex flex-col gap-3"
      style={{
        background: "#1C1F26",
        borderColor: "#2A2D35",
        borderWidth: "0.5px",
        padding: "16px 18px",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-white" style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.2px" }}>{title}</span>
        <div className="flex items-center gap-1.5">
          {confidence && confidence !== "High" && <ConfidenceBadge level={confidence} />}
        </div>
      </div>
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
  return (
    <CardShell title="Idea snapshot" confidence={confidence} onEdit={onEdit}>
      <p style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.75", color: "#E4E4E7" }}>
        {data.oneLiner}
      </p>
      <div className="flex flex-col gap-2">
        <p style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>
          <span style={{ color: "#34D399", fontWeight: 600 }}>Problem: </span>
          {data.problem}
        </p>
        <p style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>
          <span style={{ color: "#60A5FA", fontWeight: 600 }}>Customer: </span>
          {data.targetCustomer}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {(() => {
          const clarityColors =
            data.clarityScore >= 8
              ? { bg: "rgba(5,150,105,0.12)", border: "#10B98140", color: "#34D399" }
              : data.clarityScore >= 4
              ? { bg: "rgba(180,120,0,0.12)", border: "#92400E40", color: "#FCD34D" }
              : { bg: "rgba(153,27,27,0.12)", border: "#991B1B40", color: "#F87171" }
          return (
            <span
              className="px-2 py-0.5 rounded-full border font-medium"
              style={{ fontSize: "12px", background: clarityColors.bg, borderColor: clarityColors.border, color: clarityColors.color }}
            >
              Clarity {data.clarityScore}/10
            </span>
          )
        })()}
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
    <CardShell title="Market signals" confidence={confidence} onEdit={onEdit}>
      <div
        className="grid grid-cols-3 gap-1 rounded-md p-2"
        style={{ background: "#111318" }}
      >
        {[
          { label: "TAM", desc: "Total addressable market", value: data.tam },
          { label: "SAM", desc: "Serviceable addressable market", value: data.sam },
          { label: "SOM", desc: "Serviceable obtainable market", value: data.som },
        ].map(({ label, desc, value }) => (
          <div key={label} className="flex flex-col items-center py-1">
            <span className="font-bold text-white" style={{ fontSize: "28px" }}>
              {extractMarketValue(value)}
            </span>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>{label}</span>
            <span style={{ fontSize: "11px", color: "#4B5563" }} className="text-center mt-0.5">{desc}</span>
          </div>
        ))}
      </div>
      {data.growthRate && (
        <TrendChart growthRate={data.growthRate} timing={data.marketTiming ?? "Early"} />
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        {data.growthRate && (
          <span
            style={{ fontSize: "13px", fontWeight: 500, padding: "4px 12px", borderRadius: "99px", background: "#052E16", color: "#4ADE80" }}
          >
            {extractGrowthRate(data.growthRate)}
          </span>
        )}
        {data.marketTiming && (
          <span
            style={{
              fontSize: "13px", fontWeight: 500, padding: "4px 12px", borderRadius: "99px",
              background: data.marketTiming === "Early" ? "#0A1E3A" : data.marketTiming === "Peak" ? "#1C1007" : "#1C0507",
              color: data.marketTiming === "Early" ? "#60A5FA" : data.marketTiming === "Peak" ? "#FCD34D" : "#F87171",
            }}
          >
            {data.marketTiming} stage
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { label: "TAM", desc: "Everyone who could ever use this" },
          { label: "SAM", desc: "The slice you can realistically reach" },
          { label: "SOM", desc: "What you can capture in year 1–3" },
        ].map(({ label, desc }) => (
          <span
            key={label}
            style={{ fontSize: "13px", padding: "4px 12px", borderRadius: "99px", background: "#1C1F26", color: "#6B7280", border: "1px solid #2A2D35" }}
          >
            <span style={{ color: "#9CA3AF", fontWeight: 600 }}>{label}</span> — {desc}
          </span>
        ))}
      </div>
      <p style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>
        {data.marketTimingReason}
      </p>
    </CardShell>
  )
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
    <CardShell title="Competitor intel" confidence={confidence} onEdit={onEdit}>
      <div className="flex flex-col divide-y" style={{ borderColor: "#2A2D35" }}>
        {(data.competitors ?? []).map((c, i) => (
          <div
            key={i}
            className="flex items-start justify-between py-1.5 first:pt-0 last:pb-0"
            style={{ borderColor: "#2A2D35" }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                {c.name}
              </span>
              <span style={{ fontSize: "13px", color: "#6B7280" }}>
                {c.funding} · {c.pricing} · {c.lastActivity}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        className="rounded-md p-2 mt-1"
        style={{ background: "#111318", border: "0.5px solid #2A2D35" }}
      >
        <p className="font-bold mb-1" style={{ fontSize: "12px", color: "#34D399" }}>
          Gap identified
        </p>
        <p style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>
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
}: {
  data: ReportData["entryScore"]
  confidence: string
  onEdit: () => void
}) {
  const score = safeScore(data.entryScore)
  const bc = getBarrierColors(score)
  return (
    <CardShell title="Market entry score" confidence={confidence} onEdit={onEdit}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: "36px", fontWeight: 700, color: bc.color }}>
          {score}<span style={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}>/10</span>
        </span>
        <span
          className="px-2 py-0.5 rounded-full font-medium"
          style={{ fontSize: "10px", background: bc.bg, color: bc.color, border: `0.5px solid ${bc.border}` }}
        >
          {getBarrierLevel(score)}
        </span>
      </div>
      <p style={{ fontSize: "13px", color: "#6B7280" }}>Based on your founder profile</p>
      <div className="w-full" style={{ height: "6px", background: "#2A2D35", borderRadius: "99px" }}>
        <div style={{ width: `${(score / 10) * 100}%`, height: "100%", borderRadius: "99px", background: bc.color }} />
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: "11px", color: "#6B7280" }}>Low Risk</span>
        <span style={{ fontSize: "11px", color: "#6B7280" }}>High Risk</span>
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        <p className="uppercase tracking-wide" style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>Barriers</p>
        {(data.barriers ?? []).map((b, i) => (
          <div key={i} className="flex gap-1.5 items-start">
            <Dot color="#F87171" />
            <span style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>{b}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        <p className="uppercase tracking-wide" style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>Advantages</p>
        {(data.advantages ?? []).map((a, i) => (
          <div key={i} className="flex gap-1.5 items-start">
            <Dot color="#34D399" />
            <span style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>{a}</span>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

function Card5Verdict({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["verdict"]
  confidence: string
  onEdit: () => void
}) {
  const score = safeScore(data.viabilityScore)
  const vc = getVerdictColors(score)

  return (
    <CardShell title="Go / No-Go verdict" confidence={confidence} onEdit={onEdit}>
      <div
        className="inline-flex items-center px-3 py-1 rounded-md self-start uppercase tracking-wide"
        style={{ background: vc.bg, border: vc.border }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: vc.color }}>
          {getVerdict(score)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="uppercase" style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em" }}>Viability score</span>
        <span style={{ fontSize: "36px", fontWeight: 700, color: vc.color }}>
          {score}<span style={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}>/9</span>
        </span>
      </div>
      <div className="w-full" style={{ height: "6px", background: "#2A2D35", borderRadius: "99px" }}>
        <div style={{ width: `${(score / 9) * 100}%`, height: "100%", borderRadius: "99px", background: vc.color }} />
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: "11px", color: "#6B7280" }}>Low Risk</span>
        <span style={{ fontSize: "11px", color: "#6B7280" }}>High Risk</span>
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        <p className="uppercase tracking-wide" style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>
          Why this verdict
        </p>
        {(data.topReasons ?? []).map((r, i) => (
          <div key={i} className="flex gap-1.5 items-start">
            <Dot color="#34D399" />
            <span style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>{r}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        <p className="uppercase tracking-wide" style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>
          Key risks
        </p>
        {(data.topRisks ?? []).map((r, i) => (
          <div key={i} className="flex gap-1.5 items-start">
            <Dot color="#F87171" />
            <span style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>{r}</span>
          </div>
        ))}
      </div>
      {data.nextAction && (
        <div
          className="rounded-md p-2 mt-1"
          style={{ background: "#111318", border: "0.5px solid #2A2D35" }}
        >
          <p className="font-bold mb-1" style={{ fontSize: "12px", color: "#34D399" }}>Next action</p>
          <p style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.75", color: "#9CA3AF" }}>{data.nextAction}</p>
        </div>
      )}
    </CardShell>
  )
}

function Card6DevilsAdvocate({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["devilsAdvocate"]
  confidence: string
  onEdit: () => void
}) {
  return (
    <CardShell title="Devil's advocate" confidence={confidence} onEdit={onEdit}>
      <div className="flex flex-col gap-2">
        {(data.failures ?? []).map((f, i) => (
          <div
            key={i}
            className="rounded-md p-2 border"
            style={{ background: "#0D0808", borderColor: "#2A0A0A" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold" style={{ fontSize: "15px", color: "#F87171" }}>{f.name}</span>
              <span style={{ fontSize: "13px", color: "#6B7280" }}>{f.year}</span>
            </div>
            <p className="mb-0.5" style={{ fontSize: "15px", lineHeight: "1.7", color: "#6B7280" }}>
              <span className="font-bold" style={{ color: "#9CA3AF" }}>What: </span>{f.what}
            </p>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#6B7280" }}>
              <span className="font-bold" style={{ color: "#9CA3AF" }}>Why: </span>{f.why}
            </p>
          </div>
        ))}
      </div>
      <div
        className="rounded-md p-2 border mt-1"
        style={{ background: "#0A0808", borderColor: "#2A0A0A" }}
      >
        <p className="font-bold mb-1" style={{ fontSize: "12px", color: "#F87171" }}>The pattern</p>
        <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#6B7280" }}>{data.thePattern}</p>
      </div>
      {data.survivalRule && (
        <p className="italic mt-1" style={{ fontSize: "15px", lineHeight: "1.7", color: "#6B7280" }}>
          {data.survivalRule}
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
        viabilityScore: parsed.verdict?.viabilityScore ?? 0,
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
        backgroundColor: "#000000",
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

  if (!report || !survey) {
    return (
      <div
        className="flex items-center justify-center min-h-screen text-sm"
        style={{ background: "#000000", color: "#6B7280" }}
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

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#000000", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 border-r overflow-hidden print-hide"
        style={{ width: 300, background: "#000000", borderColor: "#2A2D35" }}
      >
        {/* Logo + idea */}
        <div className="flex items-center justify-between px-3 py-3.5 border-b shrink-0" style={{ borderColor: "#2A2D35", minHeight: 56 }}>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-base font-bold text-white">Verdict</span>
            <p className="text-xs line-clamp-1" style={{ color: "#6B7280" }}>
              {idea}
            </p>
          </div>
          <button
            onClick={() => router.push("/workspace")}
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-white/10 ml-2"
            style={{ color: "#9CA3AF" }}
            title="Back to Workspace"
          >
            <ArrowLeft size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0" style={{ borderColor: "#2A2D35" }}>
          {(["profile", "sources"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-sm font-medium transition-colors border-b-[3px]"
              style={{
                borderColor: activeTab === tab ? "#10B981" : "transparent",
                color: activeTab === tab ? "#ffffff" : "#6B7280",
              }}
            >
              {tab === "profile" ? "Idea profile" : "Sources / Citations"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "profile" ? (
            <IdeaProfileTab
              survey={survey}
              onFieldSelect={handleFieldSelect}
            />
          ) : (
            <SourcesTab report={report} />
          )}
        </div>

        {/* Chatbot */}
        <Chatbot
          report={report}
          inputValue={chatInput}
          onInputChange={setChatInput}
          inputRef={chatInputRef}
        />
      </aside>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {isRegenerating && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)" }}
          >
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "#10B981", borderRightColor: "rgba(16,185,129,0.3)" }}
            />
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Regenerating report…</p>
          </div>
        )}
        {/* Topbar */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b shrink-0 print-hide"
          style={{ borderColor: "#2A2D35", minHeight: 56 }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-white">Validation report</span>
            <span className="text-xs" style={{ color: "#6B7280" }}>
              {reportDate
                ? `Generated ${new Date(reportDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "Generated today"}{" "}
              · 6 sections · {survey.geography} market
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "#6B7280" }}
              title="Home"
            >
              <Home size={16} />
            </button>
            <button
              onClick={handleRevalidate}
              className="text-sm px-3.5 py-1.5 rounded-md border transition-colors hover:border-[#10B98140]"
              style={{ borderColor: "#2A2D35", color: "#9CA3AF" }}
            >
              Re-validate
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="text-sm px-3.5 py-1.5 rounded-md font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-60"
              style={{ background: "#10B981" }}
            >
              {pdfLoading ? "Generating…" : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Scrolling report content */}
        <div
          ref={rightPanelRef}
          className="flex-1 overflow-y-auto flex flex-col gap-3.5"
          style={{ padding: "16px 18px" }}
        >
          {isDemoMode && (
            <div
              className="text-[10px] px-3 py-1.5 rounded-md border"
              style={{ background: "#1C1F26", borderColor: "#2A2D35", color: "#34D399", borderWidth: "0.5px" }}
            >
              Demo mode — results are pre-loaded for speed
            </div>
          )}
          <SummaryCard verdict={report.verdict} entryScore={report.entryScore} />
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
          />
          <Card5Verdict
            data={report.verdict}
            confidence={report.confidence?.verdict ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.verdict)}
          />
          <Card6DevilsAdvocate
            data={report.devilsAdvocate}
            confidence={report.confidence?.devilsAdvocate ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.devilsAdvocate)}
          />
        </div>
      </div>

    </div>
  )
}
