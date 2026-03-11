import Link from 'next/link'

const PLANES_CHATBOT = [
  {
    name: 'Starter',
    price: 50000,
    desc: 'Chatbot SaaS · Para arrancar',
    popular: false,
    features: [
      '14 días gratis, sin tarjeta',
      'Chatbot en tu web o WhatsApp',
      'Template de tu rubro listo',
      'Hasta 500 conversaciones/mes',
      'Dashboard básico',
      'Soporte por WhatsApp',
    ],
    cta: 'Probar 14 días gratis',
    href: '/trial',
  },
  {
    name: 'Pro',
    price: 100000,
    desc: 'Chatbot SaaS · Para crecer',
    popular: true,
    features: [
      '14 días gratis, sin tarjeta',
      'Todo lo del plan Starter',
      'Conversaciones ilimitadas',
      'Sistema de turnos integrado',
      'Respuestas avanzadas con IA',
      'Reportes mensuales',
      'Soporte prioritario',
    ],
    cta: 'Probar 14 días gratis',
    href: '/trial',
  },
  {
    name: 'Enterprise',
    price: 200000,
    desc: 'Chatbot SaaS · Solución total',
    popular: false,
    features: [
      '14 días gratis, sin tarjeta',
      'Todo lo del plan Pro',
      'Multi-sucursal / multi-negocio',
      'Integración con tus sistemas',
      'CRM y automatizaciones',
      'Capacitación del equipo',
      'Soporte dedicado 24/7',
    ],
    cta: 'Hablar con ventas',
    href: 'https://wa.me/5492665286110?text=Quiero%20info%20del%20plan%20Enterprise',
  },
]

const SOPORTE = [
  {
    name: 'Soporte Básico',
    price: 30000,
    features: ['1 ajuste/mes al prompt o servicios', 'Monitoreo mensual', 'Respuesta en 48hs'],
  },
  {
    name: 'Soporte Pro',
    price: 60000,
    features: ['Ajustes ilimitados', 'Monitoreo semanal', 'Respuesta en 24hs', 'Reportes de uso'],
  },
  {
    name: 'Asistencia Total',
    price: 100000,
    features: ['Todo lo del Pro', 'Nuevas funciones mensuales', 'Respuesta en 4hs', 'Reunión mensual de revisión'],
  },
]

export default function PricingCards() {
  return (
    <section id="precios" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Precios
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-3">Todo en pesos argentinos</h2>
          <p className="text-gray-500 text-lg">
            Chatbot SaaS con suscripción mensual. Proyectos a medida con precio único. Sin sorpresas.
          </p>
        </div>

        {/* === CHATBOT SAAS === */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-black text-gray-900">Chatbot SaaS — Suscripción mensual</h3>
              <p className="text-sm text-gray-500">14 días gratis en todos los planes · Sin tarjeta de crédito</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANES_CHATBOT.map((p) => (
              <div key={p.name}
                className={`rounded-2xl p-6 flex flex-col border-2 ${p.popular ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                {p.popular && (
                  <div className="text-center mb-3">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</span>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className={`font-bold text-lg mb-0.5 ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.name}</h4>
                  <p className={`text-xs ${p.popular ? 'text-indigo-200' : 'text-gray-500'}`}>{p.desc}</p>
                </div>
                <div className={`pb-4 mb-4 border-b ${p.popular ? 'border-indigo-500' : 'border-gray-100'}`}>
                  <span className={`text-3xl font-black ${p.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${p.price.toLocaleString('es-AR')}
                  </span>
                  <span className={`text-sm ml-1 ${p.popular ? 'text-indigo-200' : 'text-gray-400'}`}>/mes</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${p.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <span className={`font-bold flex-shrink-0 mt-0.5 ${p.popular ? 'text-green-300' : 'text-indigo-600'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href}
                  className={`block text-center font-bold py-3 rounded-xl text-sm transition-all ${p.popular ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* === SISTEMA DE TURNOS === */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="font-black text-gray-900">Sistema de Turnos Online</h3>
                <p className="text-sm text-gray-600 mt-0.5">Pago único · Setup personalizado · Deploy en Vercel</p>
                <ul className="mt-2 space-y-1">
                  {['Página de reservas con calendario', 'Aviso por WhatsApp al dueño', 'Personalizado con tus colores y servicios', '30 días de soporte incluidos'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-purple-600 font-bold">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
              <p className="text-2xl font-black text-purple-700">$150.000</p>
              <p className="text-xs text-gray-500">Pago único · Listo en 24hs</p>
              <a href="https://wa.me/5492665286110?text=Quiero%20un%20sistema%20de%20turnos%20online"
                target="_blank" rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Consultar
              </a>
            </div>
          </div>
        </div>

        {/* === ASISTENCIA TÉCNICA MENSUAL === */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🛠️</span>
            <div>
              <h3 className="font-black text-gray-900">Asistencia técnica mensual</h3>
              <p className="text-sm text-gray-500">Opcional · Para cualquier producto o proyecto de DIVINIA</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {SOPORTE.map((s) => (
              <div key={s.name} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 text-sm mb-1">{s.name}</h4>
                <p className="text-xl font-black text-gray-800 mb-3">${s.price.toLocaleString('es-AR')}<span className="text-sm font-normal text-gray-400">/mes</span></p>
                <ul className="space-y-1.5">
                  {s.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-indigo-600 font-bold flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Proyectos a medida */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-white font-black text-lg mb-1">¿Necesitás algo a medida?</p>
          <p className="text-gray-400 text-sm mb-4">Agentes IA, automatizaciones, CRM, sistemas multi-agente. Presupuesto sin compromiso en 24hs.</p>
          <a href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20un%20presupuesto%20a%20medida"
            target="_blank" rel="noopener noreferrer"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
            Pedir presupuesto gratis →
          </a>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Pagás con MercadoPago · 50% adelanto, 50% en entrega · Cancelás cuando querés
        </p>
      </div>
    </section>
  )
}
