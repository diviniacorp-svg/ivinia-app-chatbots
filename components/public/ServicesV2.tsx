import Orb from './Orb'

const SERVICES = [
  {
    num: '01', nombre: 'Chatbot WhatsApp 24hs',
    desc: 'Responde consultas, agenda turnos, califica leads. Entrenado con el tono de tu negocio. Nunca descansa.',
    orbColor: '#34D399', orbDeep: '#059669', orbShade: 'rgba(0,40,20,0.5)',
    tiempo: '24–48hs · listo', precio: 'desde $150k',
  },
  {
    num: '02', nombre: 'Turnero online',
    desc: 'Tus clientes reservan solos a cualquier hora. Recordatorios automáticos, cobro de seña, panel de gestión.',
    orbColor: '#38BDF8', orbDeep: '#0284C7', orbShade: 'rgba(0,30,60,0.5)',
    tiempo: '24hs · configurado', precio: 'desde $80k',
  },
  {
    num: '03', nombre: 'Automatización de procesos',
    desc: 'Mails, planillas, reportes, seguimiento de leads. Lo repetitivo pasa a ser automático.',
    orbColor: '#F2C94C', orbDeep: '#C89A20', orbShade: 'rgba(80,60,0,0.4)',
    tiempo: '2–5 días', precio: 'desde $120k',
  },
  {
    num: '04', nombre: 'Agente IA a medida',
    desc: 'Un empleado virtual que entiende tu negocio y toma decisiones de rutina sin que vos intervengas.',
    orbColor: '#7B61FF', orbDeep: '#4A35CC', orbShade: 'rgba(30,10,90,0.5)',
    tiempo: '1–2 semanas', precio: 'desde $300k',
  },
  {
    num: '05', nombre: 'Avatar IA',
    desc: 'Portavoz virtual con tu voz clonada. Presenta tu negocio, responde FAQs en video, construye marca.',
    orbColor: '#818CF8', orbDeep: '#4338CA', orbShade: 'rgba(20,10,80,0.4)',
    tiempo: '5–7 días', precio: 'desde $200k',
  },
  {
    num: '06', nombre: 'Sistema multi-agente (NUCLEUS)',
    desc: 'Varios agentes coordinados que operan tu negocio como un equipo interno. Para procesos complejos.',
    orbColor: '#FF8FB8', orbDeep: '#CC5483', orbShade: 'rgba(80,10,30,0.45)',
    tiempo: '2–4 semanas', precio: 'desde $800k',
  },
]

export default function ServicesV2() {
  return (
    <section id="servicios" style={{ padding: '140px 0', background: 'var(--paper)' }}>
      <div className="wrap-v2">
        {/* Header */}
        <div style={{ display: 'grid', gap: 40, marginBottom: 80 }}
          className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Servicios — 02/05</div>
            <h2 className="h-title">
              Qué hacemos,<br />
              <em>en concreto.</em>
            </h2>
          </div>
          <p style={{ alignSelf: 'end', fontSize: 20, lineHeight: 1.45, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '56ch' }}>
            Seis servicios, ningún buzzword. Cada uno tiene un precio publicado y un plazo real.
            Si necesitás un combo, armamos un plan. Si no sabés por dónde empezar, la auditoría gratis te lo dice.
          </p>
        </div>

        {/* Service rows */}
        <div>
          <div style={{ height: 1, background: 'var(--ink)' }} />
          {SERVICES.map((s, i) => (
            <div
              key={s.num}
              style={{
                padding: '32px 0',
                borderBottom: `1px solid ${i === SERVICES.length - 1 ? 'var(--ink)' : 'var(--line)'}`,
                transition: 'background 0.2s',
              }}
              className="hover:bg-paper-2/40 service-row-mobile"
            >
              {/* Desktop */}
              <div className="service-row-inner hidden-mobile" style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 1fr 220px 140px',
                gap: 32,
                alignItems: 'center',
              }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)' }}>{s.num}</div>
                <div className="h-section">{s.nombre}</div>
                <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--muted-2)', fontFamily: 'var(--f-display)' }}>{s.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Orb size={34} color={s.orbColor} colorDeep={s.orbDeep} shade={s.orbShade} />
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{s.tiempo}</span>
                </div>
                <div className="h-section" style={{ textAlign: 'right' }}>{s.precio}</div>
              </div>
              {/* Mobile */}
              <div className="show-only-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)' }}>{s.num}</span>
                  <span className="h-section" style={{ fontSize: 20 }}>{s.precio}</span>
                </div>
                <div className="h-section" style={{ fontSize: 18 }}>{s.nombre}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--muted-2)', fontFamily: 'var(--f-display)' }}>{s.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <Orb size={28} color={s.orbColor} colorDeep={s.orbDeep} shade={s.orbShade} />
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{s.tiempo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
