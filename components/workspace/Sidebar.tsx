"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Archive, Clock, MoreHorizontal, Pencil, Search } from "lucide-react"
import type { SavedReport, WorkspaceView } from "@/types/workspace"

export function Sidebar({
  activeView,
  onViewChange,
  onNewValidation,
  savedReports,
  onLoadReport,
  onDelete: _onDelete,
}: {
  activeView: WorkspaceView
  onViewChange: (view: WorkspaceView) => void
  onNewValidation: () => void
  savedReports: SavedReport[]
  onLoadReport: (r: SavedReport) => void
  onDelete: (_id: string) => void
}) {
  const recent = useMemo(
    () => [...savedReports].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 4),
    [savedReports],
  )

  const tools = [
    { id: "new" as const, label: "HISTORY", Icon: Clock },
    { id: "history" as const, label: "ARCHIVE", Icon: Archive },
    { id: "research" as const, label: "RESEARCH", Icon: Search },
  ]

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[240px] shrink-0 flex-col overflow-hidden bg-[#111111] px-5 pb-5">
      <div className="shrink-0 pt-6 pb-5">
        <Link href="/" className="group w-fit block">
          <p className="font-heading text-xl font-bold tracking-[0.2em] text-white transition group-hover:opacity-80">
            VERDICT
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.22em] text-[#555] transition group-hover:opacity-80">
            Venture Diligence
          </p>
        </Link>
      </div>

      <div className="shrink-0 pb-4">
        <button
          type="button"
          onClick={onNewValidation}
          className="flex w-full items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] px-4 py-2.5 text-sm text-white transition hover:bg-[#242424]"
        >
          <span>New Analysis</span>
          <Pencil size={14} className="text-[#555]" />
        </button>
      </div>

      <div className="shrink-0 border-t border-[#1e1e1e] mb-4" />

      <div className="shrink-0">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#444]">Recent</p>
        {recent.length === 0 ? (
          <p className="text-sm text-[#444]">No analyses yet.</p>
        ) : (
          <ul className="space-y-0.5">
            {recent.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onLoadReport(r)}
                  className="w-full truncate text-left text-sm text-[#888] transition hover:text-white py-1"
                >
                  {r.idea}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-[#1e1e1e] my-4" />

      <div className="shrink-0">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#444]">Tools</p>
        <ul className="space-y-0.5">
          {tools.map(({ id, label, Icon }) => {
            const active = activeView === id
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onViewChange(id)}
                  className={`flex w-full items-center gap-2.5 py-1.5 text-sm transition ${
                    active
                      ? "border-l-2 border-teal-400 pl-2 text-white"
                      : "text-[#555] hover:text-[#888] pl-[3px]"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex-1" />

      <div className="shrink-0 border-t border-[#1e1e1e] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] text-[11px] font-bold text-[#888]">
            A4
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">Analyst 04</p>
          <button
            type="button"
            className="shrink-0 text-[#444] transition hover:text-[#888]"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
