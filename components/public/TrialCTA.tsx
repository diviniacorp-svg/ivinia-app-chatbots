import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Reveal from './Reveal'

export default function TrialCTA() {
  return (
    <section className="py-32 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <div className="bg-indigo-600 rounded-3xl px-10 py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-400 rounded-full blur-2xl translate-y-1/2" />
            </div>
            <div className="relative">
              <p className="text-indigo-300 text-sm font-bold uppercase tracking-[0.15em] mb-6">Empezá hoy</p>
              <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
                Tu negocio,<br />reservando solo
              </h2>
              <p className="text-indigo-200 text-xl mb-12 max-w-md mx-auto leading-relaxed">
                Sin mensualidades. Sin contratos. Un solo pago
                y el sistema es tuyo para siempre.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <a
                  href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20Turnero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black px-10 py-5 rounded-2xl text-lg transition-all shadow-2xl"
                >
                  Ver demo en vivo <ArrowRight size={20} />
                </a>
                <Link
                  href="/trial"
                  className="flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all"
                >
                  Probalo gratis
                </Link>
              </div>
              <p className="text-indigo-300 text-sm">
                Sin tarjeta · Setup en 24hs · Somos de San Luis, Argentina
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
