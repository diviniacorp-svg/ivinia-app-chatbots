'use client'
import { useState } from 'react'
import Link from 'next/link'

const BLUE = '#2563EB'
const INK = '#09090B'
const PAPER = '#F6F5F2'
const WA = 'https://wa.me/5492665286110'

interface Service {
  id: string
  category: string
  name: string
  description: string
  duration_minutes: number
  price_ars: number
  deposit_percentage: number
}

interface Props {
  data: {
    config: Record<string, string>
    services: Service[]
  } | null
}

function formatARS(n: number) {
  if (!n || n === 0) return 'Consultar'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0,
  }).format(n)
}

const WHOLESALE_DISCOUNT = 0.82 // 18% off for mayoristas

const CATEGORIES_ORDER = [
  'Pantallas', 'Batería', 'Conectores', 'Cámara', 'Datos & Software', 'Mantenimiento'
]

const CAT_ICONS: Record<string, string> = {
  'Pantallas': '📱',
  'Batería': '🔋',
  'Conectores': '🔌',
  'Cámara': '📷',
  'Datos & Software': '💾',
  'Mantenimiento': '🔧',
}

export default function CelulabClient({ data }: Props) {
  const [mode, setMode] = useState<'publico' | 'mayorista'>('publico')
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const PIN_MAYORISTA = '2050'

  function handlePinSubmit() {
    if (pinInput === PIN_MAYORISTA) {
      setMode('mayorista')
      setPinOpen(false)
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  const services: Service[] = data?.services ?? DEMO_SERVICES
  const grouped = CATEGORIES_ORDER.reduce<Record<string, Service[]>>((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat)
    return acc
  }, {})

  const displayPrice = (price: number) =>
    mode === 'mayorista'
      ? formatARS(Math.round(price * WHOLESALE_DISCOUNT))
      : formatARS(price)

  return (
    <div style={{ background: INK, color: PAPER, minHeight: '100vh', fontFamily: 'var(--f-display, system-ui)' }}>

      {/* Header */}
      <header style={{
        background: INK,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: BLUE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            📱
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>CeluLab</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Lista oficial de precios
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 4 }}>
          <button
            onClick={() => setMode('publico')}
            style={{
              background: mode === 'publico' ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: 'none', borderRadius: 6,
              padding: '6px 14px',
              color: mode === 'publico' ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Público
          </button>
          <button
            onClick={() => mode === 'mayorista' ? setMode('publico') : setPinOpen(true)}
            style={{
              background: mode === 'mayorista' ? BLUE : 'transparent',
              border: 'none', borderRadius: 6,
              padding: '6px 14px',
              color: mode === 'mayorista' ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            {mode === 'mayorista' ? '✓ Mayorista' : 'Mayorista'}
          </button>
        </div>
      </header>

      {/* PIN modal */}
      {pinOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: '#111', borderRadius: 20, padding: 32,
            width: '100%', maxWidth: 360,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 16 }}>🔐</div>
            <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              Acceso Mayorista
            </h2>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              Ingresá tu PIN para ver los precios mayoristas
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(false) }}
              onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              placeholder="PIN"
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${pinError ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 10, color: '#fff',
                fontSize: 16, textAlign: 'center', letterSpacing: '0.3em',
                outline: 'none', boxSizing: 'border-box',
              }}
              autoFocus
            />
            {pinError && (
              <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                PIN incorrecto
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => { setPinOpen(false); setPinInput(''); setPinError(false) }}
                style={{
                  flex: 1, padding: 12, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handlePinSubmit}
                style={{
                  flex: 1, padding: 12, borderRadius: 8,
                  background: BLUE, border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Ingresar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner mayorista */}
      {mode === 'mayorista' && (
        <div style={{
          background: `${BLUE}22`, borderBottom: `1px solid ${BLUE}40`,
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'rgba(255,255,255,0.7)',
        }}>
          <span style={{ color: BLUE, fontWeight: 700 }}>✓ Modo Mayorista</span>
          <span>— Precios con 18% de descuento aplicado</span>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* Info strip */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 12,
          padding: '14px 16px', marginBottom: 24,
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          {[
            { label: 'San Luis Capital', icon: '📍' },
            { label: 'Lun–Vie 9 a 18 · Sáb 9 a 13', icon: '⏰' },
            { label: 'Garantía en todas las reparaciones', icon: '✅' },
            { label: data?.config?.whatsapp ? `+${data.config.whatsapp}` : '+54 9 266 5286110', icon: '📞' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Category nav */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 24 }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              background: activeCategory === null ? BLUE : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 20, padding: '6px 14px',
              color: activeCategory === null ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Todo
          </button>
          {CATEGORIES_ORDER.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              style={{
                background: activeCategory === cat ? BLUE : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 20, padding: '6px 14px',
                color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Service list by category */}
        {CATEGORIES_ORDER.filter(cat => !activeCategory || cat === activeCategory).map(cat => {
          const items = grouped[cat]
          if (!items || items.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 16 }}>{CAT_ICONS[cat]}</span>
                <h2 style={{ fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  {cat}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(svc => (
                  <div
                    key={svc.id}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 2 }}>
                        {svc.name}
                      </div>
                      {svc.description && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                          {svc.description}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
                        ⏱ {svc.duration_minutes} min
                        {svc.deposit_percentage > 0 && ` · ${svc.deposit_percentage}% de seña`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 16,
                        color: mode === 'mayorista' ? '#60A5FA' : PAPER,
                        letterSpacing: '-0.02em',
                      }}>
                        {displayPrice(svc.price_ars)}
                      </div>
                      {mode === 'mayorista' && svc.price_ars > 0 && (
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                          {formatARS(svc.price_ars)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Updated timestamp */}
        <p style={{
          textAlign: 'center', fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
          marginTop: 40,
          letterSpacing: '0.06em',
        }}>
          Precios actualizados · Consultar disponibilidad de repuesto antes del turno
        </p>
      </div>

      {/* Float CTA */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
      }}>
        <a
          href={`${WA}?text=${encodeURIComponent('Hola, quiero consultar un precio / reservar un servicio técnico en CeluLab')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#25D366', color: '#fff',
            borderRadius: 50, padding: '14px 24px',
            fontWeight: 700, fontSize: 13,
            textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(37,211,102,0.4)',
          }}
        >
          <span style={{ fontSize: 18 }}>💬</span>
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  )
}

/* Fallback demo data if DB isn't available */
const DEMO_SERVICES: Service[] = [
  { id: '1', category: 'Pantallas', name: 'Cambio de pantalla iPhone (11 a 13)', description: 'Original o calidad OEM, con garantía 90 días', duration_minutes: 60, price_ars: 75000, deposit_percentage: 30 },
  { id: '2', category: 'Pantallas', name: 'Cambio de pantalla iPhone (14 a 16)', description: 'Original o calidad OEM, con garantía 90 días', duration_minutes: 60, price_ars: 110000, deposit_percentage: 30 },
  { id: '3', category: 'Pantallas', name: 'Cambio de pantalla Samsung A-series', description: 'Pantalla original, cubre A14 a A55', duration_minutes: 60, price_ars: 55000, deposit_percentage: 30 },
  { id: '4', category: 'Batería', name: 'Cambio de batería iPhone', description: 'Batería nueva con ciclos completos, garantía 6 meses', duration_minutes: 45, price_ars: 32000, deposit_percentage: 0 },
  { id: '5', category: 'Batería', name: 'Cambio de batería Android', description: 'Compatible con Samsung, Motorola, Xiaomi', duration_minutes: 45, price_ars: 25000, deposit_percentage: 0 },
  { id: '6', category: 'Conectores', name: 'Reparación puerto de carga iPhone', description: 'Lightning o USB-C según modelo', duration_minutes: 60, price_ars: 28000, deposit_percentage: 0 },
  { id: '7', category: 'Mantenimiento', name: 'Limpieza interna y diagnóstico', description: 'Limpieza de placa, conectores y altavoces + informe', duration_minutes: 45, price_ars: 12000, deposit_percentage: 0 },
]
