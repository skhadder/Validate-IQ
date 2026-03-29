"use client"

import { SURVEY_QUESTIONS, ACCENT, BORDER, TEXT_MUTED } from "@/types/workspace"
import type { SurveyAnswers } from "@/types/workspace"

export function SurveyScreen({
  answers,
  onChange,
  onSubmit,
  onBack,
}: {
  answers: SurveyAnswers
  onChange: (key: keyof SurveyAnswers, value: string) => void
  onSubmit: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-8 py-12">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#555]">
          Diligence query
        </p>
        <h2 className="mt-3 text-5xl font-bold leading-tight text-white">Where are you in the journey?</h2>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {SURVEY_QUESTIONS[0].options.map((opt) => {
            const selected = answers.stage === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange("stage", opt)}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition"
                style={{
                  borderColor: selected ? ACCENT : BORDER,
                  background: selected ? "rgba(45,212,191,0.08)" : "rgba(255,255,255,0.03)",
                  color: selected ? "#f8fafc" : TEXT_MUTED,
                }}
              >
                <span>{opt}</span>
                <span className="text-xs">{selected ? "◉" : "○"}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[#555]">
            Technical audit
          </p>
          <div className="flex flex-wrap gap-2">
            {SURVEY_QUESTIONS[1].options.map((opt) => {
              const selected = answers.technical === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange("technical", opt)}
                  className="rounded-lg border px-4 py-2 text-sm transition"
                  style={{
                    borderColor: selected ? ACCENT : BORDER,
                    background: selected ? "rgba(45,212,191,0.08)" : "rgba(255,255,255,0.03)",
                    color: selected ? "#ffffff" : TEXT_MUTED,
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {SURVEY_QUESTIONS.slice(2).map((q) => (
            <label key={q.key} className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#555]">
                {q.label}
              </span>
              <select
                value={answers[q.key]}
                onChange={(e) => onChange(q.key, e.target.value)}
                className="w-full rounded-lg border bg-[#1a1a1a] px-3 py-2.5 text-sm text-white outline-none"
                style={{ borderColor: BORDER }}
              >
                {q.options.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#1a1a1a]">
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-xs uppercase tracking-[0.14em] text-[#555] transition hover:text-white"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-lg border border-[#2a2a2a] bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-slate-200"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
