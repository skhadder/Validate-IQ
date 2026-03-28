import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { FundingTicker } from "@/components/funding-ticker-dynamic"
import { Hero } from "@/components/hero"
import { BentoGrid } from "@/components/bento-grid"
import { Pricing } from "@/components/pricing"
import { FAQSection } from "@/components/faq-section"
import { FinalCTA } from "@/components/final-cta"

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[var(--landing-bg)]">
        <Navbar />
        <div className="pt-16">
          <FundingTicker />
        </div>
        <Hero />
        <BentoGrid />
        <Pricing />
        <FAQSection />
        <FinalCTA />
      </main>
    </SmoothScroll>
  )
}
