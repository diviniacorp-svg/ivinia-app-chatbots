import Navbar from '@/components/public/Navbar'
import Hero from '@/components/public/Hero'
import StatsV2 from '@/components/public/StatsV2'
import Manifiesto from '@/components/public/Manifiesto'
import ProblemV2 from '@/components/public/ProblemV2'
import ServicesV2 from '@/components/public/ServicesV2'
import DemosV2 from '@/components/public/DemosV2'
import ProcessV2 from '@/components/public/ProcessV2'
import CasesV2 from '@/components/public/CasesV2'
import PricingV2 from '@/components/public/PricingV2'
import AcademySection from '@/components/public/AcademySection'
import FAQV2 from '@/components/public/FAQV2'
import CTASection from '@/components/public/CTASection'
import Footer from '@/components/public/Footer'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      {/* editorial grid overlay */}
      <div className="grid-bg" />

      {/* 1. Nav fija */}
      <Navbar />

      {/* 2. Hero — propuesta + orb lime */}
      <Hero />

      {/* 3. Stats — números que impactan */}
      <StatsV2 />

      {/* 4. Manifiesto — editorial serif */}
      <Manifiesto />

      {/* 5. Problema / Solución */}
      <ProblemV2 />

      {/* 6. Servicios — lista tabla */}
      <ServicesV2 />

      {/* 7. Demos en vivo */}
      <DemosV2 />

      {/* 8. Proceso — sección oscura */}
      <ProcessV2 />

      {/* 9. Casos — cards */}
      <CasesV2 />

      {/* 10. Precios */}
      <PricingV2 />

      {/* 11. DIVINIA Academy */}
      <AcademySection />

      {/* 12. FAQ */}
      <FAQV2 />

      {/* 13. CTA + formulario */}
      <CTASection />

      {/* 14. Footer */}
      <Footer />
    </main>
  )
}
