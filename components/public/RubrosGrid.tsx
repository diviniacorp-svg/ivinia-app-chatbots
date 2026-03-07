import Link from 'next/link'
import { RUBROS_INFO } from '@/lib/templates-data'

export default function RubrosGrid() {
  return (
    <section id="rubros" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Chatbots para tu rubro</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Templates listos para 8 rubros. Instalación en 24hs.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {RUBROS_INFO.map((r) => (
            <Link key={r.rubro} href={`/trial?rubro=${r.rubro}`}
              className="group flex flex-col items-center text-center p-5 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                style={{ backgroundColor: r.color + '18' }}>
                {r.emoji}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {r.name.replace('Chatbot para ', '')}
              </h3>
            </Link>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">
          ¿Tu rubro no está?{' '}
          <a href="https://wa.me/5492665286110?text=Necesito%20un%20chatbot%20para%20mi%20rubro"
            target="_blank" rel="noopener noreferrer"
            className="text-indigo-600 font-semibold hover:underline">
            Escribinos y te hacemos uno a medida →
          </a>
        </p>
      </div>
    </section>
  )
}
