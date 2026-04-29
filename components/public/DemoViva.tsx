'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Reveal from './Reveal'

const DEMOS = [
  {
    nombre: 'Rufina Nails',
    rubro: 'Nail bar',
    color: '#d63384',
    emoji: '💅',
    descripcion: 'Nail bar de San Luis. Reservas con cobro de seña online.',
    publicSlug: 'rufina-nails-demo',
    cfgId: '75c6a93f-a9e3-4e47-bf56-fa5bb8c8a7f8',
    pin: '3698',
  },
  {
    nombre: 'Cantera Boutique',
    rubro: 'Hotel boutique',
    color: '#f59e0b',
    emoji: '🏨',
    descripcion: 'Hotel boutique en San Luis. Check-in online y reservas directas.',
    publicSlug: 'cantera2026bot',
    cfgId: 'fff9e610-0620-4ed5-82a9-e8505bcc1148',
    pin: '4158',
  },
  {
    nombre: 'Los Paraísos',
    rubro: 'Complejo de cabañas',
    color: '#10b981',
    emoji: '🌿',
    descripcion: 'Complejo de cabañas. Reservas sin intermediarios, cobro de seña incluido.',
    publicSlug: 'paraisos2026bt',
    cfgId: '4c05aac8-c8fc-46c9-83ec-18d53343bd64',
    pin: '2650',
  },
]

type DemoView = 'public' | 'panel'

const PIN_ANIM_DELAY = 500
const PIN_CHAR_DELAY = 350
const PIN_SUBMIT_DELAY = 400

export default function DemoViva() {
  const [demoIdx, setDemoIdx] = useState(0)
  const [vista, setVista] = useState<DemoView>('public')
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const [showPinAnim, setShowPinAnim] = useState(false)
  const [pinTyped, setPinTyped] = useState('')
  const [pinSubmitting, setPinSubmitting] = useState(false)
  const [pinDone, setPinDone] = useState(false)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const demo = DEMOS[demoIdx]

  const iframeSrc = vista === 'public'
    ? `/reservas/${demo.publicSlug}`
    : `/panel/${demo.cfgId}?autopin=${demo.pin}`

  const iframeKey = `${demo.cfgId}-${vista}`

  useEffect(() => {
    setIframeLoaded(false)
    setPinTyped('')
    setPinSubmitting(false)
    setPinDone(false)
    if (animRef.current) clearTimeout(animRef.current)

    if (vista === 'panel') {
      setShowPinAnim(true)
      const pin = demo.pin
      let step = 0
      const typeNext = () => {
        if (step < pin.length) {
          step++
          setPinTyped(pin.slice(0, step))
          animRef.current = setTimeout(typeNext, PIN_CHAR_DELAY)
        } else {
          animRef.current = setTimeout(() => {
            setPinSubmitting(true)
            animRef.current = setTimeout(() => {
              setPinDone(true)
              animRef.current = setTimeout(() => setShowPinAnim(false), 500)
            }, 600)
          }, PIN_SUBMIT_DELAY)
        }
      }
      animRef.current = setTimeout(typeNext, PIN_ANIM_DELAY)
    } else {
      setShowPinAnim(false)
    }

    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [iframeKey, vista, demo.pin])

  const changeDemo = (idx: number) => {
    if (idx === demoIdx) return
    setDemoIdx(idx)
    setVista('public')
  }

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
          <div style={{ display: 'grid', gap: 40, marginBottom: 48 }}
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
              alignSelf: 'end', fontSize: 18, lineHeight: 1.55,
              color: 'rgba(246,245,242,0.5)', fontFamily: 'var(--f-display)', maxWidth: '52ch',
            }}>
              Demos reales funcionando. Podés reservar ahora mismo — así es exactamente
              como va a funcionar para tus clientes.
            </p>
          </div>
        </Reveal>

        {/* Demo selector */}
        <Reveal delay={60}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {DEMOS.map((d, i) => (
              <button key={d.cfgId} onClick={() => changeDemo(i)} style={{
                padding: '8px 16px', borderRadius: 100,
                border: `1.5px solid ${demoIdx === i ? d.color : 'rgba(246,245,242,0.15)'}`,
                background: demoIdx === i ? d.color + '20' : 'transparent',
                color: demoIdx === i ? 'var(--paper)' : 'rgba(246,245,242,0.4)',
                fontFamily: 'var(--f-display)', fontSize: 13,
                fontWeight: demoIdx === i ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{d.emoji}</span> {d.nombre}
              </button>
            ))}
          </div>
        </Reveal>

        {/* POV Tabs — prominent */}
        <Reveal delay={100}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button onClick={() => changeVista('public')} style={{
              flex: 1,
              padding: '14px 20px', borderRadius: 14,
              border: vista === 'public' ? `2px solid ${demo.color}` : '2px solid rgba(246,245,242,0.1)',
              background: vista === 'public' ? demo.color : 'rgba(246,245,242,0.04)',
              color: vista === 'public' ? (demo.color === '#d63384' ? '#fff' : 'var(--ink)') : 'rgba(246,245,242,0.5)',
              fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>👤</span>
              <div style={{ textAlign: 'left' }}>
                <div>Vista Cliente</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase', fontWeight: 400 }}>
                  así reserva tu cliente
                </div>
              </div>
            </button>
            <button onClick={() => changeVista('panel')} style={{
              flex: 1,
              padding: '14px 20px', borderRadius: 14,
              border: vista === 'panel' ? '2px solid var(--lime)' : '2px solid rgba(246,245,242,0.1)',
              background: vista === 'panel' ? 'var(--lime)' : 'rgba(246,245,242,0.04)',
              color: vista === 'panel' ? 'var(--ink)' : 'rgba(246,245,242,0.5)',
              fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>🔧</span>
              <div style={{ textAlign: 'left' }}>
                <div>Panel del Negocio</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase', fontWeight: 400 }}>
                  así gestionás vos
                </div>
              </div>
            </button>
          </div>
        </Reveal>

        {/* Main demo frame */}
        <Reveal delay={150}>
          <div style={{
            background: 'rgba(246,245,242,0.04)',
            border: `1px solid ${demo.color}33`,
            borderRadius: 24, overflow: 'hidden',
            display: 'grid', minHeight: 700,
          }} className="grid-cols-2-mobile-1 md:grid-cols-[280px_1fr]">

            {/* Side info */}
            <div style={{
              padding: '36px 28px',
              borderRight: '1px solid rgba(246,245,242,0.08)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 44, marginBottom: 12 }}>{demo.emoji}</div>
                <h3 style={{
                  fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
                  fontSize: 26, color: 'var(--paper)', letterSpacing: '-0.03em', marginBottom: 4,
                }}>
                  {demo.nombre}
                </h3>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: demo.color, marginBottom: 14,
                }}>
                  {demo.rubro}
                </div>
                <p style={{
                  fontFamily: 'var(--f-display)', fontSize: 13,
                  color: 'rgba(246,245,242,0.4)', lineHeight: 1.6, marginBottom: 24,
                }}>
                  {demo.descripcion}
                </p>

                <div style={{
                  background: vista === 'panel' ? 'rgba(198,255,61,0.06)' : demo.color + '10',
                  border: `1px solid ${vista === 'panel' ? 'rgba(198,255,61,0.2)' : demo.color + '30'}`,
                  borderRadius: 12, padding: '12px 14px',
                }}>
                  <div style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: vista === 'panel' ? 'var(--lime)' : demo.color,
                    marginBottom: 4,
                  }}>
                    {vista === 'public' ? '👤 Vista cliente' : '🔧 Panel del dueño'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-display)', fontSize: 12,
                    color: 'rgba(246,245,242,0.4)', lineHeight: 1.5,
                  }}>
                    {vista === 'public'
                      ? 'Podés reservar de verdad. Así lo ven tus clientes.'
                      : 'Gestionás turnos, servicios y cobros en tiempo real.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                <Link href={vista === 'public' ? `/reservas/${demo.publicSlug}` : `/panel/${demo.cfgId}`} target="_blank"
                  style={{
                    display: 'block', textAlign: 'center', padding: '10px 16px', borderRadius: 10,
                    background: 'rgba(246,245,242,0.07)', border: '1px solid rgba(246,245,242,0.12)',
                    color: 'rgba(246,245,242,0.6)', textDecoration: 'none',
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                  Abrir en pantalla completa ↗
                </Link>
                <Link href="/onboarding"
                  style={{
                    display: 'block', textAlign: 'center', padding: '11px 16px', borderRadius: 10,
                    background: 'var(--lime)', color: 'var(--ink)', textDecoration: 'none',
                    fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                  Quiero uno así →
                </Link>
              </div>
            </div>

            {/* iframe area */}
            <div style={{ position: 'relative', minHeight: 700, background: 'var(--paper)', overflow: 'hidden' }}>

              {/* PIN animation overlay */}
              {showPinAnim && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'var(--paper)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
                  opacity: pinDone ? 0 : 1,
                  transition: pinDone ? 'opacity 0.5s ease' : 'none',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 40 }}>{demo.emoji}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                    {demo.nombre}
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {pinSubmitting ? 'Entrando al panel...' : 'Panel del negocio'}
                  </div>
                  {/* PIN circles */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[0,1,2,3].map(i => {
                      const filled = i < pinTyped.length
                      return (
                        <div key={i} style={{
                          width: 44, height: 52, borderRadius: 10,
                          border: `2px solid ${filled ? demo.color : 'var(--line)'}`,
                          background: filled ? demo.color + '15' : 'var(--paper-2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          transform: filled ? 'scale(1.06)' : 'scale(1)',
                          boxShadow: filled ? `0 0 12px ${demo.color}40` : 'none',
                        }}>
                          {filled && <div style={{ width: 10, height: 10, borderRadius: '50%', background: demo.color }} />}
                        </div>
                      )
                    })}
                  </div>
                  {pinSubmitting && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%', background: demo.color,
                          animation: `dotbounce 0.8s ${i * 0.15}s infinite ease-in-out`,
                        }} />
                      ))}
                    </div>
                  )}
                  <style>{`@keyframes dotbounce{0%,100%{transform:scale(0.6);opacity:0.4}50%{transform:scale(1);opacity:1}}`}</style>
                </div>
              )}

              {/* Loading placeholder */}
              {!iframeLoaded && !showPinAnim && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', gap: 12, zIndex: 1,
                }}>
                  <div style={{ fontSize: 32 }}>{demo.emoji}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Cargando demo...
                  </div>
                </div>
              )}

              <iframe
                key={iframeKey}
                src={iframeSrc}
                style={{ width: '100%', height: '100%', minHeight: 700, border: 'none', display: 'block' }}
                onLoad={() => setIframeLoaded(true)}
                title={`Demo ${demo.nombre} — ${vista}`}
              />
            </div>
          </div>
        </Reveal>

        <p style={{
          marginTop: 16, fontFamily: 'var(--f-mono)', fontSize: 10,
          color: 'rgba(246,245,242,0.2)', letterSpacing: '0.06em', textAlign: 'center',
        }}>
          Demos reales en producción · interactuá de verdad · así lo ven tus clientes
        </p>
      </div>
    </section>
  )
}
