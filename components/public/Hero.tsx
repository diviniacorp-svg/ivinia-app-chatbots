import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

const RUBROS = [
  'Peluquerías', 'Estéticas', 'Clínicas', 'Consultorios',
  'Veterinarias', 'Talleres', 'Odontologías', 'Gimnasios',
]

export default function Hero() {
  return (
    <section className="pt-24 pb-0 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-1.5 rounded-full text-sm font-medium">
            🇦🇷 De San Luis, para PYMEs argentinas
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl sm:text-6xl font-black text-gray-900 leading-[1.1] mb-5 max-w-3xl mx-auto">
          Tus turnos, en{' '}
          <span className="text-indigo-600">piloto automático</span>
        </h1>

        <p className="text-center text-xl text-gray-500 max-w-xl mx-auto mb-4 leading-relaxed">
          Tus clientes reservan solos, a cualquier hora, sin llamadas ni WhatsApp.
          Vos recibís el turno confirmado y te enfocás en trabajar.
        </p>

        <p className="text-center text-sm text-gray-400 mb-8">
          Funcionando en peluquerías, clínicas, veterinarias y más en San Luis.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <a
            href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20Turnero"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-indigo-100"
          >
            Ver una demo en vivo <ArrowRight size={18} />
          </a>
          <Link
            href="/trial"
            className="flex items-center gap-2 border border-gray-200 hover:border-indigo-300 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:bg-indigo-50"
          >
            Probalo gratis
          </Link>
        </div>

        {/* Fricción cero */}
        <div className="flex items-center justify-center gap-6 mb-14 flex-wrap">
          {['Sin tarjeta de crédito', 'Setup en 24hs', 'Pago único — sin mensualidades'].map(item => (
            <span key={item} className="flex items-center gap-1.5 text-sm text-gray-400">
              <Check size={14} className="text-emerald-500 shrink-0" />
              {item}
            </span>
          ))}
        </div>

        {/* Before / After */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-14">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">Sin Turnero</p>
            <ul className="space-y-3">
              {[
                'Teléfono que suena mientras trabajás con las manos',
                'WhatsApp sin responder hasta el día siguiente',
                'Clientes que dicen "llamo después" y nunca llaman',
                'Agenda en papel con errores y turnos dobles',
                'A las 11 de la noche no hay nadie que atienda',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5 shrink-0 text-red-400 font-bold">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Con Turnero</p>
            <ul className="space-y-3">
              {[
                'Tus clientes reservan solos desde el celular',
                'Confirmación automática por WhatsApp al instante',
                'Recordatorio 24hs antes para que no falten',
                'Panel donde ves todos tus turnos del día',
                'Reservas a cualquier hora, incluso a las 3am',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="mt-0.5 shrink-0 text-indigo-500 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rubros */}
        <p className="text-center text-xs text-gray-400 font-medium uppercase tracking-widest mb-3">
          Para tu rubro
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {RUBROS.map(rubro => (
            <span key={rubro} className="bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
              {rubro}
            </span>
          ))}
        </div>

      </div>

      {/* Mock UI */}
      <div className="mt-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-sm mx-auto px-4 pt-10 pb-0">
          <p className="text-center text-xs text-gray-400 font-medium uppercase tracking-widest mb-6">
            Así ven tus clientes la página de reservas
          </p>
          <div className="bg-white rounded-t-3xl border border-b-0 border-gray-200 shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">✂️</div>
              <div>
                <p className="text-white font-bold text-sm">Peluquería San Martín</p>
                <p className="text-indigo-200 text-xs">Reservá tu turno online</p>
              </div>
            </div>
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Elegí tu servicio</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { nombre: 'Corte', precio: '$8.000', selected: false },
                  { nombre: 'Barba', precio: '$4.000', selected: false },
                  { nombre: 'Corte+Barba', precio: '$11.000', selected: true },
                ].map(s => (
                  <div key={s.nombre} className={`p-2.5 rounded-xl border-2 text-center ${s.selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'}`}>
                    <p className={`text-[11px] font-semibold leading-tight mb-1 ${s.selected ? 'text-indigo-700' : 'text-gray-600'}`}>{s.nombre}</p>
                    <p className={`text-xs font-bold ${s.selected ? 'text-indigo-600' : 'text-gray-800'}`}>{s.precio}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Elegí el día</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['Lun 14', 'Mar 15', 'Mié 16', 'Jue 17', 'Vie 18'].map((d, i) => (
                  <div key={d} className={`shrink-0 px-3 py-2 rounded-xl ${i === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <p className="text-xs font-semibold">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Elegí la hora</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { t: '9:00', s: false, na: false },
                  { t: '9:30', s: false, na: true },
                  { t: '10:00', s: false, na: false },
                  { t: '10:30', s: true, na: false },
                  { t: '11:00', s: false, na: false },
                  { t: '11:30', s: false, na: false },
                  { t: '14:00', s: false, na: false },
                  { t: '14:30', s: false, na: false },
                ].map(h => (
                  <div key={h.t} className={`text-center py-2 rounded-lg text-xs font-medium ${h.s ? 'bg-indigo-600 text-white' : h.na ? 'bg-gray-100 text-gray-300 line-through' : 'bg-gray-100 text-gray-600'}`}>
                    {h.t}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">
                Confirmar turno →
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-2 pb-4">
                Confirmación automática por WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
