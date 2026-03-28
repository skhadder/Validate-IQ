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
      className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden bg-[var(--landing-bg)] px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="mb-8 inline-flex rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] px-4 py-1.5"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--landing-accent)]">
              Powered by live web research
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: easeOut }}
            className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Diligence in 60 seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: easeOut }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg"
          >
            From live web research + your founder profile. Instant strategic syntheses for high-stakes decisions.{" "}
            <span className="text-slate-500">(Not legal or financial advice.)</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: easeOut }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              onClick={() => {
                localStorage.removeItem("isDemoMode")
                localStorage.removeItem("demoIdea")
                router.push("/workspace")
              }}
              className="h-12 min-w-[180px] rounded-md border-0 bg-white px-8 text-base font-semibold text-[var(--landing-cta-on-light)] shadow-none hover:bg-slate-200"
            >
              Run a memo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleTryDemo}
              className="h-12 min-w-[180px] rounded-md border-[var(--landing-border)] bg-transparent text-base font-semibold text-white hover:bg-[var(--landing-surface)]"
            >
              See sample memo
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
