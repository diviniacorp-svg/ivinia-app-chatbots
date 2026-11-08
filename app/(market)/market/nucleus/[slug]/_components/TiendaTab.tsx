'use client'
import TechnicianPin from '../../../celulab/tienda/_components/TechnicianPin'
import { useState, useEffect } from 'react'

type Markup = { category: string; markup_pct: number }
type OfferProduct = {
  id: string; name: string; category: string; brand: string
  price_ars: number; final_price: number; image_url: string | null
  is_offer: boolean; offer_label: string | null
}

export function TiendaTab({ color }: { color: string }) {
  const [tab, setTab] = useState<'markup' | 'ofertas'>('markup')
  const [markups, setMarkups] = useState<Markup[]>([])
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  // Offers
  const [offers, setOffers] = useState<OfferProduct[]>([])
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<OfferProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [offerLabel, setOfferLabel] = useState('')

  // Auto-offers
  const [autoThreshold, setAutoThreshold] = useState(3000)
  const [autoLabel, setAutoLabel] = useState('PROMO')
  const [autoRunning, setAutoRunning] = useState(false)
  const [autoResult, setAutoResult] = useState('')

  useEffect(() => {
    fetch('/api/celulab/product-markups').then(r => r.json()).then(setMarkups).catch(() => {})
    fetch('/api/celulab/products?offers=1&limit=50&stock=all').then(r => r.json())
      .then(d => setOffers(d.items ?? [])).catch(() => {})
  }, [])

  async function saveMarkup(category: string) {
    const val = editing[category]
    if (val == null) return
    setSaving(category)
    await fetch('/api/celulab/product-markups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, markup_pct: parseFloat(val) || 0 }),
    })
    setMarkups(prev => prev.map(m => m.category === category ? { ...m, markup_pct: parseFloat(val) || 0 } : m))
    setEditing(prev => { const n = { ...prev }; delete n[category]; return n })
    setSaving(null)
  }

  async function searchProducts(q: string) {
    if (q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    const res = await fetch(`/api/celulab/products?q=${encodeURIComponent(q)}&limit=20&stock=all`).then(r => r.json())
    setSearchResults(res.items ?? [])
    setSearching(false)
  }

  async function runAutoOffers() {
    setAutoRunning(true)
    setAutoResult('')
    const res = await fetch('/api/celulab/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'auto_offers', max_price: autoThreshold, label: autoLabel || 'PROMO' }),
    }).then(r => r.json())
    setAutoRunning(false)
    if (res.ok) {
      setAutoResult(`✓ ${res.marked} productos marcados como oferta`)
      // Reload offers list
      fetch('/api/celulab/products?offers=1&limit=50&stock=all').then(r => r.json())
        .then(d => setOffers(d.items ?? [])).catch(() => {})
    } else {
      setAutoResult(`Error: ${res.error}`)
    }
  }

  async function toggleOffer(product: OfferProduct, enable: boolean) {
    await fetch('/api/celulab/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id, is_offer: enable, offer_label: enable ? (offerLabel || null) : null }),
    })
    if (enable) {
      setOffers(prev => [...prev.filter(o => o.id !== product.id), { ...product, is_offer: true, offer_label: offerLabel || null }])
      setSearchResults(prev => prev.filter(p => p.id !== product.id))
    } else {
      setOffers(prev => prev.filter(o => o.id !== product.id))
    }
    setOfferLabel('')
  }

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

  return (
    <div>
      <details><summary>Acceso de técnicos</summary><TechnicianPin manage /></details>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        {([['markup', '💲 Markup por categoría'], ['ofertas', '🔥 Ofertas']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            borderBottom: tab === t ? `2px solid ${color}` : '2px solid transparent',
            color: tab === t ? color : '#6b7280', background: 'transparent',
          }}>{label}</button>
        ))}
      </div>

      {/* ── MARKUP ── */}
      {tab === 'markup' && (
        <div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            El markup se aplica sobre el precio de costo de Only al precio que ve el cliente en la tienda.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Categoría', 'Markup %', 'Ej: costo $10.000 → precio cliente', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {markups.map(m => {
                const isEditing = editing[m.category] != null
                const pct = isEditing ? parseFloat(editing[m.category]) || 0 : m.markup_pct
                const example = Math.round(10000 * (1 + pct / 100))
                return (
                  <tr key={m.category} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111' }}>{m.category}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {isEditing ? (
                        <input
                          type="number" min={0} max={500} step={5}
                          value={editing[m.category]}
                          onChange={e => setEditing(prev => ({ ...prev, [m.category]: e.target.value }))}
                          style={{ width: 70, padding: '4px 8px', border: `1px solid ${color}`, borderRadius: 6, fontSize: 13, fontWeight: 700 }}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontWeight: 700, color: m.markup_pct > 0 ? '#16a34a' : '#9ca3af' }}>
                          {m.markup_pct > 0 ? `+${m.markup_pct}%` : '0% (sin markup)'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>
                      <span style={{ color: '#9ca3af', marginRight: 4 }}>$10.000 →</span>
                      <strong>{fmt(example)}</strong>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => saveMarkup(m.category)} disabled={saving === m.category}
                            style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                            {saving === m.category ? '...' : 'Guardar'}
                          </button>
                          <button onClick={() => setEditing(prev => { const n = { ...prev }; delete n[m.category]; return n })}
                            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setEditing(prev => ({ ...prev, [m.category]: String(m.markup_pct) }))}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151' }}>
                          ✏️ Editar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── OFERTAS ── */}
      {tab === 'ofertas' && (
        <div>
          {/* Auto-offers por precio */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#166534', marginBottom: 12 }}>⚡ Marcar productos baratos como oferta</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 11, color: '#374151', marginBottom: 4 }}>Precio máximo (costo ARS)</div>
                <input type="number" min={0} step={500} value={autoThreshold}
                  onChange={e => setAutoThreshold(Number(e.target.value))}
                  style={{ width: 120, padding: '8px 10px', borderRadius: 8, border: '1px solid #86efac', fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#374151', marginBottom: 4 }}>Etiqueta</div>
                <input value={autoLabel} onChange={e => setAutoLabel(e.target.value)} placeholder="PROMO"
                  style={{ width: 110, padding: '8px 10px', borderRadius: 8, border: '1px solid #86efac', fontSize: 13 }} />
              </div>
              <button onClick={runAutoOffers} disabled={autoRunning}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {autoRunning ? '...' : '⚡ Marcar'}
              </button>
            </div>
            {autoResult && <div style={{ marginTop: 10, fontSize: 13, color: '#166534', fontWeight: 600 }}>{autoResult}</div>}
          </div>

          {/* Buscador para agregar ofertas */}
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#9a3412', marginBottom: 12 }}>🔥 Agregar producto a ofertas</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                placeholder="Buscar producto por nombre..."
                value={searchQ}
                onChange={e => { setSearchQ(e.target.value); searchProducts(e.target.value) }}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #fed7aa', fontSize: 13 }}
              />
              <input
                placeholder="Etiqueta (ej: 20% OFF)"
                value={offerLabel}
                onChange={e => setOfferLabel(e.target.value)}
                style={{ width: 160, padding: '8px 12px', borderRadius: 8, border: '1px solid #fed7aa', fontSize: 13 }}
              />
            </div>
            {searching && <div style={{ fontSize: 12, color: '#9ca3af' }}>Buscando...</div>}
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {searchResults.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.category} · {fmt(p.final_price ?? p.price_ars)}</div>
                    </div>
                    <button onClick={() => toggleOffer(p, true)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#ea580c', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                      + Oferta
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista actual de ofertas */}
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 12 }}>
            Ofertas activas ({offers.length})
          </div>
          {offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: 13 }}>
              No hay ofertas activas. Buscá un producto arriba para agregar.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {offers.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: '#f3f4f6', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {p.category} · {fmt(p.final_price ?? p.price_ars)}
                      {p.offer_label && <span style={{ marginLeft: 8, background: '#ea580c', color: '#fff', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontWeight: 700 }}>{p.offer_label}</span>}
                    </div>
                  </div>
                  <button onClick={() => toggleOffer(p, false)}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}