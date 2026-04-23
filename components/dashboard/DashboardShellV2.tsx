'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import SidebarV2 from './SidebarV2'

export default function DashboardShellV2({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          {/* Mini orb */}
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

        {/* Scrollable content area */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--paper-2)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
