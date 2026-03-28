'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfig, Service, formatDateAR, formatPriceARS, getNextAvailableDates } from '@/lib/bookings'
import SplashIntro from './SplashIntro'

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
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

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

export default function BookingWizard({ clientId, config, companyName, color, configId, introEmoji, introTagline, introStyle, depositsEnabled }: {
  clientId: string
  config: BookingConfig
  companyName: string
  color: string
  configId: string
  introEmoji?: string
  introTagline?: string
  introStyle?: 'bubbles' | 'sparkles' | 'petals'
  depositsEnabled?: boolean
}) {
  const searchParams = useSearchParams()
  const [splashDone, setSplashDone] = useState(false)
  const [step, setStep] = useState<Step>('service')

  // Multi-servicio
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_ars, 0)

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paidSuccess, setPaidSuccess] = useState(false)

  const [history, setHistory] = useState<PastAppt[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const historyRef = useRef<AbortController | null>(null)

  const availableDates = getNextAvailableDates(config, config.advance_booking_days || 30)

  useEffect(() => {
    const paid = searchParams.get('paid')
    const apptId = searchParams.get('appt')
    if (paid === 'true' && apptId) { setPaidSuccess(true); setStep('done') }
  }, [searchParams])

  function toggleService(service: Service) {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    )
  }

  async function fetchHistory(phone: string) {
    if (phone.replace(/\D/g, '').length < 8) { setHistory([]); return }
    if (historyRef.current) historyRef.current.abort()
    historyRef.current = new AbortController()
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/bookings/${clientId}/history?phone=${encodeURIComponent(phone)}`, { signal: historyRef.current.signal })
      const data = await res.json()
      setHistory(data.appointments || [])
    } catch { /* abortado */ } finally { setLoadingHistory(false) }
  }

  async function loadSlots(date: string) {
    setLoadingSlots(true); setSlots([])
    const res = await fetch(`/api/bookings/${clientId}?date=${date}&totalDuration=${totalDuration}`)
    const data = await res.json()
    setSlots(data.slots || [])
    setLoadingSlots(false)
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSubmitting(true); setError('')
    const res = await fetch(`/api/bookings/${clientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceIds: selectedServices.map(s => s.id),
        serviceNames: selectedServices.map(s => s.name).join(' + '),
        totalDuration,
        totalPrice,
        date: selectedDate, time: selectedTime,
        customerName: form.name, customerPhone: form.phone,
        customerEmail: form.email, customerNotes: form.notes,
      }),
    })
    if (res.ok) { setStep('done') }
    else {
      const data = await res.json()
      setError(data.error || 'Error al reservar. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  async function handlePayDeposit() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSubmitting(true); setError('')
    const res = await fetch(`/api/bookings/${clientId}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceIds: selectedServices.map(s => s.id),
        serviceNames: selectedServices.map(s => s.name).join(' + '),
        totalDuration, totalPrice,
        date: selectedDate, time: selectedTime,
        customerName: form.name, customerPhone: form.phone,
        customerEmail: form.email, customerNotes: form.notes,
        configId,
      }),
    })
    const data = await res.json()
    if (res.ok && data.initPoint) { window.location.href = data.initPoint }
    else { setError(data.error || 'Error al procesar la seña'); setSubmitting(false) }
  }

  // Seña: activa si depositsEnabled y algún servicio seleccionado tiene deposit_percentage > 0
  const maxDepositPct = depositsEnabled
    ? Math.max(...selectedServices.map(s => s.deposit_percentage ?? 0), 0)
    : 0
  const depositAmount = maxDepositPct > 0 && totalPrice > 0
    ? Math.round((totalPrice * maxDepositPct) / 100)
    : 0

  const btnStyle = { backgroundColor: color }

  function reset() {
    setStep('service'); setSelectedServices([])
    setSelectedDate(''); setSelectedTime('')
    setForm({ name: '', phone: '', email: '', notes: '' })
    setPaidSuccess(false); setHistory([])
  }

  if (!splashDone) {
    return (
      <SplashIntro companyName={companyName} tagline={introTagline || 'Reservá tu turno online'}
        color={color} emoji={introEmoji || '📅'} style={introStyle || 'bubbles'}
        onDone={() => setSplashDone(true)} />
    )
  }

  if (step === 'done') {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">{paidSuccess ? '🎉' : '✅'}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {paidSuccess ? '¡Seña confirmada!' : '¡Turno reservado!'}
        </h2>
        <p className="text-gray-600 mb-2">
          {selectedServices.map(s => s.name).join(' + ') || 'Servicio'} · {formatDateAR(selectedDate)} a las {selectedTime}
        </p>
        {paidSuccess && <p className="text-green-600 text-sm font-medium mb-2">Tu pago fue procesado correctamente.</p>}
        <p className="text-gray-500 text-sm mt-2">Te esperamos en {companyName} 💅</p>
        <button onClick={reset} className="mt-8 text-sm underline" style={{ color }}>Reservar otro turno</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {(['service', 'date', 'time', 'info'] as Step[]).map((s, i) => (
          <div key={s} className="flex-1 h-1.5 rounded-full transition-all"
            style={['service','date','time','info'].indexOf(step) >= i ? { backgroundColor: color } : { backgroundColor: '#e5e7eb' }} />
        ))}
      </div>

      {/* STEP 1: Multi-servicio */}
      {step === 'service' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué servicios querés?</h2>
          <p className="text-gray-500 text-sm mb-5">Podés elegir más de uno</p>
          <div className="space-y-2.5">
            {config.services.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id)
              return (
                <button key={service.id} onClick={() => toggleService(service)}
                  className={`w-full text-left rounded-xl p-4 border-2 transition-all ${isSelected ? 'border-current bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}
                  style={isSelected ? { borderColor: color, backgroundColor: color + '0d' } : {}}>
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-current' : 'border-gray-300'}`}
                      style={isSelected ? { borderColor: color, backgroundColor: color } : {}}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                      {service.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{service.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">⏱ {service.duration_minutes} min</span>
                        {depositsEnabled && (service.deposit_percentage ?? 0) > 0 && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">Seña {service.deposit_percentage}%</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold ml-2 whitespace-nowrap flex-shrink-0" style={{ color }}>
                      {formatPriceARS(service.price_ars)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Barra de total */}
          {selectedServices.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl" style={{ backgroundColor: color + '12' }}>
              <div className="flex justify-between items-center mb-3 text-sm">
                <span className="text-gray-600">{selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''} · ⏱ {totalDuration} min</span>
                <span className="font-black text-lg" style={{ color }}>{formatPriceARS(totalPrice)}</span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {selectedServices.map(s => s.name).join(' + ')}
              </div>
              <button onClick={() => setStep('date')} style={btnStyle}
                className="w-full text-white font-bold py-3.5 rounded-xl text-base">
                Elegir fecha y hora →
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Fecha */}
      {step === 'date' && (
        <div>
          <button onClick={() => setStep('service')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">← Volver</button>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué día preferís?</h2>
          <p className="text-gray-500 text-sm mb-4">
            {selectedServices.map(s => s.name).join(' + ')} · {totalDuration} min
          </p>
          <MiniCalendar availableDates={availableDates} selectedDate={selectedDate}
            onSelect={async (date) => { setSelectedDate(date); await loadSlots(date); setStep('time') }}
            color={color} />
          <p className="text-xs text-gray-400 text-center mt-3">Próximos {config.advance_booking_days || 30} días disponibles</p>
        </div>
      )}

      {/* STEP 3: Hora */}
      {step === 'time' && (
        <div>
          <button onClick={() => setStep('date')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">← Volver</button>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¿A qué hora?</h2>
          <p className="text-gray-500 text-sm mb-6">{formatDateAR(selectedDate)} · {totalDuration} min en total</p>
          {loadingSlots ? (
            <p className="text-gray-400 text-center py-8">Cargando horarios...</p>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay turnos disponibles este día para {totalDuration} min.</p>
              <button onClick={() => setStep('date')} className="mt-4 text-sm underline" style={{ color }}>Elegir otro día</button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button key={slot} onClick={() => { setSelectedTime(slot); setStep('info') }}
                  className="border-2 border-gray-200 hover:border-opacity-100 rounded-lg py-3 text-sm font-medium text-gray-700 transition-all"
                  style={{ '--hover-border': color } as React.CSSProperties}>
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Datos */}
      {step === 'info' && (
        <div>
          <button onClick={() => setStep('time')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">← Volver</button>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Tus datos</h2>
          <p className="text-gray-500 text-sm mb-5">
            {selectedServices.map(s => s.name).join(' + ')} · {formatDateAR(selectedDate)} · {selectedTime}
          </p>

          {/* Resumen */}
          <div className="mb-5 p-3 rounded-xl border" style={{ borderColor: color + '30', backgroundColor: color + '08' }}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total estimado</span>
              <span className="font-bold" style={{ color }}>{formatPriceARS(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{totalDuration} min · {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''}</span>
              <span>{selectedTime}hs</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="Tu nombre completo" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Teléfono</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                onBlur={e => fetchHistory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="+54 9 266..." />
              {loadingHistory && <p className="text-xs text-gray-400 mt-2">Buscando visitas anteriores...</p>}
              {!loadingHistory && history.length > 0 && (
                <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: color + '40', backgroundColor: color + '08' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color }}>¡Bienvenida de vuelta! Últimas visitas:</p>
                  {history.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600 mt-1">
                      <span className="font-medium truncate">{h.service_name}</span>
                      <span className="text-gray-400 ml-2 flex-shrink-0">{formatDateAR(h.appointment_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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

            {depositAmount > 0 ? (
              <div className="space-y-3">
                <button onClick={handlePayDeposit} disabled={submitting || !form.name.trim()} style={btnStyle}
                  className="w-full text-white font-bold py-4 rounded-xl disabled:opacity-50 flex flex-col items-center">
                  <span>{submitting ? 'Procesando...' : `Pagar seña ${formatPriceARS(depositAmount)} y confirmar`}</span>
                  <span className="text-xs opacity-80 font-normal mt-0.5">{maxDepositPct}% del total · tu lugar queda asegurado</span>
                </button>
                <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                  className="w-full border-2 font-semibold py-3.5 rounded-xl disabled:opacity-50 text-sm"
                  style={{ borderColor: color, color }}>
                  Reservar sin seña (pendiente de confirmación)
                </button>
              </div>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.name.trim()} style={btnStyle}
                className="w-full text-white font-semibold py-4 rounded-xl disabled:opacity-50 text-lg">
                {submitting ? 'Confirmando...' : 'Confirmar turno'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
