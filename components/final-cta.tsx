export function FinalCTA() {
  return (
    <footer
      className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)] px-4 py-16"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <p
            className="font-heading text-4xl font-bold tracking-[0.15em] text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            VERDICT
          </p>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-[var(--landing-muted)]">
            © {new Date().getFullYear()} Verdict. All rights reserved.
          </p>
        </div>

        <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-[var(--landing-border)] pt-10">
          <a href="#" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)] transition-colors hover:text-white">
            Privacy policy
          </a>
          <a href="#" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)] transition-colors hover:text-white">
            Terms of service
          </a>
          <a href="mailto:support@verdict.app" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)] transition-colors hover:text-white">
            Contact support
          </a>
          <a href="#faq" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-muted)] transition-colors hover:text-white">
            Diligence framework
          </a>
        </nav>
      </div>
    </footer>
  )
}
