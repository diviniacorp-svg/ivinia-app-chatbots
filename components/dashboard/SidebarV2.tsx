'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Orb from '@/components/public/Orb'
import { X } from 'lucide-react'

const areas = [
  {
    href: '/dashboard',
    label: 'HOME',
    sub: 'Canvas del sistema',
    color: '#C6FF3D', colorDeep: '#8AAA1A', shade: 'rgba(0,30,0,0.5)',
    exact: true,
  },
  {
    href: '/comercial',
    label: 'COMERCIAL',
    sub: 'Leads · IA · Propuestas · Cierre',
    color: '#10B981', colorDeep: '#059669', shade: 'rgba(0,50,30,0.4)',
    matches: ['/comercial', '/leads', '/crm', '/outreach'],
  },
  {
    href: '/clientes',
    label: 'CLIENTES',
    sub: 'Activos · Panel · Turnero',
    color: '#38BDF8', colorDeep: '#0284C7', shade: 'rgba(0,30,60,0.4)',
    matches: ['/clientes'],
  },
  {
    href: '/contenido',
    label: 'CONTENT FACTORY',
    sub: 'Flujo IA · Pipeline · Preview',
    color: '#E879F9', colorDeep: '#A21CAF', shade: 'rgba(60,0,80,0.4)',
    matches: ['/contenido', '/redes', '/calendario'],
  },
  {
    href: '/agents',
    label: 'AGENTES',
    sub: 'Grafo neuronal · Oficina',
    color: '#818CF8', colorDeep: '#4338CA', shade: 'rgba(20,10,80,0.4)',
    matches: ['/agents', '/orquestacion', '/dispatch'],
  },
  {
    href: '/academy',
    label: 'ACADEMY',
    sub: '6 tracks · Panel editor',
    color: '#34D399', colorDeep: '#059669', shade: 'rgba(0,40,20,0.4)',
    matches: ['/academy'],
  },
  {
    href: '/pagos',
    label: 'FINANZAS',
    sub: 'Pagos · MRR · Revenue',
    color: '#FCD34D', colorDeep: '#B45309', shade: 'rgba(60,30,0,0.4)',
    matches: ['/pagos', '/turnos'],
  },
  {
    href: '/market',
    label: 'MARKET',
    sub: 'San Luis · Comercios',
    color: '#FF6B35', colorDeep: '#CC4A1A', shade: 'rgba(80,20,0,0.4)',
    matches: ['/market'],
  },
]

const configLinks = [
  { href: '/herramientas', label: 'Herramientas IA' },
  { href: '/chatbots', label: 'Chatbots' },
  { href: '/turnos', label: 'Turnero' },
  { href: '/templates', label: 'Templates' },
]

export default function SidebarV2({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (area: typeof areas[0]) => {
    if (area.exact) return pathname === area.href
    return area.matches?.some(m => pathname === m || pathname.startsWith(m + '/'))
  }

  return (
    <aside style={{
      width: 220, background: 'var(--ink)', display: 'flex', flexDirection: 'column',
      height: '100%', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Orb size={28} color="#C6FF3D" colorDeep="#8AAA1A" shade="rgba(0,20,0,0.5)" />
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: 'var(--paper)', letterSpacing: '-0.04em' }}>
            divinia<span style={{ color: 'rgba(255,255,255,0.3)' }}>.</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Area portals */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {areas.map((area) => {
          const active = isActive(area)
          return (
            <Link
              key={area.href}
              href={area.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                borderLeft: active ? `3px solid ${area.color}` : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <Orb size={28} color={area.color} colorDeep={area.colorDeep} shade={area.shade} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em',
                  color: active ? area.color : 'rgba(255,255,255,0.7)',
                  fontWeight: active ? 700 : 400,
                }}>
                  {area.label}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.3 }}>
                  {area.sub}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Config + footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '4px 12px', marginBottom: 4 }}>
          Config
        </div>
        {configLinks.map(l => (
          <Link key={l.href} href={l.href} style={{
            display: 'block', padding: '7px 12px', borderRadius: 8,
            fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
          }}>
            {l.label}
          </Link>
        ))}
        <Link href="/" target="_blank" style={{
          display: 'block', padding: '7px 12px', marginTop: 4,
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', textDecoration: 'none',
        }}>
          Ver landing →
        </Link>
      </div>
    </aside>
  )
}
