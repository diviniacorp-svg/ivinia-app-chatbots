import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import WAFloat from '@/components/public/WAFloat'
import Link from 'next/link'
import { TURNERO_PLANS, formatPrecio } from '@/lib/turnero-plans'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Turnero IA — Sistema de turnos online para tu negocio | DIVINIA',
  description: 'Tu negocio toma turnos solo, 24hs. Reservas, recordatorios, cobro de seña por MercadoPago. Desde $45.000/mes. 15 rubros disponibles.',
}

const WA = 'https://wa.me/5492665286110'

const RUBROS = [
  { emoji: '✂️', nombre: 'Peluquería / Barbería', slug: 'peluqueria' },
  { emoji: '💅', nombre: 'Nail Bar / Manicura', slug: 'nails' },
  { emoji: '💆', nombre: 'Estética / Spa', slug: 'estetica' },
  { emoji: '🦷', nombre: 'Odontología', slug: 'odontologia' },
  { emoji: '🏥', nombre: 'Clínica / Médico', slug: 'clinica' },
  { emoji: '🐾', nombre: 'Veterinaria', slug: 'veterinaria' },
  { emoji: '💪', nombre: 'Gimnasio', slug: 'gimnasio' },
  { emoji: '🏨', nombre: 'Hotel / Hostería', slug: 'hotel' },
  { emoji: '🍴', nombre: 'Restaurante', slug: 'restaurante' },
  { emoji: '🧠', nombre: 'Psicología', slug: 'psicologia' },
  { emoji: '⚖️', nombre: 'Abogado', slug: 'abogado' },
  { emoji: '📊', nombre: 'Contabilidad', slug: 'contabilidad' },
  { emoji: '🌸', nombre: 'Spa / Wellness', slug: 'spa' },
  { emoji: '🏡', nombre: 'Hostería', slug: 'hosteria' },
  { emoji: '🏢', nombre: 'Profesional independiente', slug: 'default' },
]

const COMO_FUNCIONA = [
  {
    n: '01',
    titulo: 'Tu página de reservas',
    desc: 'Cada negocio tiene su propia URL pública. Los clientes eligen servicio, profesional y horario desde el celular, sin instalar nada.',
    color: '#C6FF3D',
  },
  {
    n: '02',
    titulo: 'Confirmación automática',
    desc: 'Cuando alguien reserva, recibe confirmación al instante y un recordatorio automático 24hs antes del turno.',
    color: '#38BDF8',
  },
  {
    n: '03',
    titulo: 'Seña por MercadoPago',
    desc: 'Si querés cobrar señas para asegurarte los turnos, el sistema las gestiona solo. El dinero va directo a tu cuenta.',
    color: '#E879F9',
  },
  {
    n: '04',
    titulo: 'Panel del negocio',
    desc: 'El dueño ve todos los turnos del día desde el celular. Puede bloquear horarios, ver estadísticas y gestionar profesionales.',
    color: '#FCD34D',
  },
]

export default function TurneroPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '120px 0 80px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gap: 48, alignItems: 'center' }} className="grid-cols-2-mobile-1 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 24 }}>Turnero IA · DIVINIA</div>
              <h1 className="h-display" style={{ fontSize: 'clamp(48px,7vw,110px)', marginBottom: 28, lineHeight: 1.0 }}>
                Tu agenda<br />online que<br /><em>nunca duerme.</em>
              </h1>
              <p style={{ fontSize: 20, lineHeight: 1.5, color: 'var(--muted-2)', marginBottom: 40, maxWidth: '44ch', fontFamily: 'var(--f-display)' }}>
                Los clientes reservan solos. Vos recibís la notificación. Sin llamadas, sin planillas, sin mensajes de WhatsApp a las 11 de la noche.
              </p>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                <Link href="/rubros" className="btn-v2 btn-ink" style={{ fontSize: 16, padding: '15px 22px 15px 26px' }}>
                  Ver demo de tu rubro
                  <span className="btn-arrow">→</span>
                </Link>
                <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ghost-v2" style={{ fontSize: 16 }}>
                  Hablar por WhatsApp
                </a>
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  { n: '15', label: 'rubros' },
                  { n: '48hs', label: 'setup' },
                  { n: '$45k', label: 'desde/mes' },
                  { n: '24/7', label: 'activo' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual — mockup del panel */}
            <div style={{ background: 'var(--ink)', borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                Panel del negocio — Hoy
              </div>
              {[
                { hora: '09:00', cliente: 'María G.', servicio: 'Semipermanente', estado: 'confirmado', color: '#C6FF3D' },
                { hora: '10:30', cliente: 'Laura P.', servicio: 'Uñas en gel', estado: 'confirmado', color: '#C6FF3D' },
                { hora: '12:00', cliente: 'Ana R.', servicio: 'Manicura', estado: 'pendiente', color: '#FCD34D' },
                { hora: '14:00', cliente: 'Sofía M.', servicio: 'Semipermanente pies', estado: 'confirmado', color: '#C6FF3D' },
                { hora: '16:00', cliente: '—', servicio: 'Disponible', estado: 'libre', color: 'rgba(255,255,255,0.15)' },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', minWidth: 40 }}>{t.hora}</div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: t.estado === 'libre' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{t.cliente}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{t.servicio}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: t.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.estado}</div>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(198,255,61,0.08)', borderRadius: 10, border: '1px solid rgba(198,255,61,0.2)' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--lime)', letterSpacing: '0.08em' }}>
                  ✓ Nuevo turno: Romina V. · Mañana 10:00 · Seña recibida $4.800
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ padding: '100px 0', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ marginBottom: 56 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Cómo funciona</div>
            <h2 className="h-title">Cuatro pasos.<br /><em>Cero complicaciones.</em></h2>
          </div>
          <div style={{ display: 'grid', gap: 16 }} className="grid-cols-2-mobile-1 md:grid-cols-2">
            {COMO_FUNCIONA.map(step => (
              <div key={step.n} style={{
                background: 'var(--paper)', border: '1px solid var(--line)',
                borderRadius: 20, padding: '36px 32px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 20, right: 24,
                  fontFamily: 'var(--f-mono)', fontSize: 56, fontWeight: 800,
                  color: 'var(--line)', lineHeight: 1, letterSpacing: '-0.04em',
                }}>
                  {step.n}
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.color, marginBottom: 20 }} />
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 12, margin: '0 0 12px' }}>
                  {step.titulo}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', margin: 0, lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rubros */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>15 rubros cubiertos</div>
            <h2 className="h-title">¿Tu rubro está acá?<br /><em>Perfecto.</em></h2>
          </div>
          <div style={{ display: 'grid', gap: 10, marginBottom: 40 }} className="grid-cols-3-mobile-1 md:grid-cols-5">
            {RUBROS.map(r => (
              <Link
                key={r.slug}
                href={`/rubros`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--paper-2)', border: '1px solid var(--line)',
                  borderRadius: 12, padding: '14px 16px',
                  textDecoration: 'none', transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: 20 }}>{r.emoji}</span>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.3 }}>{r.nombre}</span>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/rubros" className="btn-v2 btn-ink" style={{ fontSize: 15 }}>
              Ver demo de tu rubro en vivo →
            </Link>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section style={{ padding: '100px 0', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Precios Turnero</div>
            <h2 className="h-display" style={{ fontSize: 'clamp(36px,5vw,72px)', marginBottom: 16 }}>
              Sin letra chica.<br /><em>Sin sorpresas.</em>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '44ch', margin: '0 auto', lineHeight: 1.55 }}>
              Tres opciones según cómo preferís pagar. Setup incluido en todos.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 12 }} className="grid-cols-3-mobile-1 md:grid-cols-3">
            {TURNERO_PLANS.slice(0, 3).map(p => (
              <div key={p.id} style={{
                background: p.popular ? 'var(--ink)' : 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 20, padding: '36px 32px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {p.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--lime)', color: 'var(--ink)', borderRadius: 100, padding: '4px 16px',
                    fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em',
                    whiteSpace: 'nowrap', textTransform: 'uppercase',
                  }}>
                    Más elegido
                  </div>
                )}
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: p.popular ? 'rgba(255,255,255,0.4)' : 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  {p.nombre}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(36px,4vw,52px)', color: p.popular ? 'var(--paper)' : 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                  {formatPrecio(p.precio)}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: p.popular ? 'rgba(255,255,255,0.3)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {p.billing}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: p.popular ? 'rgba(255,255,255,0.5)' : 'var(--muted-2)', marginBottom: 28 }}>
                  {p.descripcion}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: p.popular ? 'rgba(255,255,255,0.7)' : 'var(--muted-2)', fontFamily: 'var(--f-display)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: p.popular ? 'var(--lime)' : 'var(--ink)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`${WA}?text=Quiero%20el%20Turnero%20${encodeURIComponent(p.nombre)}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`btn-v2 ${p.popular ? 'btn-ink' : 'btn-ghost-v2'}`}
                  style={p.popular ? { background: 'var(--lime)', color: 'var(--ink)', fontWeight: 700 } : {}}
                >
                  Empezar con {p.nombre} →
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
            TODOS LOS PRECIOS EN ARS · SETUP INCLUIDO · SIN PERMANENCIA
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="wrap-v2">
          <div className="eyebrow" style={{ marginBottom: 20 }}>Empezá hoy</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(40px,5.5vw,80px)', marginBottom: 20 }}>
            Tu negocio en vivo<br /><em>en 48hs.</em>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '44ch', margin: '0 auto 40px', lineHeight: 1.55 }}>
            Primero te mostramos el demo de tu rubro. Si te convence, configuramos todo en menos de dos días.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/rubros" className="btn-v2 btn-ink" style={{ fontSize: 16, padding: '16px 32px' }}>
              Ver demo de mi rubro →
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-v2 btn-ghost-v2" style={{ fontSize: 16 }}>
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WAFloat />
    </main>
  )
}
