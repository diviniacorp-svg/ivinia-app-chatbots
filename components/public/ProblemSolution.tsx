const problems = [
  'Clientes preguntan fuera de horario y nadie responde',
  'Tu equipo pierde horas respondiendo lo mismo todos los días',
  'La competencia que responde más rápido se lleva la venta',
  'Para sacar turno hay que llamar, esperar, o volver a intentar',
  'No podés crecer sin contratar más personal',
]
const solutions = [
  'El chatbot responde al instante, 24/7, los 365 días del año',
  'Se encarga solo de las preguntas frecuentes sin intervención',
  'Respondés primero y cerrás más ventas automáticamente',
  'Los clientes reservan turno solos desde el teléfono, en segundos',
  'Escalás tu negocio sin sumar costos fijos de personal',
]

export default function ProblemSolution() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">¿Te identificás con esto?</h2>
          <p className="text-gray-500 text-lg">Lo que le pasa a la mayoría de los negocios en Argentina</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl">😤</div>
              <h3 className="font-bold text-xl text-gray-900">Sin automatización</h3>
            </div>
            <ul className="space-y-3">
              {problems.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                  <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">✕</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🚀</div>
              <h3 className="font-bold text-xl">Con DIVINIA</h3>
            </div>
            <ul className="space-y-3">
              {solutions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-indigo-100 text-sm leading-relaxed">
                  <span className="text-green-300 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
