"use client"

import { LOADING_STEPS, ACCENT, BORDER, TEXT_MUTED } from "@/types/workspace"

export function LoadingScreen({
  step,
  error,
  onGoBack,
}: {
  step: number
  error?: boolean
  onGoBack?: () => void
}) {
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full max-w-xl rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="text-2xl font-semibold text-white">Validation failed</p>
          <p className="mt-3 text-sm text-[#555]">
            Something went wrong while scanning your market. Please retry.
          </p>
          <button
            type="button"
            onClick={onGoBack}
            className="mt-6 rounded-lg border border-[#2a2a2a] px-6 py-2 text-xs uppercase tracking-[0.14em] text-white transition hover:bg-white/5"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const safeStep = Math.min(step, LOADING_STEPS.length - 1)
  const progress = ((safeStep + 1) / LOADING_STEPS.length) * 100

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <div className="w-full max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#555]">Current operation</p>
        <h2 className="mt-3 text-balance text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          {LOADING_STEPS[safeStep]} for your startup concept
        </h2>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-left sm:p-8">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#1e1e1e]">
            <div
              className="h-full rounded-full bg-teal-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            {LOADING_STEPS.map((label, i) => {
              const done = i < step
              const active = i === safeStep
              return (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs"
                    style={{
                      borderColor: done ? ACCENT : active ? "#888" : BORDER,
                      color: done ? ACCENT : active ? "#ffffff" : TEXT_MUTED,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    style={{
                      color: done ? "color-mix(in srgb, #2dd4bf 55%, white)" : active ? "#ffffff" : TEXT_MUTED,
                    }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-[#2a2a2a] pt-4 text-[11px] uppercase tracking-[0.15em] text-[#555] sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <span>Neural processing at {Math.min(99, Math.round(progress))}%</span>
            <span>Est. completion: {Math.max(1, 20 - safeStep * 3)}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}
