'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: '¿Necesito saber programación para instalar el chatbot?',
    a: 'No. Nosotros hacemos todo. Solo necesitás acceso a tu sitio web para pegar una línea de código, como si fuera un pixel de publicidad. Si no podés hacerlo vos, te ayudamos nosotros.',
  },
  {
    q: '¿Cómo funciona el chatbot?',
    a: 'El chatbot usa inteligencia artificial (Claude de Anthropic) para entender las preguntas de tus clientes y responderlas en base a la información que vos nos des: horarios, precios, menú, servicios, etc.',
  },
  {
    q: '¿Qué pasa si el chatbot no sabe responder algo?',
    a: 'El chatbot está configurado para derivar al humano cuando no sabe la respuesta, ya sea por WhatsApp, teléfono o email. Nunca deja al cliente sin respuesta.',
  },
  {
    q: '¿Puedo probarlo antes de pagar?',
    a: 'Sí, tenés 14 días gratis sin tarjeta de crédito. Te instalamos el chatbot en tu negocio y lo probás con clientes reales. Después decidís si continuás.',
  },
  {
    q: '¿Funciona en WhatsApp también?',
    a: 'El plan básico incluye el chatbot en tu web. La integración con WhatsApp está disponible en los planes Pro y Enterprise. Consultanos por la disponibilidad para tu caso.',
  },
  {
    q: '¿Cuánto tiempo tarda en estar listo?',
    a: 'Entre 24 y 48 horas hábiles desde que nos confirmás los datos de tu negocio. Si tenés urgencia, escribinos y tratamos de agilizarlo.',
  },
  {
    q: '¿Puedo cancelar cuando quiero?',
    a: 'Sí, cancelás cuando querés sin penalidades. El chatbot deja de funcionar al finalizar el período abonado.',
  },
  {
    q: '¿Cómo se paga?',
    a: 'Pagás con MercadoPago en pesos argentinos. Aceptamos tarjeta de débito, crédito, dinero en cuenta y Mercado Crédito.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
