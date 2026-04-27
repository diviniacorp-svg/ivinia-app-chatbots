import Link from 'next/link'
import { Check, ArrowRight, Clock, Smartphone, Bell, BarChart2 } from 'lucide-react'

export const metadata = {
  title: 'Propuesta para FA Peluquería — Turnero IA | DIVINIA',
  description: 'Propuesta personalizada de sistema de turnos online para FA Peluquería, San Luis.',
}

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Reservas 24/7 desde el celu',
    desc: 'Tus clientas reservan cuando quieren, incluso a las 11 de la noche. Sin mensajes que no podés responder.',
  },
  {
    icon: Bell,
    title: 'Recordatorio automático por WhatsApp',
    desc: 'El sistema avisa a cada clienta 24hs antes del turno. Las ausencias bajan casi a cero.',
  },
  {
    icon: Clock,
    title: 'Tu agenda en tiempo real',
    desc: 'La clienta ve exactamente qué horarios tenés libres. Sin ir y venir de mensajes para coordinar.',
  },
  {
    icon: BarChart2,
    title: 'Panel de gestión desde el celu',
    desc: 'Ves todos los turnos del día antes de abrir el local. Todo organizado sin hacer nada.',
  },
]

const SERVICIOS = [
  { nombre: 'Corte de pelo', detalle: 'Dama / Caballero / Niños' },
  { nombre: 'Coloración completa', detalle: 'Tinte + retoque + mechas' },
  { nombre: 'Alisado o keratina', detalle: 'Tratamiento completo' },
  { nombre: 'Peinado y brushing', detalle: 'Para eventos o diario' },
  { nombre: 'Tratamiento capilar', detalle: 'Hidratación + reconstrucción' },
  { nombre: 'Ondas y rizado', detalle: 'Permanente o temporal' },
]

export default function PropuestaFaPeluqueria() {
  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4a044e 0%, #86198f 100%)' }} className="text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
                  style={{ background: 'linear-gradient(135deg, #f0abfc, #e879f9)' }}>
                  ✂️
                </div>
                <div>
                  <p className="text-fuchsia-200 text-xs font-bold uppercase tracking-widest">Propuesta exclusiva · DIVINIA</p>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">FA Peluquería</h1>
                </div>
              </div>
              <p className="text-fuchsia-200 text-base">Peluquería · San Luis Capital</p>
            </div>
            <div className="rounded-2xl px-6 py-4 text-center border border-white/20"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <p className="text-fuchsia-200 text-xs font-bold uppercase tracking-wide mb-1">Implementación</p>
              <p className="text-4xl font-black text-white">$65.000</p>
              <p className="text-fuchsia-200 text-sm mt-1">pago único · tuyo para siempre</p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-fuchsia-300 text-xs font-bold uppercase tracking-wide mb-0.5">Soporte mensual</p>
                <p className="text-2xl font-black text-white">$30.000<span className="text-sm font-normal text-fuchsia-200">/mes</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo en vivo */}
      <div className="border-b" style={{ background: '#fdf4ff', borderColor: '#f5d0fe' }}>
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-black text-gray-900 text-lg">Mirá cómo lo ven tus clientas</p>
            <p className="text-gray-500 text-sm">Demo real de FA Peluquería — abre desde cualquier celular</p>
          </div>
          <a
            href="https://divinia.vercel.app/reservas/fa-faby-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-white shrink-0 transition-all"
            style={{ background: 'linear-gradient(135deg, #4a044e, #86198f)' }}
          >
            Ver demo FA Peluquería <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* El problema */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">El problema de hoy</h2>
          <p className="text-gray-500 mb-8">Lo que pasa sin el sistema.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-gray-900 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Sin Turnero</p>
              <ul className="space-y-3">
                {[
                  'Estás con una clienta y llega un mensaje pidiendo turno — lo dejás, se olvida, se va',
                  'Las 11pm: "¿Tenés para el sábado?" — no hay nadie para responder',
                  'Turno sin recordatorio — no vino, ese hueco en el día no se recupera',
                  'Agenda en el cuaderno o de cabeza — errores, turnos dobles, caos',
                  'No sabés cuántas clientas perdiste esta semana',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="text-gray-600 font-black mt-0.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #4a044e, #86198f)' }}>
              <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-5">Con Turnero FA</p>
              <ul className="space-y-3">
                {[
                  'La clienta reserva sola desde el celular — vos seguís atendiendo',
                  'Reservas de madrugada, de fin de semana — siempre disponible',
                  'Recordatorio automático 24hs antes → ausencias casi a cero',
                  'Panel digital en tiempo real — agenda impecable',
                  'Llegás el lunes con el día ya organizado',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white">
                    <Check size={14} className="text-fuchsia-300 shrink-0 mt-0.5" />
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
        <p className="text-gray-500 mb-10">Todo personalizado para FA Peluquería. Setup en 48hs.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-fuchsia-600" />
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
        <div className="rounded-2xl p-6 mb-14 border" style={{ background: '#fdf4ff', borderColor: '#f5d0fe' }}>
          <h3 className="font-black text-gray-900 mb-1">Tus servicios ya listos en el sistema</h3>
          <p className="text-sm text-gray-500 mb-6">Configurados para FA Peluquería — los ajustamos juntas antes del lanzamiento:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {SERVICIOS.map(s => (
              <div key={s.nombre} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-fuchsia-100">
                <div className="w-2 h-2 rounded-full bg-fuchsia-500 shrink-0" />
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
            { n: '02', title: 'Setup en 48hs', desc: 'Cargamos tus servicios y horarios. En dos días FA Peluquería ya toma turnos sola.' },
            { n: '03', title: 'Compartís el link', desc: 'Lo ponés en el bio de Instagram, en el WhatsApp, en la puerta. Las clientas reservan solas.' },
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
          <div className="rounded-3xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #4a044e, #86198f)' }}>
            <p className="text-fuchsia-300 text-sm font-bold uppercase tracking-wide mb-4">Implementación</p>
            <p className="font-black mb-1 text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>$65.000</p>
            <p className="text-fuchsia-200 mb-2">pago único · el sistema es tuyo</p>
            <ul className="space-y-2 text-sm text-fuchsia-100 mt-4">
              {[
                'Sistema personalizado FA Peluquería',
                'Tus servicios y precios cargados',
                'Tus horarios de atención configurados',
                'Notificaciones a tu WhatsApp',
                'Capacitación de uso (30 min)',
                '30 días de soporte incluidos',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={13} className="text-fuchsia-300 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-fuchsia-800">
              <p className="text-fuchsia-300 text-sm font-bold uppercase tracking-wide mb-2">Soporte mensual</p>
              <p className="font-black text-white" style={{ fontSize: '2.5rem', lineHeight: 1 }}>$30.000<span className="text-sm font-normal text-fuchsia-200">/mes</span></p>
              <p className="text-fuchsia-200 text-xs mt-1">Sin contrato · cancelás cuando querés con 15 días de aviso</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-black text-gray-900 text-xl mb-3">Sin riesgo.</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Si en 30 días el sistema no funciona como esperabas o no te convence,
              te devolvemos el 100% de la implementación. Sin preguntas.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Somos de San Luis. Nos conocemos de acá. Estamos disponibles
              cuando nos necesitás.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">¿Lo probamos juntas ahora?</h2>
          <p className="text-gray-500 mb-8 text-lg max-w-lg mx-auto">
            El demo de FA Peluquería ya está listo. Abrilo desde el celular y probalo como si fueras clienta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/5492665286110?text=Hola%20Joaco%2C%20quiero%20activar%20Turnero%20para%20FA%20Peluquer%C3%ADa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all shadow-xl"
              style={{ background: 'linear-gradient(135deg, #4a044e, #86198f)', boxShadow: '0 20px 40px rgba(134,25,143,0.3)' }}
            >
              Confirmar por WhatsApp <ArrowRight size={22} />
            </a>
            <a
              href="https://divinia.vercel.app/reservas/fa-faby-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold px-8 py-5 rounded-2xl text-fuchsia-700 border border-fuchsia-200 text-lg"
              style={{ background: '#fdf4ff' }}
            >
              Ver mi demo →
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-5">
            Joaco · DIVINIA · San Luis ·{' '}
            <a href="https://wa.me/5492665286110" className="text-fuchsia-600 hover:underline">(266) 528-6110</a>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Propuesta preparada por DIVINIA para FA Peluquería · San Luis ·{' '}
        <Link href="/" className="text-fuchsia-600 hover:underline">divinia.vercel.app</Link>
      </div>
    </main>
  )
}
