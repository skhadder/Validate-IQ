"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const freeFeatures = [
  { text: "3 memos per month", included: true },
  { text: "Live web research", included: true },
  { text: "PDF export", included: false },
  { text: "Scenario mode", included: false },
]

const proFeatures = [
  { text: "Unlimited memos", included: true },
  { text: "Full PDF & CSV export", included: true },
  { text: "AI scenario modeling", included: true },
  { text: "Team workspace", included: true },
]

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const router = useRouter()

  return (
    <section
      id="pricing"
      ref={ref}
      className="bg-[var(--landing-bg)] px-4 py-24"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--landing-accent)]">
            Unit economics
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Investment plans
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8"
          >
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tabular-nums text-white">$0</span>
                <span className="text-[var(--landing-muted)]">/ mo</span>
              </div>
            </div>
            <ul className="mb-10 flex-1 space-y-4">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm">
                  {f.included ? (
                    <Check className="h-5 w-5 shrink-0 text-[var(--landing-accent)]" strokeWidth={2} />
                  ) : (
                    <X className="h-5 w-5 shrink-0 text-slate-600" strokeWidth={2} />
                  )}
                  <span className={cn(f.included ? "text-white" : "text-slate-500 line-through decoration-slate-600")}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              onClick={() => router.push("/workspace")}
              className="h-12 w-full rounded-md border-[var(--landing-border)] bg-transparent font-semibold text-white hover:bg-[var(--landing-surface-elevated)]"
            >
              Start free
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col rounded-2xl border border-[var(--landing-accent)]/40 bg-[var(--landing-surface-elevated)] p-8 shadow-[0_0_40px_-12px_rgba(20,184,166,0.25)]"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="whitespace-nowrap rounded-full border border-[var(--landing-accent)]/50 bg-[var(--landing-accent-dim)] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
                Recommended
              </span>
            </div>
            <div className="mb-8 mt-2">
              <h3 className="text-lg font-semibold text-white">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tabular-nums text-white">$19</span>
                <span className="text-[var(--landing-muted)]">/ mo</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Billed monthly · cancel anytime</p>
            </div>
            <ul className="mb-10 flex-1 space-y-4">
              {proFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-white">
                  <Check className="h-5 w-5 shrink-0 text-[var(--landing-accent)]" strokeWidth={2} />
                  {f.text}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => router.push("/workspace")}
              className="h-12 w-full rounded-md border-0 bg-white font-semibold text-[var(--landing-cta-on-light)] hover:bg-slate-200"
            >
              Go unlimited
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
