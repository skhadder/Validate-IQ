"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type ReactNode } from "react"
import { BarChart3, Download, FileText, Gauge, Radar, Scale, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const cardBase =
  "group rounded-xl border border-[#122B1A] bg-[#0A1A10] p-6 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[#059669]/60"

function IconBox({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#122B1A] bg-[#000000] text-[#6B7280] [&_svg]:h-5 [&_svg]:w-5">
      {children}
    </div>
  )
}

function ThreatBadge({ level }: { level: "high" | "med" | "low" }) {
  const styles = {
    high: "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/25",
    med: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/25",
    low: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/25",
  }
  const label = { high: "High", med: "Med", low: "Low" }[level]
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        styles[level],
      )}
    >
      {label}
    </span>
  )
}

function CompetitorRadarMock() {
  const rows = [
    { name: "StackPilot", level: "high" as const },
    { name: "NimbusOps", level: "med" as const },
    { name: "LeanSync", level: "low" as const },
    { name: "FlowDesk", level: "high" as const },
    { name: "Orbitly", level: "med" as const },
    { name: "PulseKit", level: "low" as const },
  ]
  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
      {rows.map((row) => (
        <div
          key={row.name}
          className="flex items-center justify-between gap-2 rounded-lg border border-[#122B1A] bg-[#000000] px-2.5 py-2 sm:px-3"
        >
          <span className="truncate text-xs font-medium text-[#FFFFFF]">{row.name}</span>
          <ThreatBadge level={row.level} />
        </div>
      ))}
    </div>
  )
}

function MarketSizingMock() {
  const bars = [
    { label: "TAM", value: "$12.4B", width: "100%" },
    { label: "SAM", value: "$2.1B", width: "42%" },
    { label: "SOM", value: "$89M", width: "18%" },
  ]
  return (
    <div className="mt-6 space-y-4">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-[#6B7280]">{b.label}</span>
            <span className="tabular-nums text-[#FFFFFF]">{b.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#000000]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#34D399] transition-all duration-500"
              style={{ width: b.width }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function GapScoreMock() {
  const pct = 72
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  return (
    <div className="mt-6 flex items-center justify-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" fill="none" r={r} stroke="#122B1A" strokeWidth="8" />
          <circle
            cx="44"
            cy="44"
            fill="none"
            r={r}
            stroke="#059669"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="8"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-white">7.2</span>
          <span className="text-[10px] uppercase tracking-wider text-[#52525b]">/ 10</span>
        </div>
      </div>
    </div>
  )
}

function VerdictMock() {
  return (
    <div className="mt-6 space-y-3">
      <span className="inline-flex items-center rounded-md border border-[#22c55e]/35 bg-[#22c55e]/10 px-3 py-1.5 text-sm font-bold tracking-wide text-[#22c55e]">
        GO
      </span>
      <p className="text-xs leading-relaxed text-[#6B7280]">
        Strong pull from SMBs; differentiation is clear vs. incumbents — proceed with a focused MVP.
      </p>
    </div>
  )
}

function TrendPulseMock() {
  return (
    <div className="mt-6">
      <svg viewBox="0 0 120 48" className="h-20 w-full" aria-hidden>
        <line x1="0" y1="40" x2="120" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="8" y1="4" x2="8" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <polyline
          fill="none"
          points="8,32 28,28 48,30 68,18 88,14 108,10"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          fill="none"
          points="8,36 28,34 48,22 68,26 88,20 108,24"
          stroke="#34D399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[#6B7280]">
        <span>Search</span>
        <span>Funding</span>
      </div>
    </div>
  )
}

function ExportMock() {
  return (
    <div className="mt-6 rounded-lg border border-[#122B1A] bg-[#000000] p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-[#122B1A] pb-2">
        <FileText className="h-4 w-4 text-[#059669]" strokeWidth={1.5} />
        <span className="text-xs font-medium text-[#FFFFFF]">Validation_Report.pdf</span>
      </div>
      <div className="mb-4 space-y-1.5">
        <div className="h-1.5 w-full rounded bg-[rgba(255,255,255,0.08)]" />
        <div className="h-1.5 w-[80%] rounded bg-[rgba(255,255,255,0.06)]" />
        <div className="h-1.5 w-[55%] rounded bg-[rgba(255,255,255,0.05)]" />
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#059669]/40 bg-[#059669]/15 py-2 text-xs font-medium text-[#34D399] transition-colors hover:bg-[#059669]/25"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} />
        Download PDF
      </button>
    </div>
  )
}

export function BentoGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      id="features"
      className="bg-[#000000] px-4 py-24 [font-family:var(--font-inter),system-ui,sans-serif]"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to decide in 60 seconds.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#6B7280] sm:text-lg">
            Not a chatbot. Not a template. A structured intelligence report — built for people who ship.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-4 lg:grid-cols-4"
        >
          {/* Row 1 — large cards */}
          <motion.article variants={itemVariants} className={cn(cardBase, "lg:col-span-2")}>
            <IconBox>
              <Radar strokeWidth={1.5} />
            </IconBox>
            <h3 className="text-lg font-semibold text-white sm:text-xl">Competitor Radar</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Instantly surface who&apos;s in the space, what they charge, and where they&apos;re weak. Know your
              battlefield before you write a line of code.
            </p>
            <CompetitorRadarMock />
          </motion.article>

          <motion.article variants={itemVariants} className={cn(cardBase, "lg:col-span-2")}>
            <IconBox>
              <BarChart3 strokeWidth={1.5} />
            </IconBox>
            <h3 className="text-lg font-semibold text-white sm:text-xl">Market Sizing Engine</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              TAM, SAM, SOM — in plain English, not consultant-speak. See if the opportunity is worth chasing before
              you build.
            </p>
            <MarketSizingMock />
          </motion.article>

          {/* Row 2 — small cards */}
          <motion.article variants={itemVariants} className={cardBase}>
            <IconBox>
              <Gauge strokeWidth={1.5} />
            </IconBox>
            <h3 className="text-lg font-semibold text-white">
              Gap Score<sup className="text-xs text-[#059669]">™</sup>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              A 0–10 signal showing how much unmet demand exists. The higher, the bigger your opening.
            </p>
            <GapScoreMock />
          </motion.article>

          <motion.article variants={itemVariants} className={cardBase}>
            <IconBox>
              <Scale strokeWidth={1.5} />
            </IconBox>
            <h3 className="text-lg font-semibold text-white">Go / No-Go Verdict</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              A direct call — Go, Pivot, or No-Go — with a one-paragraph rationale you can paste into your pitch deck.
            </p>
            <VerdictMock />
          </motion.article>

          <motion.article variants={itemVariants} className={cardBase}>
            <IconBox>
              <TrendingUp strokeWidth={1.5} />
            </IconBox>
            <h3 className="text-lg font-semibold text-white">Trend Pulse</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              See if your idea is riding a wave or dying one. Search trends + VC funding signals, overlaid.
            </p>
            <TrendPulseMock />
          </motion.article>

          <motion.article variants={itemVariants} className={cardBase}>
            <IconBox>
              <Download strokeWidth={1.5} />
            </IconBox>
            <h3 className="text-lg font-semibold text-white">One-Click Export</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Download a clean PDF report. Drop it in your deck. Use it as your founding brief.
            </p>
            <ExportMock />
          </motion.article>
        </motion.div>
      </div>
    </section>
  )
}
