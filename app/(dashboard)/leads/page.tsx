'use client'
import { useState } from 'react'
import { Search, Mail, MessageCircle, Star, Globe, Phone } from 'lucide-react'

interface Lead {
  id?: string
  company_name: string
  phone: string
  email: string
  website: string
  city: string
  rubro: string
  score: number
  status?: string
  address?: string
}

const RUBROS = [
  'restaurante', 'clinica', 'inmobiliaria', 'gimnasio',
  'contabilidad', 'farmacia', 'peluqueria', 'taller', 'otro'
]

const CIUDADES = [
  'San Luis', 'Villa Mercedes', 'Buenos Aires', 'Córdoba', 'Mendoza',
  'Rosario', 'Tucumán', 'Salta', 'Mar del Plata', 'Otra ciudad'
]

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-100 text-green-700' :
    score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}pts
    </span>
  )
}

export default function LeadsPage() {
  const [rubro, setRubro] = useState('restaurante')
  const [city, setCity] = useState('San Luis')
  const [maxItems, setMaxItems] = useState(20)
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [savingLeads, setSavingLeads] = useState(false)

  async function scrape() {
    setLoading(true)
    setError('')
    setLeads([])
    setSelected(new Set())
    try {
      const res = await fetch('/api/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubro, city, maxItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al buscar leads')
      setLeads(data.leads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function saveSelected() {
    if (selected.size === 0) return
    setSavingLeads(true)
    const toSave = leads.filter((_, i) => selected.has(i))
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toSave }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      alert(`${toSave.length} leads guardados en el CRM`)
      setSelected(new Set())
    } catch (err) {
      alert('Error al guardar leads')
    } finally {
      setSavingLeads(false)
    }
  }

  function toggleAll() {
    if (selected.size === leads.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(leads.map((_, i) => i)))
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Buscador de Leads</h1>
        <p className="text-gray-500 mt-1">Encontrá negocios potenciales con Apify</p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="grid sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Rubro</label>
            <select
              value={rubro}
              onChange={e => setRubro(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {RUBROS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Ciudad</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Cantidad</label>
            <select
              value={maxItems}
              onChange={e => setMaxItems(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value={10}>10 resultados</option>
              <option value={20}>20 resultados</option>
              <option value={50}>50 resultados</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={scrape}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              <Search size={16} />
              {loading ? 'Buscando...' : 'Buscar leads'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 text-center py-8">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Apify está buscando negocios en Google Maps...</p>
              <p className="text-gray-400 text-xs">Puede tardar 1-2 minutos</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {leads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.size === leads.length}
                onChange={toggleAll}
                className="w-4 h-4 rounded"
              />
              <p className="font-semibold text-gray-900 text-sm">
                {leads.length} leads encontrados
                {selected.size > 0 && <span className="text-indigo-600"> · {selected.size} seleccionados</span>}
              </p>
            </div>
            {selected.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={saveSelected}
                  disabled={savingLeads}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {savingLeads ? 'Guardando...' : `Guardar ${selected.size} en CRM`}
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {leads.map((lead, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => {
                    const next = new Set(selected)
                    next.has(i) ? next.delete(i) : next.add(i)
                    setSelected(next)
                  }}
                  className="w-4 h-4 rounded mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{lead.company_name}</p>
                      {lead.address && <p className="text-xs text-gray-400 mt-0.5">{lead.address}</p>}
                    </div>
                    <ScoreBadge score={lead.score} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {lead.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone size={11} /> {lead.phone}
                      </span>
                    )}
                    {lead.email && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={11} /> {lead.email}
                      </span>
                    )}
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                        <Globe size={11} /> Web
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {lead.email && (
                    <a
                      href={`/outreach?email=${encodeURIComponent(lead.email)}&company=${encodeURIComponent(lead.company_name)}&rubro=${lead.rubro}&city=${lead.city}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Enviar email"
                    >
                      <Mail size={15} />
                    </a>
                  )}
                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hola%2C%20soy%20Joaco%20de%20DIVINIA`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={15} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
