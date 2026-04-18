import Reveal from './Reveal'
import LeadCaptureForm from './LeadCaptureForm'
import { ArrowRight } from 'lucide-react'

const SERVICIOS = [
  { emoji: '📅', nombre: 'Turnero', desc: 'Reservas online + seña MercadoPago', precio: 'desde $43.000/mes' },
  { emoji: '🤖', nombre: 'Chatbot WA', desc: 'Atención automática 24/7 por WhatsApp', precio: 'desde $150.000' },
  { emoji: '🎬', nombre: 'Content Factory', desc: 'Posts, reels y diseño IA para redes', precio: 'desde $80.000/mes' },
  { emoji: '⚡', nombre: 'Automatizaciones', desc: 'Flujos inteligentes para tu negocio', precio: 'desde $120.000' },
  { emoji: '💻', nombre: 'Web & Apps', desc: 'Sitios y apps con IA integrada', precio: 'desde $100.000' },
  { emoji: '🧠', nombre: 'NUCLEUS', desc: 'Sistema operativo IA completo para tu empresa', precio: 'desde $800.000' },
]

const DEMOS = [
  { rubro: 'Peluquería', emoji: '✂️', path: '/reservas/rufina' },
  { rubro: 'Estética', emoji: '💅', path: '/reservas/estetica' },
  { rubro: 'Odontología', emoji: '🦷', path: '/reservas/odontologia' },
  { rubro: 'Gimnasio', emoji: '💪', path: '/reservas/gimnasio' },
]

export default function NucleusSection() {
  return (
    <>
      {/* Servicios */}
      <section className="py-24 bg-[#09090b] border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🧠 Servicios DIVINIA
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                Todo lo que tu negocio necesita.<br />
                <span className="text-violet-400">Con IA real.</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-lg mx-auto">
                Desde un sistema de turnos hasta un sistema operativo IA completo para tu empresa.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {SERVICIOS.map((s, i) => (
              <Reveal key={s.nombre} delay={i * 60}>
                <div className={`rounded-2xl p-6 border transition-all hover:-translate-y-0.5 ${
                  s.nombre === 'NUCLEUS'
                    ? 'bg-gradient-to-br from-violet-900/40 to-pink-900/20 border-violet-500/40'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}>
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <h3 className={`font-bold text-lg mb-1 ${s.nombre === 'NUCLEUS' ? 'text-violet-300' : 'text-white'}`}>
                    {s.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{s.desc}</p>
                  <p className={`text-sm font-bold ${s.nombre === 'NUCLEUS' ? 'text-violet-400' : 'text-emerald-400'}`}>
                    {s.precio}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Demos por rubro */}
          <Reveal>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <p className="text-white font-bold text-lg mb-2">Probá la demo de tu rubro</p>
              <p className="text-gray-400 text-sm mb-6">Así ve el turno tu cliente. Sistema real, no una maqueta.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DEMOS.map(d => (
                  <a
                    key={d.rubro}
                    href={d.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-4 px-3 transition-all group"
                  >
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="text-white text-sm font-semibold">{d.rubro}</span>
                    <ArrowRight size={14} className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NUCLEUS — para empresas y gobierno */}
      <section className="py-24 bg-gradient-to-b from-[#09090b] to-violet-950/20 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🧠 Para empresas y organismos del Estado
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                DIVINIA NUCLEUS
              </h2>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
                Un sistema operativo de IA completo para tu organización.
                Agentes autónomos que trabajan 24/7 en ventas, operaciones, contenido y finanzas.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid sm:grid-cols-3 gap-4 mb-12">
              {[
                { titulo: 'PYMEs', precio: 'desde $800.000', desc: 'Turnero + Chatbot + Content + Automatizaciones integrados', badge: null },
                { titulo: 'Empresas', precio: 'desde $3.000.000', desc: 'Sistema multi-agente completo con departamentos IA', badge: 'Popular' },
                { titulo: 'Gobierno', precio: 'A cotizar', desc: 'Sistemas IA para organismos públicos. Licitación disponible.', badge: null },
              ].map(p => (
                <div key={p.titulo} className={`relative rounded-2xl p-6 border ${
                  p.badge ? 'bg-violet-900/40 border-violet-500/50' : 'bg-gray-900 border-gray-800'
                }`}>
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-lg mb-1">{p.titulo}</h3>
                  <p className="text-violet-400 font-bold text-xl mb-3">{p.precio}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Formulario de captura */}
      <section id="demo" className="py-24 bg-[#09090b] border-t border-gray-800/50">
        <div className="max-w-xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Pedí tu demo gratis
              </h2>
              <p className="text-gray-400">
                Te mostramos el sistema con tu negocio real en 15 minutos.
                Sin compromiso, sin tarjeta.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <LeadCaptureForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
