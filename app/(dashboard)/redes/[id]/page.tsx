'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Send, ExternalLink, Copy, Check } from 'lucide-react'

const PILAR_COLOR: Record<string, string> = {
  educativo: '#8B5CF6',
  venta: '#84CC16',
  entretenimiento: '#F97316',
  comunidad: '#22D3EE',
  detras_escena: '#EC4899',
}

const TIPO_ICON: Record<string, string> = {
  reel: '🎬',
  post: '📸',
  carrusel: '🎠',
  story: '⭕',
}

// Scoring criteria for each post
const CRITERIA = [
  { key: 'hook', label: 'Hook primera línea', desc: '¿Detiene el scroll en 2 segundos?', max: 25 },
  { key: 'value', label: 'Valor entregado', desc: '¿El lector aprende algo útil?', max: 25 },
  { key: 'cta', label: 'CTA claro', desc: '¿Qué tiene que hacer el lector?', max: 20 },
  { key: 'brand', label: 'Alineación marca', desc: '¿Tono DIVINIA, argentino, directo?', max: 15 },
  { key: 'visual', label: 'Visual atractivo', desc: '¿La imagen acompaña el mensaje?', max: 15 },
]

function scorePost(caption: string | null, pilar: string | null, imagenUrl: string | null) {
  if (!caption) return { total: 0, breakdown: {} }
  const breakdown: Record<string, number> = {}
  // Hook: does it start with a question or strong statement?
  const firstLine = caption.split('\n')[0] ?? ''
  breakdown.hook = firstLine.length > 20 && (firstLine.includes('?') || firstLine.includes('!') || firstLine.toUpperCase() === firstLine.slice(0, 10).toUpperCase()) ? 22 : 16
  // Value: post/carrusel tend to have more educational value
  breakdown.value = pilar === 'educativo' ? 23 : pilar === 'venta' ? 18 : 20
  // CTA: does it mention divinia.vercel.app or DM?
  breakdown.cta = caption.includes('divinia') || caption.includes('DM') || caption.includes('escribinos') ? 18 : 12
  // Brand: argentino markers
  breakdown.brand = caption.includes('vos') || caption.includes('sos') || caption.includes('tenés') ? 13 : 9
  // Visual
  breakdown.visual = imagenUrl ? 13 : 7
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
  return { total, breakdown }
}

function adsRecommendation(post: { pilar: string | null; tipo: string | null; status: string }) {
  if (post.pilar === 'venta') return { recommend: true, reason: 'Post de venta directo — ideal para campaña de conversión (objetivo: mensajes WhatsApp).' }
  if (post.tipo === 'reel' && post.pilar === 'educativo') return { recommend: true, reason: 'Reel educativo con alto potencial orgánico — amplificalo con $500/día en Meta Ads durante 3 días.' }
  if (post.pilar === 'comunidad') return { recommend: false, reason: 'Post de comunidad — funciona mejor orgánico. No requiere inversión publicitaria.' }
  return { recommend: false, reason: 'Post de contenido — dejar correr orgánico y evaluar a las 48hs. Si supera el promedio de engagement, considerar boost.' }
}

interface ContentPost {
  id: string
  titulo: string
  caption: string | null
  fecha: string
  plataforma?: string
  tipo: string | null
  status: string
  pilar: string | null
  imagen_url: string | null
  hashtags: string | null
  prompt_imagen: string | null
  publish_at: string | null
  ig_media_id: string | null
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<ContentPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/social/post/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.post) {
          setPost(d.post)
          setCaption(d.post.caption ?? '')
          setHashtags(d.post.hashtags ?? '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    const res = await fetch(`/api/social/post/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption, hashtags }),
    })
    const data = await res.json()
    if (res.ok) {
      setSaveMsg('✅ Guardado')
      setPost(p => p ? { ...p, caption, hashtags } : p)
    } else {
      setSaveMsg(`❌ ${data.error ?? 'Error'}`)
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function handlePublish() {
    setPublishing(true)
    setPublishMsg('')
    const res = await fetch('/api/social/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: id }),
    })
    const data = await res.json()
    if (res.ok) {
      setPublishMsg('✅ Publicado en Instagram!')
      setPost(p => p ? { ...p, status: 'publicado' } : p)
    } else {
      setPublishMsg(`❌ ${data.error ?? 'Error al publicar'}`)
    }
    setPublishing(false)
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Cargando...</div>
  if (!post) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Post no encontrado</div>

  const score = scorePost(post.caption, post.pilar, post.imagen_url)
  const ads = adsRecommendation(post)
  const scoreColor = score.total >= 80 ? 'text-lime-400' : score.total >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/redes" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Redes</span>
        </Link>
        <div className="h-4 w-px bg-gray-700" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{post.titulo || post.fecha}</h1>
          <div className="text-xs text-gray-500">{post.fecha} · {post.plataforma ?? 'instagram'}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCaption}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
          >
            {copied ? <Check size={15} className="text-lime-400" /> : <Copy size={15} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          {(post.status === 'listo' || post.status === 'planificado') && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              <Send size={15} />
              {publishing ? 'Publicando...' : '▶ Publicar en IG'}
            </button>
          )}
          {post.status === 'publicado' && post.ig_media_id && (
            <a
              href={`https://www.instagram.com/p/${post.ig_media_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
            >
              <ExternalLink size={15} />
              Ver en IG
            </a>
          )}
        </div>
      </div>

      {publishMsg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${publishMsg.startsWith('✅') ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
          {publishMsg}
        </div>
      )}

      <div className="grid grid-cols-[360px_1fr] gap-6">
        {/* Left: image + metadata */}
        <div className="space-y-4">
          {/* Image */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {post.imagen_url ? (
              <img src={post.imagen_url} alt={post.titulo} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-gray-800 flex flex-col items-center justify-center gap-2 text-gray-500">
                <div className="text-5xl">{TIPO_ICON[post.tipo ?? 'post'] ?? '📌'}</div>
                <div className="text-sm">Sin imagen</div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tipo</span>
              <span className="text-sm">{TIPO_ICON[post.tipo ?? 'post']} {post.tipo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Pilar</span>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: `${PILAR_COLOR[post.pilar ?? 'educativo']}33`, color: PILAR_COLOR[post.pilar ?? 'educativo'] }}>
                {post.pilar}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Estado</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${
                post.status === 'listo' ? 'bg-lime-500/20 text-lime-300 border-lime-500/40' :
                post.status === 'publicado' ? 'bg-green-500/20 text-green-300 border-green-500/40' :
                'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>{post.status}</span>
            </div>
            {post.publish_at && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Publicar a las</span>
                <span className="text-xs text-gray-300">
                  {new Date(post.publish_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                </span>
              </div>
            )}
          </div>

          {/* Score card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Score del post</h3>
              <span className={`text-2xl font-bold ${scoreColor}`}>{score.total}<span className="text-sm text-gray-500">/100</span></span>
            </div>
            <div className="space-y-2">
              {CRITERIA.map(c => {
                const val = score.breakdown[c.key] ?? 0
                const pct = Math.round((val / c.max) * 100)
                return (
                  <div key={c.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{c.label}</span>
                      <span className="text-gray-500">{val}/{c.max}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#84CC16' : pct >= 60 ? '#EAB308' : '#EF4444' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ads recommendation */}
          <div className={`rounded-xl p-4 border ${ads.recommend ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-900 border-gray-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{ads.recommend ? '💰 Boost recomendado' : '🌱 Orgánico'}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{ads.reason}</p>
            {ads.recommend && (
              <div className="mt-3 flex gap-2">
                <a
                  href="https://business.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 transition-colors"
                >
                  Crear campaña →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: editor */}
        <div className="space-y-4">
          {/* Caption editor */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Caption</h3>
              <span className="text-xs text-gray-500">{caption.length} chars</span>
            </div>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={16}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 leading-relaxed resize-none focus:outline-none focus:border-gray-600 font-mono"
              placeholder="Escribí el caption aquí..."
            />
          </div>

          {/* Hashtags editor */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Hashtags</h3>
              <span className="text-xs text-gray-500">
                {hashtags.split(/\s+/).filter(h => h.startsWith('#')).length} tags
              </span>
            </div>
            <textarea
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-blue-400 leading-relaxed resize-none focus:outline-none focus:border-gray-600"
              placeholder="#divinia #sanluiscapital #chatbotia..."
            />
          </div>

          {/* Freepik prompt (read-only) */}
          {post.prompt_imagen && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-400">Prompt de imagen (Freepik)</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-mono">{post.prompt_imagen}</p>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              <Save size={15} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.startsWith('✅') ? 'text-lime-400' : 'text-red-400'}`}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
