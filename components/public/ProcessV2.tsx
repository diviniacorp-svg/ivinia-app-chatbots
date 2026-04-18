import Orb from './Orb'

const STEPS = [
  {
    num: '01',
    titulo: 'Charla de 20 min',
    desc: 'Nos contás qué te está costando tiempo. Nosotros hacemos preguntas incómodas.',
  },
  {
    num: '02',
    titulo: 'Propuesta en 48h',
    desc: 'Un documento de 2 páginas con alcance, precio y fecha. Cero ambigüedad.',
  },
  {
    num: '03',
    titulo: 'Construcción',
    desc: 'Demos semanales. Nada de "ya casi está": o avanza, o te devolvemos al paso 02.',
  },
  {
    num: '04',
    titulo: 'Lanzamos + soporte',
    desc: 'Te capacitamos 1 a 1 durante 30 días. Si algo falla, arreglamos nosotros.',
  },
]

export default function ProcessV2() {
  return (
    <section
      id="proceso"
      style={{ padding: '140px 0', background: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}
    >
      {/* accent orb */}
      <Orb
        size={360}
        color="#C6FF3D"
        colorDeep="#7AB020"
        shade="rgba(0,40,0,0.5)"
        float
        style={{ position: 'absolute', top: 60, right: -120, opacity: 0.9 }}
      />

      <div className="wrap-v2" style={{ position: 'relative', zIndex: 2 }}>
        <div className="eyebrow" style={{ color: 'var(--lime)', marginBottom: 20 }}>Cómo trabajamos — 03/04</div>
        <h2 className="h-title" style={{ maxWidth: '18ch', marginBottom: 80, color: 'var(--paper)' }}>
          Cuatro pasos. Sin <em>kickoffs</em>{' '}
          eternos ni PowerPoints de 80 slides.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}
          className="grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {STEPS.map(step => (
            <div key={step.num} style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24 }}>
              <div style={{
                fontFamily: 'var(--f-display)', fontSize: 72, fontWeight: 500,
                letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--lime)',
              }}>{step.num}</div>
              <div className="h-section" style={{ margin: '20px 0 12px', color: 'var(--paper)' }}>{step.titulo}</div>
              <div style={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(246,245,242,0.7)', fontFamily: 'var(--f-display)' }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
