'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Reveal from './Reveal'

const DEMOS = [
  {
    nombre: 'Rufina Nails',
    rubro: 'Nail bar · San Luis',
    color: '#d63384',
    emoji: '💅',
    descripcion: 'Nail bar real de San Luis. Reservas online con cobro de seña incluido.',
    publicId: 'c06c28e8-9d85-45af-ac05-7cde190b14c9',
    panelId: 'c06c28e8-9d85-45af-ac05-7cde190b14c9',
    pin: '1234',
  },
]

type DemoView = 'public' | 'panel'

const PIN_ANIM_DELAY = 600   // ms antes de empezar a tipear
const PIN_CHAR_DELAY = 380   // ms entre cada dígito
const PIN_SUBMIT_DELAY = 500 // ms después del 4to dígito antes de "enviar"

export default function DemoViva() {
  const [demoActiva] = useState(DEMOS[0])
  const [vista, setVista] = useState<DemoView>('public')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  // PIN animation state
  const [showPinAnim, setShowPinAnim] = useState(false)
  const [pinTyped, setPinTyped] = useState('')
  const [pinSubmitting, setPinSubmitting] = useState(false)
  const [pinDone, setPinDone] = useState(false)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const iframeSrc = vista === 'public'
    ? `/reservas/${demoActiva.publicId}`
    : `/panel/${demoActiva.panelId}?autopin=${demoActiva.pin}`

  const iframeKey = `${demoActiva.nombre}-${vista}`

  // Reset on view/demo change
  useEffect(() => {
    setIframeLoaded(false)
    setIframeError(false)
    setPinTyped('')
    setPinSubmitting(false)
    setPinDone(false)

    if (animRef.current) clearTimeout(animRef.current)

    if (vista === 'panel') {
      setShowPinAnim(true)
      // Start typing animation after initial delay
      const pin = demoActiva.pin
      let step = 0
      const typeNext = () => {
        if (step < pin.length) {
          step++
          setPinTyped(pin.slice(0, step))
          animRef.current = setTimeout(typeNext, PIN_CHAR_DELAY)
        } else {
          // All digits typed — brief pause then "submit"
          animRef.current = setTimeout(() => {
            setPinSubmitting(true)
            animRef.current = setTimeout(() => {
              setPinDone(true)
              // Keep overlay a bit so iframe can render behind it
              animRef.current = setTimeout(() => {
                setShowPinAnim(false)
              }, 600)
            }, 700)
          }, PIN_SUBMIT_DELAY)
        }
      }
      animRef.current = setTimeout(typeNext, PIN_ANIM_DELAY)
    } else {
      setShowPinAnim(false)
    }

    const t = setTimeout(() => { setIframeError(true) }, 8000)
    return () => { clearTimeout(t); if (animRef.current) clearTimeout(animRef.current) }
  }, [iframeKey, vista, demoActiva.pin])

  const changeVista = (v: DemoView) => {
    if (v === vista) return
    setVista(v)
  }

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

        {/* Vista tabs: cliente vs dueño */}
        <Reveal delay={100}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(246,245,242,0.3)', marginRight: 8 }}>
              Ver como:
            </span>
            {([
              { key: 'public' as DemoView, label: '👤 Cliente', desc: 'así reserva tu cliente' },
              { key: 'panel' as DemoView, label: '🔧 Dueño del negocio', desc: 'así gestionás vos' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => changeVista(tab.key)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 100,
                  border: vista === tab.key ? `1.5px solid ${demoActiva.color}` : '1.5px solid rgba(246,245,242,0.12)',
                  background: vista === tab.key ? demoActiva.color + '22' : 'transparent',
                  color: vista === tab.key ? 'var(--paper)' : 'rgba(246,245,242,0.45)',
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  fontWeight: vista === tab.key ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>{tab.label}</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em', opacity: 0.5, textTransform: 'uppercase' }}>
                  {tab.desc}
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
            minHeight: 680,
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
                    {vista === 'public' ? '👤 Vista cliente — esto es real' : '🔧 Vista dueño — acceso automático'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 12,
                    color: 'rgba(246,245,242,0.4)',
                    lineHeight: 1.55,
                  }}>
                    {vista === 'public'
                      ? 'Podés reservar de verdad. Así es como lo van a usar tus clientes.'
                      : 'Estás viendo el panel de gestión real. Aquí gestionás turnos, servicios y cobros.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
                <Link
                  href={vista === 'public' ? `/reservas/${demoActiva.publicId}` : `/panel/${demoActiva.panelId}`}
                  target="_blank"
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '11px 20px', borderRadius: 10,
                    background: 'rgba(246,245,242,0.08)',
                    border: '1px solid rgba(246,245,242,0.12)',
                    color: 'rgba(246,245,242,0.7)',
                    textDecoration: 'none', fontFamily: 'var(--f-mono)',
                    fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Abrir en pantalla completa ↗
                </Link>
                <a
                  href={`https://wa.me/5492665286110?text=Quiero%20un%20turnero%20como%20${encodeURIComponent(demoActiva.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '11px 20px', borderRadius: 10,
                    background: 'var(--lime)', color: 'var(--ink)',
                    textDecoration: 'none', fontFamily: 'var(--f-mono)',
                    fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Quiero uno así →
                </a>
              </div>
            </div>

            {/* iframe / fallback */}
            <div style={{ position: 'relative', minHeight: 680, background: 'var(--paper)' }}>

              {/* PIN animation overlay */}
              {showPinAnim && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'var(--paper)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 24,
                  opacity: pinDone ? 0 : 1,
                  transition: pinDone ? 'opacity 0.5s ease' : 'none',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 36 }}>{demoActiva.emoji}</div>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 700,
                    fontSize: 20,
                    color: 'var(--ink)',
                    letterSpacing: '-0.02em',
                  }}>
                    {demoActiva.nombre}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    color: 'var(--muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {pinSubmitting ? 'Entrando al panel...' : 'Ingresá tu PIN de 4 dígitos'}
                  </div>
                  {/* PIN dots */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[0, 1, 2, 3].map(i => {
                      const filled = i < pinTyped.length
                      return (
                        <div key={i} style={{
                          width: 48, height: 56,
                          borderRadius: 10,
                          border: `2px solid ${filled ? demoActiva.color : 'var(--line)'}`,
                          background: filled ? demoActiva.color + '15' : 'var(--paper-2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          transform: filled ? 'scale(1.05)' : 'scale(1)',
                        }}>
                          {filled && (
                            <div style={{
                              width: 10, height: 10, borderRadius: '50%',
                              background: demoActiva.color,
                            }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {pinSubmitting && (
                    <div style={{
                      display: 'flex', gap: 6, alignItems: 'center',
                      fontFamily: 'var(--f-mono)', fontSize: 10,
                      color: demoActiva.color, letterSpacing: '0.08em',
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: demoActiva.color,
                        animation: 'pulse 0.8s infinite',
                      }} />
                      Verificando PIN
                    </div>
                  )}
                  <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }`}</style>
                </div>
              )}

              {/* Loading state */}
              {!iframeLoaded && !iframeError && !showPinAnim && (
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
              {iframeError && !showPinAnim && (
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
                      href={vista === 'public' ? `/reservas/${demoActiva.publicId}` : `/panel/${demoActiva.panelId}`}
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
                key={iframeKey}
                src={iframeSrc}
                style={{
                  width: '100%', height: '100%', minHeight: 680,
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
