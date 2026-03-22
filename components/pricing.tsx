"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Billing = "monthly" | "annual"

const plans = [
  {
    name: "Starter",
    subtitle: "For first-time validators",
    monthly: 0,
    annualMonthly: 0,
    annualBilled: 0,
    features: [
      "3 validations/month",
      "Competitor overview",
      "Basic Go/No-Go verdict",
      "PDF export (watermarked)",
    ],
    cta: "Start Free →",
    ctaVariant: "ghost" as const,
    popular: false,
  },
  {
    name: "Builder",
    subtitle: "For active founders & hackathon teams",
    monthly: 12,
    annualMonthly: 8,
    annualBilled: 96,
    features: [
      "Unlimited validations",
      "Full competitor deep-dives",
      "Gap Score™ + Trend Pulse",
      "Clean PDF exports",
      "Idea history & saved reports",
    ],
    cta: "Get Builder →",
    ctaVariant: "indigo" as const,
    popular: true,
  },
  {
    name: "Team",
    subtitle: "For startup teams & accelerators",
    monthly: 39,
    annualMonthly: 27,
    annualBilled: 324,
    features: [
      "Everything in Builder",
      "5 team seats",
      "Collaborative report comments",
      "Priority processing",
      "Slack export integration",
    ],
    cta: "Start Team Trial →",
    ctaVariant: "ghost" as const,
    popular: false,
  },
]

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [billing, setBilling] = useState<Billing>("monthly")
  const [saveBounceKey, setSaveBounceKey] = useState(0)

  return (
    <section
      id="pricing"
      ref={ref}
      className="bg-[#000000] px-4 py-24 [font-family:var(--font-inter),system-ui,sans-serif]"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            One tool. One decision. Clear pricing.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#6B7280] sm:text-lg">
            Start free. Go deeper when you&apos;re ready.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <div className="inline-flex items-center rounded-full border border-[#122B1A] bg-[#0A1A10] p-1">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  billing === "monthly" ? "text-white" : "text-[#6B7280]",
                )}
              >
                {billing === "monthly" && (
                  <motion.span
                    layoutId="pricing-billing-pill"
                    className="absolute inset-0 rounded-full bg-[rgba(5,150,105,0.2)] ring-1 ring-[#059669]/40"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Monthly</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBilling("annual")
                  setSaveBounceKey((k) => k + 1)
                }}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  billing === "annual" ? "text-white" : "text-[#6B7280]",
                )}
              >
                {billing === "annual" && (
                  <motion.span
                    layoutId="pricing-billing-pill"
                    className="absolute inset-0 rounded-full bg-[rgba(5,150,105,0.2)] ring-1 ring-[#059669]/40"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Annual</span>
              </button>
            </div>

            {billing === "annual" && (
              <motion.span
                key={saveBounceKey}
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="inline-flex rounded-full border border-[#059669]/40 bg-[#059669]/15 px-3 py-1 text-xs font-medium text-[#34D399]"
              >
                Save 30%
              </motion.span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-6 pt-4 md:grid-cols-3 md:gap-5 lg:gap-8 lg:py-6">
          {plans.map((plan, index) => {
            const isPopular = plan.popular
            const displayMonthly = billing === "monthly" ? plan.monthly : plan.annualMonthly
            const showBilled = billing === "annual" && plan.annualBilled > 0

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-[#0A1A10] p-6",
                  "border-[#122B1A]",
                  isPopular &&
                    "z-10 border-[#059669] shadow-[0_0_30px_rgba(5,150,105,0.2)] md:scale-[1.05]",
                )}
              >
                {isPopular && (
                  <div className="absolute -top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <span className="whitespace-nowrap rounded-full border border-[#059669]/40 bg-[#059669] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={cn("mb-6", isPopular && "mt-2")}>
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{plan.subtitle}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tabular-nums text-white">${displayMonthly}</span>
                    <span className="text-sm text-[#6B7280]">/month</span>
                  </div>
                  {showBilled && (
                    <p className="mt-1 text-xs text-[#6B7280]">Billed ${plan.annualBilled}/year</p>
                  )}
                  {billing === "annual" && plan.monthly === 0 && (
                    <p className="mt-1 text-xs text-[#6B7280]">Annual: $0</p>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm text-[#FFFFFF]">
                      <span className="shrink-0 font-medium text-[#059669]" aria-hidden>
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.ctaVariant === "indigo" ? (
                  <Button
                    className="h-11 w-full rounded-lg border-0 bg-[#059669] text-base font-medium text-white shadow-none transition-[box-shadow] duration-300 hover:bg-[#059669] hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.35)]"
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="h-11 w-full rounded-lg border border-[#122B1A] bg-transparent text-base font-medium text-[#6B7280] transition-colors hover:border-[#059669]/50 hover:bg-[rgba(5,150,105,0.06)] hover:text-[#FFFFFF]"
                  >
                    {plan.cta}
                  </Button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
