"use client"

import { CardShell } from "./CardShell"
import { renderMarkdown } from "@/lib/report-utils"
import type { ReportData } from "@/types/report"

export function CardDevilsAdvocate({
  data,
  confidence,
  onEdit,
  anchorId,
}: {
  data: ReportData["devilsAdvocate"]
  confidence: string
  onEdit: () => void
  anchorId?: string
}) {
  return (
    <CardShell sectionNum="06" title="Devil's advocate" confidence={confidence} onEdit={onEdit} anchorId={anchorId}>
      <div className="flex flex-col divide-y divide-[#1e1e1e]">
        {(data.failures ?? []).map((f, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr] gap-6 py-4 first:pt-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--report-accent-bright)" }}>
                  Failed
                </span>
                {f.year ? <span className="text-[10px] text-[#444]">{f.year}</span> : null}
              </div>
              <span className="font-bold text-white" style={{ fontSize: "15px" }}>{f.name}</span>
              <p className="mt-1.5" style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-muted)" }}>{f.what}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
                So what for you
              </p>
              <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-body)" }}>{f.why}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-[#1e1e1e] bg-[#0d0d0d] p-4 mt-2">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
          The pattern
        </p>
        <p style={{ fontSize: "14px", lineHeight: "1.75", color: "var(--report-body)" }}>{renderMarkdown(data.thePattern)}</p>
      </div>

      {data.survivalRule && (
        <p className="italic mt-3 border-l-2 border-[#2a2a2a] pl-4" style={{ fontSize: "13px", lineHeight: "1.75", color: "var(--report-muted)" }}>
          {renderMarkdown(data.survivalRule)}
        </p>
      )}
    </CardShell>
  )
}
