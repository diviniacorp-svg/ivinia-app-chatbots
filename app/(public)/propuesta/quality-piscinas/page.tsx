import Link from 'next/link'
import { Check, ArrowRight, Clock, Smartphone, Bell, BarChart2, Users } from 'lucide-react'

export const metadata = {
  title: 'Propuesta para Quality Piscinas — Turnero IA | DIVINIA',
  description: 'Propuesta personalizada de sistema de reservas online para Quality Piscinas, San Luis.',
}

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Reservas 24/7 desde el celular',
    desc: 'Tus clientes piden visita técnica desde el celu a cualquier hora. Vos recibís el aviso por WhatsApp.',
  },
  {
    icon: Bell,
    title: 'Recordatorio automático',
    desc: 'El sistema avisa al cliente el día anterior. Menos ausencias, más visitas confirmadas.',
  },
  {
    icon: Clock,
    title: 'Tu disponibilidad en tiempo real',
    desc: 'El cliente ve exactamente qué días tenés libres. Sin llamadas para preguntar si hay horario.',
  },
  {
    icon: Users,
    title: 'Multi-técnico',
    desc: 'Asignás cada reserva al técnico disponible. Cada uno ve su agenda sin cruzarse.',
  },
  {
    icon: BarChart2,
    title: 'Panel completo',
    desc: 'Todos los turnos del día y la semana. Reprogramar o cancelar con un click.',
  },
]

const SERVICIOS = [
  { nombre: 'Limpieza y aspirado completo', detalle: 'Fondo, paredes y skimmer' },
  { nombre: 'Desinfección de piscina', detalle: 'Tratamiento completo' },
  { nombre: 'Mantenimiento mensual', detalle: 'Químicos + revisión de equipos' },
  { nombre: 'Tratamiento de agua verde', detalle: 'Choque + algicida + limpieza' },
  { nombre: 'Instalación de bomba', detalle: 'Instalación y puesta en marcha' },
  { nombre: 'Cambio de cuarzo filtrante', detalle: 'Vaciado + recarga' },
  { nombre: 'Apertura de temporada', detalle: 'Puesta en marcha para el verano' },
  { nombre: 'Cierre de temporada', detalle: 'Preparación para el invierno' },
  { nombre: 'Visita técnica de diagnóstico', detalle: 'Evaluación completa' },
  { nombre: 'Arreglos y reparaciones', detalle: 'Pérdidas, grietas y daños' },
]

export default function PropuestaQualityPiscinas() {
  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)' }} className="text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
                  style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>
                  🏊
                </div>
                <div>
                  <p className="text-sky-200 text-xs font-bold uppercase tracking-widest">Propuesta exclusiva · DIVINIA</p>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">Quality Piscinas</h1>
                </div>
              </div>
              <p className="text-sky-200 text-base">Limpieza y mantenimiento de piscinas · San Luis Capital</p>
            </div>
            <div className="rounded-2xl px-6 py-4 text-center border border-white/20"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <p className="text-sky-200 text-xs font-bold uppercase tracking-wide mb-1">Implementación</p>
              <p className="text-4xl font-black text-white">$65.000</p>
              <p className="text-sky-200 text-sm mt-1">pago único · tuyo para siempre</p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-sky-300 text-xs font-bold uppercase tracking-wide mb-0.5">Soporte mensual</p>
                <p className="text-2xl font-black text-white">$30.000<span className="text-sm font-normal text-sky-200">/mes</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo en vivo */}
      <div className="bg-sky-50 border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-black text-gray-900 text-lg">Mirá el demo en vivo ahora</p>
            <p className="text-gray-500 text-sm">Así lo ven tus clientes desde el celular — abre desde cualquier dispositivo</p>
          </div>
          <a
            href="https://divinia.vercel.app/demo/top-quality"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-white shrink-0 transition-all"
            style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}
          >
            Ver demo Quality Piscinas <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* El problema */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">El problema de hoy</h2>
          <p className="text-gray-500 mb-8">Lo que pasa cuando no tenés el sistema.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-gray-900 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Sin Turnero</p>
              <ul className="space-y-3">
                {[
                  'El cliente llama para pedir turno — justo cuando estás en una piscina',
                  'Turnos anotados en papel o de cabeza — se superponen, se olvidan',
                  'Si no atendés el teléfono, el cliente llama a la competencia',
                  'De noche o finde, no hay nadie para tomar pedidos',
                  'No sabés cuántas visitas perdiste esta semana',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="text-gray-600 font-black mt-0.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}>
              <p className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-5">Con Turnero Quality</p>
              <ul className="space-y-3">
                {[
                  'El cliente reserva la visita técnica solo, sin llamar',
                  'La agenda se organiza sola — sin papeles ni errores',
                  'Mientras trabajás, el sistema capta nuevos clientes',
                  'Reservas a las 11 de la noche — siempre disponible',
                  'Panel con todos los turnos del día antes de salir',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white">
                    <Check size={14} className="text-sky-300 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Qué incluye */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Qué incluye</h2>
        <p className="text-gray-500 mb-10">Todo configurado a medida de Quality Piscinas. Setup en 48hs.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-sky-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Servicios */}
        <div className="rounded-2xl p-6 mb-14 border" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
          <h3 className="font-black text-gray-900 mb-1">Tus servicios ya listos en el sistema</h3>
          <p className="text-sm text-gray-500 mb-6">Los configuramos exactamente con los servicios de Quality Piscinas:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {SERVICIOS.map(s => (
              <div key={s.nombre} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-sky-100">
                <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.nombre}</p>
                  <p className="text-xs text-gray-400">{s.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proceso */}
        <h2 className="text-2xl font-black text-gray-900 mb-8">Cómo arrancamos</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { n: '01', title: 'Confirmás hoy', desc: 'Pago único de $65.000 por MercadoPago o transferencia. El sistema es tuyo para siempre.' },
            { n: '02', title: 'Setup en 48hs', desc: 'Cargamos tus servicios, horarios y técnicos disponibles. En dos días está funcionando.' },
            { n: '03', title: 'Empezás a usar', desc: 'Compartís el link con tus clientes. Los turnos entran solos mientras trabajás.' },
          ].map(s => (
            <div key={s.n} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-5xl font-black text-gray-100 leading-none mb-4 select-none">{s.n}</p>
              <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Precio detallado */}
        <div className="grid sm:grid-cols-2 gap-5 mb-14">
          <div className="rounded-3xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}>
            <p className="text-sky-300 text-sm font-bold uppercase tracking-wide mb-4">Implementación</p>
            <p className="font-black mb-1 text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>$65.000</p>
            <p className="text-sky-200 mb-2">pago único · el sistema es tuyo</p>
            <ul className="space-y-2 text-sm text-sky-100 mt-4">
              {[
                'Sistema personalizado Quality Piscinas',
                'Todos tus servicios cargados',
                'Horarios y técnicos configurados',
                'Notificaciones a tu WhatsApp',
                'Capacitación del equipo incluida',
                '30 días de soporte incluidos',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={13} className="text-sky-300 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-sky-700">
              <p className="text-sky-300 text-sm font-bold uppercase tracking-wide mb-2">Soporte mensual</p>
              <p className="font-black text-white" style={{ fontSize: '2.5rem', lineHeight: 1 }}>$30.000<span className="text-sm font-normal text-sky-200">/mes</span></p>
              <p className="text-sky-200 text-xs mt-1">Sin contrato · cancelás cuando querés</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-black text-gray-900 text-xl mb-3">Sin riesgo.</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Si en 30 días no ves resultados concretos — más clientes organizados,
              menos llamadas — te devolvemos el dinero sin preguntas.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Somos de San Luis. Nos conocemos de acá. No es una empresa
              de Buenos Aires que desaparece — estamos disponibles.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">¿Lo probamos ahora?</h2>
          <p className="text-gray-500 mb-8 text-lg max-w-lg mx-auto">
            El demo de Quality Piscinas ya está listo. Abrilo desde el celular antes de decidir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20soy%20de%20Quality%20Piscinas%2C%20quiero%20activar%20Turnero"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)', boxShadow: '0 20px 40px rgba(3,105,161,0.3)' }}
            >
              Confirmar por WhatsApp <ArrowRight size={22} />
            </a>
            <a
              href="https://divinia.vercel.app/demo/top-quality"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-5 rounded-2xl text-sky-700 bg-sky-50 border border-sky-200 text-lg"
            >
              Ver demo primero →
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-5">
            Joaco · DIVINIA · San Luis ·{' '}
            <a href="https://wa.me/5492665286110" className="text-sky-600 hover:underline">(266) 528-6110</a>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Propuesta preparada por DIVINIA para Quality Piscinas · San Luis ·{' '}
        <Link href="/" className="text-sky-600 hover:underline">divinia.vercel.app</Link>
      </div>
    </main>
  )
}
