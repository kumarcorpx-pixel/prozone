import { HeroSection } from "@/components/landing/HeroSection"
import { StatsBar } from "@/components/landing/StatsBar"
import { ServicesGrid } from "@/components/landing/ServicesGrid"
import { FeatureShowcase } from "@/components/landing/FeatureShowcase"
import { WhyChooseUs } from "@/components/landing/WhyChooseUs"
import { PricingCards } from "@/components/landing/PricingCards"
import { Testimonials } from "@/components/landing/Testimonials"
import { QuoteForm } from "@/components/landing/QuoteForm"
import { CTABanner } from "@/components/landing/CTABanner"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <ServicesGrid />
      <FeatureShowcase />
      <WhyChooseUs />
      <PricingCards />
      <Testimonials />
      <QuoteForm />
      <CTABanner />
    </>
  )
}
