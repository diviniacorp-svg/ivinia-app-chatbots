import Link from 'next/link'

const steps = [
  { n: '01', emoji: '🎯', title: 'Elegís tu rubro', desc: 'Seleccionás el template para tu negocio: restaurante, clínica, gimnasio y más.' },
  { n: '02', emoji: '⚙️', title: 'Lo personalizamos', desc: 'En 24hs cargamos tu info: nombre del negocio, horarios, precios, preguntas frecuentes.' },
  { n: '03', emoji: '🚀', title: 'Lo instalás y listo', desc: 'Pegás una línea de código en tu web y el chatbot empieza a atender al instante.' },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Cómo funciona</h2>
          <p className="text-gray-500 text-lg">Tres pasos y tu negocio empieza a atender solo</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((s, i) => (
            <div key={s.n} className="bg-white rounded-2xl p-7 border border-gray-200 text-center">
              <div className="text-4xl mb-4">{s.emoji}</div>
              <div className="text-xs font-bold text-indigo-500 tracking-widest uppercase mb-2">Paso {s.n}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/trial"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-indigo-100">
            Empezá gratis hoy →
          </Link>
          <p className="text-gray-400 text-sm mt-3">Sin tarjeta · Instalación incluida · Cancelás cuando querés</p>
        </div>
      </div>
    </section>
  )
}
