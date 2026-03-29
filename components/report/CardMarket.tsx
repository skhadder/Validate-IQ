"use client"

import { CardShell } from "./CardShell"
import { extractGrowthRate, extractMarketValue, TrendChart } from "@/lib/report-utils"
import type { ReportData } from "@/types/report"

export function CardMarket({
  data,
  confidence,
  onEdit,
}: {
  data: ReportData["market"]
  confidence: string
  onEdit: () => void
}) {
  return (
    <CardShell sectionNum="02" title="Market opportunity" confidence={confidence} onEdit={onEdit} anchorId="report-section-market">
      <div className="grid grid-cols-3 divide-x divide-[#1e1e1e] rounded-xl border border-[#1e1e1e] bg-[#0d0d0d]">
        {[
          { label: "TAM", desc: "Total addressable market", value: data.tam, methodology: data.tamMethodology, source: data.tamSource },
          { label: "SAM", desc: "Serviceable addressable market", value: data.sam, methodology: data.samMethodology, source: undefined },
          { label: "SOM", desc: "Serviceable obtainable market", value: data.som, methodology: data.somMethodology, source: undefined },
        ].map(({ label, desc, value, methodology, source }) => (
          <div key={label} className="flex flex-col p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">{label}</span>
            <span className="text-[28px] font-bold tabular-nums text-white leading-none">{extractMarketValue(value)}</span>
            <span className="mt-1 text-[11px] text-[#555]">{desc}</span>
            {methodology && (
              <p className="mt-3 text-[11px] leading-relaxed text-[#444] border-t border-[#1a1a1a] pt-3">{methodology}</p>
            )}
            {source && (
              <p className="mt-1 text-[10px] text-[#333] italic">{source}</p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">Path</p>
          <p className="m-0 text-[14px] font-medium leading-snug text-white">
            {data.growthRate ? `${extractGrowthRate(data.growthRate)} growth curve` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-500">Timing</p>
          <p className="m-0 text-[14px] font-medium leading-snug text-white">
            {data.marketTiming ? `${data.marketTiming} stage` : "—"}
            {data.marketTiming === "Late" ? " / consolidation" : ""}
          </p>
        </div>
      </div>
      {data.growthRate ? <TrendChart growthRate={data.growthRate} timing={data.marketTiming ?? "Early"} /> : null}
      <p className="mt-5 max-w-3xl text-[15px] font-normal leading-relaxed text-[#aaa]">{data.marketTimingReason}</p>
    </CardShell>
  )
}
