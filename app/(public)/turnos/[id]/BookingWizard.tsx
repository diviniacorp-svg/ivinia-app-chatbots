'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfig, Service, formatDateAR, formatPriceARS, getNextAvailableDates } from '@/lib/bookings'

type Step = 'service' | 'date' | 'time' | 'info' | 'done'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

type PastAppt = {
  service_name: string
  appointment_date: string
  appointment_time: string
  status: string
}

function MiniCalendar({ availableDates, selectedDate, onSelect, color }: {
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

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={() => viewMonth === 0 ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold">‹</button>
        <span className="font-bold text-gray-900 text-sm">{MESES[viewMonth]} {viewYear}</span>
        <button onClick={() => viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold">›</button>
      </div>
      <div className="grid grid-cols-7 px-2 pt-2">
        {DIAS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 pb-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isAvailable = availableSet.has(dateStr)
          const isSelected = dateStr === selectedDate
          const isPast = new Date(dateStr + 'T12:00:00') < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          return (
            <button key={dateStr} disabled={!isAvailable || isPast}
              onClick={() => isAvailable && !isPast && onSelect(dateStr)}
              className={`aspect-square w-full rounded-lg text-sm font-medium transition-all
                ${isSelected ? 'text-white font-bold scale-110 shadow-md' : ''}
                ${isAvailable && !isPast && !isSelected ? 'hover:scale-105' : ''}
                ${!isAvailable || isPast ? 'text-gray-300 cursor-default' : 'cursor-pointer'}`}
              style={isSelected ? { backgroundColor: color } : isAvailable && !isPast ? { backgroundColor: color + '15', color } : {}}
            >{day}</button>
          )
        })}
      </div>
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-50 bg-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: color + '25' }} />
          <span className="text-xs text-gray-500">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span className="text-xs text-gray-400">No disponible</span>
        </div>
      </div>
    </div>
  )
}

export default function BookingWizard({ clientId, config, companyName, color, configId }: {
  clientId: string
  config: BookingConfig
  companyName: string
  color: string
  configId: string
}) {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paidSuccess, setPaidSuccess] = useState(false)

  // Historial de clienta
  const [history, setHistory] = useState<PastAppt[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const historyRef = useRef<AbortController | null>(null)

  const availableDates = getNextAvailableDates(config, config.advance_booking_days || 30)

  // Detectar retorno de MercadoPago
  useEffect(() => {
    const paid = searchParams.get('paid')
    const apptId = searchParams.get('appt')
    if (paid === 'true' && apptId) {
      setPaidSuccess(true)
      setStep('done')
    }
  }, [searchParams])

  async function fetchHistory(phone: string) {
    if (phone.replace(/\D/g, '').length < 8) { setHistory([]); return }
    if (historyRef.current) historyRef.current.abort()
    historyRef.current = new AbortController()
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/bookings/${clientId}/history?phone=${encodeURIComponent(phone)}`, {
        signal: historyRef.current.signal
      })
      const data = await res.json()
      setHistory(data.appointments || [])
    } catch {
      // abortado o error — no mostrar nada
    } finally {
      setLoadingHistory(false)
    }
  }

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

  async function handlePayDeposit() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSubmitting(true)
    setError('')
    const res = await fetch(`/api/bookings/${clientId}/deposit`, {
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
        configId,
      }),
    })
    const data = await res.json()
    if (res.ok && data.initPoint) {
      window.location.href = data.initPoint
    } else {
      setError(data.error || 'Error al procesar la seña')
      setSubmitting(false)
    }
  }

  const depositPct = selectedService?.deposit_percentage ?? 0
  const depositAmount = depositPct > 0 && selectedService?.price_ars
    ? Math.round((selectedService.price_ars * depositPct) / 100)
    : 0

  const btnStyle = { backgroundColor: color }

  function reset() {
    setStep('service'); setSelectedService(null); setSelectedDate('')
    setSelectedTime(''); setForm({ name: '', phone: '', email: '', notes: '' })
    setPaidSuccess(false); setHistory([])
  }

  if (step === 'done') {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">{paidSuccess ? '🎉' : '✅'}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {paidSuccess ? '¡Seña confirmada!' : '¡Turno reservado!'}
        </h2>
        {selectedService && selectedDate && selectedTime ? (
          <p className="text-gray-600 mb-2">
            {selectedService.name} el {formatDateAR(selectedDate)} a las {selectedTime}
          </p>
        ) : null}
        {paidSuccess && (
          <p className="text-green-600 text-sm font-medium mb-2">Tu pago fue procesado correctamente.</p>
        )}
        <p className="text-gray-500 text-sm mt-2">Te esperamos en {companyName} 💅</p>
        <button onClick={reset} className="mt-8 text-sm underline" style={{ color }}>
          Reservar otro turno
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {(['service', 'date', 'time', 'info'] as Step[]).map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${
            ['service', 'date', 'time', 'info'].indexOf(step) >= i ? '' : 'bg-gray-200'
          }`} style={['service', 'date', 'time', 'info'].indexOf(step) >= i ? { backgroundColor: color } : {}} />
        ))}
      </div>

      {/* Step 1: Servicio */}
      {step === 'service' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué servicio necesitás?</h2>
          <p className="text-gray-500 text-sm mb-6">Elegí una opción para continuar</p>
          <div className="space-y-3">
            {config.services.map(service => (
              <button key={service.id} onClick={() => { setSelectedService(service); setStep('date') }}
                className="w-full text-left border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-4 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    {service.description && <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-400">⏱ {service.duration_minutes} min</span>
                      {(service.deposit_percentage ?? 0) > 0 && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          Requiere seña {service.deposit_percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold ml-4 whitespace-nowrap" style={{ color }}>
                    {formatPriceARS(service.price_ars)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Fecha */}
      {step === 'date' && (
        <div>
          <button onClick={() => setStep('service')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">← Volver</button>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué día preferís?</h2>
          <p className="text-gray-500 text-sm mb-4">Para <strong>{selectedService!.name}</strong></p>
          <MiniCalendar availableDates={availableDates} selectedDate={selectedDate}
            onSelect={async (date) => { setSelectedDate(date); await loadSlots(date, selectedService!); setStep('time') }}
            color={color} />
          <p className="text-xs text-gray-400 text-center mt-3">Próximos {config.advance_booking_days || 30} días disponibles</p>
        </div>
      )}

      {/* Step 3: Hora */}
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
              <button onClick={() => setStep('date')} className="mt-4 text-sm underline" style={{ color }}>Elegir otro día</button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button key={slot} onClick={() => { setSelectedTime(slot); setStep('info') }}
                  className="border-2 border-gray-200 hover:border-indigo-400 rounded-lg py-3 text-sm font-medium text-gray-700 transition-all">
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Datos + historial + seña */}
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
              <input type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="Tu nombre completo" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Teléfono</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                onBlur={e => fetchHistory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="+54 9 266..." />

              {/* Historial de clienta */}
              {loadingHistory && (
                <p className="text-xs text-gray-400 mt-2">Buscando tus visitas anteriores...</p>
              )}
              {!loadingHistory && history.length > 0 && (
                <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: color + '40', backgroundColor: color + '08' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color }}>
                    ¡Bienvenida de vuelta! Tus últimas visitas:
                  </p>
                  <div className="space-y-1.5">
                    {history.map((h, i) => (
                      <div key={i} className="flex justify-between items-center text-xs text-gray-600">
                        <span className="font-medium">{h.service_name}</span>
                        <span className="text-gray-400">{formatDateAR(h.appointment_date)} {h.appointment_time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="tu@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="Diseño deseado, alergias, etc." />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Botones de acción: con/sin seña */}
            {depositAmount > 0 ? (
              <div className="space-y-3">
                <button onClick={handlePayDeposit} disabled={submitting || !form.name.trim()}
                  style={btnStyle}
                  className="w-full text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-opacity text-base flex flex-col items-center">
                  <span>{submitting ? 'Procesando...' : `Pagar seña ${formatPriceARS(depositAmount)} y confirmar`}</span>
                  <span className="text-xs opacity-80 font-normal mt-0.5">
                    {depositPct}% del total · tu turno queda asegurado
                  </span>
                </button>
                <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                  className="w-full border-2 font-semibold py-3.5 rounded-xl disabled:opacity-50 transition-all text-sm"
                  style={{ borderColor: color, color }}>
                  {submitting ? 'Reservando...' : 'Reservar sin seña (pendiente de confirmación)'}
                </button>
              </div>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                style={btnStyle}
                className="w-full text-white font-semibold py-4 rounded-xl disabled:opacity-50 transition-opacity text-lg">
                {submitting ? 'Confirmando...' : 'Confirmar turno'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
