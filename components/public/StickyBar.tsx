'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function StickyBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 49,
        background: 'var(--ink)',
        borderBottom: '1px solid rgba(198,255,61,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '10px 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <span style={{
        fontFamily: 'var(--f-display)',
        fontSize: 14,
        color: 'rgba(246,245,242,0.7)',
        letterSpacing: '-0.01em',
      }}>
        <strong style={{ color: 'var(--paper)' }}>Turnero DIVINIA</strong>
        {' '}· desde{' '}
        <strong style={{ color: 'var(--lime)' }}>$45.000/mes</strong>
        {' '}· Listo en 24hs
      </span>
      <Link
        href="/onboarding"
        style={{
          background: 'var(--lime)',
          color: 'var(--ink)',
          borderRadius: 8,
          padding: '7px 16px',
          fontFamily: 'var(--f-mono)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Empezar gratis →
      </Link>
    </div>
  )
}
