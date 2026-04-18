'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import SidebarV2 from './SidebarV2'
import Orb from '@/components/public/Orb'

export default function DashboardShellV2({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 30 }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }} className="lg:static lg:z-auto lg:flex lg:shrink-0 lg:transform-none">
        <SidebarV2 onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Mobile topbar */}
        <div className="lg:hidden" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', background: 'var(--ink)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 6 }}
          >
            <Menu size={20} />
          </button>
          <Orb size={24} color="#C6FF3D" colorDeep="#8AAA1A" shade="rgba(0,20,0,0.5)" />
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: 'var(--paper)', letterSpacing: '-0.04em' }}>
            divinia.
          </span>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--paper-2)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
