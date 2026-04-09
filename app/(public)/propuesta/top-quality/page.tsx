import Link from 'next/link'
import { Check, ArrowRight, Clock, Smartphone, Bell, BarChart2 } from 'lucide-react'

export const metadata = {
  title: 'Propuesta para Top Quality — Sistema de Turnos Online | DIVINIA',
  description: 'Propuesta personalizada de sistema de reservas online para Top Quality, local de mantenimiento y productos para piscinas.',
}

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Reservas 24/7 sin teléfono',
    desc: 'Tus clientes sacan turno desde el celular cuando quieran. Vos no necesitás atender llamadas.',
  },
  {
    icon: Bell,
    title: 'Recordatorio automático por WhatsApp',
    desc: 'El sistema avisa al cliente 24hs antes de su turno. Menos ausencias, más trabajo confirmado.',
  },
  {
    icon: Clock,
    title: 'Disponibilidad en tiempo real',
    desc: 'Los clientes ven exactamente qué días y horarios tenés libres. Sin llamadas para preguntar.',
  },
  {
    icon: BarChart2,
    title: 'Panel de gestión simple',
    desc: 'Ves todos tus turnos del día, semana y mes. Podés confirmar, cancelar o reprogramar.',
  },
]

const SERVICIOS_EJEMPLO = [
  { nombre: 'Mantenimiento mensual de pileta', precio: 'Consultar', duracion: '2 hs' },
  { nombre: 'Análisis de agua + tratamiento', precio: 'Consultar', duracion: '1 hs' },
  { nombre: 'Limpieza y aspirado', precio: 'Consultar', duracion: '1.5 hs' },
  { nombre: 'Instalación de equipo', precio: 'Consultar', duracion: '3 hs' },
  { nombre: 'Visita técnica diagnóstico', precio: 'Consultar', duracion: '1 hs' },
]

export default function PropuestaTopQuality() {
  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <div className="bg-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-cyan-200 text-sm font-semibold mb-1">Propuesta exclusiva · DIVINIA</p>
              <h1 className="text-3xl sm:text-4xl font-black">Top Quality 🏊</h1>
              <p className="text-cyan-200 mt-1">Mantenimiento y productos para piscinas · San Luis, Argentina</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-cyan-200 text-xs font-semibold uppercase tracking-wide mb-1">Inversión</p>
              <p className="text-3xl font-black">$150.000</p>
              <p className="text-cyan-200 text-sm">pago único · sin mensualidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Problema que resuelve */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">¿Qué problema resuelve?</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-gray-900 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Hoy sin el sistema</p>
              <ul className="space-y-3">
                {[
                  'El cliente llama para preguntar disponibilidad',
                  'Tenés que anotar el turno a mano o en papel',
                  'Si estás en una pileta, no podés atender el teléfono',
                  'Los clientes no saben qué servicios ofrecés ni los precios',
                  'A las 9 de la noche nadie atiende reservas',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="text-gray-600 font-black mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-cyan-600 rounded-2xl p-6">
              <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-4">Con el sistema Top Quality</p>
              <ul className="space-y-3">
                {[
                  'Los clientes reservan solos desde el celular',
                  'La agenda se organiza sola, sin papeles',
                  'Recibís el turno por WhatsApp aunque estés trabajando',
                  'Tu catálogo de servicios visible en la web 24/7',
                  'Reservas a cualquier hora, fines de semana incluidos',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white">
                    <Check size={14} className="text-cyan-300 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Qué incluye */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Qué incluye el sistema</h2>
        <p className="text-gray-500 mb-10">Todo configurado a medida de Top Quality. Sin que vos tengas que tocar código.</p>

        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Servicios de ejemplo */}
        <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-6 mb-12">
          <h3 className="font-black text-gray-900 mb-1">Servicios que cargamos en el sistema</h3>
          <p className="text-sm text-gray-500 mb-5">Los configuramos con los servicios reales de Top Quality. Estos son ejemplos:</p>
          <div className="space-y-3">
            {SERVICIOS_EJEMPLO.map(s => (
              <div key={s.nombre} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-cyan-100">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.nombre}</p>
                  <p className="text-xs text-gray-400">Duración estimada: {s.duracion}</p>
                </div>
                <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                  {s.precio}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">* Los precios y servicios se definen con Top Quality al momento del setup.</p>
        </div>

        {/* Cómo funciona */}
        <h2 className="text-2xl font-black text-gray-900 mb-8">Cómo funciona el proceso</h2>
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { n: '01', title: 'Confirmás y pagás', desc: 'Un solo pago de $150.000 por MercadoPago. Sin mensualidades ni sorpresas.' },
            { n: '02', title: 'Configuramos juntos', desc: 'En 24/48hs cargamos tus servicios, precios y horarios. Vos solo validás.' },
            { n: '03', title: 'Lo compartís y funciona', desc: 'Te damos el link de reservas. Lo mandás por WhatsApp o lo ponés en Instagram.' },
          ].map(s => (
            <div key={s.n} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-5xl font-black text-gray-100 leading-none mb-4 select-none">{s.n}</p>
              <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Precio y garantía */}
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          <div className="bg-cyan-600 rounded-3xl p-8 text-white">
            <p className="text-cyan-200 text-sm font-bold uppercase tracking-wide mb-4">Inversión total</p>
            <p className="text-6xl font-black mb-2">$150.000</p>
            <p className="text-cyan-200 mb-6">pago único · sin mensualidades</p>
            <ul className="space-y-2 text-sm text-cyan-100">
              {[
                'Sistema de turnos personalizado',
                'Setup y configuración incluidos',
                'Link propio para compartir',
                '6 meses de soporte incluidos',
                'Pagás con MercadoPago',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={13} className="text-cyan-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-black text-gray-900 text-xl mb-3">Sin contrato. Sin sorpresas.</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Pagás una sola vez y el sistema es tuyo para siempre.
              Somos de San Luis — conocemos lo que cuesta cada gasto mensual.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Si en 30 días no estás conforme con el sistema,
              te devolvemos el dinero sin preguntas.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            ¿Arrancamos mañana?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Hablemos por WhatsApp y en 24hs el sistema está listo para Top Quality.
          </p>
          <a
            href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20el%20sistema%20de%20turnos%20para%20Top%20Quality"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all shadow-xl shadow-cyan-200"
          >
            Quiero el sistema para Top Quality <ArrowRight size={22} />
          </a>
          <p className="text-gray-400 text-sm mt-5">
            Joaco · DIVINIA · San Luis, Argentina ·
            <a href="https://wa.me/5492665286110" className="text-indigo-600 hover:underline ml-1">WhatsApp directo</a>
          </p>
        </div>

      </div>

      {/* Footer minimal */}
      <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Propuesta preparada por DIVINIA para Top Quality · {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        <span className="block mt-1">
          <Link href="/" className="text-indigo-600 hover:underline">Ver más en divinia.vercel.app</Link>
        </span>
      </div>
    </main>
  )
}
