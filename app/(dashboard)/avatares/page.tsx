export const dynamic = 'force-dynamic'

import Link from 'next/link'

const HERRAMIENTAS = [
  {
    nombre: 'HeyGen',
    descripcion: 'Avatares parlantes con voz clonada · Ideal para presentadores y portavoces de marca',
    url: 'https://app.heygen.com',
    color: '#818CF8',
    badge: 'Primario',
  },
  {
    nombre: 'ElevenLabs',
    descripcion: 'Clonación de voz realista · Narración y locución profesional con IA',
    url: 'https://elevenlabs.io',
    color: '#E879F9',
    badge: 'Voz',
  },
  {
    nombre: 'D-ID',
    descripcion: 'Animación facial sobre fotos · Alternativa económica a HeyGen',
    url: 'https://studio.d-id.com',
    color: '#38BDF8',
    badge: 'Backup',
  },
  {
    nombre: 'Hedra',
    descripcion: 'Avatar generativo end-to-end · Solo imagen + audio → video completo',
    url: 'https://www.hedra.com',
    color: '#34D399',
    badge: 'Nuevo',
  },
  {
    nombre: 'Higgsfield',
    descripcion: 'Video IA cinematográfico · Efectos de cámara y movimiento avanzado',
    url: 'https://higgsfield.ai',
    color: '#FCD34D',
    badge: 'Video',
  },
]

const SERVICIOS = [
  { nombre: 'Avatar corporativo (portavoz de marca)', precio: '$200.000 – $400.000', plazo: '5-7 días', desc: 'Diseño visual + voz clonada + 3 videos demo' },
  { nombre: 'Avatar para atención al cliente', precio: '$150.000 – $300.000', plazo: '3-5 días', desc: 'Integración con chatbot, responde FAQ en video' },
  { nombre: 'Influencer/presentador IA', precio: '$300.000 – $600.000', plazo: '7-10 días', desc: 'Personaje completo con backstory, scripts, producción' },
  { nombre: 'Pack 10 videos con avatar', precio: '$100.000 – $200.000', plazo: '3-4 días', desc: 'Scripts + grabación + edición con avatar existente' },
  { nombre: 'Avatar + chatbot integrado', precio: '$350.000 – $500.000', plazo: '10-14 días', desc: 'Responde en video generado dinámicamente (HeyGen API)' },
]

const WORKFLOW = [
  { paso: '01', titulo: 'Brief del cliente', desc: 'Tono, audiencia, casos de uso, idioma, personalidad del avatar' },
  { paso: '02', titulo: 'Diseño visual', desc: 'Foto/modelo base → HeyGen / Hedra para animación. Decide estilo.' },
  { paso: '03', titulo: 'Clonación de voz', desc: 'ElevenLabs: 30s de audio del cliente o elegir voz del catálogo' },
  { paso: '04', titulo: 'Video demo x3', desc: 'Primer video de prueba. Joaco aprueba antes de entregar al cliente.' },
  { paso: '05', titulo: 'Entrega + kit', desc: 'Videos finales + instrucciones de uso + soporte 30 días' },
]

export default function AvatarIAPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              06 — AVATARES IA
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              Avatares Digitales
            </h1>
            <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)' }}>
              Portavoces IA · Voz clonada · Presentadores virtuales para PYMEs
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/crm" style={{
              padding: '9px 18px', borderRadius: 8, background: 'var(--lime)',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--ink)', textDecoration: 'none', fontWeight: 700,
            }}>
              + Nuevo proyecto
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Herramientas */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Stack de herramientas
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {HERRAMIENTAS.map(h => (
              <a key={h.nombre} href={h.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', padding: 20, borderRadius: 12,
                border: '1px solid var(--line)', background: 'var(--paper)',
                textDecoration: 'none', transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
                    {h.nombre}
                  </div>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 4, background: h.color + '20', color: h.color,
                  }}>
                    {h.badge}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.5 }}>
                  {h.descripcion}
                </div>
                <div style={{ marginTop: 12, fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: h.color }}>
                  Abrir ↗
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Catálogo de servicios */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Catálogo de servicios · Precios ARS
          </div>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {SERVICIOS.map((s, i) => (
              <div key={s.nombre} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                gap: 16, padding: '16px 24px', alignItems: 'center',
                borderBottom: i < SERVICIOS.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>
                    {s.nombre}
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)' }}>
                    {s.desc}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {s.plazo}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--lime)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {s.precio}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Workflow de producción
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {WORKFLOW.map((w, i) => (
              <div key={w.paso} style={{
                flex: '1 1 160px', padding: 20, borderRadius: 12,
                border: '1px solid var(--line)', background: 'var(--paper)', position: 'relative',
              }}>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em',
                  color: 'var(--line)', position: 'absolute', top: 16, right: 20, lineHeight: 1,
                }}>
                  {w.paso}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 6 }}>
                  {w.titulo}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.5 }}>
                  {w.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'var(--ink)', borderRadius: 16, padding: '32px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: 'var(--paper)', letterSpacing: '-0.04em', marginBottom: 6 }}>
              ¿Nuevo cliente de avatares?
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Cargá el lead en el CRM y generá la propuesta automática con precios de este catálogo.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/leads" style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
            }}>
              Ver leads
            </Link>
            <Link href="/crm" style={{
              padding: '10px 20px', borderRadius: 8, background: 'var(--lime)',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--ink)', textDecoration: 'none', fontWeight: 700,
            }}>
              Ir al CRM →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
