import Navbar from '@/components/public/Navbar'
import Hero from '@/components/public/Hero'
import Manifiesto from '@/components/public/Manifiesto'
import ServicesV2 from '@/components/public/ServicesV2'
import ProcessV2 from '@/components/public/ProcessV2'
import CasesV2 from '@/components/public/CasesV2'
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

      {/* 3. Manifiesto — editorial serif */}
      <Manifiesto />

      {/* 4. Servicios — lista tabla */}
      <ServicesV2 />

      {/* 5. Proceso — sección oscura */}
      <ProcessV2 />

      {/* 6. Casos — cards */}
      <CasesV2 />

      {/* 7. CTA + formulario */}
      <CTASection />

      {/* 8. Footer */}
      <Footer />
    </main>
  )
}
