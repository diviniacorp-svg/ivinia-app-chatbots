import { Check, ArrowRight, Zap } from 'lucide-react'
import Reveal from './Reveal'

const WA = 'https://wa.me/5492665286110'
const WA_TURNERO = `${WA}?text=Hola%2C%20quiero%20Turnero%20para%20mi%20negocio`
const WA_WEB = `${WA}?text=Hola%2C%20quiero%20una%20p%C3%A1gina%20web`
const WA_COMBO = `${WA}?text=Hola%2C%20quiero%20el%20combo%20Web%20%2B%20Turnero`
const WA_CUSTOM = `${WA}?text=Hola%2C%20quiero%20un%20presupuesto%20a%20medida`

const SOPORTE = [
  {
    name: 'Básico',
    price: '$30.000',
    features: ['1 ajuste/mes', 'Monitoreo mensual', 'Respuesta en 48hs'],
  },
  {
    name: 'Pro',
    price: '$60.000',
    features: ['Ajustes ilimitados', 'Monitoreo semanal', 'Respuesta en 24hs'],
  },
  {
    name: 'Total',
    price: '$100.000',
    features: ['Todo lo del Pro', 'Nuevas funciones/mes', 'Respuesta en 4hs'],
  },
]

export default function PricingCards() {
  return (
    <section id="precios" className="py-32 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <Reveal>
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap size={14} className="fill-amber-500 text-amber-500" />
              Setup en 24hs · Sin permanencia · Cancelás cuando querés
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
              Desde $43.000/mes.<br />
              <span className="text-indigo-600">O $100.000 único.</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
              Elegís cómo pagar. Suscripción mensual sin permanencia, o pago único y tuyo para siempre.
            </p>
          </div>
        </Reveal>

        {/* Producto estrella — Turnero */}
        <Reveal>
          <div className="relative bg-indigo-600 rounded-3xl p-8 sm:p-10 mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
                <div>
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                    📅 Sistema de Turnos Online
                  </span>
                  <h3 className="text-4xl font-black text-white mb-2">Turnero</h3>
                  <p className="text-indigo-200 text-lg max-w-md">
                    Tus clientes reservan solos. Vos recibís el turno y seguís trabajando.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-indigo-300 text-sm font-bold mb-1">desde</div>
                  <div className="text-6xl font-black text-white leading-none">$43.000</div>
                  <div className="text-indigo-300 text-sm font-medium mt-1">/mes · o $100.000 único</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Página pública de reservas (tu link propio)',
                  'Panel del dueño con PIN para gestionar turnos',
                  'Servicios ilimitados con precios y duración',
                  'Horarios configurables por día',
                  'Confirmación automática al cliente',
                  'Setup completo en 24hs por nosotros',
                  'Listo para cualquier rubro con agenda',
                  'Soporte por WhatsApp incluido',
                ].map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-white">
                    <Check size={15} className="shrink-0 mt-0.5 text-indigo-300" />
                    {f}
                  </div>
                ))}
              </div>

              <a
                href={WA_TURNERO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black px-8 py-4 rounded-2xl text-base transition-all shadow-xl"
              >
                Quiero mi Turnero — desde $43.000/mes <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </Reveal>

        {/* Web + Combo */}
        <div className="grid sm:grid-cols-2 gap-5 mb-20">

          {/* Página web */}
          <Reveal delay={80}>
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-7 flex flex-col h-full">
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 w-fit">
                🌐 Página Web Profesional
              </span>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black text-gray-900">$300k</span>
                <span className="text-gray-400 text-sm">– $500k</span>
              </div>
              <p className="text-sm text-gray-400 mb-5">según complejidad · pago único</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  'Landing page o sitio completo',
                  'Diseño profesional a medida',
                  'SEO básico incluido',
                  'Deploy en tu dominio propio',
                  'Mobile-first, carga rápida',
                  'Formulario de contacto',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={13} className="shrink-0 mt-0.5 text-purple-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={WA_WEB}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
              >
                Pedir presupuesto web →
              </a>
            </div>
          </Reveal>

          {/* Combo */}
          <Reveal delay={160}>
            <div className="bg-gray-950 border border-indigo-500/30 rounded-3xl p-7 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  Más vendido
                </span>
              </div>
              <span className="inline-block bg-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 w-fit">
                🚀 Web + Turnero — Combo
              </span>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">$350k</span>
                <span className="text-gray-500 text-sm">– $550k</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">pago único · ahorrás hasta $100k</p>
              <p className="text-xs text-indigo-400 font-medium mb-5">Web + Turnero integrado = conversión completa</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  'Todo lo de la web profesional',
                  'Turnero integrado con botón "Reservar"',
                  'El cliente ve tu web y reserva en el momento',
                  'Panel unificado para gestionar todo',
                  'Setup completo hecho por nosotros',
                  'Precio combo — más barato que separado',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check size={13} className="shrink-0 mt-0.5 text-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={WA_COMBO}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
              >
                Quiero el combo →
              </a>
            </div>
          </Reveal>
        </div>

        {/* Asistencia técnica mensual */}
        <Reveal>
          <div className="mb-20">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.12em] mb-2">
              Mantenimiento mensual — opcional
            </p>
            <p className="text-gray-500 text-sm mb-6">Para que tu sistema siempre esté actualizado y funcionando perfecto.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {SOPORTE.map(s => (
                <div key={s.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{s.name}</p>
                  <p className="text-3xl font-black text-gray-900 mb-4">
                    {s.price}<span className="text-sm font-normal text-gray-400">/mes</span>
                  </p>
                  <ul className="space-y-2">
                    {s.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={13} className="text-indigo-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Proyectos a medida */}
        <Reveal>
          <div className="bg-gray-950 rounded-3xl p-10 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">¿Necesitás algo a medida?</p>
            <h3 className="text-3xl font-black text-white mb-4">
              Agentes IA · Automatizaciones · CRM · Apps
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
              Presupuesto sin compromiso en 24hs.
              Somos de San Luis, Argentina — conocemos bien lo que necesita una PYME.
            </p>
            <a
              href={WA_CUSTOM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
            >
              Pedir presupuesto →
            </a>
            <p className="text-gray-600 text-sm mt-5">
              Pagás con MercadoPago · 50% adelanto, 50% en entrega
            </p>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
