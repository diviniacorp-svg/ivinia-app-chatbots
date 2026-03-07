'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check } from 'lucide-react'
import Navbar from '@/components/public/Navbar'
import { RUBROS_INFO } from '@/lib/templates-data'

function TrialForm() {
  const searchParams = useSearchParams()
  const rubroParam = searchParams.get('rubro') || ''

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    rubro: rubroParam,
    city: '',
    website: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: 'trial' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">¡Perfecto! Ya estás dentro</h2>
        <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
          En las próximas 24hs te contactamos por WhatsApp para personalizar y activar tu chatbot.
        </p>
        <a
          href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20acabo%20de%20registrarme%20en%20DIVINIA%20para%20la%20prueba%20gratuita"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all"
        >
          💬 Escribile a Joaco ahora
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del negocio *</label>
          <input
            required
            type="text"
            value={form.company_name}
            onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
            placeholder="Ej: Restaurante El Fogón"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tu nombre *</label>
          <input
            required
            type="text"
            value={form.contact_name}
            onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
            placeholder="Ej: María García"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="tu@email.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+54 9 266 4000000"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rubro *</label>
          <select
            required
            value={form.rubro}
            onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 bg-white"
          >
            <option value="">Seleccioná tu rubro</option>
            {RUBROS_INFO.map(r => (
              <option key={r.rubro} value={r.rubro}>
                {r.emoji} {r.name.replace('Chatbot para ', '')}
              </option>
            ))}
            <option value="otro">Otro rubro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ciudad *</label>
          <input
            required
            type="text"
            value={form.city}
            onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
            placeholder="Ej: San Luis, Mendoza..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sitio web (opcional)</label>
        <input
          type="url"
          value={form.website}
          onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
          placeholder="https://tu-negocio.com.ar"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder-gray-400"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? 'Registrando...' : (
          <>
            Empezar mi prueba gratis de 14 días
            <ArrowRight size={20} />
          </>
        )}
      </button>

      <p className="text-center text-gray-400 text-sm">
        Sin tarjeta de crédito · Te contactamos en 24hs · Cancelás cuando querés
      </p>
    </form>
  )
}

export default function TrialPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-indigo-50/30 to-white pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-4xl mb-4">🤖</div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">Probalo gratis 14 días</h1>
            <p className="text-gray-500">
              Completá el formulario y en 24hs activamos tu chatbot con IA
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <Suspense fallback={<div>Cargando...</div>}>
              <TrialForm />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  )
}
