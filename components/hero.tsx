"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const easeOut = [0.22, 1, 0.36, 1] as const

const DEMO_IDEA = "An AI tool that helps founders validate their startup idea before building"

export function Hero() {
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

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="flex flex-col items-center text-center">
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
            transition={{ duration: 0.4, delay: 0.12, ease: easeOut }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#1E2D4A] bg-[#0D1526] px-3 py-1"
          >
            <span style={{ fontSize: "10px", color: "#60A5FA" }}>⚡</span>
            <span style={{ fontSize: "11px", color: "#60A5FA" }}>Powered by Perplexity live search</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: easeOut }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
          >
            <Button
              size="lg"
              onClick={() => {
                localStorage.removeItem("isDemoMode")
                localStorage.removeItem("demoIdea")
                router.push("/workspace")
              }}
              className="h-auto rounded-lg border-0 bg-[#10B981] px-8 py-4 font-semibold text-white shadow-none transition-[box-shadow,background-color] duration-300 ease-out hover:bg-[#059669] hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.4)]"
              style={{ fontSize: "16px" }}
            >
              → Validate My Idea
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleTryDemo}
              className="h-auto rounded-lg border border-[#1E2D4A] px-5 py-3 font-medium text-[#6B7280] transition-[color,border-color] duration-[280ms] ease-out hover:border-[#10B981] hover:bg-transparent hover:text-white"
              style={{ fontSize: "14px" }}
            >
              Try Demo →
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
