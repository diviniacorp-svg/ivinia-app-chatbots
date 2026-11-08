'use client'
import TechnicianPin from './TechnicianPin'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: string; name: string; category: string; brand: string
  price_ars: number; final_price: number; markup_pct: number
  in_stock: boolean; image_url: string | null
  is_offer: boolean; offer_label: string | null
}

type CartItem = {
  id: string; name: string; price_ars: number; qty: number; image_url: string | null
}

type Category = { name: string; count: number }

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_ICONS: Record<string, string> = {
  'Auriculares': '🎧', 'Cargadores': '⚡', 'Cables': '🔌',
  'Fundas y carcasas': '📱', 'Protectores de pantalla': '🛡',
  'Smartwatches': '⌚', 'Smartbands': '💪', 'Power banks': '🔋',
  'Parlantes': '🔊', 'Tablets': '📟', 'Almacenamiento': '💾',
  'Soportes': '🔭', 'Fotografía': '📸', 'Gaming': '🎮',
  'Electrodomésticos': '🏠', 'Periféricos': '🖱️', 'Herramientas': '🔧', 'Otros': '📦',
}

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

const CART_KEY = 'celulab-cart'

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function TiendaClient() {
  const [showPin, setShowPin] = useState(false)
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [section, setSection] = useState<'accessories' | 'technical'>('accessories')
  const [loadError, setLoadError] = useState('')
  const requestSequence = useRef(0)
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [q, setQ] = useState('')
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState('')
  const LIMIT = 80

  const [offersOnly, setOffersOnly] = useState(false)
  const [offerItems, setOfferItems] = useState<Product[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<{ order_number: string; total: number; client_name: string; metodo_pago: string } | null>(null)

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) setCart(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  function saveCart(newCart: CartItem[]) {
    setCart(newCart)
    try { localStorage.setItem(CART_KEY, JSON.stringify(newCart)) } catch { /* ignore */ }
  }

  function addToCart(product: Product) {
    const price = product.final_price ?? product.price_ars
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      const next = existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { id: product.id, name: product.name, price_ars: price, qty: 1, image_url: product.image_url }]
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    setCartOpen(true)
  }

  function removeFromCart(id: string) {
    saveCart(cart.filter(i => i.id !== id))
  }

  function updateQty(id: string, delta: number) {
    const next = cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    saveCart(next)
  }

  function clearCart() {
    saveCart([])
    setCartOpen(false)
    setCheckoutOpen(false)
  }

  const cartTotal = cart.reduce((s, i) => s + i.price_ars * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const fetchItems = useCallback(async (cat: string, br: string, search: string, off: number, offers = false) => {
    const sequence = ++requestSequence.current
    setLoading(true)
    setLoadError('')
    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off), section })
    if (cat) params.set('category', cat)
    if (br) params.set('brand', br)
    if (search) params.set('q', search)
    if (offers) params.set('offers', '1')
    try {
      const response = await fetch(`/api/celulab/storefront?${params}`)
      if (!response.ok) throw new Error('catalogue')
      const res = await response.json()
      if (sequence !== requestSequence.current) return
      setItems(res.items ?? [])
      setTotal(res.total ?? 0)
      setCategories(res.categories ?? [])
      setBrands(res.brands ?? [])
      setLastSync(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
    } catch {
      if (sequence === requestSequence.current) { setItems([]); setLoadError('No pudimos cargar los productos. Volvé a intentar.') }
    } finally { if (sequence === requestSequence.current) setLoading(false) }
  }, [section])

  // Load initial offers banner separately
  useEffect(() => {
    const controller = new AbortController()
    setOfferItems([])
    fetch(`/api/celulab/storefront?offers=1&limit=20&section=${section}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : { items: [] })
      .then(data => { if (!controller.signal.aborted) setOfferItems(data.items ?? []) })
      .catch(() => {})
    return () => controller.abort()
  }, [section])

  useEffect(() => {
    setOffset(0); setBrand('')
    fetchItems(category, '', q, 0, offersOnly)
  }, [category, offersOnly, fetchItems]) // eslint-disable-line react-hooks/exhaustive-deps

  const searchRef = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => () => {
    if (searchRef.current) clearTimeout(searchRef.current)
  }, [section, category, brand, offersOnly])

  function handleSearch(val: string) {
    setQ(val)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => { setOffset(0); fetchItems(category, brand, val, 0, offersOnly) }, 350)
  }

  const isEmpty = !loading && items.length === 0

  if (confirmedOrder) {
    return (
      <OrderConfirmation
        order={confirmedOrder}
        onDone={() => { setConfirmedOrder(null); clearCart() }}
      />
    )
  }

  const closeSidebar = () => setSidebarOpen(false)

  // Sidebar content — shared between desktop panel and mobile drawer
  const sidebarContent = (
    <>
      {offerItems.length > 0 && (
        <button onClick={() => { setOffersOnly(true); setCategory(''); setBrand(''); setOffset(0); closeSidebar() }}
          style={{ width: '100%', textAlign: 'left', padding: '11px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: '#fff7ed', color: offersOnly ? '#c2410c' : '#ea580c', borderBottom: '2px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔥 OFERTAS</span>
          <span style={{ fontSize: 10, background: '#ea580c', color: '#fff', borderRadius: 8, padding: '2px 6px', fontWeight: 800 }}>{offerItems.length}</span>
        </button>
      )}
      <button onClick={() => { if (section === 'accessories') { setShowPin(!showPin); return }; setSection(section === 'accessories' ? 'technical' : 'accessories'); setCategory(''); setBrand(''); setQ(''); setOffersOnly(false); closeSidebar() }}
        style={{ width: '100%', padding: 14, border: 0, background: '#ecfdf5', color: '#065f46', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
        {section === 'accessories' ? '🔧 Solo para técnicos →' : '← Volver a accesorios'}
      </button>
      {showPin && <TechnicianPin onSuccess={() => { setShowPin(false); setSection(section === 'accessories' ? 'technical' : 'accessories'); setCategory(''); setBrand(''); setQ(''); setOffersOnly(false); closeSidebar() }} />}
      <div style={{ background: '#0f172a', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Categorías</div>
      <button onClick={() => { setOffersOnly(false); setCategory(''); setBrand(''); setOffset(0); fetchItems('', '', q, 0); closeSidebar() }}
        style={{ width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: !offersOnly && category === '' ? '#eff6ff' : '#fff', color: !offersOnly && category === '' ? '#1d4ed8' : '#374151', borderBottom: '1px solid #f3f4f6' }}>
        {section === 'technical' ? '🔧 Todo para técnicos' : '🛒 Todos los accesorios'} ({categories.reduce((s, c) => s + c.count, 0)})
      </button>
      {categories.map(cat => (
        <button key={cat.name} onClick={() => { setOffersOnly(false); setCategory(cat.name); setBrand(''); setOffset(0); closeSidebar() }}
          style={{ width: '100%', textAlign: 'left', padding: '9px 16px', border: 'none', cursor: 'pointer', fontSize: 13, background: !offersOnly && category === cat.name ? '#eff6ff' : '#fff', color: !offersOnly && category === cat.name ? '#1d4ed8' : '#6b7280', borderBottom: '1px solid #f3f4f6', fontWeight: !offersOnly && category === cat.name ? 700 : 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{CAT_ICONS[cat.name] || '📦'} {cat.name}</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{cat.count}</span>
        </button>
      ))}
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>

      {/* CSS responsive — media queries sin depender de JS/isMobile para layout */}
      <style>{`
        @media (max-width: 767px) {
          .cl-t-grid { width: 100%; box-sizing: border-box; grid-template-columns: 1fr !important; padding: 12px 8px !important; gap: 0 !important; }
          .cl-t-mobile-select { display: block !important; }
          .cl-t-grid > * { min-width: 0; max-width: 100%; }
          .cl-t-products > * { min-width: 0; }
          .cl-t-brands { max-width: 100%; overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; }
          .cl-t-search { flex-wrap: wrap; }
          .cl-t-search input { flex-basis: 100% !important; font-size: 16px !important; }
          .cl-t-sidebar-desk { display: none !important; }
          .cl-t-filter-btn { display: flex !important; }
          .cl-t-products { grid-template-columns: repeat(2,minmax(0,1fr)) !important; gap: 10px !important; }
          .cl-t-hback { display: none !important; }
          .cl-t-hsync { display: none !important; }
          .cl-t-hcart-label { display: none !important; }
          .cl-t-htitle { font-size: 15px !important; }
          .cl-t-header { padding: 0 12px !important; }
          .cl-t-mobile-drawer { display: block !important; }
        }
        @media (min-width: 768px) {
          .cl-t-mobile-drawer { display: none !important; }
          .cl-t-filter-btn { display: none !important; }
        }
        button, input { touch-action: manipulation; }
        button:focus-visible, input:focus-visible { outline: 3px solid #38bdf8; outline-offset: 2px; }
        .cl-t-products button { min-height: 44px; }
        .cl-t-brands::-webkit-scrollbar { display: none; }
        .cl-t-brands { scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="cl-t-header" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '0 20px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span className="cl-t-hback" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <a href="/market/celulab" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>← CeluLab</a>
              <span style={{ color: '#334155', fontSize: 18, margin: '0 2px' }}>|</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🛒</span>
              <span className="cl-t-htitle" style={{ fontWeight: 900, color: '#fff', fontSize: 18, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Tienda CeluLab</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span className="cl-t-hsync" style={{ fontSize: 12, color: '#64748b' }}>{lastSync ? `Act. ${lastSync}` : ''}</span>
            <button onClick={() => setCartOpen(true)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: 'none', background: cartCount > 0 ? '#2563eb' : '#1e293b', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'background .15s' }}>
              🛒<span className="cl-t-hcart-label"> Carrito</span>
              {cartCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar — always in DOM, toggled via left offset; hidden on desktop via CSS */}
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30 }} onClick={closeSidebar} />}
      <div className="cl-t-mobile-drawer" style={{ position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-100%', bottom: 0, width: '82%', maxWidth: 300, zIndex: 40, transition: 'left .25s ease', overflowY: 'auto', background: '#fff', boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.18)' : 'none' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0f172a', borderBottom: '1px solid #1e3a5f' }}>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>🔍 Categorías</span>
          <button onClick={closeSidebar} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        {sidebarContent}
      </div>

      {/* Main grid — sidebar hidden via CSS on mobile, no JS-dependent columns */}
      <div className="cl-t-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>

        {/* Desktop sidebar */}
        <div className="cl-t-sidebar-desk">
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 62 }}>
            {sidebarContent}
          </div>
        </div>

        {/* Main */}
        <div style={{ minWidth: 0 }}>
          <section style={{ background: 'linear-gradient(120deg,#e0f2fe,#ecfdf5)', borderRadius: 20, padding: '24px 20px', marginBottom: 16 }}>
            <p style={{ color: '#047857', fontWeight: 700, fontSize: 12, margin: '0 0 8px' }}>CELULAB · TIENDA</p>
            <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', margin: '0 0 8px', color: '#0f172a', letterSpacing: '-.04em' }}>{section === 'technical' ? 'Solo para técnicos' : 'Accesorios para tu día a día'}</h1>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>{section === 'technical' ? 'Herramientas y repuestos para reparaciones.' : 'Encontrá lo que necesitás, armá tu carrito y enviá tu pedido.'}</p>
          </section>
          {loadError && <div role="alert" style={{ padding: 16, background: '#fff1f2', marginBottom: 12 }}>{loadError} <button onClick={() => fetchItems(category, brand, q, offset, offersOnly)}>Reintentar</button></div>}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            <div className="cl-t-search" style={{ display: 'flex', gap: 8, marginBottom: brands.length > 0 ? 10 : 0 }}>
              <input
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', minWidth: 0 }}
                placeholder="🔍 Buscar producto..."
                value={q} onChange={e => handleSearch(e.target.value)}
              />
              {/* Filter button — hidden on desktop via CSS, shown on mobile */}
              <button className="cl-t-filter-btn" onClick={() => setSidebarOpen(true)} style={{ display: 'none', padding: '9px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: (category || offersOnly) ? '#1e3a5f' : '#f9fafb', color: (category || offersOnly) ? '#fff' : '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, alignItems: 'center' }}>
                {(category || offersOnly) ? `${CAT_ICONS[category] || (offersOnly ? '🔥' : '📦')} Filtro` : '☰ Categorías'}
              </button>
            </div>
            <label className="cl-t-mobile-select" style={{ display: 'none', margin: '8px 0 12px', fontSize: 13, fontWeight: 700 }}>
              Categoría
              <select aria-label="Categoría de productos" value={category}
                onChange={e => { setCategory(e.target.value); setBrand(''); setOffset(0); setOffersOnly(false) }}
                style={{ display: 'block', width: '100%', minHeight: 44, marginTop: 5, borderRadius: 8, border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: 16, background: '#fff' }}>
                <option value="">Todos los accesorios</option>
                {categories.map(c => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
              </select>
            </label>
            {brands.length > 0 && (
              <div className="cl-t-brands" style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 2 }}>
                <button onClick={() => { setBrand(''); setOffset(0); fetchItems(category, '', q, 0, offersOnly) }}
                  style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: brand === '' ? '1.5px solid #1e3a5f' : '1.5px solid #e5e7eb', background: brand === '' ? '#1e3a5f' : '#f9fafb', color: brand === '' ? '#fff' : '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>Todas</button>
                {brands.map(b => (
                  <button key={b} onClick={() => { const nb = brand === b ? '' : b; setBrand(nb); setOffset(0); fetchItems(category, nb, q, 0, offersOnly) }}
                    style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: brand === b ? '1.5px solid #1e3a5f' : '1.5px solid #e5e7eb', background: brand === b ? '#1e3a5f' : '#f9fafb', color: brand === b ? '#fff' : '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>{b}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
              {loading ? 'Cargando...' : `${total} producto${total !== 1 ? 's' : ''}`}
              {(category || offersOnly) && <span style={{ marginLeft: 6, fontSize: 11, background: '#eff6ff', color: '#1d4ed8', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>{offersOnly ? '🔥 Ofertas' : category}</span>}
            </span>
          </div>

          {isEmpty && !loadError ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#6b7280', marginBottom: 8 }}>{total === 0 && !loading ? 'Catálogo en preparación' : 'Sin resultados'}</div>
              <div style={{ fontSize: 14 }}>{total === 0 && !loading ? 'Consultá disponibilidad con CeluLab.' : 'Probá con otro término o categoría.'}</div>
            </div>
          ) : (
            <>
              <div className="cl-t-products" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {items.map(item => (
                  <ProductCard key={item.id} item={item} onAdd={() => addToCart(item)} cartQty={cart.find(c => c.id === item.id)?.qty ?? 0} isMobile={isMobile} />
                ))}
              </div>
              {total > LIMIT && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
                  <button onClick={() => { const o = Math.max(0, offset - LIMIT); setOffset(o); fetchItems(category, brand, q, o, offersOnly) }} disabled={offset === 0}
                    style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: offset === 0 ? 'not-allowed' : 'pointer', opacity: offset === 0 ? 0.4 : 1 }}>← Anterior</button>
                  <span style={{ padding: '8px 12px', fontSize: 13, color: '#6b7280' }}>{offset + 1}–{Math.min(offset + LIMIT, total)} de {total}</span>
                  <button onClick={() => { const o = offset + LIMIT; if (o < total) { setOffset(o); fetchItems(category, brand, q, o, offersOnly) } }} disabled={offset + LIMIT >= total}
                    style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: offset + LIMIT >= total ? 'not-allowed' : 'pointer', opacity: offset + LIMIT >= total ? 0.4 : 1 }}>Siguiente →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>Precios en ARS · Disponibilidad sujeta a confirmación</div>
      </div>

      {cartOpen && (
        <CartDrawer cart={cart} cartTotal={cartTotal} onClose={() => setCartOpen(false)} onUpdateQty={updateQty} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }} />
      )}
      {checkoutOpen && (
        <CheckoutModal cart={cart} cartTotal={cartTotal} onClose={() => setCheckoutOpen(false)} onConfirmed={(order) => { setConfirmedOrder(order); setCheckoutOpen(false) }} />
      )}
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ item, onAdd, cartQty, isMobile }: { item: Product; onAdd: () => void; cartQty: number; isMobile?: boolean }) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!item.in_stock) return
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div style={{
      background: '#fff', border: `1px solid ${cartQty > 0 ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 12,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      opacity: item.in_stock ? 1 : 0.6,
      transition: 'box-shadow 0.15s, border-color 0.15s',
      position: 'relative',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {cartQty > 0 && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: '#2563eb', color: '#fff', borderRadius: '50%', width: 22, height: 22, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          {cartQty}
        </div>
      )}

      <div style={{ height: isMobile ? 150 : 190, background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: isMobile ? 4 : 8 }} />
          : <span style={{ fontSize: isMobile ? 30 : 40, opacity: 0.4 }}>📦</span>
        }
      </div>

      <div style={{ padding: isMobile ? '8px 10px' : '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? 4 : 6 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {!item.in_stock && <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Sin stock</span>}
          {item.is_offer && <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#ea580c', borderRadius: 4, padding: '1px 4px' }}>{item.offer_label || '🔥 OFERTA'}</span>}
        </div>
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#111', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: isMobile ? 3 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.name}
        </div>
        {item.brand && !isMobile && <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.brand}</div>}
        <div style={{ marginTop: 'auto', paddingTop: isMobile ? 4 : 8 }}>
          <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: '#0f172a' }}>
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(item.final_price ?? item.price_ars)}
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!item.in_stock}
          style={{
            display: 'block', textAlign: 'center', width: '100%',
            background: !item.in_stock ? '#9ca3af' : added ? '#059669' : '#2563eb',
            color: '#fff', padding: isMobile ? '7px' : '9px', borderRadius: 8, border: 'none',
            fontSize: isMobile ? 11 : 12, fontWeight: 700, cursor: item.in_stock ? 'pointer' : 'not-allowed',
            transition: 'background .2s',
          }}>
          {!item.in_stock ? 'Sin stock' : added ? '✓' : '🛒 Agregar'}
        </button>
      </div>
    </div>
  )
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({ cart, cartTotal, onClose, onUpdateQty, onRemove, onCheckout }: {
  cart: CartItem[]; cartTotal: number
  onClose: () => void; onUpdateQty: (id: string, delta: number) => void
  onRemove: (id: string) => void; onCheckout: () => void
}) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 400,
        background: '#fff', zIndex: 50, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>🛒 Carrito</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <div style={{ fontWeight: 600 }}>Carrito vacío</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Agregá productos para empezar</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 8, background: '#e2e8f0', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: 22 }}>📦</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => onUpdateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(item.price_ars * item.qty)}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 16, flexShrink: 0, padding: '0 2px', alignSelf: 'flex-start' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 15, color: '#374151' }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(cartTotal)}
              </span>
            </div>
            <button onClick={onCheckout} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#2563eb', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}>
              Finalizar compra →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────

function CheckoutModal({ cart, cartTotal, onClose, onConfirmed }: {
  cart: CartItem[]; cartTotal: number
  onClose: () => void
  onConfirmed: (order: { order_number: string; total: number; client_name: string; metodo_pago: string }) => void
}) {
  const [form, setForm] = useState({ name: '', phone: '', metodo: 'efectivo' as 'efectivo' | 'digital', notas: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function confirmar() {
    if (saving) return
    if (!form.name.trim()) { setErr('Ingresá tu nombre'); return }
    setSaving(true)
    setErr('')
    try {
      const res = await fetch('/api/celulab/tienda-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, name: i.name, price_ars: i.price_ars, qty: i.qty })),
          total_ars: cartTotal,
          client_name: form.name.trim(),
          client_phone: form.phone.trim() || null,
          metodo_pago: form.metodo,
          notas: form.notas.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error ?? 'Error al confirmar'); return }
      onConfirmed({ order_number: data.order_number, total: cartTotal, client_name: form.name, metodo_pago: form.metodo })
    } catch {
      setErr('No pudimos confirmar el pedido. Puede haberse registrado: consultanos antes de volver a enviarlo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: 20, padding: '28px 28px 24px',
        width: '92%', maxWidth: 460, zIndex: 70, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Finalizar compra</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        {/* Resumen */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 }}>Tu pedido</div>
          {cart.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
              <span style={{ color: '#374151', flex: 1, paddingRight: 12 }}>{i.qty > 1 ? `${i.qty}x ` : ''}{i.name}</span>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(i.price_ars * i.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: 17, color: '#0f172a' }}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(cartTotal)}</span>
          </div>
        </div>

        {/* Datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Nombre *</div>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Tu nombre y apellido"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>WhatsApp (para avisar cuando esté listo)</div>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+54 9 266..."
              type="tel"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Método de pago</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { v: 'efectivo', l: '💵 Efectivo', desc: 'Pagás al retirar' },
                { v: 'digital', l: '📲 Digital', desc: 'MP / transferencia' },
              ] as const).map(opt => (
                <button key={opt.v} onClick={() => setForm(f => ({ ...f, metodo: opt.v }))}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${form.metodo === opt.v ? '#2563eb' : '#e5e7eb'}`,
                    background: form.metodo === opt.v ? '#eff6ff' : '#fff',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: form.metodo === opt.v ? '#1d4ed8' : '#374151' }}>{opt.l}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Notas (opcional)</div>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              placeholder="Consultas, dirección de entrega, etc."
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box', minHeight: 56, resize: 'vertical' }} />
          </div>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{err}</div>}

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
          📍 <strong>Retiro en local:</strong> te avisamos por WhatsApp cuando esté listo.
        </div>

        <button onClick={confirmar} disabled={saving}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, fontSize: 15, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Confirmando...' : '✓ Confirmar pedido'}
        </button>
      </div>
    </>
  )
}

// ─── Order Confirmation ───────────────────────────────────────────────────────

function OrderConfirmation({ order, onDone }: {
  order: { order_number: string; total: number; client_name: string; metodo_pago: string }
  onDone: () => void
}) {
  const waMsg = encodeURIComponent(
    `🛒 *Nuevo pedido CeluLab Tienda*\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `Pedido: *${order.order_number}*\n` +
    `Cliente: ${order.client_name}\n` +
    `Total: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(order.total)}\n` +
    `Pago: ${order.metodo_pago === 'efectivo' ? '💵 Efectivo' : '📲 Digital'}`
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <div style={{ fontWeight: 900, fontSize: 22, color: '#111', marginBottom: 6 }}>¡Pedido confirmado!</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
          Te avisamos por WhatsApp cuando esté listo para retirar.
        </div>

        <div style={{ background: '#f1f5f9', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>NÚMERO DE PEDIDO</div>
          <div style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 900, letterSpacing: '0.1em', color: '#0f172a' }}>{order.order_number}</div>
          <div style={{ fontSize: 13, color: '#374151', marginTop: 8 }}>
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(order.total)} · {order.metodo_pago === 'efectivo' ? '💵 Efectivo' : '📲 Digital'}
          </div>
        </div>

        <a
          href={`https://wa.me/5492664501140?text=${waMsg}`}
          target="_blank" rel="noreferrer"
          style={{ display: 'block', padding: '13px', borderRadius: 12, background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 10 }}
        >
          📲 Enviar pedido al técnico
        </a>

        <button onClick={onDone}
          style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer', color: '#6b7280' }}>
          ← Seguir comprando
        </button>
      </div>
    </div>
  )
}