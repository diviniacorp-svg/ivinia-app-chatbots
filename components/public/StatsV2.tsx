import Orb from './Orb'

const stats = [
  { n: '15', label: 'Rubros disponibles', sub: 'Peluquería, nails, clínica, hotel, gym y más' },
  { n: '48hs', label: 'Setup completo', sub: 'Del primer mensaje a estar en vivo' },
  { n: '$45k', label: 'Desde por mes', sub: 'Sin permanencia, cancelás cuando querés' },
  { n: '24/7', label: 'Tu negocio activo', sub: 'Reservas a las 3am, confirmadas al instante' },
]

export default function StatsV2() {
  return (
    <section style={{ padding: '100px 0', background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="wrap-v2">
        <div style={{ display: 'grid', gap: 2 }} className="grid-stats-mobile md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '48px 32px',
              background: i === 0 ? 'rgba(198,255,61,0.08)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: i === 0 ? '20px 0 0 20px' : i === 3 ? '0 20px 20px 0' : 0,
            }}>
              <div style={{
                fontFamily: 'var(--f-display)', fontStyle: 'italic',
                fontSize: 'clamp(40px, 4vw, 64px)', fontWeight: 700,
                color: i === 0 ? 'var(--lime)' : 'var(--paper)',
                letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16,
              }}>
                {s.n}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--f-display)' }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
