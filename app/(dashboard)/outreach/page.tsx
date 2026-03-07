'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, MessageCircle, Loader2, Send, Copy, ExternalLink } from 'lucide-react'

function OutreachForm() {
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    companyName: searchParams.get('company') || '',
    email: searchParams.get('email') || '',
    phone: '',
    rubro: searchParams.get('rubro') || 'restaurante',
    city: searchParams.get('city') || 'San Luis',
  })

  const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null)
  const [whatsappMsg, setWhatsappMsg] = useState('')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingWA, setLoadingWA] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  async function generateEmail() {
    setLoadingEmail(true)
    setError('')
    try {
      const res = await fetch('/api/outreach/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'email' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmailContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar')
    } finally {
      setLoadingEmail(false)
    }
  }

  async function generateWhatsApp() {
    setLoadingWA(true)
    setError('')
    try {
      const res = await fetch('/api/outreach/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'whatsapp' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWhatsappMsg(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar')
    } finally {
      setLoadingWA(false)
    }
  }

  async function sendEmail() {
    if (!form.email || !emailContent) return
    setSendingEmail(true)
    try {
      const res = await fetch('/api/outreach/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.email,
          subject: emailContent.subject,
          body: emailContent.body,
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar email')
    } finally {
      setSendingEmail(false)
    }
  }

  const waLink = form.phone
    ? `https://wa.me/${form.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`
    : ''

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Datos del prospecto</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Empresa</label>
            <input
              type="text"
              value={form.companyName}
              onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Nombre del negocio"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="email@empresa.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Teléfono/WA</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="+5492664..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Rubro</label>
              <input
                type="text"
                value={form.rubro}
                onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <div className="flex gap-2 mt-5">
          <button
            onClick={generateEmail}
            disabled={loadingEmail || !form.companyName}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loadingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
            Generar Email
          </button>
          <button
            onClick={generateWhatsApp}
            disabled={loadingWA || !form.companyName}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loadingWA ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
            Generar WA
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-4">
        {/* Email output */}
        {emailContent && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Mail size={15} className="text-blue-600" /> Email generado
              </h3>
              {emailSent ? (
                <span className="text-xs text-green-600 font-semibold">✓ Enviado</span>
              ) : (
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail || !form.email}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  {sendingEmail ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Enviar ahora
                </button>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Asunto</p>
              <p className="text-sm text-gray-900 font-medium">{emailContent.subject}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Cuerpo</p>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{emailContent.body}</p>
            </div>
          </div>
        )}

        {/* WhatsApp output */}
        {whatsappMsg && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <MessageCircle size={15} className="text-green-600" /> Mensaje WhatsApp
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => navigator.clipboard.writeText(whatsappMsg)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Copiar"
                >
                  <Copy size={13} />
                </button>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ExternalLink size={12} />
                    Abrir WA
                  </a>
                )}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{whatsappMsg}</p>
            </div>
          </div>
        )}

        {!emailContent && !whatsappMsg && (
          <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 text-sm">Completá los datos y generá el mensaje con IA</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OutreachPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Outreach</h1>
        <p className="text-gray-500 mt-1">Generá emails y mensajes de WhatsApp personalizados con IA</p>
      </div>
      <Suspense fallback={<div className="text-gray-500 text-sm">Cargando...</div>}>
        <OutreachForm />
      </Suspense>
    </div>
  )
}
