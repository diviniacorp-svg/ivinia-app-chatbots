'use client'

import { useState } from 'react'

const QUICK_TEMPLATES = [
  { label: 'Hook de problema', brief: '¿Cuánto te cuesta cada problema sin resolver? Abrí con una pregunta que duela.' },
  { label: 'Before / After', brief: 'Antes: [situación sin el producto]. Ahora: [situación con el producto]. Mostrá la transformación.' },
  { label: 'CTA directo', brief: 'Post corto con una sola idea clara y llamada a la acción directa al final.' },
]

export default function CreadorRapido() {
  const [tipo, setTipo] = useState('Post')
  const [plataforma, setPlataforma] = useState('Instagram')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState('')
  const [error, setError] = useState('')

  async function handleGenerar() {
    if (!brief || brief.trim().length < 5) {
      setError('Escribí un brief más largo para obtener mejores resultados.')
      return
    }
    setLoading(true)
    setError('')
    setResultado('')
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, plataforma, brief }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar')
      setResultado(data.content)
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la IA')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid var(--line)',
    borderRadius: 8,
    background: 'var(--paper)',
    fontFamily: 'var(--f-display)',
    fontSize: 14,
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 12,
  }

  return (
    <div style={{
      background: 'var(--paper-2)',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: 20,
    }}>
      <div style={{
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        marginBottom: 16,
      }}>
        Nueva pieza
      </div>

      <select
        value={tipo}
        onChange={e => setTipo(e.target.value)}
        style={inputStyle}
      >
        <option>Post</option>
        <option>Reel</option>
        <option>Story</option>
        <option>Email</option>
        <option>Blog</option>
      </select>

      <select
        value={plataforma}
        onChange={e => setPlataforma(e.target.value)}
        style={inputStyle}
      >
        <option>Instagram</option>
        <option>TikTok</option>
        <option>LinkedIn</option>
        <option>Email</option>
        <option>Blog</option>
      </select>

      <textarea
        rows={3}
        placeholder="¿De qué trata esta pieza?"
        value={brief}
        onChange={e => setBrief(e.target.value)}
        style={{ ...inputStyle, resize: 'vertical' }}
      />

      {error && (
        <div style={{
          fontFamily: 'var(--f-display)',
          fontSize: 12,
          color: '#B91C1C',
          marginBottom: 10,
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleGenerar}
        disabled={loading}
        style={{
          background: loading ? 'var(--muted)' : 'var(--ink)',
          color: 'var(--paper)',
          border: 'none',
          borderRadius: 8,
          padding: '12px 16px',
          width: '100%',
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 700,
        }}
      >
        {loading ? 'Generando...' : 'Generar con IA →'}
      </button>

      {resultado && (
        <textarea
          readOnly
          value={resultado}
          style={{
            width: '100%',
            background: 'var(--paper)',
            border: '1px solid var(--lime)',
            borderRadius: 8,
            padding: 12,
            fontSize: 14,
            fontFamily: 'var(--f-display)',
            color: 'var(--ink)',
            marginTop: 12,
            minHeight: 120,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />
      )}

      <div style={{ borderTop: '1px solid var(--line)', margin: '20px 0 0' }} />
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 10,
        }}>
          Plantillas rápidas
        </div>
        {QUICK_TEMPLATES.map(t => (
          <button
            key={t.label}
            onClick={() => setBrief(t.brief)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 14px',
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontFamily: 'var(--f-display)',
              fontSize: 13,
              color: 'var(--ink)',
              cursor: 'pointer',
              marginBottom: 6,
              display: 'block',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
