'use client'

import { useState, useMemo } from 'react'
import { BookingConfig, Service, formatDateAR, formatPriceARS, getNextAvailableDates } from '@/lib/bookings'

function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}` }

function getMonthGrid(year: number, month: number): (string | null)[] {
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid: (string | null)[] = Array(firstDayOfWeek).fill(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(toDateStr(year, month, d))
  return grid
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAY_HEADERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export default function BookingWizard({
  clientId, config, companyName, color,
}: {
  clientId: string; config: BookingConfig; companyName: string; color: string
}) {
  const today = new Date()
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [calView, setCalView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [snapshot, setSnapshot] = useState<{ service: Service; date: string; time: string } | null>(null)

  const availableDatesSet = useMemo(
    () => new Set(getNextAvailableDates(config, config.advance_booking_days || 30)),
    [config]
  )

  const monthGrid = useMemo(
    () => getMonthGrid(calView.year, calView.month),
    [calView]
  )

  async function handleDateSelect(date: string) {
    if (!selectedService) return
    setSelectedDate(date)
    setSelectedTime('')
    setSlots([])
    setLoadingSlots(true)
    const res = await fetch(`/api/bookings/${clientId}?date=${date}&serviceId=${selectedService.id}`)
    const data = await res.json()
    setSlots(data.slots || [])
    setLoadingSlots(false)
    // Scroll to time section
    setTimeout(() => document.getElementById('section-time')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    if (!form.phone.trim()) { setError('El WhatsApp es requerido'); return }
    setSubmitting(true); setError('')
    const res = await fetch(`/api/bookings/${clientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: selectedService!.id, date: selectedDate, time: selectedTime,
        customerName: form.name, customerPhone: form.phone, customerNotes: form.notes,
      }),
    })
    if (res.ok) {
      setSnapshot({ service: selectedService!, date: selectedDate, time: selectedTime })
      setDone(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Error al reservar. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  function resetAll() {
    setDone(false); setSnapshot(null); setSelectedService(null)
    setSelectedDate(''); setSelectedTime(''); setSlots([])
    setForm({ name: '', phone: '', notes: '' }); setError('')
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done && snapshot) {
    const waMsg = encodeURIComponent(
      `Hola ${companyName}! 👋 Acabo de pedir un turno:\n\n` +
      `📌 Servicio: ${snapshot.service.name}\n` +
      `📅 Fecha: ${formatDateAR(snapshot.date)}\n` +
      `⏰ Hora: ${snapshot.time}\n` +
      `👤 Nombre: ${form.name}\n` +
      (form.phone ? `📱 WhatsApp: ${form.phone}\n` : '') +
      (form.notes ? `📝 Nota: ${form.notes}\n` : '') +
      `\n¡Gracias!`
    )
    const waLink = config.owner_phone ? `https://wa.me/${config.owner_phone}?text=${waMsg}` : null

    return (
      <div className="flex items-center justify-center p-6 pt-12">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¡Solicitud enviada!</h2>
          <p className="text-sm text-gray-500 mb-1">{snapshot.service.name}</p>
          <p className="text-sm text-gray-400 mb-6">{formatDateAR(snapshot.date)} · {snapshot.time} hs</p>
          <div className="rounded-xl p-4 mb-5 text-xs text-left" style={{ backgroundColor: `${color}18` }}>
            <p style={{ color }}>
              📋 Tu solicitud está <strong>pendiente de confirmación</strong>. {companyName} te va a contactar por WhatsApp para confirmar y coordinar el pago de la seña.
            </p>
          </div>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm w-full mb-3"
              style={{ backgroundColor: color }}
            >
              💬 Avisarle a {companyName} por WhatsApp
            </a>
          )}
          <button onClick={resetAll} className="text-sm text-gray-400 underline">Hacer otra reserva</button>
        </div>
      </div>
    )
  }

  const sena = selectedService?.price_ars ? Math.ceil(selectedService.price_ars * 0.2) : 0
  const showTimeSection = !!(selectedDate && selectedService)
  const showFormSection = !!(selectedDate && selectedTime && selectedService)

  const prevMonth = () => setCalView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  const nextMonth = () => setCalView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })

  // ── Main wizard ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-16 space-y-4">

      {/* Row 1: Services + Calendar */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: color }}>1</span>
            <h2 className="font-bold text-gray-800 text-sm">Elegí el servicio</h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {config.services.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No hay servicios configurados.</p>
            ) : config.services.map(service => {
              const isSelected = selectedService?.id === service.id
              const serviceSena = service.price_ars ? Math.ceil(service.price_ars * 0.2) : 0
              return (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setSelectedDate(''); setSelectedTime(''); setSlots([]) }}
                  className="w-full flex items-center px-5 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                >
                  {/* Radio */}
                  <div className="w-4 h-4 rounded-full border-2 mr-3 shrink-0 flex items-center justify-center transition-colors"
                    style={isSelected ? { backgroundColor: color, borderColor: color } : { borderColor: '#d1d5db' }}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{service.name}</p>
                    {service.price_ars > 0 && serviceSena > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">Seña: {formatPriceARS(serviceSena)}</p>
                    )}
                  </div>
                  {service.price_ars > 0 && (
                    <span className="text-sm font-semibold ml-3 shrink-0" style={{ color }}>
                      {formatPriceARS(service.price_ars)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: color }}>2</span>
            <h2 className="font-bold text-gray-800 text-sm">Elegí la fecha</h2>
          </div>
          <div className="px-4 py-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg font-light">‹</button>
              <span className="text-sm font-semibold text-gray-700">{MONTH_NAMES[calView.month]} {calView.year}</span>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg font-light">›</button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-y-1">
              {monthGrid.map((dateStr, i) => {
                if (!dateStr) return <div key={`e${i}`} />
                const isPast = dateStr <= todayStr
                const isAvail = availableDatesSet.has(dateStr) && !isPast
                const isSelected = dateStr === selectedDate
                const isToday = dateStr === todayStr
                const day = parseInt(dateStr.split('-')[2])
                const canClick = isAvail && !!selectedService
                return (
                  <button
                    key={dateStr}
                    onClick={() => canClick && handleDateSelect(dateStr)}
                    disabled={!canClick}
                    className="mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                    style={
                      isSelected ? { backgroundColor: color, color: '#fff' } :
                      isToday && isAvail ? { border: `2px solid ${color}`, color } :
                      isAvail ? { backgroundColor: `${color}22`, color } :
                      { color: '#d1d5db' }
                    }
                  >
                    {day}
                  </button>
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${color}22` }} />
                <span className="text-xs text-gray-400">Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-100" />
                <span className="text-xs text-gray-400">Sin turnos</span>
              </div>
            </div>
            {!selectedService && (
              <p className="text-xs text-gray-400 text-center mt-3">Elegí un servicio primero para ver disponibilidad</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Time slots */}
      {showTimeSection && (
        <div id="section-time" className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: color }}>3</span>
            <h2 className="font-bold text-gray-800 text-sm">
              Elegí el horario
              <span className="font-normal text-gray-400 ml-2">— {formatDateLong(selectedDate)}</span>
            </h2>
          </div>
          <div className="px-5 py-4">
            {loadingSlots ? (
              <p className="text-gray-400 text-sm text-center py-4 animate-pulse">Cargando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No hay turnos disponibles este día. Elegí otra fecha.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot)
                      setTimeout(() => document.getElementById('section-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                    }}
                    className="py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                    style={
                      selectedTime === slot
                        ? { backgroundColor: color, borderColor: color, color: '#fff' }
                        : { borderColor: '#e5e7eb', color: '#374151' }
                    }
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 3: Form + Summary */}
      {showFormSection && (
        <div id="section-form" className="grid md:grid-cols-2 gap-4">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: color }}>4</span>
              <h2 className="font-bold text-gray-800 text-sm">Tus datos</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp *</label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="2664000000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notas (opcional)</label>
                <textarea value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  placeholder="Algún detalle adicional..." />
              </div>
              <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: `${color}18` }}>
                <p style={{ color }}>💬 {companyName} te va a contactar por WhatsApp para confirmar el turno y coordinar el pago de la seña.</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden self-start">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">📋 Resumen de tu turno</p>
            </div>
            <div className="px-5 py-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Servicios</span>
                <div className="text-right">
                  <p className="font-medium text-gray-800">{selectedService.name}</p>
                  {selectedService.price_ars > 0 && (
                    <p className="font-semibold" style={{ color }}>{formatPriceARS(selectedService.price_ars)}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha</span>
                <span className="font-medium text-gray-800 capitalize">{formatDateAR(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Horario</span>
                <span className="font-medium text-gray-800">{selectedTime} hs</span>
              </div>
              {sena > 0 && (
                <div className="border-t border-gray-100 pt-3 mt-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-gray-400">Seña requerida (20%)</span>
                    <span className="text-lg font-bold" style={{ color }}>{formatPriceARS(sena)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{companyName} te contacta por WhatsApp para coordinar el pago y confirmar el turno.</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-5">
              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.name.trim() || !form.phone.trim()}
                className="w-full text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 text-sm"
                style={{ backgroundColor: color }}
              >
                {submitting ? 'Enviando solicitud...' : '✅ Confirmar solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
