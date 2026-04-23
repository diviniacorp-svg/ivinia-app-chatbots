'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, ExternalLink, Check, Plus, Calendar, MessageSquare, Settings, ChevronRight, User, ArrowRight, Pencil, X, Trash2 } from 'lucide-react'
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
  mrr: number
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

// ── Drawer de edición de cliente ─────────────────────────────────
function EditClientDrawer({
  client,
  onClose,
  onSaved,
}: {
  client: Client
  onClose: () => void
  onSaved: (updated: Client) => void
}) {
  const cfg = client.custom_config || {}
  const [form, setForm] = useState({
    company_name: client.company_name,
    contact_name: client.contact_name,
    email: client.email,
    phone: client.phone,
    plan: client.plan,
    status: client.status,
    mrr: client.mrr || 0,
    color: cfg.color || '#6366f1',
    products: cfg.products || '',
    city: cfg.city || cfg.company_name || '',
    instagram: cfg.instagram || '',
    whatsapp: cfg.whatsapp || '',
    intro_tagline: cfg.intro_tagline || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function save() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      onSaved(data.client)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function deleteClient() {
    if (!confirm(`¿Eliminar ${client.company_name}? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      onClose()
      onSaved({ ...client, id: '__deleted__' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
      setDeleting(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', border: '1px solid var(--line)', borderRadius: 8,
    padding: '8px 10px', fontSize: 13, outline: 'none',
    background: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 998, backdropFilter: 'blur(2px)',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--paper)', zIndex: 999, overflowY: 'auto',
        borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: form.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 15, flexShrink: 0,
          }}>
            {form.company_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Editando</p>
            <h3 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0, fontSize: 16 }}>{client.company_name}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Empresa</label>
              <input style={inp} value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Contacto</label>
              <input style={inp} value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>WhatsApp / Teléfono</label>
              <input style={inp} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="5492664000000" />
            </div>
            <div>
              <label style={lbl}>Ciudad</label>
              <input style={inp} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="San Luis" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Plan</label>
              <select style={inp} value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                <option value="trial">Trial</option>
                {TURNERO_PLANS.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={inp} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="trial">Trial</option>
                <option value="active">Activo</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>MRR mensual (ARS)</label>
            <input style={inp} type="number" value={form.mrr} onChange={e => setForm(p => ({ ...p, mrr: Number(e.target.value) }))} placeholder="0" />
          </div>

          <div>
            <label style={lbl}>Productos activos (separados por coma)</label>
            <input style={inp} value={form.products} onChange={e => setForm(p => ({ ...p, products: e.target.value }))} placeholder="web,chatbot,turnero,nucleus,content" />
            <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>Opciones: web · chatbot · turnero · nucleus · content</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Instagram</label>
              <input style={inp} value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@cuenta" />
            </div>
            <div>
              <label style={lbl}>WhatsApp negocio</label>
              <input style={inp} value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="5492664000000" />
            </div>
          </div>

          <div>
            <label style={lbl}>Tagline / descripción corta</label>
            <input style={inp} value={form.intro_tagline} onChange={e => setForm(p => ({ ...p, intro_tagline: e.target.value }))} placeholder="Descripción del negocio" />
          </div>

          <div>
            <label style={lbl}>Color de marca</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                style={{ width: 40, height: 36, border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input style={{ ...inp, flex: 1 }} value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="#6366f1" />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#dc2626', background: '#fee2e2', padding: '8px 12px', borderRadius: 8 }}>{error}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={deleteClient}
            disabled={deleting}
            style={{
              padding: '10px 14px', borderRadius: 8, border: '1px solid #fca5a5',
              background: '#fee2e2', color: '#dc2626', cursor: 'pointer', flexShrink: 0,
              opacity: deleting ? 0.5 : 1,
            }}>
            <Trash2 size={14} />
          </button>
          <button onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--line)',
              background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 13,
            }}>
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={loading}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 8, border: 'none',
              background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em',
              textTransform: 'uppercase', fontWeight: 700, opacity: loading ? 0.5 : 1,
            }}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Card individual de cliente ────────────────────────────────────
function ClientCard({ client: initialClient, onRefresh }: { client: Client; onRefresh: () => void }) {
  const [client, setClient] = useState(initialClient)
  const [editing, setEditing] = useState(false)

  function handleSaved(updated: Client) {
    if (updated.id === '__deleted__') { onRefresh(); return }
    setClient(updated)
    setEditing(false)
    onRefresh()
  }

  const cfg = client.custom_config || {}
  const color = cfg.color || '#6366f1'
  const hasTurnos = !!(client.booking_configs && client.booking_configs.length > 0)
  const turnosId = hasTurnos ? client.booking_configs![0].id : null
  const turnosActive = hasTurnos ? client.booking_configs![0].is_active : false
  const status = STATUS_LABEL[client.status] || STATUS_LABEL.active
  const initial = (client.company_name || '?').charAt(0).toUpperCase()
  const activeProducts = getClientProducts(client)

  return (
    <>
    {editing && <EditClientDrawer client={client} onClose={() => setEditing(false)} onSaved={handleSaved} />}
    <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ height: 4, width: '100%', backgroundColor: color }} />
      <div style={{ padding: '20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 17, backgroundColor: color,
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
            <button onClick={() => setEditing(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px 4px', borderRadius: 6 }}
              title="Editar cliente">
              <Pencil size={13} />
            </button>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: status.color, background: status.bg, borderRadius: 100, padding: '3px 10px' }}>
              {status.label}
            </span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: getPlanColor(client.plan) === '#C6FF3D' ? 'var(--ink)' : '#fff', background: getPlanColor(client.plan), borderRadius: 100, padding: '3px 8px', fontWeight: 700 }}>
              {PLAN_LABEL[client.plan] || client.plan}
            </span>
          </div>
        </div>

        {/* Productos activos — badges por cada producto */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            Productos
          </p>
          {activeProducts.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>Sin productos registrados</span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeProducts.map(pid => {
                const p = PRODUCTOS.find(x => x.id === pid || (pid === 'turnos' && x.id === 'turnero'))
                if (!p) return null
                return (
                  <span key={pid} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: p.bg, color: p.color, border: `1px solid ${p.color}30`,
                  }}>
                    {p.emoji} {p.title}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Acciones contextuales según productos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {client.chatbot_id && !activeProducts.includes('nucleus') && (
            <a href={`/api/chatbot/${client.chatbot_id}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={13} style={{ color: '#6366F1' }} /> Probar chatbot
              </span>
              <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
            </a>
          )}
          {activeProducts.includes('nucleus') && (
            <a href={`/nucleo?client=${client.id}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#A78BFA', fontSize: 13 }}>🧠</span> Panel NUCLEUS
              </span>
              <ChevronRight size={12} style={{ color: 'var(--muted)' }} />
            </a>
          )}
          {hasTurnos && turnosId && (
            <>
              <a href={`/panel/${turnosId}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={13} style={{ color: '#10B981' }} /> Panel del negocio {!turnosActive && <span style={{ fontSize: 10, color: 'var(--muted)' }}>(inactivo)</span>}
                </span>
                <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
              </a>
              <a href={`/reservas/${turnosId}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={13} style={{ color: '#3b82f6' }} /> Link de reservas
                </span>
                <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
              </a>
            </>
          )}
          <a href={`/turnos/config/${client.id}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={13} style={{ color: 'var(--muted)' }} />
              Configurar
            </span>
            <ChevronRight size={12} style={{ color: 'var(--muted)' }} />
          </a>
        </div>

        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 12, textAlign: 'right', fontFamily: 'var(--f-mono)' }}>
          {timeAgo(client.created_at)}
        </p>
      </div>
    </div>
    </>
  )
}

// ── Productos disponibles ─────────────────────────────────────────
const PRODUCTOS = [
  { id: 'web',     emoji: '🌐', title: 'Web / Landing',    desc: 'Página o webapp administrada por DIVINIA',          color: '#38BDF8', bg: '#EFF6FF' },
  { id: 'turnero', emoji: '📅', title: 'Turnero IA',       desc: 'Sistema de reservas online con panel de agenda',    color: '#10B981', bg: '#F0FDF4' },
  { id: 'chatbot', emoji: '💬', title: 'Chatbot IA',       desc: 'Asistente IA para WhatsApp o web',                  color: '#6366F1', bg: '#EDE9FE' },
  { id: 'nucleus', emoji: '🧠', title: 'NUCLEUS IA',       desc: 'Cerebro IA completo — panel público + privado',     color: '#A78BFA', bg: '#F5F3FF' },
  { id: 'content', emoji: '✨', title: 'Content Factory',  desc: 'Gestión de contenido y redes sociales con IA',      color: '#F59E0B', bg: '#FFFBEB' },
]

// ── Helper: productos activos de un cliente ───────────────────────
function getClientProducts(client: Client): string[] {
  const fromConfig = (client.custom_config?.products || '').split(',').filter(Boolean)
  const detected: string[] = []
  if (client.chatbot_id && !fromConfig.includes('chatbot')) detected.push('chatbot')
  if (client.booking_configs?.length && !fromConfig.includes('turnero')) detected.push('turnero')
  const combined = [...fromConfig, ...detected]
  return combined.filter((v, i) => combined.indexOf(v) === i)
}

// ── Formulario nuevo cliente — 2 pasos ───────────────────────────

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
      // Mapear 'turnero' → 'turnos' para el API (compatibilidad)
      const apiProducts = selectedProducts.map(p => p === 'turnero' ? 'turnos' : p)
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, products: apiProducts }),
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
        <h2 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>¿Qué productos tiene?</h2>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono)' }}>Paso 2 de 2</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, marginLeft: 32 }}>
        Para <strong style={{ color: 'var(--ink)' }}>{form.company_name}</strong> — elegí todos los que aplican
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 20 }}>
        {PRODUCTOS.map(prod => {
          const sel = selectedProducts.includes(prod.id)
          return (
            <button key={prod.id} onClick={() => toggleProduct(prod.id)}
              style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 10,
                border: `2px solid ${sel ? prod.color : 'var(--line)'}`,
                background: sel ? prod.bg : 'var(--paper)', cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? prod.color : 'var(--line)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                  background: sel ? prod.color : 'transparent', transition: 'all 0.15s',
                }}>
                  {sel && <svg width="10" height="10" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {prod.emoji} {prod.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{prod.desc}</div>
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
  const [servicioFilter, setServicioFilter] = useState<'todos' | 'nucleus' | 'turnero' | 'web' | 'pendientes'>('todos')
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [loadingProyectos, setLoadingProyectos] = useState(false)

  async function cargarMisProyectos() {
    setLoadingProyectos(true); setSeedMsg('')
    try {
      const res = await fetch('/api/seed/mis-proyectos')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setSeedMsg(`✅ ${data.message}`)
      await loadClients()
      setTimeout(() => setSeedMsg(''), 4000)
    } catch (e) {
      setSeedMsg(`❌ ${e instanceof Error ? e.message : 'Error al cargar proyectos'}`)
    } finally {
      setLoadingProyectos(false)
    }
  }

  async function loadClients() {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setClients(data.clients || [])
    } catch (e) {
      setSeedMsg('❌ Error conectando con Supabase — revisá SUPABASE_SERVICE_ROLE_KEY en Vercel')
    } finally {
      setLoading(false)
    }
  }

  async function cargarDemos() {
    setSeeding(true)
    setSeedMsg('')
    try {
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
    loadClients()
    fetch('/api/templates').then(r => r.json()).then(d => setTemplates(d.templates || []))
  }, [])

  const filtered = clients.filter(c => {
    const matchSearch = !search ||
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'todos' || c.plan === planFilter || c.status === planFilter
    const prods = getClientProducts(c)
    const isPendiente = c.status === 'trial' || Number(c.mrr || 0) === 0
    const matchServicio = servicioFilter === 'todos' ||
      (servicioFilter === 'pendientes' && isPendiente) ||
      prods.includes(servicioFilter) ||
      (servicioFilter === 'turnero' && prods.includes('turnos'))
    return matchSearch && matchPlan && matchServicio
  })

  const countActive  = clients.filter(c => c.status === 'active').length
  const countTrial   = clients.filter(c => c.status === 'trial').length
  const countTurnos  = clients.filter(c => c.booking_configs && c.booking_configs.length > 0).length
  const countChatbot = clients.filter(c => !!c.chatbot_id).length

  // MRR real desde el campo mrr de Supabase
  const mrr = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + Number(c.mrr || 0), 0)

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
              onClick={cargarMisProyectos}
              disabled={loadingProyectos}
              title="Carga Buggi, El Shopping del Usado, Oniria, Eco SL, ParkingSL y Tubi"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                borderRadius: 8, fontFamily: 'var(--f-mono)', fontSize: 10,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                border: '1px solid rgba(139,92,246,0.4)',
                background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', cursor: 'pointer',
                opacity: loadingProyectos ? 0.5 : 1,
              }}>
              {loadingProyectos ? '⏳' : '🚀'} Mis proyectos
            </button>
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
          <NuevoClienteForm templates={templates} onCreated={loadClients} />
        </Suspense>
      ) : (
        <>
          {/* Tabs de servicio */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {([
              { id: 'todos', label: 'Todos', icon: '👥' },
              { id: 'nucleus', label: 'NUCLEUS', icon: '🧠', color: '#A78BFA' },
              { id: 'turnero', label: 'Turnero', icon: '📅', color: '#10B981' },
              { id: 'web', label: 'Web', icon: '🌐', color: '#38BDF8' },
              { id: 'pendientes', label: 'Por activar', icon: '⚡', color: '#F59E0B' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setServicioFilter(t.id as typeof servicioFilter)}
                style={{
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  border: `1px solid ${'color' in t && servicioFilter === t.id ? t.color : servicioFilter === t.id ? 'var(--ink)' : 'var(--line)'}`,
                  background: servicioFilter === t.id ? ('color' in t ? t.color + '18' : 'var(--ink)') : 'transparent',
                  color: servicioFilter === t.id ? ('color' in t ? t.color : 'var(--paper)') : 'var(--muted)',
                  fontWeight: servicioFilter === t.id ? 700 : 400,
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {servicioFilter === 'pendientes' && filtered.length > 0 && (
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
              Clientes · pendientes de activar o sin facturación
            </div>
          )}

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
