'use client'

import { useState } from 'react'
import Link from 'next/link'
import AgentChat from '@/components/dashboard/AgentChat'

const GUIONISTA = { id: 'copy',     nombre: 'Copy',     emoji: '✍️', rol: 'Guionista IA',    model: 'sonnet', color: '#FF6B35' }
const REEL_AGENT = { id: 'reel',    nombre: 'Reel',     emoji: '🎬', rol: 'Video Creator',   model: 'haiku',  color: '#FF6B35' }
const NOVA_AGENT = { id: 'nova',    nombre: 'Nova',     emoji: '🔬', rol: 'Tech Researcher', model: 'sonnet', color: '#FF6B35' }

const PILARES = [
  { titulo: 'Tutoriales IA para PYMEs', desc: 'Cómo automatizar X en tu negocio con IA. Hook: "Ahorrá 3 horas por día haciendo esto"', color: '#E879F9', tag: 'Tutorial' },
  { titulo: 'Casos de éxito DIVINIA', desc: 'Antes/después de un cliente real. Hook: "Esta ferretería pasó de 5 a 50 turnos diarios"', color: '#C6FF3D', tag: 'Caso real' },
  { titulo: 'Comparativas de herramientas', desc: 'Claude vs ChatGPT, HeyGen vs D-ID, etc. Hook: "La herramienta IA que uso yo para..."', color: '#38BDF8', tag: 'Review' },
  { titulo: 'Opinión + tendencia IA', desc: 'Novedades de la semana en IA aplicada a negocios. Hook: "Esto cambia TODO para los negocios"', color: '#FCD34D', tag: 'Tendencia' },
]

const REPURPOSING = [
  { plataforma: 'YouTube', formato: 'Video largo (8-15 min)', color: '#FF0000', nota: 'SEO largo plazo' },
  { plataforma: 'Reels', formato: 'Corte 60s + subtítulos', color: '#E879F9', nota: 'Mayor alcance inicial' },
  { plataforma: 'TikTok', formato: 'Corte 30s directo', color: '#69C9D0', nota: 'Alcance joven' },
  { plataforma: 'Shorts', formato: 'Vertical 60s', color: '#FF0000', nota: 'YouTube descubrimiento' },
  { plataforma: 'LinkedIn', formato: 'Post + 1 imagen clave', color: '#0077B5', nota: 'B2B / PYMEs' },
]

const ESTRUCTURA_VIDEO = `# ESTRUCTURA DEL GUIÓN (8-12 min)

## 00:00–00:30 — HOOK (obligatorio)
- Frase de apertura que genera curiosidad o dolor
- Mostrar el resultado FINAL primero
- "En este video vas a aprender X para que puedas Y"

## 00:30–01:30 — CONTEXTO
- Por qué importa este tema HOY
- A quién le sirve específicamente
- Credencial rápida: "Yo uso esto con mis clientes en San Luis"

## 01:30–05:00 — DESARROLLO PASO A PASO
- Máximo 3-5 pasos claros
- Pantalla + narración sincronizadas
- Cada paso: QUÉ hacer → CÓMO hacerlo → POR QUÉ

## 05:00–07:30 — DEMOSTRACIÓN EN VIVO
- Mostrar el resultado real
- Si es un cliente real, mejor (con permiso)
- Errores comunes a evitar

## 07:30–08:30 — CALL TO ACTION
- Primario: "Dejame un comentario contando tu caso"
- Secundario: "Si querés que lo implemente en tu negocio, el link está abajo"
- Cierre: "Nos vemos en el próximo video"`

export default function YouTubePage() {
  const [guion, setGuion] = useState('')
  const [tema, setTema] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function generarGuion() {
    if (!tema.trim()) return
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/youtube/guion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, estructura: ESTRUCTURA_VIDEO }),
      })
      const data = await res.json()
      setResult(data.guion || data.error || 'Error generando guión')
    } catch {
      setResult('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              03 — YOUTUBE & MULTIMEDIA
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              Canal YouTube
            </h1>
            <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)' }}>
              Guiones IA · Repurposing · Estrategia de contenido audiovisual
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" style={{
              padding: '9px 18px', borderRadius: 8, background: '#FF0000',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#fff', textDecoration: 'none', fontWeight: 700,
            }}>
              YouTube Studio ↗
            </a>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Generador de guiones */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Generador de guiones · Claude Sonnet
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <input
              value={tema}
              onChange={e => setTema(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generarGuion()}
              placeholder='Ej: "Cómo automatizar los turnos de tu clínica con IA"'
              style={{
                flex: 1, minWidth: 280, padding: '10px 16px', borderRadius: 8,
                border: '1px solid var(--line)', background: 'var(--paper-2)',
                fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)', outline: 'none',
              }}
            />
            <button
              onClick={generarGuion}
              disabled={loading || !tema.trim()}
              style={{
                padding: '10px 24px', borderRadius: 8, background: loading ? 'var(--line)' : 'var(--lime)',
                border: 'none', cursor: loading ? 'default' : 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--ink)', fontWeight: 700,
              }}
            >
              {loading ? 'Generando...' : 'Generar guión'}
            </button>
          </div>

          {result && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                Guión generado
              </div>
              <textarea
                value={result}
                onChange={e => setResult(e.target.value)}
                rows={20}
                style={{
                  width: '100%', padding: '16px', borderRadius: 8,
                  border: '1px solid var(--line)', background: 'var(--paper-2)',
                  fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.7,
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* Pilares de contenido */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            4 pilares de contenido
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {PILARES.map(p => (
              <div key={p.titulo} style={{
                padding: 20, borderRadius: 12,
                border: `1px solid ${p.color}30`, background: p.color + '08',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                    {p.titulo}
                  </div>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 4, background: p.color + '20', color: p.color,
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    {p.tag}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.5 }}>
                  {p.desc}
                </div>
                <button
                  onClick={() => setTema(p.titulo)}
                  style={{
                    marginTop: 12, padding: '5px 12px', borderRadius: 6,
                    border: `1px solid ${p.color}50`, background: 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 9,
                    letterSpacing: '0.08em', textTransform: 'uppercase', color: p.color,
                  }}
                >
                  Usar como tema
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Repurposing */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Repurposing — 1 video → 5 formatos
          </div>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {REPURPOSING.map((r, i) => (
              <div key={r.plataforma} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
                borderBottom: i < REPURPOSING.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
                    {r.plataforma}
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)' }}>
                    {r.formato}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                }}>
                  {r.nota}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estructura del video */}
        <div style={{ background: 'var(--ink)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
            Estructura base de guión
          </div>
          <pre style={{
            fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {ESTRUCTURA_VIDEO}
          </pre>
        </div>

      {/* Equipo de YouTube */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            Equipo multimedia — consultores en tiempo real
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
            <AgentChat
              agent={GUIONISTA}
              suggestions={['Escribí el hook para un video sobre IA en peluquerías', 'Dame 5 ideas de títulos SEO para YouTube', 'Optimizá esta descripción para algoritmo']}
              collapsed={false}
            />
            <AgentChat
              agent={REEL_AGENT}
              suggestions={['Prompt para Freepik: reel mostrando resultados del turnero', 'Cómo corto este video para TikTok', 'Estructura de Reel de 30 segundos']}
              collapsed={true}
            />
            <AgentChat
              agent={NOVA_AGENT}
              suggestions={['Qué herramientas de video IA están saliendo ahora', 'Comparame Higgsfield vs Seedance', 'Tendencias de formato en YouTube 2025']}
              collapsed={true}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
