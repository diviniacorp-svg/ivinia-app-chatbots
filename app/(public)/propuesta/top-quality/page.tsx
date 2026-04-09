import Link from 'next/link'
import { Check, ArrowRight, Clock, Smartphone, Bell, BarChart2 } from 'lucide-react'

export const metadata = {
  title: 'Propuesta para Top Quality Piscinas — Sistema de Turnos Online | DIVINIA',
  description: 'Propuesta personalizada de sistema de reservas online para Top Quality Piscinas, San Luis.',
}

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Reservas 24/7 desde el celular',
    desc: 'Tus clientes piden visita técnica o turno desde el celular a cualquier hora. Vos recibís el aviso por WhatsApp.',
  },
  {
    icon: Bell,
    title: 'Recordatorio automático por WhatsApp',
    desc: 'El sistema avisa al cliente el día anterior. Menos olvidos, más visitas confirmadas.',
  },
  {
    icon: Clock,
    title: 'Tu disponibilidad en tiempo real',
    desc: 'El cliente ve exactamente qué días tenés libres. Sin llamar para preguntar si tenés horario.',
  },
  {
    icon: BarChart2,
    title: 'Panel del técnico — todo organizado',
    desc: 'Ves todos los turnos del día y la semana. Podés reprogramar o cancelar con un click.',
  },
]

const SERVICIOS_REALES = [
  { nombre: 'Limpieza y aspirado completo', detalle: 'Fondo, paredes y skimmer' },
  { nombre: 'Desinfección de piscina', detalle: 'Tratamiento completo' },
  { nombre: 'Mantenimiento mensual', detalle: 'Químicos + revisión de equipos' },
  { nombre: 'Tratamiento de agua verde', detalle: 'Choque + algicida + limpieza' },
  { nombre: 'Instalación de bomba', detalle: 'Instalación y puesta en marcha' },
  { nombre: 'Cambio de cuarzo filtrante', detalle: 'Vaciado + recarga' },
  { nombre: 'Pintura de piscina', detalle: 'Preparación + aplicación' },
  { nombre: 'Arreglos y reparaciones', detalle: 'Pérdidas, grietas y daños' },
  { nombre: 'Visita técnica de diagnóstico', detalle: 'Evaluación completa' },
  { nombre: 'Apertura de temporada', detalle: 'Puesta en marcha para el verano' },
  { nombre: 'Cierre de temporada', detalle: 'Preparación para el invierno' },
]

export default function PropuestaTopQuality() {
  return (
    <main className="min-h-screen bg-white">

      {/* Header — colores marca Top Quality: azul + amarillo */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }} className="text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              {/* Badge estilo logo */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                  🏊
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Propuesta exclusiva · DIVINIA</p>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">Top Quality Piscinas</h1>
                </div>
              </div>
              <p className="text-blue-200 text-base">
                Limpieza y mantenimiento de piscinas · San Luis Capital
              </p>
              <p className="text-blue-300 text-sm mt-1 flex items-center gap-2">
                <span>📱 (266) 486-4731</span>
                <span>·</span>
                <span>📘 /topqualitypiscina</span>
              </p>
            </div>
            <div className="rounded-2xl px-6 py-4 text-center border border-white/20"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wide mb-1">Inversión única</p>
              <p className="text-4xl font-black" style={{ color: '#fbbf24' }}>$150.000</p>
              <p className="text-blue-200 text-sm mt-1">sin mensualidades · para siempre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Problema que resuelve */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">El problema de hoy</h2>
          <p className="text-gray-500 mb-8">Lo que pasa cuando no tenés el sistema.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-gray-900 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Sin el sistema</p>
              <ul className="space-y-3">
                {[
                  'El cliente llama para pedir turno — justo cuando estás en una piscina',
                  'Anotás el turno en papel o en la cabeza y se superponen',
                  'El cliente no sabe qué servicios ofrecés ni cuánto tardan',
                  'Si estás ocupado no podés atender — el cliente llama a otro',
                  'De noche o fin de semana, nadie registra pedidos de visita',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="text-gray-600 font-black mt-0.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-5">Con el sistema Top Quality</p>
              <ul className="space-y-3">
                {[
                  'El cliente reserva la visita técnica solo, desde el celular',
                  'La agenda se organiza sola — sin papeles ni errores',
                  'Ve todos tus servicios con descripción — sabe exactamente qué pedir',
                  'Mientras estás trabajando, el sistema capta el cliente',
                  'Reservas a las 11 de la noche, fines de semana — siempre disponible',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white">
                    <Check size={14} className="text-yellow-300 shrink-0 mt-0.5" />
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
        <p className="text-gray-500 mb-10">Todo configurado a medida de Top Quality. Setup en 24hs.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Servicios reales del local */}
        <div className="rounded-2xl p-6 mb-14 border" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <h3 className="font-black text-gray-900 mb-1">Tus servicios ya están cargados en el demo</h3>
          <p className="text-sm text-gray-500 mb-6">Configurados con los servicios reales de Top Quality Piscinas:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {SERVICIOS_REALES.map(s => (
              <div key={s.nombre} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.nombre}</p>
                  <p className="text-xs text-gray-400">{s.detalle}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            * Los precios se agregan cuando arranquemos. El cliente puede ver los servicios y pedir la visita.
          </p>
        </div>

        {/* Cómo funciona */}
        <h2 className="text-2xl font-black text-gray-900 mb-8">Cómo es el proceso</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { n: '01', title: 'Confirmás y pagás', desc: '$150.000 por MercadoPago. Un solo pago, el sistema es tuyo para siempre.' },
            { n: '02', title: 'Setup en 24hs', desc: 'Cargamos tus servicios, horarios y datos. En un día está listo para funcionar.' },
            { n: '03', title: 'Lo empezás a usar', desc: 'Compartís el link por WhatsApp o en el local. Los turnos entran solos.' },
          ].map(s => (
            <div key={s.n} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-5xl font-black text-gray-100 leading-none mb-4 select-none">{s.n}</p>
              <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Precio y garantía */}
        <div className="grid sm:grid-cols-2 gap-5 mb-14">
          <div className="rounded-3xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
            <p className="text-blue-300 text-sm font-bold uppercase tracking-wide mb-4">Lo que pagás</p>
            <p className="font-black mb-1" style={{ fontSize: '3.5rem', lineHeight: 1, color: '#fbbf24' }}>$150.000</p>
            <p className="text-blue-200 mb-6">pago único · sin mensualidades</p>
            <ul className="space-y-2 text-sm text-blue-100">
              {[
                'Sistema de turnos personalizado Top Quality',
                'Todos tus servicios cargados',
                'Tu horario de atención configurado',
                'Notificaciones a tu WhatsApp (266) 486-4731',
                '6 meses de soporte incluidos',
                'Pagás con MercadoPago',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={13} className="text-yellow-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-black text-gray-900 text-xl mb-3">Sin riesgo.</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Si en 30 días no ves resultados concretos — más clientes organizados,
              menos llamadas — te devolvemos el dinero sin preguntas.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Somos de San Luis, somos vecinos. Esto no es una empresa
              de Buenos Aires — nos conocemos de acá.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">¿Lo probamos juntos ahora?</h2>
          <p className="text-gray-500 mb-8 text-lg max-w-lg mx-auto">
            Tenemos el demo de Top Quality Piscinas listo para que lo veas funcionar
            en tu celular antes de decidir.
          </p>
          <a
            href="https://wa.me/5492665286110?text=Hola%2C%20soy%20de%20Top%20Quality%20Piscinas%2C%20quiero%20el%20sistema%20de%20turnos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', boxShadow: '0 20px 40px rgba(29,78,216,0.3)' }}
          >
            Quiero el sistema <ArrowRight size={22} />
          </a>
          <p className="text-gray-400 text-sm mt-5">
            Joaco · DIVINIA · San Luis, Argentina ·
            <a href="https://wa.me/5492665286110" className="text-blue-600 hover:underline ml-1">
              (266) 528-6110
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Propuesta preparada por DIVINIA para Top Quality Piscinas · San Luis
        <span className="block mt-1">
          <Link href="/" className="text-blue-600 hover:underline">divinia.vercel.app</Link>
        </span>
      </div>
    </main>
  )
}
