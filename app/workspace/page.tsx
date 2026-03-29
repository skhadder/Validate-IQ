"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import demoData from "@/lib/demo-data.json"
import { DEFAULT_SURVEY } from "@/types/workspace"
import type { AppState, WorkspaceView, SurveyAnswers, SavedReport } from "@/types/workspace"

import { Sidebar } from "@/components/workspace/Sidebar"
import { EmptyState } from "@/components/workspace/EmptyState"
import { SurveyScreen } from "@/components/workspace/SurveyScreen"
import { LoadingScreen } from "@/components/workspace/LoadingScreen"
import { HistoryScreen } from "@/components/workspace/HistoryScreen"

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
