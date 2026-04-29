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
  dim?: boolean
}

type NavGroup = {
  group: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    group: 'Hoy',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '⚡', exact: true },
    ],
  },
  {
    group: 'Ventas',
    items: [
      { href: '/comercial',  label: 'Pipeline',    icon: '🔥', matches: ['/comercial'] },
      { href: '/leads',      label: 'Leads',       icon: '🎯', matches: ['/leads'] },
      { href: '/crm',        label: 'CRM',         icon: '🗂',  matches: ['/crm'] },
      { href: '/outreach',   label: 'Outreach',    icon: '📧', matches: ['/outreach'] },
      { href: '/clientes',   label: 'Clientes',    icon: '👥', matches: ['/clientes'] },
      { href: '/pagos',      label: 'Pagos',       icon: '💳', matches: ['/pagos', '/finanzas'] },
    ],
  },
  {
    group: 'Productos',
    items: [
      { href: '/turnos',    label: 'Turnero',        icon: '📅', matches: ['/turnos', '/dashboard/turnero', '/dashboard/turnos'] },
      { href: '/chatbots',  label: 'Chatbot IA',     icon: '💬', matches: ['/chatbots', '/templates'] },
      { href: '/contenido', label: 'Content Factory',icon: '✨', matches: ['/contenido', '/redes', '/calendario'] },
      { href: '/avatares',  label: 'Avatares IA',    icon: '🎭', matches: ['/avatares'], dim: true },
      { href: '/publicidad',label: 'Publicidad IA',  icon: '📢', matches: ['/publicidad'], badge: 'nuevo' },
      { href: '/nucleo',    label: 'NUCLEUS',        icon: '🧠', matches: ['/nucleo'], badge: 'beta' },
    ],
  },
  {
    group: 'Taller',
    items: [
      { href: '/herramientas', label: 'Generadores', icon: '🔧', matches: ['/herramientas', '/ideas', '/proyectos', '/youtube'] },
      { href: '/agents',       label: 'Agentes',     icon: '🤖', matches: ['/agents', '/orquestacion', '/dispatch'] },
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
      width: 210,
      background: 'var(--ink)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Logo */}
      <div style={{
        padding: '16px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ position: 'relative', width: 18, height: 18, flexShrink: 0, display: 'inline-block' }}>
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${LIME}, #8AAA1A)`,
              boxShadow: `0 0 8px rgba(198,255,61,0.5)`,
            }} />
            <div style={{
              position: 'absolute',
              bottom: -2,
              right: -3,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #FF7A2F, #CC4F10)',
              boxShadow: '0 0 5px rgba(255,100,20,0.6)',
            }} />
          </span>
          <span style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--paper)',
            letterSpacing: '-0.04em',
          }}>
            divinia<span style={{ color: 'rgba(255,255,255,0.22)' }}>.</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4, display: 'flex' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {NAV.map((group, gi) => (
          <div key={group.group}>
            {gi > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 6px' }} />
            )}
            <div style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 8.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              padding: '7px 10px 2px',
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
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 7,
                    textDecoration: 'none',
                    background: active ? 'rgba(198,255,61,0.09)' : 'transparent',
                    borderLeft: active ? `2px solid ${LIME}` : '2px solid transparent',
                    transition: 'background 0.12s',
                    opacity: item.dim && !active ? 0.55 : 1,
                    marginBottom: 1,
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.48)',
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
                      fontSize: 7.5,
                      fontFamily: 'var(--f-mono)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: LIME,
                      border: `1px solid ${LIME}`,
                      borderRadius: 3,
                      padding: '1px 3px',
                      flexShrink: 0,
                      opacity: 0.75,
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
      <div style={{ padding: '8px 6px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Link
          href="/rubros"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 6,
            fontFamily: 'var(--f-mono)',
            fontSize: 8.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: LIME,
            textDecoration: 'none',
            opacity: 0.65,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.65' }}
        >
          <span>🎯</span>
          <span>demos rubros ↗</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'block',
            padding: '3px 10px',
            fontFamily: 'var(--f-mono)',
            fontSize: 8.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
            textDecoration: 'none',
          }}
        >
          ver landing →
        </Link>
      </div>
    </aside>
  )
}
