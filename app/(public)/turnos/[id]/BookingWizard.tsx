'use client'

import { useState, useMemo } from 'react'
import { BookingConfig, Service, formatDateAR, formatPriceARS, getNextAvailableDates } from '@/lib/bookings'

type Step = 'service' | 'date' | 'time' | 'info' | 'confirm' | 'done'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function MiniCalendar({
  availableDates,
  selectedDate,
  onSelect,
  color,
}: {
  availableDates: string[]
  selectedDate: string
  onSelect: (date: string) => void
  color: string
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const availableSet = useMemo(() => new Set(availableDates), [availableDates])

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header mes */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold transition-colors">
          ‹
        </button>
        <span className="font-bold text-gray-900 text-sm">{MESES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold transition-colors">
          ›
        </button>
      </div>
      {/* Días de la semana */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DIAS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 pb-1">{d}</div>
        ))}
      </div>
      {/* Celdas */}
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isAvailable = availableSet.has(dateStr)
          const isSelected = dateStr === selectedDate
          const isPast = new Date(dateStr + 'T12:00:00') < new Date(today.getFullYear(), today.getMonth(), today.getDate())

          return (
            <button
              key={dateStr}
              disabled={!isAvailable || isPast}
              onClick={() => isAvailable && !isPast && onSelect(dateStr)}
              className={`
                aspect-square w-full rounded-lg text-sm font-medium transition-all
                ${isSelected ? 'text-white font-bold scale-110 shadow-md' : ''}
                ${isAvailable && !isPast && !isSelected ? 'text-gray-800 hover:scale-105' : ''}
                ${!isAvailable || isPast ? 'text-gray-300 cursor-default' : 'cursor-pointer'}
              `}
              style={
                isSelected
                  ? { backgroundColor: color }
                  : isAvailable && !isPast
                  ? { backgroundColor: color + '15', color: color }
                  : {}
              }
            >
              {day}
            </button>
          )
        })}
      </div>
      {/* Leyenda */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-50 bg-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: color + '25' }} />
          <span className="text-xs text-gray-500">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span className="text-xs text-gray-400">No disponible</span>
        </div>
        {selectedDate && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600 font-medium">Seleccionado</span>
          </div>
        )}
      </div>
    </div>
  )
}

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
          <p className="text-gray-500 text-sm mb-4">Seleccioná una fecha disponible para <strong>{selectedService!.name}</strong></p>
          <MiniCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelect={async (date) => {
              setSelectedDate(date)
              await loadSlots(date, selectedService!)
              setStep('time')
            }}
            color={color}
          />
          <p className="text-xs text-gray-400 text-center mt-3">
            Próximos {config.advance_booking_days || 30} días disponibles
          </p>
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
