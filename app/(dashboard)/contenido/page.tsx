'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, ExternalLink, Copy, Check, ChevronDown, ChevronUp,
  Play, Brain, Vote, Palette, Film, Zap, Terminal
} from 'lucide-react'

// ─── Canva links ──────────────────────────────────────────────────────────────

const CANVA_LINKS = [
  { label: 'Posts Semana 1', url: 'https://www.canva.com/folder/FAHFpVAfEXc' },
  { label: 'Carruseles', url: 'https://www.canva.com/folder/FAHFpcOd82M' },
  { label: 'Historias / Stories', url: 'https://www.canva.com/folder/FAHFpd43YX4' },
  { label: 'Logos y marca', url: 'https://www.canva.com/folder/FAHFpa6KWII' },
  { label: 'Planificador de contenido', url: 'https://www.canva.com/create/social-media-calendars/' },
]

// ─── Composiciones Remotion ───────────────────────────────────────────────────

const COMPOSICIONES = [
  { id: 'HookReel', desc: 'Reel gancho animado con texto', requiere: null },
  { id: 'StatsReel', desc: 'Stats animadas en pantalla', requiere: null },
  { id: 'BeforeAfterReel', desc: 'Antes vs Después split', requiere: null },
  { id: 'TextAnim-Dolor', desc: 'Texto animado — mensaje dolor', requiere: null },
  { id: 'TextAnim-Stats', desc: 'Texto animado — estadísticas', requiere: null },
  { id: 'TextAnim-Urgencia', desc: 'Texto animado — urgencia CTA', requiere: null },
  { id: 'Nano-Turnero-Hook', desc: 'Hook con fondo 3D Gemini', requiere: 'turnero-fondo-9x16.mp4' },
  { id: 'Nano-Turnero-CTA', desc: 'CTA con fondo 3D Gemini', requiere: 'turnero-fondo-9x16.mp4' },
  { id: 'Demo-Peluqueria', desc: 'Demo producto — peluquería', requiere: null },
  { id: 'Demo-Clinica', desc: 'Demo producto — clínica', requiere: null },
  { id: 'Demo-Veterinaria', desc: 'Demo producto — veterinaria', requiere: null },
  { id: 'Demo-Taller', desc: 'Demo producto — taller mecánico', requiere: null },
]

// ─── Prompt Chrome Extension ──────────────────────────────────────────────────

const PROMPT_INSTAGRAM = `Sos mi asistente técnico. Tengo que publicar los posts de la semana en @autom_atia.

CUENTA: @autom_atia (Instagram Business)
PRODUCTO: Turnero by DIVINIA — sistema de turnos online para PYMEs argentinas

Para cada post:
1. Abrí instagram.com/@autom_atia
2. Hacé click en "+" para crear publicación
3. Subí la imagen indicada (ya la tengo en Canva)
4. Pegá el caption exacto
5. Agregá los hashtags al final
6. Programalo en el horario indicado o publicalo ahora

Confirmame cada post que publiques. Si hay error, decímelo y lo resolvemos juntos.`

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ContenidoPage() {
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)
  const [remotionOpen, setRemotionOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT_INSTAGRAM)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  function copyCmd(id: string) {
    navigator.clipboard.writeText(`npx remotion render ${id} out/${id}.mp4`)
    setCopiedCmd(id)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-white">Fábrica de Contenidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Instagram @autom_atia — Turnero by DIVINIA</p>
        </div>

        {/* ── 1. PIPELINE IA — ACCIÓN PRINCIPAL ─────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-700/40 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Pipeline IA — 3 Agentes en cadena</h2>
              <p className="text-indigo-300 text-xs">Estratega → Creador (×3 variantes) → Selector de calidad</p>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="grid grid-cols-3 gap-3 my-5">
            {[
              { icon: Brain, label: 'Estratega', desc: 'Planifica 20 posts del mes con mix 40/30/20/10', color: 'text-blue-400' },
              { icon: Sparkles, label: 'Creador', desc: 'Genera 3 variantes de caption por post (A/B/C)', color: 'text-purple-400' },
              { icon: Vote, label: 'Selector', desc: 'Evalúa calidad, ortografía, originalidad y elige la mejor', color: 'text-emerald-400' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-black/30 rounded-xl p-3 text-center">
                <Icon size={20} className={`mx-auto mb-1.5 ${color}`} />
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-3 mb-5 text-xs text-indigo-300">
            <strong>Control de calidad automático:</strong> el Selector detecta errores tipográficos, frases genéricas repetidas entre posts, hooks débiles y CTAs vagos. Si un post no supera score 6/10, lo rechaza y lo marca para revisión.
          </div>

          <Link
            href="/contenido/pipeline"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            <Play size={16} />
            Ejecutar pipeline del mes
          </Link>
        </div>

        {/* ── 2. DISEÑOS EN CANVA ───────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Palette size={17} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Diseños en Canva</h2>
              <p className="text-gray-500 text-xs">Carpetas de la cuenta @autom_atia</p>
            </div>
          </div>
          <div className="space-y-2">
            {CANVA_LINKS.map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-800/20 hover:border-amber-700/40 rounded-lg px-4 py-2.5 text-sm text-amber-200 hover:text-white transition-all group"
              >
                <span>{label}</span>
                <ExternalLink size={13} className="text-amber-500 group-hover:text-amber-300 shrink-0" />
              </a>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-950/20 border border-amber-800/20 rounded-lg">
            <p className="text-xs text-amber-400 font-medium mb-1">Flujo recomendado</p>
            <p className="text-xs text-gray-400">
              1. Ejecutá el pipeline → 2. Copiá el caption aprobado → 3. Abrí Canva → 4. Usá la plantilla base → 5. Pegá el texto exacto del pipeline (así no hay errores tipográficos)
            </p>
          </div>
        </div>

        {/* ── 3. PUBLICAR EN INSTAGRAM ─────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <button
            onClick={() => setPromptOpen(!promptOpen)}
            className="w-full flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-pink-600 rounded-xl flex items-center justify-center shrink-0">
                <Film size={17} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-white">Publicar en Instagram</h2>
                <p className="text-gray-500 text-xs">Prompt para Claude con extensión Chrome</p>
              </div>
            </div>
            {promptOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </button>

          {promptOpen && (
            <div className="mt-4">
              <div className="bg-gray-950 border border-gray-700 rounded-lg p-4 mb-3">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">{PROMPT_INSTAGRAM}</pre>
              </div>
              <button
                onClick={copyPrompt}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                {copiedPrompt ? 'Copiado' : 'Copiar prompt'}
              </button>
            </div>
          )}
        </div>

        {/* ── 4. REELS CON REMOTION ────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <button
            onClick={() => setRemotionOpen(!remotionOpen)}
            className="w-full flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-700 rounded-xl flex items-center justify-center shrink-0">
                <Film size={17} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-white">Reels con Remotion</h2>
                <p className="text-gray-500 text-xs">{COMPOSICIONES.length} composiciones — renderizar localmente</p>
              </div>
            </div>
            {remotionOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </button>

          {remotionOpen && (
            <div className="mt-4 space-y-3">
              <div className="bg-violet-950/30 border border-violet-800/30 rounded-lg p-3 flex gap-2">
                <Terminal size={14} className="text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-violet-300 font-medium">Para renderizar: abrí una terminal en C:/divinia y copiá el comando</p>
                  <p className="text-xs text-gray-500 mt-0.5">Los fondos 3D se generan en <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Gemini (Nanobanana)</a> → guardar en /public/nanobanana/</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPOSICIONES.map(comp => (
                  <div key={comp.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-white">{comp.id}</p>
                      {comp.requiere && (
                        <span className="text-[9px] text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded shrink-0">requiere MP4</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mb-2">{comp.desc}</p>
                    <button
                      onClick={() => copyCmd(comp.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-violet-700 border border-gray-600 hover:border-violet-600 rounded px-2 py-1 text-[10px] font-medium text-gray-300 hover:text-white transition-all"
                    >
                      {copiedCmd === comp.id ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                      {copiedCmd === comp.id ? 'Copiado' : 'Copiar comando'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Link a Gemini ─────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={17} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Gemini — Fondos 3D (Nanobanana)</h2>
              <p className="text-gray-500 text-xs">Generá videos 3D animados para los reels de Turnero</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Usá Gemini para generar los fondos animados 3D. Exportá el MP4 y guardalo en <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300">C:/divinia/public/nanobanana/</code> para que Remotion lo use automáticamente.
          </p>
          <a
            href="https://gemini.google.com/app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            Abrir Gemini
            <ExternalLink size={14} />
          </a>
        </div>

      </div>
    </div>
  )
}
