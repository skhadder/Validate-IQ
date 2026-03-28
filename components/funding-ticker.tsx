"use client"

import { useEffect, useState } from "react"

interface FundedStartup {
  name: string
  amount: string
  round: string
}

/** Client fallback if API returns empty (matches server fallback tone). */
const FALLBACK: FundedStartup[] = [
  { name: "Anchorage Digital", amount: "$100M", round: "Equity" },
  { name: "OpenAI", amount: "$110B", round: "Venture" },
  { name: "Anthropic", amount: "$30B", round: "Venture" },
  { name: "Waymo", amount: "$16B", round: "Venture" },
  { name: "Rapidus", amount: "$1B+", round: "Venture" },
  { name: "Mistral AI", amount: "$640M", round: "Series B" },
]

export default function FundingTicker() {
  const [rows, setRows] = useState<FundedStartup[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/funded-startups")
      .then((r) => r.json())
      .then((d: { startups?: FundedStartup[] }) => {
        if (cancelled) return
        const list = d.startups?.filter((s) => s?.name && s?.amount) ?? []
        setRows(list.length > 0 ? list : FALLBACK)
      })
      .catch(() => {
        if (!cancelled) setRows(FALLBACK)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const displayRows = rows.length > 0 ? rows : FALLBACK
  const loop = ready ? [...displayRows, ...displayRows] : []

  return (
    <section className="w-full min-w-0 bg-[var(--landing-bg)] py-2 sm:py-2.5" aria-label="Recent funding rounds">
      <div
        className="flex w-full min-h-[44px] items-center overflow-hidden rounded-none border-y border-[var(--landing-border)] bg-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
        role="status"
        aria-busy={!ready}
      >
          <div className="flex shrink-0 items-center gap-2.5 self-stretch border-r border-[var(--landing-border)] py-2.5 pl-4 pr-4 sm:pl-5 sm:pr-5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--landing-accent)] opacity-55" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--landing-accent)]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--landing-accent)] sm:text-[11px]">
              Live
            </span>
          </div>

          <div className="min-h-[44px] min-w-0 flex-1 overflow-hidden py-2 pr-3 sm:pr-4">
            {!ready ? (
              <div className="flex h-full items-center pl-2">
                <span className="text-xs text-[var(--landing-muted)] sm:text-sm">Loading live funding feed...</span>
              </div>
            ) : (
              <div className="landing-ticker-track">
                {loop.map((s, i) => (
                  <span
                    key={`${s.name}-${s.amount}-${i}`}
                    className="inline-flex items-baseline gap-2 pr-12 text-[13px] whitespace-nowrap sm:gap-2.5 sm:pr-16 sm:text-sm"
                  >
                    <span className="font-semibold text-white">{s.name}</span>
                    <span className="font-semibold tabular-nums text-[var(--landing-accent)]">{s.amount}</span>
                    <span className="text-[var(--landing-muted)]">{s.round}</span>
                    <span className="select-none text-[var(--landing-border)]">·</span>
                  </span>
                ))}
              </div>
            )}
          </div>
      </div>
    </section>
  )
}
