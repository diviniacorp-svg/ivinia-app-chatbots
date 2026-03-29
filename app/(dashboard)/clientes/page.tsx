'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, ExternalLink, Check, Plus, Calendar, MessageSquare, Settings, ChevronRight, User } from 'lucide-react'
import { RUBROS_INFO } from '@/lib/templates-data'

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
  chatbot_id: string
  embed_code: string
  trial_end: string
  created_at: string
  custom_config?: Record<string, string>
  booking_configs?: BookingConfigMin[]
}

// ── Helpers ─────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Activo', color: '#16a34a', bg: '#dcfce7' },
  trial:  { label: 'Trial',  color: '#d97706', bg: '#fef3c7' },
  cancelled: { label: 'Cancelado', color: '#dc2626', bg: '#fee2e2' },
}
const PLAN_LABEL: Record<string, string> = {
  trial: 'Trial', basic: 'Básico', pro: 'Pro', enterprise: 'Enterprise',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days}d`
  return `hace ${Math.floor(days / 30)}m`
}

// ── Card individual de cliente ───────────────────────────────────
function ClientCard({ client }: { client: Client }) {
  const cfg = client.custom_config || {}
  const color = cfg.color || '#6366f1'
  const hasTurnos = client.booking_configs && client.booking_configs.length > 0
  const turnosId = hasTurnos ? client.booking_configs![0].id : null
  const turnosActive = hasTurnos ? client.booking_configs![0].is_active : false
  const status = STATUS_LABEL[client.status] || STATUS_LABEL.active
  const initial = (client.company_name || '?').charAt(0).toUpperCase()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Color strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0"
            style={{ backgroundColor: color }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{client.company_name}</h3>
            {client.contact_name && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <User size={11} />
                {client.contact_name}
              </p>
            )}
            <p className="text-xs text-gray-400 truncate">{client.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ color: status.color, backgroundColor: status.bg }}>
              {status.label}
            </span>
            <span className="text-xs text-gray-400">{PLAN_LABEL[client.plan] || client.plan}</span>
          </div>
        </div>

        {/* Productos/servicios */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Servicios activos</p>
          <div className="flex flex-wrap gap-2">
            {/* Chatbot — siempre tienen */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
              style={{ backgroundColor: color + '15', color }}>
              <MessageSquare size={12} />
              Chatbot
            </div>

            {/* Sistema de turnos — si tiene booking_config */}
            {hasTurnos && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={turnosActive
                  ? { backgroundColor: '#dcfce7', color: '#16a34a' }
                  : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                <Calendar size={12} />
                Turnos {!turnosActive && '(inactivo)'}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          {/* Chatbot */}
          <a href={`/api/chatbot/${client.chatbot_id}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <MessageSquare size={14} style={{ color }} />
              Probar chatbot
            </span>
            <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500" />
          </a>

          {/* Turnos: panel del dueño */}
          {hasTurnos && turnosId && (
            <a href={`/panel/${turnosId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} className="text-green-600" />
                Panel de turnos
              </span>
              <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500" />
            </a>
          )}

          {/* Turnos: link de reservas para clientes */}
          {hasTurnos && turnosId && (
            <a href={`/reservas/${turnosId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} className="text-blue-500" />
                Link de reservas (público)
              </span>
              <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500" />
            </a>
          )}

          {/* Configurar turnos */}
          <a href={`/turnos/config/${client.id}`}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <Settings size={14} className="text-gray-400" />
              {hasTurnos ? 'Configurar turnos' : 'Activar sistema de turnos'}
            </span>
            <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500" />
          </a>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-300 mt-3 text-right">Cliente {timeAgo(client.created_at)}</p>
      </div>
    </div>
  )
}

// ── Formulario nuevo cliente ─────────────────────────────────────
interface Template { id: string; name: string; rubro: string }

function NuevoClienteForm({ templates, onCreated }: { templates: Template[]; onCreated: () => void }) {
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    company_name: searchParams.get('company') || '',
    contact_name: '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    rubro: '',
    city: '',
    template_id: searchParams.get('template') || '',
    custom_horario: '',
    plan: 'trial',
  })
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function createClient(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  if (created) {
    return (
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">¡{created.company_name} creado!</h3>
            <p className="text-sm text-gray-500">Chatbot activado ✓</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Código de instalación</p>
          <code className="text-xs text-indigo-700 break-all leading-relaxed block">{created.embed_code}</code>
          <button onClick={copyEmbed}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar código</>}
          </button>
        </div>
        <button onClick={() => setCreated(null)}
          className="w-full text-center text-sm text-indigo-600 font-semibold py-2 hover:underline">
          + Crear otro cliente
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
      <h2 className="font-bold text-gray-900 mb-5">Nuevo cliente</h2>
      <form onSubmit={createClient} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Empresa *</label>
            <input required type="text" value={form.company_name}
              onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Nombre del negocio" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Contacto *</label>
            <input required type="text" value={form.contact_name}
              onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Nombre" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email *</label>
            <input required type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Teléfono</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Rubro *</label>
            <select required value={form.rubro} onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
              <option value="">Seleccioná</option>
              {RUBROS_INFO.map(r => <option key={r.rubro} value={r.rubro}>{r.emoji} {r.name.replace('Chatbot para ', '')}</option>)}
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ciudad</label>
            <input type="text" value={form.city}
              onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="San Luis" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Horario</label>
          <input type="text" value={form.custom_horario}
            onChange={e => setForm(p => ({ ...p, custom_horario: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Lunes a Viernes 9-18hs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Plan</label>
          <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
            <option value="trial">Trial (14 días gratis)</option>
            <option value="basic">Básico — $50.000/mes</option>
            <option value="pro">Pro — $100.000/mes</option>
            <option value="enterprise">Enterprise — $200.000/mes</option>
          </select>
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
          {loading ? 'Creando...' : 'Crear cliente y activar chatbot'}
        </button>
      </form>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────
export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'lista' | 'nuevo'>('lista')
  const [search, setSearch] = useState('')

  async function loadClients() {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(data.clients || [])
    setLoading(false)
  }

  useEffect(() => {
    loadClients()
    fetch('/api/templates').then(r => r.json()).then(d => setTemplates(d.templates || []))
  }, [])

  const filtered = clients.filter(c =>
    !search ||
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const countActive = clients.filter(c => c.status === 'active').length
  const countTrial = clients.filter(c => c.status === 'trial').length
  const countTurnos = clients.filter(c => c.booking_configs && c.booking_configs.length > 0).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {clients.length} clientes · {countActive} activos · {countTrial} en trial · {countTurnos} con turnos
          </p>
        </div>
        <button
          onClick={() => setTab(tab === 'nuevo' ? 'lista' : 'nuevo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            tab === 'nuevo'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}>
          <Plus size={16} />
          {tab === 'nuevo' ? 'Ver clientes' : 'Nuevo cliente'}
        </button>
      </div>

      {tab === 'nuevo' ? (
        <Suspense fallback={null}>
          <NuevoClienteForm templates={templates} onCreated={() => { loadClients(); setTab('lista') }} />
        </Suspense>
      ) : (
        <>
          {/* Buscador */}
          {clients.length > 3 && (
            <div className="mb-5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por empresa, contacto o email..."
                className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <p className="text-4xl mb-3">👥</p>
              <h3 className="font-bold text-gray-700 mb-1">
                {search ? 'Sin resultados' : 'No hay clientes todavía'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {search ? 'Probá con otro término' : 'Creá tu primer cliente para empezar'}
              </p>
              {!search && (
                <button onClick={() => setTab('nuevo')}
                  className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700">
                  + Crear primer cliente
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(client => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
