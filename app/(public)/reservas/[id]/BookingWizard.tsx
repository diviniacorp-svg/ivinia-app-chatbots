'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfig, Service, Professional, formatDateAR, formatPriceARS, getNextAvailableDates, getFirstAvailableMonth } from '@/lib/bookings'
import SplashIntro from './SplashIntro'
import { getThemeForRubro } from '@/lib/turnero-themes'

type Step = 'select' | 'form' | 'done'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

type PastAppt = { service_name: string; appointment_date: string; appointment_time: string; status: string }

// ── Background animado por rubro ─────────────────────────────────
function RubroBackground({ accentRgb }: { accentRgb: string }) {
  return (
    <>
      <style>{`
        @keyframes orb1 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(80px,-60px) scale(1.15); } 66% { transform:translate(-40px,70px) scale(0.9); } }
        @keyframes orb2 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(-90px,50px) scale(1.1); } 66% { transform:translate(60px,-80px) scale(1.05); } }
        @keyframes orb3 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(40px,55px) scale(0.85); } }
      `}</style>
      <div style={{ position:'fixed', inset:0, background:'#060609', zIndex:0 }} />
      <div style={{ position:'fixed', top:'-25vh', left:'-15vw', width:'75vw', height:'75vw', borderRadius:'50%', background:`radial-gradient(circle, rgba(${accentRgb},0.38) 0%, transparent 68%)`, filter:'blur(72px)', animation:'orb1 28s ease-in-out infinite', zIndex:0, pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-25vh', right:'-15vw', width:'80vw', height:'80vw', borderRadius:'50%', background:`radial-gradient(circle, rgba(${accentRgb},0.22) 0%, transparent 68%)`, filter:'blur(96px)', animation:'orb2 36s ease-in-out infinite', zIndex:0, pointerEvents:'none' }} />
      <div style={{ position:'fixed', top:'35vh', right:'5vw', width:'45vw', height:'45vw', borderRadius:'50%', background:`radial-gradient(circle, rgba(${accentRgb},0.1) 0%, transparent 68%)`, filter:'blur(40px)', animation:'orb3 22s ease-in-out infinite reverse', zIndex:0, pointerEvents:'none' }} />
    </>
  )
}

// ── Partículas flotantes ──────────────────────────────────────────
const PARTICLE_DATA = Array.from({ length: 14 }, (_, i) => ({
  left: 3 + ((i * 73) % 90),
  top: 5 + ((i * 53) % 85),
  size: 12 + ((i * 31) % 20),
  delay: (i * 0.55) % 5,
  duration: 5 + ((i * 19) % 5),
  blur: i % 3 === 0 ? 2 : 0,
}))

function FloatingParticles({ emojis }: { emojis: string[] }) {
  return (
    <>
      {PARTICLE_DATA.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: p.size,
            pointerEvents: 'none',
            zIndex: 0,
            animation: `dp-float ${p.duration}s ${p.delay}s ease-in-out infinite`,
            opacity: p.blur ? 0.15 : 0.28,
            userSelect: 'none',
            filter: p.blur ? `blur(${p.blur}px)` : undefined,
          }}
        >
          {emojis[i % emojis.length]}
        </div>
      ))}
    </>
  )
}

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
                background: isDone ? color : isActive ? color : 'rgba(255,255,255,0.1)',
                border: `2px solid ${isDone || isActive ? color : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700,
                color: isDone || isActive ? '#000' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 16px ${color}66` : 'none',
              }}>
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em',
                textTransform: 'uppercase', marginTop: 5,
                color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                whiteSpace: 'nowrap',
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 1, flex: 1, marginBottom: 18,
                background: i < currentIdx
                  ? `linear-gradient(to right, ${color}, ${color})`
                  : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Mini Calendar (dark premium) ─────────────────────────────────
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
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 20,
      border: `1px solid rgba(255,255,255,0.1)`,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button onClick={onPrev} style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.7)', fontSize: 18, transition: 'all 0.15s',
        }}>‹</button>
        <span style={{
          fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14,
          color: '#fff', letterSpacing: '-0.01em',
        }}>{MESES[viewMonth]} {viewYear}</span>
        <button onClick={onNext} style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.7)', fontSize: 18, transition: 'all 0.15s',
        }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px 10px 4px' }}>
        {DIAS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 9,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', paddingBottom: 6,
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
                background: isSel ? color : isAvail && !isPast ? `${color}22` : 'transparent',
                color: isSel ? '#000' : isAvail && !isPast ? '#fff' : 'rgba(255,255,255,0.2)',
                boxShadow: isSel ? `0 0 16px ${color}66` : 'none',
                transform: isSel ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div style={{
        display: 'flex', gap: 16, padding: '10px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, display: 'inline-block', background: `${color}44` }} />Disponible
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, display: 'inline-block', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />Sin turnos
        </span>
      </div>
    </div>
  )
}

// ── Glass Card ────────────────────────────────────────────────────
function GlassCard({ children, color, style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 20,
      border: color ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.1)',
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
  tipoNegocio,
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
}) {
  const searchParams = useSearchParams()
  const [splashDone, setSplashDone] = useState(false)
  const [step, setStep] = useState<Step>('select')

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

  const darkInputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '14px 16px',
    fontFamily: 'var(--f-display)',
    fontSize: 16,
    outline: 'none',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const darkLabelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--f-mono)',
    fontSize: 9,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 7,
  }

  // ── Shared layout wrapper ──
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'transparent',
    position: 'relative',
    overflowX: 'hidden',
  }

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
        <RubroBackground accentRgb={theme.accentGlow} />
        <FloatingParticles emojis={theme.particleEmojis} />
        <style>{`
          @keyframes dp-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-22px) rotate(-8deg); }
            66% { transform: translateY(-10px) rotate(12deg); }
          }
          @keyframes dp-circle-draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes dp-check-draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes dp-success-in {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        <div style={{
          maxWidth: 480, margin: '0 auto', padding: '80px 24px 100px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', position: 'relative', zIndex: 1,
          animation: 'dp-success-in 0.6s ease both',
        }}>
          <div style={{ marginBottom: 28 }}>
            <AnimatedCheck color={color} />
          </div>

          <h2 style={{
            fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 28,
            color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em',
          }}>
            {paidSuccess ? '¡Seña confirmada!' : '¡Turno solicitado!'}
          </h2>

          <GlassCard color={color} style={{ width: '100%', padding: 24, marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Resumen de tu turno</p>
            {selectedServices.length > 0 && (
              <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, color: '#fff', margin: '0 0 12px' }}>
                {selectedServices.map(s => s.name).join(' + ')}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    <span style={{ textTransform: 'capitalize' }}>{DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]}</span> {formatDateAR(selectedDate)} · {selectedTime}hs
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{form.name || 'Tu turno'}</span>
              </div>
              {typeof selectedProfessional === 'object' && selectedProfessional && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{selectedProfessional.emoji || '👩‍💼'}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{selectedProfessional.name}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Te esperamos en {companyName}</span>
              </div>
            </div>
          </GlassCard>

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
            color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none',
            cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Hacer otra reserva
          </button>
        </div>
      </div>
    )
  }

  // ── PASO FORM ──────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div style={pageStyle}>
        <RubroBackground accentRgb={theme.accentGlow} />
        <FloatingParticles emojis={theme.particleEmojis} />
        <style>{`
          @keyframes dp-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-22px) rotate(-8deg); }
            66% { transform: translateY(-10px) rotate(12deg); }
          }
          @keyframes dp-slide-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .dp-dark-input:focus {
            border-color: ${color} !important;
            box-shadow: 0 0 0 3px ${color}22;
          }
          .dp-dark-input::placeholder { color: rgba(255,255,255,0.25); }
        `}</style>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 100px', position: 'relative', zIndex: 1, animation: 'dp-slide-in 0.4s ease both' }}>
          <button onClick={() => setStep('select')} style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
            color: color, background: 'none', border: 'none', cursor: 'pointer',
            marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6,
            textTransform: 'uppercase',
          }}>← Volver</button>

          <ProgressBar step="form" color={color} />

          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 22, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Tus datos
          </h2>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', marginBottom: 28 }}>
            {selectedServices.map(s => s.name).join(' + ')} · {formatDateAR(selectedDate)} {selectedTime}hs
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={darkLabelStyle}>Nombre completo *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="dp-dark-input" style={darkInputStyle} placeholder="Ej: María González" />
            </div>
            <div>
              <label style={darkLabelStyle}>WhatsApp *</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                onBlur={e => fetchHistory(e.target.value)}
                className="dp-dark-input" style={darkInputStyle} placeholder="Ej: 2664 XXX XXX" />
              {loadingHistory && (
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Buscando visitas anteriores...</p>
              )}
              {!loadingHistory && history.length > 0 && (
                <div style={{ marginTop: 10, padding: '14px 16px', borderRadius: 14, border: `1px solid ${color}30`, background: `${color}0a` }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 10 }}>¡Bienvenida de vuelta!</p>
                  {history.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.service_name}</span>
                      <span style={{ flexShrink: 0, marginLeft: 12 }}>{formatDateAR(h.appointment_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={darkLabelStyle}>Email (opcional)</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="dp-dark-input" style={darkInputStyle} placeholder="tu@email.com" />
            </div>
            <div>
              <label style={darkLabelStyle}>Notas (opcional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3} className="dp-dark-input" style={{ ...darkInputStyle, resize: 'none' }}
                placeholder="Diseño deseado, alergias, consultas..." />
            </div>

            {/* Resumen */}
            <GlassCard color={color} style={{ padding: 20 }}>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 14px' }}>Resumen</p>
              {selectedServices.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
                  <span>{s.name}</span>
                  <span style={{ color, fontWeight: 700 }}>{formatPriceARS(s.price_ars)}</span>
                </div>
              ))}
              {selectedServices.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 6 }}>
                  <span style={{ color: '#fff' }}>Total</span>
                  <span style={{ color }}>{formatPriceARS(totalPrice)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  📅 <span style={{ textTransform: 'capitalize' }}>{selectedDate ? `${DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]} ${formatDateAR(selectedDate)}` : '—'}</span>
                </p>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>⏰ {selectedTime ? `${selectedTime}hs` : '—'}</p>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>⏱ {totalDuration} min en total</p>
                {selectedProfessional && selectedProfessional !== 'any' && typeof selectedProfessional === 'object' && (
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    {selectedProfessional.emoji || '👩‍💼'} {selectedProfessional.name}
                  </p>
                )}
              </div>
              {depositAmount > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14, marginTop: 10 }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Seña requerida ({maxDepositPct}%)</p>
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 32, fontWeight: 800, color, margin: 0, letterSpacing: '-0.02em', textShadow: `0 0 20px ${color}66` }}>{formatPriceARS(depositAmount)}</p>
                </div>
              )}
            </GlassCard>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {depositAmount > 0 ? (
                <>
                  <button onClick={handlePayDeposit} disabled={submitting || !form.name.trim()}
                    style={{
                      width: '100%', background: color, color: '#000', border: 'none',
                      borderRadius: 14, padding: '18px 0', fontFamily: 'var(--f-mono)',
                      fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: 'pointer', fontWeight: 700,
                      opacity: (submitting || !form.name.trim()) ? 0.4 : 1,
                      boxShadow: `0 4px 24px ${color}55`,
                      transition: 'all 0.2s',
                    }}>
                    {submitting ? 'Procesando...' : `Pagar seña ${formatPriceARS(depositAmount)} y confirmar`}
                  </button>
                  <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                    style={{
                      width: '100%', background: 'transparent', border: `1.5px solid ${color}60`,
                      color: color, borderRadius: 14, padding: '16px 0',
                      fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em',
                      cursor: 'pointer', opacity: (submitting || !form.name.trim()) ? 0.4 : 1,
                    }}>
                    Confirmar sin seña (pendiente de aprobación)
                  </button>
                </>
              ) : (
                <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                  style={{
                    width: '100%', background: color, color: '#000', border: 'none',
                    borderRadius: 14, padding: '18px 0', fontFamily: 'var(--f-mono)',
                    fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'pointer', fontWeight: 700,
                    opacity: (submitting || !form.name.trim()) ? 0.4 : 1,
                    boxShadow: `0 4px 24px ${color}55`,
                    transition: 'all 0.2s',
                  }}>
                  {submitting ? 'Confirmando...' : 'Confirmar turno →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PASO SELECT ─────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <RubroBackground accentRgb={theme.accentGlow} />
      <FloatingParticles emojis={theme.particleEmojis} />
      <style>{`
        @keyframes dp-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-22px) rotate(-8deg); }
          66% { transform: translateY(-10px) rotate(12deg); }
        }
        @keyframes dp-slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dp-stagger-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dp-slot-btn:hover {
          transform: scale(1.04);
        }
        .dp-service-row:hover {
          background: rgba(255,255,255,0.07) !important;
        }
      `}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 100px', position: 'relative', zIndex: 1 }}>

        <ProgressBar step="select" color={color} />

        {/* ── Servicios ── */}
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
          1 — Elegí el servicio
        </p>

        <GlassCard style={{ overflow: 'hidden', marginBottom: 20 }}>
          {Array.from(grouped.entries()).map(([cat, services]) => (
            <div key={cat}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color, margin: 0, fontWeight: 700 }}>{cat}</p>
              </div>
              {services.map((service, i) => {
                const isSel = selectedServices.some(s => s.id === service.id)
                return (
                  <button key={service.id} onClick={() => toggleService(service)}
                    className="dp-service-row"
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '15px 16px',
                      border: 'none',
                      borderBottom: i < services.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      background: isSel ? `${color}14` : 'transparent',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      border: `2px solid ${isSel ? color : 'rgba(255,255,255,0.2)'}`,
                      background: isSel ? color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      boxShadow: isSel ? `0 0 12px ${color}55` : 'none',
                    }}>
                      {isSel && (
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{service.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{service.duration_minutes} min</span>
                        {depositsEnabled && (service.deposit_percentage ?? 0) > 0 && (
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', borderRadius: 100, padding: '2px 8px' }}>Seña {service.deposit_percentage}%</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{formatPriceARS(service.price_ars)}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </GlassCard>

        {selectedServices.length > 0 && (
          <div style={{
            marginBottom: 24, padding: '12px 16px', borderRadius: 12,
            background: `${color}18`, border: `1px solid ${color}30`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            animation: 'dp-slide-in 0.3s ease both',
          }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''} · {totalDuration} min
            </span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 800, color }}>{formatPriceARS(totalPrice)}</span>
          </div>
        )}

        {/* ── Profesionales ── */}
        {config.professionals && config.professionals.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              {config.professionals.length === 1 ? 'Profesional' : '¿Con quién?'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {config.professionals.map(prof => {
                const isSel = typeof selectedProfessional === 'object' && selectedProfessional?.id === prof.id
                return (
                  <button key={prof.id} onClick={() => selectProfessional(prof)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 12,
                      border: `1.5px solid ${isSel ? color : 'rgba(255,255,255,0.15)'}`,
                      background: isSel ? color : 'rgba(255,255,255,0.06)',
                      color: isSel ? '#000' : '#fff',
                      fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: isSel ? `0 0 16px ${color}55` : 'none',
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
                    padding: '10px 18px', borderRadius: 12,
                    border: `1.5px solid ${selectedProfessional === 'any' ? color : 'rgba(255,255,255,0.15)'}`,
                    background: selectedProfessional === 'any' ? `${color}22` : 'rgba(255,255,255,0.06)',
                    color: selectedProfessional === 'any' ? color : 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--f-display)', fontSize: 13,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  Sin preferencia
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Fecha ── */}
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
          2 — Elegí la fecha
        </p>
        <div style={{ marginBottom: 24 }}>
          <MiniCalendar
            availableDates={availableDates} selectedDate={selectedDate}
            onSelect={onSelectDate} color={color}
            viewYear={viewYear} viewMonth={viewMonth}
            onPrev={prevMonth} onNext={nextMonth}
          />
        </div>

        {/* ── Horarios ── */}
        {selectedDate && (
          <div style={{ marginBottom: 24, animation: 'dp-slide-in 0.35s ease both' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              3 — Elegí la hora · <span style={{ textTransform: 'capitalize' }}>{DIAS_FULL[new Date(selectedDate + 'T12:00:00').getDay()]}</span> {formatDateAR(selectedDate)}
            </p>

            {selectedServices.length === 0 ? (
              <GlassCard style={{ padding: '20px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Primero elegí al menos un servicio</p>
              </GlassCard>
            ) : loadingSlots ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Cargando horarios...</p>
              </div>
            ) : slots.length === 0 ? (
              <GlassCard style={{ padding: '20px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>No hay horarios disponibles para {totalDuration} min este día.</p>
              </GlassCard>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {slots.map((slot, idx) => {
                  const booked = slotCounts[slot] || 0
                  const remaining = slotMaxCapacity > 1 ? slotMaxCapacity - booked : null
                  const isSel = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className="dp-slot-btn"
                      style={{
                        padding: '12px 0', borderRadius: 12,
                        border: `1.5px solid ${isSel ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                        background: isSel ? color : 'rgba(255,255,255,0.06)',
                        color: isSel ? '#000' : '#fff',
                        fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: isSel ? 700 : 400,
                        textAlign: 'center', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        transition: 'all 0.15s ease',
                        boxShadow: isSel ? `0 0 20px ${color}66` : 'none',
                        animation: `dp-stagger-in 0.3s ${idx * 0.03}s ease both`,
                      }}
                    >
                      <span>{slot}</span>
                      {remaining !== null && (
                        <span style={{ fontSize: 9, opacity: 0.65 }}>{remaining} cupo{remaining !== 1 ? 's' : ''}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Botón continuar ── */}
        {canContinue && (
          <button onClick={() => setStep('form')}
            style={{
              width: '100%', background: color, color: '#000', border: 'none',
              borderRadius: 14, padding: '18px 0', fontFamily: 'var(--f-mono)',
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', fontWeight: 700,
              boxShadow: `0 4px 24px ${color}55`,
              transition: 'all 0.2s',
              animation: 'dp-slide-in 0.3s ease both',
            }}>
            Continuar con mis datos →
          </button>
        )}
      </div>
    </div>
  )
}
