import Orb from './Orb'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '48px 0 32px', background: 'var(--paper-2)', fontFamily: 'var(--f-display)' }}>
      <div className="wrap-v2">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 80 }}
          className="grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Orb size={26} color="#C6FF3D" colorDeep="#9EE028" shade="rgba(0,0,0,0.28)" />
              <span style={{ fontWeight: 600, fontSize: 19, letterSpacing: '-0.05em', color: 'var(--ink)' }}>
                divinia<span style={{ color: 'var(--muted)' }}>.</span>
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted-2)', maxWidth: 260 }}>
              Agencia de automatización con IA. San Luis, Argentina. Operando para PYMEs de LATAM desde 2024.
            </p>
          </div>

          {/* Explorar */}
          <nav>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Explorar</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              {[
                { href: '#servicios', label: 'Servicios' },
                { href: '#proceso', label: 'Proceso' },
                { href: '#casos', label: 'Casos' },
                { href: '#manifiesto', label: 'Manifiesto' },
              ].map(l => (
                <li key={l.label}><a href={l.href} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{l.label}</a></li>
              ))}
            </ul>
          </nav>

          {/* Productos */}
          <nav>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Productos</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              {[
                { href: '/precios', label: 'Precios' },
                { href: '/academy', label: 'Academy' },
                { href: '/auditoria', label: 'Auditoría gratis' },
                { href: '/rubros', label: 'Turnero' },
              ].map(l => (
                <li key={l.label}><a href={l.href} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{l.label}</a></li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Contacto</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <li><a href="mailto:hola@divinia.com.ar" style={{ color: 'var(--ink)', textDecoration: 'none' }}>hola@divinia.com.ar</a></li>
              <li><a href="https://wa.me/542665286110" style={{ color: 'var(--ink)', textDecoration: 'none' }}>+54 9 266 5286110</a></li>
              <li style={{ color: 'var(--muted-2)' }}>San Luis · AR</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          paddingTop: 24, borderTop: '1px solid var(--line)',
          fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--muted)',
        }}>
          <span>© 2026 DIVINIA — todos los derechos reservados</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="/terminos" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Términos</a>
            <a href="/privacidad" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacidad</a>
            <span>Hecho en San Luis, AR</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
