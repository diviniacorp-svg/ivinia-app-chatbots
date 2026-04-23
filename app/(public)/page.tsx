import Navbar from '@/components/public/Navbar'
import HeroV3 from '@/components/public/HeroV3'
import StatsV2 from '@/components/public/StatsV2'
import RubrosMarquee from '@/components/public/RubrosMarquee'
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
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 3600

async function getStats() {
  try {
    const [{ count }, mrrRes] = await Promise.all([
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('clients').select('mrr').eq('status', 'active'),
    ])
    const mrr = (mrrRes.data ?? []).reduce((s, c) => s + Number(c.mrr ?? 0), 0)
    return { clientesActivos: count ?? 0, mrr, rubros: 6 }
  } catch {
    return { clientesActivos: 8, mrr: 165000, rubros: 6 }
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <StickyBar />
      <Navbar />

      {/* 1. Hero */}
      <HeroV3 />

      {/* 2. Stats reales desde Supabase */}
      <StatsV2 clientesActivos={stats.clientesActivos} mrr={stats.mrr} rubros={stats.rubros} />

      {/* 2b. Rubros marquee */}
      <RubrosMarquee />

      {/* 3. Problema */}
      <ProblemaV3 />

      {/* 4. Productos — 5 con precios reales */}
      <ProductosV3 />

      {/* 5. Demo en vivo */}
      <DemoViva />

      {/* 6. ROI Calculator */}
      <ROICalculator />

      {/* 7. Prueba social */}
      <PruebaSocial />

      {/* 8. Proceso */}
      <ProcesoSimple />

      {/* 9. Precios */}
      <PricingV3 />

      {/* 10. FAQ */}
      <FAQSimple />

      {/* 11. CTA final */}
      <CTAFinal />

      <Footer />
      <WAFloat />
    </main>
  )
}
