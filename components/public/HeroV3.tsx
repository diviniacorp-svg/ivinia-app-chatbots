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

const STATS = [
  { val: '24hs', label: 'Setup', desc: 'Tu turnero activo mañana' },
  { val: '$0', label: 'Costo por llamada', desc: 'Sin telefonistas, sin recepción' },
  { val: '90d', label: 'Garantía', desc: 'O te devolvemos la plata' },
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
      padding: '140px 0 80px',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--paper)',
    }}>
      <div className="wrap-v2">

        {/* Selector de rubro */}
        <div style={{ marginBottom: 48 }}>
          <span style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            display: 'block',
            marginBottom: 12,
          }}>
            Mi negocio es:
          </span>
          <div
            ref={scrollRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
            }}
          >
          {RUBROS.map((r, idx) =>
            r.id === 'otro' ? (
              <Link
                key={r.id}
                href="/rubros"
                style={{
                  padding: '7px 16px',
                  borderRadius: 100,
                  border: '1.5px solid var(--lime)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </Link>
            ) : (
              <button
                key={r.id}
                onClick={() => { selectRubro(idx); setPaused(true) }}
                style={{
                  padding: '7px 16px',
                  borderRadius: 100,
                  border: activeIdx === idx ? '1.5px solid var(--ink)' : '1.5px solid var(--line)',
                  background: activeIdx === idx ? 'var(--ink)' : 'transparent',
                  color: activeIdx === idx ? 'var(--paper)' : 'var(--muted-2)',
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  fontWeight: activeIdx === idx ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Progress bar on active pill */}
                {activeIdx === idx && !paused && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    background: 'var(--lime)',
                    animation: `pillProgress ${INTERVAL}ms linear`,
                    animationFillMode: 'forwards',
                  }} />
                )}
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            )
          )}
          </div>
        </div>

        {/* Grid hero */}
        <div style={{ display: 'grid', gap: 60, alignItems: 'center' }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1.5fr_1fr]">

          {/* Left: copy dinámico */}
          <div>
            <h1
              className="h-display"
              style={{
                fontSize: 'clamp(44px, 8vw, 120px)',
                marginBottom: 28,
                color: 'var(--ink)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
              }}
            >
              {rubroActivo.headline.split(' ').map((word, i, arr) =>
                i === arr.length - 1
                  ? <em key={i}> {word}</em>
                  : <span key={i}>{i === 0 ? '' : ' '}{word}</span>
              )}
            </h1>

            <p
              style={{
                fontSize: 19,
                lineHeight: 1.5,
                color: 'var(--muted-2)',
                marginBottom: 40,
                maxWidth: '46ch',
                fontFamily: 'var(--f-display)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.25s ease 0.04s, transform 0.25s ease 0.04s',
              }}
            >
              {rubroActivo.sub}
            </p>

            {/* Garantía badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(198,255,61,0.12)',
              border: '1px solid rgba(198,255,61,0.3)',
              borderRadius: 100,
              padding: '6px 14px',
              marginBottom: 32,
            }}>
              <span style={{ fontSize: 14 }}>🛡️</span>
              <span style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
              }}>
                90 días de garantía o devolvemos la plata
              </span>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-v2 btn-ink"
                style={{ fontSize: 16, padding: '15px 22px 15px 26px' }}
              >
                Quiero el Turnero
                <span className="btn-arrow">→</span>
              </a>
              <a
                href="#demo"
                className="btn-v2 btn-ghost-v2"
                style={{ fontSize: 16 }}
              >
                Ver cómo funciona ↓
              </a>
            </div>

            {/* Stats inline */}
            <div style={{
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
              paddingTop: 28,
              borderTop: '1px solid var(--line)',
            }}>
              {STATS.map(s => (
                <div key={s.val}>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    color: 'var(--ink)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}>
                    {s.val}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--lime)',
                    marginTop: 4,
                    marginBottom: 2,
                  }}>
                    {s.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 12,
                    color: 'var(--muted)',
                  }}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: orb + precio visible */}
          <div style={{ position: 'relative', height: 480 }} className="hidden md:block">
            <Orb
              size={420}
              color="#C6FF3D"
              colorDeep="#9EE028"
              shade="rgba(12,80,0,0.5)"
              float
              squash
              style={{ position: 'absolute', right: -40, top: 20 }}
            />
            {/* Precio card flotando sobre el orb */}
            <div style={{
              position: 'absolute',
              right: 0,
              top: 60,
              background: 'var(--ink)',
              borderRadius: 20,
              padding: '24px 28px',
              width: 200,
              zIndex: 2,
              boxShadow: '0 20px 60px rgba(14,14,14,0.3)',
            }}>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(246,245,242,0.4)',
                marginBottom: 8,
              }}>
                Turnero · Plan mensual
              </div>
              <div style={{
                fontFamily: 'var(--f-display)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 36,
                color: 'var(--lime)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: 4,
              }}>
                $45k
              </div>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                color: 'rgba(246,245,242,0.4)',
                letterSpacing: '0.06em',
              }}>
                / mes · sin permanencia
              </div>
              <div style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid rgba(246,245,242,0.1)',
                fontFamily: 'var(--f-display)',
                fontSize: 12,
                color: 'rgba(246,245,242,0.55)',
                lineHeight: 1.5,
              }}>
                ✓ Reservas online 24hs<br />
                ✓ QR para el local<br />
                ✓ Confirma por WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pillProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        div[style*="scrollbar-width: none"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
