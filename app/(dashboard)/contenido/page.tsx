'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ContentFactory from './ContentFactory'

const INK = '#09090B'
const LIME = '#C6FF3D'

const PILARES = [
  {
    id: 'educativo', label: 'Educativo', emoji: '📚', pct: 40, color: '#8B5CF6',
    desc: 'Tips, tutoriales, "sabías que...", explicá tu servicio',
    ejemplos: ['5 errores al agendar un turno', 'Cómo funciona el pago con seña', 'Qué hace diferente a [negocio]'],
  },
  {
    id: 'venta', label: 'Venta', emoji: '💰', pct: 30, color: LIME,
    desc: 'Ofertas, testimonios, casos de éxito, CTA directo',
    ejemplos: ['Testimonio de cliente real', 'Promo de la semana', 'Reservá tu turno ahora'],
  },
  {
    id: 'comunidad', label: 'Comunidad', emoji: '🤝', pct: 20, color: '#22D3EE',
    desc: 'Detrás de escena, el equipo, el local, el proceso',
    ejemplos: ['Un día en [negocio]', 'Presentamos a [persona]', 'Así preparamos [servicio]'],
  },
  {
    id: 'entretenimiento', label: 'Entretenimiento', emoji: '🎉', pct: 10, color: '#F97316',
    desc: 'Humor, trends, algo inesperado que humanice la marca',
    ejemplos: ['Meme del rubro', 'Trend adaptado', 'Algo divertido que pasó hoy'],
  },
]

const PLAN_SEMANAL = [
  { dia: 'Lun', tipo: 'Carrusel', pilar: 'educativo', color: '#8B5CF6', emoji: '📑' },
  { dia: 'Mar', tipo: 'Reel',     pilar: 'venta',     color: LIME,       emoji: '🎬' },
  { dia: 'Mié', tipo: 'Post',     pilar: 'educativo', color: '#8B5CF6', emoji: '🖼️' },
  { dia: 'Jue', tipo: 'Carrusel', pilar: 'comunidad', color: '#22D3EE', emoji: '📑' },
  { dia: 'Vie', tipo: 'Post',     pilar: 'venta',     color: LIME,       emoji: '🖼️' },
]

const TABS = [
  { id: 'estrategia', n: '1', label: 'Estrategia', desc: 'Pilares y mix' },
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
  draft:     { label: 'Borrador',   color: 'rgba(255,255,255,0.3)' },
  scheduled: { label: 'Agendado',   color: '#FBBF24' },
  published: { label: 'Publicado',  color: '#4ade80' },
  approved:  { label: 'Aprobado',   color: '#60A5FA' },
}

const PILAR_COLOR: Record<string, string> = {
  educativo: '#8B5CF6', venta: LIME, comunidad: '#22D3EE', entretenimiento: '#F97316',
}

export default function ContenidoPage() {
  const [tab, setTab] = useState<string>('estrategia')
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

  const mixActual = posts.reduce((acc, p) => {
    if (p.pillar) acc[p.pillar] = (acc[p.pillar] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const totalPosts = posts.length || 1

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: INK, color: '#fff' }}>

      {/* ── Flow strip + tabs ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 28px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: tab === t.id ? `2px solid ${LIME}` : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: tab === t.id ? `${LIME}22` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${tab === t.id ? `${LIME}55` : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700,
                color: tab === t.id ? LIME : 'rgba(255,255,255,0.3)',
              }}>
                {t.n}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                  {t.label}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>
                  {t.desc}
                </div>
              </div>
              {i < TABS.length - 1 && (
                <div style={{ marginLeft: 10, color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>→</div>
              )}
            </button>
          ))}

          {/* External links on the right */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {[
              { href: 'https://www.instagram.com', label: '📸 IG', color: '#E1306C' },
              { href: 'https://www.canva.com', label: '🎨 Canva', color: '#7C3AED' },
              { href: 'https://www.freepik.com/pikaso', label: '✨ Freepik', color: '#DB2777' },
            ].map(tool => (
              <a key={tool.href} href={tool.href} target="_blank" rel="noopener noreferrer" style={{
                padding: '4px 10px', borderRadius: 6, fontFamily: 'var(--f-mono)', fontSize: 9,
                color: tool.color, background: tool.color + '15', border: `1px solid ${tool.color}30`,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                {tool.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 28px 0' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>
          DIVINIA OS · CONTENIDO
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
          Content Factory
        </h1>
      </div>

      {/* ── Tab 1: Estrategia ─────────────────────────────────────────── */}
      {tab === 'estrategia' && (
        <div style={{ padding: '4px 28px 40px' }}>

          {/* Mix bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
              Mix de contenido — 40 / 30 / 20 / 10
            </div>
            <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.06)' }}>
              {PILARES.map(p => (
                <div key={p.id} style={{ width: `${p.pct}%`, background: p.color, transition: 'width 0.3s' }} title={`${p.label} ${p.pct}%`} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {PILARES.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.4)' }}>{p.pct}% {p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pilar cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
            {PILARES.map(p => (
              <div key={p.id} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${p.color}25`,
                padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${p.color}18`, border: `1px solid ${p.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{p.pct}% del plan</div>
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: '0 0 10px' }}>
                  {p.desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {p.ejemplos.map((ej, i) => (
                    <div key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.25)', paddingLeft: 10, borderLeft: `2px solid ${p.color}30` }}>
                      {ej}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Plan semanal */}
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              Plan semanal base
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLAN_SEMANAL.map(d => (
                <div key={d.dia} style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: `1px solid ${d.color}25`,
                  padding: '12px 16px', flex: '1 1 120px',
                }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{d.dia}</div>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{d.emoji}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: d.color, fontWeight: 700 }}>{d.tipo}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{d.pilar}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => setTab('crear')}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: LIME, color: INK, fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Crear contenido con IA →
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 2: Crear ──────────────────────────────────────────────── */}
      {tab === 'crear' && (
        <div style={{ background: '#F4F4F5', minHeight: 'calc(100% - 120px)' }}>
          <ContentFactory />
        </div>
      )}

      {/* ── Tab 3: Feed ───────────────────────────────────────────────── */}
      {tab === 'feed' && (
        <div style={{ padding: '16px 28px 40px' }}>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>Estado:</span>
            {['todos', 'draft', 'scheduled', 'approved', 'published'].map(s => {
              const sm = STATUS_MAP[s]
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '4px 10px', borderRadius: 20, border: `1px solid ${statusFilter === s ? (sm?.color ?? LIME) : 'rgba(255,255,255,0.1)'}`,
                  background: statusFilter === s ? `${sm?.color ?? LIME}18` : 'transparent',
                  color: statusFilter === s ? (sm?.color ?? LIME) : 'rgba(255,255,255,0.3)',
                  fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer',
                }}>
                  {s === 'todos' ? 'Todos' : sm?.label ?? s}
                </button>
              )
            })}
            <Link href="/redes/create" style={{
              marginLeft: 'auto', padding: '6px 14px', borderRadius: 8,
              background: LIME, color: INK, fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
              textDecoration: 'none',
            }}>
              + Nuevo post
            </Link>
          </div>

          {loadingPosts ? (
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.2)', padding: 40, textAlign: 'center' }}>Cargando...</div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)', padding: 48, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>No hay posts todavía</div>
              <button onClick={() => setTab('crear')} style={{
                marginTop: 14, padding: '8px 20px', borderRadius: 8, border: 'none',
                background: LIME, color: INK, fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>
                Crear con IA →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredPosts.map(p => {
                const sm = STATUS_MAP[p.status] ?? { label: p.status, color: 'rgba(255,255,255,0.3)' }
                const pc = PILAR_COLOR[p.pillar ?? ''] ?? 'rgba(255,255,255,0.2)'
                const isExpanded = expandedPost === p.id
                return (
                  <div key={p.id} style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden',
                  }}>
                    <div
                      onClick={() => setExpandedPost(isExpanded ? null : p.id)}
                      style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      {/* Pilar dot */}
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc, flexShrink: 0 }} />

                      {/* Caption preview */}
                      <div style={{ flex: 1, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.caption}
                      </div>

                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {p.clients && (
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
                            {p.clients.company_name}
                          </span>
                        )}
                        {p.pillar && (
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: pc }}>{p.pillar}</span>
                        )}
                        {p.scheduled_for && (
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
                            📅 {new Date(p.scheduled_for).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                        <span style={{
                          fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 20,
                          background: `${sm.color}18`, color: sm.color, border: `1px solid ${sm.color}33`,
                        }}>{sm.label}</span>
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '12px 0 10px', whiteSpace: 'pre-wrap' }}>
                          {p.caption}
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => navigator.clipboard.writeText(p.caption)}
                            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer' }}
                          >
                            Copiar caption
                          </button>
                          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{
                            padding: '5px 12px', borderRadius: 6, border: '1px solid #E1306C33',
                            background: '#E1306C15', color: '#E1306C', fontFamily: 'var(--f-mono)', fontSize: 9, textDecoration: 'none',
                          }}>
                            Abrir IG ↗
                          </a>
                        </div>
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
        <div style={{ padding: '16px 28px 40px' }}>

          {/* Resumen */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Total posts', valor: posts.length, color: '#60A5FA' },
              { label: 'Publicados', valor: posts.filter(p => p.status === 'published').length, color: '#4ade80' },
              { label: 'Agendados', valor: posts.filter(p => p.status === 'scheduled').length, color: '#FBBF24' },
              { label: 'Borradores', valor: posts.filter(p => p.status === 'draft').length, color: 'rgba(255,255,255,0.3)' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
                padding: '14px 16px',
              }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: m.color }}>{m.valor}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Mix real vs objetivo */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              Mix real vs objetivo
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PILARES.map(p => {
                const real = Math.round(((mixActual[p.id] ?? 0) / totalPosts) * 100)
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: p.color }}>{p.emoji} {p.label}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                        {real}% real · {p.pct}% objetivo
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ width: `${Math.min(real, p.pct)}%`, background: p.color, opacity: 0.9 }} />
                        {real > p.pct && <div style={{ width: `${real - p.pct}%`, background: p.color, opacity: 0.35 }} />}
                        {real < p.pct && <div style={{ width: `${p.pct - real}%`, background: 'rgba(255,255,255,0.08)', borderLeft: `2px dashed ${p.color}44` }} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Instagram placeholder */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
              Métricas de Instagram — conectar cuenta para ver alcance, impresiones y engagement
            </div>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', padding: '7px 18px', borderRadius: 8,
              background: '#E1306C20', color: '#E1306C', border: '1px solid #E1306C30',
              fontFamily: 'var(--f-mono)', fontSize: 10, textDecoration: 'none',
            }}>
              📸 Abrir Instagram ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
