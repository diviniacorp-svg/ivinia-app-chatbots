'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

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

const TIPO_BADGE: Record<string, string> = {
  post: '📸 Post', reel: '🎬 Reel', carrusel: '🔀 Carrusel', story: '⏱ Story', shorts: '▶ Shorts',
}
const STATUS_STYLE: Record<string, string> = {
  publicado: 'text-green-400 bg-green-400/10 border border-green-400/20',
  listo: 'text-lime-400 bg-lime-400/10 border border-lime-400/20',
  planificado: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  en_produccion: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  fallido: 'text-red-400 bg-red-400/10 border border-red-400/20',
}
const PILAR_COLOR: Record<string, string> = {
  educativo: '#6E56F8', entretenimiento: '#FF6B5B', venta: '#B5FF2C', comunidad: '#FFD166', detras_escena: '#06D6A0',
}

const DIVINIA_CLIENT_ID = '857cef01-16a1-4034-8286-1b9e44dcfda3'

export default function RedesPage() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'todos' | 'listos' | 'publicados' | 'planificados'>('todos')

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      // Use Supabase directly via social API
      const r = await fetch('/api/social/calendar')
      const d = await r.json()
      setPosts(d.posts ?? [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = posts.filter(p => {
    if (filter === 'listos') return p.status === 'listo'
    if (filter === 'publicados') return p.status === 'publicado'
    if (filter === 'planificados') return p.status === 'planificado'
    return true
  })

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      const d = await r.json()
      if (d.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'publicado' } : p))
      } else {
        alert(d.result?.results?.[0]?.error ?? d.error ?? 'Error publicando')
      }
    } finally {
      setPublishing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#B5FF2C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Redes Sociales</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Calendario editorial · {posts.length} posts · Instagram @autom_atia</p>
        </div>
        <div className="flex gap-2">
          <Link href="/redes/calendar"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
            📅 Almanaque
          </Link>
          <Link href="/redes/create"
            className="px-4 py-2 text-sm font-black rounded-lg"
            style={{ background: '#B5FF2C', color: '#0F0F10' }}>
            + Crear post
          </Link>
        </div>
      </div>

      {/* KPI strip — clickable filters */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { key: 'todos', label: 'Total', value: stats.total, color: '#F7F5EF' },
          { key: 'publicados', label: 'Publicados', value: stats.publicados, color: '#4ade80' },
          { key: 'listos', label: 'Listos ✓', value: stats.listos, color: '#B5FF2C' },
          { key: 'planificados', label: 'Planificados', value: stats.planificados, color: '#60a5fa' },
        ] as const).map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className="text-left bg-zinc-900 border rounded-xl p-4 transition-all"
            style={{ borderColor: filter === s.key ? s.color : '#27272a' }}>
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-zinc-500 text-xs mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="border border-zinc-800 border-dashed rounded-xl p-10 text-center">
            <p className="text-zinc-600 text-sm mb-4">
              {filter === 'todos' ? 'Sin posts en el calendario' : `Sin posts con status "${filter}"`}
            </p>
            <Link href="/redes/create"
              className="px-4 py-2 text-sm font-bold rounded-lg"
              style={{ background: '#B5FF2C', color: '#0F0F10' }}>
              Crear primer post
            </Link>
          </div>
        )}

        {filtered.map(post => {
          const isExpanded = expandedId === post.id
          const captionPreview = post.caption?.split('\n')[0]?.slice(0, 100) ?? post.titulo?.slice(0, 100) ?? ''

          return (
            <div key={post.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">

              {/* Main row */}
              <div className="flex items-center gap-3 p-4">

                {/* Thumbnail or tipo icon */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                  {post.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.imagen_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-40">
                      {post.tipo === 'reel' ? '🎬' : post.tipo === 'carrusel' ? '🔀' : '📸'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-zinc-500 font-mono">{post.fecha}</span>
                    {post.tipo && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                        {TIPO_BADGE[post.tipo] ?? post.tipo}
                      </span>
                    )}
                    {post.pilar && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${PILAR_COLOR[post.pilar] ?? '#666'}22`, color: PILAR_COLOR[post.pilar] ?? '#aaa' }}>
                        {post.pilar}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[post.status] ?? 'text-zinc-500 bg-zinc-800'}`}>
                      {post.status}
                    </span>
                    {post.ig_media_id && <span className="text-green-400 text-xs">✓ IG</span>}
                  </div>
                  <p className="text-white text-sm font-medium truncate">{captionPreview}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : post.id)}
                    className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors">
                    {isExpanded ? 'Cerrar' : 'Ver'}
                  </button>
                  <Link
                    href={`/redes/${post.id}`}
                    className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors">
                    ✏️ Editar
                  </Link>
                  {post.status === 'listo' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={publishing === post.id}
                      className="text-xs px-3 py-1.5 font-black rounded-lg disabled:opacity-40 transition-colors"
                      style={{ background: '#B5FF2C', color: '#0F0F10' }}>
                      {publishing === post.id ? '...' : '▶ Publicar'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded caption */}
              {isExpanded && post.caption && (
                <div className="px-4 pb-4 pt-0 border-t border-zinc-800">
                  <pre className="text-zinc-300 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto bg-zinc-950 rounded-lg p-3 mt-3">
                    {post.caption}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Image generation status note */}
      {stats.planificados > 0 && stats.listos === 0 && (
        <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-4 text-sm text-blue-400">
          <strong>Generando imágenes en background</strong> — Los posts pasarán a &quot;listo&quot; automáticamente cuando la imagen esté lista.
          Podés publicarlos manualmente cuando quieras.
        </div>
      )}
    </div>
  )
}
