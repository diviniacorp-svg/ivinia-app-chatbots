'use client'

import { useState } from 'react'

const BENEFICIOS = [
  {
    emoji: '🚫',
    titulo: 'Cero comisión por venta',
    descripcion:
      'No te cobramos un peso por cada pedido. Pagás solo tu plan mensual y te quedás con el 100% de tus ventas.',
  },
  {
    emoji: '🌐',
    titulo: 'Tu web dentro del marketplace',
    descripcion:
      'Tu comercio tiene su propia página con menú, fotos y contacto. Aparecés en el buscador de DIVINIA Market.',
  },
  {
    emoji: '🛵',
    titulo: 'Delivery incluido',
    descripcion:
      'Conectamos tu comercio con la red de repartidores de San Luis. Vos solo preparás el pedido.',
  },
]

const PLANES = [
  {
    nombre: 'Plan Básico',
    precio: '$35.000/mes',
    features: ['Perfil en el marketplace', 'Menú digital con hasta 20 productos', 'Estadísticas básicas'],
    destacado: false,
  },
  {
    nombre: 'Plan Pro',
    precio: '$65.000/mes',
    features: [
      'Todo lo del Plan Básico',
      'Web propia con tu dominio',
      'Productos ilimitados',
      'Galería de fotos',
      'Programa de fidelidad',
      'Soporte prioritario',
    ],
    destacado: true,
  },
]

export default function UnirseMarketPage() {
  const [form, setForm] = useState({ nombre: '', rubro: '', telefono: '', email: '' })
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    try {
      await fetch('/api/market/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch {
      // Ignorar error de red — el formulario igualmente confirma envío
    }
    setCargando(false)
    setEnviado(true)
  }

  return (
    <div style={{ fontFamily: 'var(--f-display)', background: '#FFFBF5', minHeight: '100vh' }}>
      {/* NAVBAR */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255,251,245,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E8E0D8',
          padding: '16px 0',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a href="/market" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
              }}
            >
              DIVINIA
            </span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 14, color: '#FF6B35' }}>
              {' '}Market
            </span>
          </a>
          <a
            href="/market"
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              color: '#6B6B6B',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            ← Ver el marketplace
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '130px 24px 80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#FF6B35',
            marginBottom: 20,
          }}
        >
          Para negocios de San Luis
        </div>
        <h1
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 800,
            fontSize: 'clamp(38px, 6vw, 72px)',
            color: '#1A1A1A',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            margin: '0 0 24px',
          }}
        >
          Sumá tu negocio<br />a DIVINIA Market.
        </h1>
        <p
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 18,
            color: '#6B6B6B',
            lineHeight: 1.6,
            margin: '0 auto 0',
            maxWidth: '50ch',
          }}
        >
          Llegá a miles de personas en San Luis Capital. Sin comisiones, sin complicaciones.
          Tu negocio online en menos de 24 horas.
        </p>
      </div>

      {/* BENEFICIOS */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {BENEFICIOS.map((b) => (
            <div
              key={b.titulo}
              style={{
                borderRadius: 16,
                border: '1px solid #E8E0D8',
                background: 'white',
                padding: '28px 28px 32px',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{b.emoji}</div>
              <div
                style={{
                  fontFamily: 'var(--f-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#1A1A1A',
                  marginBottom: 10,
                  lineHeight: 1.2,
                }}
              >
                {b.titulo}
              </div>
              <p
                style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 14,
                  color: '#6B6B6B',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {b.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRECIOS */}
      <section
        style={{
          borderTop: '1px solid #E8E0D8',
          borderBottom: '1px solid #E8E0D8',
          padding: '80px 24px',
          background: 'white',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
              marginBottom: 12,
            }}
          >
            Planes
          </div>
          <h2
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 44px)',
              color: '#1A1A1A',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              margin: '0 0 48px',
            }}
          >
            Elegí tu plan
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              maxWidth: 700,
              margin: '0 auto',
            }}
          >
            {PLANES.map((plan) => (
              <div
                key={plan.nombre}
                style={{
                  borderRadius: 16,
                  border: plan.destacado ? '2px solid #FF6B35' : '1px solid #E8E0D8',
                  background: plan.destacado ? '#FF6B35' : 'white',
                  padding: '28px 28px 32px',
                  position: 'relative',
                }}
              >
                {plan.destacado && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1A1A1A',
                      color: 'white',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '4px 12px',
                      borderRadius: 100,
                    }}
                  >
                    Más popular
                  </div>
                )}
                <div
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: plan.destacado ? 'rgba(255,255,255,0.7)' : '#6B6B6B',
                    marginBottom: 8,
                  }}
                >
                  {plan.nombre}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 800,
                    fontSize: 36,
                    color: plan.destacado ? 'white' : '#1A1A1A',
                    letterSpacing: '-0.03em',
                    marginBottom: 24,
                  }}
                >
                  {plan.precio}
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontFamily: 'var(--f-display)',
                        fontSize: 14,
                        color: plan.destacado ? 'rgba(255,255,255,0.9)' : '#1A1A1A',
                        lineHeight: 1.5,
                        padding: '6px 0',
                        borderBottom: `1px solid ${plan.destacado ? 'rgba(255,255,255,0.15)' : '#F0EBE4'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span style={{ color: plan.destacado ? 'white' : '#FF6B35' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            marginBottom: 12,
          }}
        >
          Registrate
        </div>
        <h2
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 800,
            fontSize: 'clamp(24px, 4vw, 38px)',
            color: '#1A1A1A',
            letterSpacing: '-0.03em',
            textAlign: 'center',
            margin: '0 0 40px',
          }}
        >
          Empezá hoy
        </h2>

        {enviado ? (
          <div
            style={{
              borderRadius: 16,
              border: '1px solid #E8E0D8',
              background: 'white',
              padding: '48px 40px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div
              style={{
                fontFamily: 'var(--f-display)',
                fontWeight: 700,
                fontSize: 22,
                color: '#1A1A1A',
                marginBottom: 12,
              }}
            >
              ¡Te contactamos pronto!
            </div>
            <p
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 15,
                color: '#6B6B6B',
                lineHeight: 1.6,
              }}
            >
              Recibimos tu solicitud. En menos de 24 horas te mandamos los datos para activar tu
              negocio en DIVINIA Market.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              borderRadius: 16,
              border: '1px solid #E8E0D8',
              background: 'white',
              padding: '36px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {[
              { name: 'nombre', label: 'Nombre del negocio', placeholder: 'Ej: La Esquina Pizzería' },
              { name: 'rubro', label: 'Rubro', placeholder: 'Ej: Pizzería, Peluquería, Ferretería...' },
              { name: 'telefono', label: 'Teléfono / WhatsApp', placeholder: '+54 9 266...' },
              { name: 'email', label: 'Email', placeholder: 'tulocal@email.com' },
            ].map(({ name, label, placeholder }) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label
                  htmlFor={name}
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#6B6B6B',
                  }}
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={name === 'email' ? 'email' : 'text'}
                  placeholder={placeholder}
                  required
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1.5px solid #E8E0D8',
                    fontFamily: 'var(--f-display)',
                    fontSize: 15,
                    color: '#1A1A1A',
                    outline: 'none',
                    background: '#FFFBF5',
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={cargando}
              style={{
                marginTop: 8,
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '16px',
                fontFamily: 'var(--f-mono)',
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: cargando ? 'not-allowed' : 'pointer',
                opacity: cargando ? 0.7 : 1,
              }}
            >
              {cargando ? 'Enviando...' : 'Quiero sumarme →'}
            </button>
          </form>
        )}

        {/* CTA WhatsApp */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <p
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 14,
              color: '#6B6B6B',
              marginBottom: 12,
            }}
          >
            ¿Preferís hablar directamente?
          </p>
          <a
            href="https://wa.me/5492664000000?text=Hola%2C+quiero+sumar+mi+negocio+a+DIVINIA+Market"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#25D366',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            💬 Escribinos por WhatsApp
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: '#1A1A1A',
          color: 'rgba(255,255,255,0.5)',
          padding: '40px 24px',
          textAlign: 'center',
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
        }}
      >
        DIVINIA Market · San Luis Capital · 2026
      </footer>
    </div>
  )
}
