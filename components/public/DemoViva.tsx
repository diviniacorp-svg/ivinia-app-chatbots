'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Reveal from './Reveal'

const DEMOS = [
  {
    id: 'rufina-nails-demo',
    nombre: 'Rufina Nails',
    rubro: 'Nail bar · San Luis',
    color: '#d63384',
    emoji: '💅',
    descripcion: 'Nail bar real de San Luis. Reservas online con cobro de seña incluido.',
  },
  {
    id: 'cantera-boutique',
    nombre: 'Cantera Boutique',
    rubro: 'Hotel boutique',
    color: '#92400E',
    emoji: '🏨',
    descripcion: 'Hotel boutique con sistema de reservas directo, sin Booking.',
  },
  {
    id: 'los-paraisos',
    nombre: 'Los Paraísos',
    rubro: 'Hotel · cabañas',
    color: '#065F46',
    emoji: '🌿',
    descripcion: 'Complejo de cabañas con calendario de disponibilidad en tiempo real.',
  },
]

export default function DemoViva() {
  const [demoActiva, setDemoActiva] = useState(DEMOS[0])
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  // Detectar si el iframe fue bloqueado (sin onError nativo confiable — usamos timeout)
  useEffect(() => {
    setIframeLoaded(false)
    setIframeError(false)
    const t = setTimeout(() => {
      setIframeError(prev => !iframeLoaded ? true : prev)
    }, 5000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoActiva.id])

  return (
    <section id="demo" style={{
      padding: '100px 0',
      background: 'var(--ink)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="wrap-v2">

        <Reveal>
          <div style={{ display: 'grid', gap: 40, marginBottom: 52 }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 16, color: 'rgba(246,245,242,0.4)' }}>
                Demo en vivo — 03/05
              </div>
              <h2 className="h-title" style={{ color: 'var(--paper)' }}>
                Probalo<br />
                <em>ahora mismo.</em>
              </h2>
            </div>
            <p style={{
              alignSelf: 'end',
              fontSize: 18,
              lineHeight: 1.55,
              color: 'rgba(246,245,242,0.5)',
              fontFamily: 'var(--f-display)',
              maxWidth: '52ch',
            }}>
              Estas son demos reales funcionando. Podés reservar un turno ahora mismo —
              así es exactamente como va a funcionar para tus clientes.
            </p>
          </div>
        </Reveal>

        {/* Selector de demo */}
        <Reveal delay={100}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            {DEMOS.map(d => (
              <button
                key={d.id}
                onClick={() => { setDemoActiva(d); setIframeLoaded(false) }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 100,
                  border: demoActiva.id === d.id
                    ? `1.5px solid ${d.color}`
                    : '1.5px solid rgba(246,245,242,0.12)',
                  background: demoActiva.id === d.id ? d.color + '18' : 'transparent',
                  color: demoActiva.id === d.id ? 'var(--paper)' : 'rgba(246,245,242,0.45)',
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{d.emoji}</span>
                <span>{d.nombre}</span>
                <span style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  marginLeft: 2,
                }}>
                  {d.rubro}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* iframe container */}
        <Reveal delay={150}>
          <div style={{
            background: 'rgba(246,245,242,0.04)',
            border: '1px solid rgba(246,245,242,0.1)',
            borderRadius: 24,
            overflow: 'hidden',
            display: 'grid',
            minHeight: 600,
          }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]"
          >
            {/* Info panel */}
            <div style={{
              padding: '40px',
              borderRight: '1px solid rgba(246,245,242,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{demoActiva.emoji}</div>
                <h3 style={{
                  fontFamily: 'var(--f-display)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 28,
                  color: 'var(--paper)',
                  letterSpacing: '-0.03em',
                  marginBottom: 6,
                }}>
                  {demoActiva.nombre}
                </h3>
                <div style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: demoActiva.color,
                  marginBottom: 16,
                }}>
                  {demoActiva.rubro}
                </div>
                <p style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 14,
                  color: 'rgba(246,245,242,0.45)',
                  lineHeight: 1.6,
                  marginBottom: 28,
                }}>
                  {demoActiva.descripcion}
                </p>

                <div style={{
                  background: 'rgba(198,255,61,0.06)',
                  border: '1px solid rgba(198,255,61,0.15)',
                  borderRadius: 12,
                  padding: '14px 16px',
                }}>
                  <div style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--lime)',
                    marginBottom: 4,
                  }}>
                    Esto es real
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 12,
                    color: 'rgba(246,245,242,0.4)',
                    lineHeight: 1.55,
                  }}>
                    Podés reservar de verdad. Así es como lo van a usar tus clientes.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
                <Link
                  href={`/reservas/${demoActiva.id}`}
                  target="_blank"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '11px 20px',
                    borderRadius: 10,
                    background: 'rgba(246,245,242,0.08)',
                    border: '1px solid rgba(246,245,242,0.12)',
                    color: 'rgba(246,245,242,0.7)',
                    textDecoration: 'none',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Abrir en pantalla completa ↗
                </Link>
                <a
                  href={`https://wa.me/5492665286110?text=Quiero%20un%20turnero%20como%20${encodeURIComponent(demoActiva.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '11px 20px',
                    borderRadius: 10,
                    background: 'var(--lime)',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontFamily: 'var(--f-mono)',
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Quiero uno así →
                </a>
              </div>
            </div>

            {/* iframe / fallback */}
            <div style={{ position: 'relative', minHeight: 600, background: 'var(--paper)' }}>
              {/* Loading state */}
              {!iframeLoaded && !iframeError && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--paper)', zIndex: 1, gap: 12,
                }}>
                  <div style={{ fontSize: 32 }}>{demoActiva.emoji}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Cargando demo...
                  </div>
                </div>
              )}
              {/* Error / blocked fallback */}
              {iframeError && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--paper)', zIndex: 2, gap: 20, padding: 40, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48 }}>{demoActiva.emoji}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>
                      {demoActiva.nombre}
                    </div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', marginBottom: 24, maxWidth: '28ch', lineHeight: 1.55 }}>
                      Abrí la demo en pantalla completa para interactuar con ella.
                    </div>
                    <Link
                      href={`/reservas/${demoActiva.id}`}
                      target="_blank"
                      style={{
                        display: 'inline-block',
                        padding: '12px 24px', borderRadius: 10,
                        background: 'var(--ink)', color: 'var(--paper)',
                        textDecoration: 'none', fontFamily: 'var(--f-mono)',
                        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
                      }}
                    >
                      Abrir demo ↗
                    </Link>
                  </div>
                </div>
              )}
              <iframe
                key={demoActiva.id}
                src={`/reservas/${demoActiva.id}`}
                style={{
                  width: '100%', height: '100%', minHeight: 600,
                  border: 'none', display: iframeError ? 'none' : 'block',
                }}
                onLoad={() => { setIframeLoaded(true); setIframeError(false) }}
                title={`Demo ${demoActiva.nombre}`}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
