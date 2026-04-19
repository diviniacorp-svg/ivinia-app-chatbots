import Orb from './Orb'

export default function CasesV2() {
  return (
    <section id="casos" style={{ padding: '140px 0', background: 'var(--paper)' }}>
      <div className="wrap-v2">
        {/* Header */}
        <div style={{ display: 'grid', gap: 40, marginBottom: 64 }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Casos — 04/04</div>
            <h2 className="h-title">Lo que ya <em>operamos</em>.</h2>
          </div>
          <p style={{ alignSelf: 'end', fontSize: 20, lineHeight: 1.45, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '56ch' }}>
            PYMEs reales de San Luis y LATAM. Con nombre, números y permiso para publicar.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gap: 24 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">

          {/* Card 1 — hero */}
          <article style={{
            background: 'var(--paper-2)', borderRadius: 28, padding: 40,
            minHeight: 500, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <Orb
              size={200}
              color="#FF5E3A" colorDeep="#CC3A1A" shade="rgba(80,10,0,0.4)"
              float
              style={{ position: 'absolute', top: -40, right: -40 }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span className="tag-v2"><span className="tag-dot" />{' '}Barbería · San Luis</span>
              <h3 className="h-title" style={{ marginTop: 24, fontSize: 44 }}>
                Don Pepe<br />recuperó <em>4 h/día.</em>
              </h3>
            </div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { val: '+48%', label: 'Turnos confirmados' },
                  { val: '4h', label: 'Devueltas / día' },
                  { val: '38d', label: 'De 0 a producción' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="h-title" style={{ fontSize: 36 }}>{m.val}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', marginTop: 6 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <a href="#demo" className="btn-v2 btn-ghost-v2" style={{ fontSize: 14 }}>Hablá con nosotros →</a>
            </div>
          </article>

          {/* Card 2 — dark */}
          <article style={{
            background: 'var(--ink)', color: 'var(--paper)', borderRadius: 28, padding: 40,
            minHeight: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <span className="tag-v2" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--paper)' }}>
                <span className="tag-dot" style={{ background: '#2FC998' }} />{' '}Veterinaria · Mendoza
              </span>
              <h3 className="h-title" style={{ marginTop: 24, fontSize: 32, color: 'var(--paper)' }}>
                Vet Central automatizó el <em>seguimiento post-cirugía</em>.
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Orb size={60} color="#2FC998" colorDeep="#1E8D66" shade="rgba(0,60,40,0.5)" />
              <div>
                <div className="h-section" style={{ color: 'var(--paper)' }}>210 check-ins auto / semana</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(246,245,242,0.6)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Reemplazando 1 FTE parcial
                </div>
              </div>
            </div>
          </article>

          {/* Card 3 */}
          <article style={{
            background: 'var(--paper-2)', borderRadius: 28, padding: 40,
            minHeight: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <span className="tag-v2"><span className="tag-dot" style={{ background: '#7B61FF' }} />{' '}Estudio contable · CABA</span>
              <h3 className="h-title" style={{ marginTop: 24, fontSize: 32 }}>
                Estudio 21 procesa <em>facturas</em> sin tocarlas.
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Orb size={60} color="#7B61FF" colorDeep="#4A35CC" shade="rgba(30,10,90,0.5)" />
              <div>
                <div className="h-section">1.800 facturas / mes</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted-2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Con validación humana al 3%
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
