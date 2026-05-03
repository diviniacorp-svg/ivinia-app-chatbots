import Reveal from './Reveal'
import Link from 'next/link'
import { TURNERO_PLANS, formatPrecio } from '@/lib/turnero-plans'

const WA_BASE = 'https://wa.me/5492665286110?text='

export default function PricingV3() {
  return (
    <section id="precios" style={{
      padding: '100px 0',
      background: 'var(--paper)',
      borderTop: '1px solid var(--line)',
    }}>
      <div className="wrap-v2">

        <Reveal>
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Precios — sin sorpresas</div>
              <h2 className="h-title">
                Elegí el plan<br />
                <em>que te cierra.</em>
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
              Sin contratos de permanencia, sin cargos ocultos.
              50% al confirmar, 50% cuando te entregamos el sistema funcionando.
            </p>
          </div>
        </Reveal>

        {/* Cards de planes */}
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">
          {TURNERO_PLANS.filter(p => p.id !== 'enterprise').map((plan, i) => (
            <Reveal key={plan.id} delay={i * 80}>
              <div style={{
                background: plan.popular ? 'var(--ink)' : 'var(--paper-2)',
                border: `1px solid ${plan.popular ? plan.color : 'var(--line)'}`,
                borderRadius: 20,
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                height: '100%',
                position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: plan.color,
                    color: 'var(--ink)',
                    borderRadius: 100,
                    padding: '4px 16px',
                    fontFamily: 'var(--f-mono)',
                    fontWeight: 700,
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    Más elegido ✓
                  </div>
                )}

                <div>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 700,
                    fontSize: 20,
                    color: plan.popular ? 'var(--paper)' : 'var(--ink)',
                    letterSpacing: '-0.02em',
                    marginBottom: 4,
                  }}>
                    {plan.nombre}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 13,
                    color: plan.popular ? 'rgba(246,245,242,0.45)' : 'var(--muted-2)',
                  }}>
                    {plan.descripcion}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: 'clamp(32px, 3.5vw, 44px)',
                    color: plan.popular ? plan.color : 'var(--ink)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}>
                    {formatPrecio(plan.precio)}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    color: plan.popular ? 'rgba(246,245,242,0.3)' : 'var(--muted)',
                    letterSpacing: '0.06em',
                    marginTop: 2,
                  }}>
                    {plan.billing}
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontFamily: 'var(--f-display)',
                      fontSize: 13,
                      color: plan.popular ? 'rgba(246,245,242,0.6)' : 'var(--muted-2)',
                      lineHeight: 1.4,
                    }}>
                      <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/onboarding"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '13px 20px',
                    borderRadius: 10,
                    background: plan.popular ? plan.color : 'transparent',
                    color: plan.popular ? 'var(--ink)' : 'var(--ink)',
                    border: plan.popular ? 'none' : '1px solid var(--line)',
                    textDecoration: 'none',
                    fontFamily: 'var(--f-mono)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Elegir este plan →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Card NUCLEUS + ayuda */}
        <Reveal delay={200}>
          <div style={{ display: 'grid', gap: 12 }}
            className="grid-cols-2-mobile-1 md:grid-cols-[2fr_1fr]">

            {/* NUCLEUS IA */}
            <div style={{
              background: 'var(--paper-2)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: '32px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A78BFA', marginBottom: 4 }}>
                    Sistema completo a medida
                  </div>
                  <h3 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                    🧠 NUCLEUS IA
                  </h3>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: '#A78BFA', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    Precio a medida
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>
                    setup único + mantenimiento
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', marginBottom: 16, lineHeight: 1.55 }}>
                Panel público para tus clientes + panel privado de gestión + agentes IA + integraciones a medida. Para negocios que necesitan más que un turno.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                {['Chatbot IA en tu web y WA', 'Panel de reservas + agenda', 'Agentes IA personalizados', 'Integraciones a medida', 'Soporte dedicado'].map(f => (
                  <span key={f} style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#A78BFA' }}>✓</span>{' ' + f}
                  </span>
                ))}
              </div>
              <a href={`${WA_BASE}Hola%20DIVINIA!%20Quiero%20saber%20m%C3%A1s%20sobre%20NUCLEUS%20IA`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#A78BFA', color: '#fff', borderRadius: 10, padding: '11px 22px', fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Consultar NUCLEUS →
              </a>
            </div>

            {/* ¿No sabés cuál? */}
            <div style={{
              background: 'var(--ink)',
              borderRadius: 20,
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'var(--paper)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: 12,
                }}>
                  ¿No sabés por cuál empezar?
                </div>
                <p style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  color: 'rgba(246,245,242,0.45)',
                  lineHeight: 1.6,
                }}>
                  Escribime y en 5 minutos te digo cuál producto tiene más impacto para tu negocio.
                  Sin presión, sin venta forzada.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                <a
                  href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20no%20s%C3%A9%20cu%C3%A1l%20producto%20me%20conviene"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 20px',
                    borderRadius: 10,
                    background: 'var(--lime)',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontFamily: 'var(--f-mono)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Consultá gratis →
                </a>
                <Link
                  href="/auditoria"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: '1px solid rgba(246,245,242,0.12)',
                    color: 'rgba(246,245,242,0.5)',
                    textDecoration: 'none',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Auditoría gratis →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <p style={{
          marginTop: 20,
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          letterSpacing: '0.06em',
        }}>
          Todos los precios en ARS · Pagos por MercadoPago · 50% al confirmar — 50% al entregar · Sin contratos de permanencia
        </p>
      </div>
    </section>
  )
}
