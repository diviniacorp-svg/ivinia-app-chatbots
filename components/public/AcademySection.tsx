import Link from 'next/link'
import Orb from './Orb'

const tracks = [
  {
    n: '01', title: 'IA para tu negocio',
    desc: 'Cómo usar inteligencia artificial para automatizar tu PYME sin saber programar.',
    lecciones: 8, duracion: '2hs', nivel: 'Básico', color: '#C6FF3D',
  },
  {
    n: '02', title: 'Turnero: guía completa',
    desc: 'Desde configurar tu agenda hasta cobrar señas automáticas con MercadoPago.',
    lecciones: 5, duracion: '1hs', nivel: 'Básico', color: '#38BDF8',
  },
  {
    n: '03', title: 'Automatizaciones reales',
    desc: 'Casos de uso reales: notificaciones, recordatorios, CRM automático y más.',
    lecciones: 12, duracion: '3hs', nivel: 'Intermedio', color: '#E879F9',
  },
  {
    n: '04', title: 'Contenido con IA',
    desc: 'Cómo generar posts, reels y campañas completas con herramientas de IA.',
    lecciones: 10, duracion: '2.5hs', nivel: 'Intermedio', color: '#FF5E3A',
  },
]

export default function AcademySection() {
  return (
    <section id="academy" style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--ink)' }}>
      <div className="wrap-v2">

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' }}
          className="grid-cols-1 md:grid-cols-2">

          {/* Left */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(198,255,61,0.1)', border: '1px solid rgba(198,255,61,0.25)',
              borderRadius: 100, padding: '8px 18px', marginBottom: 28,
            }}>
              <Orb size={16} color="#C6FF3D" colorDeep="#8AAA1A" shade="rgba(0,20,0,0.5)" />
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)' }}>
                DIVINIA Academy — Gratis
              </span>
            </div>
            <h2 className="h-display" style={{ fontSize: 'clamp(44px, 5.5vw, 80px)', color: 'var(--paper)', marginBottom: 24 }}>
              Aprendé a<br />
              <em>automatizar<br />tu negocio.</em>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--f-display)', maxWidth: '38ch', marginBottom: 40 }}>
              Cursos cortos, prácticos y en español sobre IA aplicada a PYMEs argentinas. Totalmente gratis.
            </p>
            <Link href="/academy" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--lime)', color: 'var(--ink)',
              padding: '14px 28px', borderRadius: 10,
              fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.08em',
              textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700,
            }}>
              Explorar cursos →
            </Link>
            <div style={{ marginTop: 24, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
              4 tracks · 35 lecciones · Sin registro
            </div>
          </div>

          {/* Right — course list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tracks.map((t, i) => (
              <Link key={t.n} href="/academy" style={{
                display: 'block', textDecoration: 'none',
                padding: '28px 28px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: i === 0 ? '16px 16px 0 0' : i === tracks.length - 1 ? '0 0 16px 16px' : 0,
                transition: 'background 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, marginTop: 2 }}>
                    <Orb size={44} color={t.color} colorDeep={t.color} shade="rgba(0,0,0,0.5)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 17, color: 'var(--paper)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginLeft: 16 }}>
                        {t.nivel}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--f-display)', lineHeight: 1.45, marginBottom: 12 }}>
                      {t.desc}
                    </div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                      {t.lecciones} lecciones · {t.duracion}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
