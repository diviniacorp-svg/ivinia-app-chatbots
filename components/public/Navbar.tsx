'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Orb from './Orb'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
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
        padding: '18px 0',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: scrolled ? 'rgba(246,245,242,0.9)' : 'rgba(246,245,242,0.72)',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        fontFamily: 'var(--f-display)',
      }}
    >
      <div className="wrap-v2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo — 5 clicks rápidos = /dashboard */}
        <a href="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <Orb size={30} color="#C6FF3D" colorDeep="#9EE028" shade="rgba(0,0,0,0.28)" squash />
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 21, letterSpacing: '-0.05em', color: 'var(--ink)' }}>
            divinia<span style={{ color: 'var(--muted)' }}>.</span>
          </span>
        </a>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 14, color: 'var(--muted-2)' }}
          className="hidden md:flex">
          <a href="#servicios" style={{ color: 'inherit', textDecoration: 'none' }}>Servicios</a>
          <a href="#proceso" style={{ color: 'inherit', textDecoration: 'none' }}>Cómo trabajamos</a>
          <a href="#casos" style={{ color: 'inherit', textDecoration: 'none' }}>Casos</a>
          <a href="/academy" style={{ color: 'inherit', textDecoration: 'none' }}>Academy</a>
        </div>

        {/* CTA */}
        <a href="#demo" className="btn-v2 btn-ink" style={{ fontSize: 14, padding: '10px 16px 10px 18px' }}>
          Hablemos
          <span className="btn-arrow">↗</span>
        </a>
      </div>
    </nav>
  )
}
