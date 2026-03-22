import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { BentoGrid } from "@/components/bento-grid"
import { TrustSection } from "@/components/trust-section"
import { Pricing } from "@/components/pricing"
import { FAQSection } from "@/components/faq-section"
import { FinalCTA } from "@/components/final-cta"

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[#000000]">
        <Navbar />
        <Hero />
        <BentoGrid />
        <Pricing />
        <TrustSection />
        <FAQSection />
        <FinalCTA />
      </main>
    </SmoothScroll>
  )
}
