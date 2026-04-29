'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { STRATEGY_TEMPLATES } from '@/lib/nucleus/index'

const INK = '#09090B'
const LIME = '#C6FF3D'

type Project = {
  id: string
  nombre: string
  tagline: string | null
  descripcion: string | null
  tipo: string
  categoria: string | null
  status: string
  icon: string
  color: string
  progreso: number
  estrategia: {
    objetivo?: string
    approach?: string
    kpis_objetivo?: Array<{ label: string; meta: string }>
    riesgos?: string[]
    notas?: string
  }
  scope: {
    deliverables?: string[]
    incluye?: string[]
    no_incluye?: string[]
    hitos?: Array<{ semana: string; descripcion: string }>
  }
  proximos: string[]
  kpis: Array<{ label: string; valor: string; meta?: string }>
  href: string | null
  fecha_inicio: string | null
  fecha_entrega: string | null
  presupuesto_ars: number | null
  created_at: string
  updated_at: string
  clients?: { id: string; company_name: string; rubro: string; status: string; phone: string; email: string } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'activo':        { label: 'Activo',        color: '#4ade80' },
  'en-desarrollo': { label: 'En desarrollo', color: '#FBBF24' },
  'idea':          { label: 'Idea',          color: '#60A5FA' },
  'pausado':       { label: 'Pausado',       color: '#F87171' },
  'completado':    { label: 'Completado',    color: '#A78BFA' },
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'resumen' | 'estrategia' | 'scope' | 'kpis'>('resumen')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedEstrategia, setEditedEstrategia] = useState('')
  const [editedProximo, setEditedProximo] = useState('')
  const [generatingAI, setGeneratingAI] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => { setProject(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function updateField(field: string, value: unknown) {
    if (!project) return
    setSaving(true)
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProject(updated)
    }
    setSaving(false)
  }

  async function generateAIStrategy() {
    if (!project) return
    setGeneratingAI(true)
    const template = STRATEGY_TEMPLATES[project.categoria ?? '']
    if (template) {
      const autoStrategy = {
        objetivo: template.objetivo,
        approach: `Proyecto ${project.categoria} para ${project.clients?.company_name ?? 'el cliente'}`,
        kpis_objetivo: template.kpis,
        riesgos: template.riesgos,
        notas: project.estrategia?.notas ?? '',
      }
      await updateField('estrategia', autoStrategy)
      await updateField('proximos', template.scope_default)
      await updateField('kpis', template.kpis.map(k => ({ label: k.label, valor: '-', meta: k.meta })))
    }
    setGeneratingAI(false)
  }

  async function addProximo() {
    if (!project || !editedProximo.trim()) return
    const updated = [...(project.proximos ?? []), editedProximo.trim()]
    await updateField('proximos', updated)
    setEditedProximo('')
  }

  async function removeProximo(idx: number) {
    if (!project) return
    const updated = project.proximos.filter((_, i) => i !== idx)
    await updateField('proximos', updated)
  }

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: INK, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>
      Cargando...
    </div>
  )

  if (!project) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: INK, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>
      Proyecto no encontrado
    </div>
  )

  const status = STATUS_MAP[project.status] ?? { label: project.status, color: 'rgba(255,255,255,0.4)' }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: INK, color: '#fff', padding: '24px 28px' }}>

      {/* Breadcrumb */}
      <Link href="/proyectos" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
        ← Proyectos
      </Link>

      {/* Header del proyecto */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          background: `${project.color}20`, border: `1px solid ${project.color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>{project.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              {project.nombre}
            </h1>
            <div style={{
              fontFamily: 'var(--f-mono)', fontSize: 8, padding: '3px 9px', borderRadius: 20,
              background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}33`,
            }}>{status.label}</div>
          </div>
          {project.tagline && (
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{project.tagline}</div>
          )}
          {project.clients && (
            <Link href={`/clientes/${project.clients.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontFamily: 'var(--f-mono)', fontSize: 9, color: '#60A5FA', textDecoration: 'none' }}>
              👥 {project.clients.company_name} · {project.clients.rubro}
            </Link>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Status selector */}
          <select value={project.status} onChange={e => updateField('status', e.target.value)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '5px 10px', color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 9,
            cursor: 'pointer', outline: 'none',
          }}>
            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progreso */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Progreso general</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="range" min={0} max={100} value={project.progreso}
              onChange={e => setProject(p => p ? { ...p, progreso: +e.target.value } : p)}
              onMouseUp={e => updateField('progreso', +(e.target as HTMLInputElement).value)}
              style={{ width: 120, accentColor: project.color }} />
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: project.color, fontWeight: 700, minWidth: 36 }}>
              {project.progreso}%
            </div>
          </div>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
          <div style={{ width: `${project.progreso}%`, height: '100%', background: project.color, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Info compacta */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {project.fecha_entrega && (
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            📅 Entrega: <span style={{ color: '#fff' }}>{new Date(project.fecha_entrega).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        )}
        {project.presupuesto_ars && (
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            💰 Presupuesto: <span style={{ color: '#fff' }}>${project.presupuesto_ars.toLocaleString('es-AR')}</span>
          </div>
        )}
        {project.categoria && (
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            🏷️ Categoría: <span style={{ color: '#fff' }}>{project.categoria}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
        {([['resumen', 'Resumen'], ['estrategia', 'Estrategia'], ['scope', 'Scope'], ['kpis', 'KPIs']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: 'var(--f-mono)', fontSize: 10,
            color: tab === key ? '#fff' : 'rgba(255,255,255,0.35)',
            borderBottom: `2px solid ${tab === key ? LIME : 'transparent'}`,
            marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {/* Tab: Resumen */}
      {tab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Descripción */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
              Descripción
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              {project.descripcion || <span style={{ opacity: 0.3 }}>Sin descripción</span>}
            </div>
          </div>

          {/* Próximos pasos */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
              Próximos pasos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(project.proximos ?? []).map((paso, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: project.color, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.6)', flex: 1 }}>{paso}</div>
                  <button onClick={() => removeProximo(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12, padding: 0 }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <input value={editedProximo} onChange={e => setEditedProximo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addProximo()}
                placeholder="Agregar paso..." style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '6px 10px', color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 9, outline: 'none',
                }} />
              <button onClick={addProximo} style={{ background: `${LIME}18`, border: `1px solid ${LIME}33`, borderRadius: 6, padding: '6px 10px', color: LIME, fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer' }}>
                +
              </button>
            </div>
          </div>

          {/* Cliente */}
          {project.clients && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
                Cliente
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                {project.clients.company_name}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                {project.clients.rubro}
              </div>
              {project.clients.phone && (
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>📞 {project.clients.phone}</div>
              )}
              <Link href={`/clientes/${project.clients.id}`} style={{ display: 'inline-block', marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 9, color: '#60A5FA', textDecoration: 'none' }}>
                Ver cliente →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab: Estrategia */}
      {tab === 'estrategia' && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={generateAIStrategy} disabled={generatingAI} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${LIME}44`,
              background: `${LIME}12`, color: LIME, fontFamily: 'var(--f-mono)', fontSize: 9,
              cursor: generatingAI ? 'not-allowed' : 'pointer',
            }}>
              {generatingAI ? '⏳ Generando...' : `⚡ Auto-completar desde template ${project.categoria ?? ''}`}
            </button>
          </div>

          {[
            { key: 'objetivo', label: 'Objetivo del proyecto', placeholder: '¿Qué resultado concreto queremos lograr para el cliente?' },
            { key: 'approach', label: 'Approach y enfoque', placeholder: 'Cómo lo vamos a hacer, en qué orden, con qué herramientas...' },
            { key: 'notas', label: 'Notas y aprendizajes', placeholder: 'Insights del cliente, restricciones, preferencias...' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>
                {field.label}
              </label>
              <textarea
                value={(project.estrategia?.[field.key as keyof typeof project.estrategia] as string) ?? ''}
                onChange={e => setProject(p => p ? { ...p, estrategia: { ...p.estrategia, [field.key]: e.target.value } } : p)}
                onBlur={e => updateField('estrategia', { ...project.estrategia, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '10px 12px', color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 10,
                  outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 80, lineHeight: 1.6,
                }} />
            </div>
          ))}

          {/* Riesgos */}
          <div style={{ background: 'rgba(248,113,113,0.06)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.15)', padding: 16 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(248,113,113,0.7)', marginBottom: 10 }}>
              Riesgos y mitigaciones
            </div>
            {(project.estrategia?.riesgos ?? []).map((r, i) => (
              <div key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#F87171' }}>⚠</span>
                {r}
              </div>
            ))}
            {(!project.estrategia?.riesgos || project.estrategia.riesgos.length === 0) && (
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                Usá el auto-completar para importar riesgos del template
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Scope */}
      {tab === 'scope' && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20, marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
              Deliverables / Entregables
            </div>
            {(project.proximos ?? []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${project.color}44`, background: `${project.color}08`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: project.color, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.6)', flex: 1 }}>{item}</div>
              </div>
            ))}
            {(project.proximos ?? []).length === 0 && (
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.2)', padding: '8px 0' }}>
                Agregá entregables desde la pestaña Resumen
              </div>
            )}
          </div>

          {STRATEGY_TEMPLATES[project.categoria ?? ''] && (
            <div style={{ background: 'rgba(198,255,61,0.04)', borderRadius: 10, border: '1px solid rgba(198,255,61,0.1)', padding: 18 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: LIME, marginBottom: 10 }}>
                Template estándar para {project.categoria}
              </div>
              {STRATEGY_TEMPLATES[project.categoria ?? ''].scope_default.map((item, i) => (
                <div key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4, display: 'flex', gap: 8 }}>
                  <span style={{ color: LIME }}>✓</span> {item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: KPIs */}
      {tab === 'kpis' && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {(project.kpis ?? []).map((kpi, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)', padding: 16,
              }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>{kpi.label}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, color: project.color, marginBottom: 4 }}>
                  {kpi.valor === '-' ? '—' : kpi.valor}
                </div>
                {kpi.meta && (
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
                    Meta: {kpi.meta}
                  </div>
                )}
              </div>
            ))}
          </div>
          {(project.kpis ?? []).length === 0 && (
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', padding: '20px 0' }}>
              Usá el auto-completar en la pestaña Estrategia para generar KPIs del template
            </div>
          )}

          {/* KPIs del template */}
          {STRATEGY_TEMPLATES[project.categoria ?? ''] && (
            <div style={{ marginTop: 20, background: 'rgba(198,255,61,0.04)', borderRadius: 10, border: '1px solid rgba(198,255,61,0.1)', padding: 18 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: LIME, marginBottom: 12 }}>
                KPIs estándar para {project.categoria}
              </div>
              {STRATEGY_TEMPLATES[project.categoria ?? ''].kpis.map((k, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{k.label}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: LIME }}>{k.meta}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {saving && (
        <div style={{ position: 'fixed', bottom: 20, right: 24, fontFamily: 'var(--f-mono)', fontSize: 9, color: LIME, background: INK, border: `1px solid ${LIME}44`, borderRadius: 6, padding: '6px 12px' }}>
          Guardando...
        </div>
      )}
    </div>
  )
}
