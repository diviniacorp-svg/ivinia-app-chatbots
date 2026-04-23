'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfig, Service, Professional, Product, formatDateAR, formatPriceARS, getNextAvailableDates, getFirstAvailableMonth } from '@/lib/bookings'
import SplashIntro from './SplashIntro'
import { getThemeForRubro } from '@/lib/turnero-themes'

type Step = 'select' | 'form' | 'done'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

type PastAppt = { service_name: string; appointment_date: string; appointment_time: string; status: string }

// ── Barra de progreso ─────────────────────────────────────────────
function ProgressBar({ step, color }: { step: Step; color: string }) {
  const steps = [
    { key: 'select', label: 'Fecha y hora' },
    { key: 'form', label: 'Tus datos' },
    { key: 'done', label: 'Confirmado' },
  ]
  const currentIdx = steps.findIndex(s => s.key === step)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, position: 'relative', zIndex: 1 }}>
      {steps.map((s, i) => {
        const isActive = i === currentIdx
        const isDone = i < currentIdx
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isDone ? color : isActive ? color : 'var(--paper-3)',
                border: `2px solid ${isDone || isActive ? color : 'var(--line)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700,
                color: isDone || isActive ? '#fff' : 'var(--muted)',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 16px ${color}66` : 'none',
              }}>
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em',
                textTransform: 'uppercase', marginTop: 5,
                color: isActive ? 'var(--ink)' : 'var(--muted)',
                whiteSpace: 'nowrap',
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 1, flex: 1, marginBottom: 18,
                background: i < currentIdx
                  ? `linear-gradient(to right, ${color}, ${color})`
                  : 'var(--line)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

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
    <div style={{
      background: 'var(--paper)',
      borderRadius: 20,
      border: '1px solid var(--line)',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--line)',
      }}>
        <button onClick={onPrev} style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--paper-2)', border: '1px solid var(--line)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--muted)', fontSize: 18, transition: 'all 0.15s',
        }}>‹</button>
        <span style={{
          fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14,
          color: 'var(--ink)', letterSpacing: '-0.01em',
        }}>{MESES[viewMonth]} {viewYear}</span>
        <button onClick={onNext} style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--paper-2)', border: '1px solid var(--line)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--muted)', fontSize: 18, transition: 'all 0.15s',
        }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px 10px 4px' }}>
        {DIAS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 9,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--muted)', paddingBottom: 6,
          }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, padding: '0 10px 10px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isAvail = availableSet.has(dateStr)
          const isPast = dateStr < todayStr
          const isSel = dateStr === selectedDate
          return (
            <button
              key={dateStr}
              disabled={!isAvail || isPast}
              onClick={() => isAvail && !isPast && onSelect(dateStr)}
              style={{
                aspectRatio: '1', borderRadius: 10, border: 'none',
                cursor: isAvail && !isPast ? 'pointer' : 'default',
                fontFamily: 'var(--f-display)', fontSize: 13,
                fontWeight: isSel ? 700 : 400,
                transition: 'all 0.15s ease',
                background: isSel ? color : isAvail && !isPast ? `${color}18` : 'transparent',
                color: isSel ? '#fff' : isAvail && !isPast ? color : 'var(--muted)',
                boxShadow: isSel ? `0 0 16px ${color}66` : 'none',
                transform: isSel ? 'scale(1.05)' : 'scale(1)',
                opacity: isPast && !isAvail ? 0.3 : 1,
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div style={{
        display: 'flex', gap: 16, padding: '10px 16px',
        borderTop: '1px solid var(--line)',
        background: 'var(--paper-2)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, display: 'inline-block', background: `${color}44` }} />Disponible
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, display: 'inline-block', background: 'var(--paper-3)', border: '1px solid var(--line)' }} />Sin turnos
        </span>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────
function Card({ children, color, style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--paper)',
      borderRadius: 20,
      border: color ? `1px solid ${color}30` : '1px solid var(--line)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Success checkmark animado ─────────────────────────────────────
function AnimatedCheck({ color }: { color: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ filter: `drop-shadow(0 0 20px ${color}80)` }}>
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="3" opacity="0.3"/>
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="3"
        strokeDasharray="226" strokeDashoffset="226"
        style={{ animation: 'dp-circle-draw 0.6s 0.1s ease forwards' }}
        fill="none"/>
      <path d="M24 40l11 11 21-21" stroke={color} strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="50" strokeDashoffset="50"
        style={{ animation: 'dp-check-draw 0.4s 0.7s ease forwards' }}/>
    </svg>
  )
}

// ── MAIN WIZARD ───────────────────────────────────────────────────
export default function BookingWizard({
  clientId, config, companyName, color, configId,
  introEmoji, introTagline, introStyle,
  depositsEnabled, instagram, ownerPhone,
  tipoNegocio, productosEnabled, productos,
}: {
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
  tipoNegocio?: string
  productosEnabled?: boolean
  productos?: Product[]
}) {
  const searchParams = useSearchParams()
  const [splashDone, setSplashDone] = useState(false)
  const [step, setStep] = useState<Step>('select')
  const [activeTab, setActiveTab] = useState<'turnos' | 'productos'>('turnos')

  const theme = useMemo(() => getThemeForRubro(tipoNegocio), [tipoNegocio])

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

  const productosGrouped = useMemo(() => {
    if (!productos?.length) return new Map<string, Product[]>()
    const map = new Map<string, Product[]>()
    productos.forEach(p => {
      const cat = p.category || 'Productos'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(p)
    })
    return map
  }, [productos])

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
        professionalId: profId, professionalName: profName,
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
        professionalId: profId, professionalName: profName,
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
    borderRadius: 12,
    padding: '14px 16px',
    fontFamily: 'var(--f-display)',
    fontSize: 16,
    outline: 'none',
    background: 'var(--paper-2)',
    color: 'var(--ink)',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--f-mono)',
    fontSize: 9,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 7,
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'var(--paper-2)',
    position: 'relative',
    overflowX: 'hidden',
  }

  const SiteHeader = () => (
    <header style={{ background: color, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>{introEmoji || theme.emoji}</span>
        <div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 18, color: '#fff', margin: 0 }}>{companyName}</h1>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.75)', margin: 0 }}>San Luis · Reservas online</p>
        </div>
      </div>
      {instagram && (
        <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.18)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700 }}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          Instagram
        </a>
      )}
    </header>
  )

  const SiteFooter = () => (
    <footer style={{ background: `linear-gradient(135deg, ${color}dd, ${color})`, padding: '32px 24px', textAlign: 'center', marginTop: 40 }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{introEmoji || theme.emoji}</div>
      <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: '#fff', margin: '0 0 4px' }}>{companyName}</p>
      {instagram && (
        <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.75)', margin: '0 0 8px', display: 'block', textDecoration: 'none' }}>
          📸 @{instagram}
        </a>
      )}
      <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', margin: '14px auto' }} />
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
        Reservas online · {new Date().getFullYear()}
      </p>
      <a href="https://divinia.vercel.app" target="_blank" rel="noopener noreferrer"
        style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4, display: 'block', textDecoration: 'none', letterSpacing: '0.08em' }}>
        ⚡ Creado con DIVINIA
      </a>
    </footer>
  )

  if (!splashDone) {
    return <SplashIntro
      companyName={companyName}
      tagline={introTagline || 'Reservá tu turno online'}
      color={color}
      emoji={introEmoji || theme.emoji}
      style={introStyle || 'bubbles'}
      introAnimation={theme.introAnimation}
      onDone={() => setSplashDone(true)}
    />
  }

  // ── PASO DONE ──────────────────────────────────────────────────
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
      <div style={pageStyle}>
        <style>{`
          @keyframes dp-circle-draw { to { stroke-dashoffset: 0; } }
          @keyframes dp-check-draw { to { stroke-dashoffset: 0; } }
          @keyframes dp-success-in {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        <SiteHeader />
        <div style={{
          maxWidth: 480, margin: '0 auto', padding: '40px 24px 60px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', position: 'relative', zIndex: 1,
          animation: 'dp-success-in 0.6s ease both',
        }}>
          <div style={{ marginBottom: 28 }}>
            <AnimatedCheck color={color} />
          </div>

          <h2 style={{
            fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 28,
            color: 'var(--ink)', margin: '0 0 10px', letterSpacing: '-0.02em',
          }}>
            {paidSuccess ? '¡Seña confirmada!' : '¡Turno solicitado!'}
          </h2>

          <Card color={color} style={{ width: '100%', padding: 24, marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Resumen de tu turno</p>
            {selectedServices.length > 0 && (
              <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)', margin: '0 0 12px' }}>
                {selectedServices.map(s => s.name).join(' + ')}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)' }}>
                    <span style={{ textTransform: 'capitalize' }}>{DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]}</span> {formatDateAR(selectedDate)} · {selectedTime}hs
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)' }}>{form.name || 'Tu turno'}</span>
              </div>
              {typeof selectedProfessional === 'object' && selectedProfessional && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{selectedProfessional.emoji || '👩‍💼'}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)' }}>{selectedProfessional.name}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)' }}>Te esperamos en {companyName}</span>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {waPhone && (
              <a href={`https://wa.me/${waPhone}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '16px 0', borderRadius: 14,
                  fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.06em',
                  textDecoration: 'none', background: '#25d366', color: '#fff', fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
                }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.545 5.875L0 24l6.29-1.518A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.38l-.36-.214-3.733.9.944-3.637-.235-.374A9.818 9.818 0 1112 21.818z"/>
                </svg>
                Avisarle por WhatsApp
              </a>
            )}
            {instagram && (
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '16px 0', borderRadius: 14,
                  fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.06em',
                  textDecoration: 'none',
                  background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  color: '#fff', fontWeight: 700,
                }}>
                Seguir en Instagram @{instagram}
              </a>
            )}
          </div>

          <button onClick={reset} style={{
            marginTop: 24, fontFamily: 'var(--f-mono)', fontSize: 10,
            color: 'var(--muted)', background: 'none', border: 'none',
            cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Hacer otra reserva
          </button>
        </div>
        <SiteFooter />
      </div>
    )
  }

  // ── PASO SELECT (todo en una sola página, desplegable) ──────────
  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes dp-slide-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dp-stagger-in { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .dp-slot-btn:hover { transform:scale(1.04); }
        .dp-svc-row:hover { background: ${color}0f !important; }
        @media(max-width:700px){.dp-two-col{grid-template-columns:1fr !important}}
        @media(max-width:700px){.dp-tab-row{flex-direction:column !important}}
      `}</style>

      <SiteHeader />

      {/* ── Hero ── */}
      <div style={{ background: `${color}12`, padding: '28px 24px 24px', textAlign: 'center', borderBottom: `1px solid ${color}25` }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 'clamp(20px,4vw,30px)', color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Reservá tu turno online ✨
        </h2>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', margin: 0 }}>
          {ownerPhone
            ? `Elegí el servicio y la fecha — te confirmamos por WhatsApp`
            : `Elegí el servicio y la fecha`}
        </p>
      </div>

      {/* ── Tabs grandes ── */}
      <div style={{ maxWidth: 900, margin: '24px auto 0', padding: '0 20px', display: 'flex', gap: 12 }} className="dp-tab-row">
        <button onClick={() => setActiveTab('turnos')}
          style={{
            flex: 1, padding: '14px 20px', borderRadius: 12, border: `2px solid ${activeTab === 'turnos' ? color : 'var(--line)'}`,
            background: activeTab === 'turnos' ? color : 'var(--paper)',
            color: activeTab === 'turnos' ? '#fff' : 'var(--muted)',
            fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s', boxShadow: activeTab === 'turnos' ? `0 4px 16px ${color}44` : 'none',
          }}>
          ✨ Turnos {companyName.split(' ')[0]}
        </button>
        {productosEnabled && (
          <button onClick={() => setActiveTab('productos')}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: 12, border: `2px solid ${activeTab === 'productos' ? color : 'var(--line)'}`,
              background: activeTab === 'productos' ? 'var(--paper)' : 'var(--paper)',
              color: activeTab === 'productos' ? 'var(--ink)' : 'var(--muted)',
              fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: activeTab === 'productos' ? 700 : 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            🛍️ Productos
          </button>
        )}
      </div>

      {/* ── Productos view ── */}
      {activeTab === 'productos' && productosEnabled && (
        <div style={{ maxWidth: 900, margin: '20px auto 0', padding: '0 20px 60px' }}>
          {productosGrouped.size === 0 ? (
            <Card style={{ padding: 32, textAlign: 'center', marginTop: 16 }}>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: 'var(--muted)', margin: 0 }}>Sin productos cargados todavía.</p>
            </Card>
          ) : (
            <>
              {/* Grid de productos con fotos */}
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', marginTop: 16 }}>
                {Array.from(productosGrouped.entries()).flatMap(([, prods]) => prods).map(prod => {
                  const hasDesc = prod.discount_active && (prod.discount_percent || 0) > 0
                  const finalPrice = hasDesc ? Math.round(prod.price_ars * (1 - (prod.discount_percent ?? 0) / 100)) : prod.price_ars
                  return (
                    <div key={prod.id} style={{
                      background: 'var(--paper)', border: hasDesc ? `2px solid ${color}` : '1px solid var(--line)',
                      borderRadius: 14, overflow: 'hidden', position: 'relative',
                    }}>
                      {hasDesc && (
                        <div style={{ position: 'absolute', top: 8, right: 8, background: color, color: '#fff', borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, zIndex: 1 }}>
                          -{prod.discount_percent}%
                        </div>
                      )}
                      <div style={{ width: '100%', aspectRatio: '1', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 28 }}>
                        {prod.photo_url
                          ? <img src={prod.photo_url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : '📦'}
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', margin: 0, lineHeight: 1.3 }}>{prod.name}</p>
                        {prod.description && <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', margin: '3px 0 0', lineHeight: 1.4 }}>{prod.description}</p>}
                        <div style={{ marginTop: 8 }}>
                          {prod.price_ars > 0 ? (
                            <>
                              {hasDesc && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', textDecoration: 'line-through', display: 'block' }}>{formatPriceARS(prod.price_ars)}</span>}
                              <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: hasDesc ? color : 'var(--ink)' }}>{formatPriceARS(finalPrice)}</span>
                            </>
                          ) : <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>Consultar</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
          {ownerPhone && (
            <a href={`https://wa.me/${ownerPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${companyName}! Quiero consultar sobre un producto 🛍️`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16, padding: '16px', borderRadius: 14, textDecoration: 'none', background: '#25d366', color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 700, boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.545 5.875L0 24l6.29-1.518A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.38l-.36-.214-3.733.9.944-3.637-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
              Consultar por WhatsApp
            </a>
          )}
          <SiteFooter />
        </div>
      )}

      {/* ── Turnos: secciones progresivas ── */}
      {activeTab === 'turnos' && (
        <div style={{ maxWidth: 900, margin: '20px auto 0', padding: '0 20px 60px' }}>

          {/* ── Sección 1+2: Servicios + Calendario (two-col) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dp-two-col">

            {/* Columna izquierda: servicios + profesionales */}
            <div>
              <Card style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedServices.length > 0 ? color : 'var(--line)', color: selectedServices.length > 0 ? '#fff' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s' }}>1</div>
                    <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Elegí el servicio</span>
                  </div>
                </div>
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {Array.from(grouped.entries()).map(([cat, services]) => (
                    <div key={cat}>
                      <div style={{ padding: '7px 20px', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)', borderTop: '1px solid var(--line)' }}>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color, margin: 0, fontWeight: 700 }}>{cat}</p>
                      </div>
                      {services.map((service, i) => {
                        const isSel = selectedServices.some(s => s.id === service.id)
                        const depositPct = depositsEnabled ? (service.deposit_percentage ?? 0) : 0
                        const senaAmount = depositPct > 0 && service.price_ars > 0 ? Math.round(service.price_ars * depositPct / 100) : 0
                        return (
                          <button key={service.id} onClick={() => toggleService(service)}
                            className="dp-svc-row"
                            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', border: 'none', borderBottom: i < services.length - 1 ? '1px solid var(--line)' : 'none', background: isSel ? `${color}12` : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: isSel ? 700 : 500, color: 'var(--ink)', margin: 0 }}>{service.name}</p>
                              {senaAmount > 0 && <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>Seña: {formatPriceARS(senaAmount)}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                              <span style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 700, color: isSel ? color : 'var(--ink)' }}>{formatPriceARS(service.price_ars)}</span>
                              {isSel && <div style={{ width: 18, height: 18, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="10" height="10" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </Card>
              {config.professionals && config.professionals.length > 0 && (
                <Card style={{ marginTop: 12, padding: 16 }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>¿Con quién?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {config.professionals.map(prof => {
                      const isSel = typeof selectedProfessional === 'object' && selectedProfessional?.id === prof.id
                      return (
                        <button key={prof.id} onClick={() => selectProfessional(prof)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${isSel ? color : 'var(--line)'}`, background: isSel ? color : 'var(--paper)', color: isSel ? '#fff' : 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                          <span>{prof.emoji || '👤'}</span>{prof.name}
                        </button>
                      )
                    })}
                    {config.professionals.length > 1 && (
                      <button onClick={() => selectProfessional('any')} style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${selectedProfessional === 'any' ? color : 'var(--line)'}`, background: 'var(--paper)', color: 'var(--muted)', fontFamily: 'var(--f-display)', fontSize: 13, cursor: 'pointer' }}>Sin preferencia</button>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Columna derecha: calendario */}
            <div>
              <Card style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedDate ? color : 'var(--line)', color: selectedDate ? '#fff' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s' }}>2</div>
                    <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Elegí la fecha</span>
                  </div>
                </div>
                <MiniCalendar availableDates={availableDates} selectedDate={selectedDate} onSelect={onSelectDate} color={color} viewYear={viewYear} viewMonth={viewMonth} onPrev={prevMonth} onNext={nextMonth} />
              </Card>
            </div>
          </div>

          {/* ── Sección 3: Horarios (full-width, aparece al seleccionar fecha) ── */}
          {selectedDate && (
            <Card style={{ marginTop: 20, overflow: 'hidden', animation: 'dp-slide-in 0.35s ease both' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedTime ? color : 'var(--line)', color: selectedTime ? '#fff' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s' }}>3</div>
                  <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                    Elegí la hora
                    {selectedDate && <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 400, fontSize: 12, color: 'var(--muted)', marginLeft: 8, textTransform: 'capitalize' }}>— {DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]} {formatDateAR(selectedDate)}</span>}
                  </span>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                {selectedServices.length === 0 ? (
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>Primero elegí al menos un servicio</p>
                ) : loadingSlots ? (
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>Cargando horarios...</p>
                ) : slots.length === 0 ? (
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>Sin horarios disponibles este día.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {slots.map((slot, idx) => {
                      const booked = slotCounts[slot] || 0
                      const remaining = slotMaxCapacity > 1 ? slotMaxCapacity - booked : null
                      const isSel = selectedTime === slot
                      return (
                        <button key={slot} onClick={() => setSelectedTime(slot)} className="dp-slot-btn"
                          style={{ padding: '11px 0', borderRadius: 10, border: `1.5px solid ${isSel ? 'transparent' : 'var(--line)'}`, background: isSel ? color : 'var(--paper)', color: isSel ? '#fff' : 'var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: isSel ? 700 : 400, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.15s ease', boxShadow: isSel ? `0 0 16px ${color}55` : 'none', animation: `dp-stagger-in 0.3s ${idx * 0.02}s ease both` }}>
                          <span>{slot}</span>
                          {remaining !== null && <span style={{ fontSize: 9, opacity: 0.65 }}>{remaining} cupo{remaining !== 1 ? 's' : ''}</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ── Sección 4: Formulario + Resumen (aparece al elegir hora) ── */}
          {canContinue && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20, animation: 'dp-slide-in 0.4s ease both' }} className="dp-two-col">

              {/* Izquierda: formulario */}
              <Card style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: form.name.trim() ? color : 'var(--line)', color: form.name.trim() ? '#fff' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s' }}>4</div>
                    <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Tus datos</span>
                  </div>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <style>{`.dp-input:focus{border-color:${color}!important;box-shadow:0 0 0 3px ${color}22}.dp-input::placeholder{color:var(--muted)}`}</style>
                  <div>
                    <label style={labelStyle}>Nombre completo *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="dp-input" style={inputStyle} placeholder="Ej: María González" />
                  </div>
                  <div>
                    <label style={labelStyle}>WhatsApp *</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      onBlur={e => fetchHistory(e.target.value)} className="dp-input" style={inputStyle} placeholder="Ej: 2664 XXX XXX" />
                    {loadingHistory && <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>Buscando visitas anteriores...</p>}
                    {!loadingHistory && history.length > 0 && (
                      <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 12, border: `1px solid ${color}30`, background: `${color}0a` }}>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 8 }}>¡Bienvenida de vuelta!</p>
                        {history.map((h, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.service_name}</span>
                            <span style={{ flexShrink: 0, marginLeft: 12 }}>{formatDateAR(h.appointment_date)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Notas (opcional)</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={3} className="dp-input" style={{ ...inputStyle, resize: 'none' }}
                      placeholder="Piel sensible, alergias, consultas..." />
                  </div>
                  {ownerPhone && (
                    <div style={{ padding: '12px 14px', borderRadius: 12, background: `${color}0a`, border: `1px solid ${color}25` }}>
                      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', margin: 0 }}>
                        <span style={{ marginRight: 6 }}>📱</span>
                        {companyName.split(' ')[0]} te contacta por WhatsApp para confirmar el turno y coordinar el pago de la seña.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Derecha: resumen + botón */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Card style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Resumen de tu turno</p>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                      {selectedServices.map(s => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>
                          <span>{s.name}</span>
                          <span style={{ color, fontWeight: 700 }}>{formatPriceARS(s.price_ars)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📅</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', textTransform: 'capitalize' }}>
                          {DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]} {formatDateAR(selectedDate).replace(/(\d+)\/(\d+)\/(\d+)/, (_, d, m, y) => `${d} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(m)-1]} ${y}`)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>⏰</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)' }}>{selectedTime} hs</span>
                      </div>
                      {selectedProfessional && selectedProfessional !== 'any' && typeof selectedProfessional === 'object' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{selectedProfessional.emoji || '👩‍💼'}</span>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)' }}>{selectedProfessional.name}</span>
                        </div>
                      )}
                      {selectedServices.length > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 800, paddingTop: 8, borderTop: '1px dashed var(--line)' }}>
                          <span style={{ color: 'var(--muted)' }}>Total</span>
                          <span style={{ color }}>{formatPriceARS(totalPrice)}</span>
                        </div>
                      )}
                      {depositAmount > 0 && (
                        <div style={{ background: `${color}0a`, borderRadius: 10, padding: '12px 14px', border: `1px solid ${color}25` }}>
                          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Seña requerida ({maxDepositPct}%)</p>
                          <p style={{ fontFamily: 'var(--f-display)', fontSize: 28, fontWeight: 800, color, margin: 0, letterSpacing: '-0.02em' }}>{formatPriceARS(depositAmount)}</p>
                          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', margin: '4px 0 0' }}>{companyName.split(' ')[0]} te contacta por WhatsApp para coordinar el pago y confirmar el turno.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {error && (
                  <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                  </div>
                )}

                {depositAmount > 0 ? (
                  <>
                    <button onClick={handlePayDeposit} disabled={submitting || !form.name.trim()}
                      style={{ width: '100%', background: color, color: '#fff', border: 'none', borderRadius: 14, padding: '18px 0', fontFamily: 'var(--f-mono)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, opacity: (submitting || !form.name.trim()) ? 0.4 : 1, boxShadow: `0 4px 24px ${color}55`, transition: 'all 0.2s' }}>
                      {submitting ? 'Procesando...' : `✅ Pagar seña ${formatPriceARS(depositAmount)} y confirmar`}
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                      style={{ width: '100%', background: 'transparent', border: `1.5px solid ${color}60`, color: color, borderRadius: 14, padding: '14px 0', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', opacity: (submitting || !form.name.trim()) ? 0.4 : 1 }}>
                      Confirmar sin seña (pendiente de aprobación)
                    </button>
                  </>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                    style={{ width: '100%', background: color, color: '#fff', border: 'none', borderRadius: 14, padding: '18px 0', fontFamily: 'var(--f-mono)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, opacity: (submitting || !form.name.trim()) ? 0.4 : 1, boxShadow: `0 4px 24px ${color}55`, transition: 'all 0.2s' }}>
                    {submitting ? 'Confirmando...' : '✅ Confirmar solicitud'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'turnos' && <SiteFooter />}
    </div>
  )
}
