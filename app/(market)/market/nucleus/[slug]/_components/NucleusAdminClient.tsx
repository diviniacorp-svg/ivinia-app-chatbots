'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = {
  id: string; name: string; url: string
  scrape_type: 'playwright' | 'manual'
  is_active: boolean; last_scraped_at: string | null; notes: string
}

type Part = {
  id: string; name: string; category: string; service_name: string; notes: string
  cl_provider_prices?: Array<{ cost_ars: number; url_item: string; scraped_at: string; cl_providers: { id: string; name: string } | null }>
}

type MarginRow = {
  service_name: string; category: string; price_ars: number
  best_cost: { cost_ars: number; provider: string; url_item: string; scraped_at: string } | null
  all_costs: Array<{ cost_ars: number; provider: string }>
  margin_ars: number | null; margin_pct: number | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATS = ['Pantallas', 'Batería', 'Conectores', 'Cámara', 'Datos & Software', 'Mantenimiento']

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function ago(iso: string | null) {
  if (!iso) return 'Nunca'
  const d = (Date.now() - new Date(iso).getTime()) / 1000
  if (d < 60) return 'Hace un momento'
  if (d < 3600) return `Hace ${Math.floor(d / 60)}min`
  if (d < 86400) return `Hace ${Math.floor(d / 3600)}h`
  return `Hace ${Math.floor(d / 86400)}d`
}

function marginColor(pct: number | null) {
  if (pct === null) return '#9ca3af'
  if (pct >= 50) return '#16a34a'
  if (pct >= 30) return '#ca8a04'
  return '#dc2626'
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function NucleusAdminClient({
  clientId, companyName, pin, color,
}: {
  clientId: string; companyName: string; pin: string; color: string
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinErr, setPinErr] = useState(false)

  // Persist unlock in sessionStorage so no re-login on refresh
  useEffect(() => {
    if (sessionStorage.getItem(`nucleus-${clientId}`) === 'ok') setUnlocked(true)
  }, [clientId])

  function tryPin() {
    if (pinInput === pin) {
      setUnlocked(true)
      sessionStorage.setItem(`nucleus-${clientId}`, 'ok')
    } else {
      setPinErr(true)
      setPinInput('')
      setTimeout(() => setPinErr(false), 2000)
    }
  }

  if (!unlocked) return (
    <PinScreen
      companyName={companyName} color={color}
      pinInput={pinInput} pinErr={pinErr}
      onInput={setPinInput} onSubmit={tryPin}
    />
  )

  return <AdminPanel clientId={clientId} companyName={companyName} color={color} />
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────

function PinScreen({ companyName, color, pinInput, pinErr, onInput, onSubmit }: {
  companyName: string; color: string; pinInput: string; pinErr: boolean
  onInput: (v: string) => void; onSubmit: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', fontFamily: 'system-ui',
    }}>
      <div style={{
        background: '#111', border: '1px solid #222', borderRadius: 20,
        padding: '40px 36px', width: 340, textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: color + '22', border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, margin: '0 auto 20px',
        }}>🔒</div>

        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>
          Panel privado
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 28 }}>
          {companyName}
        </div>

        <input
          type="password"
          maxLength={8}
          value={pinInput}
          onChange={e => onInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="PIN de acceso"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${pinErr ? '#ef4444' : '#2a2a2a'}`,
            background: '#0d0d0d', color: '#fff', fontSize: 16,
            textAlign: 'center', letterSpacing: '0.3em', outline: 'none',
            boxSizing: 'border-box', marginBottom: 12,
            transition: 'border-color .2s',
          }}
          autoFocus
        />

        {pinErr && (
          <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 10 }}>PIN incorrecto</div>
        )}

        <button onClick={onSubmit} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: color, color: '#fff', fontWeight: 700, fontSize: 14,
          cursor: 'pointer',
        }}>
          Ingresar →
        </button>
      </div>
    </div>
  )
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel({ clientId, companyName, color }: { clientId: string; companyName: string; color: string }) {
  const [tab, setTab] = useState<'margenes' | 'proveedores' | 'repuestos'>('margenes')
  const [providers, setProviders] = useState<Provider[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [margins, setMargins] = useState<MarginRow[]>([])
  const [loading, setLoading] = useState(true)

  // Forms
  const [showProvForm, setShowProvForm] = useState(false)
  const [provForm, setProvForm] = useState({ name: '', url: '', scrape_type: 'manual', notes: '' })
  const [provSaving, setProvSaving] = useState(false)

  const [showPartForm, setShowPartForm] = useState(false)
  const [partForm, setPartForm] = useState({ name: '', category: CATS[0], service_name: '', notes: '' })
  const [partSaving, setPartSaving] = useState(false)

  // Price modal
  const [priceModal, setPriceModal] = useState<{ part: Part | null; open: boolean }>({ part: null, open: false })
  const [priceItems, setPriceItems] = useState<Record<string, { cost_ars: string; url_item: string }>>({})
  const [priceSaving, setPriceSaving] = useState(false)

  // Suppress unused warning
  void clientId

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [p, pa, m] = await Promise.all([
      fetch('/api/celulab/providers').then(r => r.json()),
      fetch('/api/celulab/parts').then(r => r.json()),
      fetch('/api/celulab/margins').then(r => r.json()),
    ])
    setProviders(Array.isArray(p) ? p : [])
    setParts(Array.isArray(pa) ? pa : [])
    setMargins(Array.isArray(m) ? m : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Save provider
  async function saveProvider() {
    if (!provForm.name || !provForm.url) return
    setProvSaving(true)
    await fetch('/api/celulab/providers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provForm),
    })
    setProvForm({ name: '', url: '', scrape_type: 'manual', notes: '' })
    setShowProvForm(false); setProvSaving(false); fetchAll()
  }

  async function deleteProvider(id: string) {
    if (!confirm('¿Eliminar proveedor? Se borran todos sus precios.')) return
    await fetch(`/api/celulab/providers/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  // Save part
  async function savePart() {
    if (!partForm.name || !partForm.category) return
    setPartSaving(true)
    await fetch('/api/celulab/parts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partForm),
    })
    setPartForm({ name: '', category: CATS[0], service_name: '', notes: '' })
    setShowPartForm(false); setPartSaving(false); fetchAll()
  }

  // Price modal
  function openPriceModal(part: Part) {
    const init: Record<string, { cost_ars: string; url_item: string }> = {}
    providers.forEach(p => {
      const ex = part.cl_provider_prices?.find(pp => pp.cl_providers?.id === p.id)
      init[p.id] = { cost_ars: ex ? String(ex.cost_ars) : '', url_item: ex?.url_item ?? '' }
    })
    setPriceItems(init)
    setPriceModal({ part, open: true })
  }

  async function savePrices() {
    if (!priceModal.part) return
    setPriceSaving(true)
    const entries = Object.entries(priceItems).filter(([, v]) => v.cost_ars && Number(v.cost_ars) > 0)
    for (const [provider_id, entry] of entries) {
      await fetch('/api/celulab/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id,
          items: [{ part_id: priceModal.part!.id, cost_ars: Number(entry.cost_ars), url_item: entry.url_item }],
        }),
      })
    }
    setPriceSaving(false)
    setPriceModal({ part: null, open: false })
    fetchAll()
  }

  const grouped = CATS.reduce<Record<string, MarginRow[]>>((acc, cat) => {
    acc[cat] = margins.filter(m => m.category === cat)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>

      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>📱</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1 }}>{companyName}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Panel privado · NUCLEUS IA</div>
          </div>
        </div>
        <button onClick={fetchAll} style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
          ↻ Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', gap: 2 }}>
        {(['margenes', 'proveedores', 'repuestos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '12px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            borderBottom: tab === t ? `2px solid ${color}` : '2px solid transparent',
            color: tab === t ? color : '#6b7280', background: 'transparent',
          }}>
            {t === 'margenes' ? '📊 Márgenes' : t === 'proveedores' ? '🏪 Proveedores' : '🔩 Repuestos'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 64 }}>Cargando...</div>
        ) : (
          <>

            {/* ══ MÁRGENES ══ */}
            {tab === 'margenes' && (
              <div>
                {margins.length === 0 ? (
                  <Empty title="Sin datos de costos" desc="Agregá proveedores y cargá precios para ver los márgenes." />
                ) : (
                  CATS.map(cat => {
                    const rows = grouped[cat] ?? []
                    if (!rows.length) return null
                    return (
                      <div key={cat} style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{cat}</div>
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                {['Servicio', 'Precio', 'Costo (mejor prov.)', 'Ganancia', '%'].map(h => (
                                  <th key={h} style={{ textAlign: h === 'Servicio' ? 'left' : 'right', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '11px 14px' }}>{row.service_name}</td>
                                  <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600 }}>{ars(row.price_ars)}</td>
                                  <td style={{ padding: '11px 14px', textAlign: 'right', color: '#6b7280' }}>
                                    {row.best_cost
                                      ? <><span style={{ fontWeight: 500 }}>{ars(row.best_cost.cost_ars)}</span><span style={{ fontSize: 11, marginLeft: 5, color: '#9ca3af' }}>({row.best_cost.provider})</span></>
                                      : <span style={{ color: '#d1d5db' }}>Sin dato</span>}
                                  </td>
                                  <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: marginColor(row.margin_pct) }}>
                                    {row.margin_ars !== null ? ars(row.margin_ars) : '—'}
                                  </td>
                                  <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                                    {row.margin_pct !== null ? (
                                      <span style={{
                                        background: marginColor(row.margin_pct) + '18',
                                        color: marginColor(row.margin_pct),
                                        borderRadius: 6, padding: '3px 9px', fontWeight: 700, fontSize: 12,
                                      }}>{row.margin_pct}%</span>
                                    ) : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ══ PROVEEDORES ══ */}
            {tab === 'proveedores' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Btn onClick={() => setShowProvForm(true)} color={color}>+ Nuevo proveedor</Btn>
                </div>

                {showProvForm && (
                  <FormCard title="Nuevo proveedor" onClose={() => setShowProvForm(false)}>
                    <Field label="Nombre *"><input style={inp} value={provForm.name} onChange={e => setProvForm(p => ({ ...p, name: e.target.value }))} placeholder="ej: MercadoLibre" /></Field>
                    <Field label="URL de lista de precios *"><input style={inp} value={provForm.url} onChange={e => setProvForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></Field>
                    <Field label="Tipo"><select style={inp} value={provForm.scrape_type} onChange={e => setProvForm(p => ({ ...p, scrape_type: e.target.value }))}>
                      <option value="manual">Manual (yo cargo los precios)</option>
                      <option value="playwright">Automático</option>
                    </select></Field>
                    <Field label="Notas"><input style={inp} value={provForm.notes} onChange={e => setProvForm(p => ({ ...p, notes: e.target.value }))} placeholder="contacto, condiciones, etc." /></Field>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <Btn onClick={saveProvider} color={color} disabled={provSaving}>{provSaving ? 'Guardando...' : 'Guardar'}</Btn>
                      <BtnSec onClick={() => setShowProvForm(false)}>Cancelar</BtnSec>
                    </div>
                  </FormCard>
                )}

                {providers.length === 0
                  ? <Empty title="Sin proveedores" desc="Agregá tu primer proveedor para empezar a comparar precios." />
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {providers.map(p => (
                        <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                            <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: color, wordBreak: 'break-all' }}>{p.url}</a>
                            {p.notes && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{p.notes}</div>}
                          </div>
                          <div style={{ textAlign: 'right', fontSize: 12, flexShrink: 0 }}>
                            <div style={{ color: '#9ca3af' }}>Último scraping</div>
                            <div style={{ fontWeight: 600, color: '#374151' }}>{ago(p.last_scraped_at)}</div>
                          </div>
                          <BtnSec onClick={() => deleteProvider(p.id)} style={{ color: '#ef4444', borderColor: '#fecaca', fontSize: 12 }}>Eliminar</BtnSec>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* ══ REPUESTOS ══ */}
            {tab === 'repuestos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Btn onClick={() => setShowPartForm(true)} color={color}>+ Nuevo repuesto</Btn>
                </div>

                {showPartForm && (
                  <FormCard title="Nuevo repuesto" onClose={() => setShowPartForm(false)}>
                    <Field label="Nombre *"><input style={inp} value={partForm.name} onChange={e => setPartForm(p => ({ ...p, name: e.target.value }))} placeholder="ej: Pantalla iPhone 14" /></Field>
                    <Field label="Categoría *"><select style={inp} value={partForm.category} onChange={e => setPartForm(p => ({ ...p, category: e.target.value }))}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select></Field>
                    <Field label="Servicio CeluLab vinculado (para margen)"><input style={inp} value={partForm.service_name} onChange={e => setPartForm(p => ({ ...p, service_name: e.target.value }))} placeholder="ej: Cambio de pantalla iPhone (14 a 16)" /></Field>
                    <Field label="Notas"><input style={inp} value={partForm.notes} onChange={e => setPartForm(p => ({ ...p, notes: e.target.value }))} /></Field>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <Btn onClick={savePart} color={color} disabled={partSaving}>{partSaving ? 'Guardando...' : 'Guardar'}</Btn>
                      <BtnSec onClick={() => setShowPartForm(false)}>Cancelar</BtnSec>
                    </div>
                  </FormCard>
                )}

                {providers.length === 0 && (
                  <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 16 }}>
                    ⚠️ Primero agregá al menos un proveedor para poder cargar precios.
                  </div>
                )}

                {parts.length === 0
                  ? <Empty title="Sin repuestos" desc="Cargá los repuestos que usás para vincularlos a los servicios." />
                  : (
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            {['Repuesto', 'Categoría', 'Servicio vinculado', 'Precios cargados', ''].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parts.map(part => (
                            <tr key={part.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '11px 14px', fontWeight: 500 }}>{part.name}</td>
                              <td style={{ padding: '11px 14px', color: '#6b7280' }}>{part.category}</td>
                              <td style={{ padding: '11px 14px', fontSize: 12, color: '#9ca3af', maxWidth: 200 }}>
                                {part.service_name || <i style={{ color: '#d1d5db' }}>Sin vincular</i>}
                              </td>
                              <td style={{ padding: '11px 14px' }}>
                                {(part.cl_provider_prices ?? []).length === 0
                                  ? <span style={{ color: '#d1d5db', fontSize: 12 }}>Sin precios</span>
                                  : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                      {(part.cl_provider_prices ?? []).map((pp, i) => (
                                        <span key={i} style={{ background: '#f0fdf4', color: '#15803d', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                                          {pp.cl_providers?.name ?? '?'}: {ars(pp.cost_ars)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                              </td>
                              <td style={{ padding: '11px 14px' }}>
                                <button
                                  onClick={() => openPriceModal(part)}
                                  disabled={providers.length === 0}
                                  style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' }}
                                >
                                  💰 Cargar precios
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            )}

          </>
        )}
      </div>

      {/* ══ MODAL PRECIOS ══ */}
      {priceModal.open && priceModal.part && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPriceModal({ part: null, open: false })}
        >
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 460, maxWidth: '92vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>💰 Cargar precios</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 22 }}>{priceModal.part.name}</div>
            {providers.map(prov => (
              <div key={prov.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{prov.name}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" style={{ ...inp, flex: 1 }} placeholder="Costo ARS"
                    value={priceItems[prov.id]?.cost_ars ?? ''}
                    onChange={e => setPriceItems(p => ({ ...p, [prov.id]: { ...p[prov.id], cost_ars: e.target.value } }))}
                  />
                  <input style={{ ...inp, flex: 2 }} placeholder="URL (opcional)"
                    value={priceItems[prov.id]?.url_item ?? ''}
                    onChange={e => setPriceItems(p => ({ ...p, [prov.id]: { ...p[prov.id], url_item: e.target.value } }))}
                  />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn onClick={savePrices} color={color} disabled={priceSaving}>{priceSaving ? 'Guardando...' : 'Guardar precios'}</Btn>
              <BtnSec onClick={() => setPriceModal({ part: null, open: false })}>Cancelar</BtnSec>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Mini-components ──────────────────────────────────────────────────────────

function Empty({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: '#9ca3af' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: '#6b7280', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{desc}</div>
    </div>
  )
}

function FormCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16 }}>✕</button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function Btn({ onClick, color, disabled, children }: { onClick: () => void; color: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '9px 18px', borderRadius: 9, border: 'none', background: color,
      color: '#fff', fontWeight: 700, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1,
    }}>{children}</button>
  )
}

function BtnSec({ onClick, style, children }: { onClick: () => void; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 16px', borderRadius: 9, border: '1px solid #e5e7eb',
      background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer', ...style,
    }}>{children}</button>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db',
  fontSize: 13, background: '#fff', boxSizing: 'border-box',
}
