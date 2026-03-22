"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const TYPING_IDEAS = [
  'An AI tool for remote team standups...',
  'A B2B marketplace for surplus restaurant inventory...',
  'Micro-SaaS for indie hackers to track runway...',
]

function useTypingPlaceholder(strings: string[]) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    let cancelled = false
    let strIdx = 0
    let charIdx = 0
    let deleting = false
    let timeoutId: ReturnType<typeof setTimeout>

    const typeMs = 42
    const deleteMs = 28
    const pauseTypedMs = 2200
    const pauseBetweenMs = 380

    function tick() {
      if (cancelled) return
      const full = strings[strIdx]

      if (!deleting) {
        if (charIdx < full.length) {
          charIdx++
          setDisplayed(full.slice(0, charIdx))
          timeoutId = setTimeout(tick, typeMs)
        } else {
          timeoutId = setTimeout(() => {
            deleting = true
            tick()
          }, pauseTypedMs)
        }
      } else if (charIdx > 0) {
        charIdx--
        setDisplayed(full.slice(0, charIdx))
        timeoutId = setTimeout(tick, deleteMs)
      } else {
        deleting = false
        strIdx = (strIdx + 1) % strings.length
        timeoutId = setTimeout(tick, pauseBetweenMs)
      }
    }

    tick()
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [strings])

  return displayed
}

const easeOut = [0.22, 1, 0.36, 1] as const

const DEMO_IDEA = "An AI tool that helps founders validate their startup idea before building"

export function Hero() {
  const typed = useTypingPlaceholder(TYPING_IDEAS)
  const router = useRouter()

  function handleTryDemo() {
    localStorage.setItem("isDemoMode", "true")
    localStorage.setItem("demoIdea", DEMO_IDEA)
    router.push("/workspace")
  }

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 overflow-hidden bg-[#000000] [font-family:var(--font-inter),system-ui,sans-serif]"
    >
      <div className="absolute inset-0 bg-[#000000] pointer-events-none" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy + CTAs */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="mb-6 inline-flex items-center rounded-full border border-[#122B1A] bg-[#0A1A10] px-3 py-1.5 text-xs text-[#6B7280]"
            >
              <span className="select-none" aria-hidden>
                ⚡
              </span>
              <span className="ml-1.5">Used by 2,400+ builders this month</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: easeOut }}
              className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
            >
              Stop building. Start knowing.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: easeOut }}
              className="mt-5 max-w-xl text-base leading-relaxed text-[#6B7280] sm:text-lg"
            >
              Type your startup idea. Get a full market validation report in 60 seconds — competitors, market size,
              gaps, and a clear go/no-go verdict. No more guessing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: easeOut }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                className="h-auto rounded-lg border-0 bg-[#059669] px-6 py-3 text-base font-medium text-white shadow-none transition-[box-shadow,background-color] duration-300 ease-out hover:bg-[#059669] hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.35)] focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]"
              >
                → Validate My Idea
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-auto rounded-lg border border-transparent px-6 py-3 text-base font-medium text-[#6B7280] transition-[color,box-shadow,border-color] duration-[280ms] ease-out hover:border-[#122B1A] hover:bg-transparent hover:text-[#6B7280] focus-visible:border-[#059669]"
              >
                Watch 60-sec demo ▶
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleTryDemo}
                className="h-auto rounded-lg border border-[#122B1A] px-6 py-3 text-base font-medium text-[#6B7280] transition-[color,box-shadow,border-color] duration-[280ms] ease-out hover:border-[#059669] hover:bg-transparent hover:text-white focus-visible:border-[#059669]"
              >
                Try Demo →
              </Button>
            </motion.div>
          </div>

          {/* Right: mock + glow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: easeOut }}
            className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end"
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(120%,520px)] w-[min(100%,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#059669] opacity-[0.15] blur-[80px]"
              aria-hidden
            />

            <div className="relative rounded-xl border border-[#122B1A] bg-[#0A1A10] p-5 shadow-2xl shadow-black/40">
              <div className="mb-4 rounded-lg border border-[#122B1A] bg-[#000000] px-4 py-3">
                <div className="flex min-h-[3rem] items-start gap-2 text-sm leading-relaxed text-[#6B7280]">
                  <span className="shrink-0 select-none text-base" aria-hidden>
                    💡
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[#6B7280]">&quot;</span>
                    <span className="text-[#6B7280]">{typed}</span>
                    <motion.span
                      className="ml-0.5 inline-block h-[1.1em] w-px translate-y-0.5 bg-[#059669] align-middle"
                      aria-hidden
                      animate={{ opacity: [1, 1, 0, 0] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                        times: [0, 0.45, 0.5, 1],
                      }}
                    />
                    <span className="text-[#6B7280]">&quot;</span>
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-[#122B1A] bg-[#000000]/80 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">Preview</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#122B1A] pb-3">
                    <span className="text-[#6B7280]">
                      <span aria-hidden>🟢</span> Market Size
                    </span>
                    <span className="font-medium tabular-nums text-white">$4.2B</span>
                  </li>
                  <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#122B1A] pb-3">
                    <span className="text-[#6B7280]">
                      <span aria-hidden>🔴</span> Competition
                    </span>
                    <span className="text-right text-[#6B7280]">
                      High <span className="text-[#6B7280]">(47 competitors)</span>
                    </span>
                  </li>
                  <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#122B1A] pb-3">
                    <span className="text-[#6B7280]">
                      <span aria-hidden>🟡</span> Gap Score
                    </span>
                    <span className="font-medium tabular-nums text-white">6.4/10</span>
                  </li>
                  <li className="pt-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f59e0b]/35 bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-medium text-[#f59e0b]">
                      <span aria-hidden>⚠️</span> Pivot Angle Recommended
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
