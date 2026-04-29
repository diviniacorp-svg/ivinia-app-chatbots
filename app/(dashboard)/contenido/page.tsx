import ContentFactory from './ContentFactory'
import Link from 'next/link'

const CONTENT_TABS = [
  { href: '/contenido', label: 'Generador IA', icon: '✨' },
  { href: '/redes', label: 'Posts y feed', icon: '📱' },
  { href: '/redes/calendar', label: 'Almanaque', icon: '📅' },
  { href: '/calendario', label: 'Calendario', icon: '🗓️' },
]

export default function ContenidoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>
      {/* Page header */}
      <div style={{
        padding: '28px 40px 0',
        borderBottom: '1px solid var(--line)',
        background: 'var(--paper)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
              DIVINIA OS · Productos
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Content Factory
            </h1>
          </div>
          <Link href="/redes/create" style={{
            padding: '9px 18px', borderRadius: 8, background: 'var(--lime)',
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--ink)', textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap',
            alignSelf: 'center',
          }}>
            + Nuevo post
          </Link>
        </div>

        {/* Sub-navigation */}
        <div style={{ display: 'flex', gap: 0 }}>
          {CONTENT_TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px',
                fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: tab.href === '/contenido' ? 'var(--ink)' : 'var(--muted)',
                textDecoration: 'none',
                borderBottom: tab.href === '/contenido' ? '2px solid var(--ink)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.12s',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 40px' }}>
        <ContentFactory />
      </div>
    </div>
  )
}
