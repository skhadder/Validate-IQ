"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Scale, Shield } from "lucide-react"
import { toast } from "sonner"

const EMERALD = "#4ade80"
const CARD = "#141414"
const MUTED = "#94a3b8"
const BORDER = "rgba(148, 163, 184, 0.2)"

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.712A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.712V4.956H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.044l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9 0A8.997 8.997 0 00.957 4.956L3.964 7.288C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Enter your work email.")
      return
    }
    router.push("/workspace")
  }

  function handleGoogle() {
    toast.message("Google sign-in is not connected yet.")
  }

  return (
    <div
      className="signin-page-bg relative min-h-screen overflow-x-hidden px-4 py-10 md:px-8 md:py-12"
      style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}
    >
      <div
        className="pointer-events-none absolute top-4 right-4 z-0 hidden text-right font-mono text-[10px] leading-[1.6] sm:block md:top-6 md:right-6"
        style={{ color: MUTED }}
      >
        <p>UPTIME: 99.999%</p>
        <p>LATENCY: 14MS</p>
        <p>DILIGENCE_VER: 4.2.1</p>
      </div>
      <div
        className="pointer-events-none absolute bottom-4 left-4 z-0 hidden font-mono text-[10px] leading-[1.6] sm:block md:bottom-6 md:left-6"
        style={{ color: MUTED }}
      >
        <p>SYS_STATUS: ACTIVE</p>
        <p>NODE_ID: 0x882A_VERDICT</p>
        <p>PROTOCOL: HTTPS/3</p>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-[420px] flex-col items-center justify-center">
        <div
          className="w-full rounded-2xl border px-6 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] md:px-8 md:py-10"
          style={{ backgroundColor: CARD, borderColor: BORDER }}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white">
              <Scale className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <h1
              className="text-2xl font-bold tracking-[0.12em] text-white md:text-[1.65rem]"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              VERDICT
            </h1>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--landing-muted)]">
              Venture diligence unit
            </p>
          </div>

          <h2 className="text-lg font-semibold text-white">Sign in to Verdict</h2>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            Access secure investment intelligence.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border py-3 text-sm font-medium text-white transition hover:bg-white/[0.04]"
            style={{ borderColor: BORDER, background: "#0c0c0c" }}
          >
            <GoogleMark />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: BORDER }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: MUTED }}>
              Or
            </span>
            <div className="h-px flex-1" style={{ background: BORDER }} />
          </div>

          <form onSubmit={handleEmailContinue} className="flex flex-col gap-4">
            <div>
              <label htmlFor="work-email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                Work email
              </label>
              <input
                id="work-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@firm.vc"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-[#4ade80]/30"
                style={{ borderColor: BORDER, background: "#0a0a0a" }}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#4ade80] py-3.5 text-sm font-bold tracking-wide text-black transition hover:bg-[#22c55e]"
            >
              Continue to analysis
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{ borderColor: "color-mix(in srgb, #4ade80 45%, transparent)", color: EMERALD }}
            >
              <Lock className="h-3 w-3" strokeWidth={2} aria-hidden />
              AES-256 encrypted
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{ borderColor: BORDER, color: MUTED }}
            >
              <Shield className="h-3 w-3" strokeWidth={2} aria-hidden />
              Verified node
            </span>
          </div>

          <p className="mt-8 text-center text-[11px] leading-relaxed" style={{ color: MUTED }}>
            By continuing, you agree to our{" "}
            <Link href="/#faq" className="text-slate-300 underline underline-offset-2 hover:text-white">
              Terms of diligence
            </Link>{" "}
            and{" "}
            <Link href="/#faq" className="text-slate-300 underline underline-offset-2 hover:text-white">
              Privacy ledger
            </Link>
            .
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 text-xs font-medium tracking-wide text-[var(--landing-muted)] transition hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
