'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Reveal from './Reveal'

const faqs = [
  {
    q: '¿Necesito instalar algo?',
    a: 'No. Turnero es 100% online. Tus clientes entran al link desde el celular, sin descargar nada. Y vos gestionás todo desde el panel web, también sin instalar nada.',
  },
  {
    q: '¿Cómo llegan los turnos?',
    a: 'Cuando un cliente reserva, te llega una notificación por WhatsApp con todos los datos: nombre, servicio, día y hora. También podés verlos en el panel de gestión.',
  },
  {
    q: '¿El cliente necesita crear una cuenta para reservar?',
    a: 'No. Hace click en el link, elige el servicio y el horario, deja su nombre y WhatsApp, y listo. Sin contraseñas ni registros.',
  },
  {
    q: '¿Qué pasa si tengo que cancelar un turno?',
    a: 'Lo cancelás desde el panel con un click. El sistema puede notificar al cliente automáticamente por WhatsApp si así lo configuramos.',
  },
  {
    q: '¿Es difícil configurarlo?',
    a: 'Nosotros lo configuramos por vos. Solo necesitamos que nos digas tus servicios, precios y horarios. En 24hs está listo.',
  },
  {
    q: '¿Por qué es pago único y no mensual?',
    a: 'Porque los dueños de PYMEs en Argentina no necesitan otro gasto mensual que no para. Pagás una vez y el sistema es tuyo para siempre, con soporte incluido.',
  },
  {
    q: '¿Funciona para múltiples profesionales o sucursales?',
    a: 'Sí, en los planes Pro y Enterprise podés tener múltiples profesionales con sus propias agendas, y también múltiples sucursales. Consultanos por tu caso.',
  },
  {
    q: '¿Cómo se paga?',
    a: 'Pagás con MercadoPago en pesos argentinos. Aceptamos tarjeta de débito, crédito, dinero en cuenta y transferencia.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-32 bg-gray-50 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-6">

        <Reveal>
          <div className="mb-16">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.15em] mb-4">FAQ</p>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-xl text-gray-500">Lo que todo el mundo pregunta antes de arrancar.</p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 40}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {open === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-500 leading-relaxed text-base">{faq.a}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
