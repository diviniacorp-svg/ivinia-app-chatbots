'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const RUBRO_EMOJIS: Record<string, string> = {
  restaurante: '🍽️', clinica: '🏥', inmobiliaria: '🏠',
  gimnasio: '💪', contabilidad: '📊', farmacia: '💊',
  peluqueria: '✂️', taller: '🔧', hotel: '🏨',
  veterinaria: '🐾', ecommerce: '🛍️', odontologia: '🦷', legal: '⚖️',
  agencia: '🚀', turismo: '✈️', consultora: '💼',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .finally(() => setLoading(false))
  }, [])

  const handleSeed = async () => {
    setLoading(true)
    await fetch('/api/seed')
    const r = await fetch('/api/templates')
    const d = await r.json()
    setTemplates(d.templates || [])
    setLoading(false)
  }

  return (
    <div style={{ padding: '32px 40px', background: 'var(--paper-2)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
            fontSize: 36, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0,
          }}>
            Templates
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, fontFamily: 'var(--f-mono)' }}>
            Plantillas de chatbot pre-configuradas por rubro
          </p>
        </div>
        <button
          onClick={handleSeed}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8,
            fontFamily: 'var(--f-mono)', fontSize: 11,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            border: 'none', background: 'var(--ink)', color: 'var(--paper)',
            cursor: 'pointer',
          }}
        >
          Cargar templates base
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{
            width: 32, height: 32,
            border: '3px solid var(--line)', borderTopColor: 'var(--ink)',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
        </div>
      ) : templates.length === 0 ? (
        <div style={{
          background: 'var(--paper)', borderRadius: 16, border: '1px dashed var(--line)',
          padding: '64px 40px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            No hay templates cargados aún.
          </p>
          <button
            onClick={handleSeed}
            style={{
              background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'var(--f-mono)', fontSize: 11,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer',
            }}
          >
            Cargar ahora
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{
                background: 'var(--paper)',
                borderRadius: 16,
                border: '1px solid var(--line)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                    background: (t.color_primary || '#6366f1') + '20',
                  }}>
                    {RUBRO_EMOJIS[t.rubro] || '🤖'}
                  </div>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--ink)',
                    background: 'var(--lime)', borderRadius: 100, padding: '3px 10px',
                  }}>
                    Activo
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14, marginBottom: 4 }}>{t.name}</h3>
                <p style={{
                  fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
                  marginBottom: 16,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                } as React.CSSProperties}>
                  {t.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>
                    ${(t.price_monthly || 50000).toLocaleString('es-AR')}/mes
                  </p>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)',
                  }}>
                    {t.trial_days || 14}d trial
                  </span>
                </div>
              </div>
              <div style={{
                borderTop: '1px solid var(--line)',
                padding: '12px 20px',
                display: 'flex', gap: 8,
              }}>
                <Link
                  href={`/templates/${t.id}`}
                  style={{
                    flex: 1, textAlign: 'center',
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--ink)',
                    background: 'var(--paper-2)', borderRadius: 8, padding: '8px 0',
                    textDecoration: 'none', border: '1px solid var(--line)',
                  }}
                >
                  Ver flujo
                </Link>
                <Link
                  href={`/clientes?template=${t.id}`}
                  style={{
                    flex: 1, textAlign: 'center',
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--paper)',
                    background: 'var(--ink)', borderRadius: 8, padding: '8px 0',
                    textDecoration: 'none',
                  }}
                >
                  Usar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
