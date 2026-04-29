'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const INK = '#09090B'
const LIME = '#C6FF3D'

type Project = {
  id: string
  nombre: string
  tagline: string | null
  descripcion: string | null
  tipo: 'cliente' | 'producto-divinia' | 'interno'
  categoria: string | null
  status: string
  icon: string
  color: string
  progreso: number
  proximos: string[]
  kpis: Array<{ label: string; valor: string; meta?: string }>
  href: string | null
  fecha_entrega: string | null
  presupuesto_ars: number | null
  estrategia: Record<string, unknown>
  clients?: { id: string; company_name: string; rubro: string } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'activo':        { label: 'Activo',        color: '#4ade80' },
  'en-desarrollo': { label: 'En desarrollo', color: '#FBBF24' },
  'idea':          { label: 'Idea',          color: '#60A5FA' },
  'pausado':       { label: 'Pausado',       color: '#F87171' },
  'completado':    { label: 'Completado',    color: '#A78BFA' },
}

const CATEGORIAS: Record<string, { label: string; color: string }> = {
  turnero:         { label: 'Turnero', color: LIME },
  chatbot:         { label: 'Chatbot', color: '#60A5FA' },
  landing:         { label: 'Landing', color: '#38BDF8' },
  content_factory: { label: 'Content', color: '#F472B6' },
  nucleus:         { label: 'Nucleus', color: '#A78BFA' },
  ads:             { label: 'Ads',     color: '#FBBF24' },
  marketplace:     { label: 'Market',  color: '#38BDF8' },
}

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'cliente' | 'producto-divinia'>('cliente')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = projects
    .filter(p => p.tipo === tab)
    .filter(p => statusFilter === 'todos' || p.status === statusFilter)

  const clienteProjects = projects.filter(p => p.tipo === 'cliente')
  const diviniaProjects = projects.filter(p => p.tipo === 'producto-divinia')

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: INK, color: '#fff', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
            DIVINIA OS · PROYECTOS
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Proyectos
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/estrategia" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6 }}>
            ♟️ Estrategia
          </Link>
          <Link href="/proyectos/nuevo" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: INK, background: LIME, textDecoration: 'none', padding: '6px 14px', borderRadius: 6, fontWeight: 700 }}>
            + Nuevo proyecto
          </Link>
        </div>
      </div>

      {/* Resumen numérico */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Proyectos de clientes', valor: clienteProjects.length, color: '#60A5FA' },
          { label: 'En desarrollo', valor: projects.filter(p => p.status === 'en-desarrollo').length, color: '#FBBF24' },
          { label: 'Activos', valor: projects.filter(p => p.status === 'activo').length, color: '#4ade80' },
          { label: 'Productos DIVINIA', valor: diviniaProjects.length, color: LIME },
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', padding: '10px 14px', flex: 1 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 700, color: m.color }}>{m.valor}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3, width: 'fit-content' }}>
        {([['cliente', '🤝 Clientes'], ['producto-divinia', '🚀 Productos DIVINIA']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--f-mono)', fontSize: 10,
            background: tab === key ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: tab === key ? '#fff' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Filtros de estado */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['todos', 'en-desarrollo', 'activo', 'idea', 'pausado', 'completado'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '4px 10px', borderRadius: 20, border: `1px solid ${statusFilter === s ? (STATUS_MAP[s]?.color ?? LIME) : 'rgba(255,255,255,0.1)'}`,
            background: statusFilter === s ? `${STATUS_MAP[s]?.color ?? LIME}18` : 'transparent',
            color: statusFilter === s ? (STATUS_MAP[s]?.color ?? LIME) : 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer',
          }}>
            {s === 'todos' ? 'Todos' : STATUS_MAP[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Lista de proyectos */}
      {loading ? (
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.25)', padding: 40, textAlign: 'center' }}>
          Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)', padding: 48, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 28, marginBottom: 10 }}>📁</div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            {tab === 'cliente' ? 'No hay proyectos de clientes todavía' : 'No hay proyectos de productos'}
          </div>
          {tab === 'cliente' && (
            <Link href="/proyectos/nuevo" style={{ display: 'inline-block', marginTop: 14, fontFamily: 'var(--f-mono)', fontSize: 10, color: LIME, textDecoration: 'none' }}>
              Crear primer proyecto →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project: p }: { project: Project }) {
  const status = STATUS_MAP[p.status] ?? { label: p.status, color: 'rgba(255,255,255,0.4)' }
  const cat = CATEGORIAS[p.categoria ?? '']

  return (
    <Link href={p.tipo === 'cliente' ? `/proyectos/${p.id}` : (p.href ?? `/proyectos/${p.id}`)} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 18, cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}44`; (e.currentTarget as HTMLDivElement).style.background = `${p.color}08` }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: `${p.color}20`, border: `1px solid ${p.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>{p.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              {p.nombre}
            </div>
            {p.tagline && (
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.tagline}
              </div>
            )}
          </div>
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: 8, padding: '3px 8px', borderRadius: 20, flexShrink: 0,
            background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}33`,
          }}>
            {status.label}
          </div>
        </div>

        {/* Cliente (si aplica) */}
        {p.clients && (
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
            👥 {p.clients.company_name} · {p.clients.rubro}
          </div>
        )}

        {/* Descripción */}
        {p.descripcion && (
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {p.descripcion}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>Progreso</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: p.color }}>{p.progreso}%</div>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{ width: `${p.progreso}%`, height: '100%', background: p.color, borderRadius: 2 }} />
          </div>
        </div>

        {/* KPIs y categoría */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {cat && (
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 20,
              background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}33`,
            }}>{cat.label}</span>
          )}
          {p.kpis?.slice(0, 2).map((k, i) => (
            <span key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
              {k.label}: {k.valor}
            </span>
          ))}
          {p.fecha_entrega && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
              📅 {new Date(p.fecha_entrega).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
