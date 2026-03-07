'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, ExternalLink, Check } from 'lucide-react'
import { RUBROS_INFO } from '@/lib/templates-data'

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
}

interface Template {
  id: string
  name: string
  rubro: string
}

function ClienteForm({ templates }: { templates: Template[] }) {
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    company_name: searchParams.get('company') || '',
    contact_name: '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    rubro: '',
    city: '',
    template_id: searchParams.get('template') || '',
    custom_name: '',
    custom_horario: '',
    plan: 'trial',
  })
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function createClient(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear cliente')
      setCreated(data.client)
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-5">Crear nuevo cliente</h2>
        <form onSubmit={createClient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Empresa *</label>
              <input required type="text" value={form.company_name}
                onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Nombre del negocio"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Contacto *</label>
              <input required type="text" value={form.contact_name}
                onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Nombre"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Email *</label>
              <input required type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Teléfono</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Rubro *</label>
              <select required value={form.rubro} onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
                <option value="">Seleccioná</option>
                {RUBROS_INFO.map(r => <option key={r.rubro} value={r.rubro}>{r.emoji} {r.name.replace('Chatbot para ', '')}</option>)}
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Ciudad</label>
              <input type="text" value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="San Luis"
              />
            </div>
          </div>

          {templates.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Template</label>
              <select value={form.template_id} onChange={e => setForm(p => ({ ...p, template_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
                <option value="">Auto (por rubro)</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Horario del negocio</label>
            <input type="text" value={form.custom_horario}
              onChange={e => setForm(p => ({ ...p, custom_horario: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Lunes a Viernes 9-18hs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Plan</label>
            <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
              <option value="trial">Trial (14 días gratis)</option>
              <option value="basic">Básico - $50.000/mes</option>
              <option value="pro">Pro - $100.000/mes</option>
              <option value="enterprise">Enterprise - $200.000/mes</option>
            </select>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? 'Creando...' : 'Crear cliente y activar chatbot'}
          </button>
        </form>
      </div>

      {/* Resultado */}
      {created && (
        <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Cliente creado</h3>
              <p className="text-sm text-gray-500">Chatbot activado ✓</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Código para instalar en la web</p>
              <code className="text-xs text-indigo-700 break-all leading-relaxed block">{created.embed_code}</code>
              <button onClick={copyEmbed}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar código</>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <p className="font-semibold text-green-600 capitalize">{created.status}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Plan</p>
                <p className="font-semibold text-gray-900 capitalize">{created.plan}</p>
              </div>
              {created.status === 'trial' && (
                <div className="bg-amber-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-amber-700 mb-1">Trial vence</p>
                  <p className="font-semibold text-amber-800">
                    {new Date(created.trial_end).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}
            </div>

            <a href={`/api/chatbot/${created.chatbot_id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
              <ExternalLink size={12} /> Probar chatbot directamente
            </a>
          </div>
        </div>
      )}

      {!created && (
        <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200 flex items-center justify-center">
          <p className="text-gray-400 text-sm text-center">
            Completá el formulario para crear el cliente<br />y generar su código de instalación
          </p>
        </div>
      )}
    </div>
  )
}

export default function ClientesPage() {
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(d => setTemplates(d.templates || []))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Clientes</h1>
        <p className="text-gray-500 mt-1">Creá clientes y activá sus chatbots</p>
      </div>
      <Suspense fallback={<div className="text-gray-500 text-sm">Cargando...</div>}>
        <ClienteForm templates={templates} />
      </Suspense>
    </div>
  )
}
