"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp } from "lucide-react"
import { renderMarkdown } from "@/lib/report-utils"
import type { ReportData, ChatMessage } from "@/types/report"

const SUGGESTIONS = [
  "Why this score?",
  "Biggest risk to fix",
  "Compare with Segment Median",
]

export function Chatbot({
  report,
  inputValue,
  onInputChange,
  inputRef,
}: {
  report: ReportData
  inputValue: string
  onInputChange: (v: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [chatHeight, setChatHeight] = useState(80)
  const chatHeightRef = useRef(80)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const rafRef = useRef<number | null>(null)

  function onDragStart(e: React.MouseEvent) {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startHeight: chatHeightRef.current }
    document.body.style.cursor = "ns-resize"
    document.body.style.userSelect = "none"

    function onMouseMove(ev: MouseEvent) {
      if (!dragRef.current) return
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        if (!dragRef.current) return
        const delta = dragRef.current.startY - ev.clientY
        const next = Math.min(480, Math.max(80, dragRef.current.startHeight + delta))
        chatHeightRef.current = next
        if (chatScrollRef.current) chatScrollRef.current.style.height = `${next}px`
      })
    }

    function onMouseUp() {
      setChatHeight(chatHeightRef.current)
      dragRef.current = null
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: "user", content: text }
    const history = messages.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.content,
    }))
    setMessages((prev) => [...prev, userMsg])
    onInputChange("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, reportContext: report, history }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col border-t border-[#1e1e1e] px-4 pb-4 pt-4">
      <div
        onMouseDown={onDragStart}
        className="flex cursor-ns-resize select-none items-center justify-center border-b border-[#1a1a1a] py-2 transition-colors hover:border-[#2a2a2a]"
        title="Drag to resize"
      >
        <div className="h-[2px] w-6 rounded-full bg-[#222]" />
      </div>

      <div className="flex items-center gap-2 pt-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[9px] font-bold text-[#0d0d0d]">
          V
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white">Dossier AI</p>
      </div>

      {messages.length === 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="w-full rounded-xl border border-[#1e1e1e] bg-transparent px-4 py-3 text-left text-sm text-[#888] transition hover:border-[#3a3a3a] hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={(el) => {
          ;(scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          ;(chatScrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        className="mt-3 flex flex-col gap-1.5 overflow-y-auto"
        style={{ height: messages.length > 0 ? chatHeight : 0, minHeight: messages.length > 0 ? 120 : 0 }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-1.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "bot" && (
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[8px] font-bold text-[#0d0d0d]">
                V
              </div>
            )}
            <div
              className="max-w-[85%] rounded-md border border-[#1e1e1e] px-2.5 py-1.5"
              style={{
                fontSize: "13px",
                lineHeight: "1.75",
                background: m.role === "bot" ? "#111" : "#0d0d0d",
                color: m.role === "bot" ? "#aaa" : "#e5e5e5",
              }}
            >
              {m.role === "bot" ? renderMarkdown(m.content) : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1.5">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[8px] font-bold text-[#0d0d0d]">
              V
            </div>
            <div className="rounded-md border border-[#1e1e1e] bg-[#111] px-2 py-1.5 text-[12px] text-[#666]">Thinking…</div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage(inputValue)
          }}
          placeholder="Type a command…"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#333]"
        />
        <button
          type="button"
          onClick={() => sendMessage(inputValue)}
          title="Send message"
          aria-label="Send message"
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-400 text-[#0d0d0d] transition-opacity hover:opacity-90"
        >
          <ArrowUp size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
