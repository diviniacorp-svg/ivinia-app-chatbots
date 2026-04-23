'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Orb from './Orb'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const clicks = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogoClick(e: React.MouseEvent) {
    clicks.current += 1
    if (timer.current) clearTimeout(timer.current)
    if (clicks.current >= 5) {
      clicks.current = 0
      e.preventDefault()
      router.push('/dashboard')
      return
    }
    timer.current = setTimeout(() => { clicks.current = 0 }, 1500)
  }

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: scrolled ? 'rgba(246,245,242,0.9)' : 'rgba(246,245,242,0.72)',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        fontFamily: 'var(--f-display)',
      }}
    >
      <div className="wrap-v2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' }}>
        {/* Logo — 5 clicks rápidos = /dashboard */}
        <a href="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <span style={{ position: 'relative', width: 30, height: 30, flexShrink: 0, display: 'inline-block' }}>
            <Orb size={30} color="#C6FF3D" colorDeep="#9EE028" shade="rgba(0,0,0,0.28)" />
            <span style={{ position: 'absolute', bottom: -2, right: -4 }}>
              <Orb size={14} color="#FF7A2F" colorDeep="#CC4F10" shade="rgba(60,20,0,0.45)" />
            </span>
          </span>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 21, letterSpacing: '-0.05em', color: 'var(--ink)' }}>
            divinia<span style={{ color: 'var(--muted)' }}>.</span>
          </span>
        </a>

        {/* Nav links — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, color: 'var(--muted-2)' }}
          className="hidden-mobile">
          <a href="#productos" style={{ color: 'inherit', textDecoration: 'none' }}>Productos</a>
          <a href="#demo" style={{ color: 'inherit', textDecoration: 'none' }}>Demo en vivo</a>
          <a href="#casos" style={{ color: 'inherit', textDecoration: 'none' }}>Casos</a>
          <a href="#precios" style={{ color: 'inherit', textDecoration: 'none' }}>Precios</a>
          <a href="/auditoria" style={{ color: '#C6FF3D', textDecoration: 'none', fontWeight: 600 }}>Auditoría gratis</a>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* WA CTA — desktop */}
          <a
            href="https://wa.me/5492665286110?text=Hola%20DIVINIA%2C%20quiero%20info"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-v2 btn-ink hidden-mobile"
            style={{ fontSize: 14, padding: '10px 16px 10px 18px' }}
          >
            WhatsApp
            <span className="btn-arrow">↗</span>
          </a>

          {/* Hamburguesa — mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
            style={{
              display: 'none',
              background: 'none', border: '1px solid var(--line)',
              borderRadius: 8, cursor: 'pointer',
              padding: '8px 10px', color: 'var(--ink)',
              flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center',
            }}
            className="show-mobile-flex"
          >
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--ink)', borderRadius: 1, transition: 'all 0.2s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--ink)', borderRadius: 1, transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--ink)', borderRadius: 1, transition: 'all 0.2s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div style={{
          background: 'rgba(246,245,242,0.97)',
          borderTop: '1px solid var(--line)',
          padding: '20px 20px 28px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            { href: '#productos', label: 'Productos' },
            { href: '#demo', label: 'Demo en vivo' },
            { href: '#casos', label: 'Casos reales' },
            { href: '#precios', label: 'Precios' },
            { href: '/auditoria', label: '⚡ Auditoría gratis' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--f-display)', fontSize: 18, fontWeight: 500,
                color: 'var(--ink)', textDecoration: 'none',
                padding: '12px 0', borderBottom: '1px solid var(--line)',
                letterSpacing: '-0.02em',
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/5492665286110?text=Hola%20DIVINIA%2C%20quiero%20el%20Turnero"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="btn-v2 btn-ink"
            style={{ marginTop: 16, textAlign: 'center', justifyContent: 'center' }}
          >
            WhatsApp →
          </a>
        </div>
      )}
    </nav>
  )
}
