import Reveal from './Reveal'
import Orb from './Orb'

const WA = 'https://wa.me/5492665286110?text=Hola%20DIVINIA%2C%20quiero%20activar%20mi%20Turnero'

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
        size={200}
        color="#818CF8"
        colorDeep="#4338CA"
        shade="rgba(20,10,80,0.5)"
        float
        style={{ position: 'absolute', left: -50, bottom: -50, opacity: 0.25 }}
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
              Un mensaje por WhatsApp es todo lo que necesitás para empezar.
              En 15 minutos sabés si el Turnero es para tu negocio.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 40,
            }}>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Activar mi Turnero →
              </a>
              <a
                href="#demo"
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
                Ver demo primero ↑
              </a>
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
                '🛡️ Garantía 90 días',
                '⚡ Listo en 24hs',
                '💳 50% al confirmar',
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
