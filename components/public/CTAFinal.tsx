import Link from 'next/link'
import Reveal from './Reveal'
import Orb from './Orb'

export default function CTAFinal() {
  return (
    <section style={{
      padding: '100px 0',
      background: 'var(--ink)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Orbs de fondo */}
      <Orb
        size={500}
        color="#C6FF3D"
        colorDeep="#8AAA1A"
        shade="rgba(0,30,0,0.6)"
        float
        squash
        style={{ position: 'absolute', right: -100, top: -100, opacity: 0.35 }}
      />
      <Orb
        size={280}
        color="#8B5CF6"
        colorDeep="#6D28D9"
        shade="rgba(40,0,80,0.5)"
        float
        style={{ position: 'absolute', left: -80, bottom: -80, opacity: 0.3 }}
      />
      <Orb
        size={160}
        color="#FF6B2B"
        colorDeep="#E8440A"
        shade="rgba(80,20,0,0.4)"
        float
        style={{ position: 'absolute', left: '42%', bottom: -50, opacity: 0.22 }}
        delay="1s"
      />

      <div className="wrap-v2" style={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>

            {/* Urgencia real */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,94,58,0.12)',
              border: '1px solid rgba(255,94,58,0.25)',
              borderRadius: 100,
              padding: '6px 16px',
              marginBottom: 32,
            }}>
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#FF5E3A',
              }}>
                Joaco configura personalmente — máx. 3 clientes nuevos por semana
              </span>
            </div>

            <h2 style={{
              fontFamily: 'var(--f-display)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 'clamp(40px, 7vw, 96px)',
              color: 'var(--paper)',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              marginBottom: 24,
            }}>
              Tu negocio puede<br />
              <span style={{ color: 'var(--lime)' }}>funcionar solo</span><br />
              desde mañana.
            </h2>

            <p style={{
              fontFamily: 'var(--f-display)',
              fontSize: 18,
              color: 'rgba(246,245,242,0.5)',
              lineHeight: 1.55,
              maxWidth: '44ch',
              margin: '0 auto 40px',
            }}>
              14 días gratis, sin tarjeta. Lo configuramos con tus servicios y horarios.
              Si no te convence, no pagás nada.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 40,
            }}>
              <Link
                href="/onboarding"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--lime)',
                  color: 'var(--ink)',
                  borderRadius: 12,
                  padding: '16px 28px',
                  fontFamily: 'var(--f-mono)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(198,255,61,0.3)',
                }}
              >
                Empezar prueba 14 días gratis →
              </Link>
              <Link
                href="/reservas/rufina-nails-demo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid rgba(246,245,242,0.2)',
                  color: 'rgba(246,245,242,0.6)',
                  borderRadius: 12,
                  padding: '16px 24px',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Ver demo en vivo primero ↗
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{
              display: 'flex',
              gap: 28,
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(246,245,242,0.25)',
            }}>
              {[
                '⚡ Listo en 24hs',
                '💳 50% al confirmar',
                '🤝 Sin contratos de permanencia',
                '📍 San Luis, Argentina',
              ].map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
