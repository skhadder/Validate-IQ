"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--landing-bg)]/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="font-heading text-xl font-bold tracking-[0.2em] text-white sm:text-2xl"
          style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
        >
          VERDICT
        </a>

        <div className="absolute left-1/2 hidden -translate-x-1/2 md:flex md:items-center md:gap-10">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-semibold tracking-[0.2em] text-[var(--landing-muted)] transition-colors hover:text-white"
            >
              {item.label.toUpperCase()}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            className="text-xs font-semibold tracking-wide text-[var(--landing-muted)] transition-colors hover:text-white"
          >
            Sign in
          </button>
          <Button
            size="sm"
            onClick={() => router.push("/workspace")}
            className="h-9 rounded-md border-0 bg-white px-5 text-xs font-semibold tracking-wide text-[var(--landing-cta-on-light)] hover:bg-slate-200"
          >
            Run a memo
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--landing-border)] text-[var(--landing-muted)] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-b border-[var(--landing-border)] bg-[var(--landing-bg)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-2 text-sm font-medium text-[var(--landing-muted)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                router.push("/sign-in")
              }}
              className="py-2 text-left text-sm font-medium text-[var(--landing-muted)]"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                router.push("/workspace")
              }}
              className="mt-1 rounded-md bg-white py-3 text-sm font-semibold text-[var(--landing-cta-on-light)]"
            >
              Run a memo
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
