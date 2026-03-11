import Link from 'next/link'

const DISPONIBLES = [
  {
    emoji: '💬',
    name: 'Chatbot WhatsApp / Web',
    desc: 'Asistente que atiende consultas 24/7, responde preguntas, toma pedidos y agenda turnos. Se instala en tu web o WhatsApp en 48hs.',
    precio: 'Desde $50.000/mes',
    tiempo: 'Listo en 48hs',
    tag: 'Más pedido',
    color: 'indigo',
    href: '/trial',
    ctaLabel: 'Probar gratis 14 días',
    internal: true,
  },
  {
    emoji: '📅',
    name: 'Sistema de Turnos Online',
    desc: 'Página web donde tus clientes reservan turno solos. Eligen servicio, fecha y hora. El aviso te llega por WhatsApp. Sin llamadas, sin papeles.',
    precio: '$150.000 pago único',
    tiempo: 'Listo en 24hs',
    tag: 'Nuevo',
    color: 'purple',
    href: 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20un%20sistema%20de%20turnos%20online',
    ctaLabel: 'Consultar ahora',
    internal: false,
  },
]

const PROXIMOS = [
  { emoji: '⚙️', name: 'Automatización de Procesos', desc: 'Eliminá tareas repetitivas: mails automáticos, reportes, seguimiento de leads.' },
  { emoji: '🤖', name: 'Agente IA Personalizado', desc: 'Empleado virtual que atiende clientes, califica leads y gestiona tu negocio.' },
  { emoji: '📊', name: 'CRM con IA', desc: 'Base de clientes inteligente. Sabe a quién llamar y cuándo hacer seguimiento.' },
  { emoji: '🎯', name: 'Automatización de Ventas', desc: 'Desde la consulta hasta el cobro. Propuestas automáticas y cierre asistido.' },
  { emoji: '🚀', name: 'Sistema Multi-Agente', desc: 'Múltiples agentes IA coordinados operando toda tu empresa de forma autónoma.' },
]

const COLOR_MAP: Record<string, { bg: string; text: string; bar: string; badge: string; btn: string }> = {
  indigo: {
    bg: 'bg-indigo-50', text: 'text-indigo-700',
    bar: 'from-indigo-500 to-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  purple: {
    bg: 'bg-purple-50', text: 'text-purple-700',
    bar: 'from-purple-500 to-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
}

export default function ProductosSection() {
  return (
    <section id="productos" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Disponible ahora
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-3">
            Productos listos para tu negocio
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Implementamos en horas, no meses. Resultados reales desde el primer día.
          </p>
        </div>

        {/* Productos disponibles */}
        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          {DISPONIBLES.map((s) => {
            const c = COLOR_MAP[s.color]
            return (
              <div
                key={s.name}
                className="relative bg-white rounded-2xl border-2 border-gray-100 flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${c.bar}`} />
                <div className="absolute top-5 right-5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{s.tag}</span>
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${c.bg}`}>
                      {s.emoji}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{s.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{s.desc}</p>
                  <div className="pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className={`text-lg font-black ${c.text}`}>{s.precio}</p>
                        <p className="text-xs text-gray-400">⏱ {s.tiempo}</p>
                      </div>
                    </div>
                    {s.internal ? (
                      <Link
                        href={s.href}
                        className={`block text-center font-bold py-3 rounded-xl text-sm transition-colors ${c.btn}`}
                      >
                        {s.ctaLabel}
                      </Link>
                    ) : (
                      <a
                        href={s.href}
                        target="_blank" rel="noopener noreferrer"
                        className={`block text-center font-bold py-3 rounded-xl text-sm transition-colors ${c.btn}`}
                      >
                        {s.ctaLabel}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Próximamente */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Próximamente</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROXIMOS.map((s) => (
              <div key={s.name} className="bg-white border border-gray-100 rounded-xl p-4 opacity-70">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{s.emoji}</span>
                  <h4 className="font-bold text-gray-700 text-sm">{s.name}</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  En desarrollo
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">
            ¿Necesitás algo ya? Escribinos y vemos cómo ayudarte →{' '}
            <a
              href="https://wa.me/5492665286110?text=Hola%2C%20necesito%20un%20servicio%20personalizado"
              target="_blank" rel="noopener noreferrer"
              className="text-indigo-500 font-medium hover:underline"
            >
              Consulta sin compromiso
            </a>
          </p>
        </div>

      </div>
    </section>
  )
}
