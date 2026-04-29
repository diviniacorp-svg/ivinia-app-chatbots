import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import WAFloat from '@/components/public/WAFloat'

export const metadata: Metadata = {
  title: 'NUCLEUS IA — Sistema de IA completo para tu negocio',
  description:
    'NUCLEUS IA de DIVINIA: agentes IA coordinados que automatizan turnos, ventas, contenido y atención al cliente. Un solo sistema. Todo conectado.',
}

const WA = (msg: string) =>
  `https://wa.me/5492665286110?text=${encodeURIComponent(msg)}`

const MODULOS = [
  {
    icon: '📅',
    nombre: 'Turnero IA',
    desc: 'Reservas online 24/7. El cliente elige horario, paga la seña y recibe confirmación automática. Cero intervención manual.',
    color: '#10B981',
    precio: 'Incluido',
  },
  {
    icon: '💬',
    nombre: 'Chatbot 24hs',
    desc: 'Responde preguntas, califica leads, agenda turnos y cobra por WhatsApp. Funciona aunque estés dormido.',
    color: '#3B82F6',
    precio: 'Incluido',
  },
  {
    icon: '✨',
    nombre: 'Content IA',
    desc: 'Captions, posts, reels y hashtags generados con tu voz. Solo aprobás y publicás.',
    color: '#EC4899',
    precio: 'Incluido',
  },
  {
    icon: '🎯',
    nombre: 'CRM + Ventas',
    desc: 'Pipeline automático: el agente prospecta, califica y manda propuestas personalizadas. Joaco solo cierra.',
    color: '#F59E0B',
    precio: 'Incluido',
  },
  {
    icon: '📊',
    nombre: 'Reportes IA',
    desc: 'Digest diario de métricas clave: MRR, turnos, leads, costo IA. Todo en un mensaje de WhatsApp.',
    color: '#8B5CF6',
    precio: 'Incluido',
  },
  {
    icon: '🔔',
    nombre: 'Notificaciones',
    desc: 'Recordatorios automáticos de turnos, cobros pendientes y seguimiento de clientes inactivos.',
    color: '#6EE7B7',
    precio: 'Incluido',
  },
]

const CASOS = [
  {
    rubro: '💅 Nails & Estética',
    antes: 'Perdías 30 min al día coordinando turnos por WA. Las clientas se olvidaban, no aparecían.',
    despues: 'El Turnero recibe la reserva, cobra la seña y manda recordatorio automático. Tasa de no-shows: 0%.',
    metrica: '-100% no-shows',
  },
  {
    rubro: '🦷 Clínica Dental',
    antes: '2 horas semanales en redes, sin estrategia. Pocos seguidores, cero leads de Instagram.',
    despues: 'Content Factory genera 12 posts/mes con tono médico profesional. Chatbot atiende consultas a las 2am.',
    metrica: '+3 pacientes/mes desde IG',
  },
  {
    rubro: '🏋️ Gimnasio',
    antes: 'Bajas mensuales sin aviso. No sabías cuándo vencía el plan de cada socio.',
    despues: 'Agente de renovación avisa 7 días antes del vencimiento y ofrece descuento. Churn reducido a la mitad.',
    metrica: '-50% churn mensual',
  },
]

const PLANES = [
  {
    nombre: 'NUCLEUS Starter',
    precio: 400000,
    billing: 'setup único',
    mensual: 120000,
    color: '#8B5CF6',
    popular: false,
    modulos: ['Turnero IA', 'Chatbot básico', 'Reportes semanales', 'Soporte WhatsApp'],
    desc: 'Para negocios que quieren automatizar lo básico.',
  },
  {
    nombre: 'NUCLEUS Pro',
    precio: 700000,
    billing: 'setup único',
    mensual: 180000,
    color: '#C6FF3D',
    popular: true,
    modulos: ['Todo Starter', 'CRM + Pipeline IA', 'Content Factory', 'Notificaciones WA', 'Dashboard de métricas'],
    desc: 'El sistema completo. El negocio en piloto automático.',
  },
  {
    nombre: 'NUCLEUS Enterprise',
    precio: 0,
    billing: 'cotización a medida',
    mensual: 0,
    color: '#F59E0B',
    popular: false,
    modulos: ['Todo Pro', 'Integraciones a medida', 'Agentes personalizados', 'SLA dedicado', 'Capacitación presencial'],
    desc: 'Para grupos empresariales, franquicias y multi-sucursal.',
  },
]

const ars = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(n)

const INK = '#09090B'
const LIME = '#C6FF3D'
const PAPER = '#F6F5F2'

export default function NucleoProductPage() {
  return (
    <div style={{ background: PAPER, color: INK, minHeight: '100vh' }}>
      <WAFloat />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ background: INK, padding: 'clamp(80px,10vw,140px) 24px clamp(60px,8vw,100px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${LIME}18`, border: `1px solid ${LIME}40`,
            borderRadius: 100, padding: '5px 16px', marginBottom: 32,
          }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: LIME }}>
              Sistema de IA a medida
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
            fontSize: 'clamp(42px, 7vw, 88px)', color: '#fff',
            letterSpacing: '-0.04em', lineHeight: 1.0, margin: '0 0 24px',
          }}>
            🧠 NUCLEUS IA
          </h1>

          <p style={{
            fontFamily: 'var(--f-display)', fontSize: 'clamp(16px, 2.2vw, 22px)',
            color: 'rgba(246,245,242,0.55)', lineHeight: 1.55,
            margin: '0 auto 40px', maxWidth: '52ch',
          }}>
            Todos los agentes IA de DIVINIA, coordinados en un solo sistema.
            Tu negocio funciona solo — vos solo revisás los resultados.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={WA('Hola, quiero info sobre NUCLEUS IA para mi negocio')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: LIME, color: INK, borderRadius: 10,
                padding: '14px 28px', fontFamily: 'var(--f-mono)',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Consultar NUCLEUS →
            </a>
            <Link
              href="#precios"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: 'rgba(246,245,242,0.7)',
                border: '1px solid rgba(246,245,242,0.2)',
                borderRadius: 10, padding: '14px 28px',
                fontFamily: 'var(--f-mono)', fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Ver precios ↓
            </Link>
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', background: PAPER }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#71717A', marginBottom: 12 }}>
              Qué incluye
            </p>
            <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
              6 agentes IA coordinados,<br />trabajando para tu negocio
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {MODULOS.map(m => (
              <div key={m.nombre} style={{
                background: '#fff', borderRadius: 16, padding: '24px',
                border: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 24, width: 44, height: 44, borderRadius: 12,
                    background: `${m.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{m.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: INK }}>{m.nombre}</div>
                    <div style={{
                      fontFamily: 'var(--f-mono)', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: m.color, marginTop: 2,
                    }}>{m.precio}</div>
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#52525B', lineHeight: 1.5, margin: 0 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASOS DE USO ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', background: INK }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              Resultados reales
            </p>
            <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,4vw,48px)', color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
              Qué cambia con NUCLEUS
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {CASOS.map(c => (
              <div key={c.rubro} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)', padding: '24px',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>
                  {c.rubro}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: 6 }}>Antes</p>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>{c.antes}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10B981', marginBottom: 6 }}>Después</p>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>{c.despues}</p>
                  </div>
                </div>
                <div style={{
                  background: `${LIME}14`, border: `1px solid ${LIME}30`,
                  borderRadius: 8, padding: '8px 14px', textAlign: 'center',
                  fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 12,
                  color: LIME, letterSpacing: '0.04em',
                }}>
                  {c.metrica}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ padding: 'clamp(60px,8vw,100px) 24px', background: PAPER }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#71717A', marginBottom: 12 }}>
              Inversión
            </p>
            <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,4vw,48px)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
              Un sistema que se paga solo
            </h2>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: '#52525B', marginTop: 12, maxWidth: '42ch', margin: '12px auto 0' }}>
              50% al confirmar — 50% cuando está funcionando. Sin contratos de permanencia.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
            {PLANES.map(plan => (
              <div key={plan.nombre} style={{
                background: plan.popular ? INK : '#fff',
                border: `2px solid ${plan.popular ? plan.color : '#E4E4E7'}`,
                borderRadius: 20, padding: '32px 28px',
                display: 'flex', flexDirection: 'column', gap: 20,
                position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                    background: LIME, color: INK, borderRadius: 100,
                    padding: '4px 16px', fontFamily: 'var(--f-mono)',
                    fontWeight: 700, fontSize: 9, letterSpacing: '0.1em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    Más elegido ✓
                  </div>
                )}

                <div>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.color, marginBottom: 6 }}>
                    {plan.nombre}
                  </p>
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: plan.popular ? 'rgba(246,245,242,0.55)' : '#52525B', margin: 0, lineHeight: 1.4 }}>
                    {plan.desc}
                  </p>
                </div>

                <div>
                  {plan.precio > 0 ? (
                    <>
                      <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,3vw,36px)', color: plan.popular ? plan.color : INK, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {ars(plan.precio)}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: plan.popular ? 'rgba(246,245,242,0.35)' : '#71717A', marginTop: 2 }}>
                        {plan.billing} · luego {ars(plan.mensual)}/mes
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: plan.color, letterSpacing: '-0.04em' }}>
                      A medida
                    </div>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.modulos.map(m => (
                    <li key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--f-display)', fontSize: 13, color: plan.popular ? 'rgba(246,245,242,0.65)' : '#3F3F46' }}>
                      <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {m}
                    </li>
                  ))}
                </ul>

                <a
                  href={WA(`Hola, quiero el ${plan.nombre} para mi negocio`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center', padding: '13px 20px',
                    borderRadius: 10, textDecoration: 'none',
                    fontFamily: 'var(--f-mono)', fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: plan.popular ? plan.color : INK,
                    color: plan.popular ? INK : LIME,
                  }}
                >
                  {plan.precio > 0 ? 'Quiero este plan →' : 'Solicitar cotización →'}
                </a>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, color: '#71717A', marginTop: 24, letterSpacing: '0.04em' }}>
            Todos los precios en ARS · Pagos por MercadoPago · Garantía de resultado en 90 días
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', background: INK, textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,4vw,48px)', color: '#fff', letterSpacing: '-0.03em', margin: '0 0 20px', lineHeight: 1.1 }}>
            ¿Tu negocio es candidato<br />a NUCLEUS?
          </h2>
          <p style={{ fontFamily: 'var(--f-display)', fontSize: 16, color: 'rgba(246,245,242,0.5)', marginBottom: 32, lineHeight: 1.6 }}>
            En 20 minutos hacemos un diagnóstico gratuito. Si no hay ROI claro, no arrancamos.
          </p>
          <a
            href={WA('Hola Joaco, quiero el diagnóstico gratuito de NUCLEUS para mi negocio')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: LIME, color: INK, borderRadius: 10,
              padding: '16px 36px', fontFamily: 'var(--f-mono)',
              fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            Diagnóstico gratis →
          </a>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(246,245,242,0.25)', marginTop: 16, letterSpacing: '0.04em' }}>
            Sin compromiso · Respuesta en menos de 24hs
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
