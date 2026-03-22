"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo-mark"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl"
    >
      <nav
        ref={navRef}
        className="relative flex items-center justify-between px-4 py-3 rounded-full bg-[#060B18]/90 backdrop-blur-md border border-[#1E2D4A]"
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-semibold text-white hidden sm:block">Validate IQ</span>
        </a>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1 relative">
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-sm text-[#6B7280] hover:text-white transition-colors"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-[#0D1526] rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/workspace")} className="text-[#6B7280] hover:text-white hover:bg-[#0D1526]">
            Sign In
          </Button>
          <Button size="sm" onClick={() => router.push("/workspace")} className="shimmer-btn bg-[#10B981] text-white hover:bg-[#059669] rounded-full px-4">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#6B7280] hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-[#060B18]/98 backdrop-blur-md border border-[#1E2D4A]"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-3 text-sm text-[#6B7280] hover:text-white hover:bg-[#0D1526] rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <hr className="border-[#1E2D4A] my-2" />
            <Button variant="ghost" onClick={() => router.push("/workspace")} className="justify-start text-[#6B7280] hover:text-white">
              Sign In
            </Button>
            <Button onClick={() => router.push("/workspace")} className="shimmer-btn bg-[#10B981] text-white hover:bg-[#059669] rounded-full">Get Started</Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
