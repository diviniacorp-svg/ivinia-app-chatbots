import Orb from './Orb'
import Link from 'next/link'

const WA = 'https://wa.me/5492665286110'

export default function CasesV2() {
  return (
    <section id="casos" style={{ padding: '140px 0', background: 'var(--paper)' }}>
      <div className="wrap-v2">
        {/* Header */}
        <div style={{ display: 'grid', gap: 40, marginBottom: 64 }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Casos reales — 04/04</div>
            <h2 className="h-title">Negocios que ya <em>funcionan solos</em>.</h2>
          </div>
          <p style={{ alignSelf: 'end', fontSize: 20, lineHeight: 1.45, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '56ch' }}>
            Rubros distintos, mismo resultado: el negocio funciona aunque el dueño no esté mirando el teléfono.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gap: 24 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">

          {/* Card 1 — Rufina Nails (cliente real) */}
          <article style={{
            background: 'var(--paper-2)', borderRadius: 28, padding: 40,
            minHeight: 500, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <Orb
              size={200}
              color="#d63384" colorDeep="#a21057" shade="rgba(80,0,40,0.4)"
              float
              style={{ position: 'absolute', top: -40, right: -40 }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span className="tag-v2"><span className="tag-dot" style={{ background: '#d63384' }} />{' '}Nail Bar · San Luis Capital</span>
              <h3 className="h-title" style={{ marginTop: 24, fontSize: 40 }}>
                Rufina Nails<br />llena agenda <em>sin llamar.</em>
              </h3>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginTop: 16, lineHeight: 1.5 }}>
                Antes anotaba turnos en papel y perdía clientes que llamaban cuando estaba trabajando.
                Ahora el Turnero recibe las reservas solas, cobra la seña y ella solo mira el panel.
              </p>
            </div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { val: '100%', label: 'Digital' },
                  { val: '0', label: 'Llamadas perdidas' },
                  { val: '48hs', label: 'Setup' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="h-title" style={{ fontSize: 32 }}>{m.val}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', marginTop: 6 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/reservas/rufina-nails-demo" className="btn-v2 btn-ghost-v2" style={{ fontSize: 14 }}>
                Ver su Turnero en vivo →
              </Link>
            </div>
          </article>

          {/* Card 2 — Hotel (dark) */}
          <article style={{
            background: 'var(--ink)', color: 'var(--paper)', borderRadius: 28, padding: 40,
            minHeight: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <span className="tag-v2" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--paper)' }}>
                <span className="tag-dot" style={{ background: '#0f766e' }} />{' '}Hotelería · San Luis
              </span>
              <h3 className="h-title" style={{ marginTop: 24, fontSize: 32, color: 'var(--paper)' }}>
                Cantera Hotel acepta reservas <em>a las 3am</em>.
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--f-display)', marginTop: 16, lineHeight: 1.5 }}>
                Los turistas planifican de noche. Con Turnero, cada consulta tiene respuesta y cada reserva queda confirmada, sin importar la hora.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Orb size={60} color="#0f766e" colorDeep="#0d5c58" shade="rgba(0,60,50,0.5)" />
              <div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 600, color: 'var(--paper)' }}>Reservas 24/7</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Sin recepcionista extra
                </div>
              </div>
            </div>
          </article>

          {/* Card 3 — Profesionales */}
          <article style={{
            background: 'var(--paper-2)', borderRadius: 28, padding: 40,
            minHeight: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <span className="tag-v2"><span className="tag-dot" style={{ background: '#7c3aed' }} />{' '}Contabilidad · San Luis</span>
              <h3 className="h-title" style={{ marginTop: 24, fontSize: 32 }}>
                FA Estudio agenda <em>sin secretaria</em>.
              </h3>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginTop: 16, lineHeight: 1.5 }}>
                Estudio contable con múltiples profesionales. Cada cliente elige horario, tipo de consulta y profesional. El pago de la seña va solo por MercadoPago.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Orb size={60} color="#7c3aed" colorDeep="#5b21b6" shade="rgba(30,10,90,0.5)" />
              <div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>3 profesionales, 1 panel</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted-2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Gestión centralizada
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* CTA banner */}
        <div style={{
          marginTop: 32, background: 'var(--ink)', borderRadius: 20, padding: '36px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lime)', marginBottom: 10 }}>
              Tu rubro está cubierto
            </div>
            <p style={{ fontSize: 20, color: 'var(--paper)', fontFamily: 'var(--f-display)', margin: 0, maxWidth: '50ch' }}>
              Mirá cómo quedaría el Turnero para tu negocio — en vivo, sin registrarte.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/rubros" className="btn-v2 btn-ink" style={{ background: 'var(--lime)', color: 'var(--ink)', fontSize: 15, padding: '13px 24px', fontWeight: 700 }}>
              Ver demo de mi rubro →
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ghost-v2" style={{ color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.2)', fontSize: 15 }}>
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
