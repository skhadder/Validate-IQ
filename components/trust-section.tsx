"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const BADGES = [
  "🔐 End-to-end encrypted",
  "🚫 Zero data retention",
  "🧠 Never used for model training",
  "🌍 GDPR compliant",
]

const badgeClass =
  "rounded-full border border-[#122B1A] bg-[rgba(5,150,105,0.06)] px-4 py-2 text-sm text-[#FFFFFF] transition-[border-color,background-color] duration-200 ease-out hover:border-[#059669] hover:bg-[rgba(5,150,105,0.1)]"

/** Inline padlock SVG — shackle rotates shut, body gets a one-time “click” pulse (viewport once) */
function LockSeal({ active }: { active: boolean }) {
  return (
    <div className="mb-8 flex justify-center" aria-hidden>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#122B1A] bg-[rgba(5,150,105,0.05)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="overflow-visible text-[#059669]">
          <motion.g style={{ transformOrigin: "12px 11px" }} initial={{ rotate: -20 }} animate={active ? { rotate: 0 } : { rotate: -20 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <path
              d="M8 11V9a4 4 0 0 1 8 0v2"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
          <motion.g
            style={{ transformOrigin: "12px 16.5px" }}
            initial={{ scale: 1 }}
            animate={active ? { scale: [1, 0.92, 1.04, 1] } : { scale: 1 }}
            transition={{ delay: 0.5, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
            <circle cx="12" cy="16.5" r="1.2" fill="currentColor" className="opacity-75" />
          </motion.g>
        </svg>
      </div>
    </div>
  )
}

export function TrustSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.35 })

  return (
    <section
      ref={ref}
      className="bg-[#000000] px-4 py-20 [font-family:var(--font-inter),system-ui,sans-serif]"
    >
      <div className="mx-auto max-w-2xl text-center">
        <LockSeal active={isInView} />

        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Your ideas stay yours.</h2>

        <p className="mt-4 text-pretty text-base leading-relaxed text-[#6B7280] sm:text-[1.05rem]">
          We don&apos;t train on your inputs. We don&apos;t store your ideas. Every report runs in an isolated session
          and is deleted after download. Build in confidence.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {BADGES.map((label) => (
            <span key={label} className={badgeClass}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
