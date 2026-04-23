import Navbar from '@/components/public/Navbar'
import HeroV3 from '@/components/public/HeroV3'
import ProblemaV3 from '@/components/public/ProblemaV3'
import ProductosV3 from '@/components/public/ProductosV3'
import DemoViva from '@/components/public/DemoViva'
import ROICalculator from '@/components/public/ROICalculator'
import PruebaSocial from '@/components/public/PruebaSocial'
import ProcesoSimple from '@/components/public/ProcesoSimple'
import PricingV3 from '@/components/public/PricingV3'
import FAQSimple from '@/components/public/FAQSimple'
import CTAFinal from '@/components/public/CTAFinal'
import Footer from '@/components/public/Footer'
import WAFloat from '@/components/public/WAFloat'
import StickyBar from '@/components/public/StickyBar'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      {/* Grid editorial de fondo */}
      <div className="grid-bg" />

      {/* Barra sticky de conversión (aparece al scrollear) */}
      <StickyBar />

      {/* Nav fija */}
      <Navbar />

      {/* 1. Hero — selector de rubro + propuesta + stats */}
      <HeroV3 />

      {/* 2. Problema — 3 dolores concretos del dueño de PYME */}
      <ProblemaV3 />

      {/* 3. Productos — 5 productos con precios reales y CTAs */}
      <ProductosV3 />

      {/* 4. Demo en vivo — turnero embebido interactivo */}
      <DemoViva />

      {/* 5. ROI Calculator — ¿te conviene? */}
      <ROICalculator />

      {/* 6. Prueba social — demos reales como casos */}
      <PruebaSocial />

      {/* 7. Proceso — 3 pasos simples */}
      <ProcesoSimple />

      {/* 8. Precios — planes correctos con CTA por plan */}
      <PricingV3 />

      {/* 9. FAQ — 5 preguntas clave */}
      <FAQSimple />

      {/* 10. CTA final — urgencia real + WA */}
      <CTAFinal />

      {/* Footer */}
      <Footer />

      {/* Botón flotante WhatsApp */}
      <WAFloat />
    </main>
  )
}
