'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ArrowLeft, Play, Square } from 'lucide-react'
import Link from 'next/link'

// Cargamos el Player de Remotion solo en el cliente (no SSR)
const RemotionPreview = dynamic(() => import('./_components/RemotionPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[9/16] bg-gray-900 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Cargando player...</p>
      </div>
    </div>
  ),
})

const COMPOSICIONES = [
  { id: 'HookReel', label: 'Hook Reel', desc: 'Gancho animado con texto', frames: 370, fps: 30 },
  { id: 'StatsReel', label: 'Stats Reel', desc: '3-8 turnos perdidos', frames: 510, fps: 30 },
  { id: 'BeforeAfterReel', label: 'Antes vs Después', desc: 'Split screen', frames: 464, fps: 30 },
  { id: 'TextAnim-Dolor', label: 'Texto — Dolor', desc: 'Mensaje del problema', frames: 390, fps: 30 },
  { id: 'TextAnim-Stats', label: 'Texto — Stats', desc: 'Estadísticas animadas', frames: 360, fps: 30 },
  { id: 'TextAnim-Urgencia', label: 'Texto — Urgencia', desc: 'CTA urgente', frames: 350, fps: 30 },
  { id: 'Nano-Turnero-Hook', label: 'Nano — Hook', desc: 'Fondo 3D Gemini + hook', frames: 450, fps: 30 },
  { id: 'Nano-Turnero-CTA', label: 'Nano — CTA', desc: 'Fondo 3D Gemini + CTA', frames: 300, fps: 30 },
  { id: 'Demo-Peluqueria', label: 'Demo Peluquería', desc: 'Demo por rubro', frames: 270, fps: 30 },
  { id: 'Demo-Clinica', label: 'Demo Clínica', desc: 'Demo por rubro', frames: 270, fps: 30 },
  { id: 'Demo-Veterinaria', label: 'Demo Veterinaria', desc: 'Demo por rubro', frames: 270, fps: 30 },
  { id: 'Demo-Taller', label: 'Demo Taller', desc: 'Demo por rubro', frames: 270, fps: 30 },
]

export default function PreviewPage() {
  const [selected, setSelected] = useState(COMPOSICIONES[0])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/contenido" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={15} />
            Volver
          </Link>
          <div>
            <h1 className="text-lg font-bold">Preview de Reels — Remotion</h1>
            <p className="text-xs text-gray-500">Previsualización en tiempo real de las composiciones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* Lista de composiciones */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Composiciones</p>
            {COMPOSICIONES.map(comp => (
              <button
                key={comp.id}
                onClick={() => setSelected(comp)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                  selected.id === comp.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <p className="text-sm font-medium">{comp.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{comp.desc}</p>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-white">{selected.label}</h2>
                  <p className="text-xs text-gray-500">{selected.frames} frames · {selected.fps} fps · {(selected.frames / selected.fps).toFixed(1)}s</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">9:16</span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">1080×1920</span>
                </div>
              </div>

              {/* Player de Remotion */}
              <div className="max-w-xs mx-auto">
                <RemotionPreview compositionId={selected.id} frames={selected.frames} fps={selected.fps} />
              </div>
            </div>

            {/* Info del render */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Renderizar a MP4</p>
              <p className="text-xs text-gray-400 mb-2">Corré esto en la terminal desde <code className="bg-gray-800 px-1 rounded">C:/divinia</code>:</p>
              <code className="block bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-green-400 font-mono">
                npx remotion render {selected.id} out/{selected.id}.mp4
              </code>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
