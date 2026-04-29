'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ContentFactory from './ContentFactory'

const INK = '#0E0E0E'
const LIME = '#C6FF3D'
const PAPER = '#F6F5F2'
const LINE = '#E2E0DA'
const MUTED = '#8E8B82'

const PILARES = [
  {
    id: 'educativo', label: 'Educativo', emoji: '📚', pct: 40, color: '#7C3AED',
    desc: 'Tips, tutoriales, "sabías que...", explicá tu servicio',
    ejemplos: ['5 errores al agendar un turno', 'Cómo funciona el pago con seña', 'Qué hace diferente a [negocio]'],
  },
  {
    id: 'venta', label: 'Venta', emoji: '💰', pct: 30, color: '#16A34A',
    desc: 'Ofertas, testimonios, casos de éxito, CTA directo',
    ejemplos: ['Testimonio de cliente real', 'Promo de la semana', 'Reservá tu turno ahora'],
  },
  {
    id: 'comunidad', label: 'Comunidad', emoji: '🤝', pct: 20, color: '#0284C7',
    desc: 'Detrás de escena, el equipo, el local, el proceso',
    ejemplos: ['Un día en [negocio]', 'Presentamos a [persona]', 'Así preparamos [servicio]'],
  },
  {
    id: 'entretenimiento', label: 'Entretenimiento', emoji: '🎉', pct: 10, color: '#EA580C',
    desc: 'Humor, trends, algo inesperado que humanice la marca',
    ejemplos: ['Meme del rubro', 'Trend adaptado', 'Algo divertido que pasó hoy'],
  },
]

const PLAN_SEMANAL = [
  { dia: 'Lun', tipo: 'Carrusel', pilar: 'educativo', color: '#7C3AED', emoji: '📑' },
  { dia: 'Mar', tipo: 'Reel',     pilar: 'venta',     color: '#16A34A', emoji: '🎬' },
  { dia: 'Mié', tipo: 'Post',     pilar: 'educativo', color: '#7C3AED', emoji: '🖼️' },
  { dia: 'Jue', tipo: 'Carrusel', pilar: 'comunidad', color: '#0284C7', emoji: '📑' },
  { dia: 'Vie', tipo: 'Post',     pilar: 'venta',     color: '#16A34A', emoji: '🖼️' },
]

const TABS = [
  { id: 'estrategia', n: '1', label: 'Estrategia', desc: 'Pilares y mix 40/30/20/10' },
  { id: 'crear',      n: '2', label: 'Crear',      desc: 'IA genera caption + visual' },
  { id: 'feed',       n: '3', label: 'Feed',       desc: 'Posts y estados' },
  { id: 'metricas',   n: '4', label: 'Métricas',   desc: 'Qué funciona' },
]

type Post = {
  id: string
  caption: string
  scheduled_for: string | null
  status: string
  pillar: string | null
  format: string | null
  clients?: { company_name: string } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Borrador',  color: MUTED },
  scheduled: { label: 'Agendado', color: '#D97706' },
  published: { label: 'Publicado',color: '#16A34A' },
  approved:  { label: 'Aprobado', color: '#2563EB' },
}

const PILAR_COLOR: Record<string, string> = {
  educativo: '#7C3AED', venta: '#16A34A', comunidad: '#0284C7', entretenimiento: '#EA580C',
}

export default function ContenidoPage() {
  const [tab, setTab] = useState('estrategia')
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  useEffect(() => {
    if (tab === 'feed' || tab === 'metricas') {
      setLoadingPosts(true)
      fetch('/api/social/calendar')
        .then(r => r.json())
        .then(d => { setPosts(Array.isArray(d) ? d : []); setLoadingPosts(false) })
        .catch(() => setLoadingPosts(false))
    }
  }, [tab])

  const filteredPosts = posts.filter(p => statusFilter === 'todos' || p.status === statusFilter)
  const totalPosts = posts.length || 1
  const mixActual = posts.reduce((acc, p) => {
    if (p.pillar) acc[p.pillar] = (acc[p.pillar] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--f-mono)', fontSize: 10, cursor: 'pointer',
  }

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* ── Marketing flow strip ────────────────────────────────────── */}
      <div style={{ background: INK, padding: '7px 28px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginRight: 6 }}>Marketing:</span>
        {([
          { href: '/contenido', label: '✨ Contenido', active: true },
          { href: '/publicidad', label: '📢 Publicidad', active: false },
          { href: '/redes', label: '📱 Redes', active: false },
          { href: '/outreach', label: '📞 Outreach', active: false },
        ] as const).map((s, i, arr) => (
          <span key={s.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href={s.href} style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, textDecoration: 'none', color: s.active ? LIME : 'rgba(255,255,255,0.3)', borderBottom: s.active ? `1px solid ${LIME}` : 'none', paddingBottom: s.active ? 1 : 0 }}>{s.label}</Link>
            {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>→</span>}
          </span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[
            { href: 'https://www.instagram.com', label: '📸 IG' },
            { href: 'https://www.canva.com', label: '🎨 Canva' },
            { href: 'https://www.freepik.com/pikaso', label: '✨ Freepik' },
          ].map(t => (
            <a key={t.href} href={t.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              {t.label} ↗
            </a>
          ))}
        </div>
      </div>

      {/* ── Header + tabs ────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${LINE}` }}>
        <div style={{ padding: '18px 28px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>
              DIVINIA OS · MARKETING
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Contenido IA
            </h1>
          </div>
          <Link href="/publicidad" style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${LINE}`, color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 10, textDecoration: 'none', marginBottom: 8 }}>
            📢 Ver campañas →
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 28px' }}>
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? `2px solid ${LIME}` : '2px solid transparent',
            }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700,
                background: tab === t.id ? LIME : LINE, color: tab === t.id ? INK : MUTED,
                width: 18, height: 18, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{t.n}</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: tab === t.id ? INK : MUTED }}>
                {t.label}
              </span>
              {i < TABS.length - 1 && (
                <span style={{ color: LINE, fontSize: 12, marginLeft: 4 }}>→</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab 1: Estrategia ─────────────────────────────────────────── */}
      {tab === 'estrategia' && (
        <div style={{ padding: '24px 28px 40px' }}>

          {/* Mix bar */}
          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>
              Mix de contenido — 40 / 30 / 20 / 10
            </p>
            <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', background: LINE }}>
              {PILARES.map(p => (
                <div key={p.id} style={{ width: `${p.pct}%`, background: p.color }} title={`${p.label} ${p.pct}%`} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
              {PILARES.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: MUTED }}>{p.pct}% {p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pilares */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 20 }}>
            {PILARES.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '16px 18px', borderTop: `3px solid ${p.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED }}>{p.pct}% del plan</div>
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: MUTED, lineHeight: 1.5, margin: '0 0 10px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {p.ejemplos.map((ej, i) => (
                    <div key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: MUTED, paddingLeft: 10, borderLeft: `2px solid ${p.color}40` }}>
                      {ej}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Plan semanal */}
          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 14 }}>
              Plan semanal base
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {PLAN_SEMANAL.map(d => (
                <div key={d.dia} style={{ flex: 1, background: PAPER, borderRadius: 8, border: `1px solid ${LINE}`, padding: '12px 10px', textAlign: 'center', borderTop: `3px solid ${d.color}` }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 6 }}>{d.dia}</div>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{d.emoji}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: d.color, fontWeight: 700 }}>{d.tipo}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, marginTop: 2 }}>{d.pilar}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setTab('crear')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Crear contenido con IA →
          </button>
        </div>
      )}

      {/* ── Tab 2: Crear ──────────────────────────────────────────────── */}
      {tab === 'crear' && (
        <div style={{ background: PAPER }}>
          <ContentFactory />
        </div>
      )}

      {/* ── Tab 3: Feed ───────────────────────────────────────────────── */}
      {tab === 'feed' && (
        <div style={{ padding: '20px 28px 40px' }}>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>Estado:</span>
            {['todos', 'draft', 'scheduled', 'approved', 'published'].map(s => {
              const sm = STATUS_MAP[s]
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${statusFilter === s ? (sm?.color ?? INK) : LINE}`,
                  background: statusFilter === s ? `${sm?.color ?? INK}15` : '#fff',
                  color: statusFilter === s ? (sm?.color ?? INK) : MUTED,
                  fontFamily: 'var(--f-mono)', fontSize: 9,
                }}>
                  {s === 'todos' ? 'Todos' : sm?.label ?? s}
                </button>
              )
            })}
            <Link href="/redes" style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
              Ver todo en Redes →
            </Link>
          </div>

          {loadingPosts ? (
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: MUTED, padding: 40, textAlign: 'center' }}>Cargando...</div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: `1px dashed ${LINE}`, padding: 48, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: MUTED, marginBottom: 14 }}>No hay posts todavía</div>
              <button onClick={() => setTab('crear')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                Crear con IA →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredPosts.map(p => {
                const sm = STATUS_MAP[p.status] ?? { label: p.status, color: MUTED }
                const pc = PILAR_COLOR[p.pillar ?? ''] ?? MUTED
                const isExpanded = expandedPost === p.id
                return (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, overflow: 'hidden' }}>
                    <div onClick={() => setExpandedPost(isExpanded ? null : p.id)} style={{ padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontFamily: 'var(--f-mono)', fontSize: 10, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.caption}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {p.pillar && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: pc }}>{p.pillar}</span>}
                        {p.scheduled_for && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED }}>📅 {new Date(p.scheduled_for).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>}
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 20, background: `${sm.color}15`, color: sm.color, border: `1px solid ${sm.color}30` }}>{sm.label}</span>
                        <span style={{ color: LINE, fontSize: 12 }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${LINE}` }}>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: MUTED, lineHeight: 1.6, margin: '10px 0 8px', whiteSpace: 'pre-wrap' }}>{p.caption}</p>
                        <button onClick={() => navigator.clipboard.writeText(p.caption)} style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${LINE}`, background: '#fff', color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer' }}>
                          Copiar caption
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Métricas ───────────────────────────────────────────── */}
      {tab === 'metricas' && (
        <div style={{ padding: '20px 28px 40px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Total posts',  valor: posts.length,                                     color: '#2563EB' },
              { label: 'Publicados',   valor: posts.filter(p => p.status === 'published').length, color: '#16A34A' },
              { label: 'Agendados',    valor: posts.filter(p => p.status === 'scheduled').length, color: '#D97706' },
              { label: 'Borradores',   valor: posts.filter(p => p.status === 'draft').length,     color: MUTED    },
            ].map(m => (
              <div key={m.label} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '14px 16px' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: m.color }}>{m.valor}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: MUTED, marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Mix real vs objetivo */}
          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 14 }}>Mix real vs objetivo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PILARES.map(p => {
                const real = Math.round(((mixActual[p.id] ?? 0) / totalPosts) * 100)
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: p.color, fontWeight: 700 }}>{p.emoji} {p.label}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: MUTED }}>{real}% real · {p.pct}% obj</span>
                    </div>
                    <div style={{ height: 6, background: LINE, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(real, 100)}%`, height: '100%', background: real >= p.pct ? p.color : `${p.color}60`, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: MUTED, marginBottom: 10 }}>
              Métricas de Instagram — conectar cuenta para ver alcance, impresiones y engagement
            </p>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '7px 18px', borderRadius: 8, background: '#E1306C15', color: '#E1306C', border: '1px solid #E1306C30', fontFamily: 'var(--f-mono)', fontSize: 10, textDecoration: 'none' }}>
              📸 Abrir Instagram ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
