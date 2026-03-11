import Hero from '@/components/public/Hero'
import ProblemSolution from '@/components/public/ProblemSolution'
import ProductosSection from '@/components/public/ProductosSection'
import RubrosGrid from '@/components/public/RubrosGrid'
import HowItWorks from '@/components/public/HowItWorks'
import ChatbotDemo from '@/components/public/ChatbotDemo'
import PricingCards from '@/components/public/PricingCards'
import FAQ from '@/components/public/FAQ'
import TrialCTA from '@/components/public/TrialCTA'
import Footer from '@/components/public/Footer'
import Navbar from '@/components/public/Navbar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {/* 1. Atención: propuesta de valor */}
      <Hero />
      {/* 2. Interés: agitar el dolor */}
      <ProblemSolution />
      {/* 3. Deseo: mostrar solución + productos disponibles */}
      <ProductosSection />
      {/* 4. Para tu rubro específico */}
      <RubrosGrid />
      {/* 5. Cómo funciona */}
      <HowItWorks />
      {/* 6. Demo interactiva */}
      <ChatbotDemo />
      {/* 7. Precios */}
      <PricingCards />
      {/* 8. Resolver objeciones */}
      <FAQ />
      {/* 9. CTA final de conversión */}
      <TrialCTA />
      <Footer />
    </main>
  )
}
