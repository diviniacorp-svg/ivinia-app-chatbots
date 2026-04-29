import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import { DIVINIA_PRODUCTS } from '@/lib/divinia-products'

const WA = 'https://wa.me/5492665286110'

const { turnero, landing, nucleus } = DIVINIA_PRODUCTS

// ── CÓMO FUNCIONA ─────────────────────────────────────────────────────────────

const FUNNEL = [
  { paso: '01', titulo: 'Probás 14 días gratis', desc: 'Sin tarjeta. El Turnero ya funciona desde el primer día — tu agenda lista para recibir clientes.', color: '#C6FF3D' },
  { paso: '02', titulo: 'Confirmás si te sirve', desc: 'Si en los 14 días no ves valor real, cancelás. Sin preguntas.', color: '#60A5FA' },
  { paso: '03', titulo: 'Elegís el plan que querés', desc: 'Mensual sin permanencia, anual con descuento, o pago único. Cambiás cuando querás.', color: '#34D399' },
  { paso: '04', titulo: 'Lo mejoramos juntos', desc: 'Cada mes revisamos métricas y te sugerimos qué ajustar para que reserve más gente.', color: '#F472B6' },
]

const FAQ = [
  { q: '¿Necesito saber de tecnología para usar el Turnero?', a: 'No. El onboarding tarda 5 minutos. Ponés tu nombre, rubro, servicios y horario. Ya está. Te damos un link que mandás a tus clientes o ponés en tu bio de Instagram.' },
  { q: '¿Cómo pago?', a: 'Por MercadoPago. Tarjeta, débito o transferencia. Para el plan mensual se cobra automáticamente. Para pago único, generamos el link.' },
  { q: '¿Los precios incluyen IVA?', a: 'DIVINIA opera como monotributista. No hay IVA adicional sobre los precios publicados.' },
  { q: '¿Puedo cancelar el plan mensual?', a: 'Sí, en cualquier momento. Avisás y cancelamos. Sin contratos de permanencia.' },
  { q: '¿Trabajan solo con negocios de San Luis?', a: 'No. Tenemos clientes en San Luis, Mendoza, Córdoba y Buenos Aires. Todo es remoto.' },
  { q: '¿Para la Landing Page y NUCLEUS cómo arranca?', a: 'Hablamos por WhatsApp, te hacemos 3-4 preguntas sobre tu negocio, y te enviamos una propuesta en 24hs con precio y plazo cerrado.' },
]

export default function PreciosPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ padding: '120px 0 80px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div className="eyebrow" style={{ marginBottom: 20 }}>3 productos · precios publicados · sin letra chica</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(48px,6vw,96px)', marginBottom: 24 }}>
            Lo que necesitás.<br /><em>Lo que pagás.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '44ch', margin: '0 auto 36px', lineHeight: 1.55 }}>
            Turnero online · Landing Page profesional · NUCLEUS IA para tu PYME.
            Todos los precios en ARS, sin sorpresas.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/onboarding" className="btn-v2 btn-ink" style={{ fontSize: 15 }}>
              Probar Turnero gratis 14 días →
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ghost-v2" style={{ fontSize: 15 }}>
              Hablar con Joaco
            </a>
          </div>
          <p style={{ fontSize: 11, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.08em', marginTop: 24 }}>
            TODOS LOS PRECIOS EN ARS · PAGOS VÍA MERCADOPAGO
          </p>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ padding: '80px 0', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Cómo funciona el Turnero</div>
            <h2 className="h-title">Del registro al primer turno<br />en <em>5 minutos.</em></h2>
          </div>
          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-4-mobile-2 md:grid-cols-4">
            {FUNNEL.map(f => (
              <div key={f.paso} style={{
                background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16,
                padding: '28px 24px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 12, right: 16,
                  fontFamily: 'var(--f-mono)', fontSize: 44, fontWeight: 800,
                  color: 'var(--line)', lineHeight: 1, letterSpacing: '-0.04em',
                }}>
                  {f.paso}
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, marginBottom: 14 }} />
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>
                  {f.titulo}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.55 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTO 1: TURNERO ── */}
      <section id="turnero" style={{ padding: '100px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }} className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 12, color: '#7C3AED' }}>{turnero.emoji} Producto 01</div>
              <h2 className="h-title">{turnero.name}<br /><em>online.</em></h2>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 12 }}>
                {turnero.description}
              </p>
              <p style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                14 días gratis · Sin tarjeta · Cancelás cuando querés
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }} className="grid-cols-3-mobile-1 md:grid-cols-3">
            {turnero.plans.map(plan => (
              <div key={plan.id} style={{
                background: plan.highlighted ? 'var(--ink)' : 'var(--paper-2)',
                border: `1px solid ${plan.highlighted ? '#7C3AED' : 'var(--line)'}`,
                borderRadius: 20, padding: '36px 32px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#7C3AED', color: '#fff', borderRadius: 100, padding: '4px 16px',
                    fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em',
                    whiteSpace: 'nowrap', textTransform: 'uppercase',
                  }}>
                    Más elegido
                  </div>
                )}
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: plan.highlighted ? '#A78BFA' : '#7C3AED', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,3.5vw,44px)', color: plan.highlighted ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                  {plan.price.cycle === 'unico'
                    ? `$${(plan.price.ars / 1000).toFixed(0)}k`
                    : `$${(plan.price.ars / 1000).toFixed(0)}k/mes`}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: plan.highlighted ? 'rgba(246,245,242,0.35)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {plan.price.label}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: plan.highlighted ? 'rgba(246,245,242,0.5)' : 'var(--muted-2)', marginBottom: 24 }}>
                  {plan.description}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: plan.highlighted ? 'rgba(246,245,242,0.75)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: plan.highlighted ? '#A78BFA' : '#7C3AED', flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/onboarding?plan=${plan.id}`}
                  style={{
                    display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: 10,
                    background: plan.highlighted ? '#7C3AED' : 'transparent',
                    color: plan.highlighted ? '#fff' : 'var(--ink)',
                    border: plan.highlighted ? 'none' : '1px solid var(--line)',
                    textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Empezar prueba gratis →
                </Link>
              </div>
            ))}
          </div>

          {/* Add-ons Turnero */}
          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Mantenimiento mensual (para plan pago único)
            </div>
            <div style={{ display: 'grid', gap: 12 }} className="md:grid-cols-2">
              {turnero.addons.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>{a.name}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: 'var(--ink)', flexShrink: 0 }}>{a.price.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTO 2: LANDING PAGE ── */}
      <section id="landing" style={{ padding: '100px 0', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }} className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 12, color: '#0284C7' }}>{landing.emoji} Producto 02</div>
              <h2 className="h-title">{landing.name}<br /><em>profesional.</em></h2>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 12 }}>
                {landing.description}
              </p>
              <p style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                Pago único · Entrega en 5-10 días hábiles · Hosting opcional por separado
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }} className="grid-cols-2-mobile-1 md:grid-cols-2">
            {landing.plans.map(plan => (
              <div key={plan.id} style={{
                background: plan.highlighted ? 'var(--ink)' : 'var(--paper)',
                border: `1px solid ${plan.highlighted ? '#0284C7' : 'var(--line)'}`,
                borderRadius: 20, padding: '36px 32px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#0284C7', color: '#fff', borderRadius: 100, padding: '4px 16px',
                    fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em',
                    whiteSpace: 'nowrap', textTransform: 'uppercase',
                  }}>
                    Más completo
                  </div>
                )}
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: plan.highlighted ? '#38BDF8' : '#0284C7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(36px,4vw,52px)', color: plan.highlighted ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                  ${(plan.price.ars / 1000).toFixed(0)}k
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: plan.highlighted ? 'rgba(246,245,242,0.35)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  pago único
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: plan.highlighted ? 'rgba(246,245,242,0.5)' : 'var(--muted-2)', marginBottom: 24 }}>
                  {plan.description}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: plan.highlighted ? 'rgba(246,245,242,0.75)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: plan.highlighted ? '#38BDF8' : '#0284C7', flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`${WA}?text=Quiero%20la%20Landing%20Page%20${encodeURIComponent(plan.name)}%20(${encodeURIComponent(plan.price.label)})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: 10,
                    background: plan.highlighted ? '#0284C7' : 'transparent',
                    color: plan.highlighted ? '#fff' : 'var(--ink)',
                    border: plan.highlighted ? 'none' : '1px solid var(--line)',
                    textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Pedir propuesta →
                </a>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Servicios adicionales (opcional)
            </div>
            <div style={{ display: 'grid', gap: 12 }} className="md:grid-cols-2">
              {landing.addons.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>{a.name}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: 'var(--ink)', flexShrink: 0 }}>{a.price.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTO 3: NUCLEUS IA ── */}
      <section id="nucleus" style={{ padding: '100px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }} className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 12, color: '#16A34A' }}>{nucleus.emoji} Producto 03</div>
              <h2 className="h-title">NUCLEUS<br /><em>IA propio.</em></h2>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 12 }}>
                {nucleus.description}
              </p>
              <p style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                Setup único · Entrenado con tu info · Mantenimiento mensual opcional
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }} className="grid-cols-2-mobile-1 md:grid-cols-2">
            {nucleus.plans.map(plan => (
              <div key={plan.id} style={{
                background: plan.highlighted ? 'var(--ink)' : 'var(--paper-2)',
                border: `1px solid ${plan.highlighted ? '#16A34A' : 'var(--line)'}`,
                borderRadius: 20, padding: '36px 32px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#16A34A', color: '#fff', borderRadius: 100, padding: '4px 16px',
                    fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em',
                    whiteSpace: 'nowrap', textTransform: 'uppercase',
                  }}>
                    Multi-agente
                  </div>
                )}
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: plan.highlighted ? '#4ADE80' : '#16A34A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,3.5vw,44px)', color: plan.highlighted ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                  ${(plan.price.ars / 1000).toFixed(0)}k
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: plan.highlighted ? 'rgba(246,245,242,0.35)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  setup único
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: plan.highlighted ? 'rgba(246,245,242,0.5)' : 'var(--muted-2)', marginBottom: 24 }}>
                  {plan.description}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: plan.highlighted ? 'rgba(246,245,242,0.75)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: plan.highlighted ? '#4ADE80' : '#16A34A', flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`${WA}?text=Quiero%20el%20NUCLEUS%20IA%20${encodeURIComponent(plan.name)}%20(${encodeURIComponent(plan.price.label)})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: 10,
                    background: plan.highlighted ? '#16A34A' : 'transparent',
                    color: plan.highlighted ? '#fff' : 'var(--ink)',
                    border: plan.highlighted ? 'none' : '1px solid var(--line)',
                    textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Pedir propuesta →
                </a>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Mantenimiento mensual (para mantener y mejorar el agente)
            </div>
            <div style={{ display: 'grid', gap: 12 }} className="md:grid-cols-2">
              {nucleus.addons.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>{a.name}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: 'var(--ink)', flexShrink: 0 }}>{a.price.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARATIVA RÁPIDA ── */}
      <section style={{ padding: '80px 0', background: 'var(--ink)', borderBottom: '1px solid rgba(246,245,242,0.08)' }}>
        <div className="wrap-v2">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 12 }}>
              ¿Por cuál empiezo?
            </div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(32px,4vw,56px)', color: 'var(--paper)', letterSpacing: '-0.04em', marginBottom: 12 }}>
              Guía rápida.
            </h2>
          </div>
          <div style={{ display: 'grid', gap: 16 }} className="md:grid-cols-3">
            {[
              {
                emoji: '📅',
                titulo: 'Empezá con el Turnero',
                cuando: 'Si tenés un negocio con turnos: peluquería, clínica, estética, gimnasio, psicología.',
                beneficio: 'Tus clientes reservan solos. Vos dejás de perder horas coordinando por WhatsApp.',
                cta: 'Probar gratis →',
                href: '/onboarding',
                color: '#7C3AED',
              },
              {
                emoji: '🌐',
                titulo: 'Sumá una Landing Page',
                cuando: 'Si no tenés web o la que tenés no cierra clientes.',
                beneficio: 'Presencia profesional. Tu negocio aparece en Google y convierte visitas en consultas.',
                cta: 'Pedir presupuesto →',
                href: `${WA}?text=Quiero%20información%20sobre%20la%20Landing%20Page`,
                color: '#0284C7',
              },
              {
                emoji: '🧠',
                titulo: 'NUCLEUS si querés IA real',
                cuando: 'Si ya tenés el negocio funcionando y querés automatizar con IA.',
                beneficio: 'Un agente entrenado con tu negocio que atiende, recuerda y vende por vos.',
                cta: 'Hablar con Joaco →',
                href: `${WA}?text=Quiero%20información%20sobre%20NUCLEUS%20IA`,
                color: '#16A34A',
              },
            ].map(item => (
              <div key={item.titulo} style={{
                background: 'rgba(246,245,242,0.04)',
                border: '1px solid rgba(246,245,242,0.1)',
                borderRadius: 16, padding: '32px 28px',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{item.emoji}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, color: 'var(--paper)', marginBottom: 10 }}>
                  {item.titulo}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: item.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Ideal si...
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(246,245,242,0.55)', lineHeight: 1.55, marginBottom: 12 }}>
                  {item.cuando}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'rgba(246,245,242,0.8)', lineHeight: 1.5, flex: 1, marginBottom: 24 }}>
                  {item.beneficio}
                </div>
                <a
                  href={item.href.startsWith('/') ? undefined : item.href}
                  {...(item.href.startsWith('/') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  style={{
                    display: 'block', textAlign: 'center', padding: '12px 20px', borderRadius: 10,
                    background: item.color, color: '#fff',
                    textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  {item.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2" style={{ maxWidth: 720 }}>
          <div className="eyebrow" style={{ marginBottom: 32 }}>Preguntas frecuentes</div>
          {FAQ.map(({ q, a }) => (
            <div key={q} style={{ padding: '24px 0', borderBottom: '1px solid var(--line)' }}>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: 'var(--ink)' }}>{q}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', margin: 0, lineHeight: 1.65 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '100px 0', background: 'var(--paper-2)', textAlign: 'center' }}>
        <div className="wrap-v2">
          <div className="eyebrow" style={{ marginBottom: 20 }}>El primer paso es gratis</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(40px,5vw,72px)', marginBottom: 20 }}>
            14 días de prueba.<br /><em>Sin tarjeta.</em>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 40, maxWidth: '44ch', margin: '0 auto 40px', lineHeight: 1.55 }}>
            Arrancá con el Turnero hoy. En 5 minutos tu agenda está funcionando.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/onboarding" className="btn-v2 btn-ink" style={{ fontSize: 16, padding: '16px 32px' }}>
              Crear mi Turnero gratis →
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ghost-v2" style={{ fontSize: 16 }}>
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
