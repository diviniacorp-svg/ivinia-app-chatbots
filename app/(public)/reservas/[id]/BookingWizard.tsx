'use client'

import { useState } from 'react'
import { BookingConfig, Service, formatDateAR, formatPriceARS, getNextAvailableDates } from '@/lib/bookings'

type Step = 'service' | 'date' | 'time' | 'info' | 'confirm' | 'done'

export default function BookingWizard({
  clientId,
  config,
  companyName,
  color,
}: {
  clientId: string
  config: BookingConfig
  companyName: string
  color: string
}) {
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const availableDates = getNextAvailableDates(config, config.advance_booking_days || 30)

  async function loadSlots(date: string, service: Service) {
    setLoadingSlots(true)
    setSlots([])
    const res = await fetch(`/api/bookings/${clientId}?date=${date}&serviceId=${service.id}`)
    const data = await res.json()
    setSlots(data.slots || [])
    setLoadingSlots(false)
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch(`/api/bookings/${clientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: selectedService!.id,
        date: selectedDate,
        time: selectedTime,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        customerNotes: form.notes,
      }),
    })

    if (res.ok) {
      setStep('done')
    } else {
      const data = await res.json()
      setError(data.error || 'Error al reservar. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  const btnStyle = { backgroundColor: color }

  if (step === 'done') {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno confirmado!</h2>
        <p className="text-gray-600 mb-6">
          {selectedService!.name} el {formatDateAR(selectedDate)} a las {selectedTime}
        </p>
        <p className="text-gray-500 text-sm">Te esperamos en {companyName}.</p>
        <button
          onClick={() => { setStep('service'); setSelectedService(null); setSelectedDate(''); setSelectedTime('') }}
          className="mt-8 text-sm text-indigo-600 underline"
        >
          Reservar otro turno
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {(['service', 'date', 'time', 'info'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              ['service', 'date', 'time', 'info', 'confirm'].indexOf(step) >= i
                ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Elegir servicio */}
      {step === 'service' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué servicio necesitás?</h2>
          <p className="text-gray-500 text-sm mb-6">Elegí una opción para continuar</p>
          <div className="space-y-3">
            {config.services.map(service => (
              <button
                key={service.id}
                onClick={() => { setSelectedService(service); setStep('date') }}
                className="w-full text-left border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-4 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    {service.description && <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>}
                    <p className="text-sm text-gray-400 mt-1">⏱ {service.duration_minutes} min</p>
                  </div>
                  <span className="text-sm font-medium text-indigo-600 ml-4 whitespace-nowrap">
                    {formatPriceARS(service.price_ars)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Elegir fecha */}
      {step === 'date' && (
        <div>
          <button onClick={() => setStep('service')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">← Volver</button>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué día preferís?</h2>
          <p className="text-gray-500 text-sm mb-6">Días disponibles para {selectedService!.name}</p>
          <div className="grid grid-cols-3 gap-2">
            {availableDates.slice(0, 21).map(date => {
              const d = new Date(date + 'T12:00:00')
              const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
              const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
              return (
                <button
                  key={date}
                  onClick={async () => {
                    setSelectedDate(date)
                    await loadSlots(date, selectedService!)
                    setStep('time')
                  }}
                  className="border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-3 text-center transition-all"
                >
                  <p className="text-xs text-gray-400">{dias[d.getDay()]}</p>
                  <p className="text-lg font-bold text-gray-900">{d.getDate()}</p>
                  <p className="text-xs text-gray-400">{meses[d.getMonth()]}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3: Elegir hora */}
      {step === 'time' && (
        <div>
          <button onClick={() => setStep('date')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">← Volver</button>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿A qué hora?</h2>
          <p className="text-gray-500 text-sm mb-6">{formatDateAR(selectedDate)} — {selectedService!.name}</p>
          {loadingSlots ? (
            <p className="text-gray-400 text-center py-8">Cargando horarios...</p>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay turnos disponibles este día.</p>
              <button onClick={() => setStep('date')} className="mt-4 text-sm text-indigo-600 underline">Elegir otro día</button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => { setSelectedTime(slot); setStep('info') }}
                  className="border-2 border-gray-200 hover:border-indigo-400 rounded-lg py-3 text-sm font-medium text-gray-700 transition-all"
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Datos personales */}
      {step === 'info' && (
        <div>
          <button onClick={() => setStep('time')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">← Volver</button>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Tus datos</h2>
          <p className="text-gray-500 text-sm mb-6">
            {selectedService!.name} · {formatDateAR(selectedDate)} · {selectedTime}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="+54 9 266..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="Algún detalle adicional..."
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              style={btnStyle}
              className="w-full text-white font-semibold py-4 rounded-xl disabled:opacity-50 transition-opacity text-lg"
            >
              {submitting ? 'Confirmando...' : 'Confirmar turno'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
