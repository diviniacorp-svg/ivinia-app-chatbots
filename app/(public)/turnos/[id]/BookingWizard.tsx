'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfig, Service, formatDateAR, formatPriceARS, getNextAvailableDates, getFirstAvailableMonth } from '@/lib/bookings'
import SplashIntro from './SplashIntro'

type Step = 'select' | 'form' | 'done'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

type PastAppt = { service_name: string; appointment_date: string; appointment_time: string; status: string }

function MiniCalendar({ availableDates, selectedDate, onSelect, color, viewYear, viewMonth, onPrev, onNext }: {
  availableDates: string[]
  selectedDate: string
  onSelect: (d: string) => void
  color: string
  viewYear: number
  viewMonth: number
  onPrev: () => void
  onNext: () => void
}) {
  const todayStr = new Date().toISOString().split('T')[0]
  const availableSet = useMemo(() => new Set(availableDates), [availableDates])
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={onPrev} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">‹</button>
        <span className="font-bold text-gray-900 text-sm">{MESES[viewMonth]} {viewYear}</span>
        <button onClick={onNext} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">›</button>
      </div>
      <div className="grid grid-cols-7 px-2 pt-2">
        {DIAS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 pb-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isAvail = availableSet.has(dateStr)
          const isPast = dateStr < todayStr
          const isSel = dateStr === selectedDate
          return (
            <button key={dateStr} disabled={!isAvail || isPast}
              onClick={() => isAvail && !isPast && onSelect(dateStr)}
              className={`aspect-square w-full rounded-lg text-sm font-medium transition-all
                ${isSel ? 'text-white font-bold shadow-md scale-110' : ''}
                ${isAvail && !isPast && !isSel ? 'hover:scale-105 cursor-pointer' : ''}
                ${!isAvail || isPast ? 'text-gray-300 cursor-default' : ''}`}
              style={isSel ? { backgroundColor: color }
                : isAvail && !isPast ? { backgroundColor: color + '18', color } : {}}>
              {day}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-50 bg-gray-50 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: color + '30' }} /> Disponible</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Sin turnos</span>
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
  const [step, setStep] = useState<Step>('select')

  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_ars, 0)

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const availableDates = useMemo(() => getNextAvailableDates(config, config.advance_booking_days || 60), [config])
  const firstMonth = useMemo(() => getFirstAvailableMonth(availableDates), [availableDates])
  const [viewYear, setViewYear] = useState(firstMonth.year)
  const [viewMonth, setViewMonth] = useState(firstMonth.month)

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paidSuccess, setPaidSuccess] = useState(false)
  const [history, setHistory] = useState<PastAppt[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const historyRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const paid = searchParams.get('paid')
    const apptId = searchParams.get('appt')
    if (paid === 'true' && apptId) { setPaidSuccess(true); setStep('done') }
  }, [searchParams])

  const maxDepositPct = depositsEnabled ? Math.max(...selectedServices.map(s => s.deposit_percentage ?? 0), 0) : 0
  const depositAmount = maxDepositPct > 0 && totalPrice > 0 ? Math.round((totalPrice * maxDepositPct) / 100) : 0

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>()
    config.services.forEach(s => {
      const cat = s.category || 'Servicios'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(s)
    })
    return map
  }, [config.services])

  function prevMonth() { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }
  function nextMonth() { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }

  async function loadSlotsFor(date: string, duration: number) {
    if (duration === 0) { setSlots([]); return }
    setLoadingSlots(true); setSlots([])
    const res = await fetch(`/api/bookings/${clientId}?date=${date}&totalDuration=${duration}`)
    const data = await res.json()
    setSlots(data.slots || [])
    setLoadingSlots(false)
  }

  function toggleService(service: Service) {
    setSelectedTime('')
    const isRemoving = selectedServices.find(s => s.id === service.id)
    const newServices = isRemoving
      ? selectedServices.filter(s => s.id !== service.id)
      : [...selectedServices, service]
    setSelectedServices(newServices)
    if (selectedDate) {
      const newDuration = newServices.reduce((sum, s) => sum + s.duration_minutes, 0)
      loadSlotsFor(selectedDate, newDuration)
    }
  }

  async function onSelectDate(date: string) {
    setSelectedDate(date)
    setSelectedTime('')
    await loadSlotsFor(date, totalDuration)
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

  async function handleSubmit() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSubmitting(true); setError('')
    const res = await fetch(`/api/bookings/${clientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceIds: selectedServices.map(s => s.id),
        serviceNames: selectedServices.map(s => s.name).join(' + '),
        totalDuration, totalPrice,
        date: selectedDate, time: selectedTime,
        customerName: form.name, customerPhone: form.phone,
        customerEmail: form.email, customerNotes: form.notes,
      }),
    })
    if (res.ok) setStep('done')
    else { const data = await res.json(); setError(data.error || 'Error al reservar'); setSubmitting(false) }
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
    if (res.ok && data.initPoint) window.location.href = data.initPoint
    else { setError(data.error || 'Error al procesar la seña'); setSubmitting(false) }
  }

  function reset() {
    setStep('select'); setSelectedServices([]); setSelectedDate(''); setSelectedTime('')
    setForm({ name: '', phone: '', email: '', notes: '' }); setPaidSuccess(false); setHistory([])
  }

  const canContinue = selectedServices.length > 0 && selectedDate && selectedTime
  const btnStyle = { backgroundColor: color }

  if (!splashDone) {
    return <SplashIntro companyName={companyName} tagline={introTagline || 'Reservá tu turno online'}
      color={color} emoji={introEmoji || '📅'} style={introStyle || 'bubbles'} onDone={() => setSplashDone(true)} />
  }

  if (step === 'done') {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4">{paidSuccess ? '🎉' : '✅'}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{paidSuccess ? '¡Seña confirmada!' : '¡Solicitud enviada!'}</h2>
        <p className="text-gray-600 mb-1">{selectedServices.map(s => s.name).join(' + ')}</p>
        {selectedDate && <p className="text-gray-600 mb-1">{formatDateAR(selectedDate)} · {selectedTime}hs</p>}
        <p className="text-gray-500 text-sm mt-4">Te esperamos en {companyName} 💅</p>
        <button onClick={reset} className="mt-8 text-sm underline" style={{ color }}>Hacer otra reserva</button>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setStep('select')} className="text-sm mb-5 flex items-center gap-1 hover:opacity-70" style={{ color }}>← Volver</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tus datos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none"
                  placeholder="Ej: María González" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  onBlur={e => fetchHistory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none"
                  placeholder="Ej: 2664 XXX XXX" />
                {loadingHistory && <p className="text-xs text-gray-400 mt-1.5">Buscando visitas anteriores...</p>}
                {!loadingHistory && history.length > 0 && (
                  <div className="mt-2 p-3 rounded-xl border" style={{ borderColor: color + '40', backgroundColor: color + '08' }}>
                    <p className="text-xs font-semibold mb-1.5" style={{ color }}>¡Bienvenida de vuelta! Últimas visitas:</p>
                    {history.map((h, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600 mt-1">
                        <span className="font-medium truncate">{h.service_name}</span>
                        <span className="text-gray-400 ml-2 shrink-0">{formatDateAR(h.appointment_date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none resize-none"
                  placeholder="Diseño deseado, alergias, consultas..." />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de tu turno</h2>
            <div className="rounded-2xl border-2 p-5 space-y-3" style={{ borderColor: color + '30', backgroundColor: color + '06' }}>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Servicios</p>
                {selectedServices.map(s => (
                  <div key={s.id} className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="font-medium" style={{ color }}>{formatPriceARS(s.price_ars)}</span>
                  </div>
                ))}
                {selectedServices.length > 1 && (
                  <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span style={{ color }}>{formatPriceARS(totalPrice)}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📅</span>
                  <span className="font-medium capitalize">
                    {selectedDate ? `${DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]} ${formatDateAR(selectedDate)}` : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>⏰</span><span className="font-medium">{selectedTime ? `${selectedTime} hs` : '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>⏱</span><span>{totalDuration} minutos en total</span>
                </div>
              </div>
              {depositAmount > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-0.5">Seña requerida ({maxDepositPct}%)</p>
                  <p className="text-2xl font-black" style={{ color }}>{formatPriceARS(depositAmount)}</p>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2.5">
              {depositAmount > 0 ? (
                <>
                  <button onClick={handlePayDeposit} disabled={submitting || !form.name.trim()} style={btnStyle}
                    className="w-full text-white font-bold py-4 rounded-xl disabled:opacity-50">
                    {submitting ? 'Procesando...' : `Pagar seña ${formatPriceARS(depositAmount)} y confirmar`}
                  </button>
                  <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                    className="w-full border-2 font-semibold py-3.5 rounded-xl disabled:opacity-50 text-sm"
                    style={{ borderColor: color, color }}>
                    Confirmar sin seña (pendiente de aprobación)
                  </button>
                </>
              ) : (
                <button onClick={handleSubmit} disabled={submitting || !form.name.trim()} style={btnStyle}
                  className="w-full text-white font-bold py-4 rounded-xl disabled:opacity-50 text-lg">
                  {submitting ? 'Confirmando...' : '✓ Confirmar solicitud'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SELECCIÓN: servicios + calendario en paralelo ──
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reservá tu turno online ✨</h2>
        <p className="text-gray-500 text-sm mt-1">Elegí el servicio y la fecha — {companyName} te confirma por WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">1 — Elegí los servicios</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" style={{ maxHeight: 460, overflowY: 'auto' }}>
            {Array.from(grouped.entries()).map(([cat, services]) => (
              <div key={cat}>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{cat}</p>
                </div>
                {services.map(service => {
                  const isSel = selectedServices.some(s => s.id === service.id)
                  return (
                    <button key={service.id} onClick={() => toggleService(service)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors hover:bg-gray-50"
                      style={isSel ? { backgroundColor: color + '10' } : {}}>
                      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                        style={isSel ? { borderColor: color, backgroundColor: color } : { borderColor: '#d1d5db' }}>
                        {isSel && <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{service.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{service.duration_minutes} min</span>
                          {depositsEnabled && (service.deposit_percentage ?? 0) > 0 && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">Seña {service.deposit_percentage}%</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ color }}>{formatPriceARS(service.price_ars)}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-3 p-3.5 rounded-2xl" style={{ backgroundColor: color + '12' }}>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''} · {totalDuration} min</span>
                <span className="font-black" style={{ color }}>{formatPriceARS(totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedServices.map(s => s.name).join(' + ')}</p>
            </div>
          )}
        </div>

        {/* Calendario + horarios */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">2 — Elegí la fecha</p>
            <MiniCalendar availableDates={availableDates} selectedDate={selectedDate}
              onSelect={onSelectDate} color={color}
              viewYear={viewYear} viewMonth={viewMonth}
              onPrev={prevMonth} onNext={nextMonth} />
          </div>

          {selectedDate && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                3 — Elegí la hora · <span className="capitalize">{DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]}</span> {formatDateAR(selectedDate)}
              </p>
              {selectedServices.length === 0 ? (
                <p className="text-sm text-gray-400 bg-white border border-gray-200 rounded-xl p-4 text-center">
                  Primero elegí al menos un servicio
                </p>
              ) : loadingSlots ? (
                <p className="text-sm text-gray-400 text-center py-4">Cargando horarios...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-xl border border-gray-200">
                  No hay horarios para {totalDuration} min este día.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button key={slot} onClick={() => setSelectedTime(slot)}
                      className="py-3 rounded-xl text-sm font-medium border-2 transition-all"
                      style={selectedTime === slot
                        ? { backgroundColor: color, borderColor: color, color: 'white' }
                        : { borderColor: '#e5e7eb', color: '#374151' }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {canContinue && (
            <button onClick={() => setStep('form')} style={btnStyle}
              className="w-full text-white font-bold py-4 rounded-xl text-base shadow-md transition-opacity hover:opacity-90">
              Continuar con mis datos →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
