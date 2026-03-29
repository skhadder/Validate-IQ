"use client"

import { CardShell } from "./CardShell"
import type { ReportData } from "@/types/report"

export function CardKillCriteria({
  data,
  confidence,
  onEdit,
  anchorId,
}: {
  data: ReportData["verdict"]
  confidence: string
  onEdit: () => void
  anchorId?: string
}) {
  const risks = data.topRisks ?? []
  if (risks.length === 0) return null
  return (
    <CardShell sectionNum="05" title="Kill criteria" confidence={confidence} onEdit={onEdit} dangerBorder anchorId={anchorId}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--report-accent-bright)" }}>
        We&apos;d change our mind if…
      </p>
      <ol className="m-0 list-decimal space-y-2 pl-5" style={{ color: "var(--report-body)", fontSize: 15, lineHeight: 1.65 }}>
        {risks.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ol>
    </CardShell>
  )
}
