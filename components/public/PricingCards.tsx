import Link from 'next/link'
import { Check } from 'lucide-react'
import Reveal from './Reveal'

const PLANES_CHATBOT = [
  {
    name: 'Starter',
    price: '$50.000',
    billing: '/mes',
    desc: 'Para arrancar',
    popular: false,
    features: [
      '14 días gratis, sin tarjeta',
      'Chatbot en tu web o WhatsApp',
      'Template de tu rubro listo',
      'Hasta 500 conversaciones/mes',
      'Dashboard básico',
      'Soporte por WhatsApp',
    ],
    cta: 'Probar gratis 14 días',
    href: '/trial',
  },
  {
    name: 'Pro',
    price: '$100.000',
    billing: '/mes',
    desc: 'El más elegido',
    popular: true,
    features: [
      'Todo lo del plan Starter',
      'Conversaciones ilimitadas',
      'Turnero integrado (sistema de turnos)',
      'Respuestas avanzadas con IA',
      'Multicanal: web + WhatsApp',
      'Soporte prioritario',
    ],
    cta: 'Empezar con Pro',
    href: '/trial?plan=pro',
  },
  {
    name: 'Enterprise',
    price: '$200.000',
    billing: '/mes',
    desc: 'Multi-sucursal',
    popular: false,
    features: [
      'Todo lo del plan Pro',
      'Múltiples sucursales',
      'Agente IA personalizado',
      'Integración con tu sistema',
      'CRM con IA incluido',
      'Soporte dedicado + onboarding',
    ],
    cta: 'Consultar Enterprise',
    href: 'https://wa.me/5492665286110?text=Quiero%20info%20del%20plan%20Enterprise',
  },
]

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
            <p className="text-sm font-bold text-purple-600 uppercase tracking-[0.15em] mb-4">Chatbot SaaS</p>
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
              Tu asistente IA,<br />
              por suscripción mensual
            </h2>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
              Para los que prefieren empezar sin inversión inicial.
              14 días gratis en todos los planes, sin tarjeta.
            </p>
          </div>
        </Reveal>

        {/* Planes */}
        <div className="grid sm:grid-cols-3 gap-5 mb-20">
          {PLANES_CHATBOT.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 80}>
              <div className={`relative flex flex-col rounded-3xl h-full p-7 ${
                plan.popular
                  ? 'bg-purple-600 text-white shadow-2xl shadow-purple-200 scale-105'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide">
                      Más elegido
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.popular ? 'text-purple-300' : 'text-gray-400'}`}>
                    {plan.desc}
                  </p>
                  <h4 className={`text-2xl font-black mb-3 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-purple-600'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'text-purple-300' : 'text-gray-400'}`}>{plan.billing}</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                      <Check size={14} className={`shrink-0 mt-0.5 ${plan.popular ? 'text-purple-300' : 'text-purple-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  target={plan.href.startsWith('http') ? '_blank' : undefined}
                  rel={plan.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`block text-center font-bold py-4 rounded-2xl text-sm transition-all ${
                    plan.popular
                      ? 'bg-white text-purple-700 hover:bg-purple-50'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Asistencia técnica mensual */}
        <Reveal>
          <div className="mb-8">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.12em] mb-6">
              Asistencia técnica mensual — opcional para cualquier producto
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {SOPORTE.map((s, i) => (
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
              href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20un%20presupuesto%20a%20medida"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
            >
              Pedir presupuesto gratis →
            </a>
            <p className="text-gray-600 text-sm mt-5">
              Pagás con MercadoPago · 50% adelanto, 50% en entrega · Cancelás cuando querés
            </p>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
