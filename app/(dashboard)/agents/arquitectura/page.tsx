import { DEPARTMENTS, NUCLEUS_AGENTS, GRAND_FLOW, PRODUCTS, DepartmentId } from '@/lib/nucleus/index'
import Link from 'next/link'

const INK = '#09090B'
const LIME = '#C6FF3D'

// Pipeline stages from GRAND_FLOW
const PIPELINE: Array<{
  fase: string
  icono: string
  color: string
  tipo: 'main' | 'parallel'
  agentes: string[]  // agent ids
  desc: string
}> = [
  {
    fase: 'Entrada',
    icono: '📥',
    color: '#06B6D4',
    tipo: 'main',
    desc: '24/7 automático',
    agentes: ['prospector'],
  },
  {
    fase: 'Calificación',
    icono: '⚖️',
    color: '#8B5CF6',
    tipo: 'main',
    desc: '< 1 minuto, score 0-100',
    agentes: ['calificador-leads'],
  },
  {
    fase: 'Contacto',
    icono: '📞',
    color: '#F59E0B',
    tipo: 'main',
    desc: 'Multicanal automático',
    agentes: ['redactor-outreach', 'agente-voz', 'agente-seguimiento'],
  },
  {
    fase: 'Demo & Propuesta',
    icono: '📋',
    color: '#EC4899',
    tipo: 'main',
    desc: 'Cierre en el día',
    agentes: ['generador-propuestas', 'closer'],
  },
  {
    fase: 'Cobro',
    icono: '💳',
    color: '#10B981',
    tipo: 'main',
    desc: 'MercadoPago automático',
    agentes: ['facturador'],
  },
  {
    fase: 'Entrega',
    icono: '🚀',
    color: '#3B82F6',
    tipo: 'main',
    desc: 'Cliente activo en < 1h',
    agentes: ['gestor-onboarding', 'dev-fullstack', 'qa-tester'],
  },
  {
    fase: 'Retención',
    icono: '🔒',
    color: '#10B981',
    tipo: 'main',
    desc: 'Retención + upsell',
    agentes: ['agente-soporte', 'gestor-retencion', 'agente-upsell'],
  },
  {
    fase: 'Content Factory',
    icono: '🎬',
    color: '#EC4899',
    tipo: 'parallel',
    desc: 'Diario, en paralelo',
    agentes: ['estratega-contenido', 'copywriter', 'ingeniero-prompts-imagen', 'ingeniero-prompts-video', 'editor-contenido', 'evaluador-contenido', 'publicador'],
  },
  {
    fase: 'Publicidad',
    icono: '📡',
    color: '#F59E0B',
    tipo: 'parallel',
    desc: 'Semanal — Meta Ads',
    agentes: ['estratega-ads', 'creador-anuncios', 'gestor-meta-ads'],
  },
  {
    fase: 'Cerebro / CEO',
    icono: '🧠',
    color: LIME,
    tipo: 'parallel',
    desc: '9am diario — orquestación',
    agentes: ['orquestador-ceo', 'gestor-memoria', 'analista-datos', 'estratega-general'],
  },
  {
    fase: 'Finanzas',
    icono: '💰',
    color: '#10B981',
    tipo: 'parallel',
    desc: 'Semanal / mensual',
    agentes: ['contador', 'controlador-saas', 'gestor-afip'],
  },
  {
    fase: 'Inteligencia',
    icono: '🔬',
    color: '#8B5CF6',
    tipo: 'parallel',
    desc: 'Semanal — market research',
    agentes: ['investigador-mercado', 'detector-herramientas'],
  },
]

const AGENT_MAP = Object.fromEntries(NUCLEUS_AGENTS.map(a => [a.id, a]))
const MODEL_COLORS: Record<string, string> = {
  haiku: '#06B6D4',
  sonnet: '#8B5CF6',
  opus: '#F59E0B',
}

export default function ArquitecturaPage() {
  const mainPipeline = PIPELINE.filter(p => p.tipo === 'main')
  const parallelTracks = PIPELINE.filter(p => p.tipo === 'parallel')

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', color: INK }}>

      {/* Header */}
      <div style={{ background: INK, padding: '24px 32px 28px' }}>
        <Link href="/agents" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'block', marginBottom: 20 }}>
          ← Volver a Agentes
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
              DIVINIA NUCLEUS — Arquitectura Completa
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 36px)', color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>
              El Gran Flujo
            </h1>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0' }}>
              {NUCLEUS_AGENTS.length} agentes · {Object.keys(DEPARTMENTS).length} departamentos · Todo corre solo
            </p>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'Agentes Haiku', val: NUCLEUS_AGENTS.filter(a => a.modelo === 'haiku').length, color: '#06B6D4' },
              { label: 'Agentes Sonnet', val: NUCLEUS_AGENTS.filter(a => a.modelo === 'sonnet').length, color: '#8B5CF6' },
              { label: 'Agentes Opus', val: NUCLEUS_AGENTS.filter(a => a.modelo === 'opus').length, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 22, color: s.color, letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1300, margin: '0 auto' }}>

        {/* ── MAIN PIPELINE ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 14 }}>
            Pipeline principal de ventas
          </div>

          {/* Stage flow */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
            {mainPipeline.map((stage, i) => {
              const stageAgents = stage.agentes.map(id => AGENT_MAP[id]).filter(Boolean)
              return (
                <div key={stage.fase} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                  {/* Stage card */}
                  <div style={{ width: 150, background: '#fff', borderRadius: 12, border: `1.5px solid ${stage.color}30`, padding: '14px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>{stage.icono}</span>
                      <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 12, color: INK }}>{stage.fase}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: '#71717A', marginBottom: 10, letterSpacing: '0.02em' }}>
                      {stage.desc}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {stageAgents.map(a => (
                        <div key={a.id} style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 7px',
                          background: `${stage.color}08`, borderRadius: 6, border: `1px solid ${stage.color}18`,
                        }}>
                          <span style={{ fontSize: 10 }}>{a.emoji}</span>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: INK, lineHeight: 1.2 }}>{a.nombre}</span>
                          <span style={{
                            marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 7, padding: '1px 4px',
                            borderRadius: 3, background: `${MODEL_COLORS[a.modelo]}14`, color: MODEL_COLORS[a.modelo],
                          }}>
                            {a.modelo[0].toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow between stages */}
                  {i < mainPipeline.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20, flexShrink: 0 }}>
                      <div style={{ width: 20, height: 1, background: '#D4D4D8' }} />
                      <div style={{ width: 0, height: 0, borderLeft: '5px solid #D4D4D8', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── PARALLEL TRACKS ─────────────────────────────────────────── */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 14 }}>
            Tracks en paralelo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {parallelTracks.map(track => {
              const trackAgents = track.agentes.map(id => AGENT_MAP[id]).filter(Boolean)
              return (
                <div key={track.fase} style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${track.color}25`, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{track.icono}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 13, color: INK }}>{track.fase}</div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: '#71717A' }}>{track.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                    {trackAgents.map(a => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: `${track.color}08`, borderRadius: 6, border: `1px solid ${track.color}18` }}>
                        <span style={{ fontSize: 10 }}>{a.emoji}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: INK }}>{a.nombre}</span>
                        <span style={{
                          fontFamily: 'var(--f-mono)', fontSize: 7, padding: '1px 4px', borderRadius: 3,
                          background: `${MODEL_COLORS[a.modelo]}14`, color: MODEL_COLORS[a.modelo],
                        }}>
                          {a.modelo[0].toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── DEPARTMENTS GRID ─────────────────────────────────────────── */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 14 }}>
            Los 12 departamentos — clickeá para ver agentes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {(Object.entries(DEPARTMENTS) as [DepartmentId, typeof DEPARTMENTS[DepartmentId]][]).map(([id, dept]) => {
              const deptAgents = NUCLEUS_AGENTS.filter(a => a.depto === id)
              return (
                <Link key={id} href={`/agents/${id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: 12, border: '1px solid #E4E4E7', padding: '14px 16px',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 16,
                        background: `${dept.color}14`,
                        border: `1px solid ${dept.color}25`,
                      }}>
                        {dept.emoji}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 12, color: INK }}>{dept.nombre}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: '#71717A' }}>{deptAgents.length} agentes</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: '#71717A', lineHeight: 1.45 }}>
                      {dept.mision.slice(0, 80)}...
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                      {deptAgents.slice(0, 4).map(a => (
                        <span key={a.id} style={{
                          fontFamily: 'var(--f-mono)', fontSize: 7.5, padding: '2px 6px', borderRadius: 3,
                          background: `${dept.color}10`, color: dept.color, border: `1px solid ${dept.color}20`,
                        }}>
                          {a.emoji} {a.nombre}
                        </span>
                      ))}
                      {deptAgents.length > 4 && (
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 7.5, padding: '2px 6px', color: '#A1A1AA' }}>
                          +{deptAgents.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── GRAND FLOW RAW ─────────────────────────────────────────── */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 14 }}>
            GRAND FLOW — mapa completo del sistema
          </div>
          <div style={{
            background: INK, borderRadius: 14, padding: '20px 24px',
            fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7, whiteSpace: 'pre-wrap', letterSpacing: '0.01em',
          }}>
            {GRAND_FLOW.trim()}
          </div>
        </div>

      </div>
    </div>
  )
}
