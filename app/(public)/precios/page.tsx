import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'

const PLANES = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: '$80.000',
    periodo: '/mes',
    desc: 'Para negocios que quieren empezar a automatizar sin complicaciones.',
    color: '#38BDF8',
    features: [
      'Chatbot WhatsApp 24hs',
      'Responde las 10 preguntas más frecuentes',
      'Deriva a humano cuando no sabe',
      'Panel de gestión básico',
      'Soporte por email',
    ],
    cta: 'Empezar prueba gratis',
    href: '/trial',
    highlight: false,
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: '$150.000',
    periodo: '/mes',
    desc: 'Chatbot + turnero online. El combo que más reduce tiempo perdido.',
    color: '#C6FF3D',
    features: [
      'Todo el plan Básico',
      'Turnero online con reservas 24hs',
      'Recordatorio automático por WA 24hs antes',
      'Cobro de seña por MercadoPago',
      'Panel completo con métricas',
      'Soporte prioritario por WhatsApp',
    ],
    cta: 'Empezar prueba gratis',
    href: '/trial',
    highlight: true,
  },
  {
    id: 'todo',
    nombre: 'Todo DIVINIA',
    precio: '$250.000',
    periodo: '/mes',
    desc: 'Automatización completa: chatbot + turnero + contenido IA para redes.',
    color: '#E879F9',
    features: [
      'Todo el plan Pro',
      '12 posts mensuales generados con IA',
      'Captions + hashtags + diseño Canva',
      'Planificación de contenido mensual',
      'Reporte mensual de métricas',
      'Soporte dedicado por WhatsApp',
    ],
    cta: 'Empezar prueba gratis',
    href: '/trial',
    highlight: false,
  },
]

const PROYECTOS = [
  { nombre: 'Auditoría digital completa', precio: '$80.000', plazo: 'Inmediato (IA)', desc: 'Análisis de web, SEO, redes, mensajería y publicidad con informe detallado.' },
  { nombre: 'Landing page premium', precio: '$100.000', plazo: '48hs', desc: 'Con scroll animations, optimizada para conversión y mobile-first.' },
  { nombre: 'Chatbot WhatsApp básico', precio: '$150.000', plazo: '48hs', desc: 'Configuración completa para tu negocio, instalado y listo.' },
  { nombre: 'Chatbot WhatsApp pro', precio: '$250.000', plazo: '1 semana', desc: 'Con IA avanzada, integración de turnero y lógica personalizada.' },
  { nombre: 'Automatización de ventas', precio: '$350.000', plazo: '1-2 semanas', desc: 'CRM automatizado + seguimiento de leads + propuestas automáticas.' },
  { nombre: 'Sistema multi-agente', precio: 'desde $800.000', plazo: '2-4 semanas', desc: 'Múltiples agentes IA coordinados para automatizar procesos complejos.' },
]

export default function PreciosPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '120px 0 80px', textAlign: 'center' }}>
        <div className="wrap-v2">
          <div className="eyebrow" style={{ marginBottom: 20 }}>Precios — sin letra chica</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(48px,6vw,88px)', marginBottom: 20 }}>
            Lo que pagás.<br /><em>Lo que recibís.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '44ch', margin: '0 auto 16px' }}>
            14 días de prueba gratis en todos los planes. Sin tarjeta de crédito. Sin contratos a largo plazo.
          </p>
          <p style={{ fontSize: 14, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.06em' }}>
            PRECIOS EN ARS · PAGOS VÍA MERCADOPAGO
          </p>
        </div>
      </section>

      {/* Planes mensuales */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 2 }} className="grid-cols-3-mobile-1 md:grid-cols-3">
            {PLANES.map(plan => (
              <div key={plan.id} style={{
                background: plan.highlight ? 'var(--ink)' : 'var(--paper-2)',
                border: `1px solid ${plan.highlight ? plan.color : 'var(--line)'}`,
                borderRadius: 24, padding: '40px 36px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'var(--ink)', borderRadius: 100, padding: '4px 16px', fontSize: 11, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    MÁS POPULAR
                  </div>
                )}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: plan.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{plan.nombre}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                    <span className="h-display" style={{ fontSize: 48, color: plan.highlight ? 'var(--paper)' : 'var(--ink)' }}>{plan.precio}</span>
                    <span style={{ color: 'var(--muted-2)', fontSize: 14, fontFamily: 'var(--f-display)' }}>{plan.periodo}</span>
                  </div>
                  <p style={{ fontSize: 14, color: plan.highlight ? 'rgba(246,245,242,0.6)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.5, margin: 0 }}>
                    {plan.desc}
                  </p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: plan.highlight ? 'rgba(246,245,242,0.8)' : 'var(--ink)', fontFamily: 'var(--f-display)', alignItems: 'flex-start' }}>
                      <span style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '14px 24px', borderRadius: 12,
                  background: plan.highlight ? plan.color : 'var(--ink)',
                  color: plan.highlight ? 'var(--ink)' : 'var(--paper)',
                  textDecoration: 'none', fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15,
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--f-mono)', letterSpacing: '0.05em' }}>
            Cancelación en cualquier momento · Sin permanencia mínima · Soporte incluido
          </p>
        </div>
      </section>

      {/* Proyectos únicos */}
      <section style={{ padding: '80px 0', background: 'var(--paper-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>PROYECTOS — PAGO ÚNICO</div>
            <h2 className="h-title">Entregamos. Pagás. Listo.</h2>
          </div>
          <div style={{ display: 'grid', gap: 2 }} className="grid-cols-2-mobile-1 md:grid-cols-3">
            {PROYECTOS.map(p => (
              <div key={p.nombre} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>{p.nombre}</h3>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>{p.precio}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', margin: '0 0 12px', lineHeight: 1.5 }}>{p.desc}</p>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>⏱ {p.plazo}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/auditoria" style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
              Empezá con la auditoría gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 0' }}>
        <div className="wrap-v2" style={{ maxWidth: 700 }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>PREGUNTAS FRECUENTES</div>
          {[
            { q: '¿Cómo funciona la prueba gratis de 14 días?', a: 'Registrás tu negocio, configuramos el chatbot o turnero juntos, y lo usás durante 14 días sin costo. Si te sirve, activás el plan. Si no, nos avisás y no hay cargo.' },
            { q: '¿Cómo pago?', a: 'Por MercadoPago. Podés pagar con tarjeta de débito, crédito o transferencia. Los planes mensuales se cobran automáticamente el mismo día cada mes.' },
            { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Sin preguntas y sin penalidades. Avisás con 15 días de anticipación y cancelamos.' },
            { q: '¿Los precios incluyen IVA?', a: 'DIVINIA factura como monotributista. No hay IVA adicional sobre los precios listados.' },
            { q: '¿Qué pasa si necesito algo que no está en los planes?', a: 'Escribinos por WhatsApp y lo presupuestamos. La mayoría de los requerimientos especiales tienen solución.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ padding: '24px 0', borderBottom: '1px solid var(--line)' }}>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: 'var(--ink)' }}>{q}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', margin: 0, lineHeight: 1.65 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'var(--ink)', textAlign: 'center' }}>
        <div className="wrap-v2">
          <h2 className="h-title" style={{ color: 'var(--paper)', marginBottom: 20 }}>¿Dudás? Empezá con la auditoría gratis.</h2>
          <p style={{ color: 'rgba(246,245,242,0.6)', fontFamily: 'var(--f-display)', fontSize: 16, marginBottom: 32 }}>
            En 60 segundos te decimos qué está fallando y cuánto te cuesta no arreglarlo.
          </p>
          <Link href="/auditoria" style={{ display: 'inline-block', background: 'var(--lime)', color: 'var(--ink)', borderRadius: 14, padding: '16px 40px', fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
            Ver mi auditoría gratis →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
