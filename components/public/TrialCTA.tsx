import Link from 'next/link'

export default function TrialCTA() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-indigo-600 rounded-3xl px-8 py-16">
          <div className="text-5xl mb-5">🤖</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Empezá hoy, gratis</h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-md mx-auto">
            14 días para probar el chatbot con tus clientes reales. Sin tarjeta, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/trial"
              className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg">
              Quiero mi chatbot gratis →
            </Link>
            <a href="https://wa.me/5492665286110?text=Quiero%20empezar%20la%20prueba"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all">
              💬 Hablar con Joaco
            </a>
          </div>
          <p className="text-indigo-300 text-sm mt-6">Sin tarjeta · Sin contrato · Cancelás cuando querés</p>
        </div>
      </div>
    </section>
  )
}
