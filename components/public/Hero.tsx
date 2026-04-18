import Orb from './Orb'

export default function Hero() {
  return (
    <section style={{ padding: '160px 0 80px', position: 'relative', overflow: 'hidden', background: 'var(--paper)' }}>
      <div className="wrap-v2">
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 60, alignItems: 'end' }}
          className="grid-cols-1 md:grid-cols-[1.6fr_1fr]">

          {/* Left: copy */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 32 }}>
              <span>Agencia de automatización · San Luis, AR</span>
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>/ est. 2024</span>
            </div>

            <h1 className="h-display" style={{ fontSize: 'clamp(56px, 10vw, 160px)', marginBottom: 36, color: 'var(--ink)' }}>
              Operaciones<br />
              automatizadas<br />
              <em>con criterio.</em>
            </h1>

            <p style={{ fontSize: 20, lineHeight: 1.45, color: 'var(--muted-2)', marginBottom: 40, maxWidth: '42ch', fontFamily: 'var(--f-display)' }}>
              Automatizamos lo que te hace perder tiempo y plata con inteligencia artificial.
              En <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>90 días</strong>, o no te cobramos un peso.
            </p>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#demo" className="btn-v2 btn-ink" style={{ fontSize: 16, padding: '15px 22px 15px 26px' }}>
                Diagnóstico gratis
                <span className="btn-arrow">→</span>
              </a>
              <a href="#casos" className="btn-v2 btn-ghost-v2" style={{ fontSize: 16 }}>Ver casos</a>
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
            {/* orbit label */}
            <div style={{
              position: 'absolute', right: 420, top: 80,
              fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase',
              letterSpacing: '0.14em', color: 'var(--muted-2)', lineHeight: 1.6,
            }}>
              ◦ objeto.hero.lime<br />
              <span style={{ color: 'var(--muted)' }}>↳ representa la marca</span>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{
          marginTop: 96, paddingTop: 28,
          borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 40, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Confían en nosotros
          </span>
          <div style={{
            display: 'flex', gap: 48, flexWrap: 'wrap',
            fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 18,
            color: 'var(--muted-2)', letterSpacing: '-0.02em',
          }}>
            {['Don Pepe', 'Molino S.L.', 'Estudio 21', 'Vet Central', 'Rebel Co.'].map(n => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
