/** Static shell for the funding ticker — used as `dynamic(..., { loading })` so SSR/hydration stay aligned. */
export function FundingTickerSkeleton() {
  return (
    <section className="w-full min-w-0 bg-[var(--landing-bg)] py-2 sm:py-2.5" aria-hidden>
      <div
        className="flex w-full min-h-[44px] items-center overflow-hidden rounded-none border-y border-[var(--landing-border)] bg-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
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
            <div className="flex h-full items-center pl-2">
              <span className="text-xs text-[var(--landing-muted)] sm:text-sm">Loading live funding feed...</span>
            </div>
          </div>
      </div>
    </section>
  )
}
