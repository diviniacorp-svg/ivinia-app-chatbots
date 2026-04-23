'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, RefreshCw, Instagram, Calendar, Layers, Film, BookOpen, Target, Eye, Globe, Image, Video, Box } from 'lucide-react'

// ── Strategy data ────────────────────────────────────────────────────────────

const PRODUCTOS = [
  { id: 'turnero',  nombre: 'TURNERO',        emoji: '📅', color: '#8B5CF6', desc: '$45k/mes · Sistema de turnos online' },
  { id: 'central',  nombre: 'CENTRAL IA',     emoji: '💬', color: '#3B82F6', desc: '$90k/mes · Chatbot WhatsApp 24hs' },
  { id: 'content',  nombre: 'CONTENT FACTORY',emoji: '🎨', color: '#EC4899', desc: '$80k/mes · Posts y reels IA' },
  { id: 'avatares', nombre: 'AVATARES IA',    emoji: '🎭', color: '#F59E0B', desc: 'desde $200k · Presentador digital' },
  { id: 'nucleus',  nombre: 'NUCLEUS IA',     emoji: '🧠', color: '#10B981', desc: 'desde $800k · Sistema completo a medida' },
]

const PILARES = [
  { id: 'problema',  label: 'El Problema',     emoji: '🔥', desc: 'El dolor ANTES del producto' },
  { id: 'demo',      label: 'Demo en vivo',    emoji: '🎬', desc: 'El producto funcionando' },
  { id: 'resultado', label: 'Resultados',      emoji: '✅', desc: 'Métricas y casos reales' },
  { id: 'educacion', label: 'Educación',       emoji: '📚', desc: 'Cómo funciona la IA' },
  { id: 'behind',    label: 'Behind the scenes',emoji: '🏗️', desc: 'Cómo DIVINIA construye' },
  { id: 'cta',       label: 'Oferta directa',  emoji: '💰', desc: 'Precio y llamado a acción' },
]

const TIPOS = [
  { id: 'post',     label: 'Post estático', emoji: '🖼️', desc: '1080x1080 · caption 300-500 chars' },
  { id: 'carrusel', label: 'Carrusel',      emoji: '📑', desc: '5-7 slides · narrativa en secuencia' },
  { id: 'reel',     label: 'Reel',          emoji: '🎥', desc: '30-45 seg · guion + instrucciones' },
  { id: 'story',    label: 'Stories',       emoji: '📱', desc: '3 slides · encuesta o link' },
]

// Posting strategy: 5x/week, product rotation
const SEMANA_ESTRATEGIA = [
  { dia: 'Lun', tipo: 'Carrusel', pilar: 'problema', producto: 'turnero' },
  { dia: 'Mar', tipo: 'Post',     pilar: 'demo',      producto: 'central' },
  { dia: 'Mié', tipo: 'Reel',     pilar: 'resultado', producto: 'turnero' },
  { dia: 'Jue', tipo: 'Carrusel', pilar: 'educacion', producto: 'avatares' },
  { dia: 'Vie', tipo: 'Post',     pilar: 'cta',       producto: 'turnero' },
]

const HERRAMIENTAS = [
  {
    id: 'canva',
    label: 'Canva AI',
    emoji: '🎨',
    tag: 'Imágenes',
    color: '#7C3AED',
    desc: 'Posts y carruseles dark premium',
    ideal: 'Post estático · Carrusel · Story',
  },
  {
    id: 'mystic',
    label: 'Freepik Mystic',
    emoji: '✨',
    tag: 'Imágenes IA',
    color: '#DB2777',
    desc: 'Fotorrealismo e ilustración IA',
    ideal: 'Post con escena · Fondo atmosférico',
  },
  {
    id: 'seedance',
    label: 'Freepik Seedance',
    emoji: '🎞️',
    tag: 'Video suave',
    color: '#0891B2',
    desc: 'Movimiento orgánico y elegante',
    ideal: 'Producto flotando · Loop · Branding',
  },
  {
    id: 'kling',
    label: 'Freepik Kling Omni',
    emoji: '⚡',
    tag: 'Video dinámico',
    color: '#DC2626',
    desc: 'Física realista, reveals dramáticos',
    ideal: 'Reel impactante · Transición · Efecto',
  },
  {
    id: 'spaces',
    label: 'Freepik Spaces',
    emoji: '🌐',
    tag: 'Mundo 3D',
    color: '#059669',
    desc: 'Escenas tridimensionales interactivas',
    ideal: 'Background marca · Sala control IA · Universo tech',
  },
]

// 3D Spaces showcase examples
const SPACES_EJEMPLOS = [
  {
    titulo: 'Sala de control DIVINIA',
    desc: 'Sala futurista oscura con múltiples pantallas mostrando dashboards del Turnero. Luz violeta ambiental. Para usar como fondo de Reels y entrevistas con avatar.',
    prompt: 'Futuristic dark control room, multiple holographic screens showing purple UI dashboards and booking calendars, volumetric indigo light beams, floating data particles, metallic surfaces with subtle reflections, wide angle lens, cinematic depth of field, dark atmosphere #09090b, premium tech aesthetic',
    uso: 'Fondo para Reels con avatar · Thumbnail YouTube · Story de lanzamiento',
  },
  {
    titulo: 'Portal de datos IA',
    desc: 'Un portal circular de luz violeta en el centro, datos fluyendo, neón sobre negro. Represent a DIVINIA como puerta a la automatización.',
    prompt: 'Abstract 3D data portal, circular glowing ring in deep purple (#8B5CF6) with data streams flowing through it, dark void background with floating binary particles, volumetric god rays, glass and metal materials, center composition, 85mm lens equivalent, atmospheric depth, tech-futuristic',
    uso: 'Cover de cuenta · Thumbnail conceptual · Post de branding',
  },
  {
    titulo: 'Escritorio PYME del futuro',
    desc: 'Un escritorio limpio y moderno, con un celular mostrando el Turnero activo, luz cálida, ambiente de peluquería o clínica profesionalizada.',
    prompt: 'Modern minimalist desk scene, smartphone displaying a clean purple booking app UI, soft warm ambient lighting, blurred professional salon background, shallow depth of field, product photography style, dark wood textures, elegant lifestyle shot, 50mm portrait lens',
    uso: 'Post demo · Carrusel de features · Historia de cliente',
  },
  {
    titulo: 'Universo de agentes IA',
    desc: 'Espacio abstracto con nodos conectados representando los agentes de DIVINIA. Neural network visual. Para NUCLEUS y contenido de educación.',
    prompt: 'Abstract neural network universe, glowing nodes connected by light threads in indigo and violet (#8B5CF6), dark space background with nebula hints, some nodes pulsing with green (#10B981) energy, isometric perspective, particle system, depth layers creating cosmic depth, tech-organic aesthetic',
    uso: 'NUCLEUS showcase · Educación sobre IA · Behind the scenes',
  },
]

// ── Types ────────────────────────────────────────────────────────────────────

interface Generated {
  titulo: string
  caption: string
  hashtags: string[]
  brief: string
  visualPrompt: string
  secondaryPrompt: string
  herramienta: string
}

// ── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors px-2 py-1 rounded hover:bg-purple-50"
    >
      {done ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      {label ?? 'Copiar'}
    </button>
  )
}

// ── Week plan card ───────────────────────────────────────────────────────────

function WeekPlan({ onSelect }: { onSelect: (p: string, pi: string, t: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-purple-500" />
        <h3 className="font-bold text-gray-900 text-sm">Plan semanal recomendado</h3>
        <span className="text-xs text-gray-400 ml-auto">5 posts/semana</span>
      </div>
      <div className="space-y-2">
        {SEMANA_ESTRATEGIA.map((item) => {
          const prod = PRODUCTOS.find(p => p.id === item.producto)!
          const pilar = PILARES.find(p => p.id === item.pilar)!
          const tipo = TIPOS.find(t => t.id.toLowerCase() === item.tipo.toLowerCase() || t.label.toLowerCase() === item.tipo.toLowerCase())
          return (
            <button
              key={item.dia}
              onClick={() => onSelect(item.producto, item.pilar, tipo?.id ?? 'post')}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
            >
              <span className="w-8 text-xs font-bold text-gray-400">{item.dia}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: prod.color + '20', color: prod.color }}
              >
                {prod.emoji} {prod.nombre}
              </span>
              <span className="text-xs text-gray-500">{pilar.emoji} {pilar.label}</span>
              <span className="text-xs text-gray-400 ml-auto">{item.tipo}</span>
              <Sparkles size={12} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
        Hacé click en cualquier día para cargar esa combinación en el generador →
      </p>
    </div>
  )
}

// ── Hashtag sets ─────────────────────────────────────────────────────────────

const HASHTAG_SETS: Record<string, string[]> = {
  turnero: ['#turnerodigital', '#turnosonline', '#agendaonline', '#pymesargentinas', '#peluqueria', '#clinica', '#veterinaria', '#nails', '#estetica', '#gym', '#divinia', '#sanluis', '#inteligenciaartificial', '#automatizacion', '#softwareargentino', '#negocioslocales', '#reservasonline', '#mercadopago', '#tecnologiaargentina', '#digitalizar'],
  central: ['#chatbot', '#whatsappbusiness', '#atencioncliente', '#ia24hs', '#pymesdigitales', '#automatizacion', '#chatbotwhatsapp', '#divinia', '#inteligenciaartificial', '#pymesargentinas', '#sanluis', '#softwareargentino', '#negociosonline', '#clientesfelices', '#respuestaautomatica'],
  content: ['#contentfactory', '#marketingdigital', '#redesociales', '#instagram', '#contenidodigital', '#pymesargentinas', '#comunitymanager', '#disenodigital', '#marketingargentino', '#divinia', '#contentcreator', '#brandingdigital', '#instagrammarketing', '#negociosdigitales', '#creadordecontenido'],
  avatares: ['#avataria', '#presentadordigital', '#videoia', '#videomarketing', '#heygen', '#divinia', '#inteligenciaartificial', '#marketingdigital', '#contentcreator', '#pymesargentinas', '#brandingdigital', '#videoempresarial', '#innovaciondigital'],
  nucleus: ['#sistemasia', '#automatizacionempresarial', '#nucleus', '#divinia', '#inteligenciaartificial', '#pymesargentinas', '#transformaciondigital', '#agentesia', '#softwareamedida', '#tecnoargentina', '#startupargentina', '#innovacion'],
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ContentFactory() {
  const [producto, setProducto] = useState('turnero')
  const [pilar, setPilar] = useState('problema')
  const [tipo, setTipo] = useState('post')
  const [herramienta, setHerramienta] = useState('canva')
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Generated | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'generator' | 'strategy' | 'hashtags' | 'spaces'>('generator')

  const prodData = PRODUCTOS.find(p => p.id === producto)!

  async function generate() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto, pilar, tipo, herramienta, customHint: hint }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error generando')
      if (!data.caption) throw new Error('Respuesta inválida de la IA')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function loadFromPlan(p: string, pi: string, t: string) {
    setProducto(p)
    setPilar(pi)
    setTipo(t)
    setTab('generator')
    setResult(null)
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Content Factory</h1>
        <p className="text-sm text-gray-500 mt-1">Generador de contenido para @autom_atia · Estrategia + IA + Brief visual listo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { id: 'generator', label: 'Generador', icon: Sparkles },
          { id: 'strategy',  label: 'Estrategia', icon: Target },
          { id: 'spaces',    label: 'Spaces 3D', icon: Globe },
          { id: 'hashtags',  label: 'Hashtags', icon: Instagram },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: GENERATOR ────────────────────────────────────────────────── */}
      {tab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">

          {/* Left — Controls */}
          <div className="space-y-4">

            {/* Producto */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">1 · Producto</label>
              <div className="space-y-2">
                {PRODUCTOS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProducto(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                      producto === p.id
                        ? 'border-current shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={producto === p.id ? { borderColor: p.color, backgroundColor: p.color + '10' } : {}}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{p.nombre}</div>
                      <div className="text-xs text-gray-400 truncate">{p.desc}</div>
                    </div>
                    {producto === p.id && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pilar */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">2 · Pilar de contenido</label>
              <div className="grid grid-cols-2 gap-2">
                {PILARES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPilar(p.id)}
                    className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      pilar === p.id
                        ? 'border-purple-300 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-base leading-none">{p.emoji}</span>
                    <span className="text-xs font-semibold leading-tight">{p.label}</span>
                    <span className="text-xs text-gray-400 leading-tight">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">3 · Formato</label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTipo(t.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      tipo === t.id
                        ? 'border-purple-300 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold">{t.label}</div>
                      <div className="text-xs text-gray-400">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Herramienta visual */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">4 · Herramienta visual</label>
              <div className="space-y-2">
                {HERRAMIENTAS.map(h => (
                  <button
                    key={h.id}
                    onClick={() => setHerramienta(h.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                      herramienta === h.id
                        ? 'border-current shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={herramienta === h.id ? { borderColor: h.color, backgroundColor: h.color + '10' } : {}}
                  >
                    <span className="text-lg">{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{h.label}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: h.color + '20', color: h.color }}>{h.tag}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">{h.ideal}</div>
                    </div>
                    {herramienta === h.id && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hint opcional */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">5 · Contexto extra (opcional)</label>
              <textarea
                value={hint}
                onChange={e => setHint(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                placeholder="Ej: enfocado en peluquerías, mención precio de lanzamiento, tono urgente..."
              />
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{
                background: loading ? '#9CA3AF' : `linear-gradient(135deg, ${prodData.color}, ${prodData.color}cc)`,
              }}
            >
              {loading ? (
                <><RefreshCw size={16} className="animate-spin" /> Generando con IA...</>
              ) : (
                <><Sparkles size={16} /> Generar {TIPOS.find(t => t.id === tipo)?.label}</>
              )}
            </button>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</div>
            )}
          </div>

          {/* Right — Result */}
          <div className="space-y-4">

            {/* Week plan */}
            {!result && !loading && (
              <WeekPlan onSelect={loadFromPlan} />
            )}

            {loading && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce"
                  style={{ backgroundColor: prodData.color + '20' }}
                >
                  {prodData.emoji}
                </div>
                <p className="text-sm font-semibold text-gray-700">Generando contenido para {prodData.nombre}...</p>
                <p className="text-xs text-gray-400">Claude Haiku está escribiendo tu caption, brief y prompt</p>
              </div>
            )}

            {result && (
              <>
                {/* Caption */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Instagram size={14} className="text-pink-500" />
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Caption</span>
                    </div>
                    <CopyBtn text={result.caption + '\n\n' + result.hashtags.map(h => '#' + h).join(' ')} label="Copiar todo" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result.caption}</p>
                    <p className="text-xs text-purple-600 mt-3 leading-relaxed">
                      {result.hashtags.map(h => '#' + h).join(' ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{result.caption.length} chars</span>
                    <CopyBtn text={result.hashtags.map(h => '#' + h).join(' ')} label="Solo hashtags" />
                  </div>
                </div>

                {/* Brief visual */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-blue-500" />
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Brief visual</span>
                    </div>
                    <CopyBtn text={result.brief} />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.brief}</p>
                </div>

                {/* Visual prompt — tool-specific */}
                {result.visualPrompt && (() => {
                  const hData = HERRAMIENTAS.find(h => h.id === result.herramienta) ?? HERRAMIENTAS[0]
                  const icons: Record<string, typeof Image> = { canva: Image, mystic: Eye, seedance: Video, kling: Film, spaces: Globe }
                  const Icon = icons[result.herramienta] ?? Eye
                  return (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon size={14} style={{ color: hData.color }} />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Prompt para {hData.label}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: hData.color + '20', color: hData.color }}>
                            {hData.tag}
                          </span>
                        </div>
                        <CopyBtn text={result.visualPrompt} />
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <p className="text-sm text-gray-300 font-mono leading-relaxed">{result.visualPrompt}</p>
                      </div>
                      {result.herramienta === 'spaces' && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <Globe size={11} /> Usá este prompt en freepik.com/pikaso/spaces — elegí "3D World"
                        </p>
                      )}
                      {(result.herramienta === 'seedance' || result.herramienta === 'kling') && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                          <Video size={11} /> freepik.com → AI Video → {result.herramienta === 'seedance' ? 'Seedance 2.0' : 'Kling Omni'}
                        </p>
                      )}
                    </div>
                  )
                })()}

                {/* Secondary prompt (Spaces/Kling) */}
                {result.secondaryPrompt && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Box size={14} className="text-emerald-500" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Prompt alternativo / plano de fondo</span>
                      </div>
                      <CopyBtn text={result.secondaryPrompt} />
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-300 font-mono leading-relaxed">{result.secondaryPrompt}</p>
                    </div>
                  </div>
                )}

                {/* Generate again */}
                <button
                  onClick={generate}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-purple-200 text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors"
                >
                  <RefreshCw size={14} /> Generar otra versión
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: STRATEGY ─────────────────────────────────────────────────── */}
      {tab === 'strategy' && (
        <div className="space-y-5">

          {/* Overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-black text-gray-900 text-lg mb-1">Estrategia editorial @autom_atia</h2>
            <p className="text-sm text-gray-500 mb-5">Frecuencia: 5 posts/semana · Mix: 40% educación · 30% demo · 20% resultado · 10% CTA</p>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {PRODUCTOS.map(p => (
                <div key={p.id} className="rounded-xl p-4 text-center" style={{ backgroundColor: p.color + '15' }}>
                  <div className="text-2xl mb-1">{p.emoji}</div>
                  <div className="text-xs font-bold" style={{ color: p.color }}>{p.nombre}</div>
                  <div className="text-xs text-gray-500 mt-1">{p.desc.split('·')[0]}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5"><Target size={14} className="text-purple-500" /> Los 6 pilares</h3>
                <div className="space-y-2">
                  {PILARES.map(p => (
                    <div key={p.id} className="flex items-start gap-2 text-sm">
                      <span>{p.emoji}</span>
                      <div>
                        <span className="font-semibold text-gray-800">{p.label}</span>
                        <span className="text-gray-500"> — {p.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5"><Calendar size={14} className="text-purple-500" /> Plan de la semana</h3>
                <div className="space-y-2">
                  {SEMANA_ESTRATEGIA.map(item => {
                    const prod = PRODUCTOS.find(p => p.id === item.producto)!
                    const pi = PILARES.find(p => p.id === item.pilar)!
                    return (
                      <div key={item.dia} className="flex items-center gap-2 text-sm">
                        <span className="w-7 font-bold text-gray-400 text-xs">{item.dia}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: prod.color + '20', color: prod.color }}>{prod.emoji} {prod.nombre}</span>
                        <span className="text-gray-500 text-xs">{pi.emoji} {pi.label}</span>
                        <span className="text-gray-400 text-xs ml-auto">{item.tipo}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content pillars detail */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                titulo: '🔥 El Problema (40%)',
                desc: 'El contenido que más genera engagement. Mostrás el antes — el dolor que tiene el dueño de PYME sin tu producto.',
                ejemplos: [
                  '"Te llaman para pedir turno mientras estás atendiendo a otro cliente"',
                  '"Tu WhatsApp tiene 47 mensajes sin responder de ayer a la noche"',
                  '"Cuánto tiempo perdiste hoy confirmando turnos que ya tenías anotados"',
                ],
                color: '#EF4444',
              },
              {
                titulo: '🎬 Demo en vivo (30%)',
                desc: 'Mostrás el producto funcionando. El cliente se imagina usándolo. Capturas reales del sistema.',
                ejemplos: [
                  'Screen recording: cliente reserva en 30 segundos desde el celular',
                  'Panel del dueño: ve todos los turnos del día en un click',
                  'Confirmación automática llegando al WhatsApp del cliente',
                ],
                color: '#3B82F6',
              },
              {
                titulo: '✅ Resultados (20%)',
                desc: 'Prueba social. Números concretos, casos reales, transformaciones medibles.',
                ejemplos: [
                  '"Rufina Nails: 0 llamadas para dar turno desde que activó el Turnero"',
                  '"12 horas por mes que recuperás al automatizar las confirmaciones"',
                  '"El 78% de las reservas del Turnero se hacen después de las 20hs"',
                ],
                color: '#10B981',
              },
              {
                titulo: '💰 CTA directo (10%)',
                desc: 'Una vez por semana, precio visible y llamado claro. Sin rodeos.',
                ejemplos: [
                  '"$45.000/mes. Menos que una suscripción a Netflix para dos. Tu turno."',
                  '"Esta semana arrancamos 3 negocios nuevos. ¿El tuyo es uno?"',
                  '"DM \'TURNERO\' y te mostramos tu demo en 15 minutos"',
                ],
                color: '#F59E0B',
              },
            ].map(card => (
              <div key={card.titulo} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{card.titulo}</h3>
                <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
                <div className="space-y-2">
                  {card.ejemplos.map((ej, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: card.color }} />
                      <span>{ej}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Voice & aesthetic */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen size={14} className="text-purple-500" /> Voz y estética de @autom_atia</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tono</div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>✓ Directo, sin poses de gurú</li>
                  <li>✓ Argentino (vos, sos, tenés)</li>
                  <li>✓ Números concretos siempre</li>
                  <li>✓ Ejemplos de negocios reales</li>
                  <li>✗ No "disruptivo" o "innovador"</li>
                  <li>✗ No inglés mezclado sin sentido</li>
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Paleta visual</div>
                <div className="space-y-2">
                  {[
                    { color: '#09090b', label: 'Fondo — siempre negro' },
                    { color: '#8B5CF6', label: 'Violeta — acento principal' },
                    { color: '#EC4899', label: 'Rosa — urgencia/CTA' },
                    { color: '#10B981', label: 'Verde — confirmación' },
                    { color: '#ffffff', label: 'Blanco — texto principal' },
                  ].map(c => (
                    <div key={c.color} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: c.color }} />
                      <span className="text-xs text-gray-600">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Elementos fijos</div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>• Círculo violeta difuso (top right)</li>
                  <li>• Círculo rosa difuso (bottom left)</li>
                  <li>• Badge pill arriba centrado</li>
                  <li>• Logo footer: ◉ DIVINIA</li>
                  <li>• Tipografía: Inter ExtraBold</li>
                  <li>• Fondo: SIEMPRE #09090b</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: SPACES 3D ───────────────────────────────────────────────── */}
      {tab === 'spaces' && (
        <div className="space-y-5">

          {/* Hero */}
          <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #059669, #065f46)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Globe size={24} />
              <div>
                <h2 className="font-black text-xl">Freepik Spaces — Mundos 3D</h2>
                <p className="text-green-200 text-sm">Escenas tridimensionales para content premium y avatares IA</p>
              </div>
            </div>
            <p className="text-green-100 text-sm leading-relaxed">
              Freepik Spaces genera entornos 3D interactivos completos: salas de control futuristas, portales de datos, escritorios premium, universos de IA. Usá estos mundos como fondo para tus Reels, videos con avatar, thumbnails de YouTube y posts de branding. También los vendemos como servicio a clientes.
            </p>
            <div className="flex gap-3 mt-4">
              <div className="bg-white/20 rounded-lg px-3 py-2 text-sm font-semibold">🌐 freepik.com/pikaso/spaces</div>
              <div className="bg-white/20 rounded-lg px-3 py-2 text-sm font-semibold">🎭 Ideal para AVATARES IA</div>
              <div className="bg-white/20 rounded-lg px-3 py-2 text-sm font-semibold">🧠 Ideal para NUCLEUS</div>
            </div>
          </div>

          {/* Herramientas Freepik overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Herramientas Freepik — cuándo usar cada una</h3>
            <div className="grid grid-cols-1 gap-3">
              {HERRAMIENTAS.map(h => (
                <div key={h.id} className="flex items-start gap-4 p-3 rounded-lg" style={{ backgroundColor: h.color + '08' }}>
                  <span className="text-2xl">{h.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">{h.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: h.color + '20', color: h.color }}>{h.tag}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{h.desc}</p>
                    <p className="text-xs font-semibold" style={{ color: h.color }}>✓ Ideal para: {h.ideal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spaces ejemplos con prompts */}
          <h3 className="font-bold text-gray-900">Escenas 3D listas para usar en DIVINIA</h3>
          <div className="grid grid-cols-1 gap-4">
            {SPACES_EJEMPLOS.map(ej => (
              <div key={ej.titulo} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{ej.titulo}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{ej.desc}</p>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-300 font-mono leading-relaxed">{ej.prompt}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-600 font-medium">📍 Uso: {ej.uso}</p>
                  <CopyBtn text={ej.prompt} label="Copiar prompt" />
                </div>
              </div>
            ))}
          </div>

          {/* Como servicio */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Globe size={14} className="text-green-500" /> Spaces 3D como servicio vendible</h3>
            <p className="text-sm text-gray-600 mb-4">Los mundos 3D se pueden ofrecer a clientes como parte del pack de AVATARES IA o como servicio independiente de branding visual.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { titulo: 'Pack Visual Premium', precio: '$80.000', incluye: '4 escenas 3D custom · 8 imágenes estáticas · Paleta de marca' },
                { titulo: 'Avatar + Mundo 3D', precio: '+$150.000', incluye: 'Avatar IA + fondo 3D personalizado · 10 videos mensuales' },
                { titulo: 'Branding Total', precio: '$200.000', incluye: '8 escenas 3D · 20 posts · Guía visual de marca · Story templates' },
              ].map(s => (
                <div key={s.titulo} className="rounded-xl p-4" style={{ background: '#05966910' }}>
                  <div className="font-bold text-gray-900 text-sm mb-1">{s.titulo}</div>
                  <div className="text-green-700 font-black text-lg mb-2">{s.precio}</div>
                  <div className="text-xs text-gray-500">{s.incluye}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: HASHTAGS ─────────────────────────────────────────────────── */}
      {tab === 'hashtags' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Sets de hashtags optimizados por producto. Copiá el set completo para cada post.</p>
          </div>
          {PRODUCTOS.map(prod => (
            <div key={prod.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{prod.emoji}</span>
                  <span className="font-bold text-gray-900">{prod.nombre}</span>
                  <span className="text-xs text-gray-400">{HASHTAG_SETS[prod.id].length} hashtags</span>
                </div>
                <CopyBtn text={HASHTAG_SETS[prod.id].map(h => '#' + h).join(' ')} label="Copiar set completo" />
              </div>
              <div className="flex flex-wrap gap-2">
                {HASHTAG_SETS[prod.id].map(h => (
                  <span
                    key={h}
                    className="text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: prod.color + '15', color: prod.color }}
                    onClick={() => navigator.clipboard.writeText('#' + h)}
                    title="Click para copiar"
                  >
                    #{h}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Universal set */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-gray-900">Set universal DIVINIA (usar en todos)</span>
              <CopyBtn text="#divinia #pymesargentinas #inteligenciaartificial #automatizacion #softwareargentino #sanluis #negocioslocales #ia #tecnologiaargentina #startupargentina" label="Copiar" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['divinia', 'pymesargentinas', 'inteligenciaartificial', 'automatizacion', 'softwareargentino', 'sanluis', 'negocioslocales', 'ia', 'tecnologiaargentina', 'startupargentina'].map(h => (
                <span key={h} className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#' + h)}>
                  #{h}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
