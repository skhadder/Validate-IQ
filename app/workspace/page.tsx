"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Archive,
  ArrowUp,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react"
import demoData from "@/lib/demo-data.json"
import { viabilityForLedgerEntry } from "@/lib/viability-score"

type AppState = "empty" | "survey" | "loading"
type WorkspaceView = "new" | "history" | "research"

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
    label: "Technical background?",
    options: ["Non-technical", "Some technical skills", "Technical / developer", "Technical co-founder"],
  },
  {
    key: "budget",
    label: "Starting budget?",
    options: ["Under $1K", "$1K – $10K", "$10K – $50K", "$50K – $100K", "$100K+"],
  },
  {
    key: "time",
    label: "Industry experience?",
    options: ["None — complete outsider", "Some — adjacent or hobbyist", "Strong — worked in this space", "Expert — 5+ years"],
  },
  {
    key: "network",
    label: "Network in this space?",
    options: ["No connections", "A few contacts", "Active network in this space", "Deep domain expertise"],
  },
  {
    key: "geography",
    label: "Target geography?",
    options: ["United States", "North America", "Europe", "Asia Pacific", "Global", "Other"],
  },
]

const LOADING_STEPS = [
  "Analyzing idea",
  "Sizing market",
  "Scanning competitors",
  "Scoring entry",
  "Synthesizing verdict",
  "Identifying failure patterns",
]

const MAX_CHARS = 200

const BORDER = "#2a2a2a"
const TEXT_MUTED = "#555"
const ACCENT = "#2dd4bf"

function verdictTone(verdict: string) {
  if (verdict === "GO")
    return "border border-teal-500/40 bg-teal-500/10 text-teal-400"
  if (verdict === "CONDITIONAL GO")
    return "border border-amber-500/40 bg-amber-500/10 text-amber-400"
  return "bg-red-500/10 text-red-400 border border-red-500/30"
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    const day = d.getUTCDate().toString().padStart(2, "0")
    const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase()
    const year = d.getUTCFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return ""
  }
}

function formatArchiveHeaderDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
  } catch {
    return "—"
  }
}

const SUGGESTION_CHIPS = [
  { title: "Analyze a SaaS startup", category: "GROWTH & RETENTION", prompt: "Analyze a SaaS startup targeting SMBs with a subscription model, focusing on growth levers and retention risks." },
  { title: "Evaluate a marketplace idea", category: "LIQUIDITY ANALYSIS", prompt: "Evaluate a two-sided marketplace concept, assessing liquidity challenges, supply-demand balance, and monetization strategy." },
  { title: "Score a deeptech concept", category: "IP & TECH READINESS", prompt: "Score a deeptech concept on IP defensibility, technology readiness level, and path to commercialization." },
]

function Sidebar({
  activeView,
  onViewChange,
  onNewValidation,
  savedReports,
  onLoadReport,
  onDelete: _onDelete,
}: {
  activeView: WorkspaceView
  onViewChange: (view: WorkspaceView) => void
  onNewValidation: () => void
  savedReports: SavedReport[]
  onLoadReport: (r: SavedReport) => void
  onDelete: (_id: string) => void
}) {
  const recent = useMemo(
    () => [...savedReports].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 4),
    [savedReports],
  )

  const tools = [
    { id: "new" as const, label: "HISTORY", Icon: Clock },
    { id: "history" as const, label: "ARCHIVE", Icon: Archive },
    { id: "research" as const, label: "RESEARCH", Icon: Search },
  ]

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[240px] shrink-0 flex-col overflow-hidden bg-[#111111] px-5 pb-5">
      {/* Logo */}
      <div className="shrink-0 pt-6 pb-5">
        <Link href="/" className="group w-fit block">
          <p className="font-heading text-xl font-bold tracking-[0.2em] text-white transition group-hover:opacity-80">
            VERDICT
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.22em] text-[#555] transition group-hover:opacity-80">
            Venture Diligence
          </p>
        </Link>
      </div>

      {/* New Analysis button */}
      <div className="shrink-0 pb-4">
        <button
          type="button"
          onClick={onNewValidation}
          className="flex w-full items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] px-4 py-2.5 text-sm text-white transition hover:bg-[#242424]"
        >
          <span>New Analysis</span>
          <Pencil size={14} className="text-[#555]" />
        </button>
      </div>

      {/* Divider */}
      <div className="shrink-0 border-t border-[#1e1e1e] mb-4" />

      {/* Recent section */}
      <div className="shrink-0">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#444]">Recent</p>
        {recent.length === 0 ? (
          <p className="text-sm text-[#444]">No analyses yet.</p>
        ) : (
          <ul className="space-y-0.5">
            {recent.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onLoadReport(r)}
                  className="w-full truncate text-left text-sm text-[#888] transition hover:text-white py-1"
                >
                  {r.idea}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 border-t border-[#1e1e1e] my-4" />

      {/* Tools section */}
      <div className="shrink-0">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#444]">Tools</p>
        <ul className="space-y-0.5">
          {tools.map(({ id, label, Icon }) => {
            const active = activeView === id
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onViewChange(id)}
                  className={`flex w-full items-center gap-2.5 py-1.5 text-sm transition ${
                    active
                      ? "border-l-2 border-teal-400 pl-2 text-white"
                      : "text-[#555] hover:text-[#888] pl-[3px]"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="shrink-0 border-t border-[#1e1e1e] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] text-[11px] font-bold text-[#888]">
            A4
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">Analyst 04</p>
          <button
            type="button"
            className="shrink-0 text-[#444] transition hover:text-[#888]"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

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

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value.slice(0, MAX_CHARS)
    onIdeaChange(val)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (idea.trim()) onSubmit()
    }
  }

  function handleChip(prompt: string) {
    onIdeaChange(prompt.slice(0, MAX_CHARS))
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
        textareaRef.current.focus()
      }
    }, 0)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-4 min-h-0">
        {/* V monogram */}
        <p className="select-none text-[120px] font-bold leading-none text-[#1e1e1e]">V</p>

        {/* Suggestion chips */}
        <div className="mt-6 grid w-full max-w-3xl grid-cols-3 gap-3">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip.category}
              type="button"
              onClick={() => handleChip(chip.prompt)}
              className="flex flex-col rounded-2xl border border-[#2a2a2a] bg-transparent px-5 py-4 text-left transition hover:border-[#3a3a3a] cursor-pointer"
            >
              <span className="truncate text-sm font-medium text-white">{chip.title}</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-[#444]">{chip.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pinned input bar */}
      <div className="shrink-0 px-8 pb-6 pt-4" style={{ background: "linear-gradient(to top, #0d0d0d 80%, transparent)" }}>
        <div className="flex min-h-[52px] items-end gap-3 rounded-full border border-[#2a2a2a] bg-[#111] py-2.5 pl-7 pr-3 sm:pl-8">
          <textarea
            ref={textareaRef}
            value={idea}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your startup concept..."
            rows={1}
            className="max-h-40 min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-sm leading-relaxed text-white outline-none ring-0 placeholder:text-[#444] focus:ring-0"
            style={{ overflowY: "auto" }}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!idea.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[#0d0d0d] transition hover:bg-teal-300 disabled:opacity-30"
            aria-label="Submit"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-[#333]">
          Verdict may make mistakes. Verify key claims against primary source documentation.
        </p>
      </div>
    </div>
  )
}

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
    <div className="flex flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-8 py-12">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#555]">
          Diligence query
        </p>
        <h2 className="mt-3 text-5xl font-bold leading-tight text-white">Where are you in the journey?</h2>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {SURVEY_QUESTIONS[0].options.map((opt) => {
            const selected = answers.stage === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange("stage", opt)}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition"
                style={{
                  borderColor: selected ? ACCENT : BORDER,
                  background: selected ? "rgba(45,212,191,0.08)" : "rgba(255,255,255,0.03)",
                  color: selected ? "#f8fafc" : TEXT_MUTED,
                }}
              >
                <span>{opt}</span>
                <span className="text-xs">{selected ? "◉" : "○"}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[#555]">
            Technical audit
          </p>
          <div className="flex flex-wrap gap-2">
            {SURVEY_QUESTIONS[1].options.map((opt) => {
              const selected = answers.technical === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange("technical", opt)}
                  className="rounded-lg border px-4 py-2 text-sm transition"
                  style={{
                    borderColor: selected ? ACCENT : BORDER,
                    background: selected ? "rgba(45,212,191,0.08)" : "rgba(255,255,255,0.03)",
                    color: selected ? "#ffffff" : TEXT_MUTED,
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {SURVEY_QUESTIONS.slice(2).map((q) => (
            <label key={q.key} className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#555]">
                {q.label}
              </span>
              <select
                value={answers[q.key]}
                onChange={(e) => onChange(q.key, e.target.value)}
                className="w-full rounded-lg border bg-[#1a1a1a] px-3 py-2.5 text-sm text-white outline-none"
                style={{ borderColor: BORDER }}
              >
                {q.options.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#1a1a1a]">
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-xs uppercase tracking-[0.14em] text-[#555] transition hover:text-white"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-lg border border-[#2a2a2a] bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-slate-200"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

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
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full max-w-xl rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="text-2xl font-semibold text-white">Validation failed</p>
          <p className="mt-3 text-sm text-[#555]">
            Something went wrong while scanning your market. Please retry.
          </p>
          <button
            type="button"
            onClick={onGoBack}
            className="mt-6 rounded-lg border border-[#2a2a2a] px-6 py-2 text-xs uppercase tracking-[0.14em] text-white transition hover:bg-white/5"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const safeStep = Math.min(step, LOADING_STEPS.length - 1)
  const progress = ((safeStep + 1) / LOADING_STEPS.length) * 100

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <div className="w-full max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#555]">Current operation</p>
        <h2 className="mt-3 text-balance text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          {LOADING_STEPS[safeStep]} for your startup concept
        </h2>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-left sm:p-8">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#1e1e1e]">
            <div
              className="h-full rounded-full bg-teal-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            {LOADING_STEPS.map((label, i) => {
              const done = i < step
              const active = i === safeStep
              return (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs"
                    style={{
                      borderColor: done ? ACCENT : active ? "#888" : BORDER,
                      color: done ? ACCENT : active ? "#ffffff" : TEXT_MUTED,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    style={{
                      color: done ? "color-mix(in srgb, #2dd4bf 55%, white)" : active ? "#ffffff" : TEXT_MUTED,
                    }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-[#2a2a2a] pt-4 text-[11px] uppercase tracking-[0.15em] text-[#555] sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <span>Neural processing at {Math.min(99, Math.round(progress))}%</span>
            <span>Est. completion: {Math.max(1, 20 - safeStep * 3)}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryScreen({
  reports,
  onOpen,
  onDelete,
  onArchiveDiscovery,
}: {
  reports: SavedReport[]
  onOpen: (r: SavedReport) => void
  onDelete: (id: string) => void
  onArchiveDiscovery: () => void
}) {
  const sorted = useMemo(() => [...reports].sort((a, b) => +new Date(b.date) - +new Date(a.date)), [reports])
  const lastUpdated = sorted[0]?.date ?? ""
  const n = sorted.length

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex w-fit rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white">
          {n} {n === 1 ? "Archive Entry" : "Archive Entries"}
        </span>
        <p className="text-[11px] uppercase tracking-[0.14em] text-white">
          Last updated:{" "}
          <span className="text-[#555]">{lastUpdated ? formatArchiveHeaderDate(lastUpdated) : "—"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {sorted.map((r) => {
          const score = viabilityForLedgerEntry(r.report as object, r.viabilityScore)
          return (
            <article
              key={r.id}
              className="flex min-h-[280px] flex-col rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-colors hover:border-[#3a3a3a]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${verdictTone(r.verdict)}`}>
                  {r.verdict.replace("CONDITIONAL GO", "CONDITIONAL")}
                </span>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#555]">Score</p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-white">
                    {score}
                    <span className="text-sm font-semibold text-[#555]">/10</span>
                  </p>
                </div>
              </div>
              <h3 className="line-clamp-4 min-h-0 flex-1 text-base font-medium leading-snug text-white">{r.idea}</h3>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#2a2a2a] pt-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#555]">{formatDate(r.date)}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpen(r)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-white/80 transition hover:bg-white/5 hover:text-white"
                    aria-label="Open memo"
                  >
                    <ExternalLink size={16} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-white/55 transition hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Delete memo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}

        <button
          type="button"
          onClick={onArchiveDiscovery}
          className="flex min-h-[280px] flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-[#2a2a2a] p-6 transition hover:border-[#3a3a3a] hover:bg-white/[0.02]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#111] text-white/90">
            <Plus size={26} strokeWidth={1.5} />
          </span>
          <span className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white">
            New analysis
          </span>
        </button>
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [view, setView] = useState<WorkspaceView>("new")
  const [appState, setAppState] = useState<AppState>("empty")
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingError, setLoadingError] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers>(DEFAULT_SURVEY)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])

  useEffect(() => {
    const demo = localStorage.getItem("isDemoMode") === "true"
    const demoIdea = localStorage.getItem("demoIdea") ?? ""
    setIsDemoMode(demo)
    if (demo && demoIdea) setIdea(demoIdea)

    try {
      const raw = localStorage.getItem("validateiq_saved_reports")
      const saved = JSON.parse(raw || "[]")
      const seen = new Set<string>()
      const deduped = (saved as { idea: string }[]).filter((r) => {
        const key = r.idea.trim().toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      if (deduped.length !== saved.length) localStorage.setItem("validateiq_saved_reports", JSON.stringify(deduped))
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
          if (json.type === "progress") setLoadingStep(json.step)
          else if (json.type === "done") reportData = json.data
          else if (json.type === "error") throw new Error(json.message)
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
    if (isDemoMode) runValidation(idea)
    else setAppState("survey")
  }

  function handleNewValidation() {
    setView("new")
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar
        activeView={view}
        onViewChange={setView}
        onNewValidation={handleNewValidation}
        savedReports={savedReports}
        onLoadReport={handleLoadReport}
        onDelete={handleDeleteReport}
      />

      <main className="flex min-h-0 flex-1 flex-col bg-[#0d0d0d]">
        {isDemoMode && view === "new" && (
          <div className="shrink-0 px-8 pt-4">
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-teal-400">
              <Zap size={12} /> Demo mode
            </span>
          </div>
        )}

        {view === "history" ? (
          <HistoryScreen
            reports={savedReports}
            onOpen={handleLoadReport}
            onDelete={handleDeleteReport}
            onArchiveDiscovery={handleNewValidation}
          />
        ) : view === "research" ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#444]">
            Research — coming soon
          </div>
        ) : (
          <>
            {appState === "empty" && (
              <EmptyState idea={idea} onIdeaChange={setIdea} onSubmit={handleSubmit} />
            )}
            {appState === "survey" && (
              <SurveyScreen
                answers={surveyAnswers}
                onChange={(key, value) => setSurveyAnswers((prev) => ({ ...prev, [key]: value }))}
                onSubmit={() => runValidation(idea, surveyAnswers)}
                onBack={() => setAppState("empty")}
              />
            )}
            {appState === "loading" && (
              <LoadingScreen step={loadingStep} error={loadingError} onGoBack={handleNewValidation} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
