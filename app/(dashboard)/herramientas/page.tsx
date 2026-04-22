'use client'
import { useState } from 'react'

// ─── N8n Generator ────────────────────────────────────────────────────────────

type N8nWorkflow = {
  nombre: string; descripcion: string; trigger: string
  pasos: Array<{ nodo: string; tipo: string; descripcion: string }>
  integraciones: string[]; tiempo_setup: string; caso_uso: string
  json_esquema: string; instrucciones: string
}

function N8nGenerator() {
  const [objetivo, setObjetivo] = useState('')
  const [rubro, setRubro] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<N8nWorkflow | null>(null)
  const [error, setError] = useState('')
  const [copiedJson, setCopiedJson] = useState(false)

  const generate = async () => {
    if (!objetivo.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/agents/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivo, rubro: rubro || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setter(true); setTimeout(() => setter(false), 2000)
  }

  const inp: React.CSSProperties = {
    background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10,
    padding: '11px 14px', fontSize: 14, color: 'var(--ink)', width: '100%',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  const TIPO_COLOR: Record<string, string> = {
    Trigger: '#C6FF3D', Action: '#38BDF8', Filter: '#F59E0B', AI: '#E879F9'
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 16, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>
            ¿QUÉ QUERÉS AUTOMATIZAR?
          </label>
          <textarea
            style={{ ...inp, height: 72, resize: 'none' }}
            placeholder="Ej: cuando un cliente llena el formulario de contacto, notificarme por WhatsApp y agregarlo automáticamente al CRM"
            value={objetivo}
            onChange={e => setObjetivo(e.target.value)}
          />
        </div>
        <div style={{ width: 180 }}>
          <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>
            RUBRO (opcional)
          </label>
          <input style={{ ...inp, height: 72 }} placeholder="peluquería, clínica..." value={rubro} onChange={e => setRubro(e.target.value)} />
        </div>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12, fontFamily: 'var(--f-mono)' }}>{error}</p>}
      <button onClick={generate} disabled={loading || !objetivo.trim()}
        style={{ background: loading ? 'rgba(198,255,61,0.4)' : 'var(--lime)', color: 'var(--ink)', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--f-mono)', letterSpacing: '0.02em' }}>
        {loading ? 'Generando workflow...' : 'Generar workflow →'}
      </button>

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header */}
          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--ink)', marginBottom: 6 }}>{result.nombre}</div>
            <div style={{ fontSize: 14, color: 'var(--muted-2)', marginBottom: 12 }}>{result.descripcion}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>⚡ Trigger: {result.trigger}</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>⏱ Setup: {result.tiempo_setup}</span>
              {result.integraciones?.map(i => (
                <span key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 4, color: 'var(--muted)' }}>{i}</span>
              ))}
            </div>
          </div>

          {/* Pasos del workflow */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>FLUJO DE NODOS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.pasos?.map((paso, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 10, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{paso.nodo}</span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', background: (TIPO_COLOR[paso.tipo] ?? '#999') + '22', color: TIPO_COLOR[paso.tipo] ?? '#999', padding: '1px 7px', borderRadius: 4, letterSpacing: '0.04em' }}>{paso.tipo}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>{paso.descripcion}</div>
                  </div>
                  {i < result.pasos.length - 1 && <div style={{ position: 'absolute', left: 12, marginTop: 28, width: 1, height: 8, background: 'var(--line)' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Caso de uso */}
          {result.caso_uso && (
            <div style={{ background: 'rgba(198,255,61,0.06)', border: '1px solid rgba(198,255,61,0.2)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 8 }}>CASO DE USO REAL</div>
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{result.caso_uso}</p>
            </div>
          )}

          {/* Instrucciones */}
          {result.instrucciones && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>CÓMO ARMARLO EN N8N</div>
              <pre style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0 }}>{result.instrucciones}</pre>
            </div>
          )}

          {/* JSON */}
          {result.json_esquema && (
            <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>ESQUEMA JSON</div>
                <button onClick={() => copy(result.json_esquema, setCopiedJson)}
                  style={{ fontFamily: 'var(--f-mono)', fontSize: 11, background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: 'var(--muted)' }}>
                  {copiedJson ? '✓ Copiado' : 'Copiar JSON'}
                </button>
              </div>
              <pre style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0, maxHeight: 300, overflowY: 'auto' }}>
                {typeof result.json_esquema === 'string' ? result.json_esquema : JSON.stringify(result.json_esquema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'n8n', label: 'Generador n8n', icon: '⚡', desc: 'Diseñá workflows de automatización con IA' },
]

export default function HerramientasPage() {
  const [tab, setTab] = useState('n8n')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)', padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          DIVINIA TOOLS
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 32, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          Herramientas IA
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted-2)', margin: 0 }}>
          Agentes especializados para automatizaciones, auditorías y generación de contenido.
        </p>
      </div>

      {/* Tool selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 12, border: '1px solid var(--line)',
              background: tab === t.id ? 'var(--ink)' : 'var(--paper)',
              color: tab === t.id ? 'var(--paper)' : 'var(--ink)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--f-display)' }}>{t.label}</div>
              <div style={{ fontSize: 11, opacity: 0.6, fontFamily: 'var(--f-mono)' }}>{t.desc}</div>
            </div>
          </button>
        ))}
        {/* Links directos a otros agentes */}
        {[
          { label: 'Auditoría digital', href: '/auditoria', icon: '🔍' },
          { label: 'Calificar lead', href: '/comercial', icon: '🎯' },
          { label: 'Generar propuesta', href: '/comercial', icon: '📄' },
        ].map(l => (
          <a key={l.label} href={l.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 12, border: '1px solid var(--line)',
              background: 'var(--paper)', color: 'var(--ink)',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
            <span style={{ fontSize: 18 }}>{l.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--f-display)' }}>{l.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono)' }}>ir →</div>
            </div>
          </a>
        ))}
      </div>

      {/* Tool content */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '32px' }}>
        {tab === 'n8n' && <N8nGenerator />}
      </div>
    </div>
  )
}
