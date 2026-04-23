'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, ExternalLink, Check, Plus, Calendar, MessageSquare, Settings, ChevronRight, User, ArrowRight } from 'lucide-react'
import { RUBROS_INFO } from '@/lib/templates-data'
import { TURNERO_PLANS } from '@/lib/turnero-plans'

interface BookingConfigMin {
  id: string
  is_active: boolean
}

interface Client {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  rubro: string
  plan: string
  status: string
  chatbot_id: string | null
  embed_code: string | null
  trial_end: string
  created_at: string
  custom_config?: Record<string, string>
  booking_configs?: BookingConfigMin[]
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Activo',    color: 'var(--ink)', bg: 'rgba(198,255,61,0.2)' },
  trial:     { label: 'Trial',     color: 'var(--ink)', bg: 'rgba(251,146,60,0.2)' },
  cancelled: { label: 'Cancelado', color: 'var(--ink)', bg: 'var(--paper-2)' },
}
const PLAN_LABEL: Record<string, string> = {
  trial: 'Trial', basic: 'Básico', starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise',
}

function getPlanColor(planId: string): string {
  const plan = TURNERO_PLANS.find(p => p.id === planId)
  if (plan) return plan.color
  if (planId === 'trial') return '#F59E0B'
  return '#6B7280'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days}d`
  return `hace ${Math.floor(days / 30)}m`
}

// ── Card individual de cliente ────────────────────────────────────
function ClientCard({ client, onRefresh }: { client: Client; onRefresh: () => void }) {
  const cfg = client.custom_config || {}
  const color = cfg.color || '#6366f1'
  const hasTurnos = client.booking_configs && client.booking_configs.length > 0
  const turnosId = hasTurnos ? client.booking_configs![0].id : null
  const turnosActive = hasTurnos ? client.booking_configs![0].is_active : false
  const hasChatbot = !!client.chatbot_id
  const status = STATUS_LABEL[client.status] || STATUS_LABEL.active
  const initial = (client.company_name || '?').charAt(0).toUpperCase()
  const productosEnabled = cfg.productos_enabled === 'true'
  const [togglingProds, setTogglingProds] = useState(false)

  async function toggleProductos() {
    setTogglingProds(true)
    await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productos_enabled: productosEnabled ? 'false' : 'true' }),
    })
    setTogglingProds(false)
    onRefresh()
  }

  return (
    <div style={{
      background: 'var(--paper)',
      borderRadius: 16,
      border: '1px solid var(--line)',
      overflow: 'hidden',
    }}>
      <div style={{ height: 4, width: '100%', backgroundColor: color }} />
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 18, flexShrink: 0,
            backgroundColor: color,
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15, lineHeight: 1.2, margin: 0 }}>{client.company_name}</h3>
            {client.contact_name && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={11} /> {client.contact_name}
              </p>
            )}
            <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              color: status.color,
              background: status.bg,
              borderRadius: 100,
              padding: '3px 10px',
            }}>
              {status.label}
            </span>
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: getPlanColor(client.plan) === '#C6FF3D' ? 'var(--ink)' : '#fff',
              background: getPlanColor(client.plan),
              borderRadius: 100, padding: '3px 8px', fontWeight: 700,
            }}>{PLAN_LABEL[client.plan] || client.plan}</span>
          </div>
        </div>

        {/* Productos activos */}
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8,
          }}>Servicios</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hasChatbot && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                backgroundColor: color + '15', color,
              }}>
                <MessageSquare size={12} /> Chatbot
              </div>
            )}
            {hasTurnos ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                ...(turnosActive
                  ? { backgroundColor: 'rgba(198,255,61,0.2)', color: 'var(--ink)' }
                  : { backgroundColor: 'var(--paper-2)', color: 'var(--muted)' }),
              }}>
                <Calendar size={12} /> Turnos {!turnosActive && '(inactivo)'}
              </div>
            ) : null}
            {!hasChatbot && !hasTurnos && (
              <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>Sin productos activos</span>
            )}
          </div>
        </div>

        {/* Toggle productos DIVINIA */}
        {hasTurnos && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: 'var(--paper-2)', border: '1px solid var(--line)', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
              🛍️ <span>Módulo Productos</span>
            </span>
            <button onClick={toggleProductos} disabled={togglingProds}
              style={{ width: 38, height: 22, borderRadius: 100, border: 'none', position: 'relative', cursor: 'pointer', background: productosEnabled ? '#16a34a' : 'var(--line)', transition: 'background 0.2s', opacity: togglingProds ? 0.5 : 1 }}>
              <span style={{ position: 'absolute', top: 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: productosEnabled ? 19 : 3 }} />
            </button>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hasChatbot && client.chatbot_id && (
            <a href={`/api/chatbot/${client.chatbot_id}`} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)',
                fontSize: 13, color: 'var(--ink)', textDecoration: 'none',
              }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={14} style={{ color }} /> Probar chatbot
              </span>
              <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
            </a>
          )}
          {hasTurnos && turnosId && (
            <>
              <a href={`/panel/${turnosId}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)',
                  fontSize: 13, color: 'var(--ink)', textDecoration: 'none',
                }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} style={{ color: '#16a34a' }} /> Panel del negocio
                </span>
                <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
              </a>
              <a href={`/reservas/${turnosId}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)',
                  fontSize: 13, color: 'var(--ink)', textDecoration: 'none',
                }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} style={{ color: '#3b82f6' }} /> Link de reservas (público)
                </span>
                <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
              </a>
            </>
          )}
          <a href={`/turnos/config/${client.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)',
              fontSize: 13, color: 'var(--ink)', textDecoration: 'none',
            }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={14} style={{ color: 'var(--muted)' }} />
              {hasTurnos ? 'Editar turnos' : 'Activar sistema de turnos'}
            </span>
            <ChevronRight size={12} style={{ color: 'var(--muted)' }} />
          </a>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, textAlign: 'right', fontFamily: 'var(--f-mono)' }}>
          Cliente {timeAgo(client.created_at)}
        </p>
      </div>
    </div>
  )
}

// ── Formulario nuevo cliente — 2 pasos ───────────────────────────
const PRODUCTOS = [
  {
    id: 'turnos',
    emoji: '📅',
    title: 'Sistema de Turnos',
    desc: 'Reservas online, panel de agenda, notificaciones',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    id: 'chatbot',
    emoji: '💬',
    title: 'Chatbot WhatsApp',
    desc: 'Asistente IA para responder consultas automáticamente',
    color: '#6366f1',
    bg: '#ede9fe',
  },
]

function NuevoClienteForm({ templates, onCreated }: { templates: { id: string; name: string; rubro: string }[]; onCreated: () => void }) {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    company_name: searchParams.get('company') || '',
    contact_name: '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    rubro: '',
    city: '',
    plan: 'trial',
  })
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function toggleProduct(id: string) {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  async function createClient() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, products: selectedProducts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear cliente')
      setCreated(data.client)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function copyEmbed() {
    if (created?.embed_code) {
      navigator.clipboard.writeText(created.embed_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid var(--line)', borderRadius: 10,
    padding: '10px 12px', fontSize: 13, outline: 'none',
    background: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
  }
  const cardStyle: React.CSSProperties = {
    background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: 24, maxWidth: 520,
  }

  // ── Pantalla de éxito ──
  if (created) {
    const wantsTurnos = selectedProducts.includes('turnos')
    const wantsChatbot = selectedProducts.includes('chatbot')
    return (
      <div style={{ ...cardStyle, borderColor: 'rgba(198,255,61,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, background: 'rgba(198,255,61,0.2)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>✅</div>
          <div>
            <h3 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>¡{created.company_name} creado!</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              {selectedProducts.map(p => PRODUCTOS.find(x => x.id === p)?.title).join(' + ')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {wantsTurnos && (
            <a href={`/turnos/config/${created.id}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 16, borderRadius: 10, border: '2px solid rgba(198,255,61,0.4)',
                background: 'rgba(198,255,61,0.08)', textDecoration: 'none',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>📅</span>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13, margin: 0 }}>Configurar el sistema de turnos</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>Cargar servicios, horarios y generar los links</p>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: 'var(--ink)' }} />
            </a>
          )}

          {wantsChatbot && created.embed_code && (
            <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--paper-2)' }}>
              <p style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={12} /> Código de instalación del chatbot
              </p>
              <code style={{
                fontSize: 11, color: 'var(--ink)', wordBreak: 'break-all', lineHeight: 1.5,
                display: 'block', background: 'var(--paper)', borderRadius: 8,
                padding: 12, border: '1px solid var(--line)', fontFamily: 'var(--f-mono)',
              }}>
                {created.embed_code}
              </code>
              <button onClick={copyEmbed}
                style={{
                  marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 600, color: 'var(--ink)', background: 'none',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)',
                }}>
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar código</>}
              </button>
            </div>
          )}
        </div>

        <button onClick={() => { setCreated(null); setStep(1); setSelectedProducts([]) }}
          style={{
            width: '100%', textAlign: 'center', fontSize: 13, color: 'var(--muted)',
            fontWeight: 600, padding: '12px 0', marginTop: 16, background: 'none',
            border: 'none', cursor: 'pointer',
          }}>
          + Crear otro cliente
        </button>
      </div>
    )
  }

  // ── Paso 1: Datos del cliente ──
  if (step === 1) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)',
            color: 'var(--paper)', fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>1</span>
          <h2 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Datos del cliente</h2>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono)' }}>Paso 1 de 2</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Empresa *</label>
              <input required type="text" value={form.company_name}
                onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                style={inputStyle} placeholder="Nombre del negocio" />
            </div>
            <div>
              <label style={labelStyle}>Contacto *</label>
              <input required type="text" value={form.contact_name}
                onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                style={inputStyle} placeholder="Nombre" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input required type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={inputStyle} placeholder="5492664000000" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Rubro *</label>
              <select required value={form.rubro} onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
                style={{ ...inputStyle }}>
                <option value="">Seleccioná</option>
                {RUBROS_INFO.map(r => <option key={r.rubro} value={r.rubro}>{r.emoji} {r.name.replace('Chatbot para ', '')}</option>)}
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input type="text" value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                style={inputStyle} placeholder="San Luis" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Plan</label>
            <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
              style={{ ...inputStyle }}>
              <option value="trial">Trial</option>
              {TURNERO_PLANS.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} — ${p.precio.toLocaleString('es-AR')}/mes</option>
              ))}
            </select>
          </div>
          <button
            disabled={!form.company_name || !form.contact_name || !form.email || !form.rubro}
            onClick={() => setStep(2)}
            style={{
              width: '100%', background: 'var(--ink)', color: 'var(--paper)',
              borderRadius: 10, padding: '12px 0', fontFamily: 'var(--f-mono)',
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, opacity: (!form.company_name || !form.contact_name || !form.email || !form.rubro) ? 0.4 : 1,
            }}>
            Siguiente — Elegir productos <ArrowRight size={14} />
          </button>
        </div>
      </div>
    )
  }

  // ── Paso 2: Selección de productos ──
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)',
          color: 'var(--paper)', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>2</span>
        <h2 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>¿Qué productos contrata?</h2>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono)' }}>Paso 2 de 2</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, marginLeft: 32 }}>
        Para <strong style={{ color: 'var(--ink)' }}>{form.company_name}</strong> — podés elegir uno o los dos
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {PRODUCTOS.map(prod => {
          const sel = selectedProducts.includes(prod.id)
          return (
            <button key={prod.id} onClick={() => toggleProduct(prod.id)}
              style={{
                textAlign: 'left', padding: 16, borderRadius: 10, border: `2px solid ${sel ? prod.color : 'var(--line)'}`,
                background: sel ? prod.bg : 'var(--paper)', cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, border: `2px solid ${sel ? prod.color : 'var(--line)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  background: sel ? prod.color : 'transparent', transition: 'all 0.15s',
                }}>
                  {sel && <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    {prod.emoji} {prod.title}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, margin: 0 }}>{prod.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <div style={{
          fontSize: 13, color: '#dc2626', background: '#fee2e2',
          padding: '10px 12px', borderRadius: 10, marginBottom: 12,
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setStep(1)}
          style={{
            padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)',
            fontSize: 13, fontWeight: 500, color: 'var(--muted-2)', background: 'var(--paper)', cursor: 'pointer',
          }}>
          ← Atrás
        </button>
        <button
          onClick={createClient}
          disabled={loading || selectedProducts.length === 0}
          style={{
            flex: 1, background: 'var(--ink)', color: 'var(--paper)',
            borderRadius: 10, fontFamily: 'var(--f-mono)', fontSize: 11,
            letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none',
            cursor: 'pointer', padding: '12px 0',
            opacity: (loading || selectedProducts.length === 0) ? 0.4 : 1,
          }}>
          {loading ? 'Creando...' : selectedProducts.length === 0
            ? 'Elegí al menos un producto'
            : `Crear cliente con ${selectedProducts.map(p => PRODUCTOS.find(x => x.id === p)?.emoji).join(' + ')}`}
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [templates, setTemplates] = useState<{ id: string; name: string; rubro: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'lista' | 'nuevo'>('lista')
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('todos')
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  async function loadClients(autoSeedIfEmpty = false) {
    const res = await fetch('/api/clients')
    const data = await res.json()
    const list: Client[] = data.clients || []

    const countWithTurnos = list.filter(c => c.booking_configs && c.booking_configs.length > 0).length
    const needsSeed = list.length === 0 || (list.length > 1 && countWithTurnos < list.length - 1)

    if (needsSeed && autoSeedIfEmpty) {
      setSeeding(true)
      try {
        const r1 = await fetch('/api/seed/demo-clientes')
        const d1 = await r1.json()
        if (!d1.success) throw new Error('demo-clientes: ' + JSON.stringify(d1))
        const cfgErrors = d1.results?.filter((r: {cfg_error?: string}) => r.cfg_error).map((r: {name: string; cfg_error: string}) => `${r.name}: ${r.cfg_error}`)
        if (cfgErrors?.length > 0) throw new Error('Booking config error: ' + cfgErrors.join(' | '))
        const r2 = await fetch('/api/seed/demo-rufina')
        const d2 = await r2.json()
        if (d2.error) throw new Error('demo-rufina: ' + d2.error + (d2.detail ? ' — ' + d2.detail : ''))
        const r3 = await fetch('/api/seed/demo-top-quality')
        const d3 = await r3.json()
        if (d3.error) throw new Error('demo-top-quality: ' + d3.error + (d3.detail ? ' — ' + d3.detail : ''))
        const res2 = await fetch('/api/clients')
        const data2 = await res2.json()
        const final: Client[] = data2.clients || []
        if (final.length === 0) throw new Error('Seed corrió pero BD devuelve 0 clientes — revisá SUPABASE_SERVICE_ROLE_KEY en Vercel')
        setClients(final)
      } catch (e) {
        setSeedMsg('❌ ' + (e instanceof Error ? e.message : 'Error conectando con Supabase — revisá SUPABASE_SERVICE_ROLE_KEY en Vercel → Settings → Environment Variables'))
        setClients([])
      } finally {
        setSeeding(false)
      }
    } else {
      setClients(list)
    }
    setLoading(false)
  }

  async function cargarDemos() {
    setSeeding(true)
    setSeedMsg('')
    try {
      await fetch('/api/seed')
      await fetch('/api/seed/demo-clientes')
      await fetch('/api/seed/demo-rufina')
      await fetch('/api/seed/demo-top-quality')
      await loadClients()
      setSeedMsg('✅ Clientes recargados')
      setTimeout(() => setSeedMsg(''), 3000)
    } catch {
      setSeedMsg('❌ Error — Supabase no conecta')
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    loadClients(true)
    fetch('/api/templates').then(r => r.json()).then(d => setTemplates(d.templates || []))
  }, [])

  const filtered = clients.filter(c => {
    const matchSearch = !search ||
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'todos' || c.plan === planFilter || c.status === planFilter
    return matchSearch && matchPlan
  })

  const countActive  = clients.filter(c => c.status === 'active').length
  const countTrial   = clients.filter(c => c.status === 'trial').length
  const countTurnos  = clients.filter(c => c.booking_configs && c.booking_configs.length > 0).length
  const countChatbot = clients.filter(c => !!c.chatbot_id).length

  // MRR: clientes activos × precio de su plan
  const PLAN_PRICES: Record<string, number> = { mensual: 45000, anual: 35000, unico: 0, trial: 0, basic: 45000, starter: 45000, pro: 35000, enterprise: 35000 }
  const mrr = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + (PLAN_PRICES[c.plan] || 0), 0)

  const allPlans = Array.from(new Set(clients.map(c => c.plan))).filter(Boolean) as string[]

  return (
    <div style={{ background: 'var(--paper-2)', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
              DIVINIA OS · Ventas
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Clientes
              <span style={{
                marginLeft: 10, fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 400,
                color: 'var(--muted)', verticalAlign: 'middle',
              }}>
                {clients.length > 0 && `${clients.length}`}
              </span>
            </h1>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>
              {countActive} activos · {countTrial} en trial · {countTurnos} con turnos · {countChatbot} con chatbot
            </p>
            {mrr > 0 && (
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                💰 MRR estimado: {new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0}).format(mrr)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={cargarDemos}
              disabled={seeding}
              title="Recarga los clientes demo (Rufina Nails + Top Quality)"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                borderRadius: 8, fontFamily: 'var(--f-mono)', fontSize: 10,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                border: '1px solid var(--line)',
                background: 'var(--paper)', color: 'var(--muted-2)', cursor: 'pointer',
                opacity: seeding ? 0.5 : 1,
              }}>
              {seeding ? '⏳' : '🔄'} Demos
            </button>
            <button
              onClick={() => setTab(tab === 'nuevo' ? 'lista' : 'nuevo')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                borderRadius: 8, fontFamily: 'var(--f-mono)', fontSize: 11,
                letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none',
                background: tab === 'nuevo' ? 'var(--paper-2)' : 'var(--ink)',
                color: tab === 'nuevo' ? 'var(--muted-2)' : 'var(--paper)', cursor: 'pointer',
              }}>
              <Plus size={13} />
              {tab === 'nuevo' ? 'Ver clientes' : 'Nuevo cliente'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
      {seedMsg && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          ...(seedMsg.startsWith('✅')
            ? { background: 'rgba(198,255,61,0.15)', color: 'var(--ink)', border: '1px solid rgba(198,255,61,0.3)' }
            : { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }),
        }}>
          {seedMsg}
        </div>
      )}

      {tab === 'nuevo' ? (
        <Suspense fallback={null}>
          <NuevoClienteForm templates={templates} onCreated={() => { loadClients(); }} />
        </Suspense>
      ) : (
        <>
          <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              style={{
                border: '1px solid var(--line)', borderRadius: 10,
                padding: '8px 14px', fontSize: 13, outline: 'none',
                background: 'var(--paper)', color: 'var(--ink)', width: 220,
              }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['todos', 'active', 'trial', ...allPlans] as string[]).filter((v,i,a)=>a.indexOf(v)===i).map(f => {
                const label: Record<string,string> = {todos:'Todos',active:'Activos',trial:'Trial',mensual:'Mensual',anual:'Anual',unico:'Pago único',basic:'Básico',pro:'Pro',enterprise:'Enterprise'}
                return (
                  <button key={f} onClick={() => setPlanFilter(f)}
                    style={{ padding: '6px 12px', borderRadius: 100, fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--line)', cursor: 'pointer', fontWeight: planFilter === f ? 700 : 400, background: planFilter === f ? 'var(--ink)' : 'var(--paper)', color: planFilter === f ? 'var(--paper)' : 'var(--muted)', transition: 'all 0.15s' }}>
                    {label[f] || f}
                  </button>
                )
              })}
            </div>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', height: 256,
                  animation: 'pulse 2s infinite',
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: 'var(--paper)', borderRadius: 16, border: '1px dashed var(--line)',
              padding: '64px 40px', textAlign: 'center',
            }}>
              {seeding ? (
                <>
                  <div style={{
                    width: 48, height: 48, border: '4px solid var(--line)', borderTopColor: 'var(--ink)',
                    borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite',
                  }} />
                  <p style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Cargando clientes...</p>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>Reconectando con la base de datos</p>
                </>
              ) : seedMsg ? (
                <>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>⚠️</p>
                  <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Error al cargar clientes</p>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8, maxWidth: 400, margin: '0 auto 8px' }}>
                    Falta <code style={{ fontFamily: 'var(--f-mono)', fontSize: 11, background: 'var(--paper-2)', padding: '2px 6px', borderRadius: 4 }}>SUPABASE_SERVICE_ROLE_KEY</code> en las variables de entorno de Vercel.
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 16 }}>
                    Vercel → Settings → Environment Variables → agregá la key del proyecto Supabase
                  </p>
                  <button onClick={cargarDemos} disabled={seeding}
                    style={{
                      background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--f-mono)',
                      fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                      border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
                      opacity: seeding ? 0.5 : 1,
                    }}>
                    🔄 Reintentar
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>👥</p>
                  <h3 style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{search ? 'Sin resultados' : 'No hay clientes todavía'}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{search ? 'Probá con otro término' : 'Creá tu primer cliente para empezar'}</p>
                  {!search && (
                    <button onClick={() => setTab('nuevo')}
                      style={{
                        background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--f-mono)',
                        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                        border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
                      }}>
                      + Crear cliente nuevo
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map(client => <ClientCard key={client.id} client={client} onRefresh={() => loadClients()} />)}
            </div>
          )}
        </>
      )}
      </div>{/* /padding wrapper */}
    </div>
  )
}
