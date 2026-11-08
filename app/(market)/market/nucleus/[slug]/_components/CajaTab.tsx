'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Movimiento = {
  id: string
  tipo: 'ingreso' | 'egreso'
  concepto: string
  categoria: string | null
  metodo_pago: 'efectivo' | 'digital'
  monto_ars: number
  equipo_modelo: string | null
  servicio_categoria: string | null
  notas: string | null
  fecha: string
}

type Resumen = {
  totalIngresos: number
  totalEgresos: number
  neto: number
  efectivo: number
  digital: number
  byCategoria: Record<string, number>
  byModelo: Record<string, number>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { key: 'modulo_android', label: 'Módulo Android' },
  { key: 'modulo_iphone', label: 'Módulo iPhone' },
  { key: 'modulo_mecanico', label: 'Módulo Mecánico' },
  { key: 'bateria_android', label: 'Batería Android' },
  { key: 'bateria_iphone', label: 'Batería iPhone' },
  { key: 'pin_carga', label: 'Pin de carga' },
  { key: 'camara', label: 'Cámara' },
  { key: 'glass', label: 'Glass / Vidrio' },
  { key: 'software', label: 'Software / Datos' },
  { key: 'accesorios', label: 'Accesorios (tienda)' },
  { key: 'rendicion', label: 'Rendición local' },
  { key: 'otro', label: 'Otro' },
]

const PERIODO_OPTS = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
  { key: 'custom', label: 'Personalizado' },
]

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function fechaHoy() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function rangoParaPeriodo(periodo: string): { desde: string; hasta: string } {
  const now = new Date()
  if (periodo === 'hoy') {
    const s = new Date(now); s.setHours(0, 0, 0, 0)
    const e = new Date(now); e.setHours(23, 59, 59, 999)
    return { desde: s.toISOString(), hasta: e.toISOString() }
  }
  if (periodo === 'semana') {
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1
    const s = new Date(now); s.setDate(now.getDate() - day); s.setHours(0, 0, 0, 0)
    const e = new Date(now); e.setHours(23, 59, 59, 999)
    return { desde: s.toISOString(), hasta: e.toISOString() }
  }
  if (periodo === 'mes') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    const e = new Date(now); e.setHours(23, 59, 59, 999)
    return { desde: s.toISOString(), hasta: e.toISOString() }
  }
  return { desde: '', hasta: '' }
}

// ─── CajaTab ─────────────────────────────────────────────────────────────────

export function CajaTab({ color }: { color: string }) {
  const [periodo, setPeriodo] = useState('hoy')
  const [customDesde, setCustomDesde] = useState(fechaHoy())
  const [customHasta, setCustomHasta] = useState(fechaHoy())
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    tipo: 'ingreso' as 'ingreso' | 'egreso',
    concepto: '',
    categoria: '',
    metodo_pago: 'efectivo' as 'efectivo' | 'digital',
    monto_ars: '',
    equipo_modelo: '',
    notas: '',
    fecha: new Date().toISOString().slice(0, 16),
  })
  const [saving, setSaving] = useState(false)

  const [activeView, setActiveView] = useState<'movimientos' | 'reportes' | 'rendimientos'>('movimientos')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCaja = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (periodo !== 'custom') {
      const { desde, hasta } = rangoParaPeriodo(periodo)
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
    } else {
      if (customDesde) params.set('desde', new Date(customDesde).toISOString())
      if (customHasta) {
        const h = new Date(customHasta); h.setHours(23, 59, 59, 999)
        params.set('hasta', h.toISOString())
      }
    }
    if (filtroTipo) params.set('tipo', filtroTipo)
    if (filtroMetodo) params.set('metodo', filtroMetodo)
    if (filtroCategoria) params.set('categoria', filtroCategoria)

    const res = await fetch(`/api/celulab/caja?${params}`, { cache: 'no-store' }).then(r => r.json())
    setMovimientos(res.movimientos ?? [])
    setResumen(res.resumen ?? null)
    setLoading(false)
  }, [periodo, customDesde, customHasta, filtroTipo, filtroMetodo, filtroCategoria])

  useEffect(() => { fetchCaja() }, [fetchCaja])

  async function guardarMovimiento() {
    if (!form.concepto || !form.monto_ars || Number(form.monto_ars) <= 0) return
    setSaving(true)
    await fetch('/api/celulab/caja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        monto_ars: Number(form.monto_ars),
        categoria: form.categoria || null,
        equipo_modelo: form.equipo_modelo || null,
      }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ tipo: 'ingreso', concepto: '', categoria: '', metodo_pago: 'efectivo', monto_ars: '', equipo_modelo: '', notas: '', fecha: new Date().toISOString().slice(0, 16) })
    fetchCaja()
  }

  async function eliminarMovimiento(id: string) {
    if (!confirm('¿Eliminar este movimiento?')) return
    setDeletingId(id)
    await fetch(`/api/celulab/caja?id=${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchCaja()
  }

  const topCategorias = Object.entries(resumen?.byCategoria ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topModelos = Object.entries(resumen?.byModelo ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const inp: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid #d1d5db', fontSize: 13, background: '#fff', boxSizing: 'border-box',
  }

  return (
    <div>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: '#111' }}>💰 Caja CeluLab</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Registrá ingresos y egresos · Efectivo vs Digital</div>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          {showForm ? '✕ Cerrar' : '+ Nuevo movimiento'}
        </button>
      </div>

      {/* ── Formulario nuevo movimiento ── */}
      {showForm && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Registrar movimiento</div>

          {/* Tipo */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {(['ingreso', 'egreso'] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: `2px solid ${form.tipo === t ? (t === 'ingreso' ? '#16a34a' : '#ef4444') : '#e5e7eb'}`,
                  background: form.tipo === t ? (t === 'ingreso' ? '#f0fdf4' : '#fef2f2') : '#fff',
                  color: form.tipo === t ? (t === 'ingreso' ? '#15803d' : '#dc2626') : '#374151',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>
                {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Concepto *</div>
              <input style={inp} placeholder="Ej: Cambio pantalla Samsung A54"
                value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Monto ARS *</div>
              <input style={inp} type="number" placeholder="0" min={1}
                value={form.monto_ars} onChange={e => setForm(f => ({ ...f, monto_ars: e.target.value }))} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Método de pago *</div>
              <select style={inp} value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value as 'efectivo' | 'digital' }))}>
                <option value="efectivo">💵 Efectivo</option>
                <option value="digital">📲 Digital (MP / transferencia)</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Categoría</div>
              <select style={inp} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                <option value="">Sin categoría</option>
                {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Modelo de equipo</div>
              <input style={inp} placeholder="Ej: Samsung A54, iPhone 13..."
                value={form.equipo_modelo} onChange={e => setForm(f => ({ ...f, equipo_modelo: e.target.value }))} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Fecha y hora</div>
              <input style={inp} type="datetime-local"
                value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Notas</div>
              <input style={inp} placeholder="Opcional..."
                value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={guardarMovimiento} disabled={saving || !form.concepto || !form.monto_ars}
              style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Filtros de período ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {PERIODO_OPTS.map(p => (
          <button key={p.key} onClick={() => setPeriodo(p.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: `1px solid ${periodo === p.key ? color : '#e5e7eb'}`,
              background: periodo === p.key ? color : '#fff',
              color: periodo === p.key ? '#fff' : '#374151',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            {p.label}
          </button>
        ))}
        {periodo === 'custom' && (
          <>
            <input type="date" value={customDesde} onChange={e => setCustomDesde(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12 }} />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>→</span>
            <input type="date" value={customHasta} onChange={e => setCustomHasta(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12 }} />
          </>
        )}
        <button onClick={fetchCaja}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer', marginLeft: 'auto' }}>
          ↻
        </button>
      </div>

      {/* ── Filtros adicionales ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, minWidth: 130 }}>
          <option value="">Ingresos + Egresos</option>
          <option value="ingreso">Solo ingresos</option>
          <option value="egreso">Solo egresos</option>
        </select>
        <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, minWidth: 140 }}>
          <option value="">Todos los métodos</option>
          <option value="efectivo">💵 Efectivo</option>
          <option value="digital">📲 Digital</option>
        </select>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, minWidth: 160 }}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Cargando...</div>
      ) : (
        <>
          {/* ── Resumen cards ── */}
          {resumen && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
              <SummaryCard label="Ingresos" value={ars(resumen.totalIngresos)} color="#16a34a" icon="↑" />
              <SummaryCard label="Egresos" value={ars(resumen.totalEgresos)} color="#ef4444" icon="↓" />
              <SummaryCard label="Neto" value={ars(resumen.neto)} color={resumen.neto >= 0 ? '#2563eb' : '#ef4444'} icon="=" />
              <SummaryCard label="💵 Efectivo" value={ars(resumen.efectivo)} color="#ca8a04" icon="E" />
              <SummaryCard label="📲 Digital" value={ars(resumen.digital)} color="#7c3aed" icon="D" />
            </div>
          )}

          {/* ── Sub-tabs ── */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
            {(['movimientos', 'reportes', 'rendimientos'] as const).map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                style={{
                  padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  borderBottom: activeView === v ? `2px solid ${color}` : '2px solid transparent',
                  color: activeView === v ? color : '#6b7280', background: 'transparent',
                }}>
                {v === 'movimientos' ? '📋 Movimientos' : v === 'reportes' ? '📊 Reportes' : '🏪 Rendimientos'}
              </button>
            ))}
          </div>

          {/* ── Vista Movimientos ── */}
          {activeView === 'movimientos' && (
            movimientos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 24px', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Sin movimientos</div>
                <div style={{ fontSize: 13 }}>Registrá el primer ingreso o egreso del período.</div>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Fecha', 'Concepto', 'Categoría', 'Modelo', 'Método', 'Monto', ''].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6b7280' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m, i) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap', fontSize: 12 }}>
                          {new Date(m.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '10px 12px', maxWidth: 220 }}>
                          <span style={{
                            display: 'inline-block', marginRight: 6, fontSize: 11, fontWeight: 700,
                            color: m.tipo === 'ingreso' ? '#16a34a' : '#ef4444',
                          }}>
                            {m.tipo === 'ingreso' ? '↑' : '↓'}
                          </span>
                          {m.concepto}
                          {m.notas && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{m.notas}</div>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {m.categoria
                            ? <span style={{ fontSize: 11, background: '#f3f4f6', borderRadius: 4, padding: '2px 7px', color: '#374151' }}>
                                {CATEGORIAS.find(c => c.key === m.categoria)?.label ?? m.categoria}
                              </span>
                            : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 12 }}>
                          {m.equipo_modelo ?? '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                            background: m.metodo_pago === 'efectivo' ? '#fef9c3' : '#ede9fe',
                            color: m.metodo_pago === 'efectivo' ? '#a16207' : '#6d28d9',
                          }}>
                            {m.metodo_pago === 'efectivo' ? '💵 Efectivo' : '📲 Digital'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right', color: m.tipo === 'ingreso' ? '#16a34a' : '#ef4444', whiteSpace: 'nowrap' }}>
                          {m.tipo === 'ingreso' ? '+' : '-'}{ars(m.monto_ars)}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button onClick={() => eliminarMovimiento(m.id)} disabled={deletingId === m.id}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 14, padding: '0 4px' }}
                            title="Eliminar">
                            {deletingId === m.id ? '...' : '✕'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── Vista Reportes ── */}
          {activeView === 'reportes' && resumen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Efectivo vs Digital */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>💳 Efectivo vs Digital</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <MetricBar
                    label="Efectivo" value={resumen.efectivo}
                    total={resumen.totalIngresos - resumen.totalEgresos || 1}
                    color="#ca8a04" bgColor="#fef9c3"
                  />
                  <MetricBar
                    label="Digital (MP / transferencia)" value={resumen.digital}
                    total={resumen.totalIngresos - resumen.totalEgresos || 1}
                    color="#7c3aed" bgColor="#ede9fe"
                  />
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: '#6b7280', background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                  💡 <strong>Tip impositivo:</strong> el efectivo es difícil de rastrear · el digital queda registrado. Usá este desglose para tu declaración mensual.
                </div>
              </div>

              {/* Top categorías */}
              {topCategorias.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🔧 Servicios más facturados</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topCategorias.map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 13, minWidth: 160, color: '#374151' }}>
                          {CATEGORIAS.find(c => c.key === key)?.label ?? key}
                        </div>
                        <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, Math.round((val / topCategorias[0][1]) * 100))}%`,
                            height: '100%', background: color, borderRadius: 6,
                          }} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, minWidth: 90, textAlign: 'right', color: color }}>{ars(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top modelos */}
              {topModelos.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📱 Modelos más reparados</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topModelos.map(([modelo, count]) => (
                      <div key={modelo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 13, minWidth: 160, color: '#374151' }}>{modelo}</div>
                        <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, Math.round((count / topModelos[0][1]) * 100))}%`,
                            height: '100%', background: '#0891b2', borderRadius: 6,
                          }} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, minWidth: 60, textAlign: 'right', color: '#0891b2' }}>{count} {count === 1 ? 'vez' : 'veces'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topCategorias.length === 0 && topModelos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 24px', color: '#9ca3af', fontSize: 13 }}>
                  Registrá movimientos con categoría y modelo para ver métricas.
                </div>
              )}

            </div>
          )}

          {/* ── Vista Rendimientos ── */}
          {activeView === 'rendimientos' && (
            <RendimientosView color={color} periodo={periodo} customDesde={customDesde} customHasta={customHasta} />
          )}
        </>
      )}
    </div>
  )
}

// ─── RendimientosView ─────────────────────────────────────────────────────────

type RendPartner = {
  partner_id: string; partner_name: string; orders_count: number
  deposits_total: number; budget_total: number
  commission_owed: number; ya_rendido: number; pendiente: number
  orders: { id: string; order_number: string; device: string; deposit_ars: number; budget_ars: number; commission_pct: number; status: string; created_at: string }[]
}

function RendimientosView({ color, periodo, customDesde, customHasta }: { color: string; periodo: string; customDesde: string; customHasta: string }) {
  const [data, setData] = useState<RendPartner[]>([])
  const [reportError,setReportError]=useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rendering, setRendering] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState<Record<string, string>>({})

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (periodo !== 'custom') {
      const now = new Date()
      if (periodo === 'hoy') {
        const s = new Date(now); s.setHours(0, 0, 0, 0)
        const e = new Date(now); e.setHours(23, 59, 59, 999)
        params.set('desde', s.toISOString()); params.set('hasta', e.toISOString())
      } else if (periodo === 'semana') {
        const day = now.getDay() === 0 ? 6 : now.getDay() - 1
        const s = new Date(now); s.setDate(now.getDate() - day); s.setHours(0, 0, 0, 0)
        const e = new Date(now); e.setHours(23, 59, 59, 999)
        params.set('desde', s.toISOString()); params.set('hasta', e.toISOString())
      } else if (periodo === 'mes') {
        const s = new Date(now.getFullYear(), now.getMonth(), 1)
        const e = new Date(now); e.setHours(23, 59, 59, 999)
        params.set('desde', s.toISOString()); params.set('hasta', e.toISOString())
      }
    } else {
      if (customDesde) params.set('desde', new Date(customDesde).toISOString())
      if (customHasta) { const h = new Date(customHasta); h.setHours(23, 59, 59, 999); params.set('hasta', h.toISOString()) }
    }
    try {
      const response=await fetch(`/api/celulab/caja/rendimientos?${params}`,{cache:'no-store'})
      if (!response.ok) throw new Error()
      setData(await response.json())
      setReportError(false)
    } catch { setReportError(true) }
    finally { setLoading(false) }
  }, [periodo, customDesde, customHasta])

  useEffect(() => { fetch_() }, [fetch_])

  async function rendir(p: RendPartner) {
    const monto = Number(customAmount[p.partner_id] ?? p.pendiente)
    if (!monto || monto <= 0) return
    setRendering(p.partner_id)
    const periodoLabel = periodo === 'hoy' ? 'hoy' : periodo === 'semana' ? 'esta semana' : periodo === 'mes' ? 'este mes' : `${customDesde} → ${customHasta}`
    await fetch('/api/celulab/caja/rendimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner_id: p.partner_id, partner_name: p.partner_name, monto_ars: monto, periodo_label: periodoLabel }),
    })
    setRendering(null)
    setCustomAmount(prev => ({ ...prev, [p.partner_id]: '' }))
    fetch_()
  }

  if (reportError && !loading) return <p role="alert">Rendiciones no disponibles. <button onClick={fetch_}>Reintentar</button></p>
  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Cargando...</div>

  if (data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: '#9ca3af' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🏪</div>
      <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Sin órdenes de locales en el período</div>
      <div style={{ fontSize: 13 }}>Las órdenes de los locales asociados aparecen acá con su comisión calculada.</div>
    </div>
  )

  const totalPendiente = data.reduce((s, p) => s + p.pendiente, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Resumen global */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>LOCALES ACTIVOS</div><div style={{ fontWeight: 800, fontSize: 20 }}>{data.length}</div></div>
        <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>SEÑAS RECIBIDAS</div><div style={{ fontWeight: 800, fontSize: 20, color: '#16a34a' }}>{ars(data.reduce((s, p) => s + p.deposits_total, 0))}</div></div>
        <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>YA RENDIDO</div><div style={{ fontWeight: 800, fontSize: 20, color: '#6366f1' }}>{ars(data.reduce((s, p) => s + p.ya_rendido, 0))}</div></div>
        <div><div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>PENDIENTE A PAGAR</div><div style={{ fontWeight: 800, fontSize: 20, color: totalPendiente > 0 ? '#ef4444' : '#16a34a' }}>{ars(totalPendiente)}</div></div>
      </div>

      {data.map(p => (
        <div key={p.partner_id} style={{ background: '#fff', border: `1px solid ${p.pendiente > 0 ? '#fde68a' : '#d1fae5'}`, borderRadius: 12, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>🏪 {p.partner_name}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{p.orders_count} orden{p.orders_count !== 1 ? 'es' : ''} · Señas: {ars(p.deposits_total)} · Presup: {ars(p.budget_total)}</div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Comisión estimada</div>
                <div style={{ fontWeight: 700, color: color, fontSize: 16 }}>{ars(p.commission_owed)}</div>
              </div>
              {p.ya_rendido > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Ya rendido</div>
                  <div style={{ fontWeight: 700, color: '#6366f1', fontSize: 16 }}>{ars(p.ya_rendido)}</div>
                </div>
              )}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Pendiente</div>
                <div style={{ fontWeight: 800, color: p.pendiente > 0 ? '#ef4444' : '#16a34a', fontSize: 18 }}>{ars(p.pendiente)}</div>
              </div>
            </div>
          </div>

          {/* Rendir row */}
          {p.pendiente > 0 && (
            <div style={{ padding: '10px 18px 14px', borderTop: '1px solid #f3f4f6', background: '#fffbeb', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#92400e', flex: 1 }}>💸 Registrar pago al local:</span>
              <input
                type="number"
                value={customAmount[p.partner_id] ?? p.pendiente}
                onChange={e => setCustomAmount(prev => ({ ...prev, [p.partner_id]: e.target.value }))}
                style={{ width: 120, padding: '6px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: 13, textAlign: 'right' }}
              />
              <button
                onClick={() => rendir(p)}
                disabled={rendering === p.partner_id}
                style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: rendering === p.partner_id ? 0.7 : 1 }}
              >
                {rendering === p.partner_id ? '...' : '✓ Rendir'}
              </button>
            </div>
          )}

          {/* Detalle órdenes */}
          <div style={{ borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={() => setExpanded(expanded === p.partner_id ? null : p.partner_id)}
              style={{ width: '100%', padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6b7280', textAlign: 'left' }}
            >
              {expanded === p.partner_id ? '▲ Ocultar órdenes' : `▼ Ver ${p.orders_count} orden${p.orders_count !== 1 ? 'es' : ''}`}
            </button>
            {expanded === p.partner_id && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 480 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Orden', 'Equipo', 'Estado', 'Seña', 'Presupuesto', 'Comisión est.'].map(h => (
                        <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6b7280' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.orders.map(o => {
                      const base = (o.budget_ars ?? 0) > 0 ? o.budget_ars : (o.deposit_ars ?? 0)
                      const comm = Math.round(base * (o.commission_pct ?? 33) / 100)
                      return (
                        <tr key={o.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: color }}>{o.order_number}</td>
                          <td style={{ padding: '8px 12px', color: '#374151' }}>{o.device}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#16a34a', fontWeight: 600 }}>{ars(o.deposit_ars ?? 0)}</td>
                          <td style={{ padding: '8px 12px', color: '#1d4ed8' }}>{o.budget_ars > 0 ? ars(o.budget_ars) : '—'}</td>
                          <td style={{ padding: '8px 12px', color: '#7c3aed', fontWeight: 700 }}>{ars(comm)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Mini-components ──────────────────────────────────────────────────────────

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 18, color }}>{value}</div>
    </div>
  )
}

function MetricBar({ label, value, total, color, bgColor }: { label: string; value: number; total: number; color: string; bgColor: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / Math.abs(total)) * 100)) : 0
  return (
    <div style={{ flex: 1, minWidth: 180 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color }}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value)}</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 8, height: 12, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: bgColor, borderRadius: 8, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: color, opacity: 0.3, borderRadius: 8 }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{pct}% del neto</div>
    </div>
  )
}