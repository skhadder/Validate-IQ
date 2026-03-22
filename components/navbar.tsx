"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo-mark"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

interface FundedStartup {
  name: string
  amount: string
  round: string
}

function FundingTicker() {
  const [startups, setStartups] = useState<FundedStartup[]>([])

  useEffect(() => {
    fetch("/api/funded-startups")
      .then((r) => r.json())
      .then((d) => setStartups(d.startups ?? []))
      .catch(() => {})
  }, [])

  if (startups.length === 0) return null

  // Duplicate for seamless loop
  const items = [...startups, ...startups, ...startups]

  return (
    <div className="hidden md:flex items-center gap-3 flex-1 mx-6 px-4 py-2 rounded-full bg-[#000000]/90 backdrop-blur-md border border-[#2A2D35] overflow-hidden">
      {/* Live label */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981]">Live</span>
      </div>

      {/* Divider */}
      <div className="h-3 w-px shrink-0 bg-[#2A2D35]" />

      {/* Scrolling ticker */}
      <div className="overflow-hidden flex-1 relative">
        <style>{`
          @keyframes ticker {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            animation: ticker 60s linear infinite;
          }
          .ticker-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="ticker-track">
          {items.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 pr-8 text-xs whitespace-nowrap">
              <span className="font-semibold text-white">{s.name}</span>
              <span className="text-[#10B981] font-medium">{s.amount}</span>
              <span className="text-[#6B7280]">{s.round}</span>
              <span className="text-[#2A2D35] ml-4">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      setHidden(current > lastScrollY.current && current > 80)
      lastScrollY.current = current
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -120 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <nav ref={navRef} className="relative flex items-center justify-between">
        {/* Logo — extreme left */}
        <a href="/" className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#000000]/90 backdrop-blur-md border border-[#2A2D35]">
          <LogoMark />
          <span className="font-bold text-white text-lg hidden sm:block">Verdict</span>
        </a>

        {/* Center — funding ticker */}
        <FundingTicker />

        {/* Right side: nav links + Get Started — extreme right */}
        <div className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full bg-[#000000]/90 backdrop-blur-md border border-[#2A2D35]">
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className="relative px-4 py-1.5 text-sm text-[#6B7280] hover:text-white transition-colors"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-[#1C1F26] rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </a>
          ))}
          <Button size="sm" onClick={() => router.push("/workspace")} className="shimmer-btn bg-[#10B981] text-white hover:bg-[#059669] rounded-full px-4 ml-2">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden px-3 py-2.5 rounded-full bg-[#000000]/90 backdrop-blur-md border border-[#2A2D35]">
          <button
            className="text-[#6B7280] hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-[#000000]/98 backdrop-blur-md border border-[#2A2D35]"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-3 text-sm text-[#6B7280] hover:text-white hover:bg-[#1C1F26] rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <hr className="border-[#2A2D35] my-2" />
            <Button onClick={() => router.push("/workspace")} className="shimmer-btn bg-[#10B981] text-white hover:bg-[#059669] rounded-full">Get Started</Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
