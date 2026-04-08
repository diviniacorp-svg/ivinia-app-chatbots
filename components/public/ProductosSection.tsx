import Link from 'next/link'
import { Check, ArrowRight, Clock, Smartphone, Bell, BarChart2, Users, DollarSign } from 'lucide-react'
import Reveal from './Reveal'

const FEATURES = [
  { icon: Smartphone, title: 'Reservas 24/7 sin teléfono', desc: 'Link propio que compartís por WhatsApp o Instagram. El cliente elige, vos no tocás nada.' },
  { icon: Bell, title: 'Recordatorios por WhatsApp', desc: 'El sistema avisa al cliente antes del turno. Menos ausencias, más facturación.' },
  { icon: Clock, title: 'Tu disponibilidad en tiempo real', desc: 'Los clientes ven exactamente qué horarios tenés libres. Sin llamadas para preguntar.' },
  { icon: BarChart2, title: 'Panel de gestión', desc: 'Ves todos los turnos del día de un vistazo. Podés confirmar, cancelar o reprogramar.' },
  { icon: Users, title: 'Ficha de cada cliente', desc: 'Historial de visitas, servicios y notas. Conocés a tus clientes mejor que nunca.' },
  { icon: DollarSign, title: 'Estadísticas reales', desc: 'Cuánto facturaste, cuáles son los servicios más pedidos y tus horas pico.' },
]

const PLANES = [
  {
    name: 'Básico',
    price: '$80.000',
    billing: 'pago único',
    desc: 'Para arrancar',
    features: ['Página de reservas personalizada', 'Hasta 3 servicios', 'Confirmación por WhatsApp', 'Panel de gestión', 'Recordatorios automáticos', '3 meses de soporte'],
    popular: false,
    href: 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20el%20Plan%20Básico%20de%20Turnero',
    cta: 'Empezar con el Básico',
  },
  {
    name: 'Pro',
    price: '$150.000',
    billing: 'pago único',
    desc: 'El más elegido',
    features: ['Todo lo del Básico', 'Servicios ilimitados', 'Múltiples profesionales', 'Bloqueo de horarios', 'Estadísticas avanzadas', 'Google Calendar integrado', '6 meses de soporte'],
    popular: true,
    href: 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20el%20Plan%20Pro%20de%20Turnero',
    cta: 'Quiero el Plan Pro',
  },
  {
    name: 'Enterprise',
    price: '$200.000',
    billing: 'pago único',
    desc: 'Multi-sucursal',
    features: ['Todo lo del Pro', 'Múltiples sucursales', 'Cobro de seña al reservar', 'Chatbot integrado 24/7', 'CRM con IA', 'Capacitación del equipo', '12 meses de soporte'],
    popular: false,
    href: 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20info%20del%20Plan%20Enterprise%20de%20Turnero',
    cta: 'Consultar Enterprise',
  },
]

export default function ProductosSection() {
  return (
    <>
      {/* ── TURNERO — PRODUCTO PRINCIPAL ─────────────────────────────── */}
      <section id="turnero" className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">

          {/* Header de sección */}
          <Reveal>
            <div className="mb-20">
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.15em] mb-4">Producto estrella</p>
              <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
                Turnero —<br />
                Reservas online para<br />
                tu negocio
              </h2>
              <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
                Pago único. Sin mensualidades. Setup completo en 48hs.
                Tu negocio toma turnos solo mientras vos trabajás.
              </p>
            </div>
          </Reveal>

          {/* Features — aparecen de a pares */}
          <div className="grid sm:grid-cols-2 gap-6 mb-24">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} delay={i % 2 === 0 ? 0 : 100}>
                  <div className="flex gap-5 p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors group">
                    <div className="w-12 h-12 bg-white border border-gray-200 group-hover:border-indigo-200 rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                      <Icon size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          {/* Planes — la sección que más impacto tiene */}
          <Reveal>
            <h3 className="text-3xl font-black text-gray-900 text-center mb-3">Elegí tu plan</h3>
            <p className="text-center text-gray-400 mb-10">Un solo pago. El sistema es tuyo para siempre.</p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5 mb-14">
            {PLANES.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80}>
                <div className={`relative flex flex-col rounded-3xl h-full p-7 ${
                  plan.popular
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-amber-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide">
                        El más elegido
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.popular ? 'text-indigo-300' : 'text-gray-400'}`}>
                      {plan.desc}
                    </p>
                    <h4 className={`text-2xl font-black mb-3 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h4>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-indigo-600'}`}>{plan.price}</span>
                    </div>
                    <p className={`text-sm mt-1 ${plan.popular ? 'text-indigo-300' : 'text-gray-400'}`}>{plan.billing}</p>
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
                        <Check size={14} className={`shrink-0 mt-0.5 ${plan.popular ? 'text-indigo-300' : 'text-indigo-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center font-bold py-4 rounded-2xl text-sm transition-all ${
                      plan.popular
                        ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Garantía */}
          <Reveal>
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="text-5xl">🛡️</div>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-lg mb-1">Sin contrato. Sin mensualidades. Sin sorpresas.</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Pagás una sola vez y el sistema es tuyo para siempre. Somos de San Luis, Argentina —
                  conocemos lo que cuesta sostener un gasto mensual que no para.
                </p>
              </div>
              <a
                href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20una%20demo%20de%20Turnero"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-4 rounded-2xl text-sm transition-all"
              >
                Ver demo <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── CHATBOT — PRODUCTO COMPLEMENTARIO ─────────────────────────── */}
      <section id="chatbot" className="py-32 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <Reveal>
              <div>
                <p className="text-sm font-bold text-purple-600 uppercase tracking-[0.15em] mb-4">También disponible</p>
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  Chatbot IA para<br />
                  WhatsApp y tu web
                </h2>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                  Tu negocio responde consultas y agenda turnos automáticamente,
                  sin que vos o tu equipo tengan que atender cada mensaje.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Responde preguntas frecuentes sin intervención',
                    'Disponible 24/7, fines de semana y feriados',
                    'Se instala en tu web o WhatsApp en 48hs',
                    'Personalizado con la info de tu negocio',
                    'Dashboard para ver todas las conversaciones',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-gray-700">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} className="text-purple-600" />
                      </div>
                      <span className="text-base">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/trial"
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
                  >
                    Probar gratis 14 días
                  </Link>
                  <a
                    href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20info%20del%20chatbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold px-8 py-4 rounded-2xl text-base transition-all"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
                <p className="text-sm text-gray-400 mt-4">Desde $50.000/mes · Sin tarjeta · 14 días gratis</p>
              </div>
            </Reveal>

            {/* Mock del chatbot */}
            <Reveal delay={150} y={48}>
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-purple-600 px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🤖</div>
                  <div>
                    <p className="text-white font-bold">Asistente Virtual</p>
                    <p className="text-purple-200 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                      En línea ahora
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-4 bg-gray-50 min-h-72">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-sm shrink-0">🤖</div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700 shadow-sm max-w-64">
                      ¡Hola! Soy el asistente de Veterinaria Huella. ¿En qué te puedo ayudar?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-purple-600 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-white max-w-56">
                      ¿Cuánto sale la castración de un gato?
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-sm shrink-0">🤖</div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700 shadow-sm max-w-64">
                      La castración felina cuesta $35.000. ¿Querés que te reserve un turno?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-purple-600 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-white max-w-48">
                      Sí, para el jueves 17
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-sm shrink-0">🤖</div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700 shadow-sm max-w-64">
                      ¡Perfecto! Turno reservado para el jueves 17 a las 10:00. Te mando confirmación por WhatsApp. ✓
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-white">
                  <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-400">
                    Escribí tu mensaje...
                  </div>
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>
    </>
  )
}
