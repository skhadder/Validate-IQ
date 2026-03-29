"use client"

import { useState } from "react"
import { SURVEY_OPTIONS } from "@/types/report"
import type { Survey } from "@/types/report"

export function IdeaProfileTab({
  survey,
  onFieldSelect,
}: {
  survey: Survey
  onFieldSelect: (key: keyof Survey, value: string) => void
}) {
  const [openField, setOpenField] = useState<keyof Survey | null>(null)

  const rows: { label: string; key: keyof Survey }[] = [
    { label: "Stage", key: "stage" },
    { label: "Technical", key: "technical" },
    { label: "Budget", key: "budget" },
    { label: "Time", key: "time" },
    { label: "Network", key: "network" },
    { label: "Geography", key: "geography" },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#444]">YOUR FOUNDER PROFILE</p>
      <div className="flex flex-col divide-y divide-[#1a1a1a]">
        {rows.map(({ label, key }) => (
          <div key={key} className="flex flex-col">
            <button
              type="button"
              onClick={() => setOpenField(openField === key ? null : key)}
              className="flex items-center justify-between py-2 text-left"
            >
              <span className="text-[10px] uppercase tracking-widest text-[#444] w-20 shrink-0">{label}</span>
              <span className="flex-1 truncate text-xs font-semibold text-white">{survey[key]}</span>
              <span className="ml-2 text-[10px] text-[#333]">{openField === key ? "▲" : "▼"}</span>
            </button>
            {openField === key && (
              <div className="flex flex-wrap gap-1 pb-2">
                {SURVEY_OPTIONS[key].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setOpenField(null); onFieldSelect(key, opt) }}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] transition-colors"
                    style={{
                      background: survey[key] === opt ? "var(--report-accent)" : "transparent",
                      borderColor: survey[key] === opt ? "var(--report-accent)" : "var(--report-border)",
                      color: survey[key] === opt ? "#ffffff" : "var(--report-body)",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2.5 border-t border-[#1a1a1a] pt-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] text-xs font-semibold text-white">
          A
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white">Analyst</p>
          <p className="text-[10px] text-[#444]">Standard Tier</p>
        </div>
      </div>
    </div>
  )
}
