'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, ExternalLink, Check, Plus, Calendar, MessageSquare, Settings, ChevronRight, User, ArrowRight } from 'lucide-react'
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
  chatbot_id: string | null
  embed_code: string | null
  trial_end: string
  created_at: string
  custom_config?: Record<string, string>
  booking_configs?: BookingConfigMin[]
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Activo',    color: '#16a34a', bg: '#dcfce7' },
  trial:     { label: 'Trial',     color: '#d97706', bg: '#fef3c7' },
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

// ── Card individual de cliente ────────────────────────────────────
function ClientCard({ client }: { client: Client }) {
  const cfg = client.custom_config || {}
  const color = cfg.color || '#6366f1'
  const hasTurnos = client.booking_configs && client.booking_configs.length > 0
  const turnosId = hasTurnos ? client.booking_configs![0].id : null
  const turnosActive = hasTurnos ? client.booking_configs![0].is_active : false
  const hasChatbot = !!client.chatbot_id
  const status = STATUS_LABEL[client.status] || STATUS_LABEL.active
  const initial = (client.company_name || '?').charAt(0).toUpperCase()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
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
                <User size={11} /> {client.contact_name}
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

        {/* Productos activos */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Servicios</p>
          <div className="flex flex-wrap gap-2">
            {hasChatbot && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{ backgroundColor: color + '15', color }}>
                <MessageSquare size={12} /> Chatbot
              </div>
            )}
            {hasTurnos ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={turnosActive
                  ? { backgroundColor: '#dcfce7', color: '#16a34a' }
                  : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                <Calendar size={12} /> Turnos {!turnosActive && '(inactivo)'}
              </div>
            ) : null}
            {!hasChatbot && !hasTurnos && (
              <span className="text-xs text-gray-400 italic">Sin productos activos</span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          {hasChatbot && client.chatbot_id && (
            <a href={`/api/chatbot/${client.chatbot_id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <MessageSquare size={14} style={{ color }} /> Probar chatbot
              </span>
              <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500" />
            </a>
          )}
          {hasTurnos && turnosId && (
            <>
              <a href={`/panel/${turnosId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  <Calendar size={14} className="text-green-600" /> Panel del negocio
                </span>
                <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500" />
              </a>
              <a href={`/reservas/${turnosId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  <Calendar size={14} className="text-blue-500" /> Link de reservas (público)
                </span>
                <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500" />
              </a>
            </>
          )}
          <a href={`/turnos/config/${client.id}`}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <Settings size={14} className="text-gray-400" />
              {hasTurnos ? 'Editar turnos' : 'Activar sistema de turnos'}
            </span>
            <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500" />
          </a>
        </div>

        <p className="text-xs text-gray-300 mt-3 text-right">Cliente {timeAgo(client.created_at)}</p>
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

  // ── Pantalla de éxito ──
  if (created) {
    const wantsTurnos = selectedProducts.includes('turnos')
    const wantsChatbot = selectedProducts.includes('chatbot')
    return (
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
          <div>
            <h3 className="font-bold text-gray-900">¡{created.company_name} creado!</h3>
            <p className="text-sm text-gray-500">
              {selectedProducts.map(p => PRODUCTOS.find(x => x.id === p)?.title).join(' + ')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Próximo paso para Turnos */}
          {wantsTurnos && (
            <a href={`/turnos/config/${created.id}`}
              className="flex items-center justify-between w-full p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-bold text-green-800 text-sm">Configurar el sistema de turnos</p>
                  <p className="text-xs text-green-600">Cargar servicios, horarios y generar los links</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-green-600 group-hover:translate-x-1 transition-transform" />
            </a>
          )}

          {/* Próximo paso para Chatbot */}
          {wantsChatbot && created.embed_code && (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare size={12} /> Código de instalación del chatbot
              </p>
              <code className="text-xs text-indigo-700 break-all leading-relaxed block bg-white rounded-lg p-3 border border-indigo-100">
                {created.embed_code}
              </code>
              <button onClick={copyEmbed}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar código</>}
              </button>
            </div>
          )}
        </div>

        <button onClick={() => { setCreated(null); setStep(1); setSelectedProducts([]) }}
          className="w-full text-center text-sm text-gray-500 font-semibold py-3 mt-4 hover:text-gray-700">
          + Crear otro cliente
        </button>
      </div>
    )
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200'
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider'

  // ── Paso 1: Datos del cliente ──
  if (step === 1) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <h2 className="font-bold text-gray-900">Datos del cliente</h2>
          <span className="ml-auto text-xs text-gray-400">Paso 1 de 2</span>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Empresa *</label>
              <input required type="text" value={form.company_name}
                onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                className={inputCls} placeholder="Nombre del negocio" />
            </div>
            <div>
              <label className={labelCls}>Contacto *</label>
              <input required type="text" value={form.contact_name}
                onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                className={inputCls} placeholder="Nombre" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email *</label>
              <input required type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className={inputCls} placeholder="5492664000000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Rubro *</label>
              <select required value={form.rubro} onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
                className={inputCls + ' bg-white'}>
                <option value="">Seleccioná</option>
                {RUBROS_INFO.map(r => <option key={r.rubro} value={r.rubro}>{r.emoji} {r.name.replace('Chatbot para ', '')}</option>)}
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Ciudad</label>
              <input type="text" value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className={inputCls} placeholder="San Luis" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Plan</label>
            <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
              className={inputCls + ' bg-white'}>
              <option value="trial">Trial (14 días gratis)</option>
              <option value="basic">Básico — $50.000/mes</option>
              <option value="pro">Pro — $100.000/mes</option>
              <option value="enterprise">Enterprise — $200.000/mes</option>
            </select>
          </div>
          <button
            disabled={!form.company_name || !form.contact_name || !form.email || !form.rubro}
            onClick={() => setStep(2)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            Siguiente — Elegir productos <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── Paso 2: Selección de productos ──
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
        <h2 className="font-bold text-gray-900">¿Qué productos contrata?</h2>
        <span className="ml-auto text-xs text-gray-400">Paso 2 de 2</span>
      </div>
      <p className="text-sm text-gray-500 mb-5 ml-8">Para <strong>{form.company_name}</strong> — podés elegir uno o los dos</p>

      <div className="space-y-3 mb-5">
        {PRODUCTOS.map(prod => {
          const sel = selectedProducts.includes(prod.id)
          return (
            <button key={prod.id} onClick={() => toggleProduct(prod.id)}
              className="w-full text-left p-4 rounded-xl border-2 transition-all"
              style={sel
                ? { borderColor: prod.color, backgroundColor: prod.bg }
                : { borderColor: '#e5e7eb', backgroundColor: '#fff' }}>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                  style={sel ? { borderColor: prod.color, backgroundColor: prod.color } : { borderColor: '#d1d5db' }}>
                  {sel && <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    {prod.emoji} {prod.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{prod.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl mb-3">{error}</div>}

      <div className="flex gap-3">
        <button onClick={() => setStep(1)}
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          ← Atrás
        </button>
        <button
          onClick={createClient}
          disabled={loading || selectedProducts.length === 0}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors">
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
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  async function loadClients(autoSeedIfEmpty = false) {
    const res = await fetch('/api/clients')
    const data = await res.json()
    const list: Client[] = data.clients || []

    const countWithTurnos = list.filter(c => c.booking_configs && c.booking_configs.length > 0).length
    // Sembrar si no hay clientes, o si hay más de 1 cliente y menos de (total-1) tienen turnos activos
    // (el -1 es para Turnero que no tiene turnos por diseño)
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

  const filtered = clients.filter(c =>
    !search ||
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const countActive  = clients.filter(c => c.status === 'active').length
  const countTrial   = clients.filter(c => c.status === 'trial').length
  const countTurnos  = clients.filter(c => c.booking_configs && c.booking_configs.length > 0).length
  const countChatbot = clients.filter(c => !!c.chatbot_id).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {clients.length} clientes · {countActive} activos · {countTrial} en trial · {countTurnos} con turnos · {countChatbot} con chatbot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cargarDemos}
            disabled={seeding}
            title="Recarga los clientes demo (Rufina Nails + Top Quality)"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
            {seeding ? '⏳' : '🔄'} Demos
          </button>
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
      </div>

      {seedMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${seedMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {seedMsg}
        </div>
      )}

      {tab === 'nuevo' ? (
        <Suspense fallback={null}>
          <NuevoClienteForm templates={templates} onCreated={() => { loadClients(); }} />
        </Suspense>
      ) : (
        <>
          {clients.length > 3 && (
            <div className="mb-5">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por empresa, contacto o email..."
                className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              {seeding ? (
                <>
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-bold text-gray-700 mb-1">Cargando clientes...</p>
                  <p className="text-gray-400 text-sm">Reconectando con la base de datos</p>
                </>
              ) : seedMsg ? (
                <>
                  <p className="text-4xl mb-3">⚠️</p>
                  <p className="font-bold text-red-600 mb-2">Error al cargar clientes</p>
                  <p className="text-gray-500 text-sm mb-2 max-w-sm">
                    Falta <code className="bg-gray-100 px-1 rounded font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> en las variables de entorno de Vercel.
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    Vercel → Settings → Environment Variables → agregá la key del proyecto Supabase
                  </p>
                  <button onClick={cargarDemos} disabled={seeding}
                    className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50">
                    🔄 Reintentar
                  </button>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">👥</p>
                  <h3 className="font-bold text-gray-700 mb-1">{search ? 'Sin resultados' : 'No hay clientes todavía'}</h3>
                  <p className="text-gray-400 text-sm mb-4">{search ? 'Probá con otro término' : 'Creá tu primer cliente para empezar'}</p>
                  {!search && (
                    <button onClick={() => setTab('nuevo')}
                      className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700">
                      + Crear cliente nuevo
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(client => <ClientCard key={client.id} client={client} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
