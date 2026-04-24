import Reveal from './Reveal'
import Link from 'next/link'
import Orb from './Orb'

const CASOS = [
  {
    id: 'rufina-nails-demo',
    nombre: 'Rufina Nails',
    rubro: 'Nail bar',
    ciudad: 'San Luis Capital',
    descripcion: 'Nail bar de San Luis. Antes coordinaba todos los turnos por WhatsApp manual. Ahora sus clientas reservan solas con cobro de seña incluido.',
    resultado: 'Cero no-shows desde la activación',
    orbColor: '#d63384',
    orbDeep: '#a0205c',
    orbShade: 'rgba(80,10,40,0.45)',
    emoji: '💅',
    href: '/reservas/rufina-nails-demo',
  },
  {
    id: 'cantera2026bot',
    nombre: 'Cantera Boutique',
    rubro: 'Hotel boutique',
    ciudad: 'San Luis',
    descripcion: 'Hotel boutique que ahora recibe reservas directas sin pagar comisión a Booking. Sistema propio, clientes propios.',
    resultado: 'Reservas directas sin intermediarios',
    orbColor: '#92400E',
    orbDeep: '#6b2d07',
    orbShade: 'rgba(60,20,0,0.5)',
    emoji: '🏨',
    href: '/reservas/cantera2026bot',
  },
  {
    id: 'paraisos2026bt',
    nombre: 'Los Paraísos',
    rubro: 'Cabañas',
    ciudad: 'San Luis',
    descripcion: 'Complejo de cabañas turísticas. Calendario de disponibilidad en tiempo real, pagos de seña automatizados.',
    resultado: 'Sistema activo 365 días sin intervención',
    orbColor: '#065F46',
    orbDeep: '#044232',
    orbShade: 'rgba(0,40,20,0.5)',
    emoji: '🌿',
    href: '/reservas/paraisos2026bt',
  },
]

export default function PruebaSocial() {
  return (
    <section id="casos" style={{
      padding: '100px 0',
      background: 'var(--paper-2)',
      borderTop: '1px solid var(--line)',
    }}>
      <div className="wrap-v2">

        <Reveal>
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Ya lo usan — 04/05</div>
              <h2 className="h-title">
                Negocios reales,<br />
                <em>funcionando.</em>
              </h2>
            </div>
            <p style={{
              alignSelf: 'end',
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--muted-2)',
              fontFamily: 'var(--f-display)',
              maxWidth: '50ch',
            }}>
              Sin métricas inventadas. Estos son negocios reales de San Luis con su turnero activo.
              Podés entrar a cada demo y probarlo vos mismo.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gap: 16 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">
          {CASOS.map((c, i) => (
            <Reveal key={c.id} delay={i * 100}>
              <article style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Visual header */}
                <div style={{
                  padding: '32px',
                  background: 'var(--paper-2)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: 140,
                  display: 'flex',
                  alignItems: 'flex-end',
                }}>
                  <Orb
                    size={160}
                    color={c.orbColor}
                    colorDeep={c.orbDeep}
                    shade={c.orbShade}
                    float
                    style={{ position: 'absolute', right: -30, top: -30 }}
                  />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: 28 }}>{c.emoji}</span>
                  </div>
                  {/* Live badge */}
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(14,14,14,0.7)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 100,
                    padding: '4px 12px',
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#4ADE80',
                      display: 'inline-block',
                      animation: 'pulse 2s infinite',
                    }} />
                    <span style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#4ADE80',
                    }}>
                      En vivo
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      marginBottom: 6,
                    }}>
                      {c.rubro} · {c.ciudad}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--f-display)',
                      fontWeight: 700,
                      fontSize: 20,
                      color: 'var(--ink)',
                      letterSpacing: '-0.02em',
                    }}>
                      {c.nombre}
                    </h3>
                  </div>

                  <p style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 13,
                    color: 'var(--muted-2)',
                    lineHeight: 1.6,
                    flex: 1,
                  }}>
                    {c.descripcion}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(74,222,128,0.08)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}>
                    <span style={{ fontSize: 12 }}>✓</span>
                    <span style={{
                      fontFamily: 'var(--f-display)',
                      fontSize: 12,
                      color: 'var(--ink)',
                      fontWeight: 500,
                    }}>
                      {c.resultado}
                    </span>
                  </div>

                  <Link
                    href={c.href}
                    target="_blank"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      transition: 'background 0.2s',
                    }}
                  >
                    Probá la demo →
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  )
}
