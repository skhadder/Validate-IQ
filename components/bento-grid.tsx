"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

const cardClass =
  "rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface-elevated)] p-6 transition-colors hover:border-[var(--landing-accent)]/35"

function MarketSizingCard() {
  const rows = [
    { label: "TAM", value: "$2.5B", w: "100%" },
    { label: "SAM", value: "$1.2B", w: "48%" },
    { label: "SOM", value: "$154.5M", w: "28%" },
  ]
  return (
    <div className="mt-6 space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)]">
        01 / Market analysis · Market sizing
      </p>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400">{r.label}</span>
            <span className="tabular-nums text-white">{r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm bg-[var(--landing-bg)]">
            <div
              className="h-full rounded-sm bg-slate-500/80 transition-all"
              style={{ width: r.w }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function SynthesisCard() {
  return (
    <div className="mt-6 space-y-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)]">
        02 / Executive summary · Synthesis
      </p>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Execution velocity</span>
          <span className="tabular-nums font-semibold text-[var(--landing-accent)]">93</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--landing-bg)]">
          <div className="h-full w-[93%] rounded-full bg-[var(--landing-accent)]" />
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Capital efficiency</span>
          <span className="tabular-nums text-[var(--landing-warm)]">200% / 20.9%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--landing-bg)]">
          <div
            className="h-full w-[62%] rounded-full bg-[var(--landing-warm)] opacity-90"
          />
        </div>
      </div>
    </div>
  )
}

function CompetitorCard() {
  const rows = [
    { name: "Acron Corp", tag: "Series B", tagClass: "border-[var(--landing-accent)]/40 text-[var(--landing-accent)]" },
    { name: "Globus Labs", tag: "Public", tagClass: "border-slate-500 text-slate-400" },
    { name: "Slash Systems", tag: "Seed", tagClass: "border-[var(--landing-warm)]/50 text-[var(--landing-warm)]" },
  ]
  return (
    <div className="mt-6 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)]">
        03 / Ecosystem · Competitor intel
      </p>
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg)]/60 px-3 py-2.5"
        >
          <span className="truncate text-sm font-medium text-white">{r.name}</span>
          <span
            className={cn(
              "shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              r.tagClass,
            )}
          >
            {r.tag}
          </span>
        </div>
      ))}
    </div>
  )
}

function DevilsAdvocateCard() {
  return (
    <div className="mt-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)]">
        04 / Risk mitigation · Devil&apos;s advocate
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        Regulatory shifts in data residency could extend sales cycles. Cap table concentration may limit option pool
        refresh — model dilution before Series A conversations.
      </p>
    </div>
  )
}

function IcpCard() {
  return (
    <div className="mt-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)]">
        05 / Audience · Substitutes &amp; ICP
      </p>
      <div className="mt-5 flex items-center gap-2">
        <div className="flex -space-x-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--landing-surface-elevated)] bg-gradient-to-br from-slate-600 to-slate-800 text-[10px] font-bold text-white"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg)] text-xs font-semibold text-[var(--landing-muted)]">
          +22
        </span>
        <Users className="ml-auto h-5 w-5 text-[var(--landing-muted)]" aria-hidden />
      </div>
    </div>
  )
}

export function BentoGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      id="product"
      className="bg-[var(--landing-bg)] px-4 pb-20 pt-4 sm:px-6 lg:px-8"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            The memo, decomposed.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--landing-muted)] sm:text-base">
            Every run produces structured sections you can defend in a room — not a wall of chat.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <motion.article variants={itemVariants} className={cardClass}>
            <h3 className="text-lg font-semibold text-white">Market sizing</h3>
            <p className="mt-1 text-sm text-[var(--landing-muted)]">
              TAM, SAM, SOM with cited ranges — sized before you commit engineering time.
            </p>
            <MarketSizingCard />
          </motion.article>

          <motion.article variants={itemVariants} className={cardClass}>
            <h3 className="text-lg font-semibold text-white">Executive synthesis</h3>
            <p className="mt-1 text-sm text-[var(--landing-muted)]">
              Compressed signals: momentum, efficiency, and where the story breaks.
            </p>
            <SynthesisCard />
          </motion.article>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <motion.article variants={itemVariants} className={cardClass}>
            <h3 className="text-lg font-semibold text-white">Competitor intel</h3>
            <p className="mt-1 text-sm text-[var(--landing-muted)]">Who raised, who&apos;s quiet, who&apos;s eating your lunch.</p>
            <CompetitorCard />
          </motion.article>

          <motion.article variants={itemVariants} className={cardClass}>
            <h3 className="text-lg font-semibold text-white">Devil&apos;s advocate</h3>
            <p className="mt-1 text-sm text-[var(--landing-muted)]">Failure patterns and structural risks in your space.</p>
            <DevilsAdvocateCard />
          </motion.article>

          <motion.article variants={itemVariants} className={cardClass}>
            <h3 className="text-lg font-semibold text-white">Substitutes &amp; ICP</h3>
            <p className="mt-1 text-sm text-[var(--landing-muted)]">Who pays, what they use today, and good-enough alternatives.</p>
            <IcpCard />
          </motion.article>
        </motion.div>
      </div>
    </section>
  )
}
