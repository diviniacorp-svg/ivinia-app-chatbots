import Link from 'next/link'
import { Check, ArrowRight, Clock, Smartphone, Bell, BarChart2, Users, DollarSign } from 'lucide-react'

const TURNERO_FEATURES = [
  { icon: Smartphone, text: 'Link propio que compartís por WhatsApp, Instagram o tu web' },
  { icon: Clock, text: 'Clientes eligen servicio, día y hora. Vos no tocás nada' },
  { icon: Bell, text: 'Recordatorio automático por WhatsApp 24hs antes del turno' },
  { icon: BarChart2, text: 'Panel para ver y gestionar todos los turnos del día' },
  { icon: Users, text: 'Ficha de cada cliente con historial de visitas' },
  { icon: DollarSign, text: 'Estadísticas: facturación, servicios más pedidos, horas pico' },
]

const PLANES_TURNERO = [
  {
    name: 'Básico',
    price: '$80.000',
    desc: 'Para arrancar',
    features: [
      'Página de reservas personalizada',
      'Hasta 3 servicios',
      'Confirmación por WhatsApp',
      'Panel de gestión de turnos',
      'Recordatorios automáticos',
      '3 meses de soporte incluido',
    ],
    popular: false,
    href: 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20el%20Plan%20Básico%20de%20Turnero',
    cta: 'Empezar con el Básico',
  },
  {
    name: 'Pro',
    price: '$150.000',
    desc: 'El más elegido',
    features: [
      'Todo lo del plan Básico',
      'Servicios ilimitados',
      'Múltiples profesionales',
      'Bloqueo de horarios y días festivos',
      'Estadísticas avanzadas',
      'Integración con Google Calendar',
      '6 meses de soporte incluido',
    ],
    popular: true,
    href: 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20el%20Plan%20Pro%20de%20Turnero',
    cta: 'Quiero el Plan Pro',
  },
  {
    name: 'Enterprise',
    price: '$200.000',
    desc: 'Multi-sucursal',
    features: [
      'Todo lo del plan Pro',
      'Múltiples sucursales',
      'Cobro de seña al reservar',
      'Chatbot integrado 24/7',
      'CRM de clientes con IA',
      'Capacitación del equipo',
      'Soporte prioritario 12 meses',
    ],
    popular: false,
    href: 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20info%20del%20Plan%20Enterprise%20de%20Turnero',
    cta: 'Hablar con ventas',
  },
]

export default function ProductosSection() {
  return (
    <>
      {/* ── TURNERO ── PRODUCTO PRINCIPAL ──────────────────────────────── */}
      <section id="turnero" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              Producto estrella
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Turnero — Sistema de turnos online
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Pago único. Sin mensualidades. Setup completo en 48hs.
              Tu negocio toma turnos solo mientras vos trabajás.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {TURNERO_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-indigo-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Planes */}
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {PLANES_TURNERO.map(plan => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border-2 p-6 ${
                  plan.popular
                    ? 'border-indigo-500 shadow-xl shadow-indigo-100'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      El más elegido
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-sm font-bold text-gray-500 mb-1">{plan.desc}</p>
                  <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                  <p className="text-3xl font-black text-indigo-600 mt-2">{plan.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">pago único · sin mensualidades</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center font-bold py-3 rounded-xl text-sm transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Garantía / fricción cero */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-4xl">🛡️</div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-900 mb-1">Sin contrato. Sin mensualidades. Sin sorpresas.</p>
              <p className="text-sm text-gray-500">
                Pagás una sola vez y el sistema es tuyo para siempre. Somos de San Luis, Argentina.
                Conocemos lo que cuesta sostener un gasto mensual que no para.
              </p>
            </div>
            <a
              href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20una%20demo%20de%20Turnero"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Ver demo en vivo <ArrowRight size={15} />
            </a>
          </div>

        </div>
      </section>

      {/* ── CHATBOT — PRODUCTO COMPLEMENTARIO ──────────────────────────── */}
      <section id="chatbot" className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10">

            <div className="flex-1">
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
                También disponible
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                Chatbot IA para WhatsApp y tu web
              </h2>
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                Tu negocio responde consultas, toma pedidos y agenda turnos automáticamente.
                Sin que vos o tu equipo tengan que atender cada mensaje.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Responde preguntas frecuentes sin intervención',
                  'Disponible 24/7 incluso fines de semana',
                  'Se instala en tu web o WhatsApp en 48hs',
                  'Personalizado con el tono y la info de tu negocio',
                  'Dashboard para ver todas las conversaciones',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-purple-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/trial"
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  Probar gratis 14 días
                </Link>
                <a
                  href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20info%20del%20chatbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  Consultar por WhatsApp
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-3">Desde $50.000/mes · Sin tarjeta · 14 días gratis</p>
            </div>

            {/* Mock chatbot */}
            <div className="w-full lg:w-80 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-purple-600 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-white font-bold text-sm">Asistente Virtual</p>
                  <p className="text-purple-200 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                    En línea ahora
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-3 bg-gray-50 min-h-48">
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs shrink-0">🤖</div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-700 shadow-sm max-w-48">
                    ¡Hola! Soy el asistente de Veterinaria Huella. ¿En qué puedo ayudarte?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-purple-600 rounded-2xl rounded-tr-none px-3 py-2 text-xs text-white max-w-48">
                    Quiero saber el precio de castración para un gato
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs shrink-0">🤖</div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-700 shadow-sm max-w-48">
                    La castración felina tiene un valor de $35.000. ¿Querés que te reserve un turno?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-purple-600 rounded-2xl rounded-tr-none px-3 py-2 text-xs text-white max-w-48">
                    Sí, para el jueves
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-400">
                  Escribí tu mensaje...
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
