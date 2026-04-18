import Hero from '@/components/public/Hero'
import RubrosGrid from '@/components/public/RubrosGrid'
import HowItWorks from '@/components/public/HowItWorks'
import PricingCards from '@/components/public/PricingCards'
import FAQ from '@/components/public/FAQ'
import Footer from '@/components/public/Footer'
import Navbar from '@/components/public/Navbar'
import NucleusSection from '@/components/public/NucleusSection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <Navbar />
      {/* 1. Hero — propuesta de valor + before/after */}
      <Hero />
      {/* 2. Servicios DIVINIA + demos por rubro + NUCLEUS + formulario */}
      <NucleusSection />
      {/* 3. Rubros específicos */}
      <RubrosGrid />
      {/* 4. Cómo funciona */}
      <HowItWorks />
      {/* 5. Precios */}
      <PricingCards />
      {/* 6. FAQ */}
      <FAQ />
      {/* 7. Footer */}
      <Footer />
    </main>
  )
}
