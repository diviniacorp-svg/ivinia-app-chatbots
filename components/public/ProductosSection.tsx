import Link from 'next/link'

const SERVICIOS = [
  {
    emoji: '💬',
    name: 'Chatbot WhatsApp / Web',
    desc: 'Asistente que atiende consultas 24/7, responde preguntas, toma pedidos y agenda turnos. Se instala en tu web o WhatsApp.',
    precio: 'Desde $150.000',
    tiempo: 'Listo en 48hs',
    popular: false,
    color: 'indigo',
    tag: 'Más pedido',
    showTag: true,
  },
  {
    emoji: '⚙️',
    name: 'Automatización de Procesos',
    desc: 'Eliminá tareas repetitivas: mails automáticos, carga de planillas, reportes, seguimiento de leads. Tu equipo enfocado en lo que importa.',
    precio: 'Desde $120.000',
    tiempo: '2-5 días',
    popular: false,
    color: 'violet',
    tag: '',
    showTag: false,
  },
  {
    emoji: '🤖',
    name: 'Agente IA Personalizado',
    desc: 'Empleado virtual inteligente que atiende clientes, califica leads, genera propuestas y gestiona tu negocio sin supervisión constante.',
    precio: 'Desde $300.000',
    tiempo: '1-2 semanas',
    popular: true,
    color: 'purple',
    tag: 'Alta demanda',
    showTag: true,
  },
  {
    emoji: '📊',
    name: 'CRM con IA',
    desc: 'Base de clientes organizada e inteligente. Sabe a quién llamar, cuándo hacer seguimiento y qué oportunidades priorizar.',
    precio: 'Desde $400.000',
    tiempo: '1-2 semanas',
    popular: false,
    color: 'blue',
    tag: '',
    showTag: false,
  },
  {
    emoji: '🎯',
    name: 'Automatización de Ventas',
    desc: 'Automatizá desde la consulta hasta el cobro. Propuestas automáticas, seguimiento de prospectos, recordatorios y cierre.',
    precio: 'Desde $350.000',
    tiempo: '1-2 semanas',
    popular: false,
    color: 'emerald',
    tag: '',
    showTag: false,
  },
  {
    emoji: '📅',
    name: 'Sistema de Turnos Online',
    desc: 'Página web donde tus clientes reservan turno solos. Eligen servicio, fecha y hora. El aviso te llega por WhatsApp. Sin llamadas.',
    precio: '$150.000',
    tiempo: 'Listo en 24hs',
    popular: false,
    color: 'pink',
    tag: 'Nuevo',
    showTag: true,
  },
]

const COLOR_MAP: Record<string, { bg: string; text: string; bar: string; badge: string }> = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  bar: 'from-indigo-500 to-indigo-700',  badge: 'bg-indigo-100 text-indigo-700' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  bar: 'from-violet-500 to-violet-700',  badge: 'bg-violet-100 text-violet-700' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  bar: 'from-purple-500 to-purple-700',  badge: 'bg-purple-100 text-purple-700' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    bar: 'from-blue-500 to-blue-700',      badge: 'bg-blue-100 text-blue-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'from-emerald-500 to-emerald-700',badge: 'bg-emerald-100 text-emerald-700' },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-700',    bar: 'from-pink-500 to-pink-700',      badge: 'bg-pink-100 text-pink-700' },
}

export default function ProductosSection() {
  return (
    <section id="productos" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Nuestros servicios
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-3">
            Todo lo que tu negocio necesita con IA
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Desde un chatbot básico hasta automatización completa. Implementamos la solución exacta que tu PYME necesita.
          </p>
        </div>

        {/* Grid servicios */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICIOS.map((s) => {
            const c = COLOR_MAP[s.color]
            return (
              <div
                key={s.name}
                className={`relative bg-white rounded-2xl border-2 flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  s.popular ? 'border-purple-300 shadow-md' : 'border-gray-100'
                }`}
              >
                {/* Barra de color */}
                <div className={`h-1 w-full bg-gradient-to-r ${c.bar}`} />

                {/* Badge */}
                {s.showTag && (
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                      {s.tag}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Icon + title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.bg}`}>
                      {s.emoji}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{s.name}</h3>
                  </div>

                  {/* Desc */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{s.desc}</p>

                  {/* Price + tiempo */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className={`text-lg font-black ${c.text}`}>{s.precio}</p>
                      <p className="text-xs text-gray-400">⏱ {s.tiempo}</p>
                    </div>
                    <a
                      href={`https://wa.me/5492665286110?text=Hola%2C%20me%20interesa%20el%20servicio%3A%20${encodeURIComponent(s.name)}`}
                      target="_blank" rel="noopener noreferrer"
                      className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${c.bg} ${c.text} hover:opacity-80`}
                    >
                      Consultar →
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sistema multi-agente — destacado */}
        <div className="mt-5 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">Pack completo</span>
            </div>
            <h3 className="text-white font-black text-xl mb-1">Sistema Multi-Agente</h3>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Múltiples agentes IA coordinados operando tu negocio: atención, ventas, seguimiento, reportes y más. La solución más completa del mercado.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
            <p className="text-white font-black text-2xl">Desde $800.000</p>
            <p className="text-indigo-300 text-xs">⏱ 2-4 semanas</p>
            <a
              href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20info%20sobre%20el%20Sistema%20Multi-Agente"
              target="_blank" rel="noopener noreferrer"
              className="bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors"
            >
              Consultar ahora
            </a>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Todos los servicios incluyen 30 días de soporte post-entrega · Pagás con MercadoPago
        </p>
      </div>
    </section>
  )
}
