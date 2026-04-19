'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfig, Service, Professional, formatDateAR, formatPriceARS, getNextAvailableDates, getFirstAvailableMonth } from '@/lib/bookings'
import SplashIntro from './SplashIntro'

type Step = 'select' | 'form' | 'done'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

type PastAppt = { service_name: string; appointment_date: string; appointment_time: string; status: string }

// ── Mini Calendar ─────────────────────────────────────────────────
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
    <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
        <button onClick={onPrev} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper-2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 18, color: 'var(--muted)' }}>‹</button>
        <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{MESES[viewMonth]} {viewYear}</span>
        <button onClick={onNext} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper-2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 18, color: 'var(--muted)' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 8px 0' }}>
        {DIAS.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', paddingBottom: 4 }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: '0 8px 8px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isAvail = availableSet.has(dateStr)
          const isPast = dateStr < todayStr
          const isSel = dateStr === selectedDate
          return (
            <button key={dateStr}
              disabled={!isAvail || isPast}
              onClick={() => isAvail && !isPast && onSelect(dateStr)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                border: 'none',
                cursor: isAvail && !isPast ? 'pointer' : 'default',
                fontFamily: 'var(--f-display)',
                fontSize: 13,
                fontWeight: isSel ? 700 : 500,
                transition: 'all 0.1s',
                background: isSel ? color : isAvail && !isPast ? color + '18' : 'transparent',
                color: isSel ? '#fff' : isAvail && !isPast ? color : 'var(--muted-2)',
              }}>
              {day}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, display: 'inline-block', background: color + '30' }} /> Disponible
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, display: 'inline-block', background: 'var(--paper-2)', border: '1px solid var(--line)' }} /> Sin turnos
        </span>
      </div>
    </div>
  )
}

export default function BookingWizard({ clientId, config, companyName, color, configId, introEmoji, introTagline, introStyle, depositsEnabled, instagram, ownerPhone }: {
  clientId: string
  config: BookingConfig
  companyName: string
  color: string
  configId: string
  introEmoji?: string
  introTagline?: string
  introStyle?: 'bubbles' | 'sparkles' | 'petals'
  depositsEnabled?: boolean
  instagram?: string
  ownerPhone?: string
}) {
  const searchParams = useSearchParams()
  const [splashDone, setSplashDone] = useState(false)
  const [step, setStep] = useState<Step>('select')

  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_ars, 0)

  const [selectedProfessional, setSelectedProfessional] = useState<Professional | 'any' | null>(null)

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({})
  const [slotMaxCapacity, setSlotMaxCapacity] = useState(1)
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

  async function loadSlotsFor(date: string, duration: number, profId?: string, serviceId?: string) {
    if (duration === 0) { setSlots([]); return }
    setLoadingSlots(true); setSlots([])
    const profParam = profId ? `&professionalId=${profId}` : ''
    const svcParam = serviceId ? `&serviceId=${serviceId}` : ''
    const res = await fetch(`/api/bookings/${clientId}?date=${date}&totalDuration=${duration}${profParam}${svcParam}`)
    const data = await res.json()
    setSlots(data.slots || [])
    setSlotCounts(data.slotCounts || {})
    setSlotMaxCapacity(data.maxCapacity || 1)
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
      const profId = selectedProfessional !== null
        ? (selectedProfessional === 'any' ? 'any' : selectedProfessional.id)
        : undefined
      const primarySvcId = newServices[0]?.id
      loadSlotsFor(selectedDate, newDuration, profId, primarySvcId)
    }
  }

  async function onSelectDate(date: string) {
    setSelectedDate(date)
    setSelectedTime('')
    const profId = selectedProfessional !== null
      ? (selectedProfessional === 'any' ? 'any' : selectedProfessional.id)
      : undefined
    const primarySvcId = selectedServices[0]?.id
    await loadSlotsFor(date, totalDuration, profId, primarySvcId)
  }

  function selectProfessional(prof: Professional | 'any') {
    setSelectedProfessional(prof)
    setSelectedTime('')
    if (selectedDate && totalDuration > 0) {
      const profId = prof === 'any' ? 'any' : prof.id
      const primarySvcId = selectedServices[0]?.id
      loadSlotsFor(selectedDate, totalDuration, profId, primarySvcId)
    }
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
    const profId = selectedProfessional === null ? undefined : selectedProfessional === 'any' ? 'any' : selectedProfessional.id
    const profName = selectedProfessional !== null && selectedProfessional !== 'any' && typeof selectedProfessional === 'object' ? selectedProfessional.name : undefined
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
        professionalId: profId,
        professionalName: profName,
      }),
    })
    if (res.ok) setStep('done')
    else { const data = await res.json(); setError(data.error || 'Error al reservar'); setSubmitting(false) }
  }

  async function handlePayDeposit() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSubmitting(true); setError('')
    const profId = selectedProfessional === null ? undefined : selectedProfessional === 'any' ? 'any' : selectedProfessional.id
    const profName = selectedProfessional !== null && selectedProfessional !== 'any' && typeof selectedProfessional === 'object' ? selectedProfessional.name : undefined
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
        professionalId: profId,
        professionalName: profName,
      }),
    })
    const data = await res.json()
    if (res.ok && data.initPoint) window.location.href = data.initPoint
    else { setError(data.error || 'Error al procesar la seña'); setSubmitting(false) }
  }

  function reset() {
    setStep('select'); setSelectedServices([]); setSelectedDate(''); setSelectedTime('')
    setForm({ name: '', phone: '', email: '', notes: '' }); setPaidSuccess(false); setHistory([])
    setSelectedProfessional(null)
  }

  const hasProfessionals = (config.professionals?.length ?? 0) > 0
  const canContinue = selectedServices.length > 0 && selectedDate && selectedTime &&
    (!hasProfessionals || selectedProfessional !== null)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--line)',
    borderRadius: 8,
    padding: '12px 16px',
    fontFamily: 'var(--f-display)',
    fontSize: 16, // 16px mínimo para evitar zoom automático en iOS
    outline: 'none',
    background: 'var(--paper)',
    color: 'var(--ink)',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 6,
  }

  if (!splashDone) {
    return <SplashIntro companyName={companyName} tagline={introTagline || 'Reservá tu turno online'}
      color={color} emoji={introEmoji || '📅'} style={introStyle || 'bubbles'} onDone={() => setSplashDone(true)} />
  }

  // ── PASO DONE ──
  if (step === 'done') {
    const waPhone = ownerPhone || config.owner_phone || ''
    const waMsg = encodeURIComponent(
      `Hola ${companyName}! 👋 Acabo de pedir un turno:\n` +
      (selectedServices.length ? `📌 ${selectedServices.map(s => s.name).join(' + ')}\n` : '') +
      (selectedDate ? `📅 ${formatDateAR(selectedDate)} · ${selectedTime}hs\n` : '') +
      (typeof selectedProfessional === 'object' && selectedProfessional ? `👩‍💼 Profesional: ${selectedProfessional.name}\n` : '') +
      `👤 ${form.name}\n¡Gracias!`
    )
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{paidSuccess ? '🎉' : '✅'}</div>
        <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 24, color: 'var(--ink)', margin: '0 0 8px' }}>
          {paidSuccess ? '¡Seña confirmada!' : '¡Solicitud enviada!'}
        </h2>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: 'var(--muted)', margin: '0 0 4px' }}>
          {selectedServices.map(s => s.name).join(' + ')}
        </p>
        {selectedDate && (
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--muted)', margin: '0 0 4px' }}>
            {formatDateAR(selectedDate)} · {selectedTime}hs
          </p>
        )}
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted)', margin: '8px 0 32px' }}>
          Te esperamos en {companyName}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {waPhone && (
            <a href={`https://wa.me/${waPhone}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '16px 0', borderRadius: 10, fontFamily: 'var(--f-mono)', fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', background: '#25d366', color: '#fff', boxSizing: 'border-box' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.545 5.875L0 24l6.29-1.518A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.38l-.36-.214-3.733.9.944-3.637-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
              Avisarle por WhatsApp
            </a>
          )}
          {instagram && (
            <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '16px 0', borderRadius: 10, fontFamily: 'var(--f-mono)', fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }}>
              Seguir en Instagram @{instagram}
            </a>
          )}
        </div>
        <button onClick={reset} style={{ marginTop: 24, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>
          Hacer otra reserva
        </button>
      </div>
    )
  }

  // ── PASO FORM ──
  if (step === 'form') {
    return (
      <div style={{ padding: '24px 24px 80px', maxWidth: 480, margin: '0 auto' }}>
        <button onClick={() => setStep('select')} style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', color: color, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>← Volver</button>

        <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', margin: '0 0 4px' }}>Tus datos</h2>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 24 }}>
          {selectedServices.map(s => s.name).join(' + ')} · {formatDateAR(selectedDate)} {selectedTime}hs
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nombre completo *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle} placeholder="Ej: María González" />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp *</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              onBlur={e => fetchHistory(e.target.value)}
              style={inputStyle} placeholder="Ej: 2664 XXX XXX" />
            {loadingHistory && <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>Buscando visitas anteriores...</p>}
            {!loadingHistory && history.length > 0 && (
              <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 10, border: `1px solid ${color}40`, background: color + '08' }}>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', color, marginBottom: 8 }}>¡Bienvenida de vuelta! Últimas visitas:</p>
                {history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.service_name}</span>
                    <span style={{ flexShrink: 0, marginLeft: 8 }}>{formatDateAR(h.appointment_date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Email (opcional)</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle} placeholder="tu@email.com" />
          </div>
          <div>
            <label style={labelStyle}>Notas (opcional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} style={{ ...inputStyle, resize: 'none' }}
              placeholder="Diseño deseado, alergias, consultas..." />
          </div>

          {/* Resumen */}
          <div style={{ borderRadius: 12, border: `2px solid ${color}30`, background: color + '06', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Resumen</p>
            {selectedServices.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)' }}>
                <span>{s.name}</span>
                <span style={{ color, fontWeight: 700 }}>{formatPriceARS(s.price_ars)}</span>
              </div>
            ))}
            {selectedServices.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 700, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                <span>Total</span>
                <span style={{ color }}>{formatPriceARS(totalPrice)}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)', margin: 0 }}>
                📅 <span style={{ textTransform: 'capitalize' }}>{selectedDate ? `${DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]} ${formatDateAR(selectedDate)}` : '—'}</span>
              </p>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)', margin: 0 }}>⏰ {selectedTime ? `${selectedTime}hs` : '—'}</p>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', margin: 0 }}>⏱ {totalDuration} min en total</p>
              {selectedProfessional && selectedProfessional !== 'any' && typeof selectedProfessional === 'object' && (
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)', margin: 0 }}>👩‍💼 {selectedProfessional.name}</p>
              )}
            </div>
            {depositAmount > 0 && (
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', margin: '0 0 4px' }}>Seña requerida ({maxDepositPct}%)</p>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: 28, fontWeight: 800, color, margin: 0 }}>{formatPriceARS(depositAmount)}</p>
              </div>
            )}
          </div>

          {error && <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#dc2626' }}>{error}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {depositAmount > 0 ? (
              <>
                <button onClick={handlePayDeposit} disabled={submitting || !form.name.trim()}
                  style={{ width: '100%', background: color, color: '#fff', border: 'none', borderRadius: 10, padding: '16px 0', fontFamily: 'var(--f-mono)', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', opacity: (submitting || !form.name.trim()) ? 0.5 : 1 }}>
                  {submitting ? 'Procesando...' : `Pagar seña ${formatPriceARS(depositAmount)} y confirmar`}
                </button>
                <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                  style={{ width: '100%', background: 'none', border: `2px solid ${color}`, color, borderRadius: 10, padding: '14px 0', fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer', opacity: (submitting || !form.name.trim()) ? 0.5 : 1 }}>
                  Confirmar sin seña (pendiente de aprobación)
                </button>
              </>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                style={{ width: '100%', background: color, color: '#fff', border: 'none', borderRadius: 10, padding: '16px 0', fontFamily: 'var(--f-mono)', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', opacity: (submitting || !form.name.trim()) ? 0.5 : 1 }}>
                {submitting ? 'Confirmando...' : 'Confirmar solicitud'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── PASO SELECT: servicios + fechas + horarios ──
  return (
    <div style={{ padding: '24px 24px 80px' }}>
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        1 — Elegí el servicio
      </p>

      {/* Lista de servicios */}
      <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 24 }}>
        {Array.from(grouped.entries()).map(([cat, services]) => (
          <div key={cat}>
            <div style={{ padding: '8px 16px', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color, margin: 0, fontWeight: 700 }}>{cat}</p>
            </div>
            {services.map((service, i) => {
              const isSel = selectedServices.some(s => s.id === service.id)
              return (
                <button key={service.id} onClick={() => toggleService(service)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', border: 'none', borderBottom: i < services.length - 1 ? '1px solid var(--line)' : 'none',
                    background: isSel ? color + '10' : 'var(--paper)', cursor: 'pointer', transition: 'background 0.1s',
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${isSel ? color : 'var(--line)'}`,
                    background: isSel ? color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.1s',
                  }}>
                    {isSel && <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{service.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>{service.duration_minutes} min</span>
                      {depositsEnabled && (service.deposit_percentage ?? 0) > 0 && (
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, background: 'rgba(251,191,36,0.15)', color: '#92400E', borderRadius: 100, padding: '2px 6px' }}>Seña {service.deposit_percentage}%</span>
                      )}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{formatPriceARS(service.price_ars)}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Resumen selección */}
      {selectedServices.length > 0 && (
        <div style={{ marginBottom: 24, padding: '12px 14px', borderRadius: 10, background: color + '12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted)' }}>
            {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''} · {totalDuration} min
          </span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 800, color }}>{formatPriceARS(totalPrice)}</span>
        </div>
      )}

      {/* Profesionales */}
      {config.professionals && config.professionals.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
            {config.professionals.length === 1 ? 'Profesional' : '¿Con quién?'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {config.professionals.map(prof => {
              const isSel = typeof selectedProfessional === 'object' && selectedProfessional?.id === prof.id
              return (
                <button key={prof.id} onClick={() => selectProfessional(prof)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', borderRadius: 10,
                    border: `2px solid ${isSel ? color : 'var(--line)'}`,
                    background: isSel ? color : 'var(--paper)',
                    color: isSel ? '#fff' : 'var(--ink)',
                    fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}>
                  <span>{prof.emoji || '👤'}</span>
                  {prof.name}
                </button>
              )
            })}
            {config.professionals.length > 1 && (
              <button onClick={() => selectProfessional('any')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 10,
                  border: `2px solid ${selectedProfessional === 'any' ? color : 'var(--line)'}`,
                  background: selectedProfessional === 'any' ? color + '18' : 'var(--paper)',
                  color: selectedProfessional === 'any' ? color : 'var(--muted)',
                  fontFamily: 'var(--f-display)', fontSize: 13,
                  cursor: 'pointer',
                }}>
                Sin preferencia
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fecha */}
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
        2 — Elegí la fecha
      </p>
      <div style={{ marginBottom: 24 }}>
        <MiniCalendar availableDates={availableDates} selectedDate={selectedDate}
          onSelect={onSelectDate} color={color}
          viewYear={viewYear} viewMonth={viewMonth}
          onPrev={prevMonth} onNext={nextMonth} />
      </div>

      {/* Horarios */}
      {selectedDate && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
            3 — Elegí la hora · <span style={{ textTransform: 'capitalize' }}>{DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]}</span> {formatDateAR(selectedDate)}
          </p>
          {selectedServices.length === 0 ? (
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted)', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              Primero elegí al menos un servicio
            </p>
          ) : loadingSlots ? (
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>Cargando horarios...</p>
          ) : slots.length === 0 ? (
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0', background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--line)' }}>
              No hay horarios para {totalDuration} min este día.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {slots.map(slot => {
                const booked = slotCounts[slot] || 0
                const remaining = slotMaxCapacity > 1 ? slotMaxCapacity - booked : null
                const isSel = selectedTime === slot
                return (
                  <button key={slot} onClick={() => setSelectedTime(slot)}
                    style={{
                      padding: '10px 0', borderRadius: 8,
                      border: `1px solid ${isSel ? 'transparent' : 'var(--line)'}`,
                      background: isSel ? 'var(--lime)' : 'var(--paper)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--f-mono)', fontSize: 13,
                      textAlign: 'center', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      transition: 'all 0.1s',
                    }}>
                    <span style={{ fontWeight: isSel ? 700 : 400 }}>{slot}</span>
                    {remaining !== null && (
                      <span style={{ fontSize: 9, opacity: 0.7 }}>{remaining} cupo{remaining !== 1 ? 's' : ''}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Botón continuar */}
      {canContinue && (
        <button onClick={() => setStep('form')}
          style={{
            width: '100%', background: 'var(--ink)', color: 'var(--paper)', border: 'none',
            borderRadius: 10, padding: '16px 0', fontFamily: 'var(--f-mono)', fontSize: 16,
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
          Continuar con mis datos →
        </button>
      )}
    </div>
  )
}
