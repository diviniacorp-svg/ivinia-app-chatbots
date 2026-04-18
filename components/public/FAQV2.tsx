'use client'
import { useState } from 'react'

const faqs = [
  { q: '¿Necesito instalar algo?', a: 'No. Turnero es 100% online. Tus clientes entran al link desde el celular, sin descargar nada. Vos gestionás todo desde el panel web, también sin instalar nada.' },
  { q: '¿Cómo llegan los turnos?', a: 'Cuando un cliente reserva, te llega una notificación por WhatsApp con todos los datos: nombre, servicio, día y hora. También los ves en el panel de gestión.' },
  { q: '¿El cliente necesita crear una cuenta?', a: 'No. Hace click en el link, elige el servicio y el horario, deja su nombre y WhatsApp, y listo. Sin contraseñas ni registros de ningún tipo.' },
  { q: '¿Funciona para múltiples profesionales o sucursales?', a: 'Sí. En los planes Pro y Enterprise podés tener múltiples profesionales con sus propias agendas y múltiples sucursales. Consultanos por tu caso particular.' },
  { q: '¿Qué pasa si necesito cancelar un turno?', a: 'Lo cancelás desde el panel con un click. El sistema puede notificar al cliente automáticamente por WhatsApp si así lo configuramos.' },
  { q: '¿Por qué es pago único y no mensual?', a: 'Porque los dueños de PYMEs en Argentina no necesitan otro gasto mensual que no para. Pagás una vez y el sistema es tuyo para siempre, con soporte incluido.' },
  { q: '¿Cómo se paga?', a: 'Pagás con MercadoPago en pesos argentinos. Aceptamos tarjeta de débito, crédito, dinero en cuenta y transferencia.' },
  { q: '¿En cuánto tiempo está listo?', a: 'En 24hs hábiles. Nos mandás los datos (servicios, horarios, precios) y nosotros lo configuramos todo.' },
]

export default function FAQV2() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
      <div className="wrap-v2">

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80 }}
          className="grid-cols-1 md:grid-cols-2">

          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>FAQ</div>
            <h2 className="h-display" style={{ fontSize: 'clamp(40px, 5vw, 72px)', color: 'var(--ink)' }}>
              Preguntas<br />
              <em>frecuentes.</em>
            </h2>
          </div>

          <div>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', padding: '24px 0', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', gap: 20,
                  }}
                >
                  <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 17, color: 'var(--ink)', lineHeight: 1.3 }}>
                    {f.q}
                  </span>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 20, color: 'var(--muted)',
                    transform: open === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s', flexShrink: 0,
                  }}>+</span>
                </button>
                {open === i && (
                  <div style={{
                    paddingBottom: 24, fontSize: 15, lineHeight: 1.65,
                    color: 'var(--muted-2)', fontFamily: 'var(--f-display)',
                  }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
