import Link from 'next/link'

const WA = 'https://wa.me/5492665286110'

const PRODUCTOS = [
  {
    id: 'turnero',
    eyebrow: '01 — Agenda digital',
    nombre: 'Turnero',
    tagline: 'Tus clientes reservan solos. Vos solo atendés.',
    desde: 'desde $80.000',
    periodo: 'pago único',
    highlights: [
      'Reservas online 24hs',
      'Recordatorios automáticos por WA',
      'Sin cuota mensual obligatoria',
      'Listo en 24hs',
    ],
    color: '#38BDF8',
    href: `${WA}?text=Quiero%20el%20Turnero`,
    highlight: false,
  },
  {
    id: 'todo',
    eyebrow: '04 — Bundle completo',
    nombre: 'Todo DIVINIA',
    tagline: 'Chatbot + Turnero + Contenido. El negocio automatizado.',
    desde: '$250.000',
    periodo: 'por mes · sin permanencia',
    highlights: [
      'Chatbot 24hs con IA real (Claude)',
      'Turnero Pro incluido',
      '20 posts + 4 reels mensuales',
      'CRM con scoring automático',
    ],
    color: '#C6FF3D',
    href: `${WA}?text=Quiero%20el%20plan%20Todo%20DIVINIA`,
    highlight: true,
  },
  {
    id: 'chatbot',
    eyebrow: '02 — Atención automática',
    nombre: 'Chatbot 24hs',
    tagline: 'WhatsApp responde solo. Ningún lead se pierde de noche.',
    desde: 'desde $150.000',
    periodo: 'pago único · 1 año hosting',
    highlights: [
      'Activo 24hs / 7 días',
      'Entrenado con tu negocio',
      'Califica leads automáticamente',
      'Integra con Turnero',
    ],
    color: '#34D399',
    href: `${WA}?text=Quiero%20el%20Chatbot%2024hs`,
    highlight: false,
  },
]

export default function PricingV2() {
  return (
    <section id="precios" style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}>
      <div className="wrap-v2">

        <div style={{ display: 'grid', gap: 40, marginBottom: 72 }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Precios — 03/05</div>
            <h2 className="h-title">
              Cuatro productos.<br />
              <em>Un objetivo.</em>
            </h2>
          </div>
          <p style={{ alignSelf: 'end', fontSize: 18, lineHeight: 1.5, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '52ch' }}>
            Sin mensualidades ocultas, sin contratos de permanencia, sin sorpresas.
            50% al confirmar, 50% cuando entregamos y todo funciona.
          </p>
        </div>

        {/* 3 productos destacados */}
        <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">
          {PRODUCTOS.map(p => (
            <div key={p.id} style={{
              padding: '40px 32px',
              background: p.highlight ? 'var(--ink)' : 'var(--paper)',
              border: `1px solid ${p.highlight ? p.color : 'var(--line)'}`,
              borderRadius: 20,
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: p.color, color: 'var(--ink)', borderRadius: 100,
                  padding: '4px 16px', fontSize: 10, fontFamily: 'var(--f-mono)',
                  fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap', textTransform: 'uppercase',
                }}>
                  El más elegido
                </div>
              )}

              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.color, marginBottom: 16 }}>
                {p.eyebrow}
              </div>

              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,3vw,36px)', color: p.highlight ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                {p.nombre}
              </div>

              <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: p.highlight ? 'rgba(246,245,242,0.5)' : 'var(--muted-2)', marginBottom: 28, lineHeight: 1.4 }}>
                {p.tagline}
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px,3vw,40px)', color: p.highlight ? 'var(--lime)' : 'var(--ink)', letterSpacing: '-0.04em' }}>
                  {p.desde}
                </span>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: p.highlight ? 'rgba(246,245,242,0.3)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                  {p.periodo}
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, marginBottom: 28 }}>
                {p.highlights.map(h => (
                  <li key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, fontFamily: 'var(--f-display)', color: p.highlight ? 'rgba(246,245,242,0.7)' : 'var(--muted-2)', lineHeight: 1.4 }}>
                    <span style={{ color: p.color, fontWeight: 700, flexShrink: 0 }}>✓</span>{h}
                  </li>
                ))}
              </ul>

              <a href={p.href} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: 10,
                background: p.highlight ? p.color : 'transparent',
                color: p.highlight ? 'var(--ink)' : 'var(--ink)',
                border: p.highlight ? 'none' : '1px solid var(--ink)',
                textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Contratar →
              </a>
            </div>
          ))}
        </div>

        {/* Content Factory + link a /precios */}
        <div style={{ display: 'grid', gap: 12, alignItems: 'stretch' }} className="grid-cols-2-mobile-1 md:grid-cols-[2fr_1fr]">

          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20, padding: '32px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E879F9', marginBottom: 12 }}>
              03 — Contenido mensual
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Content Factory
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 20, lineHeight: 1.5 }}>
              Posts, reels y stories generados con IA para tus redes sociales. Desde $80.000/mes.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Starter', precio: '$80.000/mes' },
                { label: 'Crecimiento', precio: '$120.000/mes' },
                { label: 'Gestión total', precio: '$150.000/mes' },
              ].map(t => (
                <div key={t.label} style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{t.precio}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 20, padding: '32px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: 'var(--paper)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 12 }}>
                ¿No sabés cuál producto necesitás?
              </div>
              <p style={{ fontSize: 14, color: 'rgba(246,245,242,0.5)', fontFamily: 'var(--f-display)', lineHeight: 1.55 }}>
                La auditoría gratis analiza tu negocio y te dice exactamente qué hace falta y cuánto te cuesta no tenerlo.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
              <Link href="/auditoria" style={{
                display: 'block', textAlign: 'center', padding: '12px 20px', borderRadius: 10,
                background: 'var(--lime)', color: 'var(--ink)',
                textDecoration: 'none', fontFamily: 'var(--f-mono)', fontWeight: 700,
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Auditoría gratis →
              </Link>
              <Link href="/precios" style={{
                display: 'block', textAlign: 'center', padding: '12px 20px', borderRadius: 10,
                border: '1px solid rgba(246,245,242,0.15)', color: 'rgba(246,245,242,0.6)',
                textDecoration: 'none', fontFamily: 'var(--f-mono)',
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Ver todos los precios →
              </Link>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 20, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>
          Todos los precios en ARS · Pagos por MercadoPago · 50% al confirmar — 50% al entregar
        </p>

      </div>
    </section>
  )
}
