"use client"

import { CardShell } from "./CardShell"
import type { ReportData } from "@/types/report"

export function CardSnapshot({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["snapshot"]
  confidence: string
  onEdit: () => void
}) {
  const clarityUnit = data.clarityScore <= 1 ? data.clarityScore : data.clarityScore / 10
  const clarityHigh = data.clarityScore >= 8 || clarityUnit >= 0.8
  const clarityModerate = data.clarityScore >= 4 || clarityUnit >= 0.4
  const clarityShort = clarityHigh ? "HIGH" : clarityModerate ? "MODERATE" : "LOW"
  const problemDefined = Boolean(data.problem?.trim())
  const customerDefined = Boolean(data.targetCustomer?.trim())

  return (
    <CardShell
      sectionNum="01"
      title="Snapshot"
      onEdit={onEdit}
      anchorId="report-section-snapshot"
      showConfidencePill={false}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">
            CORE PROBLEM · {problemDefined ? "DEFINED" : "NOT DEFINED"}
          </p>
          <p className="text-sm leading-relaxed text-[#aaa]">{data.problem?.trim() || "—"}</p>
        </div>
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">
            PRIMARY CUSTOMER · {customerDefined ? "DEFINED" : "NOT DEFINED"}
          </p>
          <p className="text-sm leading-relaxed text-[#aaa]">{data.targetCustomer?.trim() || "—"}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full border border-[#2a2a2a] px-3 py-1 text-[10px] text-[#666]">
          CLARITY · {clarityShort}
        </span>
        <span className="inline-block rounded-full border border-[#2a2a2a] px-3 py-1 text-[10px] text-[#666]">
          CONFIDENCE · {confidence.toUpperCase()}
        </span>
      </div>
    </CardShell>
  )
}
