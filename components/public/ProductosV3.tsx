import Reveal from './Reveal'
import Link from 'next/link'

const WA = 'https://wa.me/5492665286110?text='

const PRODUCTOS = [
  {
    id: 'turnero',
    num: '01',
    nombre: 'Turnero',
    tagline: 'Tus clientes reservan solos, 24hs.',
    descripcion: 'Sistema de turnos online personalizado para tu negocio. Reservas, confirmaciones por WhatsApp, cobro de seña y panel de gestión incluidos.',
    precio: '$45.000',
    billing: '/mes',
    altPrecio: 'ó $120.000 pago único',
    badge: 'Listo en 24hs',
    badgeColor: '#C6FF3D',
    features: [
      'Página de reservas pública con tu marca',
      'QR imprimible para el local',
      'Confirmación automática por WhatsApp',
      'Panel del negocio con turnos del día',
      'Cobro de seña online (plan único)',
    ],
    color: '#38BDF8',
    wa: 'Hola%20DIVINIA%2C%20quiero%20el%20Turnero%20para%20mi%20negocio',
    demo: '/rubros',
    highlight: true,
    estado: 'activo',
  },
  {
    id: 'central',
    num: '02',
    nombre: 'Central IA',
    tagline: 'Tu WhatsApp responde solo, 24/7.',
    descripcion: 'Chatbot con IA real (Claude) entrenado con tu negocio. Responde consultas, agenda turnos y califica leads mientras vos dormís.',
    precio: '$90.000',
    billing: '/mes',
    altPrecio: 'ó $180.000 pago único',
    badge: null,
    badgeColor: '#34D399',
    features: [
      'IA entrenada con tu catálogo y precios',
      'Responde en tu tono y estilo',
      'Califica leads automáticamente',
      'Integra con Turnero',
      'Reportes semanales de conversaciones',
    ],
    color: '#34D399',
    wa: 'Hola%20DIVINIA%2C%20quiero%20el%20Chatbot%20de%20WhatsApp',
    demo: null,
    highlight: false,
    estado: 'activo',
  },
  {
    id: 'content',
    num: '03',
    nombre: 'Content Factory',
    tagline: 'Redes sociales en piloto automático.',
    descripcion: 'Posts, reels y stories generados con IA cada mes. Diseño con tu identidad visual, captions con tu voz, hashtags optimizados.',
    precio: '$80.000',
    billing: '/mes',
    altPrecio: 'hasta $150.000/mes pack completo',
    badge: null,
    badgeColor: '#E879F9',
    features: [
      '30 posts mensuales con diseño IA',
      'Captions en tu voz y tono',
      'Stories + Reels guionados',
      'Hashtags y horario optimizado',
      'Revisión y aprobación antes de publicar',
    ],
    color: '#E879F9',
    wa: 'Hola%20DIVINIA%2C%20quiero%20el%20Content%20Factory',
    demo: null,
    highlight: false,
    estado: 'activo',
  },
  {
    id: 'avatar',
    num: '04',
    nombre: 'Avatares IA',
    tagline: 'Un portavoz virtual para tu marca.',
    descripcion: 'Avatar digital con tu voz clonada que presenta tu negocio, responde FAQs en video y construye presencia de marca sin cámaras.',
    precio: '$200.000',
    billing: 'setup',
    altPrecio: 'hasta $600.000 pack premium',
    badge: 'A medida',
    badgeColor: '#818CF8',
    features: [
      'Avatar personalizado con tu imagen',
      'Voz clonada en 15 minutos de audio',
      'Pack de 10 videos incluido',
      'Integración con redes y web',
      'Actualizaciones de contenido mensuales',
    ],
    color: '#818CF8',
    wa: 'Hola%20DIVINIA%2C%20quiero%20un%20Avatar%20IA%20para%20mi%20negocio',
    demo: null,
    highlight: false,
    estado: 'activo',
  },
  {
    id: 'nucleus',
    num: '05',
    nombre: 'NUCLEUS',
    tagline: 'Tu negocio, operando solo.',
    descripcion: 'Sistema multi-agente que coordina ventas, atención, contenido y administración. Para negocios que quieren escalar sin contratar.',
    precio: 'desde $800.000',
    billing: '',
    altPrecio: 'setup · presupuesto a medida',
    badge: 'Para escalar',
    badgeColor: '#FF5E3A',
    features: [
      'Múltiples agentes coordinados',
      'CRM automatizado con IA',
      'Reportes y decisiones automáticas',
      'Integración con todos los productos',
      'Soporte dedicado y evolución continua',
    ],
    color: '#FF5E3A',
    wa: 'Hola%20DIVINIA%2C%20quiero%20info%20sobre%20NUCLEUS',
    demo: null,
    highlight: false,
    estado: 'activo',
  },
]

export default function ProductosV3() {
  return (
    <section id="productos" style={{ padding: '100px 0', background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
      <div className="wrap-v2">

        <Reveal>
          <div style={{ display: 'grid', gap: 40, marginBottom: 64 }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Productos — 02/05</div>
              <h2 className="h-title">
                Cinco herramientas.<br />
                <em>Un objetivo.</em>
              </h2>
            </div>
            <p style={{
              alignSelf: 'end',
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--muted-2)',
              fontFamily: 'var(--f-display)',
              maxWidth: '52ch',
            }}>
              Cada producto resuelve un problema concreto. Empezás con el que más duele y sumás cuando querés.
              Sin paquetes obligatorios, sin permanencia.
            </p>
          </div>
        </Reveal>

        {/* Card grande del Turnero */}
        <Reveal>
          <div style={{
            background: 'var(--ink)',
            borderRadius: 24,
            padding: '48px',
            marginBottom: 16,
            display: 'grid',
            gap: 40,
            position: 'relative',
            overflow: 'hidden',
          }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1.4fr_1fr]"
          >
            {/* Badge */}
            <div style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: PRODUCTOS[0].badgeColor,
              color: 'var(--ink)',
              borderRadius: 100,
              padding: '5px 14px',
              fontFamily: 'var(--f-mono)',
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {PRODUCTOS[0].badge} ✓
            </div>

            <div>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: PRODUCTOS[0].color,
                marginBottom: 12,
              }}>
                {PRODUCTOS[0].num} — Producto estrella
              </div>
              <h3 style={{
                fontFamily: 'var(--f-display)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 'clamp(36px, 4vw, 56px)',
                color: 'var(--paper)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: 12,
              }}>
                {PRODUCTOS[0].nombre}
              </h3>
              <p style={{
                fontFamily: 'var(--f-display)',
                fontSize: 18,
                color: 'rgba(246,245,242,0.6)',
                lineHeight: 1.5,
                marginBottom: 28,
                maxWidth: '40ch',
              }}>
                {PRODUCTOS[0].descripcion}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {PRODUCTOS[0].features.map(f => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontFamily: 'var(--f-display)',
                    fontSize: 14,
                    color: 'rgba(246,245,242,0.65)',
                  }}>
                    <span style={{ color: PRODUCTOS[0].badgeColor, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href={`${WA}${PRODUCTOS[0].wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: PRODUCTOS[0].badgeColor,
                    color: 'var(--ink)',
                    borderRadius: 10,
                    padding: '13px 22px',
                    fontFamily: 'var(--f-mono)',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  Contratar Turnero →
                </a>
                <Link
                  href={PRODUCTOS[0].demo!}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid rgba(246,245,242,0.2)',
                    color: 'rgba(246,245,242,0.7)',
                    borderRadius: 10,
                    padding: '13px 22px',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  Ver demos →
                </Link>
              </div>
            </div>

            {/* Precio */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(246,245,242,0.3)',
                marginBottom: 8,
              }}>
                Precio
              </div>
              <div style={{
                fontFamily: 'var(--f-display)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 'clamp(48px, 6vw, 80px)',
                color: PRODUCTOS[0].badgeColor,
                letterSpacing: '-0.05em',
                lineHeight: 1,
              }}>
                {PRODUCTOS[0].precio}
              </div>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                color: 'rgba(246,245,242,0.4)',
                letterSpacing: '0.06em',
                marginBottom: 20,
              }}>
                {PRODUCTOS[0].billing}
              </div>
              <div style={{
                fontFamily: 'var(--f-display)',
                fontSize: 13,
                color: 'rgba(246,245,242,0.35)',
                marginBottom: 28,
              }}>
                {PRODUCTOS[0].altPrecio}
              </div>

              {/* Garantía */}
              <div style={{
                background: 'rgba(198,255,61,0.08)',
                border: '1px solid rgba(198,255,61,0.2)',
                borderRadius: 12,
                padding: '14px 18px',
              }}>
                <div style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: PRODUCTOS[0].badgeColor,
                  marginBottom: 4,
                }}>
                  Compromiso DIVINIA
                </div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  color: 'rgba(246,245,242,0.55)',
                  lineHeight: 1.5,
                }}>
                  Entregamos funcionando antes de cobrar el saldo. Sin contratos ni letra chica.
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Grid 2x2 de otros productos */}
        <div style={{ display: 'grid', gap: 16 }}
          className="grid-cols-2-mobile-1 md:grid-cols-2">
          {PRODUCTOS.slice(1).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <div style={{
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 20,
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                height: '100%',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: p.color,
                      marginBottom: 8,
                    }}>
                      {p.num}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--f-display)',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: 28,
                      color: 'var(--ink)',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}>
                      {p.nombre}
                    </h3>
                  </div>
                  {p.badge && (
                    <span style={{
                      background: p.color + '18',
                      color: p.color,
                      border: `1px solid ${p.color}30`,
                      borderRadius: 100,
                      padding: '4px 12px',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.badge}
                    </span>
                  )}
                </div>

                <p style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 14,
                  color: 'var(--muted-2)',
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {p.descripcion}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--f-display)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: 28,
                    color: 'var(--ink)',
                    letterSpacing: '-0.03em',
                  }}>
                    {p.precio}
                  </span>
                  <span style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    color: 'var(--muted)',
                    letterSpacing: '0.06em',
                  }}>
                    {p.billing}
                  </span>
                </div>

                <a
                  href={`${WA}${p.wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: `1px solid ${p.color}40`,
                    background: `${p.color}0A`,
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontFamily: 'var(--f-mono)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transition: 'background 0.2s',
                  }}
                >
                  Me interesa →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
