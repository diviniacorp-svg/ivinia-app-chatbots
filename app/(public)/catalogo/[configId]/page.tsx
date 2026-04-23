'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getThemeForRubro } from '@/lib/turnero-themes'

interface Product {
  id: string
  name: string
  category?: string
  price_ars: number
  description?: string
  photo_url?: string
  stock?: number
  discount_active?: boolean
  discount_percent?: number
}

interface CatalogData {
  company_name: string
  color: string
  rubro: string
  logo_url?: string
  productos: Product[]
  configId: string
}

function fARS(n: number) {
  return '$' + n.toLocaleString('es-AR')
}

function discountedPrice(price: number, pct: number) {
  return Math.round(price * (1 - pct / 100))
}

export default function CatalogoPage() {
  const { configId } = useParams<{ configId: string }>()
  const [data, setData] = useState<CatalogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState<string>('Todos')

  useEffect(() => {
    fetch(`/api/catalog/${configId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [configId])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Cargando catálogo...
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No encontrado</div>
    </div>
  )

  const theme = getThemeForRubro(data.rubro)
  const color = data.color
  const productos = data.productos.filter(p => p.stock === undefined || p.stock > 0)

  const categories = ['Todos', ...Array.from(new Set(productos.map(p => p.category || 'General')))]
  const filtered = filterCat === 'Todos' ? productos : productos.filter(p => (p.category || 'General') === filterCat)

  const hasOferta = productos.some(p => p.discount_active && (p.discount_percent || 0) > 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--f-display)' }}>

      {/* Header */}
      <div style={{
        background: 'var(--ink)',
        padding: '28px 20px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: theme.bg,
          opacity: 0.4,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{theme.emoji}</div>
          <h1 style={{
            fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
            fontSize: 'clamp(24px, 6vw, 40px)', color: 'var(--paper)',
            letterSpacing: '-0.03em', margin: '0 0 4px',
          }}>
            {data.company_name}
          </h1>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(246,245,242,0.4)', margin: 0 }}>
            Catálogo de productos
          </p>
          {hasOferta && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 12, background: color, color: '#fff',
              borderRadius: 100, padding: '4px 14px',
              fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            }}>
              🔥 OFERTAS ACTIVAS
            </div>
          )}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 2 && (
        <div style={{ padding: '16px 16px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '6px 14px', borderRadius: 100, flexShrink: 0,
                border: filterCat === cat ? `1.5px solid ${color}` : '1.5px solid var(--line)',
                background: filterCat === cat ? color + '15' : 'transparent',
                color: filterCat === cat ? 'var(--ink)' : 'var(--muted-2)',
                fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      <div style={{ padding: '16px', display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted)' }}>Sin productos en esta categoría.</p>
          </div>
        )}
        {filtered.map(prod => {
          const hasDesc = prod.discount_active && (prod.discount_percent || 0) > 0
          const finalPrice = hasDesc ? discountedPrice(prod.price_ars, prod.discount_percent!) : prod.price_ars

          return (
            <div key={prod.id} style={{
              background: 'var(--paper)',
              border: hasDesc ? `2px solid ${color}` : '1px solid var(--line)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
              boxShadow: hasDesc ? `0 4px 20px ${color}22` : 'none',
            }}>
              {hasDesc && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 2,
                  background: color, color: '#fff', borderRadius: 100,
                  padding: '3px 10px',
                  fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                }}>
                  -{prod.discount_percent}%
                </div>
              )}

              {/* Photo */}
              <div style={{
                width: '100%', aspectRatio: '1',
                background: prod.photo_url ? 'transparent' : 'var(--paper-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {prod.photo_url ? (
                  <img
                    src={prod.photo_url}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 36 }}>{theme.emoji}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {prod.category && (
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    {prod.category}
                  </span>
                )}
                <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)', margin: 0, lineHeight: 1.3 }}>
                  {prod.name}
                </p>
                {prod.description && (
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: 'var(--muted-2)', margin: 0, lineHeight: 1.45 }}>
                    {prod.description}
                  </p>
                )}
                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  {prod.price_ars > 0 ? (
                    <div>
                      {hasDesc && (
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textDecoration: 'line-through', marginRight: 4 }}>
                          {fARS(prod.price_ars)}
                        </span>
                      )}
                      <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: hasDesc ? color : 'var(--ink)' }}>
                        {fARS(finalPrice)}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>Consultar precio</span>
                  )}
                  {prod.stock !== undefined && prod.stock <= 5 && prod.stock > 0 && (
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: '#ef4444', margin: '4px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      ⚠️ Últimas {prod.stock} unidades
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '24px 16px 40px', textAlign: 'center', borderTop: '1px solid var(--line)', marginTop: 8 }}>
        <Link
          href={`/reservas/${configId}`}
          style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: 12,
            background: color, color: '#fff', textDecoration: 'none',
            fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}
        >
          Sacar turno →
        </Link>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 16, letterSpacing: '0.06em' }}>
          Powered by <strong>divinia.</strong>
        </p>
      </div>
    </div>
  )
}
