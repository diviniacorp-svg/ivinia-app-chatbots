import Link from 'next/link'
import Orb from './Orb'

const WA = 'https://wa.me/5492665286110'

const plans = [
  {
    name: 'Básico',
    price: '$80.000',
    billing: 'pago único',
    desc: 'Para arrancar',
    features: ['Página de reservas personalizada', 'Hasta 3 servicios', 'Confirmación por WhatsApp', 'Panel de gestión', 'Recordatorios automáticos', '3 meses de soporte'],
    href: `${WA}?text=Hola%2C%20quiero%20el%20Plan%20Básico%20de%20Turnero`,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$150.000',
    billing: 'pago único',
    desc: 'El más elegido',
    features: ['Todo lo del Básico', 'Servicios ilimitados', 'Múltiples profesionales', 'Bloqueo de horarios', 'Estadísticas avanzadas', 'Google Calendar integrado', '6 meses de soporte'],
    href: `${WA}?text=Hola%2C%20quiero%20el%20Plan%20Pro%20de%20Turnero`,
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$200.000',
    billing: 'pago único',
    desc: 'Multi-sucursal',
    features: ['Todo lo del Pro', 'Múltiples sucursales', 'Cobro de seña al reservar', 'Chatbot integrado 24/7', 'CRM con IA', 'Capacitación del equipo', '12 meses de soporte'],
    href: `${WA}?text=Hola%2C%20quiero%20el%20Plan%20Enterprise`,
    highlight: false,
  },
]

const maintenance = [
  { name: 'Básico', price: '$30.000/mes', features: ['1 ajuste/mes', 'Monitoreo mensual', 'Respuesta en 48hs'] },
  { name: 'Pro', price: '$60.000/mes', features: ['Ajustes ilimitados', 'Monitoreo semanal', 'Respuesta en 24hs'] },
  { name: 'Total', price: '$100.000/mes', features: ['Todo lo del Pro', 'Nuevas funciones/mes', 'Respuesta en 4hs'] },
]

export default function PricingV2() {
  return (
    <section id="precios" style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}>
      <div className="wrap-v2">

        <div style={{ marginBottom: 64 }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Precios Turnero</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(44px, 5.5vw, 88px)', color: 'var(--ink)', marginBottom: 24 }}>
            Desde $43k/mes.<br />
            <em>O $80k único.</em>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '48ch' }}>
            Sin permanencia. Setup incluido. Cancelás cuando querés.
          </p>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gap: 12, marginBottom: 80 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">
          {plans.map((p, i) => (
            <div key={p.name} style={{
              padding: '40px 32px',
              background: p.highlight ? 'var(--ink)' : 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              display: 'flex', flexDirection: 'column',
            }}>
              {p.highlight && (
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 20 }}>
                  ★ Más elegido
                </div>
              )}
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.highlight ? 'rgba(255,255,255,0.4)' : 'var(--muted)', marginBottom: 12 }}>
                {p.name} · {p.desc}
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 700, color: p.highlight ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                {p.price}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: p.highlight ? 'rgba(255,255,255,0.3)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 32 }}>
                {p.billing}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, flex: 1 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, fontFamily: 'var(--f-display)', color: p.highlight ? 'rgba(255,255,255,0.7)' : 'var(--muted-2)', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--lime)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={p.href} style={{
                display: 'block', textAlign: 'center',
                padding: '14px 24px', borderRadius: 10,
                fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
                textDecoration: 'none',
                background: p.highlight ? 'var(--lime)' : 'transparent',
                color: p.highlight ? 'var(--ink)' : 'var(--ink)',
                border: p.highlight ? 'none' : '1px solid var(--ink)',
                fontWeight: 700,
              }}>
                Contratar →
              </a>
            </div>
          ))}
        </div>

        {/* Maintenance */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 24 }}>
            Planes de mantenimiento mensual
          </div>
          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-3-mobile-1 md:grid-cols-3">
            {maintenance.map((m) => (
              <div key={m.name} style={{
                padding: '28px 28px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>{m.name}</span>
                  <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>{m.price}</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {m.features.map(f => (
                    <li key={f} style={{ fontSize: 13, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--lime)' }}>·</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20, fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em' }}>
            Todos los precios en ARS · Pagos por MercadoPago · Sin permanencia mínima
          </p>
        </div>

      </div>
    </section>
  )
}
