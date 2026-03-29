"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Printer, Share2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { viabilityWhenSaving } from "@/lib/viability-score"
import { stripCitations } from "@/lib/report-utils"
import type { ReportData, Survey } from "@/types/report"

import { ReportHero } from "@/components/report/ReportHero"
import { CardSnapshot } from "@/components/report/CardSnapshot"
import { CardMarket } from "@/components/report/CardMarket"
import { CardCompetitors } from "@/components/report/CardCompetitors"
import { CardEntryScore } from "@/components/report/CardEntryScore"
import { CardKillCriteria } from "@/components/report/CardKillCriteria"
import { CardDevilsAdvocate } from "@/components/report/CardDevilsAdvocate"
import { IdeaProfileTab } from "@/components/report/IdeaProfileTab"
import { SourcesTab } from "@/components/report/SourcesTab"
import { Chatbot } from "@/components/report/Chatbot"

const CARD_EDIT_MESSAGES: Record<string, string> = {
  snapshot: "Edit the idea snapshot — help me refine my one-liner to be more specific and compelling",
  market: "Edit market signals — re-run the market sizing with different geography or a broader market definition",
  competitors: "Edit competitor intel — find more specific or different competitors in my exact space",
  entryScore: "Edit market entry score — recalculate based on my updated founder profile and resources",
  verdict: "Edit verdict — explain the viability score in detail and what changes would improve it",
  devilsAdvocate: "Edit devil's advocate — find different or more recent failure examples in my category",
}

const NAV_LINKS: { key: "snapshot" | "market" | "due" | "risk"; label: string; id: string }[] = [
  { key: "snapshot", label: "SNAPSHOT", id: "report-section-snapshot" },
  { key: "market", label: "MARKET", id: "report-section-market" },
  { key: "due", label: "DUE DILIGENCE", id: "report-section-due" },
  { key: "risk", label: "RISK", id: "report-section-risk" },
]

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

      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (domHeight * pdfWidth) / domWidth
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 10) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      const slug = idea.split(" ").slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "")
      pdf.save(`Verdict-${slug || "Report"}.pdf`)
    } catch {
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

  function goNavSection(key: "snapshot" | "market" | "due" | "risk", id: string) {
    setActiveNavKey(key)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
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

  const memoDateStr = reportDate
    ? new Date(reportDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Today"

  const hasKillRisks = (report.verdict.topRisks ?? []).length > 0

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
          <CardSnapshot
            data={report.snapshot}
            confidence={report.confidence?.snapshot ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.snapshot)}
          />
          <CardMarket
            data={report.market}
            confidence={report.confidence?.market ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.market)}
          />
          <CardCompetitors
            data={report.competitors}
            confidence={report.confidence?.competitors ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.competitors)}
          />
          <CardEntryScore
            data={report.entryScore}
            confidence={report.confidence?.entryScore ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.entryScore)}
            nextAction={report.verdict.nextAction}
          />
          <CardKillCriteria
            data={report.verdict}
            confidence={report.confidence?.verdict ?? "Medium"}
            onEdit={() => focusChatInput(CARD_EDIT_MESSAGES.verdict)}
            anchorId={hasKillRisks ? "report-section-risk" : undefined}
          />
          <CardDevilsAdvocate
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
