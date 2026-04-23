import Link from 'next/link'
import { TURNERO_PLANS, formatPrecio } from '@/lib/turnero-plans'

const WA = 'https://wa.me/5492665286110'

export default function PricingV2() {
  return (
    <section id="precios" style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}>
      <div className="wrap-v2">

        <div style={{ marginBottom: 64 }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Precios Turnero</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(40px, 5vw, 80px)', color: 'var(--ink)', marginBottom: 24 }}>
            Desde {formatPrecio(TURNERO_PLANS[0].precio)}/mes.<br />
            <em>O {formatPrecio(TURNERO_PLANS[2].precio)} único.</em>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '48ch' }}>
            Sin permanencia. Setup incluido. Cancelás cuando querés.
          </p>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gap: 12, marginBottom: 80 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">
          {TURNERO_PLANS.slice(0, 3).map((p) => (
            <div key={p.id} style={{
              padding: '40px 32px',
              background: p.popular ? 'var(--ink)' : 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              display: 'flex', flexDirection: 'column',
            }}>
              {p.popular && (
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 20 }}>
                  ★ Más elegido
                </div>
              )}
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.popular ? 'rgba(255,255,255,0.4)' : 'var(--muted)', marginBottom: 12 }}>
                {p.nombre} · {p.descripcion}
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 700, color: p.popular ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                {formatPrecio(p.precio)}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: p.popular ? 'rgba(255,255,255,0.3)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 32 }}>
                {p.billing}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ color: p.popular ? 'var(--lime)' : 'var(--ink)', fontSize: 14, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 14, color: p.popular ? 'rgba(255,255,255,0.7)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`${WA}?text=Quiero%20el%20plan%20${encodeURIComponent(p.nombre)}%20de%20Turnero`}
                target="_blank" rel="noopener noreferrer"
                className={`btn-v2 ${p.popular ? 'btn-ink' : 'btn-ghost-v2'}`}
                style={p.popular ? { background: 'var(--lime)', color: 'var(--ink)', fontWeight: 700 } : {}}
              >
                Empezar con {p.nombre} →
              </a>
            </div>
          ))}
        </div>

        {/* Todo DIVINIA combo */}
        <div style={{
          background: 'var(--ink)', borderRadius: 20, padding: '48px 40px',
          display: 'grid', gap: 40, alignItems: 'center',
        }} className="grid-cols-2-mobile-1 md:grid-cols-[1fr_auto]">
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--lime)', marginBottom: 16 }}>
              ★ COMBO — TODO DIVINIA
            </div>
            <h3 className="h-title" style={{ color: 'var(--paper)', fontSize: 36, marginBottom: 16 }}>
              Turnero + Chatbot WA + Contenido IA
            </h3>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--f-display)', margin: 0 }}>
              El negocio completamente automatizado. Reservas, atención y redes en piloto automático.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 52, fontWeight: 700, color: 'var(--lime)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {formatPrecio(120000)}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>
              /mes · todo incluido
            </div>
            <a
              href={`${WA}?text=Quiero%20Todo%20DIVINIA`}
              target="_blank" rel="noopener noreferrer"
              className="btn-v2 btn-ink"
              style={{ background: 'var(--lime)', color: 'var(--ink)', fontWeight: 700, fontSize: 16 }}
            >
              Quiero esto →
            </a>
          </div>
        </div>

        {/* Mantenimiento */}
        <div style={{ marginTop: 48, paddingTop: 48, borderTop: '1px solid var(--line)' }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Mantenimiento (para pago único)</div>
          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-3-mobile-1 md:grid-cols-2">
            {[
              { nombre: 'Básico', precio: '$40.000/mes', features: ['1 ajuste/mes', 'Monitoreo mensual', 'Respuesta en 48hs'] },
              { nombre: 'Pro', precio: '$70.000/mes', features: ['Ajustes ilimitados', 'Monitoreo semanal', 'Respuesta en 24hs'] },
            ].map(m => (
              <div key={m.nombre} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>{m.nombre}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em' }}>{m.precio}</div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {m.features.map(f => (
                    <li key={f} style={{ fontSize: 13, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginBottom: 4 }}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
