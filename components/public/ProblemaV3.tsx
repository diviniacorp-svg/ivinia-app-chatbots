import Reveal from './Reveal'

const DOLORES = [
  {
    num: '01',
    icon: '📵',
    titulo: 'Perdés clientes por no contestar',
    descripcion: 'Un cliente manda WhatsApp a las 10pm para sacar turno. No contestás hasta mañana. Para entonces ya llamó a la competencia.',
    solucion: 'Con Turnero, tu cliente reserva solo en 60 segundos. A cualquier hora. Sin que vos hagas nada.',
    color: '#FF5E3A',
  },
  {
    num: '02',
    icon: '⏰',
    titulo: 'Tu día se va coordinando turnos',
    descripcion: 'Mensajes de "¿tenés para el jueves?", "cambiame el turno", "¿a qué hora podés?". Horas perdidas en logística, no en tu trabajo.',
    solucion: 'El sistema gestiona confirmaciones, cancelaciones y recordatorios automáticamente. Vos no intervenís.',
    color: '#F59E0B',
  },
  {
    num: '03',
    icon: '💸',
    titulo: 'No-shows que te cuestan plata',
    descripcion: 'Te bloquean el horario y no aparecen. Sin posibilidad de cobrar seña antes porque "es incómodo pedirla por mensaje".',
    solucion: 'El Turnero cobra seña online automáticamente al reservar. Sin incomo­didad, sin ausentes.',
    color: '#8B5CF6',
  },
]

export default function ProblemaV3() {
  return (
    <section
      id="problema"
      style={{
        padding: '100px 0',
        background: 'var(--paper-2)',
        borderTop: '1px solid var(--line)',
      }}
    >
      <div className="wrap-v2">
        <Reveal>
          <div style={{ marginBottom: 64 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>El problema real</div>
            <h2 className="h-title" style={{ maxWidth: '20ch' }}>
              Sin sistema,<br />
              <em>el tiempo se escapa.</em>
            </h2>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gap: 16 }}
          className="grid-cols-3-mobile-1 md:grid-cols-3">
          {DOLORES.map((d, i) => (
            <Reveal key={d.num} delay={i * 120}>
              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 20,
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                height: '100%',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 36 }}>{d.icon}</span>
                  <span style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                  }}>
                    {d.num}
                  </span>
                </div>

                {/* Dolor */}
                <div>
                  <h3 style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 700,
                    fontSize: 20,
                    color: 'var(--ink)',
                    letterSpacing: '-0.02em',
                    marginBottom: 10,
                    lineHeight: 1.2,
                  }}>
                    {d.titulo}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 14,
                    color: 'var(--muted-2)',
                    lineHeight: 1.6,
                  }}>
                    {d.descripcion}
                  </p>
                </div>

                {/* Divisor */}
                <div style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${d.color}40, transparent)`,
                }} />

                {/* Solución */}
                <div style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: d.color,
                    flexShrink: 0,
                    marginTop: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: '#fff',
                    fontWeight: 700,
                  }}>✓</span>
                  <p style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 13,
                    color: 'var(--ink)',
                    lineHeight: 1.55,
                    fontWeight: 500,
                  }}>
                    {d.solucion}
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
