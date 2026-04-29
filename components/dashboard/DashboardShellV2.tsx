'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import SidebarV2 from './SidebarV2'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/leads':      'Ventas · Leads',
  '/comercial':  'Ventas · Pipeline',
  '/crm':        'Ventas · CRM',
  '/propuestas': 'Ventas · Propuestas',
  '/clientes':   'Ventas · Clientes',
  '/outreach':   'Marketing · Outreach',
  '/turnos':     'Servicios · Turnero IA',
  '/chatbots':   'Servicios · Chatbots',
  '/templates':  'Servicios · Chatbots',
  '/pagos':      'Servicios · Cobros',
  '/finanzas':   'Servicios · Finanzas',
  '/contenido':  'Marketing · Contenido IA',
  '/publicidad': 'Marketing · Publicidad IA',
  '/redes':      'Marketing · Redes',
  '/calendario': 'Marketing · Contenido IA',
  '/nucleo':     'IA · NUCLEUS',
  '/agents':     'IA · Agentes',
  '/orquestacion':'IA · Agentes',
  '/dispatch':   'IA · Agentes',
  '/avatares':   'IA · Avatares',
  '/dashboard/academy': 'IA · Academy',
  '/estrategia': 'Sistema · Estrategia',
  '/proyectos':  'Sistema · Proyectos',
  '/herramientas':'Sistema · Herramientas',
  '/ideas':      'Sistema · Herramientas',
  '/youtube':    'Sistema · Herramientas',
}

function getPageTitle(pathname: string): string {
  const exact = ROUTE_TITLES[pathname]
  if (exact) return exact
  const prefix = Object.keys(ROUTE_TITLES).find(k => pathname.startsWith(k + '/'))
  return prefix ? ROUTE_TITLES[prefix] : 'DIVINIA'
}

export default function DashboardShellV2({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--paper-2)', color: 'var(--ink)', overflow: 'hidden' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30 }}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.22s ease',
        display: 'flex',
      }}
        className="lg:static lg:z-auto lg:transform-none"
      >
        <SidebarV2 onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Mobile topbar */}
        <div
          className="lg:hidden"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            background: 'var(--ink)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4, display: 'flex' }}
          >
            <Menu size={20} />
          </button>
          <div style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #C6FF3D, #8AAA1A)',
            boxShadow: '0 0 6px rgba(198,255,61,0.4)',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--paper)',
            letterSpacing: '-0.04em',
          }}>
            divinia.
          </span>
        </div>

        {/* Desktop top bar — título de página + quick actions */}
        <div
          className="hidden lg:flex"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: 40,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'var(--ink)',
            flexShrink: 0,
          }}
        >
          <span style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}>
            {pageTitle}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/rubros"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                textDecoration: 'none',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#C6FF3D'
                el.style.color = '#C6FF3D'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.1)'
                el.style.color = 'rgba(255,255,255,0.3)'
              }}
            >
              <span>🎯</span>
              <span>demos</span>
            </Link>
            <a
              href="https://wa.me/5492665286110"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                textDecoration: 'none',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#25D366'
                el.style.color = '#25D366'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.1)'
                el.style.color = 'rgba(255,255,255,0.3)'
              }}
            >
              <span>💬</span>
              <span>whatsapp</span>
            </a>
          </div>
        </div>

        {/* Scrollable content area */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--paper-2)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
