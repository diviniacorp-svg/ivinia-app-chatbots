'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

const INK = '#0E0E0E'
const LIME = '#C6FF3D'
const PAPER = '#F6F5F2'
const LINE = '#E2E0DA'
const MUTED = '#8E8B82'

interface ContentPost {
  id: string
  titulo: string
  caption: string | null
  fecha: string
  plataforma: string
  tipo: string | null
  status: string
  pilar: string | null
  imagen_url: string | null
  ig_media_id: string | null
  social_client_id: string | null
  publish_at: string | null
}

const TIPO_LABEL: Record<string, string> = {
  post: '📸 Post', reel: '🎬 Reel', carrusel: '🔀 Carrusel', story: '⏱ Story',
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  publicado:     { label: 'Publicado',   color: '#16A34A' },
  listo:         { label: 'Listo',       color: '#0891B2' },
  planificado:   { label: 'Planificado', color: '#D97706' },
  en_produccion: { label: 'Producción',  color: '#7C3AED' },
  fallido:       { label: 'Fallido',     color: '#DC2626' },
}

const PILAR_COLOR: Record<string, string> = {
  educativo: '#7C3AED', venta: '#16A34A', comunidad: '#0284C7', entretenimiento: '#EA580C',
}

export default function RedesPage() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('todos')

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const r = await fetch('/api/social/calendar')
      const d = await r.json()
      setPosts(d.posts ?? [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = posts.filter(p => filter === 'todos' || p.status === filter)

  const stats = {
    total: posts.length,
    publicados: posts.filter(p => p.status === 'publicado').length,
    listos: posts.filter(p => p.status === 'listo').length,
    planificados: posts.filter(p => p.status === 'planificado').length,
  }

  async function handlePublish(postId: string) {
    setPublishing(postId)
    try {
      const r = await fetch('/api/social/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      const d = await r.json()
      if (d.ok) setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'publicado' } : p))
      else alert(d.result?.results?.[0]?.error ?? d.error ?? 'Error publicando')
    } finally {
      setPublishing(null)
    }
  }

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* Marketing flow strip */}
      <div style={{ background: INK, padding: '7px 28px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginRight: 6 }}>Marketing:</span>
        {([
          { href: '/contenido', label: '✨ Contenido', active: false },
          { href: '/publicidad', label: '📢 Publicidad', active: false },
          { href: '/redes', label: '📱 Redes', active: true },
          { href: '/outreach', label: '📞 Outreach', active: false },
        ] as const).map((s, i, arr) => (
          <span key={s.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href={s.href} style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, textDecoration: 'none', color: s.active ? LIME : 'rgba(255,255,255,0.3)', borderBottom: s.active ? `1px solid ${LIME}` : 'none', paddingBottom: s.active ? 1 : 0 }}>{s.label}</Link>
            {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>→</span>}
          </span>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            📸 @autom_atia ↗
          </a>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${LINE}`, padding: '18px 28px 16px' }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>DIVINIA OS · MARKETING</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Redes Sociales</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/redes/calendar" style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${LINE}`, color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 10, textDecoration: 'none' }}>
              📅 Almanaque
            </Link>
            <Link href="/contenido" style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${LINE}`, color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 10, textDecoration: 'none' }}>
              ✨ Crear con IA
            </Link>
            <Link href="/redes/create" style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
              + Post manual
            </Link>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ padding: '16px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { key: 'todos',      label: 'Total',       valor: stats.total,        color: INK         },
          { key: 'publicado',  label: 'Publicados',  valor: stats.publicados,   color: '#16A34A'   },
          { key: 'listo',      label: 'Listos ✓',   valor: stats.listos,       color: '#0891B2'   },
          { key: 'planificado',label: 'Planificados',valor: stats.planificados, color: '#D97706'   },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            textAlign: 'left', background: '#fff', borderRadius: 10,
            border: `1px solid ${filter === s.key ? s.color : LINE}`,
            padding: '12px 16px', cursor: 'pointer', transition: 'border-color 0.15s',
          }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.valor}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: MUTED, marginTop: 4 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ padding: '16px 28px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${LINE}`, borderTopColor: INK, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: `1px dashed ${LINE}`, padding: 48, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: MUTED, marginBottom: 14 }}>
              {filter === 'todos' ? 'Sin posts en el calendario' : `Sin posts "${STATUS_MAP[filter]?.label ?? filter}"`}
            </div>
            <Link href="/contenido" style={{ padding: '8px 20px', borderRadius: 8, background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
              Crear con IA →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(post => {
              const isExpanded = expandedId === post.id
              const preview = post.caption?.split('\n')[0]?.slice(0, 120) ?? post.titulo?.slice(0, 120) ?? ''
              const sm = STATUS_MAP[post.status] ?? { label: post.status, color: MUTED }
              const pc = PILAR_COLOR[post.pilar ?? ''] ?? MUTED

              return (
                <div key={post.id} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px' }}>

                    {/* Thumbnail */}
                    <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, background: PAPER, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${LINE}` }}>
                      {post.imagen_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 18, opacity: 0.35 }}>
                          {post.tipo === 'reel' ? '🎬' : post.tipo === 'carrusel' ? '🔀' : '📸'}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: MUTED }}>{post.fecha}</span>
                        {post.tipo && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, background: PAPER, borderRadius: 20, padding: '1px 6px', border: `1px solid ${LINE}` }}>{TIPO_LABEL[post.tipo] ?? post.tipo}</span>}
                        {post.pilar && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: pc, background: `${pc}12`, borderRadius: 20, padding: '1px 6px' }}>{post.pilar}</span>}
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: sm.color, background: `${sm.color}12`, border: `1px solid ${sm.color}25`, borderRadius: 20, padding: '1px 6px' }}>{sm.label}</span>
                        {post.ig_media_id && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: '#16A34A' }}>✓ IG</span>}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setExpandedId(isExpanded ? null : post.id)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${LINE}`, background: '#fff', color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer' }}>
                        {isExpanded ? 'Cerrar' : 'Ver'}
                      </button>
                      <Link href={`/redes/${post.id}`} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${LINE}`, background: '#fff', color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 9, textDecoration: 'none' }}>
                        ✏️
                      </Link>
                      {post.status === 'listo' && (
                        <button onClick={() => handlePublish(post.id)} disabled={publishing === post.id} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: publishing === post.id ? `${INK}80` : INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, cursor: publishing === post.id ? 'not-allowed' : 'pointer' }}>
                          {publishing === post.id ? '...' : '▶ Publicar'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && post.caption && (
                    <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${LINE}` }}>
                      <pre style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: MUTED, whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: '10px 0 8px', background: PAPER, borderRadius: 8, padding: '10px 12px', maxHeight: 200, overflowY: 'auto' }}>
                        {post.caption}
                      </pre>
                      <button onClick={() => navigator.clipboard.writeText(post.caption ?? '')} style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${LINE}`, background: '#fff', color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer' }}>
                        Copiar caption
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {stats.planificados > 0 && stats.listos === 0 && (
          <div style={{ marginTop: 14, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 16px' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#1D4ED8' }}>
              Generando imágenes en background — los posts pasarán a "Listo" cuando estén.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
