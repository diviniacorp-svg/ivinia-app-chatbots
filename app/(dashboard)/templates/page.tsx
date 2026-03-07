'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const RUBRO_EMOJIS: Record<string, string> = {
  restaurante: '🍽️', clinica: '🏥', inmobiliaria: '🏠',
  gimnasio: '💪', contabilidad: '📊', farmacia: '💊',
  peluqueria: '✂️', taller: '🔧', hotel: '🏨',
  veterinaria: '🐾', ecommerce: '🛍️', odontologia: '🦷', legal: '⚖️',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .finally(() => setLoading(false))
  }, [])

  const handleSeed = async () => {
    setLoading(true)
    await fetch('/api/seed')
    const r = await fetch('/api/templates')
    const d = await r.json()
    setTemplates(d.templates || [])
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">Plantillas de chatbot pre-configuradas por rubro</p>
        </div>
        <button onClick={handleSeed}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          Cargar templates base
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-500 mb-4">No hay templates cargados aún.</p>
          <button onClick={handleSeed}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">
            Cargar ahora
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: (t.color_primary || '#6366f1') + '20' }}>
                    {RUBRO_EMOJIS[t.rubro] || '🤖'}
                  </div>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{t.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">${(t.price_monthly || 50000).toLocaleString('es-AR')}/mes</p>
                  <span className="text-xs text-indigo-600 font-medium">{t.trial_days || 14} días trial</span>
                </div>
              </div>
              <div className="border-t border-gray-50 px-5 py-3">
                <Link href={`/clientes?template=${t.id}`}
                  className="block text-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors">
                  Usar template
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
