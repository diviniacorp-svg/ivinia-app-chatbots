'use client'

import { useState } from 'react'
import { TURNERO_PLANS, formatPrecio } from '@/lib/turnero-plans'
import { Check, Plus, Trash2, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import type { Schedule, DaySchedule } from '@/lib/bookings'

const RUBROS = [
  { id: 'peluqueria', label: 'Peluquería / Barbería', emoji: '✂️' },
  { id: 'estetica', label: 'Estética / Nails', emoji: '💅' },
  { id: 'spa', label: 'Spa & Wellness', emoji: '🌸' },
  { id: 'odontologia', label: 'Odontología', emoji: '🦷' },
  { id: 'clinica', label: 'Clínica / Médico', emoji: '🩺' },
  { id: 'psicologia', label: 'Psicología', emoji: '🧠' },
  { id: 'veterinaria', label: 'Veterinaria', emoji: '🐾' },
  { id: 'gimnasio', label: 'Gimnasio / Entrenamiento', emoji: '🏋️' },
  { id: 'restaurante', label: 'Restaurante / Café', emoji: '🍴' },
  { id: 'hotel', label: 'Hotel / Hostería', emoji: '🏨' },
  { id: 'abogado', label: 'Abogado / Estudio', emoji: '⚖️' },
  { id: 'contabilidad', label: 'Contabilidad / Impuestos', emoji: '📊' },
  { id: 'otro', label: 'Otro', emoji: '🏢' },
]

const STEPS = ['Plan', 'Tu negocio', 'Servicios', 'Pago']

interface Servicio {
  id: string
  nombre: string
  duracion: number
  precio: number
}

const DIAS: { key: keyof Schedule; label: string; short: string }[] = [
  { key: 'lun', label: 'Lunes', short: 'Lun' },
  { key: 'mar', label: 'Martes', short: 'Mar' },
  { key: 'mie', label: 'Miércoles', short: 'Mié' },
  { key: 'jue', label: 'Jueves', short: 'Jue' },
  { key: 'vie', label: 'Viernes', short: 'Vie' },
  { key: 'sab', label: 'Sábado', short: 'Sáb' },
  { key: 'dom', label: 'Domingo', short: 'Dom' },
]

const DEFAULT_SCHEDULE: Schedule = {
  lun: { open: '09:00', close: '18:00' },
  mar: { open: '09:00', close: '18:00' },
  mie: { open: '09:00', close: '18:00' },
  jue: { open: '09:00', close: '18:00' },
  vie: { open: '09:00', close: '18:00' },
  sab: { open: '09:00', close: '14:00' },
  dom: null,
}

interface Negocio {
  nombre: string
  rubro: string
  ciudad: string
  whatsapp: string
  email: string
  schedule: Schedule
}

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [planId, setPlanId] = useState('anual')
  const [negocio, setNegocio] = useState<Negocio>({
    nombre: '',
    rubro: '',
    ciudad: '',
    whatsapp: '',
    email: '',
    schedule: DEFAULT_SCHEDULE,
  })
  const [servicios, setServicios] = useState<Servicio[]>([
    { id: crypto.randomUUID(), nombre: '', duracion: 60, precio: 0 },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plan = TURNERO_PLANS.find(p => p.id === planId)!

  function addServicio() {
    setServicios(s => [...s, { id: crypto.randomUUID(), nombre: '', duracion: 60, precio: 0 }])
  }

  function removeServicio(id: string) {
    setServicios(s => s.filter(x => x.id !== id))
  }

  function updateServicio(id: string, field: keyof Servicio, value: string | number) {
    setServicios(s => s.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  function canAdvance() {
    if (step === 1) return !!planId
    if (step === 2) return negocio.nombre.trim() && negocio.rubro && negocio.email.trim() && negocio.whatsapp.trim()
    if (step === 3) return servicios.length > 0 && servicios.every(s => s.nombre.trim())
    return true
  }

  async function handlePagar() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, negocio, servicios }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar')
      window.location.href = data.init_point
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper, #F5F4EF)' }}>
      {/* Header */}
      <div className="border-b border-black/10 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-black text-lg tracking-tight" style={{ fontFamily: 'var(--f-display, serif)' }}>
            DIVINIA
          </span>
          <span className="text-sm text-black/40 font-mono">Paso {step} de 4</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-black/10">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%`, background: '#C6FF3D' }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Step tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
          {STEPS.map((label, i) => {
            const s = (i + 1) as 1 | 2 | 3 | 4
            return (
              <div
                key={label}
                className="flex items-center gap-2 shrink-0"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  style={{
                    background: s < step ? '#C6FF3D' : s === step ? '#0C0C0C' : 'transparent',
                    color: s < step ? '#0C0C0C' : s === step ? '#C6FF3D' : '#0C0C0C66',
                    border: s >= step ? '2px solid currentColor' : 'none',
                  }}
                >
                  {s < step ? <Check size={13} /> : s}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: s === step ? '#0C0C0C' : '#0C0C0C55' }}
                >
                  {label}
                </span>
                {i < 3 && <ChevronRight size={14} style={{ color: '#0C0C0C33' }} />}
              </div>
            )
          })}
        </div>

        {/* STEP 1: Plan */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--f-display, serif)' }}>
              Elegí tu plan
            </h1>
            <p className="text-black/50 mb-8">Empezá hoy, cancelás cuando quieras.</p>

            <div className="grid gap-4">
              {TURNERO_PLANS.filter(p => p.id !== 'enterprise').map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlanId(p.id)}
                  className="w-full text-left rounded-2xl border-2 p-6 transition-all"
                  style={{
                    borderColor: planId === p.id ? '#0C0C0C' : '#0C0C0C15',
                    background: planId === p.id ? '#0C0C0C' : 'white',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {p.popular && (
                        <span
                          className="inline-block text-xs font-black px-2 py-0.5 rounded-full mb-2"
                          style={{ background: '#C6FF3D', color: '#0C0C0C' }}
                        >
                          MÁS POPULAR
                        </span>
                      )}
                      <h3
                        className="font-black text-lg"
                        style={{ color: planId === p.id ? '#F5F4EF' : '#0C0C0C' }}
                      >
                        {p.nombre}
                      </h3>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: planId === p.id ? '#F5F4EF99' : '#0C0C0C66' }}
                      >
                        {p.descripcion}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="text-2xl font-black"
                        style={{ color: planId === p.id ? '#C6FF3D' : '#0C0C0C' }}
                      >
                        {formatPrecio(p.precio)}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: planId === p.id ? '#F5F4EF66' : '#0C0C0C44' }}
                      >
                        {p.billing}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-1">
                    {p.features.map(f => (
                      <li
                        key={f}
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: planId === p.id ? '#F5F4EF99' : '#0C0C0C66' }}
                      >
                        <Check size={11} style={{ color: planId === p.id ? '#C6FF3D' : '#0C0C0C55', flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Tu negocio */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--f-display, serif)' }}>
              Tu negocio
            </h1>
            <p className="text-black/50 mb-8">Estos datos se usan para configurar tu Turnero.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-1.5">Nombre del negocio *</label>
                <input
                  type="text"
                  placeholder="Ej: Salón de Belleza Aurora"
                  value={negocio.nombre}
                  onChange={e => setNegocio(n => ({ ...n, nombre: e.target.value }))}
                  className="w-full border-2 border-black/15 rounded-xl px-4 py-3 text-base outline-none focus:border-black/60 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Rubro *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RUBROS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setNegocio(n => ({ ...n, rubro: r.id }))}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-left"
                      style={{
                        borderColor: negocio.rubro === r.id ? '#0C0C0C' : '#0C0C0C15',
                        background: negocio.rubro === r.id ? '#0C0C0C' : 'white',
                        color: negocio.rubro === r.id ? '#F5F4EF' : '#0C0C0C',
                      }}
                    >
                      <span>{r.emoji}</span>
                      <span className="text-xs leading-tight">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Ciudad</label>
                  <input
                    type="text"
                    placeholder="San Luis"
                    value={negocio.ciudad}
                    onChange={e => setNegocio(n => ({ ...n, ciudad: e.target.value }))}
                    className="w-full border-2 border-black/15 rounded-xl px-4 py-3 text-base outline-none focus:border-black/60 transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="2664123456"
                    value={negocio.whatsapp}
                    onChange={e => setNegocio(n => ({ ...n, whatsapp: e.target.value }))}
                    className="w-full border-2 border-black/15 rounded-xl px-4 py-3 text-base outline-none focus:border-black/60 transition-colors bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Email *</label>
                <input
                  type="email"
                  placeholder="tu@negocio.com"
                  value={negocio.email}
                  onChange={e => setNegocio(n => ({ ...n, email: e.target.value }))}
                  className="w-full border-2 border-black/15 rounded-xl px-4 py-3 text-base outline-none focus:border-black/60 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Horario de atención</label>
                <div className="bg-white border-2 border-black/15 rounded-2xl overflow-hidden">
                  {DIAS.map((dia, i) => {
                    const dayVal: DaySchedule = negocio.schedule[dia.key]
                    const isOpen = dayVal !== null
                    return (
                      <div
                        key={dia.key}
                        className="flex items-center gap-3 px-4 py-2.5"
                        style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
                      >
                        <button
                          type="button"
                          onClick={() => setNegocio(n => ({
                            ...n,
                            schedule: {
                              ...n.schedule,
                              [dia.key]: isOpen ? null : { open: '09:00', close: '18:00' },
                            },
                          }))}
                          className="w-9 h-5 rounded-full transition-all shrink-0 relative"
                          style={{ background: isOpen ? '#0C0C0C' : '#0C0C0C20' }}
                        >
                          <span
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                            style={{ left: isOpen ? '18px' : '2px' }}
                          />
                        </button>
                        <span className="text-sm font-semibold w-8 shrink-0" style={{ color: isOpen ? '#0C0C0C' : '#0C0C0C44' }}>
                          {dia.short}
                        </span>
                        {isOpen ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={dayVal!.open}
                              onChange={e => setNegocio(n => ({
                                ...n,
                                schedule: { ...n.schedule, [dia.key]: { ...dayVal!, open: e.target.value } },
                              }))}
                              className="border border-black/15 rounded-lg px-2 py-1 text-sm outline-none focus:border-black/50 transition-colors w-24"
                            />
                            <span className="text-black/30 text-xs">→</span>
                            <input
                              type="time"
                              value={dayVal!.close}
                              onChange={e => setNegocio(n => ({
                                ...n,
                                schedule: { ...n.schedule, [dia.key]: { ...dayVal!, close: e.target.value } },
                              }))}
                              className="border border-black/15 rounded-lg px-2 py-1 text-sm outline-none focus:border-black/50 transition-colors w-24"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-black/30 italic">Cerrado</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Servicios */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--f-display, serif)' }}>
              Tus servicios
            </h1>
            <p className="text-black/50 mb-8">
              Agregá los servicios que ofrecés. Después los podés editar desde el panel.
            </p>

            <div className="space-y-3 mb-4">
              {servicios.map((s, i) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-black/10 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-black/40">SERVICIO {i + 1}</span>
                    {servicios.length > 1 && (
                      <button
                        onClick={() => removeServicio(s.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nombre del servicio (ej: Corte de cabello)"
                      value={s.nombre}
                      onChange={e => updateServicio(s.id, 'nombre', e.target.value)}
                      className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/50 transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-black/50 mb-1">Duración (min)</p>
                        <select
                          value={s.duracion}
                          onChange={e => updateServicio(s.id, 'duracion', Number(e.target.value))}
                          className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/50 bg-white"
                        >
                          {[15, 30, 45, 60, 75, 90, 120].map(m => (
                            <option key={m} value={m}>{m} min</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 mb-1">Precio (ARS)</p>
                        <input
                          type="number"
                          placeholder="0"
                          value={s.precio || ''}
                          onChange={e => updateServicio(s.id, 'precio', Number(e.target.value))}
                          className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addServicio}
              className="w-full border-2 border-dashed border-black/20 rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-semibold text-black/50 hover:border-black/40 hover:text-black/70 transition-all"
            >
              <Plus size={16} />
              Agregar otro servicio
            </button>
          </div>
        )}

        {/* STEP 4: Resumen + Pago */}
        {step === 4 && (
          <div>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--f-display, serif)' }}>
              Resumen
            </h1>
            <p className="text-black/50 mb-8">Revisá todo antes de pagar.</p>

            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-2xl border border-black/10 p-5">
                <p className="text-xs font-bold text-black/40 mb-3">PLAN ELEGIDO</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-lg">Turnero {plan.nombre}</p>
                    <p className="text-sm text-black/50">{plan.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl">{formatPrecio(plan.precio)}</p>
                    <p className="text-xs text-black/40">{plan.billing}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/10 p-5">
                <p className="text-xs font-bold text-black/40 mb-3">TU NEGOCIO</p>
                <div className="space-y-1">
                  <p className="font-bold">{negocio.nombre}</p>
                  <p className="text-sm text-black/60">
                    {RUBROS.find(r => r.id === negocio.rubro)?.emoji}{' '}
                    {RUBROS.find(r => r.id === negocio.rubro)?.label}
                    {negocio.ciudad ? ` · ${negocio.ciudad}` : ''}
                  </p>
                  <p className="text-sm text-black/60">📱 {negocio.whatsapp}</p>
                  <p className="text-sm text-black/60">✉️ {negocio.email}</p>
                  <p className="text-sm text-black/60">
                    🕐 {DIAS.filter(d => negocio.schedule[d.key] !== null).map(d => d.short).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/10 p-5">
                <p className="text-xs font-bold text-black/40 mb-3">
                  SERVICIOS ({servicios.length})
                </p>
                <ul className="space-y-2">
                  {servicios.map(s => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.nombre}</span>
                      <span className="text-black/50">
                        {s.duracion}min
                        {s.precio > 0 ? ` · ${formatPrecio(s.precio)}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePagar}
              disabled={loading}
              className="w-full font-black text-lg py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
              style={{
                background: loading ? '#0C0C0C55' : '#0C0C0C',
                color: '#C6FF3D',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Pagar con MercadoPago
                  <span className="text-base font-normal opacity-70">
                    {formatPrecio(plan.precio)}
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-black/40 mt-3">
              Pago seguro via MercadoPago · Podés cancelar en cualquier momento
            </p>
          </div>
        )}

        {/* Nav botones */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-black/10">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3 | 4)}
              className="flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black transition-colors"
            >
              <ArrowLeft size={16} />
              Atrás
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              onClick={() => setStep(s => (s + 1) as 1 | 2 | 3 | 4)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 font-black px-6 py-3 rounded-xl transition-all"
              style={{
                background: canAdvance() ? '#0C0C0C' : '#0C0C0C20',
                color: canAdvance() ? '#C6FF3D' : '#0C0C0C44',
                cursor: canAdvance() ? 'pointer' : 'not-allowed',
              }}
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
