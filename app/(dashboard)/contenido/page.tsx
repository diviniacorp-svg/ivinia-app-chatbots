import ContentFactory from './ContentFactory'
import Link from 'next/link'

const LIME = '#C6FF3D'
const INK = '#09090B'

const FLOW_STEPS = [
  { n: '1', icon: '🎯', label: 'Elegí producto + pilar', desc: 'O cargá del plan semanal' },
  { n: '2', icon: '✨', label: 'Generá con IA', desc: 'Caption + prompt visual listo' },
  { n: '3', icon: '🎨', label: 'Creá el visual', desc: 'Copiá el prompt a Canva o Freepik' },
  { n: '4', icon: '📱', label: 'Publicá o agendá', desc: 'Instagram o calendario' },
]

const QUICK_LINKS = [
  { href: '/redes',          icon: '📱', label: 'Posts publicados',   desc: 'Feed y estado de publicaciones' },
  { href: '/calendario',     icon: '🗓️', label: 'Calendario',         desc: 'Agendá y planificá publicaciones' },
  { href: '/redes/calendar', icon: '📅', label: 'Almanaque',           desc: 'Vista semanal del plan de contenido' },
]

export default function ContenidoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5' }}>

      {/* ── Flujo de trabajo ──────────────────────────────────────────── */}
      <div style={{ background: INK, padding: '14px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', maxWidth: 1200 }}>
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 8.5, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginRight: 8,
          }}>
            FLUJO:
          </span>
          {FLOW_STEPS.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: `${LIME}22`, border: `1px solid ${LIME}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, color: LIME,
                  flexShrink: 0,
                }}>
                  {step.n}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                    {step.icon} {step.label}
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 14, margin: '0 4px' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{
        padding: '20px 40px 16px',
        borderBottom: '1px solid #E4E4E7',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 4 }}>
            DIVINIA OS · Agencia
          </p>
          <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 26, color: INK, margin: 0, letterSpacing: '-0.02em' }}>
            Content Factory
          </h1>
        </div>

        {/* Accesos rápidos */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                background: '#F4F4F5', border: '1px solid #E4E4E7', color: '#3F3F46',
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'background 0.12s', whiteSpace: 'nowrap',
              }}
            >
              {link.icon} {link.label} →
            </Link>
          ))}
          <Link
            href="/redes/create"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
              background: INK, color: '#fff', border: 'none',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            + Post manual
          </Link>
        </div>
      </div>

      {/* ── Zona de herramientas externas ─────────────────────────────── */}
      <div style={{
        padding: '10px 40px',
        background: '#FAFAFA',
        borderBottom: '1px solid #E4E4E7',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A1A1AA', marginRight: 4 }}>
          Herramientas:
        </span>
        {[
          { href: 'https://www.canva.com/brand/folders', label: '🎨 Canva', color: '#7C3AED' },
          { href: 'https://www.freepik.com/pikaso', label: '✨ Freepik Mystic', color: '#DB2777' },
          { href: 'https://www.instagram.com/autom_atia', label: '📸 @autom_atia', color: '#E1306C' },
        ].map(tool => (
          <a
            key={tool.href}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '4px 12px', borderRadius: 6,
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.04em',
              color: tool.color, background: tool.color + '12', border: `1px solid ${tool.color}25`,
              textDecoration: 'none',
            }}
          >
            {tool.label} ↗
          </a>
        ))}
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#A1A1AA', marginLeft: 8 }}>
          · Los prompts generados se copian directo al clipboard para usar acá ↑
        </span>
      </div>

      {/* ── ContentFactory principal ──────────────────────────────────── */}
      <div style={{ padding: '28px 40px' }}>
        <ContentFactory />
      </div>

      {/* ── Nota de guardado ─────────────────────────────────────────── */}
      <div style={{ padding: '0 40px 40px' }}>
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #E4E4E7',
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <div>
              <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: INK, margin: 0 }}>
                ¿Dónde guardo los posts generados?
              </p>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#71717A', margin: '2px 0 0', letterSpacing: '0.02em' }}>
                Copiá el caption y el prompt visual, creá el diseño en Canva o Freepik, y agendá desde el Calendario.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/calendario" style={{
              padding: '7px 14px', borderRadius: 8, background: LIME, color: INK,
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none', fontWeight: 700,
            }}>
              Abrir Calendario →
            </Link>
            <Link href="/redes" style={{
              padding: '7px 14px', borderRadius: 8, background: '#F4F4F5', border: '1px solid #E4E4E7', color: INK,
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              Ver Posts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
