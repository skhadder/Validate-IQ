"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "How accurate is the research?",
    a: "Verdict uses live web search and structured prompts — not a static model cutoff. Every section can be wrong when the web is thin or noisy; use citations as a starting point and run your own customer discovery before major bets.",
  },
  {
    q: "What is the methodology?",
    a: "We run parallel research passes for market sizing, competitors, entry dynamics, verdict synthesis, and failure patterns, then merge into one memo. Scores are calibrated anchors, not predictions of your revenue.",
  },
  {
    q: "Is my founder data private?",
    a: "Your idea and profile are sent only to generate the report. We don’t use your inputs to train models. Today, reports live in your browser (localStorage); server-side storage is on the roadmap when auth ships.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "Live retrieval, a fixed report schema, founder-profile personalization, and explicit devil’s-advocate failure research — so you get a memo, not a chat thread.",
  },
  {
    q: "How long does a run take?",
    a: "About 30–60 seconds. Multiple research calls run in parallel so you get the full memo in one shot.",
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-[var(--landing-border)]"
    >
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="text-base font-medium text-white">{q}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
            open ? "bg-[var(--landing-accent)] text-[var(--landing-cta-on-light)]" : "bg-[var(--landing-surface)] text-[var(--landing-muted)]",
          )}
        >
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[var(--landing-muted)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  return (
    <section
      id="faq"
      className="bg-[var(--landing-bg)] px-4 py-20"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--landing-accent)]">
            Framework
          </p>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Diligence framework FAQ
          </h2>
        </motion.div>

        <div>
          {FAQS.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
