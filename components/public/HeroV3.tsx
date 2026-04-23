'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Orb from './Orb'

const WA_BASE = 'https://wa.me/5492665286110?text='

const RUBROS = [
  {
    id: 'barberia',
    label: 'Barbería',
    emoji: '💈',
    headline: 'Tus clientes sacan turno de corte solos.',
    sub: 'Sin llamadas, sin "a qué hora podés". Reservan cuando quieren, vos solo cortás.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20una%20barber%C3%ADa%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'nails',
    label: 'Uñas',
    emoji: '💅',
    headline: 'Tus clientas reservan sus uñas solas.',
    sub: 'El Turnero cobra la seña automáticamente. Cero no-shows, cero mensajes a medianoche.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20un%20nail%20bar%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'clinica',
    label: 'Clínica',
    emoji: '🩺',
    headline: 'Tus pacientes sacan turno médico solos.',
    sub: 'Los domingos a las 11 PM también. Sin secretaria, sin teléfono ocupado.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20una%20cl%C3%ADnica%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'estetica',
    label: 'Estética',
    emoji: '✨',
    headline: 'Tus clientas reservan sus tratamientos solas.',
    sub: 'Masajes, faciales, depilación. Todo en un link, con confirmación automática por WhatsApp.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20un%20centro%20de%20est%C3%A9tica%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'veterinaria',
    label: 'Veterinaria',
    emoji: '🐾',
    headline: 'Tus pacientes reservan consulta desde el celular.',
    sub: 'Turnos para vacunas, controles y cirugías. Todo organizado sin llamadas.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20una%20veterinaria%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'gym',
    label: 'Gym',
    emoji: '💪',
    headline: 'Tus alumnos se inscriben a clases solos.',
    sub: 'Clases grupales, turnos de evaluación, cupos automáticos. Sin Excel, sin coordinación manual.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20un%20gym%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'hotel',
    label: 'Hotel',
    emoji: '🏨',
    headline: 'Tus huéspedes reservan directamente con vos.',
    sub: 'Sin Booking que se lleva la comisión. Tu propio sistema de reservas en 24hs.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20un%20hotel%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'taller',
    label: 'Taller',
    emoji: '🔧',
    headline: 'Tus clientes reservan el service solos.',
    sub: 'Turnos para revisión, cambio de aceite, reparaciones. Organizá el taller sin llamadas.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20un%20taller%20mec%C3%A1nico%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'peluqueriacanina',
    label: 'Peluquería Canina',
    emoji: '🐶',
    headline: 'Las familias reservan el baño del perro solas.',
    sub: 'Sin mensajes de "¿estás libre el sábado?". El sistema gestiona todo.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20una%20peluquer%C3%ADa%20canina%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'lavadoautos',
    label: 'Lavado',
    emoji: '🚗',
    headline: 'Tus clientes reservan su turno de lavado solos.',
    sub: 'Organizá la cola del lavadero sin atender el teléfono. Más turnos, mismo tiempo.',
    wa: 'Hola%20DIVINIA%2C%20tengo%20un%20lavadero%20y%20quiero%20el%20Turnero',
  },
  {
    id: 'otro',
    label: 'Ver todos →',
    emoji: '🏪',
    headline: 'Tus clientes reservan solos.',
    sub: 'Más de 45 rubros disponibles. Si tu negocio da turnos, lo configuramos en 24hs.',
    wa: 'Hola%20DIVINIA%2C%20quiero%20el%20Turnero%20para%20mi%20negocio',
  },
]

const INTERVAL = 3000

export default function HeroV3() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pendingIdx = useRef<number | null>(null)

  const rubroActivo = RUBROS[activeIdx]
  const waLink = WA_BASE + rubroActivo.wa

  const scrollPillIntoView = (idx: number) => {
    const container = scrollRef.current
    if (!container) return
    const pill = container.children[idx] as HTMLElement
    if (!pill) return
    const containerRect = container.getBoundingClientRect()
    const pillRect = pill.getBoundingClientRect()
    const offset = pillRect.left - containerRect.left - (containerRect.width / 2) + (pillRect.width / 2)
    container.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const selectRubro = (idx: number) => {
    pendingIdx.current = idx
    setVisible(false)
    scrollPillIntoView(idx)
  }

  useEffect(() => {
    if (!visible && pendingIdx.current !== null) {
      const t = setTimeout(() => {
        setActiveIdx(pendingIdx.current!)
        pendingIdx.current = null
        setVisible(true)
      }, 180)
      return () => clearTimeout(t)
    }
  }, [visible])

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => {
      const next = (activeIdx + 1) % (RUBROS.length - 1)
      selectRubro(next)
    }, INTERVAL)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [paused, activeIdx])

  return (
    <section style={{
      padding: '120px 0 80px',
      position: 'relative',
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <div className="wrap-v2">

        {/* ── BLOQUE CENTRAL CENTRADO ── */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>

          {/* Badge ubicación */}
          <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: 100,
              padding: '7px 18px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', display: 'inline-block' }} />
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 10,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.45)', fontWeight: 500,
              }}>
                San Luis · Cuyo · Argentina
              </span>
            </div>
          </div>

          {/* Headline principal */}
          <h1
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 700,
              fontSize: 'clamp(60px, 11vw, 148px)',
              color: 'var(--ink)',
              margin: '0 auto 28px',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
            }}
          >
            Tu negocio<br />
            funciona<br />
            <em style={{ color: 'var(--lime)' }}>solo.</em>
          </h1>

          {/* Subtítulo */}
          <p style={{
            fontFamily: 'var(--f-display)',
            fontSize: 'clamp(17px, 1.8vw, 22px)',
            color: 'rgba(0,0,0,0.45)',
            maxWidth: '48ch',
            lineHeight: 1.55,
            margin: '0 auto 40px',
          }}>
            Automatizaciones a medida para tu negocio.{' '}
            <span style={{ color: 'rgba(0,0,0,0.8)' }}>
              De noche, los domingos, sin que atiendas el teléfono.
            </span>
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--lime)', color: 'var(--ink)', borderRadius: 100,
                padding: '14px 28px', textDecoration: 'none',
                fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 700,
                letterSpacing: '-0.01em', transition: 'opacity 0.2s',
              }}
            >
              Quiero una demo gratis →
            </a>
            <a
              href="#demo"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1px solid rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.55)',
                borderRadius: 100, padding: '14px 24px', textDecoration: 'none',
                fontFamily: 'var(--f-display)', fontSize: 16, transition: 'border-color 0.2s',
              }}
            >
              Ver cómo funciona ↓
            </a>
          </div>

          {/* Trust strip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 0,
            border: '1px solid rgba(0,0,0,0.1)', borderRadius: 100,
            overflow: 'hidden',
          }}>
            {[
              { val: '24hs', label: 'setup' },
              { val: '$0', label: 'costo oculto' },
              { val: '+45', label: 'rubros' },
              { val: 'sin', label: 'permanencia' },
            ].map((s, i, arr) => (
              <div key={s.val} style={{
                display: 'flex', alignItems: 'baseline', gap: 5,
                padding: '9px 20px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
              }}>
                <span style={{
                  fontFamily: 'var(--f-display)', fontWeight: 700,
                  fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.03em',
                }}>{s.val}</span>
                <span style={{
                  fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'rgba(0,0,0,0.35)',
                }}>{s.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* ── SEPARADOR ── */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginBottom: 48 }} />

        {/* Selector de rubro */}
        <div style={{ marginBottom: 48 }}>
          <span style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.35)',
            display: 'block',
            marginBottom: 14,
          }}>
            Mi negocio es:
          </span>
          <div
            ref={scrollRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}
          >
            {RUBROS.map((r, idx) =>
              r.id === 'otro' ? (
                <Link key={r.id} href="/rubros" style={{
                  padding: '8px 16px', borderRadius: 100,
                  border: '1.5px solid var(--ink)',
                  background: 'transparent', color: 'var(--ink)',
                  fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  textDecoration: 'none', flexShrink: 0,
                }}>
                  <span>{r.emoji}</span><span>{r.label}</span>
                </Link>
              ) : (
                <button key={r.id} onClick={() => { selectRubro(idx); setPaused(true) }} style={{
                  padding: '8px 16px', borderRadius: 100,
                  border: activeIdx === idx ? '1.5px solid var(--lime)' : '1.5px solid rgba(0,0,0,0.12)',
                  background: activeIdx === idx ? 'var(--lime)' : 'transparent',
                  color: activeIdx === idx ? 'var(--ink)' : 'rgba(0,0,0,0.5)',
                  fontFamily: 'var(--f-display)', fontSize: 13,
                  fontWeight: activeIdx === idx ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  flexShrink: 0, position: 'relative', overflow: 'hidden',
                }}>
                  {activeIdx === idx && !paused && (
                    <span style={{
                      position: 'absolute', bottom: 0, left: 0, height: 2,
                      background: 'var(--lime)',
                      animation: `pillProgress ${INTERVAL}ms linear`,
                      animationFillMode: 'forwards',
                    }} />
                  )}
                  <span>{r.emoji}</span><span>{r.label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Grid — copy dinámico + price card */}
        <div style={{ display: 'grid', gap: 60, alignItems: 'center' }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1.5fr_1fr]">

          {/* Left: headline rubro-específico */}
          <div>
            <h2
              className="h-display"
              style={{
                fontSize: 'clamp(32px, 4.5vw, 62px)',
                marginBottom: 18,
                color: 'var(--ink)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
              }}
            >
              {rubroActivo.headline.split(' ').map((word, i, arr) =>
                i === arr.length - 1
                  ? <em key={i} style={{ color: 'var(--lime)' }}> {word}</em>
                  : <span key={i}>{i === 0 ? '' : ' '}{word}</span>
              )}
            </h2>

            <p style={{
              fontSize: 17, lineHeight: 1.6,
              color: 'rgba(0,0,0,0.45)',
              marginBottom: 32, maxWidth: '44ch',
              fontFamily: 'var(--f-display)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.25s ease 0.04s, transform 0.25s ease 0.04s',
            }}>
              {rubroActivo.sub}
            </p>

            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(0,0,0,0.15)', borderRadius: 100,
              padding: '10px 20px', textDecoration: 'none',
              fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.55)', transition: 'border-color 0.2s, color 0.2s',
            }}>
              ⚡ Quiero esto para mi {rubroActivo.label.toLowerCase()} →
            </a>
          </div>

          {/* Right: price card */}
          <div style={{ position: 'relative', height: 340 }} className="hidden md:block">
            <Orb
              size={360}
              color="#C6FF3D"
              colorDeep="#9EE028"
              shade="rgba(12,80,0,0.3)"
              float
              squash
              style={{ position: 'absolute', right: -40, top: 0 }}
            />
            <div style={{
              position: 'absolute', right: 0, top: 40,
              background: 'var(--ink)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '24px 28px', width: 210, zIndex: 2,
            }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(246,245,242,0.35)', marginBottom: 8 }}>
                Desde
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--lime)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>
                $45k
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(246,245,242,0.3)', letterSpacing: '0.06em', marginBottom: 16 }}>
                / mes · sin permanencia
              </div>
              <div style={{ borderTop: '1px solid rgba(246,245,242,0.08)', paddingTop: 14, fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(246,245,242,0.45)', lineHeight: 1.6 }}>
                ✓ Activo en 24 horas<br />
                ✓ QR para el local<br />
                ✓ Confirma por WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pillProgress { from { width: 0%; } to { width: 100%; } }
        div[style*="scrollbar-width: none"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
