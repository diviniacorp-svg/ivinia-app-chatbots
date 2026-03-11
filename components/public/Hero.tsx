import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'

const STATS = [
  { value: '24/7', label: 'Atención sin descanso' },
  { value: '48hs', label: 'Implementación express' },
  { value: '70%', label: 'Ahorro en costos operativos' },
  { value: '∞', label: 'Escalabilidad sin contratar' },
]

export default function Hero() {
  return (
    <section className="pt-24 pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-1.5 rounded-full text-sm font-medium">
            ⚡ Agencia de IA · San Luis, Argentina · Para PYMEs
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
          Tu negocio operando con{' '}
          <span className="text-indigo-600">Inteligencia Artificial</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-center text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Automatizamos la atención al cliente, las ventas y los procesos de tu empresa con IA.{' '}
          <span className="text-gray-900 font-semibold">Resultados en días, no meses.</span>{' '}
          Para PYMEs que quieren crecer.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <a
            href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20una%20consulta%20gratuita%20de%2015%20minutos"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-indigo-100">
            Consulta gratuita de 15 min <ArrowRight size={18} />
          </a>
          <Link href="/trial"
            className="flex items-center gap-2 border border-gray-200 hover:border-indigo-300 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:bg-indigo-50">
            <span className="text-indigo-600">🤖</span> Probar chatbot gratis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
          {STATS.map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-indigo-600 mb-1">{s.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Proceso en 4 pasos — compacto */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 max-w-3xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center mb-4">Cómo trabajamos</p>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { n: '1', title: 'Charlamos', desc: '15 min por WhatsApp o videollamada' },
              { n: '2', title: 'Te proponemos', desc: 'Propuesta en 24hs con precio y timeline' },
              { n: '3', title: 'Lo construimos', desc: 'El equipo implementa mientras operás' },
              { n: '4', title: 'Listo, funciona', desc: 'Entrega, capacitación y 30 días de soporte' },
            ].map((step) => (
              <div key={step.n} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-3 sm:gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
