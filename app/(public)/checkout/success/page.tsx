'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Copy, ExternalLink, Loader2 } from 'lucide-react'

interface ClientData {
  company_name: string
  custom_config: {
    turnero_url?: string
    panel_url?: string
    panel_pin?: string
  }
}

function SuccessContent() {
  const params = useSearchParams()
  const type = params.get('type')
  const clientId = params.get('clientId')
  const status = params.get('status')

  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const isOnboarding = type === 'onboarding' && clientId
  const isPending = status === 'pending'

  useEffect(() => {
    if (!isOnboarding || isPending) return

    // Polling: esperar a que el webhook procese y el turnero_url esté disponible
    let attempts = 0
    const maxAttempts = 12 // 1 minuto total

    async function checkProvisioning() {
      try {
        const res = await fetch(`/api/onboarding/status?clientId=${clientId}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.client?.custom_config?.turnero_url) {
          setClient(data.client)
          setLoading(false)
          return
        }
      } catch {
        // silencioso
      }

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(checkProvisioning, 5000)
      } else {
        setLoading(false)
      }
    }

    setLoading(true)
    setTimeout(checkProvisioning, 3000) // primer check a los 3 segundos
  }, [isOnboarding, isPending, clientId])

  function copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Pago de onboarding con provisión automática
  if (isOnboarding && !isPending) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--paper, #F5F4EF)' }}
      >
        <div className="max-w-lg w-full">
          {/* Checkmark animado */}
          <div className="flex justify-center mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: '#C6FF3D' }}
            >
              <Check size={44} strokeWidth={3} style={{ color: '#0C0C0C' }} />
            </div>
          </div>

          <h1
            className="text-4xl font-black text-center mb-3"
            style={{ fontFamily: 'var(--f-display, serif)' }}
          >
            ¡Pago aprobado!
          </h1>
          <p className="text-center text-black/50 mb-10 text-lg">
            Estamos configurando tu Turnero ahora mismo.
          </p>

          {loading && (
            <div className="bg-white rounded-2xl border border-black/10 p-6 text-center mb-6">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-black/30" />
              <p className="font-semibold">Configurando tu sistema...</p>
              <p className="text-sm text-black/50 mt-1">
                Esto tarda menos de un minuto
              </p>
            </div>
          )}

          {client?.custom_config?.turnero_url && (
            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-2xl border-2 border-black p-6">
                <p className="text-xs font-bold text-black/40 mb-3">TU TURNERO ESTÁ LISTO 🎉</p>
                <p className="font-bold text-lg mb-1">{client.company_name}</p>
                <p className="text-sm text-black/50 mb-4 break-all">
                  {client.custom_config.turnero_url}
                </p>
                <div className="flex gap-3">
                  <a
                    href={client.custom_config.turnero_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all"
                    style={{ background: '#0C0C0C', color: '#C6FF3D' }}
                  >
                    Ver mi Turnero <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => copyLink(client!.custom_config.turnero_url!)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-black/15 font-semibold text-sm transition-all hover:border-black/40"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? '¡Copiado!' : 'Copiar link'}
                  </button>
                </div>
              </div>

              {client.custom_config.panel_url && (
                <div className="bg-white rounded-2xl border border-black/10 p-5">
                  <p className="text-xs font-bold text-black/40 mb-3">PANEL DEL NEGOCIO</p>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">Administrá tus turnos</p>
                      <p className="text-xs text-black/50 mt-0.5">
                        PIN de acceso:{' '}
                        <span className="font-black font-mono tracking-widest">
                          {client.custom_config.panel_pin}
                        </span>
                      </p>
                    </div>
                    <a
                      href={client.custom_config.panel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl border-2 border-black/15 hover:border-black/40 transition-all shrink-0"
                    >
                      Ir al panel <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-black/10 p-5">
                <p className="text-xs font-bold text-black/40 mb-3">¿NECESITÁS AYUDA?</p>
                <a
                  href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20acabo%20de%20activar%20mi%20Turnero%20y%20necesito%20ayuda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
                >
                  💬 Escribir a soporte por WhatsApp
                </a>
              </div>
            </div>
          )}

          {!loading && !client?.custom_config?.turnero_url && (
            <div className="bg-white rounded-2xl border border-black/10 p-6 text-center mb-6">
              <p className="font-semibold mb-2">Recibimos tu pago ✅</p>
              <p className="text-sm text-black/50 mb-4">
                Tu Turnero estará listo en los próximos minutos. Te vamos a escribir
                por WhatsApp con el link cuando esté.
              </p>
              <a
                href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20acabo%20de%20pagar%20el%20Turnero%20y%20espero%20mi%20acceso"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                💬 Avisarme por WhatsApp
              </a>
            </div>
          )}
        </div>
      </main>
    )
  }

  // Pago pendiente
  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--paper, #F5F4EF)' }}>
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="text-3xl font-black mb-3" style={{ fontFamily: 'var(--f-display, serif)' }}>
            Pago en proceso
          </h1>
          <p className="text-black/50 mb-8">
            Tu pago está siendo procesado. Te vamos a notificar por email cuando se confirme.
          </p>
          <a
            href="https://wa.me/5492665286110?text=Hola%2C%20hice%20un%20pago%20que%20está%20pendiente"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white font-bold px-6 py-3 rounded-xl"
          >
            💬 Consultar estado
          </a>
        </div>
      </main>
    )
  }

  // Pago genérico (chatbot u otros servicios)
  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--paper, #F5F4EF)' }}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-black/10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#C6FF3D' }}
          >
            <Check size={36} strokeWidth={3} style={{ color: '#0C0C0C' }} />
          </div>
          <h1 className="text-3xl font-black mb-3" style={{ fontFamily: 'var(--f-display, serif)' }}>
            ¡Pago aprobado!
          </h1>
          <p className="text-black/50 mb-8 leading-relaxed">
            Tu servicio está activado. En las próximas horas te enviamos por
            WhatsApp los accesos.
          </p>
          <a
            href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20acabo%20de%20pagar%20y%20quiero%20mis%20accesos"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-black py-4 rounded-xl text-base transition-all mb-4"
            style={{ background: '#0C0C0C', color: '#C6FF3D' }}
          >
            💬 Escribir por WhatsApp
          </a>
          <Link href="/" className="text-black/40 text-sm hover:text-black/60 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-black/30" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
