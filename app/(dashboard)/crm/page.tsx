'use client'
import { useState, useEffect } from 'react'
import { Phone, Mail, Globe, ChevronDown } from 'lucide-react'

interface Lead {
  id: string
  company_name: string
  email: string
  phone: string
  rubro: string
  city: string
  score: number
  status: string
  notes: string
  updated_at: string
}

const STATUSES = [
  { key: 'nuevo', label: 'Nuevo', color: 'bg-gray-100 text-gray-700' },
  { key: 'contactado', label: 'Contactado', color: 'bg-blue-100 text-blue-700' },
  { key: 'propuesta', label: 'Propuesta enviada', color: 'bg-purple-100 text-purple-700' },
  { key: 'negociacion', label: 'Negociación', color: 'bg-amber-100 text-amber-700' },
  { key: 'cerrado', label: 'Cerrado ✓', color: 'bg-green-100 text-green-700' },
  { key: 'perdido', label: 'Perdido', color: 'bg-red-100 text-red-700' },
]

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch { /* error silencioso */ }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } catch { /* error silencioso */ }
    setUpdating(null)
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = leads.filter(l => l.status === s.key).length
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return <div className="text-gray-500 text-sm py-8 text-center">Cargando CRM...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">CRM</h1>
        <p className="text-gray-500 mt-1">Pipeline de ventas y seguimiento de leads</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Todos ({leads.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === s.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {s.label} ({counts[s.key] || 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            {leads.length === 0
              ? 'No hay leads en el CRM. Buscá con Apify en la sección Leads.'
              : 'No hay leads con este estado.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Rubro</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(lead => {
                  const statusInfo = STATUSES.find(s => s.key === lead.status) || STATUSES[0]
                  const scoreColor = lead.score >= 70 ? 'text-green-600' : lead.score >= 40 ? 'text-amber-600' : 'text-gray-400'
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 text-sm">{lead.company_name}</p>
                        <p className="text-xs text-gray-400">{lead.city}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-gray-600 capitalize">{lead.rubro}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex gap-1.5">
                          {lead.phone && (
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                              <Phone size={13} />
                            </a>
                          )}
                          {lead.email && (
                            <a href={`/outreach?email=${lead.email}&company=${encodeURIComponent(lead.company_name)}&rubro=${lead.rubro}&city=${lead.city}`}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Mail size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold ${scoreColor}`}>{lead.score}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative">
                          <select
                            value={lead.status}
                            onChange={e => updateStatus(lead.id, e.target.value)}
                            disabled={updating === lead.id}
                            className={`appearance-none text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 outline-none cursor-pointer pr-6 ${statusInfo.color}`}
                          >
                            {STATUSES.map(s => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={`/clientes?lead=${lead.id}&company=${encodeURIComponent(lead.company_name)}&email=${lead.email}&phone=${lead.phone}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        >
                          + Cliente
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
