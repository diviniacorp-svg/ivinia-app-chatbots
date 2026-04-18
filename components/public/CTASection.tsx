import Orb from './Orb'
import LeadCaptureForm from './LeadCaptureForm'

export default function CTASection() {
  return (
    <section id="demo" style={{ padding: '140px 0', borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
      <div className="wrap-v2">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
          className="grid-cols-1 md:grid-cols-2">

          {/* Orbs left */}
          <div style={{ position: 'relative', height: 420 }} className="hidden md:block">
            <Orb
              size={380}
              color="#C6FF3D" colorDeep="#7AB020" shade="rgba(0,40,0,0.5)"
              float squash
              style={{ position: 'absolute', left: 0, top: 20 }}
            />
            <Orb
              size={140}
              color="#FF5E3A" colorDeep="#CC3A1A" shade="rgba(80,10,0,0.4)"
              float
              delay="-2s"
              style={{ position: 'absolute', left: 300, top: 260 }}
            />
          </div>

          {/* Form right */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 28 }}>Hablemos — próximo paso</div>
            <h2 className="h-display" style={{ fontSize: 'clamp(52px, 7vw, 110px)', marginBottom: 32, color: 'var(--ink)' }}>
              20 minutos.<br />
              <em>Cero compromiso.</em>
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.45, color: 'var(--muted-2)', marginBottom: 36, fontFamily: 'var(--f-display)', maxWidth: '44ch' }}>
              Te decimos qué automatizaríamos primero, cuánto te ahorraría, y si tiene sentido que trabajemos juntos.
            </p>

            {/* Lead form */}
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)',
              borderRadius: 24, padding: 32,
            }}>
              <LeadCaptureForm />
            </div>

            {/* WhatsApp direct */}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <a
                href="https://wa.me/542665286110"
                style={{
                  fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--muted-2)', textDecoration: 'none',
                }}
              >
                O escribinos por WhatsApp directo →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
