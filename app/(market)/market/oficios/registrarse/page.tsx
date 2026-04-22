'use client'

import { useState } from 'react'

const RUBROS_OFICIOS = [
  'Plomería', 'Electricidad', 'Gas', 'Pintura', 'Albañilería', 'Carpintería',
  'Herrería', 'Soldadura', 'Refrigeración / AC', 'Cerrajería',
  'Jardín y paisajismo', 'Limpieza del hogar', 'Mudanzas', 'Fletes',
  'Informática', 'Cámaras de seguridad', 'Alarmas',
  'Clases particulares', 'Idiomas', 'Música',
  'Fotografía', 'Video', 'Diseño gráfico',
  'Cuidado de adultos mayores', 'Enfermería domiciliaria', 'Babysitting',
  'Entrenador personal', 'Nutricionista', 'Masajes a domicilio',
  'Reparación de electrodomésticos', 'Tapicería', 'Vidriería',
  'Otro',
]

const ZONAS = [
  'Centro', 'Norte', 'Sur', 'Este', 'Oeste',
  'Villa Mercedes', 'Toda la ciudad', 'Alrededores',
]

export default function RegistrarseOficioPage() {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    oficio: '',
    zona: '',
    precio: '',
    descripcion: '',
  })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handle(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.telefono || !form.oficio || !form.zona) {
      setError('Completá nombre, teléfono, oficio y zona.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/market/oficios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al registrar')
      setEnviado(true)
    } catch {
      setError('No se pudo registrar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div
        style={{
          fontFamily: 'var(--f-display)',
          background: '#F0F9FF',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 800,
              fontSize: 32,
              color: '#0C4A6E',
              marginBottom: 12,
            }}
          >
            ¡Listo, {form.nombre.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: 16, color: '#0369A1', lineHeight: 1.6, marginBottom: 28 }}>
            Tu perfil fue enviado. Lo revisamos y en menos de 24hs te aparece en el marketplace.
            <br />Te vamos a contactar por WhatsApp al <strong>{form.telefono}</strong>.
          </p>
          <a
            href="/market"
            style={{
              display: 'inline-block',
              background: '#0EA5E9',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 10,
              padding: '13px 32px',
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Ver el marketplace →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        fontFamily: 'var(--f-display)',
        background: '#FFFBF5',
        minHeight: '100vh',
        padding: '60px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Back */}
        <a
          href="/market"
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            color: '#0EA5E9',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: 32,
          }}
        >
          ← Market
        </a>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#0EA5E9',
              marginBottom: 12,
            }}
          >
            Oficios & Servicios · San Luis
          </div>
          <h1
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 800,
              fontSize: 'clamp(28px, 5vw, 44px)',
              color: '#1A1A1A',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 16px',
            }}
          >
            Registrá tu oficio.<br />Conseguí clientes.
          </h1>
          <p style={{ fontSize: 16, color: '#6B6B6B', lineHeight: 1.6 }}>
            Gratis para siempre. Aparecés en el marketplace de San Luis y recibís consultas directamente por WhatsApp.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre completo *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => handle('nombre', e.target.value)}
              placeholder="Ej: Martín García"
              style={inputStyle}
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label style={labelStyle}>WhatsApp (con código de país) *</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={e => handle('telefono', e.target.value)}
              placeholder="Ej: 5492664123456"
              style={inputStyle}
              required
            />
            <div style={hintStyle}>Tus clientes te van a contactar directo por acá.</div>
          </div>

          {/* Oficio */}
          <div>
            <label style={labelStyle}>Oficio o servicio *</label>
            <select
              value={form.oficio}
              onChange={e => handle('oficio', e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Elegí tu oficio…</option>
              {RUBROS_OFICIOS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Zona */}
          <div>
            <label style={labelStyle}>Zona donde trabajás *</label>
            <select
              value={form.zona}
              onChange={e => handle('zona', e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Elegí tu zona…</option>
              {ZONAS.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Precio orientativo */}
          <div>
            <label style={labelStyle}>Precio orientativo</label>
            <input
              type="text"
              value={form.precio}
              onChange={e => handle('precio', e.target.value)}
              placeholder="Ej: desde $5.000 · $3.500/hora"
              style={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>¿Qué hacés exactamente?</label>
            <textarea
              value={form.descripcion}
              onChange={e => handle('descripcion', e.target.value)}
              placeholder="Contá brevemente tu experiencia y qué ofrecés…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '12px 16px',
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                color: '#DC2626',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#7DD3FC' : '#0EA5E9',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '16px 0',
              fontFamily: 'var(--f-mono)',
              fontSize: 13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Enviando…' : 'Registrarme gratis →'}
          </button>

          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              color: '#9B9B9B',
              textAlign: 'center',
              letterSpacing: '0.04em',
            }}
          >
            Gratis para siempre · Sin tarjeta · Te contactamos en 24hs
          </p>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-mono)',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#4B4B4B',
  marginBottom: 8,
  fontWeight: 700,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1.5px solid #E8E0D8',
  borderRadius: 10,
  fontFamily: 'var(--f-display)',
  fontSize: 15,
  color: '#1A1A1A',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
}

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--f-mono)',
  fontSize: 10,
  color: '#9B9B9B',
  marginTop: 6,
  letterSpacing: '0.04em',
}
