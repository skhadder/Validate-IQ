"use client"

import { AnimatePresence, motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const logos = [
  "Y Combinator",
  "Product Hunt",
  "MLH",
  "Replit",
  "Buildspace",
  "AngelList",
]

const testimonials = [
  {
    quote: "Saved me 3 weeks of research. Validated my idea in under a minute.",
    attribution: "Arjun S., Hackathon Winner @ HackMIT",
  },
  {
    quote: "I was about to build the wrong thing. Validate IQ told me in 60 seconds.",
    attribution: "Priya K., Solo Founder",
  },
  {
    quote: "This should be the first tab every founder opens.",
    attribution: "Marcus L., YC S24 Applicant",
  },
]

export function LogoMarquee() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTestimonialIndex((n) => (n + 1) % testimonials.length)
    }, 4000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section ref={ref} className="overflow-hidden bg-[#000000] py-16 [font-family:var(--font-inter),system-ui,sans-serif]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-5xl px-4 sm:px-6"
      >
        <p className="mb-10 text-center text-xs font-medium uppercase tracking-widest text-[#6B7280]">
          Trusted by builders at
        </p>

        <ul className="mb-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12">
          {logos.map((name) => (
            <li key={name}>
              <span
                className="inline-block cursor-default text-center text-sm font-semibold tracking-tight text-white transition-[transform,filter] duration-200 ease-out [filter:brightness(0)_invert(0.4)] hover:scale-105 hover:filter-none sm:text-base"
                style={{ transformOrigin: "center" }}
              >
                {name}
              </span>
            </li>
          ))}
        </ul>

        <div className="relative mx-auto min-h-[8rem] max-w-xl text-center">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={testimonialIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0"
            >
              <p className="text-base italic leading-relaxed text-[#e4e4e7] sm:text-lg">
                &ldquo;{testimonials[testimonialIndex].quote}&rdquo;
              </p>
              <footer className="mt-4 text-sm not-italic text-[#6B7280]">
                — {testimonials[testimonialIndex].attribution}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
