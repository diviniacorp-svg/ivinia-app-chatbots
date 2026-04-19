'use client'
import Orb from './Orb'

const rows = [
  { before: 'Clientes preguntan fuera de horario y nadie responde', after: 'El sistema responde al instante, 24/7, los 365 días' },
  { before: 'Tu equipo pierde horas respondiendo lo mismo cada día', after: 'Las preguntas frecuentes se resuelven solas, sin intervención' },
  { before: 'Para sacar turno hay que llamar, esperar, y volver a intentar', after: 'El cliente reserva en segundos desde el celular, cuando quiere' },
  { before: 'La competencia que responde más rápido se lleva la venta', after: 'Respondés primero, cerrás más ventas automáticamente' },
  { before: 'No podés crecer sin contratar más personal', after: 'Escalás el negocio sin sumar costos fijos' },
]

export default function ProblemV2() {
  return (
    <section id="problema" style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}>
      <div className="wrap-v2">

        <div style={{ display: 'grid', gap: 48, alignItems: 'start' }}
          className="grid-cols-2-mobile-1 md:grid-cols-2">

          {/* Left — sticky header (desktop only) */}
          <div className="problem-sticky">
            <div className="eyebrow" style={{ marginBottom: 24 }}>El problema real</div>
            <h2 className="h-display" style={{ fontSize: 'clamp(48px, 6vw, 96px)', marginBottom: 28, color: 'var(--ink)' }}>
              Sin IA,<br />
              <em>perdés tiempo<br />y clientes.</em>
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '38ch', marginBottom: 40 }}>
              No es opinión. Es lo que le pasa a la mayoría de los negocios en Argentina hoy.
            </p>
            <div style={{ position: 'relative', width: 220, height: 220 }}>
              <Orb size={200} color="#C6FF3D" colorDeep="#8AAA1A" shade="rgba(0,30,0,0.5)" float squash />
              <Orb size={80} color="#FF5E3A" colorDeep="#CC3A1A" shade="rgba(60,10,0,0.4)" float delay="-1.5s"
                style={{ position: 'absolute', right: -10, bottom: 10 }} />
            </div>
          </div>

          {/* Right — table */}
          <div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 4, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              <div style={{ flex: 1, padding: '8px 16px' }}>Sin automatización</div>
              <div style={{ flex: 1, padding: '8px 16px', color: 'var(--lime)' }}>Con DIVINIA</div>
            </div>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gap: 2, marginBottom: 2,
              }} className="grid-cols-2-mobile-1 md:grid-cols-2">
                <div style={{
                  padding: '20px 20px', background: 'rgba(14,14,14,0.04)',
                  borderRadius: i === 0 ? '12px 0 0 0' : i === rows.length - 1 ? '0 0 0 12px' : 0,
                  border: '1px solid var(--line)', fontFamily: 'var(--f-display)', fontSize: 14, lineHeight: 1.5,
                  color: 'var(--muted-2)', position: 'relative',
                }}>
                  <span style={{ display: 'inline-block', width: 14, height: 14, background: '#FF5E3A', borderRadius: '50%', marginRight: 10, verticalAlign: 'middle', flexShrink: 0 }} />
                  {row.before}
                </div>
                <div style={{
                  padding: '20px 20px', background: 'rgba(198,255,61,0.06)',
                  borderRadius: i === 0 ? '0 12px 0 0' : i === rows.length - 1 ? '0 0 12px 0' : 0,
                  border: '1px solid rgba(198,255,61,0.2)', fontFamily: 'var(--f-display)', fontSize: 14, lineHeight: 1.5,
                  color: 'var(--ink)',
                }}>
                  <span style={{ display: 'inline-block', width: 14, height: 14, background: 'var(--lime)', borderRadius: '50%', marginRight: 10, verticalAlign: 'middle', flexShrink: 0 }} />
                  {row.after}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
