import Link from 'next/link'

const plans = [
  {
    name: 'Básico', price: 50000, desc: 'Para negocios que arrancan con IA', popular: false,
    features: ['Chatbot en tu web','IA 24/7','Template de tu rubro','Hasta 500 conversaciones/mes','Configuración incluida','Soporte WhatsApp'],
    cta: 'Empezar gratis', href: '/trial',
  },
  {
    name: 'Pro', price: 100000, desc: 'Para negocios que quieren más', popular: true,
    features: ['Todo lo del plan Básico','Conversaciones ilimitadas','Integración con turnos','Respuestas avanzadas','Reportes mensuales','Soporte prioritario'],
    cta: 'Empezar gratis', href: '/trial',
  },
  {
    name: 'Enterprise', price: 200000, desc: 'Solución completa', popular: false,
    features: ['Todo lo del plan Pro','Multi-sucursal','Integración API','CRM y automatizaciones','Capacitación del equipo','Soporte dedicado 24/7'],
    cta: 'Hablar con ventas', href: 'https://wa.me/5492665286110?text=Quiero%20info%20Enterprise',
  },
]

export default function PricingCards() {
  return (
    <section id="precios" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Precios en pesos argentinos</h2>
          <p className="text-gray-500 text-lg">14 días gratis en todos los planes. Sin tarjeta.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name}
              className={`rounded-2xl p-7 flex flex-col border ${p.popular ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              {p.popular && (
                <div className="text-center mb-4">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</span>
                </div>
              )}
              <div className="mb-5">
                <h3 className={`font-bold text-xl mb-1 ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                <p className={`text-sm ${p.popular ? 'text-indigo-200' : 'text-gray-500'}`}>{p.desc}</p>
              </div>
              <div className={`pb-5 mb-5 border-b ${p.popular ? 'border-indigo-500' : 'border-gray-100'}`}>
                <span className={`text-4xl font-black ${p.popular ? 'text-white' : 'text-gray-900'}`}>
                  ${p.price.toLocaleString('es-AR')}
                </span>
                <span className={`text-sm ml-1 ${p.popular ? 'text-indigo-200' : 'text-gray-400'}`}>ARS/mes</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${p.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
                    <span className={`font-bold flex-shrink-0 mt-0.5 ${p.popular ? 'text-green-300' : 'text-indigo-600'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href}
                className={`block text-center font-bold py-3 rounded-xl transition-all text-sm ${p.popular ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-sm mt-8">
          Precios en ARS · Pagá con MercadoPago · Cancelás cuando querés
        </p>
      </div>
    </section>
  )
}
