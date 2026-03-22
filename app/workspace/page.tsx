"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogoMark } from "@/components/logo-mark"
import {
  BarChart2,
  FileText,
  Paperclip,
  Settings,
  Sliders,
  Scale,
  Star,
  TrendingUp,
  Zap,
  ArrowUp,
  Plus,
  BookOpen,
} from "lucide-react"
import demoData from "@/lib/demo-data.json"

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = "empty" | "survey" | "loading" | "error"

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
}

const DEFAULT_SURVEY: SurveyAnswers = {
  stage: "Just an idea",
  technical: "Non-technical",
  budget: "Under $1K",
  time: "A few hours a week",
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
    label: "How much time can you commit?",
    options: ["A few hours a week", "Nights and weekends", "Part-time (20hrs/week)", "Full-time"],
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
  "Scanning competitors...",
  "Sizing the market...",
  "Finding investors...",
  "Assessing viability...",
  "Checking failure history...",
  "Building your report...",
]

const QUICK_TABS = ["Validate Idea", "Pivot an Idea", "Compare Ideas"] as const

const FEATURE_CARDS = [
  {
    icon: BarChart2,
    title: "Market Sizing Engine",
    desc: "TAM, SAM, SOM in plain English — not consultant-speak.",
  },
  {
    icon: TrendingUp,
    title: "Competitor Radar",
    desc: "Surface who's in your space, what they charge, and where they're weak.",
  },
  {
    icon: Scale,
    title: "Go / No-Go Verdict",
    desc: "A direct call with a one-paragraph rationale — paste it straight into your pitch deck.",
  },
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

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  onNewValidation,
  savedReports,
  onLoadReport,
  reportsRef,
}: {
  onNewValidation: () => void
  savedReports: SavedReport[]
  onLoadReport: (r: SavedReport) => void
  reportsRef: React.RefObject<HTMLDivElement | null>
}) {
  const router = useRouter()

  function scrollToReports() {
    reportsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return ""
    }
  }

  const NAV_ITEMS = [
    { icon: Zap, label: "Validate Idea", active: true, onClick: undefined as (() => void) | undefined },
    { icon: FileText, label: "My Reports", active: false, onClick: scrollToReports },
    { icon: Star, label: "Saved Ideas", active: false, onClick: scrollToReports },
  ]

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[280px] flex flex-col border-r z-20"
      style={{ background: "#050F09", borderColor: "#122B1A" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "#122B1A" }}>
        <LogoMark />
        <span className="font-semibold text-white text-base tracking-tight">Validate IQ</span>
      </div>

      {/* New Validation */}
      <div className="px-4 py-4">
        <button
          onClick={onNewValidation}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-white text-sm transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#059669" }}
        >
          <Plus size={15} />
          New Validation
        </button>
      </div>

      {/* Nav + Saved Reports */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Features
        </p>
        <nav className="flex flex-col gap-0.5 mb-6">
          {NAV_ITEMS.map(({ icon: Icon, label, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors w-full"
              style={{
                background: active ? "rgba(5,150,105,0.12)" : "transparent",
                color: active ? "#34D399" : "#6B7280",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)"
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
          <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
            Recent Validations
          </p>
          <div className="flex flex-col gap-0.5">
            {savedReports.length === 0 ? (
              <p className="px-3 py-2 text-xs" style={{ color: "#6B7280" }}>
                No validations yet. Run your first one above.
              </p>
            ) : (
              savedReports.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={() => onLoadReport(r)}
                  className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-colors w-full"
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
                  <BookOpen size={13} className="shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                      <span className="text-xs text-white truncate">
                        {r.idea.slice(0, 30)}{r.idea.length > 30 ? "…" : ""}
                      </span>
                      <VerdictBadge verdict={r.verdict} />
                    </div>
                    <span className="text-[10px]" style={{ color: "#6B7280" }}>{formatDate(r.date)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User + Upgrade */}
      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "#122B1A" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
            style={{ background: "rgba(5,150,105,0.15)", color: "#34D399" }}
          >
            F
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">Founder</p>
            <p className="text-xs truncate" style={{ color: "#6B7280" }}>Free plan</p>
          </div>
        </div>
        <div className="rounded-lg p-3 border" style={{ background: "#000000", borderColor: "#122B1A" }}>
          <p className="text-xs font-medium text-white mb-1">Unlock Builder</p>
          <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
            Unlimited validations, full reports, export to PDF.
          </p>
          <button
            onClick={() => router.push("/#pricing")}
            className="w-full py-1.5 rounded-md text-xs font-medium text-white transition-all hover:brightness-110"
            style={{ background: "#059669" }}
          >
            Get Builder →
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({ isDemoMode, geography }: { isDemoMode: boolean; geography: string }) {
  const router = useRouter()
  const [showConfig, setShowConfig] = useState(false)
  const configRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (configRef.current && !configRef.current.contains(e.target as Node)) {
        setShowConfig(false)
      }
    }
    if (showConfig) document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [showConfig])

  function handleExport() {
    const hasReport = !!localStorage.getItem("validateiq_report")
    if (hasReport) {
      router.push("/report")
    } else {
      toast.error("Run a validation first to view your report.")
    }
  }

  return (
    <div
      className="h-14 flex items-center justify-between px-6 border-b shrink-0"
      style={{ borderColor: "#122B1A" }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-xs text-[#6B7280]">Validate IQ</span>
        <span className="text-xs text-[#6B7280]" aria-hidden>/</span>
        <span className="text-sm font-medium text-white">Workspace</span>
      </div>
      <div className="flex items-center gap-2">
        <div ref={configRef} className="relative">
          <button
            onClick={() => setShowConfig((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
            style={{
              borderColor: showConfig ? "#059669" : "#122B1A",
              color: showConfig ? "#34D399" : "#6B7280",
              background: "transparent",
            }}
          >
            <Settings size={13} />
            Configuration
          </button>
          {showConfig && (
            <div
              className="absolute right-0 top-full mt-1 rounded-lg border z-30 py-3 px-3 flex flex-col gap-2.5"
              style={{ background: "#0A1A10", borderColor: "#122B1A", width: 220 }}
            >
              <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "#6B7280" }}>
                Configuration
              </p>
              {[
                { label: "Model", value: "Perplexity Sonar Pro" },
                { label: "Geography", value: geography || "United States" },
                { label: "Mode", value: isDemoMode ? "Demo" : "Live" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#6B7280" }}>{label}</span>
                  <span className="text-xs font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:border-[rgba(255,255,255,0.12)]"
          style={{ borderColor: "#122B1A", color: "#6B7280", background: "transparent" }}
        >
          <FileText size={13} />
          View Report
        </button>
      </div>
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
          style={{ borderColor: "#122B1A", background: "transparent" }}
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
          style={{ borderTopColor: "#059669", borderRightColor: "rgba(5,150,105,0.3)" }}
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
      <div className="flex flex-col items-center gap-3">
        {LOADING_STEPS.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-2.5 text-sm transition-all duration-500"
            style={{
              color: i < step ? "#059669" : i === step ? "#ffffff" : "#6B7280",
              opacity: i > step + 1 ? 0.3 : 1,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500"
              style={{
                background: i < step ? "#059669" : i === step ? "#ffffff" : "#6B7280",
              }}
            />
            {s}
          </div>
        ))}
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
  const [activeTab, setActiveTab] = useState<(typeof QUICK_TABS)[number]>("Validate Idea")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const remaining = MAX_CHARS - idea.length

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
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
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Type it below. Get competitors, market size, gaps, and a go/no-go verdict in 60 seconds.
        </p>
      </div>

      {/* Tab pills */}
      <div
        className="flex items-center gap-1 p-1 rounded-lg mb-6 border"
        style={{ background: "#0A1A10", borderColor: "#122B1A" }}
      >
        {QUICK_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === tab ? "#059669" : "transparent",
              color: activeTab === tab ? "#ffffff" : "#6B7280",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div
        className="w-full rounded-xl border overflow-hidden mb-4"
        style={{ background: "#0A1A10", borderColor: "#122B1A" }}
      >
        <textarea
          ref={textareaRef}
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder='Describe your startup idea in one sentence…'
          rows={5}
          className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm text-white placeholder:text-[#6B7280] outline-none leading-relaxed"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#122B1A" }}>
          <div className="flex items-center gap-1">
            {[
              { icon: Paperclip, label: "Attach" },
              { icon: Settings, label: "Settings" },
              { icon: Sliders, label: "Options" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors"
                style={{ color: "#6B7280" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-xs tabular-nums"
              style={{ color: remaining < 20 ? "#EF4444" : "#6B7280" }}
            >
              {idea.length}/{MAX_CHARS}
            </span>
            <button
              onClick={onSubmit}
              disabled={!idea.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: idea.trim() ? "#059669" : "rgba(5,150,105,0.08)",
                boxShadow: idea.trim() ? "0 0 18px rgba(5,150,105,0.45)" : "none",
              }}
              onMouseEnter={(e) => { if (idea.trim()) e.currentTarget.style.background = "#06b479" }}
              onMouseLeave={(e) => { if (idea.trim()) e.currentTarget.style.background = "#059669" }}
            >
              <ArrowUp size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs mb-10" style={{ color: "#6B7280" }}>
        Press{" "}
        <kbd
          className="px-1.5 py-0.5 rounded text-xs border"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "#122B1A",
            color: "#6B7280",
          }}
        >
          {typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
            ? "⌘"
            : "Ctrl"}{" "}
          Enter
        </kbd>{" "}
        to continue to survey
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {FEATURE_CARDS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border p-4 cursor-pointer transition-all"
            style={{ background: "#0A1A10", borderColor: "#122B1A" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(5,150,105,0.35)"
              e.currentTarget.style.background = "rgba(255,255,255,0.04)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#122B1A"
              e.currentTarget.style.background = "#0A1A10"
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "rgba(5,150,105,0.12)" }}
            >
              <Icon size={15} style={{ color: "#059669" }} />
            </div>
            <p className="text-sm font-medium text-white mb-1">{title}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Survey Screen ────────────────────────────────────────────────────────────

function SurveyScreen({
  idea,
  answers,
  onChange,
  onSubmit,
  onBack,
}: {
  idea: string
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
        className="self-start text-sm mb-8 transition-colors"
        style={{ color: "#6B7280", background: "transparent", border: "none" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff" }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#6B7280" }}
      >
        ← Back
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
                      background: selected ? "#059669" : "#0A1A10",
                      borderColor: selected ? "#059669" : "#122B1A",
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
          background: "#059669",
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
    // Load saved reports
    try {
      const saved = JSON.parse(localStorage.getItem("validateiq_saved_reports") || "[]")
      setSavedReports(saved)
    } catch {
      setSavedReports([])
    }
  }, [])

  function runStepAnimation(signal: { cancelled: boolean }): Promise<void> {
    return new Promise((resolve) => {
      setLoadingStep(0)
      const STEP_MS = 1500
      ;[1, 2, 3, 4, 5].forEach((step) => {
        setTimeout(() => {
          if (!signal.cancelled) setLoadingStep(step)
        }, step * STEP_MS)
      })
      setTimeout(() => {
        if (!signal.cancelled) setLoadingStep(6)
        resolve()
      }, 6 * STEP_MS)
    })
  }

  async function runValidation(ideaText: string, answers: SurveyAnswers = surveyAnswers) {
    setLoadingError(false)
    setAppState("loading")

    if (isDemoMode) {
      const demoSignal = { cancelled: false }
      await runStepAnimation(demoSignal)
      localStorage.setItem("validateiq_report", JSON.stringify(demoData))
      localStorage.setItem("validateiq_idea", ideaText)
      localStorage.setItem("validateiq_survey", JSON.stringify(answers))
      router.push("/report")
      return
    }

    const animSignal = { cancelled: false }
    const animationPromise = runStepAnimation(animSignal)
    const minAnimationPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, 4 * 1500)
    )

    let reportData: unknown = null
    let apiError = false

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaText, survey: answers }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      reportData = await res.json()
    } catch {
      apiError = true
      animSignal.cancelled = true
    }

    if (apiError) {
      setLoadingError(true)
      return
    }

    await Promise.all([animationPromise, minAnimationPromise])

    localStorage.setItem("validateiq_report", JSON.stringify(reportData))
    localStorage.setItem("validateiq_idea", ideaText)
    localStorage.setItem("validateiq_survey", JSON.stringify(answers))
    router.push("/report")
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

  return (
    <div
      className="flex min-h-screen [font-family:var(--font-inter),system-ui,sans-serif]"
      style={{ background: "#000000" }}
    >
      <Sidebar
        onNewValidation={handleNewValidation}
        savedReports={savedReports}
        onLoadReport={handleLoadReport}
        reportsRef={reportsRef}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 ml-[280px] min-h-screen">
        {/* Demo banner */}
        {isDemoMode && (
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white"
            style={{ background: "#059669" }}
          >
            <Zap size={12} />
            You&apos;re in demo mode — results are pre-loaded for speed
          </div>
        )}

        <TopBar isDemoMode={isDemoMode} geography={surveyAnswers.geography} />

        {appState === "empty" && (
          <EmptyState idea={idea} onIdeaChange={setIdea} onSubmit={handleSubmit} />
        )}
        {appState === "survey" && (
          <SurveyScreen
            idea={idea}
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
