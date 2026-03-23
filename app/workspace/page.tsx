"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { LogoMark } from "@/components/logo-mark"
import {
  Star,
  Zap,
  ArrowUp,
  Plus,
  BookOpen,
  ArrowLeft,
  Trash2,
  Home,
} from "lucide-react"
import demoData from "@/lib/demo-data.json"

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = "empty" | "survey" | "loading"

interface SurveyAnswers {
  stage: string
  technical: string
  budget: string
  time: string
  network: string
  geography: string
}

interface SavedReport {
  id: string
  idea: string
  date: string
  verdict: string
  viabilityScore: number
  report: object
  survey: object
  starred?: boolean
}

const DEFAULT_SURVEY: SurveyAnswers = {
  stage: "Just an idea",
  technical: "Non-technical",
  budget: "Under $1K",
  time: "None — complete outsider",
  network: "No connections",
  geography: "United States",
}

const SURVEY_QUESTIONS: {
  key: keyof SurveyAnswers
  label: string
  options: string[]
}[] = [
  {
    key: "stage",
    label: "Where are you in the journey?",
    options: ["Just an idea", "Building MVP", "Have early users", "Pre-revenue", "Generating revenue"],
  },
  {
    key: "technical",
    label: "What's your technical background?",
    options: ["Non-technical", "Some technical skills", "Technical / developer", "Technical co-founder"],
  },
  {
    key: "budget",
    label: "How much can you invest to get started?",
    options: ["Under $1K", "$1K – $10K", "$10K – $50K", "$50K – $100K", "$100K+"],
  },
  {
    key: "time",
    label: "Do you have experience in this industry?",
    options: ["None — complete outsider", "Some — adjacent or hobbyist", "Strong — worked in this space", "Expert — 5+ years"],
  },
  {
    key: "network",
    label: "What's your network like in this space?",
    options: ["No connections", "A few contacts", "Active network in this space", "Deep domain expertise"],
  },
  {
    key: "geography",
    label: "Where are you targeting first?",
    options: ["United States", "North America", "Europe", "Asia Pacific", "Global", "Other"],
  },
]

const LOADING_STEPS = [
  "Analyzing your idea...",
  "Sizing the market...",
  "Scanning competitors...",
  "Scoring market entry...",
  "Assessing viability...",
  "Finding failure patterns...",
]

// ─── Verdict Badge ────────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: string }) {
  const color =
    verdict === "GO" ? "#34D399" : verdict === "CONDITIONAL GO" ? "#FBBF24" : "#F87171"
  const bg =
    verdict === "GO"
      ? "rgba(52,211,153,0.12)"
      : verdict === "CONDITIONAL GO"
      ? "rgba(251,191,36,0.12)"
      : "rgba(248,113,113,0.12)"
  return (
    <span
      style={{
        fontSize: "9px",
        padding: "2px 6px",
        borderRadius: "99px",
        background: bg,
        color,
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {verdict}
    </span>
  )
}

// ─── Report Row ──────────────────────────────────────────────────────────────

function ReportRow({ r, onLoadReport, onStarReport, onDeleteReport, formatDate }: {
  r: SavedReport
  onLoadReport: (r: SavedReport) => void
  onStarReport: (id: string) => void
  onDeleteReport: (id: string) => void
  formatDate: (iso: string) => string
}) {
  return (
    <div
      className="group flex items-start gap-2 px-3 py-2.5 rounded-lg transition-colors w-full"
      style={{ color: "#6B7280" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)"
        e.currentTarget.style.color = "#ffffff"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = "#6B7280"
      }}
    >
      <button onClick={() => onLoadReport(r)} className="flex items-start gap-2 text-left flex-1 min-w-0">
        <BookOpen size={13} className="shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-0.5 flex-wrap">
            <span className="text-sm text-white truncate">
              {r.idea.slice(0, 45)}{r.idea.length > 45 ? "…" : ""}
            </span>
            <VerdictBadge verdict={r.verdict} />
          </div>
          <span className="text-xs" style={{ color: "#6B7280" }}>{formatDate(r.date)}</span>
        </div>
      </button>
      <div className="flex items-center gap-0.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onStarReport(r.id) }}
          className="p-1 rounded transition-colors hover:text-yellow-400"
          style={{ color: r.starred ? "#FBBF24" : "inherit" }}
          title={r.starred ? "Unstar" : "Save to Saved Ideas"}
        >
          <Star size={12} fill={r.starred ? "#FBBF24" : "none"} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteReport(r.id) }}
          className="p-1 rounded transition-colors hover:text-red-400"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  onNewValidation,
  savedReports,
  onLoadReport,
  onDeleteReport,
  onStarReport,
  reportsRef,
}: {
  onNewValidation: () => void
  savedReports: SavedReport[]
  onLoadReport: (r: SavedReport) => void
  onDeleteReport: (id: string) => void
  onStarReport: (id: string) => void
  reportsRef: React.RefObject<HTMLDivElement | null>
}) {

  const [filterStarred, setFilterStarred] = useState(false)

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return ""
    }
  }

  const NAV_ITEMS = [
    { icon: Zap, label: "Validate Idea", active: !filterStarred, onClick: () => setFilterStarred(false) },
    { icon: Star, label: "Saved Ideas", active: filterStarred, onClick: () => setFilterStarred(v => !v) },
  ]

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[280px] flex flex-col border-r z-20"
      style={{ background: "#111318", borderColor: "#2A2D35" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b shrink-0" style={{ borderColor: "#2A2D35" }}>
        <LogoMark />
        <span className="font-semibold text-white text-base tracking-tight">Verdict</span>
      </div>

      {/* New Validation */}
      <div className="px-4 py-4">
        <button
          onClick={onNewValidation}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-[0.98]"
          style={{ background: "transparent", border: "1px solid #2A2D35", color: "#9CA3AF" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10B981"; e.currentTarget.style.color = "#34D399" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2D35"; e.currentTarget.style.color = "#9CA3AF" }}
        >
          <Plus size={15} />
          New Validation
        </button>
      </div>

      {/* Nav + Saved Reports */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Features
        </p>
        <nav className="flex flex-col gap-0.5 mb-6">
          {NAV_ITEMS.map(({ icon: Icon, label, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center gap-2.5 px-3 py-2.5 text-base text-left transition-colors w-full"
              style={{
                background: active ? "rgba(16,185,129,0.06)" : "transparent",
                color: active ? "#34D399" : "#6B7280",
                borderLeft: active ? "2px solid #10B981" : "2px solid transparent",
                borderRadius: active ? "0 6px 6px 0" : "6px",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)"
                  e.currentTarget.style.color = "#ffffff"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#6B7280"
                }
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div ref={reportsRef}>
          <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
            {filterStarred ? "Saved Ideas" : "Recent Validations"}
          </p>
          <div className="flex flex-col gap-0.5">
            {(() => {
              const list = filterStarred
                ? savedReports.filter(r => r.starred)
                : savedReports.slice(0, 5)
              if (list.length === 0) return (
                <p className="px-3 py-2 text-sm" style={{ color: "#6B7280" }}>
                  {filterStarred ? "Star a validation to save it here." : "No validations yet. Run your first one above."}
                </p>
              )
              return list.map((r) => (
                <ReportRow key={r.id} r={r} onLoadReport={onLoadReport} onStarReport={onStarReport} onDeleteReport={onDeleteReport} formatDate={formatDate} />
              ))
            })()}
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "#2A2D35" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
            style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}
          >
            F
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">Founder</p>
            <p className="text-sm truncate" style={{ color: "#6B7280" }}>Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar() {
  const router = useRouter()
  return (
    <div
      className="relative h-14 flex items-center justify-between px-6 border-b shrink-0"
      style={{ borderColor: "#2A2D35" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: "#6B7280" }}
          title="Home"
        >
          <Home size={16} />
        </button>
        <span className="text-base font-medium text-white">Workspace</span>
      </div>
      <span className="absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-wide text-[#10B981]">VERDICT</span>
    </div>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({
  step,
  error,
  onGoBack,
}: {
  step: number
  error?: boolean
  onGoBack?: () => void
}) {
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          <span className="text-xl">⚠️</span>
        </div>
        <div className="text-center">
          <p className="text-white font-medium mb-1">Something went wrong.</p>
          <p className="text-sm" style={{ color: "#6B7280" }}>Please try again.</p>
        </div>
        <button
          onClick={onGoBack}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white border transition-colors hover:border-[#34D399]"
          style={{ borderColor: "#2A2D35", background: "transparent" }}
        >
          ← Go back
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#10B981", borderRightColor: "rgba(16,185,129,0.3)" }}
        />
        <div
          className="absolute inset-2 rounded-full border border-transparent animate-spin"
          style={{
            borderTopColor: "rgba(52,211,153,0.4)",
            animationDirection: "reverse",
            animationDuration: "0.8s",
          }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col items-start gap-3">
        {LOADING_STEPS.map((s, i) => {
          const done = i < step
          const active = i === step
          return (
            <div
              key={s}
              className="flex items-center gap-2.5 text-sm transition-all duration-500"
              style={{
                color: done ? "#10B981" : active ? "#ffffff" : "#6B7280",
                opacity: i > step + 1 ? 0.3 : 1,
              }}
            >
              <div
                className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-all duration-500"
                style={{
                  background: done ? "rgba(16,185,129,0.15)" : active ? "rgba(255,255,255,0.1)" : "transparent",
                  border: done ? "1px solid #10B981" : active ? "1px solid rgba(255,255,255,0.3)" : "1px solid #2A2D35",
                }}
              >
                {done ? (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ) : null}
              </div>
              {s}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Empty / Input State ──────────────────────────────────────────────────────

const MAX_CHARS = 200

function EmptyState({
  idea,
  onIdeaChange,
  onSubmit,
}: {
  idea: string
  onIdeaChange: (v: string) => void
  onSubmit: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const remaining = MAX_CHARS - idea.length
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (idea.trim()) onSubmit()
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
          What&apos;s your next idea?
        </h1>
        <p className="text-base" style={{ color: "#6B7280" }}>
          Type it below. Get competitors, market size, gaps, and a go/no-go verdict in 60 seconds.
        </p>
      </div>

      {/* Input box */}
      <div
        className="w-full rounded-xl border overflow-hidden mb-4"
        style={{ background: "#1C1F26", borderColor: "#2A2D35" }}
      >
        <textarea
          ref={textareaRef}
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder='Describe your startup idea in one sentence…'
          rows={3}
          className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-base text-white placeholder:text-[#6B7280] outline-none leading-relaxed"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-end px-4 py-3 border-t" style={{ borderColor: "#2A2D35" }}>
          <div className="flex items-center gap-3">
            <span
              className="text-sm tabular-nums"
              style={{ color: remaining < 20 ? "#EF4444" : "#6B7280" }}
            >
              {idea.length}/{MAX_CHARS}
            </span>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!idea.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: idea.trim() ? "#10B981" : "rgba(16,185,129,0.08)",
                boxShadow: idea.trim() ? "0 0 18px rgba(16,185,129,0.45)" : "none",
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "#059669" }}
              onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "#10B981" }}
            >
              <ArrowUp size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm mb-10" style={{ color: "#6B7280" }}>
        Press{" "}
        <kbd
          className="px-1.5 py-0.5 rounded text-xs border"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "#2A2D35",
            color: "#6B7280",
          }}
        >
          Enter
        </kbd>{" "}
        to continue to survey
      </p>

      {/* Example chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          "An AI tool that writes cold emails for SDRs",
          "A marketplace for freelance video editors",
          "A Notion plugin that auto-generates weekly reports",
        ].map((example) => (
          <button
            key={example}
            onClick={() => onIdeaChange(example)}
            className="text-sm px-3.5 py-1.5 rounded-full border transition-colors hover:border-[#10B981] hover:text-white"
            style={{ borderColor: "#2A2D35", color: "#6B7280", background: "transparent" }}
          >
            {example}
          </button>
        ))}
      </div>

    </div>
  )
}

// ─── Survey Screen ────────────────────────────────────────────────────────────

function SurveyScreen({
  answers,
  onChange,
  onSubmit,
  onBack,
}: {
  answers: SurveyAnswers
  onChange: (key: keyof SurveyAnswers, value: string) => void
  onSubmit: () => void
  onBack: () => void
}) {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full">
      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 rounded-md self-start mb-6 transition-colors hover:bg-white/10"
        style={{ color: "#9CA3AF" }}
        title="Back"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          We&apos;ll personalize your report based on your situation
        </p>
      </div>

      {/* Questions */}
      <div className="w-full flex flex-col gap-6 mb-8">
        {SURVEY_QUESTIONS.map((q) => (
          <div key={q.key}>
            <p className="text-sm font-medium text-white mb-3">{q.label}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.key] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => onChange(q.key, opt)}
                    className="border transition-all"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "99px",
                      fontSize: "13px",
                      background: selected ? "#10B981" : "#1C1F26",
                      borderColor: selected ? "#10B981" : "#2A2D35",
                      color: selected ? "#ffffff" : "#6B7280",
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        className="w-full text-white font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
        style={{
          background: "#10B981",
          fontSize: "15px",
          fontWeight: 600,
          padding: "14px 32px",
          borderRadius: "8px",
        }}
      >
        Validate My Idea →
      </button>

      <p className="text-center mt-3 text-xs" style={{ color: "#6B7280" }}>
        Takes about 60 seconds
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [appState, setAppState] = useState<AppState>("empty")
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingError, setLoadingError] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers>(DEFAULT_SURVEY)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const reportsRef = useRef<HTMLDivElement>(null)

  // On mount: read localStorage
  useEffect(() => {
    const demo = localStorage.getItem("isDemoMode") === "true"
    const demoIdea = localStorage.getItem("demoIdea") ?? ""
    setIsDemoMode(demo)
    if (demo && demoIdea) {
      setIdea(demoIdea)
    }
    // Load saved reports — deduplicate any legacy duplicates by idea text
    try {
      const saved = JSON.parse(localStorage.getItem("validateiq_saved_reports") || "[]")
      const seen = new Set<string>()
      const deduped = (saved as { idea: string }[]).filter((r) => {
        const key = r.idea.trim().toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      if (deduped.length !== saved.length) {
        localStorage.setItem("validateiq_saved_reports", JSON.stringify(deduped))
      }
      setSavedReports(deduped as SavedReport[])
    } catch {
      setSavedReports([])
    }
  }, [])

  function runDemoAnimation(): Promise<void> {
    return new Promise((resolve) => {
      setLoadingStep(0)
      const STEP_MS = 1500
      ;[1, 2, 3, 4, 5, 6].forEach((step) => {
        setTimeout(() => setLoadingStep(step), step * STEP_MS)
      })
      setTimeout(resolve, 6 * STEP_MS)
    })
  }

  async function runValidation(ideaText: string, answers: SurveyAnswers = surveyAnswers) {
    setLoadingError(false)
    setLoadingStep(0)
    setAppState("loading")

    if (isDemoMode) {
      await runDemoAnimation()
      localStorage.setItem("validateiq_report", JSON.stringify(demoData))
      localStorage.setItem("validateiq_idea", ideaText)
      localStorage.setItem("validateiq_survey", JSON.stringify(answers))
      router.push("/report")
      return
    }

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaText, survey: answers, stream: true }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let reportData: unknown = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const json = JSON.parse(line.slice(6))
          if (json.type === "progress") {
            setLoadingStep(json.step)
          } else if (json.type === "done") {
            reportData = json.data
          } else if (json.type === "error") {
            throw new Error(json.message)
          }
        }
      }

      if (!reportData) throw new Error("No data received")

      localStorage.setItem("validateiq_report", JSON.stringify(reportData))
      localStorage.setItem("validateiq_idea", ideaText)
      localStorage.setItem("validateiq_survey", JSON.stringify(answers))
      router.push("/report")
    } catch {
      setLoadingError(true)
    }
  }

  function handleSubmit() {
    if (!idea.trim()) return
    if (isDemoMode) {
      runValidation(idea)
    } else {
      setAppState("survey")
    }
  }

  function handleSurveySubmit() {
    runValidation(idea, surveyAnswers)
  }

  function handleNewValidation() {
    setIdea("")
    setAppState("empty")
    setLoadingStep(0)
    setLoadingError(false)
    setIsDemoMode(false)
    setSurveyAnswers(DEFAULT_SURVEY)
    localStorage.removeItem("isDemoMode")
    localStorage.removeItem("demoIdea")
  }

  function handleLoadReport(r: SavedReport) {
    localStorage.setItem("validateiq_report", JSON.stringify(r.report))
    localStorage.setItem("validateiq_idea", r.idea)
    localStorage.setItem("validateiq_survey", JSON.stringify(r.survey))
    router.push("/report")
  }

  function handleDeleteReport(id: string) {
    const updated = savedReports.filter((r) => r.id !== id)
    setSavedReports(updated)
    localStorage.setItem("validateiq_saved_reports", JSON.stringify(updated))
  }

  function handleStarReport(id: string) {
    const updated = savedReports.map((r) => r.id === id ? { ...r, starred: !r.starred } : r)
    setSavedReports(updated)
    localStorage.setItem("validateiq_saved_reports", JSON.stringify(updated))
  }

  return (
    <div
      className="flex min-h-screen [font-family:var(--font-inter),system-ui,sans-serif]"
      style={{ background: "#000000" }}
    >
      <Sidebar
        onNewValidation={handleNewValidation}
        savedReports={savedReports}
        onLoadReport={handleLoadReport}
        onDeleteReport={handleDeleteReport}
        onStarReport={handleStarReport}
        reportsRef={reportsRef}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 ml-[280px] min-h-screen">
        {/* Demo banner */}
        {isDemoMode && (
          <div className="flex items-center justify-center py-2">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(16,185,129,0.1)", color: "#34D399", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <Zap size={10} />
              Demo mode
            </span>
          </div>
        )}

        <TopBar />

        {appState === "empty" && (
          <EmptyState idea={idea} onIdeaChange={setIdea} onSubmit={handleSubmit} />
        )}
        {appState === "survey" && (
          <SurveyScreen
            answers={surveyAnswers}
            onChange={(key, value) => setSurveyAnswers((prev) => ({ ...prev, [key]: value }))}
            onSubmit={handleSurveySubmit}
            onBack={() => setAppState("empty")}
          />
        )}
        {appState === "loading" && (
          <LoadingScreen
            step={loadingStep}
            error={loadingError}
            onGoBack={handleNewValidation}
          />
        )}
      </div>
    </div>
  )
}
