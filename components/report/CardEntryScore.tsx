"use client"

import { CardShell } from "./CardShell"
import { safeScore, getBarrierLevel, getBarrierColors, Dot } from "@/lib/report-utils"
import type { ReportData } from "@/types/report"

export function CardEntryScore({
  data,
  confidence,
  onEdit,
  nextAction,
}: {
  data: ReportData["entryScore"]
  confidence: string
  onEdit: () => void
  nextAction?: string
}) {
  const score = safeScore(data.entryScore)
  const bc = getBarrierColors(score)
  return (
    <CardShell sectionNum="04" title="Entry strategy" confidence={confidence} onEdit={onEdit}>
      <div className="flex items-center gap-3 flex-wrap">
        <span style={{ fontSize: "36px", fontWeight: 700, color: bc.color, lineHeight: 1 }}>
          {score}<span style={{ fontSize: "16px", fontWeight: 400, color: "var(--report-muted)" }}>/10</span>
        </span>
        <span
          className="px-2.5 py-1 rounded-full font-semibold"
          style={{ fontSize: "11px", background: bc.bg, color: bc.color, border: `1px solid ${bc.border}` }}
        >
          {getBarrierLevel(score)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p style={{ fontSize: "12px", color: "var(--report-muted)" }}>Based on your founder profile</p>
        <div className="w-full" style={{ height: "4px", background: "var(--report-border)", borderRadius: "99px" }}>
          <div style={{ width: `${(score / 10) * 100}%`, height: "100%", borderRadius: "99px", background: bc.bar }} />
        </div>
        <div className="flex justify-between">
          <span style={{ fontSize: "10px", color: "var(--report-muted)" }}>Low Risk</span>
          <span style={{ fontSize: "10px", color: "var(--report-muted)" }}>High Risk</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="flex flex-col gap-2">
          <p className="uppercase tracking-widest" style={{ fontSize: "10px", fontWeight: 700, color: "var(--report-muted)" }}>Barriers</p>
          {(data.barriers ?? []).map((b, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Dot color="var(--report-accent-bright)" />
              <span style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-body)" }}>{b}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="uppercase tracking-widest" style={{ fontSize: "10px", fontWeight: 700, color: "var(--report-muted)" }}>Advantages</p>
          {(data.advantages ?? []).map((a, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Dot color="var(--landing-accent)" />
              <span style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--report-body)" }}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {data.fastestEntryPath ? (
        <div className="rounded-md p-3 mt-1" style={{ background: "var(--report-elevated)", border: "1px solid var(--report-border)" }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
            Fastest entry path
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.75", color: "var(--report-body)" }}>{data.fastestEntryPath}</p>
        </div>
      ) : null}

      {nextAction ? (
        <div className="rounded-md p-3 mt-1" style={{ background: "var(--report-elevated)", border: "1px solid var(--report-border)" }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--landing-accent)" }}>
            Next action
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.75", color: "var(--report-body)" }}>{nextAction}</p>
        </div>
      ) : null}
    </CardShell>
  )
}
