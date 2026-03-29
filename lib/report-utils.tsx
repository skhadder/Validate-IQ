"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

// ─── Text / citation helpers ──────────────────────────────────────────────────

export function stripCitations(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\[\d+\]/g, "").trim()
  if (Array.isArray(value)) return value.map(stripCitations)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stripCitations(v)])
    )
  }
  return value
}

export function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} style={{ color: "#ffffff", fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      : part
  )
}

export function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n").filter((l) => l.trim() !== "")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim()

        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color: "var(--report-accent)", fontSize: 10, marginTop: 2, flexShrink: 0 }}>●</span>
              <span style={{ color: "var(--report-body)", fontSize: 12, lineHeight: 1.5 }}>{renderInline(trimmed.slice(2))}</span>
            </div>
          )
        }

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

        return (
          <p key={i} style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "var(--report-body)" }}>
            {renderInline(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

// ─── Market chart helpers ─────────────────────────────────────────────────────

export function extractGrowthRate(val: string): string {
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

export function TrendChart({ growthRate, timing }: { growthRate: string; timing: string }) {
  const data = buildTrendData(growthRate, timing)
  const gradId = useId().replace(/:/g, "")
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

export function extractMarketValue(val: string): string {
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

export function useCountUp(target: number, duration = 1000) {
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

export function safeScore(raw: unknown): number {
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
  if (isNaN(n)) return 5
  return Math.round(n * 10) / 10
}

export function getBarrierLevel(score: number): string {
  if (score >= 8) return "Low barrier"
  if (score >= 6) return "Medium barrier"
  if (score >= 4) return "High barrier"
  return "Very high barrier"
}

export function getBarrierColors(score: number) {
  if (score >= 8)
    return { bg: "rgba(20,184,166,0.1)", color: "var(--landing-accent)", border: "rgba(20,184,166,0.3)", bar: "var(--landing-accent)" }
  if (score >= 6)
    return { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.3)", bar: "#fbbf24" }
  return { bg: "rgba(230,57,70,0.12)", color: "var(--report-accent-bright)", border: "rgba(230,57,70,0.3)", bar: "var(--report-accent-bright)" }
}

// ─── Shared micro-components ──────────────────────────────────────────────────

export function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-[5px] h-[5px] rounded-full shrink-0 mt-[5px]"
      style={{ background: color }}
    />
  )
}
