import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { Check, Clock, Shield, ArrowRight, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import type { Proposal } from '@/lib/anthropic'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = createAdminClient()
  const { data } = await db
    .from('proposals')
    .select('contenido, leads(company_name)')
    .eq('id', params.id)
    .single()

  if (!data) return { title: 'Propuesta — DIVINIA' }

  let titulo = 'Propuesta DIVINIA'
  try {
    const parsed = JSON.parse(data.contenido) as Proposal
    titulo = parsed.titulo || titulo
  } catch { /* usa default */ }

  const company = (data.leads as unknown as { company_name: string } | null)?.company_name || ''

  return {
    title: `${titulo}${company ? ` — ${company}` : ''} | DIVINIA`,
    description: 'Propuesta comercial personalizada de DIVINIA',
  }
}

const RUBRO_CONFIG: Record<string, { emoji: string; color: string }> = {
  peluqueria:   { emoji: '✂️', color: '#7c3aed' },
  estetica:     { emoji: '💅', color: '#db2777' },
  spa:          { emoji: '🌸', color: '#059669' },
  odontologia:  { emoji: '🦷', color: '#2563eb' },
  clinica:      { emoji: '🩺', color: '#0891b2' },
  psicologia:   { emoji: '🧠', color: '#7c3aed' },
  veterinaria:  { emoji: '🐾', color: '#16a34a' },
  gimnasio:     { emoji: '🏋️', color: '#d97706' },
  restaurante:  { emoji: '🍴', color: '#ea580c' },
  hotel:        { emoji: '🏨', color: '#0f766e' },
  abogado:      { emoji: '⚖️', color: '#374151' },
  contabilidad: { emoji: '📊', color: '#1d4ed8' },
  default:      { emoji: '🏢', color: '#6366f1' },
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0,
  }).format(n)
}

export default async function PropuestaPage({ params }: Props) {
  const db = createAdminClient()

  const { data: row, error } = await db
    .from('proposals')
    .select('*, leads(company_name, rubro, city, phone, email)')
    .eq('id', params.id)
    .single()

  if (error || !row) notFound()

  // Marcar como vista
  if (row.status === 'borrador' || row.status === 'enviada') {
    await db
      .from('proposals')
      .update({ status: 'vista', updated_at: new Date().toISOString() })
      .eq('id', params.id)
  }

  // Parsear la propuesta generada por Claude
  let propuesta: Proposal | null = null
  try {
    propuesta = JSON.parse(row.contenido) as Proposal
  } catch { /* propuesta queda null */ }

  const lead = row.leads as { company_name: string; rubro: string; city: string; phone: string; email: string } | null
  const companyName = lead?.company_name || 'Tu negocio'
  const rubro = lead?.rubro || row.rubro || 'default'
  const city = lead?.city || 'San Luis'
  const ruboCfg = RUBRO_CONFIG[rubro] || RUBRO_CONFIG.default
  const precio = row.precio_total || propuesta?.precio || 0

  // Fallback si no hay propuesta parseada
  const titulo = propuesta?.titulo || `Propuesta para ${companyName}`
  const resumen = propuesta?.resumen_ejecutivo || ''
  const problema = propuesta?.problema || ''
  const solucion = propuesta?.solucion || ''
  const entregables = propuesta?.entregables || []
  const plazo = propuesta?.plazo || 'Listo en 48hs'
  const garantia = propuesta?.garantia || '30 días de garantía'
  const ctaText = propuesta?.cta || 'Arrancamos esta semana →'
  const precioLabel = propuesta?.precio_label || formatARS(precio)

  const linkPago = row.link_pago
  const joacoWA = `https://wa.me/5492665286110?text=${encodeURIComponent(`Hola Joaco, soy de ${companyName} (${city}). Vi la propuesta y quiero arrancar.`)}`

  return (
    <main className="min-h-screen bg-white">

      {/* HEADER */}
      <div
        className="text-white"
        style={{ background: `linear-gradient(135deg, #0C0C0C 0%, #1a1a2e 100%)` }}
      >
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: ruboCfg.color + '33', border: `1px solid ${ruboCfg.color}55` }}
                >
                  {ruboCfg.emoji}
                </div>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: '#C6FF3D' }}
                  >
                    Propuesta exclusiva · DIVINIA
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">
                    {companyName}
                  </h1>
                </div>
              </div>
              <p className="text-white/50 text-sm">{city}</p>
            </div>

            <div
              className="rounded-2xl px-6 py-5 text-center border border-white/10"
              style={{ background: 'rgba(198,255,61,0.1)' }}
            >
              <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-1">Inversión</p>
              <p className="text-4xl font-black" style={{ color: '#C6FF3D' }}>{precioLabel}</p>
            </div>
          </div>

          {/* Resumen ejecutivo */}
          {resumen && (
            <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/80 leading-relaxed">{resumen}</p>
            </div>
          )}
        </div>
      </div>

      {/* PROBLEMA / SOLUCIÓN */}
      {(problema || solucion) && (
        <div className="border-b border-gray-100" style={{ background: '#F9FAFB' }}>
          <div className="max-w-4xl mx-auto px-6 py-14">
            <div className="grid sm:grid-cols-2 gap-6">
              {problema && (
                <div className="bg-gray-900 rounded-2xl p-7">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                    La situación hoy
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{problema}</p>
                </div>
              )}
              {solucion && (
                <div
                  className="rounded-2xl p-7"
                  style={{ background: `linear-gradient(135deg, #0C0C0C, #1a1a2e)` }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-5"
                    style={{ color: '#C6FF3D' }}
                  >
                    Con DIVINIA
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">{solucion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* ENTREGABLES */}
        {entregables.length > 0 && (
          <div className="mb-14">
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--f-display, serif)' }}>
              Qué incluye
            </h2>
            <p className="text-black/50 mb-8">Todo configurado a medida de {companyName}.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {entregables.map((e, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: '#C6FF3D' }}
                  >
                    <Check size={12} strokeWidth={3} style={{ color: '#0C0C0C' }} />
                  </div>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{e}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRECIO + PLAZO + GARANTÍA */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          <div
            className="rounded-2xl p-6 text-white sm:col-span-1"
            style={{ background: 'linear-gradient(135deg, #0C0C0C, #1a1a2e)' }}
          >
            <p className="text-white/40 text-xs font-bold uppercase tracking-wide mb-3">Inversión</p>
            <p className="font-black mb-1" style={{ fontSize: '2rem', lineHeight: 1, color: '#C6FF3D' }}>
              {precioLabel}
            </p>
            <p className="text-white/40 text-xs mt-2">Pagás con MercadoPago</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-black/40" />
              <p className="text-xs font-bold text-black/40 uppercase tracking-wide">Plazo</p>
            </div>
            <p className="font-black text-lg">{plazo}</p>
            <p className="text-sm text-black/50 mt-1">Desde que confirmás</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-black/40" />
              <p className="text-xs font-bold text-black/40 uppercase tracking-wide">Garantía</p>
            </div>
            <p className="font-black text-lg">Sin riesgo</p>
            <p className="text-sm text-black/50 mt-1">{garantia}</p>
          </div>
        </div>

        {/* PROCESO */}
        <div className="mb-14">
          <h2 className="text-2xl font-black mb-8" style={{ fontFamily: 'var(--f-display, serif)' }}>
            Cómo es el proceso
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Confirmás', desc: `Hacés el pago y nos ponemos en marcha de inmediato.` },
              { n: '02', title: 'Lo armamos', desc: `Configuramos todo a medida de ${companyName}. ${plazo}.` },
              { n: '03', title: 'Empezás a usar', desc: 'Lo recibís listo para funcionar. Con soporte incluido.' },
            ].map(s => (
              <div key={s.n} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-5xl font-black text-gray-100 leading-none mb-4 select-none">{s.n}</p>
                <h3 className="font-black mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #0C0C0C 0%, #1a1a2e 100%)' }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#C6FF3D' }}
          >
            Propuesta lista para {companyName}
          </p>
          <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'var(--f-display, serif)' }}>
            {ctaText}
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Somos de San Luis. Podés escribirnos por WhatsApp si tenés alguna duda antes de confirmar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            {linkPago ? (
              <a
                href={linkPago}
                className="flex-1 flex items-center justify-center gap-2 font-black px-8 py-5 rounded-2xl text-base transition-all"
                style={{ background: '#C6FF3D', color: '#0C0C0C' }}
              >
                Pagar ahora <ArrowRight size={20} />
              </a>
            ) : (
              <a
                href={joacoWA}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 font-black px-8 py-5 rounded-2xl text-base transition-all"
                style={{ background: '#C6FF3D', color: '#0C0C0C' }}
              >
                Quiero arrancar <ArrowRight size={20} />
              </a>
            )}
            <a
              href={joacoWA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-semibold px-6 py-5 rounded-2xl border border-white/20 text-white hover:bg-white/5 transition-all"
            >
              <MessageCircle size={18} />
              Consultar
            </a>
          </div>

          <p className="text-white/30 text-xs mt-6">
            DIVINIA · San Luis, Argentina · Joaco{' '}
            <a href="https://wa.me/5492665286110" className="text-white/50 hover:text-white/70">
              (266) 528-6110
            </a>
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Propuesta preparada por DIVINIA para {companyName}
      </div>
    </main>
  )
}
