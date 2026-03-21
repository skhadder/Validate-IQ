import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { LogoMarquee } from "@/components/logo-marquee"
import { BentoGrid } from "@/components/bento-grid"
import { StatsSection } from "@/components/stats-section"
import { TrustSection } from "@/components/trust-section"
import { Pricing } from "@/components/pricing"
import { FinalCTA } from "@/components/final-cta"

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-zinc-950">
        <Navbar />
        <Hero />
        <LogoMarquee />
        <BentoGrid />
        <StatsSection />
        <Pricing />
        <TrustSection />
        <FinalCTA />
      </main>
    </SmoothScroll>
  )
}
