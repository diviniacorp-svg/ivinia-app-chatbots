import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'

const WA = 'https://wa.me/5492665286110'

// ── TURNERO ───────────────────────────────────────────────────────────────────

const TURNERO_PLANES = [
  {
    nombre: 'Básico',
    precio: '$80.000',
    pago: 'pago único',
    para: '1-2 profesionales · servicio único',
    features: [
      'Página de reservas personalizada',
      'Hasta 3 servicios configurados',
      'Confirmación y recordatorio por WhatsApp',
      'Panel de gestión desde el celular',
      '3 meses de soporte incluido',
      'Configuración lista en 24hs',
    ],
    href: `${WA}?text=Quiero%20el%20Turnero%20Básico%20($80.000)`,
    highlight: false,
    color: '#38BDF8',
  },
  {
    nombre: 'Pro',
    precio: '$150.000',
    pago: 'pago único',
    para: 'equipo + múltiples servicios',
    features: [
      'Todo lo del Básico',
      'Múltiples profesionales (sin límite)',
      'Servicios y horarios ilimitados',
      'Cobro de seña al reservar (MercadoPago)',
      'Bloqueo de horarios y vacaciones',
      'Estadísticas de turnos',
      '6 meses de soporte incluido',
    ],
    href: `${WA}?text=Quiero%20el%20Turnero%20Pro%20($150.000)`,
    highlight: true,
    color: '#C6FF3D',
  },
  {
    nombre: 'Enterprise',
    precio: '$200.000',
    pago: 'pago único',
    para: 'multi-sucursal · clínicas grandes',
    features: [
      'Todo lo del Pro',
      'Múltiples sucursales',
      'Chatbot integrado para derivar turnos',
      'CRM básico con historial de clientes',
      'Capacitación del equipo',
      '12 meses de soporte incluido',
    ],
    href: `${WA}?text=Quiero%20el%20Turnero%20Enterprise%20($200.000)`,
    highlight: false,
    color: '#818CF8',
  },
]

// ── CHATBOT ───────────────────────────────────────────────────────────────────

const CHATBOT_PLANES = [
  {
    nombre: 'Básico',
    precio: '$150.000',
    pago: 'pago único · setup + 1 año hosting',
    para: 'negocio pequeño con preguntas estándar',
    features: [
      'Responde las 15 preguntas más frecuentes',
      'Da info de horarios, precios y servicios',
      'Agenda turnos si ya tenés Turnero',
      'Derivación a humano cuando no sabe',
      'Entrenado con el tono de tu negocio',
      'Activo 24hs / 7 días',
    ],
    href: `${WA}?text=Quiero%20el%20Chatbot%20Básico%20($150.000)`,
    highlight: false,
    color: '#34D399',
  },
  {
    nombre: 'Pro',
    precio: '$250.000',
    pago: 'pago único · setup + 1 año hosting',
    para: 'negocio con flujos complejos o ventas',
    features: [
      'Todo lo del Básico',
      'IA con Claude (conversación natural, sin guiones)',
      'Calificación automática de leads',
      'Envío de presupuestos y propuestas por WA',
      'Integración con tu CRM o planilla',
      'Flujos personalizados por intención del cliente',
      'Reportes mensuales de conversaciones',
    ],
    href: `${WA}?text=Quiero%20el%20Chatbot%20Pro%20($250.000)`,
    highlight: true,
    color: '#C6FF3D',
  },
]

const CHATBOT_MANTENIMIENTO = [
  { nombre: 'Soporte básico', precio: '$30.000/mes', items: ['1 ajuste de respuestas/mes', 'Monitoreo', 'Respuesta en 48hs'] },
  { nombre: 'Soporte pro', precio: '$60.000/mes', items: ['Ajustes ilimitados', 'Nuevas respuestas', 'Respuesta en 24hs'] },
]

// ── CONTENT FACTORY ──────────────────────────────────────────────────────────

const CONTENT_PLANES = [
  {
    nombre: 'Starter',
    precio: '$80.000/mes',
    para: 'presencia básica en redes',
    features: [
      '12 posts mensuales con IA',
      'Captions + hashtags en el tono de tu marca',
      'Diseño en Canva (plantilla de tu negocio)',
      'Planificación del mes completo',
    ],
    href: `${WA}?text=Quiero%20el%20Content%20Factory%20Starter%20($80.000/mes)`,
    color: '#E879F9',
  },
  {
    nombre: 'Crecimiento',
    precio: '$120.000/mes',
    para: 'engagement + alcance real',
    features: [
      '20 posts + 4 reels mensuales',
      'Guión y prompt de video IA para cada reel',
      'Stories de soporte (5/semana)',
      'Reporte de métricas mensual',
      'Estrategia de hashtags por nicho',
    ],
    href: `${WA}?text=Quiero%20el%20Content%20Factory%20Crecimiento%20($120.000/mes)`,
    color: '#E879F9',
  },
  {
    nombre: 'Gestión total',
    precio: '$150.000/mes',
    para: 'delegás todo el contenido',
    features: [
      'Todo lo del Crecimiento',
      '4 stories diarias + sequencias de venta',
      'Respuesta a DMs y comentarios con IA',
      'Newsletter mensual',
      'Propuestas de colaboraciones y tendencias',
    ],
    href: `${WA}?text=Quiero%20el%20Content%20Factory%20Gestión%20Total%20($150.000/mes)`,
    color: '#E879F9',
  },
]

// ── TODO DIVINIA ──────────────────────────────────────────────────────────────

const TODO_FEATURES = [
  'Chatbot 24hs (plan Pro) activo desde el primer día',
  'Turnero online con reservas y recordatorios',
  '20 posts + 4 reels mensuales con IA',
  'CRM con scoring de leads automático',
  'Dashboard de métricas unificado',
  'Soporte directo por WhatsApp (respuesta en 4hs)',
  'Reportes mensuales de resultados reales',
  'Ajustes y actualizaciones sin costo extra',
]

// ── PROYECTOS A MEDIDA ────────────────────────────────────────────────────────

const PROYECTOS = [
  { nombre: 'Landing page premium', precio: '$100.000', plazo: '48hs', desc: 'Scroll animations, mobile-first, optimizada para convertir.' },
  { nombre: 'Automatización de proceso único', precio: '$120.000', plazo: '2-3 días', desc: 'Mails, planillas, reportes, seguimiento. Lo repetitivo, automático.' },
  { nombre: 'Pack 3 automatizaciones', precio: '$300.000', plazo: '1 semana', desc: 'Tres procesos de tu negocio automatizados en simultáneo.' },
  { nombre: 'CRM con IA', precio: '$400.000', plazo: '2 semanas', desc: 'Tu base de clientes viva: sabe a quién llamar, cuándo, y qué decirle.' },
  { nombre: 'Dashboard / Panel admin', precio: 'desde $400.000', plazo: '2-3 semanas', desc: 'Panel a medida para tu negocio con métricas en tiempo real.' },
  { nombre: 'Avatar IA (portavoz corporativo)', precio: 'desde $200.000', plazo: '5-7 días', desc: 'Presentador virtual con tu voz clonada + 3 videos demo.' },
  { nombre: 'Sistema multi-agente', precio: 'desde $800.000', plazo: '2-4 semanas', desc: 'Varios agentes coordinados operando tu negocio de forma autónoma.' },
]

// ── FUNNEL VISUAL ─────────────────────────────────────────────────────────────

const FUNNEL = [
  { paso: '01', titulo: 'Auditoría gratis', desc: 'En 60 segundos, la IA analiza tu presencia digital y detecta qué te está costando dinero.', color: '#C6FF3D' },
  { paso: '02', titulo: 'Propuesta en 24hs', desc: 'Si hay fit, te mandamos una propuesta concreta con el producto que resuelve tu problema principal.', color: '#60A5FA' },
  { paso: '03', titulo: 'Demo de 20 minutos', desc: 'Te mostramos el sistema funcionando en un negocio de tu rubro. Sin demos genéricas.', color: '#34D399' },
  { paso: '04', titulo: 'Señas el 50%', desc: 'Confirmás por MercadoPago. El 50% restante lo pagás cuando entregamos y todo funciona.', color: '#F472B6' },
  { paso: '05', titulo: 'Live en 24hs–2 semanas', desc: 'Según el producto. Chatbot y Turnero básico: 24hs. Proyectos complejos: calendario acordado.', color: '#E879F9' },
  { paso: '06', titulo: 'Upsell al mes 2', desc: 'Cuando veas los resultados reales, hablamos del siguiente producto. Sin presión antes.', color: '#FCD34D' },
]

export default function PreciosPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ padding: '120px 0 80px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div className="eyebrow" style={{ marginBottom: 20 }}>Precios DIVINIA — sin letra chica</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(48px,6vw,96px)', marginBottom: 24 }}>
            Lo que pagás.<br /><em>Lo que recibís.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '44ch', margin: '0 auto 28px', lineHeight: 1.55 }}>
            Cuatro productos, precios publicados, sin sorpresas.
            Pagás la mitad al arrancar y la otra mitad cuando todo funciona.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ink" style={{ fontSize: 15 }}>
              Hablar con Joaco →
            </a>
            <Link href="/auditoria" className="btn-v2 btn-ghost-v2" style={{ fontSize: 15 }}>
              Auditoría gratis primero
            </Link>
          </div>
          <p style={{ fontSize: 12, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.08em', marginTop: 24 }}>
            TODOS LOS PRECIOS EN ARS · PAGOS VÍA MERCADOPAGO · 50% AL INICIO — 50% AL ENTREGAR
          </p>
        </div>
      </section>

      {/* ── FUNNEL — CÓMO FUNCIONA ── */}
      <section style={{ padding: '80px 0', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Cómo trabajamos</div>
            <h2 className="h-title">Del "hola" al sistema funcionando.</h2>
          </div>
          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-3-mobile-1 md:grid-cols-3">
            {FUNNEL.map((f, i) => (
              <div key={f.paso} style={{
                background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16,
                padding: '28px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 16, right: 20,
                  fontFamily: 'var(--f-mono)', fontSize: 48, fontWeight: 800,
                  color: 'var(--line)', lineHeight: 1, letterSpacing: '-0.04em',
                }}>
                  {f.paso}
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: f.color, marginBottom: 16,
                }} />
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>
                  {f.titulo}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', lineHeight: 1.55 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTO 1: TURNERO ── */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }} className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 12, color: '#38BDF8' }}>Producto 01</div>
              <h2 className="h-title">Turnero<br /><em>online.</em></h2>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 12 }}>
                Tus clientes reservan solos, 24hs, sin mandarte mensajes.
                Vos recibís la notificación y atendés. Sin planillas, sin llamadas.
              </p>
              <p style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                Pago único · Configuración en 24hs · Sin cuota mensual obligatoria
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-3-mobile-1 md:grid-cols-3">
            {TURNERO_PLANES.map(p => (
              <div key={p.nombre} style={{
                background: p.highlight ? 'var(--ink)' : 'var(--paper-2)',
                border: `1px solid ${p.highlight ? p.color : 'var(--line)'}`,
                borderRadius: 20, padding: '36px 32px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {p.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: p.color, color: 'var(--ink)', borderRadius: 100, padding: '4px 16px',
                    fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em',
                    whiteSpace: 'nowrap', textTransform: 'uppercase',
                  }}>
                    Más elegido
                  </div>
                )}
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: p.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {p.nombre}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(36px,4vw,48px)', color: p.highlight ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                  {p.precio}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: p.highlight ? 'rgba(246,245,242,0.35)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {p.pago}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: p.highlight ? 'rgba(246,245,242,0.5)' : 'var(--muted-2)', marginBottom: 28 }}>
                  {p.para}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: p.highlight ? 'rgba(246,245,242,0.75)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: p.color, flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href={p.href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: 10,
                  background: p.highlight ? p.color : 'transparent',
                  color: p.highlight ? 'var(--ink)' : 'var(--ink)',
                  border: p.highlight ? 'none' : '1px solid var(--line)',
                  textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                  fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  Contratar →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTO 2: CHATBOT ── */}
      <section style={{ padding: '100px 0', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }} className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 12, color: '#34D399' }}>Producto 02</div>
              <h2 className="h-title">Chatbot<br /><em>24hs.</em></h2>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 12 }}>
                Tu negocio responde automáticamente en WhatsApp a cualquier hora.
                Sin perder leads que escriben a las 11 de la noche.
              </p>
              <p style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                Setup pago único · 1 año de hosting incluido · Mantenimiento mensual opcional
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 32 }} className="grid-cols-2-mobile-1 md:grid-cols-2">
            {CHATBOT_PLANES.map(p => (
              <div key={p.nombre} style={{
                background: p.highlight ? 'var(--ink)' : 'var(--paper)',
                border: `1px solid ${p.highlight ? p.color : 'var(--line)'}`,
                borderRadius: 20, padding: '36px 32px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {p.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: p.color, color: 'var(--ink)', borderRadius: 100, padding: '4px 16px',
                    fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap',
                  }}>
                    Con IA real (Claude)
                  </div>
                )}
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: p.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {p.nombre}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(36px,4vw,48px)', color: p.highlight ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                  {p.precio}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: p.highlight ? 'rgba(246,245,242,0.35)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {p.pago}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: p.highlight ? 'rgba(246,245,242,0.5)' : 'var(--muted-2)', marginBottom: 28 }}>
                  {p.para}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: p.highlight ? 'rgba(246,245,242,0.75)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: p.color, flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href={p.href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: 10,
                  background: p.highlight ? p.color : 'transparent',
                  color: 'var(--ink)',
                  border: p.highlight ? 'none' : '1px solid var(--line)',
                  textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                  fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  Contratar →
                </a>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '28px 32px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              Mantenimiento mensual (opcional — después del año incluido)
            </div>
            <div style={{ display: 'grid', gap: 16 }} className="grid-cols-2-mobile-1 md:grid-cols-2">
              {CHATBOT_MANTENIMIENTO.map(m => (
                <div key={m.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>
                      {m.nombre}
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {m.items.map(i => (
                        <li key={i} style={{ fontSize: 13, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', display: 'flex', gap: 8 }}>
                          <span style={{ color: 'var(--lime)' }}>·</span>{i}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: 'var(--ink)', flexShrink: 0 }}>
                    {m.precio}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTO 3: CONTENT FACTORY ── */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }} className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 12, color: '#E879F9' }}>Producto 03</div>
              <h2 className="h-title">Content<br /><em>Factory.</em></h2>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 12 }}>
                Tus redes crecen mientras vos atendés tu negocio.
                Publicamos todos los meses, con contenido real de tu rubro.
              </p>
              <p style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                Planes mensuales · Sin permanencia mínima · Cancelás cuando querés
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-3-mobile-1 md:grid-cols-3">
            {CONTENT_PLANES.map((p, i) => (
              <div key={p.nombre} style={{
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                borderRadius: 20, padding: '36px 32px',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: p.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {p.nombre}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,3vw,40px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                  {p.precio}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)', marginBottom: 28 }}>
                  {p.para}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: p.color, flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href={p.href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: 10,
                  background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)',
                  textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                  fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  Contratar →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTO 4: TODO DIVINIA ── */}
      <section style={{ padding: '100px 0', background: 'var(--ink)', borderBottom: '1px solid rgba(246,245,242,0.08)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 60, alignItems: 'center' }} className="grid-cols-2-mobile-1 md:grid-cols-[1.2fr_1fr]">
            <div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 16 }}>
                Producto 04 — El bundle completo
              </div>
              <h2 className="h-display" style={{ fontSize: 'clamp(44px,5.5vw,80px)', color: 'var(--paper)', marginBottom: 24, letterSpacing: '-0.04em' }}>
                Todo<br /><em>DIVINIA.</em>
              </h2>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: 'rgba(246,245,242,0.6)', fontFamily: 'var(--f-display)', marginBottom: 32, maxWidth: '42ch' }}>
                Chatbot + Turnero + Contenido en un solo plan mensual.
                La solución completa para el negocio que quiere automatizar sin pensar en tecnología.
              </p>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(52px,6vw,80px)', color: 'var(--lime)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  $250.000
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(246,245,242,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
                  por mes · sin permanencia mínima
                </div>
              </div>
              <a href={`${WA}?text=Quiero%20el%20plan%20Todo%20DIVINIA%20($250.000/mes)`} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block', background: 'var(--lime)', color: 'var(--ink)', borderRadius: 12, padding: '15px 32px',
                fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 16, textDecoration: 'none', letterSpacing: '-0.01em',
              }}>
                Quiero Todo DIVINIA →
              </a>
            </div>
            <div style={{ background: 'rgba(246,245,242,0.04)', border: '1px solid rgba(246,245,242,0.1)', borderRadius: 20, padding: '36px 32px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(246,245,242,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
                Todo incluido
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {TODO_FEATURES.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 12, fontSize: 14, color: 'rgba(246,245,242,0.75)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--lime)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(246,245,242,0.08)' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(246,245,242,0.35)', letterSpacing: '0.06em', marginBottom: 8 }}>
                  En perspectiva:
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'rgba(246,245,242,0.55)', lineHeight: 1.5 }}>
                  Un empleado en relación de dependencia cuesta mínimo $400.000/mes en ARS.
                  Todo DIVINIA hace el trabajo de 3 personas por menos de la mitad.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROYECTOS A MEDIDA ── */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Proyectos — pago único</div>
            <h2 className="h-title">
              ¿Necesitás algo<br /><em>a medida?</em>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '44ch', marginTop: 12, lineHeight: 1.55 }}>
              Proyectos con alcance fijo, precio cerrado y plazos reales. Sin sorpresas al final.
            </p>
          </div>
          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
            {PROYECTOS.map((p, i) => (
              <div key={p.nombre} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px 24px',
                padding: '20px 32px', borderBottom: i < PROYECTOS.length - 1 ? '1px solid var(--line)' : 'none',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 3 }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>
                    {p.desc}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  ⏱ {p.plazo}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 17, color: 'var(--ink)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {p.precio}
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>
            50% al confirmar · 50% al entregar · Alcance fijo por escrito antes de arrancar
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2" style={{ maxWidth: 720 }}>
          <div className="eyebrow" style={{ marginBottom: 32 }}>Preguntas frecuentes</div>
          {[
            { q: '¿Por qué el 50/50?', a: 'Porque nos importa que funcione. Vos tenés el incentivo de que entregamos. Nosotros tenemos el incentivo de que no perdés la plata si algo no sale. Es la única estructura que nos parece justa.' },
            { q: '¿Qué pasa si necesito cambios después de la entrega?', a: 'Los primeros 30 días de soporte están incluidos en todos los productos. Si son ajustes pequeños, los hacemos sin cargo. Si es una funcionalidad nueva, la presupuestamos.' },
            { q: '¿Puedo cancelar el plan mensual en cualquier momento?', a: 'Sí. Sin preguntas. Avisás con 15 días de anticipación y cancelamos. No hay contratos de permanencia.' },
            { q: '¿Cómo pago?', a: 'Por MercadoPago. Tarjeta, débito o transferencia. Para proyectos pago único: generamos el link. Para mensuales: se cobra automáticamente el mismo día cada mes.' },
            { q: '¿Los precios incluyen IVA?', a: 'DIVINIA opera como monotributista. No hay IVA adicional sobre los precios publicados.' },
            { q: '¿Trabajan solo con negocios de San Luis?', a: 'No. La mayoría del trabajo es remoto. Tenemos clientes en San Luis, Mendoza, Córdoba y Buenos Aires. La diferencia es que somos del interior y entendemos los negocios del interior.' },
          ].map(({ q, a }) => (
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
            Antes de pagar<br /><em>auditamos tu negocio.</em>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 40, maxWidth: '44ch', margin: '0 auto 40px', lineHeight: 1.55 }}>
            En 60 segundos te decimos exactamente qué producto necesitás y cuánto te cuesta no tenerlo ya.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auditoria" className="btn-v2 btn-ink" style={{ fontSize: 16, padding: '16px 32px' }}>
              Ver mi auditoría gratis →
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ghost-v2" style={{ fontSize: 16 }}>
              Hablar directo por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
