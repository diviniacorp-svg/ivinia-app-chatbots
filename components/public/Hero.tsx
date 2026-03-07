import Link from 'next/link'
import { ArrowRight, Star, MessageCircle } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-24 pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-1.5 rounded-full text-sm font-medium">
            ⚡ Hecho en San Luis, Argentina · Usado por PYMEs argentinas
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
          Tu negocio atiende{' '}
          <span className="text-indigo-600">solo, las 24 horas</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-center text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Instalamos un chatbot con IA en tu web o WhatsApp. Responde consultas,
          agenda turnos y cierra ventas <span className="text-gray-900 font-semibold">mientras dormís</span>.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link href="/trial"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-indigo-100">
            Probá gratis 14 días <ArrowRight size={18} />
          </Link>
          <a href="https://wa.me/5492665286110?text=Hola%2C%20quiero%20ver%20una%20demo"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:bg-gray-50">
            <MessageCircle size={18} className="text-green-500" /> Ver demo por WhatsApp
          </a>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 mb-16">
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
            <span>5/5 clientes satisfechos</span>
          </div>
          <span>·</span>
          <span>Sin tarjeta de crédito</span>
          <span>·</span>
          <span>Instalación en 24hs</span>
        </div>

        {/* Browser mockup */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white">
            {/* Barra del navegador */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded border border-gray-200 px-3 py-1 text-xs text-gray-400 text-center">
                tu-negocio.com.ar
              </div>
            </div>

            {/* Contenido del sitio simulado */}
            <div className="bg-gray-50 px-8 py-10 flex items-center justify-center min-h-[140px]">
              <div className="text-center">
                <div className="w-32 h-3 bg-gray-200 rounded mx-auto mb-3" />
                <div className="w-48 h-2 bg-gray-200 rounded mx-auto mb-2" />
                <div className="w-40 h-2 bg-gray-200 rounded mx-auto" />
              </div>
            </div>

            {/* Chat widget — barra inferior del sitio */}
            <div className="border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">D</div>
                <div>
                  <p className="text-white text-sm font-semibold">Asistente DIVINIA</p>
                  <p className="text-indigo-200 text-xs">● En línea ahora</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">D</div>
                  <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 px-4 py-3 max-w-xs shadow-sm">
                    <p className="text-gray-800 text-sm">¡Hola! ¿En qué puedo ayudarte hoy? 😊 Preguntame sobre horarios, precios o reservas.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">
                    Escribí tu mensaje...
                  </div>
                  <div className="bg-indigo-600 text-white rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">➤</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
