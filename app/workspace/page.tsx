"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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
  Lightbulb,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = "empty" | "loading" | "report"

const LOADING_STEPS = [
  "Scanning market data…",
  "Mapping competitors…",
  "Sizing the opportunity…",
  "Scoring the gaps…",
]

const RECENT_VALIDATIONS = [
  "AI customer support bot for SMBs",
  "B2B SaaS for restaurant inventory",
  "No-code mobile app builder",
]

const NAV_ITEMS = [
  { icon: Zap, label: "Validate Idea", active: true },
  { icon: FileText, label: "My Reports" },
  { icon: Star, label: "Saved Ideas" },
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

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ onNewValidation }: { onNewValidation: () => void }) {
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

      {/* Nav */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Features
        </p>
        <nav className="flex flex-col gap-0.5 mb-6">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors w-full group"
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

        <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Workspaces
        </p>
        <div className="flex flex-col gap-0.5">
          {RECENT_VALIDATIONS.map((name) => (
            <button
              key={name}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors w-full"
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
              <BookOpen size={13} className="shrink-0" />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User + Upgrade */}
      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "#122B1A" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
            style={{ background: "rgba(5,150,105,0.15)", color: "#34D399" }}
          >
            D
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">Dhwanil</p>
            <p className="text-xs truncate" style={{ color: "#6B7280" }}>
              Free plan
            </p>
          </div>
        </div>
        <div className="rounded-lg p-3 border" style={{ background: "#000000", borderColor: "#122B1A" }}>
          <p className="text-xs font-medium text-white mb-1">Unlock Builder</p>
          <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
            Unlimited validations, full reports, export to PDF.
          </p>
          <button
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

function TopBar() {
  return (
    <div
      className="h-14 flex items-center justify-between px-6 border-b shrink-0"
      style={{ borderColor: "#122B1A" }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-xs text-[#6B7280]">Validate IQ</span>
        <span className="text-xs text-[#6B7280]" aria-hidden>
          /
        </span>
        <span className="text-sm font-medium text-white">Workspace</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:border-[rgba(255,255,255,0.12)]"
          style={{ borderColor: "#122B1A", color: "#6B7280", background: "transparent" }}
        >
          <Settings size={13} />
          Configuration
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:border-[rgba(255,255,255,0.12)]"
          style={{ borderColor: "#122B1A", color: "#6B7280", background: "transparent" }}
        >
          <FileText size={13} />
          Export
        </button>
      </div>
    </div>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ step }: { step: number }) {
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
          onChange={(e) => onIdeaChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Describe your startup idea… (e.g. "A Notion-style tool for solo devs to track their SaaS metrics")'
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
                  e.currentTarget.style.color = "#6B7280"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#6B7280"
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={onSubmit}
            disabled={!idea.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
            style={{
              background: idea.trim() ? "#059669" : "rgba(5,150,105,0.08)",
              boxShadow: idea.trim() ? "0 0 18px rgba(52,211,153,0.35)" : "none",
            }}
          >
            <ArrowUp size={16} className="text-white" />
          </button>
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
          ⌘ Enter
        </kbd>{" "}
        to submit
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
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
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

// ─── Report Placeholder ───────────────────────────────────────────────────────

function ReportPlaceholder({ idea }: { idea: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
      <div
        className="w-full rounded-xl border p-8 text-center"
        style={{ background: "#0A1A10", borderColor: "#122B1A" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(5,150,105,0.12)" }}
        >
          <Lightbulb size={20} style={{ color: "#059669" }} />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Report Ready</h2>
        <p className="text-sm mb-1" style={{ color: "#6B7280" }}>
          Validation complete for:
        </p>
        <p className="text-sm font-medium text-white mb-6 italic">"{idea}"</p>
        <p className="text-xs" style={{ color: "#6B7280" }}>
          The full report component will be rendered here.
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [appState, setAppState] = useState<AppState>("empty")
  const [loadingStep, setLoadingStep] = useState(0)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [submittedIdea, setSubmittedIdea] = useState("")

  // On mount: read localStorage
  useEffect(() => {
    const demo = localStorage.getItem("isDemoMode") === "true"
    const demoIdea = localStorage.getItem("demoIdea") ?? ""
    setIsDemoMode(demo)
    if (demo && demoIdea) {
      setIdea(demoIdea)
    }
  }, [])

  // Loading step animation
  useEffect(() => {
    if (appState !== "loading") return
    setLoadingStep(0)
    const timings = [900, 1800, 2700]
    const timeouts = timings.map((ms, i) =>
      setTimeout(() => setLoadingStep(i + 1), ms)
    )
    const done = setTimeout(() => {
      setAppState("report")
    }, 3800)
    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [appState])

  function handleSubmit() {
    if (!idea.trim()) return
    setSubmittedIdea(idea)
    setAppState("loading")
  }

  function handleNewValidation() {
    setIdea("")
    setSubmittedIdea("")
    setAppState("empty")
    setLoadingStep(0)
  }

  return (
    <div
      className="flex min-h-screen [font-family:var(--font-inter),system-ui,sans-serif]"
      style={{ background: "#000000" }}
    >
      <Sidebar onNewValidation={handleNewValidation} />

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

        <TopBar />

        {appState === "empty" && (
          <EmptyState idea={idea} onIdeaChange={setIdea} onSubmit={handleSubmit} />
        )}
        {appState === "loading" && <LoadingScreen step={loadingStep} />}
        {appState === "report" && <ReportPlaceholder idea={submittedIdea} />}
      </div>
    </div>
  )
}
