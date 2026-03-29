"use client"

import { CardShell } from "./CardShell"
import type { ReportData } from "@/types/report"

function competitorImpactLabel(i: number): { label: string; color: string } {
  if (i === 0) return { label: "High impact", color: "var(--report-accent-bright)" }
  if (i === 1) return { label: "Mid impact", color: "var(--report-orange)" }
  return { label: "Low impact", color: "var(--report-muted)" }
}

export function CardCompetitors({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["competitors"]
  confidence: string
  onEdit: () => void
}) {
  return (
    <CardShell sectionNum="03" title="Competitors" confidence={confidence} onEdit={onEdit} anchorId="report-section-due">
      <div className="flex flex-col divide-y" style={{ borderColor: "var(--report-border)" }}>
        {(data.competitors ?? []).map((c, i) => {
          const imp = competitorImpactLabel(i)
          return (
            <div
              key={i}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              style={{ borderColor: "var(--report-border)" }}
            >
              <div className="flex flex-col gap-0.5 min-w-0 max-w-2xl">
                <span className="text-white" style={{ fontSize: "15px", fontWeight: 600 }}>
                  {c.name}
                </span>
                <span style={{ fontSize: "13px", color: "var(--report-muted)" }}>
                  {c.funding} · {c.pricing} · {c.lastActivity}
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide" style={{ color: imp.color }}>
                {imp.label}
              </span>
            </div>
          )
        })}
      </div>
      <div
        className="rounded-md p-3 mt-3"
        style={{ background: "var(--report-elevated)", border: "1px solid var(--report-border)" }}
      >
        <p className="font-bold mb-1.5" style={{ fontSize: "11px", color: "var(--landing-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Gap identified
        </p>
        <p style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.75", color: "var(--report-body)" }}>
          {data.gapStatement}
        </p>
      </div>
    </CardShell>
  )
}
