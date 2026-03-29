"use client"

import { useEffect, useRef } from "react"
import { ArrowUp } from "lucide-react"
import { MAX_CHARS, SUGGESTION_CHIPS } from "@/types/workspace"

export function EmptyState({
  idea,
  onIdeaChange,
  onSubmit,
}: {
  idea: string
  onIdeaChange: (v: string) => void
  onSubmit: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value.slice(0, MAX_CHARS)
    onIdeaChange(val)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (idea.trim()) onSubmit()
    }
  }

  function handleChip(prompt: string) {
    onIdeaChange(prompt.slice(0, MAX_CHARS))
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
        textareaRef.current.focus()
      }
    }, 0)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-4 min-h-0">
        <p className="select-none text-[120px] font-bold leading-none text-[#1e1e1e]">V</p>

        <div className="mt-6 grid w-full max-w-3xl grid-cols-3 gap-3">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip.category}
              type="button"
              onClick={() => handleChip(chip.prompt)}
              className="flex flex-col rounded-2xl border border-[#2a2a2a] bg-transparent px-5 py-4 text-left transition hover:border-[#3a3a3a] cursor-pointer"
            >
              <span className="truncate text-sm font-medium text-white">{chip.title}</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-[#444]">{chip.category}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-8 pb-6 pt-4" style={{ background: "linear-gradient(to top, #0d0d0d 80%, transparent)" }}>
        <div className="flex min-h-[52px] items-end gap-3 rounded-full border border-[#2a2a2a] bg-[#111] py-2.5 pl-7 pr-3 sm:pl-8">
          <textarea
            ref={textareaRef}
            value={idea}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your startup concept..."
            rows={1}
            className="max-h-40 min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-sm leading-relaxed text-white outline-none ring-0 placeholder:text-[#444] focus:ring-0"
            style={{ overflowY: "auto" }}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!idea.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[#0d0d0d] transition hover:bg-teal-300 disabled:opacity-30"
            aria-label="Submit"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-[#333]">
          Verdict may make mistakes. Verify key claims against primary source documentation.
        </p>
      </div>
    </div>
  )
}
