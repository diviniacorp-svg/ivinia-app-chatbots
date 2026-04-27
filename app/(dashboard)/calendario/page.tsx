'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar, Instagram, RefreshCw, Send, Plus, Copy, Check,
  ChevronDown, ChevronUp, Image as ImageIcon, Loader2, Sparkles, Trash2
} from 'lucide-react'

interface CalendarPost {
  id: string
  fecha: string
  plataforma: string
  tipo: string
  titulo: string
  caption: string
  hashtags: string
  status: string
  prompt_imagen?: string
  prompt_video?: string
  imagen_url?: string
  ig_media_id?: string
  ig_permalink?: string
  score_evaluacion?: number
  freepik_job_id?: string
}

const STATUS_COLORS: Record<string, string> = {
  listo: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  publicado: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  planificado: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  en_produccion: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  programado: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const STATUS_LABEL: Record<string, string> = {
  listo: 'Listo para publicar',
  publicado: 'Publicado',
  planificado: 'Planificado',
  en_produccion: 'En producción',
  programado: 'Programado',
}

const TIPO_COLORS: Record<string, string> = {
  post: 'bg-indigo-500/20 text-indigo-300',
  reel: 'bg-rose-500/20 text-rose-300',
  carrusel: 'bg-purple-500/20 text-purple-300',
  story: 'bg-amber-500/20 text-amber-300',
}

export default function CalendarioPage() {
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [imageInputs, setImageInputs] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [newPost, setNewPost] = useState({ tema: '', tipo: 'post', objetivo: 'awareness' })
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/content/calendar')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {
      console.error('Error cargando calendario')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function publish(post: CalendarPost) {
    if (!post.caption) return
    setPublishing(post.id)
    try {
      const res = await fetch('/api/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          image_url: imageInputs[post.id] || post.imagen_url,
        }),
      })
      const data = await res.json()
      if (data.ok || data.mock) {
        await fetchPosts()
      } else {
        alert(data.error || 'Error al publicar')
      }
    } catch {
      alert('Error al publicar')
    } finally {
      setPublishing(null)
    }
  }

  async function deletePost(id: string) {
    if (!confirm('¿Eliminar este post del calendario?')) return
    await fetch(`/api/content/calendar?id=${id}`, { method: 'DELETE' })
    await fetchPosts()
  }

  async function saveImageUrl(postId: string) {
    const url = imageInputs[postId]
    if (!url) return
    await fetch('/api/content/calendar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postId, imagen_url: url }),
    })
    await fetchPosts()
  }

  async function generatePost() {
    if (!newPost.tema) return
    setGenerating(true)
    try {
      const res = await fetch('/api/content/factory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'producir',
          tema: newPost.tema,
          tipo: newPost.tipo,
          objetivo: newPost.objetivo,
          engine_video: newPost.tipo === 'reel' ? 'seedance' : undefined,
          fecha: new Date().toISOString().split('T')[0],
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowNew(false)
        setNewPost({ tema: '', tipo: 'post', objetivo: 'awareness' })
        await fetchPosts()
      }
    } catch {
      alert('Error generando post')
    } finally {
      setGenerating(false)
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  const counts = {
    all: posts.length,
    listo: posts.filter(p => p.status === 'listo').length,
    publicado: posts.filter(p => p.status === 'publicado').length,
    planificado: posts.filter(p => p.status === 'planificado').length,
    en_produccion: posts.filter(p => p.status === 'en_produccion').length,
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
            <Calendar size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Content Calendar</h1>
            <p className="text-sm text-gray-500">{posts.length} posts en total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPosts}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
          >
            <Sparkles size={14} />
            Generar post
          </button>
        </div>
      </div>

      {/* Generar post rápido */}
      {showNew && (
        <div className="mb-6 p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5">
          <h3 className="text-sm font-semibold text-violet-300 mb-4">Nuevo post con IA</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              placeholder="Tema del post (ej: peluquerías que pierden turnos)"
              value={newPost.tema}
              onChange={e => setNewPost(p => ({ ...p, tema: e.target.value }))}
              className="col-span-1 md:col-span-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
            <select
              value={newPost.tipo}
              onChange={e => setNewPost(p => ({ ...p, tipo: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="post">Post</option>
              <option value="reel">Reel</option>
              <option value="carrusel">Carrusel</option>
            </select>
            <select
              value={newPost.objetivo}
              onChange={e => setNewPost(p => ({ ...p, objetivo: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="awareness">Awareness</option>
              <option value="consideracion">Consideración</option>
              <option value="conversion">Conversión</option>
            </select>
            <button
              onClick={generatePost}
              disabled={generating || !newPost.tema}
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'listo', label: 'Listos' },
          { key: 'en_produccion', label: 'En producción' },
          { key: 'planificado', label: 'Planificados' },
          { key: 'publicado', label: 'Publicados' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-violet-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.label}
            {counts[f.key as keyof typeof counts] > 0 && (
              <span className="ml-1.5 opacity-70">{counts[f.key as keyof typeof counts]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de posts */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Calendar size={40} className="text-gray-600" />
          <p className="text-gray-500 text-sm">No hay posts. Generá uno con el botón de arriba.</p>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-sm transition-colors"
          >
            <Plus size={14} />
            Crear primer post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors"
            >
              {/* Header de la card */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === post.id ? null : post.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[post.status] || STATUS_COLORS.planificado}`}>
                      {STATUS_LABEL[post.status] || post.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${TIPO_COLORS[post.tipo] || 'bg-gray-500/20 text-gray-400'}`}>
                      {post.tipo}
                    </span>
                    {post.score_evaluacion && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${post.score_evaluacion >= 80 ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {post.score_evaluacion}/100
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{post.titulo}</p>
                  <p className="text-xs text-gray-500">{post.fecha} · {post.plataforma}</p>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === 'listo' && (
                    <button
                      onClick={e => { e.stopPropagation(); publish(post) }}
                      disabled={publishing === post.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:opacity-50 text-white text-xs font-medium transition-all"
                    >
                      {publishing === post.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Instagram size={12} />
                      }
                      {publishing === post.id ? 'Publicando...' : 'Publicar'}
                    </button>
                  )}
                  {post.ig_permalink && (
                    <a
                      href={post.ig_permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-colors"
                    >
                      Ver en IG
                    </a>
                  )}
                  {expanded === post.id
                    ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
                    : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                  }
                </div>
              </div>

              {/* Detalle expandido */}
              {expanded === post.id && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">

                  {/* Caption */}
                  {post.caption && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Caption</span>
                        <button
                          onClick={() => copyText(post.caption + (post.hashtags ? '\n\n' + post.hashtags : ''), `caption-${post.id}`)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition-colors"
                        >
                          {copied === `caption-${post.id}` ? <Check size={12} /> : <Copy size={12} />}
                          {copied === `caption-${post.id}` ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap bg-white/3 rounded-lg p-3 leading-relaxed">
                        {post.caption}
                        {post.hashtags && <span className="text-violet-400">{'\n\n'}{post.hashtags}</span>}
                      </p>
                    </div>
                  )}

                  {/* Prompt imagen */}
                  {post.prompt_imagen && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Prompt imagen (Freepik)</span>
                        <button
                          onClick={() => copyText(post.prompt_imagen!, `prompt-${post.id}`)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition-colors"
                        >
                          {copied === `prompt-${post.id}` ? <Check size={12} /> : <Copy size={12} />}
                          {copied === `prompt-${post.id}` ? 'Copiado' : 'Copiar prompt'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 bg-white/3 rounded-lg p-3 font-mono leading-relaxed">
                        {post.prompt_imagen}
                      </p>
                    </div>
                  )}

                  {/* Prompt video */}
                  {post.prompt_video && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Prompt video (Freepik Kling/Seedance)</span>
                        <button
                          onClick={() => copyText(post.prompt_video!, `vprompt-${post.id}`)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition-colors"
                        >
                          {copied === `vprompt-${post.id}` ? <Check size={12} /> : <Copy size={12} />}
                          Copiar
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 bg-white/3 rounded-lg p-3 font-mono leading-relaxed">
                        {post.prompt_video}
                      </p>
                    </div>
                  )}

                  {/* URL imagen — para pegar la que generaste en Freepik */}
                  {post.status !== 'publicado' && (
                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">
                        URL de imagen (pegá la de Freepik)
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={imageInputs[post.id] ?? (post.imagen_url || '')}
                          onChange={e => setImageInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                        />
                        <button
                          onClick={() => saveImageUrl(post.id)}
                          disabled={!imageInputs[post.id]}
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 text-gray-300 text-sm transition-colors flex items-center gap-1"
                        >
                          <ImageIcon size={14} />
                          Guardar
                        </button>
                      </div>
                      {post.imagen_url && (
                        <p className="text-xs text-emerald-400 mt-1">✓ Imagen guardada</p>
                      )}
                    </div>
                  )}

                  {/* IG permalink si publicado */}
                  {post.ig_permalink && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Instagram size={14} className="text-emerald-400" />
                      <a href={post.ig_permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-300 hover:underline">
                        {post.ig_permalink}
                      </a>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-2">
                    {post.status === 'listo' && (
                      <button
                        onClick={() => publish(post)}
                        disabled={publishing === post.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:opacity-50 text-white text-sm font-medium transition-all"
                      >
                        {publishing === post.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Send size={14} />
                        }
                        {publishing === post.id ? 'Publicando en Instagram...' : 'Publicar en Instagram'}
                      </button>
                    )}
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors ml-auto"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
