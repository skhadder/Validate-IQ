"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#0a0a0f] px-4 pb-0 pt-24 [font-family:var(--font-inter),system-ui,sans-serif]"
    >
      {/* Stage spotlight */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[min(55vh,520px)] w-[min(120%,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_60%)]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Your next idea deserves a real answer.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#a1a1aa] sm:text-lg">
          Not a Reddit thread. Not a Google rabbit hole. A structured, data-backed validation — in the time it takes to
          make coffee.
        </p>

        <motion.div
          className="mx-auto mt-10 max-w-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cta-input-breathe flex flex-col gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#1a1a24] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-within:border-[#6366f1] focus-within:ring-2 focus-within:ring-[#6366f1]/25 sm:flex-row sm:items-stretch sm:gap-0 sm:p-1">
            <input
              type="text"
              placeholder="Describe your startup idea..."
              className="min-h-12 min-w-0 flex-1 rounded-lg border-0 bg-transparent px-4 py-3 text-base text-[#e4e4e7] outline-none placeholder:text-[#71717a] sm:rounded-l-lg sm:rounded-r-none sm:py-2"
              aria-label="Describe your startup idea"
            />
            <Button
              type="button"
              className="h-12 shrink-0 rounded-lg border-0 bg-[#6366f1] px-5 text-base font-medium text-white shadow-none transition-[box-shadow] duration-300 hover:bg-[#6366f1] hover:shadow-[0_0_24px_-4px_rgba(167,139,250,0.45)] sm:h-auto sm:rounded-l-none sm:rounded-r-lg"
            >
              Validate Now →
            </Button>
          </div>
        </motion.div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-[#71717a]">
          Used by founders at 40+ universities  •  Real data, not hallucinations  -  60-second results, guaranteed
        </p>
      </motion.div>

      <footer className="relative z-10 mt-20 border-t border-[rgba(255,255,255,0.06)] px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm sm:flex-row sm:gap-4">
          <span className="font-semibold text-white">ValidateIQ</span>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="#" className="text-[#71717a] transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-[#71717a] transition-colors hover:text-white">
              Terms
            </a>
            <a href="#" className="text-[#71717a] transition-colors hover:text-white">
              Twitter
            </a>
          </nav>
          <p className="text-center text-[#52525b] sm:text-right">© 2026 ValidateIQ. Built for builders.</p>
        </div>
      </footer>
    </section>
  )
}
