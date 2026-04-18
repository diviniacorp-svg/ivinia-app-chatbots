import Link from 'next/link'
import Orb from './Orb'

const demos = [
  { rubro: 'Peluquería', emoji: '✂️', path: '/reservas/rufina', color: '#FF5E3A', colorDeep: '#CC3A1A', shade: 'rgba(80,10,0,0.4)' },
  { rubro: 'Estética', emoji: '💅', path: '/reservas/estetica', color: '#E879F9', colorDeep: '#A21CAF', shade: 'rgba(60,0,80,0.4)' },
  { rubro: 'Odontología', emoji: '🦷', path: '/reservas/odontologia', color: '#38BDF8', colorDeep: '#0284C7', shade: 'rgba(0,30,60,0.4)' },
  { rubro: 'Gimnasio', emoji: '💪', path: '/reservas/gimnasio', color: '#C6FF3D', colorDeep: '#8AAA1A', shade: 'rgba(0,30,0,0.5)' },
]

export default function DemosV2() {
  return (
    <section id="demos" style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
      <div className="wrap-v2">

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, alignItems: 'center' }}
          className="grid-cols-1 md:grid-cols-2">

          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>Demo en vivo</div>
            <h2 className="h-display" style={{ fontSize: 'clamp(44px, 5.5vw, 88px)', marginBottom: 24, color: 'var(--ink)' }}>
              Probalo ahora.<br />
              <em>Sin registrarte.</em>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '38ch', marginBottom: 36 }}>
              Estos son sistemas reales funcionando. Elegí un rubro y reservá un turno como lo haría tu cliente.
            </p>
            <Link href="/rubros" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)', paddingBottom: 4,
            }}>
              Ver todos los rubros disponibles →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {demos.map((d, i) => (
              <Link key={d.rubro} href={d.path} style={{
                display: 'block', textDecoration: 'none',
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                borderRadius: 20, padding: '28px 24px', transition: 'border-color 0.2s',
                cursor: 'pointer',
              }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                    <Orb size={48} color={d.color} colorDeep={d.colorDeep} shade={d.shade} />
                  </div>
                  <span style={{ fontSize: 22 }}>{d.emoji}</span>
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)', marginBottom: 6 }}>
                  {d.rubro}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Reservar turno →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
