"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type StatConfig = {
  target: number
  format: (n: number) => string
}

const STATS: { label: string; config: StatConfig }[] = [
  {
    label: "Average report generation time",
    config: {
      target: 60,
      format: (n) => `${Math.round(n)} sec`,
    },
  },
  {
    label: "Data sources synthesized per report",
    config: {
      target: 12,
      format: (n) => `${Math.round(n)}+`,
    },
  },
  {
    label: "Ideas validated",
    config: {
      target: 8000,
      format: (n) => `${Math.round(n).toLocaleString("en-US")}+`,
    },
  },
  {
    label: "Found it more useful than manual research",
    config: {
      target: 91,
      format: (n) => `${Math.round(n)}%`,
    },
  },
]

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function useCountUp(target: number, durationMs: number, enabled: boolean): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let start: number | null = null

    const tick = (now: number) => {
      if (cancelled) return
      if (start === null) start = now
      const elapsed = now - start
      const t = Math.min(1, elapsed / durationMs)
      const eased = easeOutCubic(t)
      setValue(target * eased)
      if (t < 1) requestAnimationFrame(tick)
      else setValue(target)
    }

    const id = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
    }
  }, [enabled, target, durationMs])

  return value
}

function StatCard({
  label,
  config,
  enabled,
}: {
  label: string
  config: StatConfig
  enabled: boolean
}) {
  const n = useCountUp(config.target, 1200, enabled)
  return (
    <div className="rounded-xl bg-[#0A1A10] p-6 text-center">
      <p className="text-5xl font-bold tabular-nums tracking-tight text-white">{config.format(n)}</p>
      <p className="mt-3 text-sm leading-snug text-[#6B7280]">{label}</p>
    </div>
  )
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050F09] py-20 [font-family:var(--font-inter),system-ui,sans-serif]"
    >
      {/* Thin scan line — sweeps left → right once on scroll-in */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute top-[46%] h-px w-[min(38vw,280px)] -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.06]"
          initial={{ left: "-15%" }}
          animate={inView ? { left: "115%" } : { left: "-15%" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built for speed. Proven by builders.
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} label={stat.label} config={stat.config} enabled={inView} />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[#6B7280]">
          *Based on survey of 500 users, November 2024
        </p>
      </div>
    </section>
  )
}
