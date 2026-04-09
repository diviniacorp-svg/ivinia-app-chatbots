import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import Reveal from './Reveal'

export default function Hero() {
  return (
    <section className="pt-28 pb-0 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">

        {/* Badge */}
        <Reveal delay={0}>
          <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2 rounded-full text-sm font-semibold mb-8 inline-block">
            🇦🇷 Hecho en San Luis · Para PYMEs argentinas
          </span>
        </Reveal>

        {/* Headline — muy grande, como datte */}
        <Reveal delay={80}>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.0] tracking-tight mb-8">
            Tus turnos,<br />
            <span className="text-indigo-600">en automático</span>
          </h1>
        </Reveal>

        {/* Subheadline — grande y claro */}
        <Reveal delay={160}>
          <p className="text-2xl sm:text-3xl text-gray-500 font-medium max-w-2xl mx-auto mb-6 leading-snug">
            Olvidate de las llamadas. Tus clientes reservan solos,
            vos recibís el turno y seguís trabajando.
          </p>
        </Reveal>

        {/* Descripción */}
        <Reveal delay={220}>
          <p className="text-lg text-gray-400 max-w-lg mx-auto mb-10">
            Turnero organiza tu agenda, manda recordatorios por WhatsApp
            y muestra tu disponibilidad en tiempo real. Las 24hs.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={280}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <a
              href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20Turnero%20para%20mi%20negocio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              Quiero mi Turnero <ArrowRight size={20} />
            </a>
            <Link
              href="/rubros"
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-10 py-5 rounded-2xl text-lg transition-all"
            >
              Ver demo de mi rubro
            </Link>
          </div>
        </Reveal>

        {/* Fricción cero */}
        <Reveal delay={340}>
          <div className="flex items-center justify-center gap-8 flex-wrap mb-20">
            {[
              '$80.000 pago único',
              'Setup en 24hs',
              'Sin mensualidades',
            ].map(item => (
              <span key={item} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <Check size={15} className="text-emerald-500 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </Reveal>

      </div>

      {/* Before / After — grande, impacto visual */}
      <div className="max-w-5xl mx-auto px-6 mb-0">
        <Reveal delay={0} y={48}>
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Antes */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
              <p className="text-xs font-black text-gray-500 uppercase tracking-[0.15em] mb-6">Hoy, sin Turnero</p>
              <ul className="space-y-4">
                {[
                  'El teléfono suena mientras trabajás con las manos',
                  'WhatsApp sin responder hasta el día siguiente',
                  'Clientes que dicen "llamo después" y nunca llaman',
                  'Agenda en papel llena de errores y turnos dobles',
                  'A las 11 de la noche no hay nadie que atienda',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-base text-gray-400">
                    <span className="shrink-0 text-gray-600 font-black text-lg leading-tight">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Con Turnero */}
            <div className="bg-indigo-600 border-2 border-indigo-500 rounded-3xl p-8">
              <p className="text-xs font-black text-indigo-300 uppercase tracking-[0.15em] mb-6">Con Turnero</p>
              <ul className="space-y-4">
                {[
                  'Tus clientes reservan solos desde el celular',
                  'Confirmación automática por WhatsApp al instante',
                  'Recordatorio 24hs antes para que no falten',
                  'Panel donde ves todos tus turnos organizados',
                  'Reservas a cualquier hora, incluso a las 3am',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-base text-white">
                    <span className="shrink-0 text-indigo-300 font-black text-lg leading-tight">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </Reveal>
      </div>

      {/* Mock de la app — grande, como datte */}
      <div className="bg-gray-50 border-t border-gray-100 mt-20">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-0">
          <Reveal delay={0}>
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">
              Así ven tus clientes la página de reservas
            </p>
          </Reveal>
          <Reveal delay={100} y={60}>
            <div className="max-w-sm mx-auto bg-white rounded-t-3xl border border-b-0 border-gray-200 shadow-2xl overflow-hidden">
              {/* Cabecera del negocio */}
              <div className="bg-indigo-600 px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">✂️</div>
                <div>
                  <p className="text-white font-bold text-base">Peluquería San Martín</p>
                  <p className="text-indigo-200 text-sm">Reservá tu turno online</p>
                </div>
              </div>
              {/* Servicios */}
              <div className="px-6 py-5 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Elegí tu servicio</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { nombre: 'Corte', precio: '$8.000', sel: false },
                    { nombre: 'Barba', precio: '$4.000', sel: false },
                    { nombre: 'Corte+Barba', precio: '$11.000', sel: true },
                  ].map(s => (
                    <div key={s.nombre} className={`p-3 rounded-2xl border-2 text-center transition-all ${s.sel ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}>
                      <p className={`text-xs font-semibold leading-tight mb-1.5 ${s.sel ? 'text-indigo-700' : 'text-gray-600'}`}>{s.nombre}</p>
                      <p className={`text-sm font-black ${s.sel ? 'text-indigo-600' : 'text-gray-800'}`}>{s.precio}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Días */}
              <div className="px-6 py-5 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Elegí el día</p>
                <div className="flex gap-2.5">
                  {['Lu 14', 'Ma 15', 'Mi 16', 'Ju 17', 'Vi 18'].map((d, i) => (
                    <div key={d} className={`flex-1 py-3 rounded-2xl text-center font-semibold text-sm ${i === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              {/* Horarios */}
              <div className="px-6 py-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Elegí la hora</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { t: '9:00', sel: false, na: false },
                    { t: '9:30', sel: false, na: true },
                    { t: '10:00', sel: false, na: false },
                    { t: '10:30', sel: true, na: false },
                    { t: '11:00', sel: false, na: false },
                    { t: '11:30', sel: false, na: false },
                    { t: '14:00', sel: false, na: false },
                    { t: '14:30', sel: false, na: false },
                  ].map(h => (
                    <div key={h.t} className={`py-2.5 rounded-xl text-center text-sm font-semibold ${h.sel ? 'bg-indigo-600 text-white' : h.na ? 'bg-gray-100 text-gray-300 line-through' : 'bg-gray-100 text-gray-600'}`}>
                      {h.t}
                    </div>
                  ))}
                </div>
                <button className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl text-base transition-colors">
                  Confirmar turno →
                </button>
                <p className="text-center text-xs text-gray-400 mt-3 pb-2">
                  Te llega confirmación por WhatsApp al instante
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

    </section>
  )
}
