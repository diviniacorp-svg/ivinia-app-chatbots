'use client'
import { useState } from 'react'
import Reveal from './Reveal'

const PREGUNTAS = [
  {
    q: '¿Necesito saber de tecnología para usar el Turnero?',
    a: 'No. Joaco configura todo. Vos solo recibís el link y el QR, y los compartís con tus clientes. El sistema funciona solo desde el primer día.',
  },
  {
    q: '¿Qué pasa si quiero cancelar el plan mensual?',
    a: 'Cancelás cuando querés, sin preguntas. No hay permanencia mínima. Si pagás el plan anual y querés salir antes, te devolvemos los meses que no usaste.',
  },
  {
    q: '¿En cuánto tiempo está listo mi Turnero?',
    a: 'En 24 horas hábiles desde que confirmás el pago. Casos simples pueden estar listos el mismo día si hablamos a la mañana.',
  },
  {
    q: '¿Puedo probar antes de pagar?',
    a: 'Sí. Tenés las demos de Rufina Nails, Cantera Boutique y Los Paraísos disponibles arriba para probar de verdad. Si después de probar querés el tuyo, hablamos.',
  },
  {
    q: '¿Qué garantía tienen?',
    a: '90 días de garantía real. Si el sistema no funciona como te prometimos o no notás ninguna mejora en ese período, te devolvemos el dinero. Sin letra chica.',
  },
]

export default function FAQSimple() {
  const [abierta, setAbierta] = useState<number | null>(null)

  return (
    <section style={{
      padding: '80px 0',
      background: 'var(--paper-2)',
      borderTop: '1px solid var(--line)',
    }}>
      <div className="wrap-v2">

        <Reveal>
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>FAQ</div>
            <h2 className="h-title">
              Preguntas<br />
              <em>frecuentes.</em>
            </h2>
          </div>
        </Reveal>

        <div style={{ maxWidth: 720 }}>
          {PREGUNTAS.map((p, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                style={{
                  borderBottom: '1px solid var(--line)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setAbierta(abierta === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    padding: '22px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--ink)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                  }}>
                    {p.q}
                  </span>
                  <span style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 18,
                    color: 'var(--muted)',
                    flexShrink: 0,
                    transform: abierta === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.25s ease',
                    display: 'inline-block',
                  }}>
                    +
                  </span>
                </button>
                <div style={{
                  maxHeight: abierta === i ? 200 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}>
                  <p style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 15,
                    color: 'var(--muted-2)',
                    lineHeight: 1.65,
                    paddingBottom: 20,
                  }}>
                    {p.a}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
