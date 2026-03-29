"use client"

import { useMemo } from "react"
import { ExternalLink, Plus, Trash2 } from "lucide-react"
import { viabilityForLedgerEntry } from "@/lib/viability-score"
import { verdictTone, formatDate, formatArchiveHeaderDate } from "@/types/workspace"
import type { SavedReport } from "@/types/workspace"

export function HistoryScreen({
  reports,
  onOpen,
  onDelete,
  onArchiveDiscovery,
}: {
  reports: SavedReport[]
  onOpen: (r: SavedReport) => void
  onDelete: (id: string) => void
  onArchiveDiscovery: () => void
}) {
  const sorted = useMemo(() => [...reports].sort((a, b) => +new Date(b.date) - +new Date(a.date)), [reports])
  const lastUpdated = sorted[0]?.date ?? ""
  const n = sorted.length

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex w-fit rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white">
          {n} {n === 1 ? "Archive Entry" : "Archive Entries"}
        </span>
        <p className="text-[11px] uppercase tracking-[0.14em] text-white">
          Last updated:{" "}
          <span className="text-[#555]">{lastUpdated ? formatArchiveHeaderDate(lastUpdated) : "—"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {sorted.map((r) => {
          const score = viabilityForLedgerEntry(r.report as object, r.viabilityScore)
          return (
            <article
              key={r.id}
              className="flex min-h-[280px] flex-col rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-colors hover:border-[#3a3a3a]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${verdictTone(r.verdict)}`}>
                  {r.verdict.replace("CONDITIONAL GO", "CONDITIONAL")}
                </span>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#555]">Score</p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-white">
                    {score}
                    <span className="text-sm font-semibold text-[#555]">/10</span>
                  </p>
                </div>
              </div>
              <h3 className="line-clamp-4 min-h-0 flex-1 text-base font-medium leading-snug text-white">{r.idea}</h3>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#2a2a2a] pt-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#555]">{formatDate(r.date)}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpen(r)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-white/80 transition hover:bg-white/5 hover:text-white"
                    aria-label="Open memo"
                  >
                    <ExternalLink size={16} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-white/55 transition hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Delete memo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}

        <button
          type="button"
          onClick={onArchiveDiscovery}
          className="flex min-h-[280px] flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-[#2a2a2a] p-6 transition hover:border-[#3a3a3a] hover:bg-white/[0.02]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#111] text-white/90">
            <Plus size={26} strokeWidth={1.5} />
          </span>
          <span className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white">
            New analysis
          </span>
        </button>
      </div>
    </div>
  )
}
