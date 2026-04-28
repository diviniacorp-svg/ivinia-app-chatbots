'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SocialClientRow { id: string; nombre: string; is_divinia: boolean }
interface MultiPlatformCaption {
  platform: string; caption: string; hashtags: string[]; hook: string; cta: string; characterCount: number
}
interface CaptionPackage {
  idea: string; pilar: string
  captions: MultiPlatformCaption[]
  freepikPrompt: string
  remotionComposition?: string
}

const PLATFORMS = ['instagram', 'tiktok', 'linkedin', 'twitter']
const PILARES = ['educativo', 'entretenimiento', 'venta', 'comunidad', 'detras_escena']
const FORMATOS = ['post', 'reel', 'carrusel', 'story', 'shorts']

export default function CreateContentPage() {
  const router = useRouter()
  const [clients, setClients] = useState<SocialClientRow[]>([])
  const [form, setForm] = useState({
    socialClientId: '',
    idea: '',
    pilar: 'educativo',
    formato: 'post',
    platforms: ['instagram'],
    fecha: new Date().toISOString().split('T')[0],
  })
  const [generating, setGenerating] = useState(false)
  const [pkg, setPkg] = useState<CaptionPackage | null>(null)
  const [editedCaptions, setEditedCaptions] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/social/clients').then(r => r.json()).then(d => {
      const list = d.clients ?? []
      setClients(list)
      const div = list.find((c: SocialClientRow) => c.is_divinia)
      if (div) setForm(f => ({ ...f, socialClientId: div.id }))
    })
  }, [])

  function togglePlatform(p: string) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }))
  }

  async function generate() {
    if (!form.idea.trim() || !form.socialClientId) return
    setGenerating(true)
    setPkg(null)
    try {
      const r = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (d.ok) {
        setPkg(d.package)
        const initial: Record<string, string> = {}
        for (const c of d.package.captions) initial[c.platform] = c.caption
        setEditedCaptions(initial)
      } else {
        alert(d.error ?? 'Error generando')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function saveToCalendar() {
    if (!pkg) return
    setSaving(true)
    try {
      const primaryCaption = editedCaptions[form.platforms[0]] ?? pkg.captions[0]?.caption ?? ''
      const primaryHashtags = pkg.captions.find(c => c.platform === form.platforms[0])?.hashtags.join(' ') ?? ''

      const r = await fetch('/api/content/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          social_client_id: form.socialClientId,
          fecha: form.fecha,
          plataforma: form.platforms[0],
          tipo: form.formato,
          pilar: form.pilar,
          titulo: form.idea.slice(0, 100),
          caption: primaryCaption,
          hashtags: primaryHashtags,
          prompt_imagen: pkg.freepikPrompt,
          remotion_composition: pkg.remotionComposition ?? null,
          status: 'planificado',
          generado_por: 'ia',
        }),
      })
      const d = await r.json()
      if (d.id || d.ok) {
        router.push('/redes')
      } else {
        alert(d.error ?? 'Error guardando')
      }
    } finally {
      setSaving(false)
    }
  }

  const PILAR_COLOR: Record<string, string> = {
    educativo: '#6E56F8', entretenimiento: '#FF6B5B', venta: '#B5FF2C', comunidad: '#FFD166', detras_escena: '#06D6A0',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white text-sm">← Volver</button>
        <h1 className="text-xl font-black text-white">Crear contenido</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: form */}
        <div className="space-y-4">
          {/* Client */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Cliente</label>
            <select
              value={form.socialClientId}
              onChange={e => setForm(f => ({ ...f, socialClientId: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B5FF2C]">
              {clients.map(c => <option key={c.id} value={c.id}>{c.is_divinia ? '★ ' : ''}{c.nombre}</option>)}
            </select>
          </div>

          {/* Idea */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Idea del post</label>
            <textarea
              value={form.idea}
              onChange={e => setForm(f => ({ ...f, idea: e.target.value }))}
              placeholder="Ej: Mostrar cuánto tiempo ahorra un negocio usando turnos automáticos..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B5FF2C] resize-none"
            />
          </div>

          {/* Pilar */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Pilar</label>
            <div className="flex gap-2 flex-wrap">
              {PILARES.map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, pilar: p }))}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: form.pilar === p ? PILAR_COLOR[p] : '#27272a',
                    color: form.pilar === p ? '#0F0F10' : '#a1a1aa',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Formato */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Formato</label>
            <div className="flex gap-2 flex-wrap">
              {FORMATOS.map(f => (
                <button key={f} onClick={() => setForm(fm => ({ ...fm, formato: f }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${form.formato === f ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Plataformas</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors capitalize ${form.platforms.includes(p) ? 'bg-[#B5FF2C] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Fecha</label>
            <input type="date" value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B5FF2C]"
            />
          </div>

          <button onClick={generate} disabled={generating || !form.idea.trim()}
            className="w-full py-3 font-bold text-sm rounded-lg transition-colors disabled:opacity-40"
            style={{ background: '#B5FF2C', color: '#0F0F10' }}>
            {generating ? '⟳ Generando con IA...' : '✦ Generar captions'}
          </button>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          {!pkg && !generating && (
            <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center">
              <p className="text-zinc-600 text-sm">El contenido generado aparecerá aquí</p>
            </div>
          )}

          {generating && (
            <div className="border border-zinc-800 rounded-xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#B5FF2C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Claude está generando tu contenido...</p>
            </div>
          )}

          {pkg && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Captions generados</div>

              {pkg.captions.map(c => (
                <div key={c.platform} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-300 capitalize">{c.platform}</span>
                    <span className="text-xs text-zinc-600">{c.characterCount ?? editedCaptions[c.platform]?.length ?? 0} chars</span>
                  </div>
                  <div className="text-xs text-[#B5FF2C] mb-2 font-semibold">Hook: {c.hook}</div>
                  <textarea
                    value={editedCaptions[c.platform] ?? c.caption}
                    onChange={e => setEditedCaptions(prev => ({ ...prev, [c.platform]: e.target.value }))}
                    rows={5}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-[#B5FF2C] resize-none"
                  />
                  {c.hashtags?.length > 0 && (
                    <div className="text-xs text-zinc-500 mt-1 truncate">{c.hashtags.slice(0, 8).join(' ')}</div>
                  )}
                </div>
              ))}

              {pkg.freepikPrompt && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs font-bold text-zinc-400 mb-1">Prompt visual (Freepik)</div>
                  <div className="text-xs text-zinc-500 italic">{pkg.freepikPrompt}</div>
                </div>
              )}

              <button onClick={saveToCalendar} disabled={saving}
                className="w-full py-3 font-bold text-sm rounded-lg transition-colors disabled:opacity-40"
                style={{ background: '#B5FF2C', color: '#0F0F10' }}>
                {saving ? 'Guardando...' : '→ Guardar en calendario'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
