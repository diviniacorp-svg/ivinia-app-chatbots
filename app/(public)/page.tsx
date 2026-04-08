import Hero from '@/components/public/Hero'
import ProductosSection from '@/components/public/ProductosSection'
import RubrosGrid from '@/components/public/RubrosGrid'
import HowItWorks from '@/components/public/HowItWorks'
import PricingCards from '@/components/public/PricingCards'
import FAQ from '@/components/public/FAQ'
import TrialCTA from '@/components/public/TrialCTA'
import Footer from '@/components/public/Footer'
import Navbar from '@/components/public/Navbar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {/* 1. Hero — propuesta de valor + before/after + mock UI */}
      <Hero />
      {/* 2. Turnero (producto principal) + Chatbot */}
      <ProductosSection />
      {/* 3. Rubros específicos */}
      <RubrosGrid />
      {/* 4. Cómo funciona — 3 pasos */}
      <HowItWorks />
      {/* 5. Precios detallados */}
      <PricingCards />
      {/* 6. FAQ */}
      <FAQ />
      {/* 7. CTA final */}
      <TrialCTA />
      <Footer />
    </main>
  )
}
