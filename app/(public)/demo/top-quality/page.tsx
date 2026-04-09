'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronLeft, BarChart2, Calendar, Clock, Bell, X } from 'lucide-react'

const COLOR = '#1d4ed8'
const COLOR_DARK = '#1e3a8a'
const COLOR_ACCENT = '#fbbf24' // amarillo Top Quality
const NEGOCIO = 'Top Quality Piscinas'
const EMOJI = '🏊'
const WHATSAPP = '5492664864731'

const SERVICIOS = [
  { id: '1', cat: 'Limpieza', nombre: 'Limpieza y aspirado completo', desc: 'Fondo, paredes y skimmer', dur: '90 min' },
  { id: '2', cat: 'Limpieza', nombre: 'Desinfección de piscina', desc: 'Tratamiento completo', dur: '60 min' },
  { id: '3', cat: 'Mantenimiento', nombre: 'Mantenimiento mensual', desc: 'Químicos + revisión de equipos. Todo el año.', dur: '2 hs' },
  { id: '4', cat: 'Mantenimiento', nombre: 'Tratamiento de agua verde', desc: 'Choque + algicida + limpieza', dur: '2 hs' },
  { id: '5', cat: 'Equipos', nombre: 'Instalación de bomba', desc: 'Instalación y puesta en marcha', dur: '3 hs' },
  { id: '6', cat: 'Equipos', nombre: 'Cambio de cuarzo filtrante', desc: 'Vaciado + recarga nueva', dur: '2 hs' },
  { id: '7', cat: 'Arreglos', nombre: 'Pintura de piscina', desc: 'Preparación + aplicación', dur: '4 hs' },
  { id: '8', cat: 'Arreglos', nombre: 'Arreglos y reparaciones', desc: 'Pérdidas, grietas y daños', dur: '3 hs' },
  { id: '9', cat: 'Visita', nombre: 'Visita técnica de diagnóstico', desc: 'Evaluación completa del estado', dur: '1 hs' },
  { id: '10', cat: 'Temporada', nombre: 'Apertura de temporada', desc: 'Puesta en marcha para el verano', dur: '4 hs' },
  { id: '11', cat: 'Temporada', nombre: 'Cierre de temporada', desc: 'Preparación para el invierno', dur: '3 hs' },
]

const CATS = ['Limpieza', 'Mantenimiento', 'Equipos', 'Arreglos', 'Visita', 'Temporada']

// Turnos demo para el panel del dueño
const TURNOS_DEMO = [
  { nombre: 'María González', servicio: 'Mantenimiento mensual', hora: '09:00', estado: 'confirmado', telefono: '2664111222' },
  { nombre: 'Carlos Rodríguez', servicio: 'Limpieza y aspirado completo', hora: '10:30', estado: 'confirmado', telefono: '2664333444' },
  { nombre: 'Laura Pérez', servicio: 'Tratamiento de agua verde', hora: '12:00', estado: 'pendiente', telefono: '2664555666' },
  { nombre: 'Roberto Díaz', servicio: 'Visita técnica de diagnóstico', hora: '14:00', estado: 'confirmado', telefono: '2664777888' },
  { nombre: 'Ana Martínez', servicio: 'Cambio de cuarzo filtrante', hora: '15:30', estado: 'pendiente', telefono: '2664999000' },
]

function getAvailableDates() {
  const dates: { dateStr: string; label: string; dia: string }[] = []
  const today = new Date()
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  for (let i = 1; i <= 28; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dow = d.getDay()
    if (dow === 0) continue
    const dateStr = d.toISOString().split('T')[0]
    dates.push({ dateStr, label: `${d.getDate()} ${meses[d.getMonth()]}`, dia: dias[dow] })
  }
  return dates.slice(0, 14)
}

function getSlots(dateStr: string) {
  const dow = new Date(dateStr).getDay()
  const isSab = dow === 6
  const slots = []
  const start = 8 * 60, end = isSab ? 13 * 60 : 18 * 60
  const ocupados = ['09:00', '10:30', '14:00', '16:30']
  for (let m = start; m < end; m += 60) {
    const h = Math.floor(m / 60).toString().padStart(2, '0')
    const t = `${h}:00`
    slots.push({ time: t, ocupado: ocupados.includes(t) })
  }
  return slots
}

// ── Splash ────────────────────────────────────────────────────────────────────
function Splash({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false)

  function close() {
    if (fading) return
    setFading(true)
    setTimeout(onDone, 600)
  }

  useEffect(() => {
    const t = setTimeout(close, 3500)
    return () => clearTimeout(t)
  }, [])

  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    size: 16 + ((i * 37) % 24),
    left: 5 + ((i * 73) % 86),
    delay: (i * 0.4) % 2.5,
    dur: 3.5 + ((i * 19) % 2),
  }))

  return (
    <>
      <style>{`
        @keyframes brise { 0% { transform:translateY(0) scale(1); opacity:0.5; } 100% { transform:translateY(-110vh) scale(0.6); opacity:0; } }
        @keyframes sin { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes fadein { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeout { to { opacity:0; } }
        .splash-out { animation: fadeout 0.6s ease forwards; }
      `}</style>
      <div onClick={close}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none ${fading ? 'splash-out' : ''}`}
        style={{ background: `linear-gradient(160deg, ${COLOR_DARK} 0%, ${COLOR} 60%, #2563eb 100%)` }}>

        {/* Burbujas flotantes */}
        {bubbles.map((b, i) => (
          <div key={i} className="absolute pointer-events-none text-2xl"
            style={{ fontSize: b.size, left: `${b.left}%`, bottom: '-40px',
              animation: `brise ${b.dur}s ${b.delay}s ease-in infinite` }}>
            🏊
          </div>
        ))}

        {/* Logo Top Quality */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-2 shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${COLOR_ACCENT}, #f59e0b)`,
              animation: 'sin 2s ease-in-out infinite' }}>
            🏊
          </div>
        </div>

        <h1 className="text-white font-black text-center text-3xl uppercase tracking-widest px-8 drop-shadow-lg"
          style={{ animation: 'fadein 0.7s 0.3s ease both' }}>
          TOP QUALITY
        </h1>
        <p className="font-black text-center uppercase tracking-widest px-8"
          style={{ color: COLOR_ACCENT, fontSize: '1.1rem', animation: 'fadein 0.7s 0.5s ease both' }}>
          PISCINAS
        </p>
        <p className="text-white/70 text-xs uppercase tracking-widest mt-3"
          style={{ animation: 'fadein 0.7s 0.9s ease both' }}>
          Limpieza · Mantenimiento · Todo el año
        </p>

        <p className="absolute bottom-10 text-white/50 text-xs uppercase tracking-widest"
          style={{ animation: 'sin 2s 1.5s ease-in-out infinite' }}>
          Tocá para continuar
        </p>
      </div>
    </>
  )
}

// ── Panel del dueño ───────────────────────────────────────────────────────────
function Panel({ onClose }: { onClose: () => void }) {
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const confirmados = TURNOS_DEMO.filter(t => t.estado === 'confirmado').length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-800 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${COLOR_DARK}, ${COLOR})` }}>
        <div>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Panel del dueño</p>
          <h1 className="text-xl font-black">Top Quality Piscinas</h1>
          <p className="text-blue-200 text-xs capitalize">{today}</p>
        </div>
        <button onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Métricas del día */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: 'Turnos hoy', value: TURNOS_DEMO.length },
            { icon: Check, label: 'Confirmados', value: confirmados },
            { icon: Clock, label: 'Pendientes', value: TURNOS_DEMO.length - confirmados },
          ].map(m => (
            <div key={m.label} className="bg-gray-900 rounded-2xl p-3 text-center border border-gray-800">
              <m.icon size={16} className="mx-auto mb-1" style={{ color: COLOR_ACCENT }} />
              <p className="text-2xl font-black">{m.value}</p>
              <p className="text-gray-400 text-xs">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Turnos del día */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-sm uppercase tracking-wide text-gray-400">Turnos de hoy</p>
            <span className="text-xs px-2 py-1 rounded-full font-bold"
              style={{ background: COLOR + '25', color: COLOR_ACCENT }}>
              {TURNOS_DEMO.length} turnos
            </span>
          </div>
          <div className="space-y-2">
            {TURNOS_DEMO.map((t, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shrink-0 text-white"
                  style={{ background: `linear-gradient(135deg, ${COLOR_DARK}, ${COLOR})` }}>
                  {t.hora}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{t.nombre}</p>
                  <p className="text-gray-400 text-xs truncate">{t.servicio}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      t.estado === 'confirmado'
                        ? 'bg-green-900/50 text-green-400 border border-green-800'
                        : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                    }`}>
                      {t.estado === 'confirmado' ? '✓ Confirmado' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
                <a href={`https://wa.me/${t.telefono}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                  style={{ background: '#25d36625', color: '#25d366', border: '1px solid #25d36640' }}>
                  💬
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos días */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="font-black text-sm uppercase tracking-wide text-gray-400 mb-3">Esta semana</p>
          {[
            { dia: 'Mañana', cant: 3 },
            { dia: 'Pasado mañana', cant: 4 },
            { dia: 'Miércoles', cant: 2 },
          ].map(d => (
            <div key={d.dia} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <span className="text-gray-300 text-sm">{d.dia}</span>
              <span className="text-sm font-bold px-2 py-0.5 rounded-lg"
                style={{ background: COLOR + '20', color: COLOR_ACCENT }}>
                {d.cant} turnos
              </span>
            </div>
          ))}
        </div>

        {/* Notificaciones */}
        <div className="rounded-2xl p-4 border" style={{ background: '#16a34a15', borderColor: '#16a34a40' }}>
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-green-400" />
            <p className="text-green-400 text-sm font-bold">Notificaciones activas</p>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Cada vez que entra un turno nuevo, te llega un mensaje a tu WhatsApp
            <span className="text-white font-semibold"> (266) 486-4731</span> con los datos del cliente.
          </p>
        </div>

        <button onClick={onClose}
          className="w-full font-bold py-4 rounded-2xl text-white transition-all"
          style={{ background: `linear-gradient(135deg, ${COLOR_DARK}, ${COLOR})` }}>
          ← Ver cómo reservan los clientes
        </button>
      </div>
    </div>
  )
}

// ── App principal ─────────────────────────────────────────────────────────────
export default function DemoTopQuality() {
  const [showSplash, setShowSplash] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [step, setStep] = useState<'servicio' | 'fecha' | 'hora' | 'datos' | 'listo'>('servicio')
  const [servicio, setServicio] = useState<typeof SERVICIOS[0] | null>(null)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')

  const dates = getAvailableDates()
  const slots = fecha ? getSlots(fecha) : []
  const fechaObj = dates.find(d => d.dateStr === fecha)

  const progress = step === 'servicio' ? 25 : step === 'fecha' ? 50 : step === 'hora' ? 75 : step === 'datos' ? 90 : 100

  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />
  if (showPanel) return <Panel onClose={() => setShowPanel(false)} />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white sticky top-0 z-10"
        style={{ background: `linear-gradient(135deg, ${COLOR_DARK}, ${COLOR})` }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
            style={{ background: `linear-gradient(135deg, ${COLOR_ACCENT}, #f59e0b)` }}>
            🏊
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base leading-tight">TOP QUALITY PISCINAS</p>
            <p className="text-blue-200 text-xs">Reservá tu visita online · (266) 486-4731</p>
          </div>
          {/* Botón panel dueño */}
          <button onClick={() => setShowPanel(true)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', color: COLOR_ACCENT }}>
            <BarChart2 size={13} />
            Panel
          </button>
        </div>
        {/* Barra de progreso amarilla */}
        <div className="h-1 bg-white/20">
          <div className="h-1 transition-all duration-500" style={{ width: `${progress}%`, background: COLOR_ACCENT }} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* STEP 1: Elegir servicio */}
        {step === 'servicio' && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paso 1 de 4</p>
            <h2 className="text-xl font-black text-gray-900 mb-6">¿Qué servicio necesitás?</h2>
            {CATS.map(cat => {
              const items = SERVICIOS.filter(s => s.cat === cat)
              return (
                <div key={cat} className="mb-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{cat}</p>
                  <div className="space-y-2">
                    {items.map(s => (
                      <button key={s.id} onClick={() => { setServicio(s); setStep('fecha') }}
                        className="w-full text-left flex items-center justify-between bg-white border-2 rounded-2xl px-4 py-3.5 transition-all hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
                        style={{ borderColor: COLOR + '30' }}>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{s.nombre}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{s.desc}</p>
                        </div>
                        <span className="text-xs font-semibold ml-3 shrink-0 px-2 py-1 rounded-lg"
                          style={{ background: COLOR + '15', color: COLOR }}>
                          {s.dur}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* STEP 2: Elegir fecha */}
        {step === 'fecha' && (
          <div>
            <button onClick={() => setStep('servicio')} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600">
              <ChevronLeft size={16} /> Volver
            </button>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paso 2 de 4</p>
            <h2 className="text-xl font-black text-gray-900 mb-1">¿Qué día te viene bien?</h2>
            <p className="text-sm text-gray-400 mb-6">
              Servicio: <span className="font-semibold text-gray-700">{servicio?.nombre}</span>
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {dates.map(d => (
                <button key={d.dateStr} onClick={() => { setFecha(d.dateStr); setHora('') }}
                  className="flex items-center justify-between bg-white border-2 rounded-2xl px-4 py-3 transition-all hover:scale-[1.02] active:scale-[0.99]"
                  style={{ borderColor: fecha === d.dateStr ? COLOR : '#e5e7eb',
                    background: fecha === d.dateStr ? COLOR + '10' : 'white' }}>
                  <div className="text-left">
                    <p className="font-black text-gray-900 text-sm">{d.dia}</p>
                    <p className="text-gray-500 text-xs">{d.label}</p>
                  </div>
                  {fecha === d.dateStr && <Check size={16} style={{ color: COLOR }} />}
                </button>
              ))}
            </div>
            <button disabled={!fecha} onClick={() => setStep('hora')}
              className="w-full font-black py-4 rounded-2xl text-white transition-all disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${COLOR_DARK}, ${COLOR})` }}>
              Elegir horario →
            </button>
          </div>
        )}

        {/* STEP 3: Elegir horario */}
        {step === 'hora' && (
          <div>
            <button onClick={() => setStep('fecha')} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600">
              <ChevronLeft size={16} /> Volver
            </button>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paso 3 de 4</p>
            <h2 className="text-xl font-black text-gray-900 mb-1">¿A qué hora?</h2>
            <p className="text-sm text-gray-400 mb-6">
              {fechaObj?.dia} {fechaObj?.label} · {servicio?.nombre}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {slots.map(s => (
                <button key={s.time} disabled={s.ocupado} onClick={() => !s.ocupado && setHora(s.time)}
                  className="py-3 rounded-2xl border-2 font-bold text-sm transition-all"
                  style={{
                    borderColor: hora === s.time ? COLOR : s.ocupado ? '#f3f4f6' : '#e5e7eb',
                    background: hora === s.time ? COLOR : s.ocupado ? '#f9fafb' : 'white',
                    color: hora === s.time ? 'white' : s.ocupado ? '#d1d5db' : '#111827',
                  }}>
                  {s.ocupado ? <span className="text-xs text-gray-300">Ocupado</span> : s.time}
                </button>
              ))}
            </div>
            <button disabled={!hora} onClick={() => setStep('datos')}
              className="w-full font-black py-4 rounded-2xl text-white transition-all disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${COLOR_DARK}, ${COLOR})` }}>
              Confirmar horario →
            </button>
          </div>
        )}

        {/* STEP 4: Datos */}
        {step === 'datos' && (
          <div>
            <button onClick={() => setStep('hora')} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600">
              <ChevronLeft size={16} /> Volver
            </button>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paso 4 de 4</p>
            <h2 className="text-xl font-black text-gray-900 mb-6">Tus datos para confirmar</h2>
            <div className="rounded-2xl p-4 mb-6 border" style={{ background: COLOR + '08', borderColor: COLOR + '30' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COLOR }}>Tu reserva</p>
              <div className="space-y-1.5">
                <p className="text-sm text-gray-700"><span className="font-bold">Servicio:</span> {servicio?.nombre}</p>
                <p className="text-sm text-gray-700"><span className="font-bold">Día:</span> {fechaObj?.dia} {fechaObj?.label}</p>
                <p className="text-sm text-gray-700"><span className="font-bold">Hora:</span> {hora}</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Tu nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Pérez"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none text-sm"
                  style={{ outlineColor: COLOR }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Tu WhatsApp</label>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 2664123456"
                  type="tel"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none text-sm" />
              </div>
            </div>
            <button disabled={!nombre || !telefono} onClick={() => setStep('listo')}
              className="w-full font-black py-4 rounded-2xl text-white transition-all disabled:opacity-40 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${COLOR_DARK}, ${COLOR})` }}>
              Confirmar reserva ✓
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Te avisamos por WhatsApp al confirmar</p>
          </div>
        )}

        {/* STEP 5: Listo */}
        {step === 'listo' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ background: COLOR + '15' }}>✅</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">¡Turno confirmado!</h2>
            <p className="text-gray-500 mb-8">Top Quality recibió tu reserva por WhatsApp.</p>
            <div className="rounded-2xl p-5 text-left mb-8 border" style={{ background: COLOR + '08', borderColor: COLOR + '25' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: COLOR }}>Resumen</p>
              <div className="space-y-2">
                {[
                  ['Servicio', servicio?.nombre || ''],
                  ['Día', `${fechaObj?.dia} ${fechaObj?.label}`],
                  ['Hora', hora],
                  ['Nombre', nombre],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-bold text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <a href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20consultar%20mi%20turno`}
              target="_blank" rel="noopener noreferrer"
              className="block font-bold py-4 rounded-2xl text-white mb-3"
              style={{ background: '#25d366' }}>
              💬 Hablar con Top Quality por WhatsApp
            </a>
            <button onClick={() => { setStep('servicio'); setShowSplash(false); setServicio(null); setFecha(''); setHora(''); setNombre(''); setTelefono('') }}
              className="text-sm text-gray-400 hover:text-gray-600">
              Hacer otra reserva
            </button>
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8 text-center">
        <p className="text-xs text-gray-300">Sistema de turnos by <span className="font-semibold">DIVINIA</span></p>
      </div>
    </div>
  )
}
