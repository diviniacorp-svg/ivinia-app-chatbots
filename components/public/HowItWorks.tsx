import Link from 'next/link'
import Reveal from './Reveal'

const steps = [
  {
    n: '01',
    title: 'Registrate en 2 minutos',
    desc: 'Solo tu email y el nombre de tu negocio. Sin formularios complicados.',
  },
  {
    n: '02',
    title: 'Configuramos tu agenda',
    desc: 'Cargamos tus servicios, horarios y precios. Lo hacemos nosotros en 24hs.',
  },
  {
    n: '03',
    title: 'Tus clientes empiezan a reservar',
    desc: 'Mandás el link por WhatsApp o Instagram. Listo, los turnos llegan solos.',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-32 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-6">

        <Reveal>
          <div className="mb-20">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.15em] mb-4">Simple y rápido</p>
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
              Setup en 24hs,<br />no en semanas
            </h2>
            <p className="text-xl text-gray-500 max-w-lg">
              Tres pasos y tu negocio empieza a tomar turnos solo.
              Sin código. Sin instalaciones raras.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                <p className="text-7xl font-black text-gray-100 group-hover:text-indigo-100 transition-colors leading-none mb-6 select-none">
                  {s.n}
                </p>
                <h3 className="font-black text-xl text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="text-center">
            <Link
              href="/trial"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all shadow-xl shadow-indigo-200"
            >
              Empezar ahora →
            </Link>
            <p className="text-gray-400 text-sm mt-4">Sin tarjeta · Setup incluido · Cancelás cuando querés</p>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
