import Link from 'next/link'
import Reveal from './Reveal'

const PASOS = [
  {
    num: '01',
    titulo: 'Hablamos 15 minutos',
    descripcion: 'Me contás tu negocio, qué servicios ofrecés y cómo querés que funcione. Por WhatsApp o videollamada, como prefieras.',
    icono: '💬',
    duracion: 'Hoy mismo',
  },
  {
    num: '02',
    titulo: 'Configuramos todo',
    descripcion: 'Armo tu página de reservas personalizada con tus servicios, horarios, profesionales y tu marca. Vos no tocás nada.',
    icono: '⚙️',
    duracion: 'En 24hs',
  },
  {
    num: '03',
    titulo: 'Tus clientes ya reservan',
    descripcion: 'Te mando el link y el QR. Lo compartís en tus redes y lo pegás en el local. Listo, el sistema trabaja solo.',
    icono: '🚀',
    duracion: 'Al día siguiente',
  },
]

export default function ProcesoSimple() {
  return (
    <section id="proceso" style={{
      padding: '100px 0',
      background: 'var(--ink)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="wrap-v2">

        <Reveal>
          <div style={{ display: 'grid', gap: 40, marginBottom: 64 }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 16, color: 'rgba(246,245,242,0.35)' }}>
                Cómo funciona — 05/05
              </div>
              <h2 className="h-title" style={{ color: 'var(--paper)' }}>
                Tres pasos.<br />
                <em>Un día.</em>
              </h2>
            </div>
            <p style={{
              alignSelf: 'end',
              fontSize: 18,
              lineHeight: 1.55,
              color: 'rgba(246,245,242,0.45)',
              fontFamily: 'var(--f-display)',
              maxWidth: '50ch',
            }}>
              No necesitás saber de tecnología. No tenés que instalar nada.
              Joaco configura todo personalmente y te entrega el sistema funcionando.
            </p>
          </div>
        </Reveal>

        {/* Línea de tiempo */}
        <div style={{
          display: 'grid',
          gap: 2,
          position: 'relative',
        }}
          className="grid-cols-3-mobile-1 md:grid-cols-3"
        >
          {PASOS.map((p, i) => (
            <Reveal key={p.num} delay={i * 120}>
              <div style={{
                background: i === 1 ? 'rgba(198,255,61,0.06)' : 'rgba(246,245,242,0.03)',
                border: i === 1
                  ? '1px solid rgba(198,255,61,0.2)'
                  : '1px solid rgba(246,245,242,0.07)',
                borderRadius: 20,
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                height: '100%',
              }}>
                {/* Número y ícono */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: i === 1 ? 'var(--lime)' : 'rgba(246,245,242,0.25)',
                    textTransform: 'uppercase',
                  }}>
                    {p.num}
                  </span>
                  <span style={{ fontSize: 28 }}>{p.icono}</span>
                </div>

                {/* Duración badge */}
                <div style={{
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  background: i === 1 ? 'rgba(198,255,61,0.15)' : 'rgba(246,245,242,0.06)',
                  borderRadius: 100,
                  padding: '4px 12px',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: i === 1 ? 'var(--lime)' : 'rgba(246,245,242,0.3)',
                }}>
                  {p.duracion}
                </div>

                <h3 style={{
                  fontFamily: 'var(--f-display)',
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'var(--paper)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}>
                  {p.titulo}
                </h3>

                <p style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 14,
                  color: 'rgba(246,245,242,0.45)',
                  lineHeight: 1.65,
                  flex: 1,
                }}>
                  {p.descripcion}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA debajo del proceso */}
        <Reveal delay={300}>
          <div style={{
            marginTop: 48,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Link
              href="/onboarding"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--lime)',
                color: 'var(--ink)',
                borderRadius: 12,
                padding: '16px 28px',
                fontFamily: 'var(--f-mono)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Empezar el paso 1 ahora →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
