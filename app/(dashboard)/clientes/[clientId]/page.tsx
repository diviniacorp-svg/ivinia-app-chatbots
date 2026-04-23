'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, Pencil, Trash2, X, Globe,
  Calendar, MessageSquare, Cpu, Sparkles, Check,
  Phone, Mail, MapPin, Instagram, Copy, FileText,
  Zap, AlertCircle, Clock, TrendingUp, RefreshCw,
  ChevronRight, Plus,
} from 'lucide-react'
import { TURNERO_PLANS } from '@/lib/turnero-plans'

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
  mrr: number
  created_at: string
  updated_at?: string
  custom_config?: Record<string, string>
  booking_configs?: { id: string; is_active: boolean }[]
}

const PLAN_LABEL: Record<string, string> = {
  trial: 'Trial', basic: 'Básico', starter: 'Starter',
  pro: 'Pro', enterprise: 'Enterprise',
}

const STATUS = {
  active:    { label: 'Activo',    bg: 'rgba(198,255,61,0.18)', color: 'var(--ink)' },
  trial:     { label: 'Trial',     bg: 'rgba(251,146,60,0.18)', color: 'var(--ink)' },
  cancelled: { label: 'Cancelado', bg: 'var(--paper-2)',         color: 'var(--muted)' },
}

const PRODUCTOS_META = [
  { id: 'nucleus',  emoji: '🧠', title: 'NUCLEUS IA',      color: '#A78BFA', bg: '#F5F3FF', desc: 'Landing pública + panel interno de gestión con IA' },
  { id: 'web',      emoji: '🌐', title: 'Web / Landing',   color: '#38BDF8', bg: '#EFF6FF', desc: 'Página web o landing page administrada por DIVINIA' },
  { id: 'turnero',  emoji: '📅', title: 'Turnero IA',      color: '#10B981', bg: '#F0FDF4', desc: 'Sistema de reservas online con panel de agenda' },
  { id: 'chatbot',  emoji: '💬', title: 'Chatbot IA',      color: '#6366F1', bg: '#EDE9FE', desc: 'Asistente IA para WhatsApp o web 24hs' },
  { id: 'content',  emoji: '✨', title: 'Content Factory', color: '#F59E0B', bg: '#FFFBEB', desc: 'Gestión de contenido y redes sociales con IA' },
]

function getPlanColor(planId: string): string {
  const plan = TURNERO_PLANS.find(p => p.id === planId)
  if (plan) return plan.color
  if (planId === 'trial') return '#F59E0B'
  return '#6B7280'
}

function copyText(text: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 1500)
}

function monthsAgo(dateStr: string): number {
  if (!dateStr) return 0
  const start = new Date(dateStr)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

// ── Inline editable field ──────────────────────────────────────────
function InlineEdit({
  label, value, fieldKey, clientId, onSaved,
  type = 'text', multiline = false,
}: {
  label: string, value: string, fieldKey: string,
  clientId: string, onSaved: (val: string) => void,
  type?: string, multiline?: boolean,
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [fieldKey]: val }),
    })
    setSaving(false)
    setEditing(false)
    onSaved(val)
  }

  const inp: React.CSSProperties = {
    border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px',
    fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)',
    width: '100%', boxSizing: 'border-box',
  }

  return (
    <div>
      {label && (
        <div style={{
          fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
        }}>{label}</div>
      )}
      {editing ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          {multiline
            ? <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={val} onChange={e => setVal(e.target.value)} autoFocus />
            : <input style={inp} type={type} value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} autoFocus />
          }
          <button onClick={save} disabled={saving}
            style={{ background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}>
            {saving ? '...' : <Check size={13} />}
          </button>
          <button onClick={() => { setEditing(false); setVal(value) }}
            style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          style={{
            fontSize: 13, color: val ? 'var(--ink)' : 'var(--muted)',
            cursor: 'text', padding: '6px 0',
            borderBottom: '1px dashed transparent',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderBottomColor = 'var(--line)')}
          onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
        >
          {val
            ? <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{val}</span>
            : <span style={{ fontStyle: 'italic', color: 'var(--muted)' }}>Agregar...</span>
          }
          <Pencil size={10} style={{ color: 'var(--muted)', opacity: 0.5, marginLeft: 'auto', flexShrink: 0 }} />
        </div>
      )}
    </div>
  )
}

// ── URL row ────────────────────────────────────────────────────────
function UrlRow({ icon, label, href, color, clientId, fieldKey, onSaved }: {
  icon: React.ReactNode, label: string, href: string, color: string,
  clientId: string, fieldKey: string, onSaved: (v: string) => void,
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(href)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [fieldKey]: val }),
    })
    setSaving(false)
    setEditing(false)
    onSaved(val)
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 0' }}>
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          style={{
            flex: 1, border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px',
            fontSize: 12, outline: 'none', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'var(--f-mono)',
          }}
          placeholder="https://..."
        />
        <button onClick={save} disabled={saving}
          style={{ background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
          {saving ? '...' : <Check size={12} />}
        </button>
        <button onClick={() => { setEditing(false); setVal(href) }}
          style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}>
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10,
      background: 'var(--paper-2)', border: '1px solid var(--line)',
      cursor: 'default',
    }}>
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 11, fontFamily: 'var(--f-mono)', color: 'var(--muted)', flexShrink: 0, minWidth: 90 }}>{label}</span>
      <span style={{
        flex: 1, fontSize: 12, color: href ? 'var(--ink)' : 'var(--muted)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontStyle: href ? 'normal' : 'italic',
      }}>
        {href || 'Sin URL'}
      </span>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {href && (
          <>
            <button onClick={() => copyText(href, setCopied)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, display: 'flex' }}>
              {copied ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
            </button>
            <a href={href} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--muted)', display: 'flex', padding: 4 }}>
              <ExternalLink size={11} />
            </a>
          </>
        )}
        <button onClick={() => setEditing(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, display: 'flex' }}>
          <Pencil size={11} />
        </button>
      </div>
    </div>
  )
}

// ── NUCLEUS Panel ──────────────────────────────────────────────────
function NucleusPanel({ client, onUpdate }: {
  client: Client
  onUpdate: (key: string, val: string) => void
}) {
  const cfg = client.custom_config || {}
  const billingStart = cfg.nucleus_billing_start || client.created_at
  const months = monthsAgo(billingStart)
  const setupFee = Number(cfg.nucleus_setup_fee || 0)
  const mrr = Number(client.mrr || 0)
  const totalCollected = setupFee + (mrr * months)
  const updateAvailable = cfg.nucleus_update_available === 'true'
  const needsSupport = cfg.nucleus_needs_support === 'true'

  const statusColor = needsSupport ? '#EF4444' : updateAvailable ? '#F59E0B' : '#10B981'
  const statusLabel = needsSupport ? 'Necesita soporte' : updateAvailable ? 'Update disponible' : 'Al día'
  const statusIcon = needsSupport ? <AlertCircle size={13} /> : updateAvailable ? <RefreshCw size={13} /> : <Check size={13} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header NUCLEUS */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 20, padding: '24px 28px',
        border: '1px solid rgba(167,139,250,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'radial-gradient(circle at 35% 35%, #A78BFA, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🧠</div>
            <div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)', marginBottom: 2 }}>
                NUCLEUS IA
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>
                {client.company_name}
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: statusColor + '20', border: `1px solid ${statusColor}50`,
            borderRadius: 100, padding: '6px 14px',
            color: statusColor, fontSize: 12, fontWeight: 700,
          }}>
            {statusIcon} {statusLabel}
          </div>
        </div>

        {/* 3 métricas rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'MRR', value: formatARS(mrr), icon: <TrendingUp size={13} /> },
            { label: 'Meses activo', value: months > 0 ? `${months}m` : '< 1m', icon: <Clock size={13} /> },
            { label: 'Total cobrado', value: totalCollected > 0 ? formatARS(totalCollected) : '—', icon: <Zap size={13} /> },
          ].map(m => (
            <div key={m.label} style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(167,139,250,0.7)', marginBottom: 6 }}>
                {m.icon}
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{m.label}</span>
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* URLs del NUCLEUS */}
      <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
          Accesos del NUCLEUS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <UrlRow
            icon={<Globe size={13} />} label="Sitio público"
            href={cfg.website || cfg.nucleus_url || ''} color="#38BDF8"
            clientId={client.id} fieldKey="website"
            onSaved={v => onUpdate('website', v)}
          />
          <UrlRow
            icon={<Cpu size={13} />} label="Panel admin"
            href={cfg.nucleus_panel_url || ''} color="#A78BFA"
            clientId={client.id} fieldKey="nucleus_panel_url"
            onSaved={v => onUpdate('nucleus_panel_url', v)}
          />
          <UrlRow
            icon={<FileText size={13} />} label="Propuesta"
            href={cfg.nucleus_proposal_url || ''} color="#F59E0B"
            clientId={client.id} fieldKey="nucleus_proposal_url"
            onSaved={v => onUpdate('nucleus_proposal_url', v)}
          />
          {client.chatbot_id && (
            <UrlRow
              icon={<MessageSquare size={13} />} label="Chatbot IA"
              href={`/api/chatbot/${client.chatbot_id}`} color="#6366F1"
              clientId={client.id} fieldKey="chatbot_test_url"
              onSaved={() => {}}
            />
          )}
        </div>
      </div>

      {/* Log del mes — justificación MRR */}
      <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Log del mes — qué hizo DIVINIA
          </div>
          <span style={{
            background: 'rgba(16,185,129,0.1)', color: '#10B981',
            borderRadius: 100, padding: '3px 10px',
            fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Justifica el MRR
          </span>
        </div>
        <InlineEdit
          label=""
          value={cfg.nucleus_monthly_log || ''}
          fieldKey="nucleus_monthly_log"
          clientId={client.id}
          onSaved={v => onUpdate('nucleus_monthly_log', v)}
          multiline
        />
        <p style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 10, fontFamily: 'var(--f-mono)' }}>
          Ej: "Actualicé los flows del chatbot, agregué sección FAQ automática, monitoreé 340 consultas."
        </p>
      </div>

      {/* Soporte y notas */}
      <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
          Notas de soporte
        </div>
        <InlineEdit
          label=""
          value={cfg.nucleus_support_notes || ''}
          fieldKey="nucleus_support_notes"
          clientId={client.id}
          onSaved={v => onUpdate('nucleus_support_notes', v)}
          multiline
        />
      </div>

      {/* Config billing NUCLEUS */}
      <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
          Datos de cuenta NUCLEUS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <InlineEdit label="Fecha inicio facturación" value={cfg.nucleus_billing_start || ''} fieldKey="nucleus_billing_start" clientId={client.id} onSaved={v => onUpdate('nucleus_billing_start', v)} type="date" />
          <InlineEdit label="Fee de setup / implementación (ARS)" value={cfg.nucleus_setup_fee || ''} fieldKey="nucleus_setup_fee" clientId={client.id} onSaved={v => onUpdate('nucleus_setup_fee', v)} type="number" />
          <InlineEdit label="Versión actual del NUCLEUS" value={cfg.nucleus_version || ''} fieldKey="nucleus_version" clientId={client.id} onSaved={v => onUpdate('nucleus_version', v)} />
        </div>

        {/* Flags de estado */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { key: 'nucleus_update_available', label: 'Update disponible', active: updateAvailable, color: '#F59E0B' },
            { key: 'nucleus_needs_support', label: 'Necesita soporte', active: needsSupport, color: '#EF4444' },
          ].map(flag => (
            <button
              key={flag.key}
              onClick={async () => {
                const newVal = flag.active ? 'false' : 'true'
                await fetch(`/api/clients/${client.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ [flag.key]: newVal }),
                })
                onUpdate(flag.key, newVal)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 100, cursor: 'pointer', fontFamily: 'var(--f-mono)',
                fontSize: 10, letterSpacing: '0.08em', fontWeight: 700,
                background: flag.active ? flag.color + '20' : 'var(--paper-2)',
                border: `1px solid ${flag.active ? flag.color + '50' : 'var(--line)'}`,
                color: flag.active ? flag.color : 'var(--muted)',
              }}
            >
              {flag.active ? <Check size={11} /> : <Plus size={11} />}
              {flag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Producto card (non-NUCLEUS) ────────────────────────────────────
function ProductCard({ pid, client }: { pid: string; client: Client }) {
  const meta = PRODUCTOS_META.find(p => p.id === pid)
  if (!meta) return null
  const cfg = client.custom_config || {}
  const bcId = client.booking_configs?.[0]?.id

  const links: { label: string; href: string; icon: React.ReactNode; external?: boolean }[] = []

  if (pid === 'web') {
    const website = cfg.website
    if (website) links.push({ label: 'Visitar sitio', href: website, icon: <Globe size={13} />, external: true })
  }
  if ((pid === 'chatbot') && client.chatbot_id) {
    links.push({ label: 'Probar chatbot', href: `/api/chatbot/${client.chatbot_id}`, icon: <MessageSquare size={13} />, external: true })
  }
  if (pid === 'turnero' && bcId) {
    links.push({ label: 'Panel del negocio', href: `/panel/${bcId}`, icon: <Calendar size={13} />, external: true })
    links.push({ label: 'Link de reservas', href: `/reservas/${bcId}`, icon: <Calendar size={13} />, external: true })
  }
  if (pid === 'content') {
    links.push({ label: 'Gestionar contenido', href: `/contenido?client=${client.id}`, icon: <Sparkles size={13} /> })
  }

  return (
    <div style={{
      background: meta.bg,
      border: `1.5px solid ${meta.color}30`,
      borderRadius: 16, padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>{meta.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{meta.title}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{meta.desc}</div>
        </div>
        <div style={{
          marginLeft: 'auto', background: meta.color, color: '#fff',
          borderRadius: 100, padding: '3px 10px',
          fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em',
          textTransform: 'uppercase', fontWeight: 700,
        }}>
          Activo
        </div>
      </div>
      {links.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.7)', border: `1px solid ${meta.color}25`,
                textDecoration: 'none', color: 'var(--ink)', fontSize: 13,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: meta.color }}>
                {link.icon}
                <span style={{ color: 'var(--ink)' }}>{link.label}</span>
              </span>
              <ChevronRight size={13} style={{ color: 'var(--muted)', opacity: 0.6 }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────
export default function ClientePage() {
  const { clientId } = useParams<{ clientId: string }>()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then(r => r.json())
      .then(d => { setClient(d.client); setLoading(false) })
      .catch(() => setLoading(false))
  }, [clientId])

  async function deleteClient() {
    if (!client) return
    if (!confirm(`¿Eliminar ${client.company_name}? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
    router.push('/clientes')
  }

  function updateField(key: string, value: string) {
    setClient(prev => {
      if (!prev) return prev
      const topLevel = ['company_name', 'contact_name', 'email', 'phone', 'plan', 'status', 'mrr']
      if (topLevel.includes(key)) return { ...prev, [key]: value }
      return { ...prev, custom_config: { ...prev.custom_config, [key]: value } }
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>Cargando...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{ padding: 32 }}>
        <button onClick={() => router.push('/clientes')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Volver a clientes
        </button>
        <p style={{ color: 'var(--muted)' }}>Cliente no encontrado.</p>
      </div>
    )
  }

  const cfg = client.custom_config || {}
  const color = cfg.color || '#6366f1'
  const products = (cfg.products || '').split(',').filter(Boolean)
  const status = STATUS[client.status as keyof typeof STATUS] || STATUS.active
  const planColor = getPlanColor(client.plan)
  const isArchived = cfg.archived === 'true'
  const isOwnApp = ['oniria-app', 'eco-sl-app', 'parking-sl-app'].includes(client.chatbot_id || '')
  const hasNucleus = products.includes('nucleus')
  const otherProducts = products.filter(p => p !== 'nucleus')

  return (
    <div style={{ background: 'var(--paper-2)', minHeight: '100vh' }}>

      {/* Color top bar */}
      <div style={{ height: 6, background: hasNucleus ? 'linear-gradient(90deg, #6d28d9, #A78BFA)' : color, width: '100%' }} />

      {/* Header */}
      <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => router.push('/clientes')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em' }}>
            <ArrowLeft size={14} /> Clientes
          </button>
          <span style={{ color: 'var(--line)' }}>/</span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>{client.company_name}</span>
          {hasNucleus && (
            <>
              <span style={{ color: 'var(--line)' }}>/</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#A78BFA' }}>NUCLEUS</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: hasNucleus ? 'linear-gradient(135deg, #6d28d9, #A78BFA)' : color,
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 22,
          }}>
            {hasNucleus ? '🧠' : client.company_name.charAt(0).toUpperCase()}
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 26, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
                {client.company_name}
              </h1>
              <span style={{ ...status, borderRadius: 100, padding: '4px 12px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {status.label}
              </span>
              {hasNucleus && (
                <span style={{
                  background: 'rgba(167,139,250,0.15)', color: '#A78BFA',
                  borderRadius: 100, padding: '4px 12px', fontFamily: 'var(--f-mono)',
                  fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
                }}>
                  🧠 NUCLEUS IA
                </span>
              )}
              <span style={{
                background: planColor, color: planColor === '#C6FF3D' ? 'var(--ink)' : '#fff',
                borderRadius: 100, padding: '4px 12px', fontFamily: 'var(--f-mono)',
                fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
              }}>
                {PLAN_LABEL[client.plan] || client.plan}
              </span>
              {isArchived && (
                <span style={{ background: 'var(--paper-2)', color: 'var(--muted)', borderRadius: 100, padding: '4px 12px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Archivado
                </span>
              )}
              {isOwnApp && (
                <span style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', borderRadius: 100, padding: '4px 12px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  App DIVINIA
                </span>
              )}
            </div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              {client.contact_name} · {client.email}
            </p>
          </div>

          {/* MRR */}
          {Number(client.mrr) > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>MRR</div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                {formatARS(Number(client.mrr))}
              </div>
            </div>
          )}
        </div>

        {cfg.archive_note && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', fontSize: 13, color: 'var(--ink)' }}>
            📌 {cfg.archive_note}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '28px 32px', display: 'grid', gap: 24, gridTemplateColumns: '1fr 340px', maxWidth: 1200 }}
        className="grid-cols-1-on-mobile">

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* NUCLEUS panel — ocupa toda la columna izquierda si existe */}
          {hasNucleus && (
            <NucleusPanel client={client} onUpdate={updateField} />
          )}

          {/* Otros productos (no NUCLEUS) */}
          {otherProducts.length > 0 && (
            <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>
                  {hasNucleus ? 'Productos adicionales' : 'Productos contratados'}
                </h2>
              </div>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {otherProducts.map(pid => <ProductCard key={pid} pid={pid} client={client} />)}
              </div>
            </div>
          )}

          {/* Productos si no tiene ninguno */}
          {products.length === 0 && (
            <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '24px' }}>
              <h2 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>
                Productos contratados
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>Sin productos registrados — editá desde Facturación</p>
            </div>
          )}

          {/* Notas internas */}
          <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>
              Notas internas
            </h2>
            <InlineEdit
              label=""
              value={cfg.notes || ''}
              fieldKey="notes"
              clientId={client.id}
              onSaved={v => updateField('notes', v)}
              multiline
            />
          </div>
        </div>

        {/* RIGHT — Contacto + Facturación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Contacto */}
          <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 16px' }}>
              Contacto
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <Mail size={13} />, label: 'Email', key: 'email', value: client.email, type: 'email' },
                { icon: <Phone size={13} />, label: 'WhatsApp / Teléfono', key: 'phone', value: client.phone || '', type: 'text' },
                { icon: <MapPin size={13} />, label: 'Ciudad', key: 'city', value: cfg.city || '', type: 'text' },
                { icon: <Instagram size={13} />, label: 'Instagram', key: 'instagram', value: cfg.instagram || '', type: 'text' },
                { icon: <Globe size={13} />, label: 'Sitio web', key: 'website', value: cfg.website || '', type: 'url' },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--muted)', marginTop: 6, flexShrink: 0 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <InlineEdit label={f.label} value={f.value} fieldKey={f.key} clientId={client.id} onSaved={v => updateField(f.key, v)} type={f.type} />
                  </div>
                </div>
              ))}
              {/* WhatsApp quick link */}
              {client.phone && (
                <a
                  href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px', borderRadius: 8, background: '#dcfce7', border: '1px solid #bbf7d0',
                    color: '#16a34a', textDecoration: 'none', fontSize: 12, fontWeight: 600, marginTop: 4,
                  }}
                >
                  <MessageSquare size={13} /> Abrir WhatsApp →
                </a>
              )}
            </div>
          </div>

          {/* Plan + Billing */}
          <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 14px' }}>
              Facturación
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InlineEdit label="Plan" value={client.plan} fieldKey="plan" clientId={client.id} onSaved={v => updateField('plan', v)} />
              <InlineEdit label="Estado" value={client.status} fieldKey="status" clientId={client.id} onSaved={v => updateField('status', v)} />
              <InlineEdit label="MRR mensual (ARS)" value={String(client.mrr || 0)} fieldKey="mrr" clientId={client.id} onSaved={v => updateField('mrr', v)} type="number" />
              <InlineEdit label="Productos (coma separado)" value={cfg.products || ''} fieldKey="products" clientId={client.id} onSaved={v => updateField('products', v)} />
            </div>
          </div>

          {/* Chatbot ID */}
          {client.chatbot_id && (
            <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                Chatbot / Slug ID
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ fontSize: 12, fontFamily: 'var(--f-mono)', color: 'var(--ink)', background: 'var(--paper-2)', padding: '4px 8px', borderRadius: 6, flex: 1 }}>
                  {client.chatbot_id}
                </code>
                <button onClick={() => copyText(client.chatbot_id!, setCopied)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                  {copied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid #fca5a5', padding: '16px 20px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 10 }}>
              Zona peligrosa
            </div>
            <button
              onClick={deleteClient}
              disabled={deleting}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5',
                color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                opacity: deleting ? 0.5 : 1,
              }}
            >
              <Trash2 size={14} /> {deleting ? 'Eliminando...' : 'Eliminar cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
