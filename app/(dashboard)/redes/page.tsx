'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface SocialClientRow {
  id: string
  nombre: string
  rubro: string
  is_divinia: boolean
}

interface ContentPost {
  id: string
  titulo: string
  fecha: string
  plataforma: string
  status: string
  pilar: string | null
  imagen_url: string | null
  ig_media_id: string | null
  social_client_id: string | null
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', tiktok: '🎵', linkedin: '💼', twitter: '🐦', youtube: '▶️', facebook: '👥',
}
const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C', tiktok: '#69C9D0', linkedin: '#0A66C2', twitter: '#1DA1F2', youtube: '#FF0000', facebook: '#1877F2',
}
const STATUS_STYLE: Record<string, string> = {
  publicado: 'text-green-400 bg-green-400/10', listo: 'text-lime-400 bg-lime-400/10',
  planificado: 'text-blue-400 bg-blue-400/10', en_produccion: 'text-yellow-400 bg-yellow-400/10',
  fallido: 'text-red-400 bg-red-400/10', borrador: 'text-zinc-500 bg-zinc-500/10',
}
const PILAR_COLOR: Record<string, string> = {
  educativo: '#6E56F8', entretenimiento: '#FF6B5B', venta: '#B5FF2C', comunidad: '#FFD166', detras_escena: '#06D6A0',
}

export default function RedesPage() {
  const [clients, setClients] = useState<SocialClientRow[]>([])
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/social/clients').then(r => r.json()),
      fetch('/api/content/calendar?limit=40&orderBy=fecha').then(r => r.json()).catch(() => ({ posts: [] })),
    ]).then(([cd, pd]) => {
      const clientList = cd.clients ?? []
      setClients(clientList)
      setPosts(pd.posts ?? pd.data ?? [])
      const div = clientList.find((c: SocialClientRow) => c.is_divinia)
      if (div) setSelectedClient(div.id)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = selectedClient === 'all'
    ? posts
    : posts.filter(p => !p.social_client_id || p.social_client_id === selectedClient)

  const stats = {
    total: filtered.length,
    publicados: filtered.filter(p => p.status === 'publicado').length,
    listos: filtered.filter(p => p.status === 'listo').length,
    planificados: filtered.filter(p => p.status === 'planificado').length,
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
        alert(d.result?.results?.[0]?.error ?? 'Error publicando')
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F7F5EF' }}>Redes Sociales</h1>
          <p className="text-zinc-400 text-sm mt-1">Gestión de contenido y publicación multi-plataforma</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/redes/create"
            className="px-4 py-2 text-sm font-bold rounded-lg transition-colors"
            style={{ background: '#B5FF2C', color: '#0F0F10' }}>
            + Crear
          </Link>
          <Link href="/redes/metrics"
            className="px-4 py-2 bg-zinc-800 text-zinc-200 text-sm font-semibold rounded-lg hover:bg-zinc-700 transition-colors">
            Métricas
          </Link>
          <Link href="/redes/calendar"
            className="px-4 py-2 bg-zinc-800 text-zinc-200 text-sm font-semibold rounded-lg hover:bg-zinc-700 transition-colors">
            Calendario
          </Link>
        </div>
      </div>

      {/* Client tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ id: 'all', nombre: 'Todos', is_divinia: false }, ...clients].map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClient(c.id)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: selectedClient === c.id ? '#B5FF2C' : '#27272a',
              color: selectedClient === c.id ? '#0F0F10' : '#a1a1aa',
            }}>
            {c.is_divinia && '★ '}{c.nombre}
          </button>
        ))}
        <Link href="/redes/clientes/nuevo"
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
          + Nuevo cliente
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#F7F5EF' },
          { label: 'Publicados', value: stats.publicados, color: '#4ade80' },
          { label: 'Listos', value: stats.listos, color: '#B5FF2C' },
          { label: 'Planificados', value: stats.planificados, color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-zinc-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Platform status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Plataformas</div>
        <div className="flex gap-3 flex-wrap">
          {['instagram', 'tiktok', 'linkedin', 'twitter', 'youtube'].map(p => (
            <div key={p} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
              <span className="text-base">{PLATFORM_ICONS[p]}</span>
              <span className="text-xs font-semibold text-zinc-300 capitalize">{p}</span>
              {p === 'instagram' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              ) : (
                <Link href={`/redes/conectar/${p}`} className="text-xs text-zinc-600 hover:text-[#B5FF2C]">+ Conectar</Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Posts list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Calendario</h2>
          <span className="text-xs text-zinc-500">{filtered.length} posts</span>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center">
            <p className="text-zinc-600 text-sm mb-4">Sin posts en el calendario</p>
            <Link href="/redes/create"
              className="px-4 py-2 text-sm font-bold rounded-lg"
              style={{ background: '#B5FF2C', color: '#0F0F10' }}>
              Crear primer post
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 25).map(post => (
              <div key={post.id}
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">

                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${PLATFORM_COLORS[post.plataforma] ?? '#333'}20` }}>
                  {PLATFORM_ICONS[post.plataforma] ?? '📄'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-semibold truncate">{post.titulo}</span>
                    {post.pilar && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ background: `${PILAR_COLOR[post.pilar] ?? '#666'}22`, color: PILAR_COLOR[post.pilar] ?? '#aaa' }}>
                        {post.pilar}
                      </span>
                    )}
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    {post.fecha} · {post.plataforma}
                    {post.ig_media_id && <span className="ml-2 text-green-500">✓</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_STYLE[post.status] ?? 'text-zinc-400'}`}>
                    {post.status}
                  </span>
                  {(post.status === 'listo') && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={publishing === post.id}
                      className="text-xs px-3 py-1.5 font-bold rounded-lg disabled:opacity-40 transition-colors"
                      style={{ background: '#B5FF2C', color: '#0F0F10' }}>
                      {publishing === post.id ? '...' : '▶ Publicar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
