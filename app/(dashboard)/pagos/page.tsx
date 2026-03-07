'use client'
import { useState, useEffect } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'

interface PaymentLink {
  id: string
  init_point: string
  preference_id: string
  title: string
  amount: number
}

const PLANES = [
  { value: 50000, label: 'Plan Básico - $50.000/mes', plan: 'basic' },
  { value: 100000, label: 'Plan Pro - $100.000/mes', plan: 'pro' },
  { value: 200000, label: 'Plan Enterprise - $200.000/mes', plan: 'enterprise' },
  { value: 150000, label: 'Chatbot WhatsApp básico - $150.000', plan: 'one-time' },
  { value: 250000, label: 'Chatbot WhatsApp pro - $250.000', plan: 'one-time' },
  { value: 120000, label: 'Automatización proceso - $120.000', plan: 'one-time' },
  { value: 300000, label: 'Pack 3 automatizaciones - $300.000', plan: 'one-time' },
]

export default function PagosPage() {
  const [form, setForm] = useState({
    title: PLANES[0].label,
    amount: PLANES[0].value,
    clientEmail: '',
    clientName: '',
    externalRef: '',
  })
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<PaymentLink | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function createLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear link')
      setLink(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    if (link?.init_point) {
      navigator.clipboard.writeText(link.init_point)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Gestión de Pagos</h1>
        <p className="text-gray-500 mt-1">Generá links de pago con MercadoPago</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5">Generar link de cobro</h2>
          <form onSubmit={createLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Servicio / Plan</label>
              <select
                value={form.amount}
                onChange={e => {
                  const plan = PLANES.find(p => p.value === Number(e.target.value))
                  setForm(prev => ({ ...prev, amount: Number(e.target.value), title: plan?.label || '' }))
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                {PLANES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Descripción personalizada</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Monto (ARS)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Email del cliente</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))}
                  placeholder="opcional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Nombre del cliente</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                  placeholder="opcional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
              {loading ? 'Generando...' : 'Generar link de pago'}
            </button>
          </form>
        </div>

        {link ? (
          <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">💳</span>
              <div>
                <h3 className="font-bold text-gray-900">Link generado</h3>
                <p className="text-sm text-gray-500">Listo para enviar al cliente</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Monto</p>
              <p className="text-2xl font-black text-gray-900">
                ${link.amount.toLocaleString('es-AR')} ARS
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-indigo-600 mb-2 font-semibold uppercase tracking-wider">Link de pago</p>
              <p className="text-xs text-gray-600 break-all mb-3 leading-relaxed">{link.init_point}</p>
              <div className="flex gap-2">
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors">
                  {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar link</>}
                </button>
                <a href={link.init_point} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                  <ExternalLink size={12} /> Abrir
                </a>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>✓ Acepta tarjeta débito, crédito y Mercado Crédito</p>
              <p>✓ Se acredita en tu cuenta de MercadoPago</p>
              <p>✓ El cliente recibe comprobante automático</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200 flex items-center justify-center">
            <p className="text-gray-400 text-sm text-center">
              Completá el formulario para generar<br />el link de cobro con MercadoPago
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
