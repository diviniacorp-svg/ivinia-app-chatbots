'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react'

const RUBROS = [
  'Peluquería / Barbería',
  'Estética / Belleza',
  'Odontología',
  'Gimnasio / Fitness',
  'Psicología / Salud mental',
  'Veterinaria',
  'Masajes / Spa',
  'Nutrición / Dietista',
  'Médico / Clínica',
  'Otro',
]

export default function LeadCaptureForm() {
  const [form, setForm] = useState({ negocio: '', rubro: '', telefono: '', ciudad: 'San Luis' })
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.negocio || !form.rubro || !form.telefono) return
    setEstado('loading')

    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, canal_entrada: 'landing' }),
      })
      setEstado(res.ok ? 'ok' : 'error')
    } catch {
      setEstado('error')
    }
  }

  if (estado === 'ok') {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">¡Perfecto, {form.negocio}!</h3>
        <p className="text-gray-400">Te contactamos en menos de 1 hora con tu demo personalizada.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5 block">
            Nombre del negocio
          </label>
          <input
            type="text"
            placeholder="Ej: Peluquería San Martín"
            value={form.negocio}
            onChange={e => setForm(f => ({ ...f, negocio: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600 transition-colors"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5 block">
            Rubro
          </label>
          <select
            value={form.rubro}
            onChange={e => setForm(f => ({ ...f, rubro: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            required
          >
            <option value="">Elegí tu rubro</option>
            {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5 block">
            WhatsApp
          </label>
          <input
            type="tel"
            placeholder="+54 9 266 400-0000"
            value={form.telefono}
            onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600 transition-colors"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5 block">
            Ciudad
          </label>
          <input
            type="text"
            placeholder="San Luis"
            value={form.ciudad}
            onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600 transition-colors"
          />
        </div>
      </div>

      {estado === 'error' && (
        <p className="text-red-400 text-sm">Algo salió mal. Escribinos directo al WhatsApp.</p>
      )}

      <button
        type="submit"
        disabled={estado === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-all"
      >
        {estado === 'loading' ? (
          <><Loader2 size={18} className="animate-spin" /> Enviando...</>
        ) : (
          <>Quiero mi demo gratis <ArrowRight size={18} /></>
        )}
      </button>

      <p className="text-center text-xs text-gray-600">
        Sin compromiso · Te mostramos el sistema con tu negocio real en 15 min
      </p>
    </form>
  )
}
