export default function Manifiesto() {
  return (
    <section
      id="manifiesto"
      style={{ padding: '120px 0', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}
    >
      <div className="wrap-v2">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }}
          className="grid-cols-1 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="eyebrow">Manifiesto — 01/04</div>
          </div>
          <div>
            <p className="h-title" style={{ color: 'var(--ink)', fontSize: 'clamp(28px, 4vw, 64px)' }}>
              La IA no es para <em>parecer</em> moderno.<br />
              Es para <em>operar</em> mejor. Nosotros<br />
              no vendemos humo, vendemos <em>horas</em><br />
              devueltas a tu semana.
            </p>
            <p style={{
              marginTop: 48, fontSize: 20, lineHeight: 1.45,
              color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '56ch',
            }}>
              Cada automatización que entregamos está medida. Si no te devuelve al menos{' '}
              <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>10 horas por semana</strong>{' '}
              o no te hace ganar un múltiplo de lo que te cobramos en 6 meses, está mal hecha.
              Y si no funciona como te prometimos, lo arreglamos sin costo extra — antes de que pagues el saldo final.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
