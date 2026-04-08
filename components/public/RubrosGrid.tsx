import Reveal from './Reveal'

const RUBROS_ROW1 = [
  { emoji: '✂️', name: 'Peluquerías' },
  { emoji: '💆', name: 'Estéticas' },
  { emoji: '💪', name: 'Gimnasios' },
  { emoji: '🦷', name: 'Odontólogos' },
  { emoji: '🏥', name: 'Clínicas' },
  { emoji: '🐾', name: 'Veterinarias' },
  { emoji: '💇', name: 'Barbershops' },
  { emoji: '💅', name: 'Manicuras' },
  { emoji: '🧘', name: 'Yoga / Pilates' },
  { emoji: '🏋️', name: 'Entrenadores' },
  { emoji: '👁️', name: 'Oftalmólogos' },
  { emoji: '🧴', name: 'Dermatólogos' },
]

const RUBROS_ROW2 = [
  { emoji: '🔧', name: 'Talleres mecánicos' },
  { emoji: '🏨', name: 'Hoteles' },
  { emoji: '📊', name: 'Contadores' },
  { emoji: '⚖️', name: 'Abogados' },
  { emoji: '🏠', name: 'Inmobiliarias' },
  { emoji: '🚀', name: 'Agencias' },
  { emoji: '💊', name: 'Farmacias' },
  { emoji: '🎨', name: 'Tatuadores' },
  { emoji: '📸', name: 'Fotógrafos' },
  { emoji: '🎭', name: 'Psicólogos' },
  { emoji: '🦴', name: 'Kinesiólogos' },
  { emoji: '🍽️', name: 'Restaurantes' },
]

// Duplicar para el efecto de loop continuo
const ROW1_LOOP = [...RUBROS_ROW1, ...RUBROS_ROW1]
const ROW2_LOOP = [...RUBROS_ROW2, ...RUBROS_ROW2]

export default function RubrosGrid() {
  return (
    <section id="rubros" className="py-32 bg-gray-950 overflow-hidden">
      <div className="mb-16 px-6">
        <Reveal>
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm font-bold text-indigo-400 uppercase tracking-[0.15em] mb-4">Para todos los rubros</p>
            <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
              Si tenés agenda,<br />
              <span className="text-indigo-400">Turnero es para vos</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto">
              Más de 20 rubros distintos. Todos usan el mismo sistema.
              Setup en 24hs, funciona desde el día uno.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Marquee — fila 1 (izquierda a derecha) */}
      <div className="relative mb-4 overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10" />
        <div className="flex marquee-track gap-4" style={{ width: 'max-content' }}>
          {ROW1_LOOP.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-indigo-500 hover:bg-indigo-950/40 rounded-2xl px-5 py-3.5 transition-all cursor-default select-none whitespace-nowrap"
            >
              <span className="text-xl">{r.emoji}</span>
              <span className="text-white font-semibold text-sm">{r.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee — fila 2 (derecha a izquierda) */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10" />
        <div className="flex marquee-track-reverse gap-4" style={{ width: 'max-content' }}>
          {ROW2_LOOP.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-indigo-500 hover:bg-indigo-950/40 rounded-2xl px-5 py-3.5 transition-all cursor-default select-none whitespace-nowrap"
            >
              <span className="text-xl">{r.emoji}</span>
              <span className="text-white font-semibold text-sm">{r.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Reveal delay={200}>
        <div className="text-center mt-16 px-6">
          <p className="text-gray-500 text-sm mb-4">¿Tu rubro no aparece?</p>
          <a
            href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20Turnero%20para%20mi%20negocio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all"
          >
            Consultanos →
          </a>
        </div>
      </Reveal>
    </section>
  )
}
