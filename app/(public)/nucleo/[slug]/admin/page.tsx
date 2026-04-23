'use client'
import { useState } from 'react'
import { Plus, Eye, Edit3, Trash2, Package, Users, MessageSquare, BarChart2, ExternalLink, Check, X, Zap, Globe } from 'lucide-react'
import Link from 'next/link'

const LIME = '#C6FF3D'
const ACCENT = '#6366f1'

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Item {
  id: string
  titulo: string
  descripcion: string
  precio: number | null
  categoria: string
  estado: 'disponible' | 'vendido' | 'reservado'
  destacado: boolean
  vistas: number
  consultas: number
}

interface Consulta {
  id: string
  item: string
  nombre: string
  telefono: string
  mensaje: string
  fecha: string
  respondida: boolean
}

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_ITEMS: Item[] = [
  { id: '1', titulo: 'Smart TV 50" Samsung', descripcion: 'Pantalla perfecta, con control y manual.', precio: 180000, categoria: 'Electrónica', estado: 'disponible', destacado: true, vistas: 47, consultas: 3 },
  { id: '2', titulo: 'Notebook HP 15"', descripcion: 'Core i5, 8GB RAM, 500GB SSD.', precio: 320000, categoria: 'Electrónica', estado: 'disponible', destacado: false, vistas: 31, consultas: 2 },
  { id: '3', titulo: 'Sofá 3 cuerpos', descripcion: 'Tapizado beige, sin manchas.', precio: 95000, categoria: 'Muebles', estado: 'disponible', destacado: false, vistas: 19, consultas: 0 },
  { id: '4', titulo: 'Taladro Bosch + accesorios', descripcion: 'Con maletín y brocas.', precio: 45000, categoria: 'Herramientas', estado: 'vendido', destacado: false, vistas: 28, consultas: 5 },
  { id: '5', titulo: 'Bicicleta MTB rodado 29', descripcion: 'Shimano 21 velocidades.', precio: 130000, categoria: 'Deportes', estado: 'disponible', destacado: true, vistas: 62, consultas: 4 },
]

const DEMO_CONSULTAS: Consulta[] = [
  { id: 'c1', item: 'Smart TV 50" Samsung', nombre: 'Marcos Gómez', telefono: '+54 266 4123456', mensaje: 'Hola! ¿Está disponible el TV? ¿Acepta transferencia?', fecha: '2026-04-22', respondida: false },
  { id: 'c2', item: 'Bicicleta MTB rodado 29', nombre: 'Laura Rodríguez', telefono: '+54 266 4987654', mensaje: 'Buenas tardes! Me interesa la bici. ¿Está en buen estado?', fecha: '2026-04-22', respondida: true },
  { id: 'c3', item: 'Notebook HP 15"', nombre: 'Diego Fernández', telefono: '+54 266 4555777', mensaje: '¿Cuántos ciclos tiene la batería? ¿Negociable el precio?', fecha: '2026-04-21', respondida: false },
]

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '18px 20px',
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em' }}>{value}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: LIME, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function NucleoAdmin({ params }: { params: { slug: string } }) {
  const [tab, setTab] = useState<'items' | 'consultas' | 'stats'>('items')
  const [items, setItems] = useState<Item[]>(DEMO_ITEMS)
  const [consultas, setConsultas] = useState<Consulta[]>(DEMO_CONSULTAS)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Item | null>(null)
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', categoria: 'Electrónica', destacado: false })

  const disponibles = items.filter(i => i.estado === 'disponible').length
  const vendidos = items.filter(i => i.estado === 'vendido').length
  const totalVistas = items.reduce((s, i) => s + i.vistas, 0)
  const pendientes = consultas.filter(c => !c.respondida).length

  function cambiarEstado(id: string, estado: Item['estado']) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, estado } : i))
  }

  function toggleDestacado(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, destacado: !i.destacado } : i))
  }

  function marcarRespondida(id: string) {
    setConsultas(prev => prev.map(c => c.id === id ? { ...c, respondida: true } : c))
  }

  function responderWA(consulta: Consulta) {
    const wa = consulta.telefono.replace(/\D/g, '')
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(`Hola ${consulta.nombre.split(' ')[0]}! Te respondo sobre "${consulta.item}": `)}`, '_blank')
    marcarRespondida(consulta.id)
  }

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: active ? 600 : 400,
    padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? 'rgba(198,255,61,0.1)' : 'transparent',
    color: active ? LIME : 'rgba(255,255,255,0.4)',
    borderBottom: active ? `2px solid ${LIME}` : '2px solid transparent',
  })

  const ESTADO_COLOR: Record<Item['estado'], string> = {
    disponible: '#4ade80', vendido: '#f87171', reservado: '#fb923c',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `linear-gradient(135deg, ${ACCENT}44 0%, ${ACCENT}88 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🏪</div>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>
                El Vecino Usados
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Panel del dueño · Núcleo IA
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href={`/nucleo/${params.slug}`}
              target="_blank"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                fontFamily: 'var(--f-display)', fontSize: 13,
              }}
            >
              <Globe size={14} />
              Ver vitrina
            </Link>
            <button
              onClick={() => { setMostrarForm(true); setEditando(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                background: LIME, color: 'var(--ink)', border: 'none', borderRadius: 8,
                fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              Agregar item
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <KPI icon="📦" label="Disponibles" value={String(disponibles)} />
          <KPI icon="✅" label="Vendidos" value={String(vendidos)} />
          <KPI icon="👁️" label="Vistas totales" value={String(totalVistas)} />
          <KPI icon="💬" label="Consultas" value={String(pendientes)} sub={pendientes > 0 ? `${pendientes} sin responder` : 'Al día'} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={TAB_STYLE(tab === 'items')} onClick={() => setTab('items')}>
            Catálogo ({items.length})
          </button>
          <button style={TAB_STYLE(tab === 'consultas')} onClick={() => setTab('consultas')}>
            Consultas {pendientes > 0 && <span style={{ marginLeft: 4, background: '#ef4444', borderRadius: 10, padding: '0 5px', fontSize: 10 }}>{pendientes}</span>}
          </button>
          <button style={TAB_STYLE(tab === 'stats')} onClick={() => setTab('stats')}>
            Estadísticas
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>

        {/* ── Tab: Catálogo ──────────────────────────────────────────────── */}
        {tab === 'items' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                opacity: item.estado === 'vendido' ? 0.6 : 1,
              }}>
                {/* Estado indicator */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: ESTADO_COLOR[item.estado],
                  boxShadow: item.estado === 'disponible' ? `0 0 6px ${ESTADO_COLOR[item.estado]}` : 'none',
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14 }}>{item.titulo}</span>
                    {item.destacado && (
                      <span style={{ fontSize: 10, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', borderRadius: 4, padding: '1px 6px', fontFamily: 'var(--f-mono)' }}>
                        ⭐ destacado
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{item.categoria}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>👁 {item.vistas}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>💬 {item.consultas}</span>
                  </div>
                </div>

                {/* Precio */}
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: LIME, flexShrink: 0 }}>
                  {item.precio ? formatARS(item.precio) : '—'}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <select
                    value={item.estado}
                    onChange={e => cambiarEstado(item.id, e.target.value as Item['estado'])}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 7, padding: '5px 8px', color: 'rgba(255,255,255,0.7)',
                      fontFamily: 'var(--f-display)', fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                  <button
                    onClick={() => toggleDestacado(item.id)}
                    title={item.destacado ? 'Quitar destacado' : 'Destacar'}
                    style={{
                      background: item.destacado ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${item.destacado ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 7, padding: '5px 9px', cursor: 'pointer', fontSize: 13,
                    }}
                  >⭐</button>
                  <button
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Consultas ──────────────────────────────────────────────── */}
        {tab === 'consultas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {consultas.map(consulta => (
              <div key={consulta.id} style={{
                background: consulta.respondida ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.06)',
                border: `1px solid ${consulta.respondida ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.2)'}`,
                borderRadius: 12, padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14 }}>{consulta.nombre}</span>
                      {!consulta.respondida && (
                        <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 4, padding: '1px 6px', fontFamily: 'var(--f-mono)' }}>
                          sin responder
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                      📦 {consulta.item} · {consulta.fecha}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!consulta.respondida && (
                      <button
                        onClick={() => responderWA(consulta)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                          background: '#25D366', color: '#fff', border: 'none', borderRadius: 8,
                          fontFamily: 'var(--f-display)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <MessageSquare size={13} />
                        Responder WA
                      </button>
                    )}
                    {consulta.respondida && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4ade80' }}>
                        <Check size={13} /> Respondida
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px',
                  fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                }}>
                  "{consulta.mensaje}"
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Stats (placeholder) ─────────────────────────────────────── */}
        {tab === 'stats' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>
              Estadísticas detalladas
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 14 }}>
              Disponible cuando el negocio tenga 7+ días de actividad
            </div>
          </div>
        )}
      </div>

      {/* Modal: agregar item */}
      {mostrarForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setMostrarForm(false) }}
        >
          <div style={{
            background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '28px', width: '100%', maxWidth: 480,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, margin: 0 }}>Nuevo item</h3>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'titulo', label: 'Título', placeholder: 'Ej: Smart TV 55" LG' },
                { key: 'descripcion', label: 'Descripción', placeholder: 'Estado, características, accesorios...' },
                { key: 'precio', label: 'Precio (ARS)', placeholder: 'Ej: 200000' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 5 }}>
                    {label}
                  </div>
                  <input
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#fff', fontFamily: 'var(--f-display)', fontSize: 13,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="destacado"
                  checked={form.destacado}
                  onChange={e => setForm(f => ({ ...f, destacado: e.target.checked }))}
                />
                <label htmlFor="destacado" style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  Destacar este item en la vitrina
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => {
                    if (!form.titulo.trim()) return
                    setItems(prev => [{
                      id: Date.now().toString(),
                      titulo: form.titulo,
                      descripcion: form.descripcion,
                      precio: form.precio ? parseInt(form.precio) : null,
                      categoria: form.categoria,
                      estado: 'disponible',
                      destacado: form.destacado,
                      vistas: 0,
                      consultas: 0,
                    }, ...prev])
                    setMostrarForm(false)
                    setForm({ titulo: '', descripcion: '', precio: '', categoria: 'Electrónica', destacado: false })
                  }}
                  style={{
                    flex: 1, padding: '11px', background: LIME, color: 'var(--ink)',
                    border: 'none', borderRadius: 9, fontFamily: 'var(--f-display)', fontWeight: 700,
                    fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}
                >
                  <Plus size={15} />
                  Publicar item
                </button>
                <button
                  onClick={() => setMostrarForm(false)}
                  style={{
                    padding: '11px 16px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
                    color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--f-display)', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
