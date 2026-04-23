import Orb from './Orb'
import Link from 'next/link'

const WA = 'https://wa.me/5492665286110'

const CASOS = [
  {
    tag: 'Nail Bar · San Luis Capital',
    tagColor: '#d63384',
    bg: 'var(--paper-2)',
    dark: false,
    orbColor: '#d63384',
    orbDeep: '#a21057',
    title: 'Rufina Nails llena agenda',
    titleEm: 'sin llamar.',
    desc: 'Antes anotaba turnos en papel y perdía clientes cuando estaba trabajando. Ahora el Turnero recibe reservas solo, cobra la seña y ella solo mira el panel.',
    stats: [
      { val: '100%', label: 'Digital' },
      { val: '0', label: 'Llamadas perdidas' },
      { val: '24hs', label: 'Setup' },
    ],
    cta: { label: 'Ver su Turnero en vivo →', href: '/reservas/rufina-nails-demo' },
    producto: 'Turnero Único',
  },
  {
    tag: 'Estética · San Luis Capital',
    tagColor: '#8b5cf6',
    bg: 'var(--ink)',
    dark: true,
    orbColor: '#8b5cf6',
    orbDeep: '#5b21b6',
    title: 'tuEspacio gestiona turnos',
    titleEm: '24hs solo.',
    desc: 'Romina no perdía clientes, pero sí horas coordinando por WhatsApp. Con el Turnero, cada turno queda confirmado con seña incluida — ella solo trabaja.',
    stats: [
      { val: '$0', label: 'Costo por turno' },
      { val: '∞', label: 'Disponibilidad' },
      { val: '3sem', label: 'Recuperó la inversión' },
    ],
    cta: null,
    producto: 'Turnero Mensual',
  },
  {
    tag: 'Comercio · San Luis Capital',
    tagColor: '#f59e0b',
    bg: 'var(--paper-2)',
    dark: false,
    orbColor: '#f59e0b',
    orbDeep: '#b45309',
    title: 'Shopping del Usado conecta',
    titleEm: 'con IA.',
    desc: 'El mayor marketplace de usados de San Luis. Con NUCLEUS IA, reciben consultas 24hs, responden automáticamente y derivan al vendedor solo cuando el cliente está listo.',
    stats: [
      { val: '24/7', label: 'Atención IA' },
      { val: '+60%', label: 'Consultas resueltas auto' },
      { val: 'NUCLEUS', label: 'Producto' },
    ],
    cta: null,
    producto: 'NUCLEUS IA',
  },
]

export default function CasesV2() {
  return (
    <section id="casos" style={{ padding: '100px 0', background: 'var(--paper)' }}>
      <div className="wrap-v2">

        <div style={{ display: 'grid', gap: 40, marginBottom: 56 }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Casos reales — 04/05</div>
            <h2 className="h-title">Negocios que ya <em>funcionan solos</em>.</h2>
          </div>
          <p style={{ alignSelf: 'end', fontSize: 18, lineHeight: 1.5, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '52ch' }}>
            Rubros distintos, mismo resultado: el negocio funciona aunque el dueño no esté mirando el teléfono.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">
          {CASOS.map((c, i) => (
            <article key={i} style={{
              background: c.bg,
              borderRadius: 24, padding: '36px 32px',
              minHeight: 480, position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              border: c.dark ? 'none' : '1px solid var(--line)',
            }}>
              <Orb
                size={180}
                color={c.orbColor} colorDeep={c.orbDeep}
                shade={`rgba(0,0,0,0.4)`}
                float
                style={{ position: 'absolute', top: -40, right: -40, opacity: 0.4 }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="tag-v2" style={c.dark ? {
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: 'var(--paper)',
                } : {}}>
                  <span className="tag-dot" style={{ background: c.tagColor }} />{' '}{c.tag}
                </span>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: c.tagColor,
                  marginTop: 20, marginBottom: 8,
                }}>
                  {c.producto}
                </div>
                <h3 style={{
                  fontFamily: 'var(--f-display)', fontWeight: 700,
                  fontSize: 'clamp(22px, 2.5vw, 30px)',
                  color: c.dark ? 'var(--paper)' : 'var(--ink)',
                  letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 14px',
                }}>
                  {c.title} <em>{c.titleEm}</em>
                </h3>
                <p style={{
                  fontSize: 14, color: c.dark ? 'rgba(246,245,242,0.45)' : 'var(--muted-2)',
                  fontFamily: 'var(--f-display)', lineHeight: 1.6, margin: 0,
                }}>
                  {c.desc}
                </p>
              </div>

              <div style={{ position: 'relative', zIndex: 2, marginTop: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                  {c.stats.map(s => (
                    <div key={s.label}>
                      <div style={{
                        fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
                        fontSize: 'clamp(18px, 2vw, 26px)',
                        color: c.dark ? 'var(--paper)' : 'var(--ink)',
                        letterSpacing: '-0.03em',
                      }}>{s.val}</div>
                      <div style={{
                        fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: c.dark ? 'rgba(246,245,242,0.35)' : 'var(--muted-2)',
                        marginTop: 4,
                      }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {c.cta && (
                  <Link href={c.cta.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em',
                    textTransform: 'uppercase', fontWeight: 700,
                    color: c.tagColor, textDecoration: 'none',
                  }}>
                    {c.cta.label}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* CTA banner */}
        <div style={{
          marginTop: 24, background: 'var(--ink)', borderRadius: 20, padding: '32px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--lime)', marginBottom: 8 }}>
              Tu rubro está cubierto
            </div>
            <p style={{ fontSize: 18, color: 'var(--paper)', fontFamily: 'var(--f-display)', margin: 0, maxWidth: '48ch', lineHeight: 1.4 }}>
              Mirá cómo quedaría el Turnero para tu negocio — en vivo, sin registrarte.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/rubros" style={{
              background: 'var(--lime)', color: 'var(--ink)', borderRadius: 10,
              padding: '12px 22px', fontFamily: 'var(--f-mono)', fontWeight: 700,
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Ver demo de mi rubro →
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" style={{
              border: '1px solid rgba(246,245,242,0.2)', color: 'rgba(246,245,242,0.6)',
              borderRadius: 10, padding: '12px 22px', fontFamily: 'var(--f-mono)',
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Hablar por WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
