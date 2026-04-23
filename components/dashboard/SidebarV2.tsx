'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: string
  exact?: boolean
  matches?: string[]
  badge?: string
}

type NavGroup = {
  group: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    group: 'Comando',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '⚡', exact: true },
    ],
  },
  {
    group: 'Venta',
    items: [
      { href: '/comercial', label: 'Comercial', icon: '💼', matches: ['/comercial', '/leads', '/crm', '/outreach'] },
      { href: '/clientes', label: 'Clientes', icon: '👥', matches: ['/clientes'] },
      { href: '/finanzas', label: 'Finanzas', icon: '📊', matches: ['/finanzas', '/pagos'] },
    ],
  },
  {
    group: 'Productos',
    items: [
      { href: '/turnos', label: 'Turnero', icon: '📅', matches: ['/turnos', '/dashboard/turnero', '/dashboard/turnos'] },
      { href: '/chatbots', label: 'Chatbot IA', icon: '💬', matches: ['/chatbots', '/templates'] },
      { href: '/nucleo', label: 'Núcleo IA', icon: '🧠', matches: ['/nucleo'], badge: 'nuevo' },
      { href: '/contenido', label: 'Content Factory', icon: '✨', matches: ['/contenido', '/redes', '/calendario', '/youtube'] },
      { href: '/avatares', label: 'Avatares IA', icon: '🎭', matches: ['/avatares'] },
    ],
  },
  {
    group: 'Fábrica',
    items: [
      { href: '/herramientas', label: 'Generadores IA', icon: '🔧', matches: ['/herramientas'] },
      { href: '/market', label: 'Market SL', icon: '🗺️', matches: ['/market'] },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { href: '/agents', label: 'Agentes', icon: '🤖', matches: ['/agents', '/orquestacion', '/dispatch'] },
    ],
  },
]

const LIME = '#C6FF3D'

export default function SidebarV2({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return item.matches?.some(m => pathname === m || pathname.startsWith(m + '/')) ?? false
  }

  return (
    <aside style={{
      width: 220,
      background: 'var(--ink)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Logo */}
      <div style={{
        padding: '18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${LIME}, #8AAA1A)`,
            boxShadow: `0 0 8px rgba(198,255,61,0.5)`,
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--paper)',
            letterSpacing: '-0.04em',
          }}>
            divinia<span style={{ color: 'rgba(255,255,255,0.25)' }}>.</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4, display: 'flex' }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {NAV.map((group, gi) => (
          <div key={group.group}>
            {gi > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 8px' }} />
            )}
            <div style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)',
              padding: '8px 12px 3px',
            }}>
              {group.group}
            </div>
            {group.items.map(item => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '7px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    background: active ? 'rgba(198,255,61,0.08)' : 'transparent',
                    borderLeft: active ? `2px solid ${LIME}` : '2px solid transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      fontSize: 8,
                      fontFamily: 'var(--f-mono)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: LIME,
                      border: `1px solid ${LIME}`,
                      borderRadius: 4,
                      padding: '1px 4px',
                      flexShrink: 0,
                      opacity: 0.8,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'block',
            padding: '6px 12px',
            fontFamily: 'var(--f-mono)',
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            textDecoration: 'none',
          }}
        >
          ver landing →
        </Link>
      </div>
    </aside>
  )
}
