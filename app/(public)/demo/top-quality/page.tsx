'use client'

import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'

const COLOR = '#1d4ed8'
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

// Genera fechas disponibles: lun-vie de las próximas 4 semanas, sáb solo mañana
function getAvailableDates() {
  const dates: { dateStr: string; label: string; dia: string }[] = []
  const today = new Date()
  for (let i = 1; i <= 28; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dow = d.getDay() // 0=dom
    if (dow === 0) continue // sin domingos
    if (dow === 6) {
      // sábado: solo si el slot es antes de las 13
    }
    const dateStr = d.toISOString().split('T')[0]
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    dates.push({
      dateStr,
      label: `${d.getDate()} ${meses[d.getMonth()]}`,
      dia: dias[dow],
    })
  }
  return dates.slice(0, 14)
}

function getSlots(dateStr: string) {
  const dow = new Date(dateStr).getDay()
  const isSab = dow === 6
  const slots = []
  const start = 8 * 60
  const end = isSab ? 13 * 60 : 18 * 60
  // Simular algunos ocupados
  const ocupados = ['09:00', '10:30', '14:00', '16:30']
  for (let m = start; m < end; m += 60) {
    const h = Math.floor(m / 60).toString().padStart(2, '0')
    const min = (m % 60).toString().padStart(2, '0')
    const t = `${h}:${min}`
    slots.push({ time: t, ocupado: ocupados.includes(t) })
  }
  return slots
}

export default function DemoTopQuality() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white sticky top-0 z-10" style={{ background: `linear-gradient(135deg, #1e3a8a, ${COLOR})` }}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            {EMOJI}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base leading-tight">{NEGOCIO}</p>
            <p className="text-blue-200 text-xs">Reservá tu visita online</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-blue-200 text-xs">En línea</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div className="h-1 bg-yellow-400 transition-all duration-500" style={{ width: `${progress}%` }} />
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
                        className="w-full text-left flex items-center justify-between bg-white border-2 rounded-2xl px-4 py-3.5 transition-all hover:scale-[1.01] hover:shadow-md"
                        style={{ borderColor: servicio?.id === s.id ? COLOR : '#e5e7eb' }}>
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
                <button key={d.dateStr}
                  onClick={() => { setFecha(d.dateStr); setHora('') }}
                  className="flex items-center justify-between bg-white border-2 rounded-2xl px-4 py-3 transition-all hover:scale-[1.02]"
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
              style={{ background: `linear-gradient(135deg, #1e3a8a, ${COLOR})` }}>
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
                <button key={s.time} disabled={s.ocupado}
                  onClick={() => !s.ocupado && setHora(s.time)}
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
              style={{ background: `linear-gradient(135deg, #1e3a8a, ${COLOR})` }}>
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

            {/* Resumen */}
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
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Tu WhatsApp</label>
                <input value={telefono} onChange={e => setTelefono(e.target.value)}
                  placeholder="Ej: 2664123456"
                  type="tel"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>

            <button
              disabled={!nombre || !telefono}
              onClick={() => setStep('listo')}
              className="w-full font-black py-4 rounded-2xl text-white transition-all disabled:opacity-40 shadow-xl"
              style={{ background: `linear-gradient(135deg, #1e3a8a, ${COLOR})`, boxShadow: `0 10px 30px ${COLOR}40` }}>
              Confirmar reserva ✓
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Te avisamos por WhatsApp al confirmar</p>
          </div>
        )}

        {/* STEP 5: Listo */}
        {step === 'listo' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ background: COLOR + '15' }}>
              ✅
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">¡Turno confirmado!</h2>
            <p className="text-gray-500 mb-8">Te mandamos la confirmación por WhatsApp.</p>

            <div className="rounded-2xl p-5 text-left mb-8 border" style={{ background: COLOR + '08', borderColor: COLOR + '25' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: COLOR }}>Resumen de tu turno</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Servicio</span>
                  <span className="font-bold text-gray-900">{servicio?.nombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Día</span>
                  <span className="font-bold text-gray-900">{fechaObj?.dia} {fechaObj?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hora</span>
                  <span className="font-bold text-gray-900">{hora}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nombre</span>
                  <span className="font-bold text-gray-900">{nombre}</span>
                </div>
              </div>
            </div>

            <a href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20consultar%20mi%20turno%20en%20Top%20Quality%20Piscinas`}
              target="_blank" rel="noopener noreferrer"
              className="block font-bold py-4 rounded-2xl text-white mb-3"
              style={{ background: '#25d366' }}>
              💬 Hablar con Top Quality por WhatsApp
            </a>
            <button onClick={() => { setStep('servicio'); setServicio(null); setFecha(''); setHora(''); setNombre(''); setTelefono('') }}
              className="text-sm text-gray-400 hover:text-gray-600">
              Hacer otra reserva
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="max-w-lg mx-auto px-4 pb-8 text-center">
        <p className="text-xs text-gray-300">Sistema de turnos by DIVINIA · divinia.vercel.app</p>
      </div>
    </div>
  )
}
