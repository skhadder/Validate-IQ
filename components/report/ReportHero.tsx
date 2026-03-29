"use client"

import { safeScore, useCountUp } from "@/lib/report-utils"
import type { ReportData } from "@/types/report"

export function ReportHero({
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
