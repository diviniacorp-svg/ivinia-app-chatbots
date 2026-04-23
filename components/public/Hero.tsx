import Orb from './Orb'

const WA = 'https://wa.me/5492665286110'

export default function Hero() {
  return (
    <section style={{ padding: '160px 0 80px', position: 'relative', overflow: 'hidden', background: 'var(--paper)' }}>
      <div className="wrap-v2">
        <div style={{ display: 'grid', gap: 60, alignItems: 'center' }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1.6fr_1fr]">

          {/* Left: copy */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 32 }}>
              <span>Turnero IA · San Luis, AR</span>
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>/ 15 rubros disponibles</span>
            </div>

            <h1 className="h-display" style={{ fontSize: 'clamp(48px, 8vw, 130px)', marginBottom: 36, color: 'var(--ink)', lineHeight: 1.0 }}>
              Tu negocio<br />
              atiende solo<br />
              <em>mientras dormís.</em>
            </h1>

            <p style={{ fontSize: 20, lineHeight: 1.5, color: 'var(--muted-2)', marginBottom: 16, maxWidth: '44ch', fontFamily: 'var(--f-display)' }}>
              Perdés turnos porque no atendés el teléfono. Perdés clientes porque no contestás el WhatsApp a las 11 de la noche.
            </p>
            <p style={{ fontSize: 20, lineHeight: 1.5, color: 'var(--ink)', marginBottom: 40, maxWidth: '44ch', fontFamily: 'var(--f-display)', fontWeight: 600 }}>
              Turnero lo resuelve. Desde <strong>$45.000/mes.</strong>
            </p>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="/rubros" className="btn-v2 btn-ink" style={{ fontSize: 16, padding: '15px 22px 15px 26px' }}>
                Ver demo de tu rubro
                <span className="btn-arrow">→</span>
              </a>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ghost-v2" style={{ fontSize: 16 }}>
                Hablar por WhatsApp
              </a>
            </div>

            {/* Proof strip */}
            <div style={{ marginTop: 48, display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { n: '15', label: 'rubros cubiertos' },
                { n: '48hs', label: 'setup completo' },
                { n: '$45k', label: 'desde por mes' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero orb */}
          <div style={{ position: 'relative', height: 520 }} className="hidden md:block">
            <Orb
              size={460}
              color="#C6FF3D"
              colorDeep="#9EE028"
              shade="rgba(12,80,0,0.5)"
              float
              squash
              style={{ position: 'absolute', right: -40, bottom: 0 }}
            />
          </div>
        </div>

        {/* Clientes reales strip */}
        <div style={{
          marginTop: 80, paddingTop: 28,
          borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Negocios que ya usan Turnero
          </span>
          <div style={{
            display: 'flex', gap: 40, flexWrap: 'wrap',
            fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 17,
            color: 'var(--muted-2)', letterSpacing: '-0.02em',
          }}>
            {['Rufina Nails', 'Cantera Hotel', 'Los Paraísos', 'Potrero de los Funes', 'FA Estudio'].map(n => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
