'use client'

import { useState } from 'react'
import {
  Play, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, Brain, Vote, RefreshCw, Copy, Check
} from 'lucide-react'

interface SelectionCriteria {
  textQuality: number
  originality: number
  hookStrength: number
  strategicFit: number
  ctaClarity: number
  brandVoice: number
  totalScore: number
}

interface EvaluatedVariant {
  variant: 'A' | 'B' | 'C'
  caption: string
  criteria: SelectionCriteria
  issues: string[]
  strengths: string[]
  suggestion?: string
}

interface PipelinePost {
  entry: { idea: string; postType: string; format: string; rubro: string; dayOfWeek: string; scheduledTime: string; priority: string }
  selectionResult: {
    winner: 'A' | 'B' | 'C'
    evaluations: EvaluatedVariant[]
    selectionReasoning: string
    qualityApproved: boolean
    rejectionReason?: string
  }
  finalCaption: string
  finalHashtags: string[]
  canvaPrompt: string
  qualityScore: number
  status: 'aprobado' | 'rechazado' | 'en_revision'
  rejectionReason?: string
}

interface PipelineResult {
  month: string
  generatedAt: string
  totalPosts: number
  approved: number
  rejected: number
  avgQualityScore: number
  posts: PipelinePost[]
  rejectedPosts: PipelinePost[]
  strategicSummary: string
}

type PipelineStep = 'idle' | 'estratega' | 'creando' | 'seleccionando' | 'done' | 'error'

const CRITERIA_LABELS: Record<keyof SelectionCriteria, string> = {
  textQuality: 'Calidad de texto',
  originality: 'Originalidad',
  hookStrength: 'Fuerza del hook',
  strategicFit: 'Fit estratégico',
  ctaClarity: 'Claridad del CTA',
  brandVoice: 'Voz de marca',
  totalScore: 'Score total',
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{score}</span>
    </div>
  )
}

function PostCard({ post, index }: { post: PipelinePost; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyCaption = async () => {
    await navigator.clipboard.writeText(post.finalCaption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusColor = post.status === 'aprobado'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : post.status === 'rechazado'
    ? 'border-red-800/50 bg-red-950/20'
    : 'border-amber-800/50 bg-amber-950/20'

  const statusIcon = post.status === 'aprobado'
    ? <CheckCircle2 size={14} className="text-emerald-400" />
    : post.status === 'rechazado'
    ? <XCircle size={14} className="text-red-400" />
    : <AlertCircle size={14} className="text-amber-400" />

  const winner = post.selectionResult.evaluations?.find(e => e.variant === post.selectionResult.winner)

  return (
    <div className={`border rounded-lg overflow-hidden ${statusColor}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
      >
        <span className="text-gray-500 text-xs w-6">#{index + 1}</span>
        {statusIcon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{post.entry.idea}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{post.entry.dayOfWeek}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">{post.entry.postType}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">{post.entry.rubro}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {post.status === 'aprobado' && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-bold ${
                post.qualityScore >= 8 ? 'text-emerald-400' :
                post.qualityScore >= 6 ? 'text-amber-400' : 'text-red-400'
              }`}>{post.qualityScore.toFixed(1)}</span>
              <span className="text-xs text-gray-600">/10</span>
            </div>
          )}
          {post.status === 'rechazado' && (
            <span className="text-xs text-red-400">Rechazado</span>
          )}
          {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-800/50 pt-4">
          {post.status === 'rechazado' && post.rejectionReason && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-3">
              <p className="text-xs font-medium text-red-400 mb-1">Motivo de rechazo</p>
              <p className="text-xs text-red-300">{post.rejectionReason}</p>
            </div>
          )}

          {post.status === 'aprobado' && (
            <>
              {/* Caption final */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Caption final</p>
                  <button
                    onClick={copyCaption}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-xs text-gray-300 bg-gray-900 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                  {post.finalCaption}
                </p>
              </div>

              {/* Reasoning del selector */}
              {post.selectionResult.selectionReasoning && (
                <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Vote size={12} className="text-indigo-400" />
                    <p className="text-xs font-medium text-indigo-400">¿Por qué ganó la variante {post.selectionResult.winner}?</p>
                  </div>
                  <p className="text-xs text-indigo-300">{post.selectionResult.selectionReasoning}</p>
                </div>
              )}

              {/* Criterios de evaluación de la variante ganadora */}
              {winner && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Evaluación</p>
                  <div className="space-y-1.5">
                    {(Object.keys(CRITERIA_LABELS) as (keyof SelectionCriteria)[])
                      .filter(k => k !== 'totalScore')
                      .map(key => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-32 shrink-0">{CRITERIA_LABELS[key]}</span>
                          <ScoreBar score={winner.criteria[key]} />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Issues encontrados */}
              {winner?.issues && winner.issues.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-800/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-amber-400 mb-1.5">Issues corregidos</p>
                  <ul className="space-y-0.5">
                    {winner.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-amber-300 flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">·</span>{issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Canva prompt */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Prompt para Canva</p>
                <p className="text-xs text-gray-500 bg-gray-900 rounded-lg p-3 font-mono">{post.canvaPrompt}</p>
              </div>

              {/* Hashtags */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.finalHashtags.map((tag, i) => (
                    <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function PipelinePage() {
  const [month, setMonth] = useState('2026-04')
  const [focusRubro, setFocusRubro] = useState('')
  const [step, setStep] = useState<PipelineStep>('idle')
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'aprobados' | 'rechazados'>('aprobados')

  const runPipeline = async () => {
    setStep('estratega')
    setResult(null)
    setError(null)

    try {
      // Simular progreso visual
      const progressTimer = setTimeout(() => setStep('creando'), 5000)
      const progressTimer2 = setTimeout(() => setStep('seleccionando'), 30000)

      const res = await fetch('/api/instagram/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, focusRubro: focusRubro || undefined }),
      })

      clearTimeout(progressTimer)
      clearTimeout(progressTimer2)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error en el pipeline')
      }

      const data: PipelineResult = await res.json()
      setResult(data)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStep('error')
    }
  }

  const STEPS = [
    { key: 'estratega', label: 'Estratega planificando', icon: Brain, desc: 'Armando el calendario del mes...' },
    { key: 'creando', label: 'Creador generando variantes', icon: Sparkles, desc: 'Generando 3 variantes por post...' },
    { key: 'seleccionando', label: 'Selector evaluando calidad', icon: Vote, desc: 'Eligiendo la mejor variante...' },
  ]

  const currentStepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Pipeline de Contenido IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            3 agentes en cadena: Estratega → Creador (×3 variantes) → Selector de calidad
          </p>
        </div>

        {/* Configuración */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Configuración</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Mes a planificar</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                disabled={step !== 'idle' && step !== 'done' && step !== 'error'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Rubro foco (opcional)</label>
              <select
                value={focusRubro}
                onChange={e => setFocusRubro(e.target.value)}
                disabled={step !== 'idle' && step !== 'done' && step !== 'error'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">Todos los rubros</option>
                <option value="peluqueria">Peluquería</option>
                <option value="clinica">Clínica / Consultorio</option>
                <option value="veterinaria">Veterinaria</option>
                <option value="estetica">Estética</option>
                <option value="odontologia">Odontología</option>
                <option value="taller">Taller / Mecánica</option>
                <option value="gimnasio">Gimnasio</option>
              </select>
            </div>
          </div>

          <button
            onClick={runPipeline}
            disabled={step !== 'idle' && step !== 'done' && step !== 'error'}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {step !== 'idle' && step !== 'done' && step !== 'error' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            {step !== 'idle' && step !== 'done' && step !== 'error'
              ? 'Ejecutando pipeline...'
              : result
              ? 'Ejecutar de nuevo'
              : 'Ejecutar pipeline'}
          </button>
        </div>

        {/* Progreso de agentes */}
        {step !== 'idle' && step !== 'done' && step !== 'error' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300">Agentes trabajando</h2>
            <div className="space-y-3">
              {STEPS.map((s, i) => {
                const isActive = s.key === step
                const isDone = currentStepIndex > i
                const Icon = s.icon
                return (
                  <div key={s.key} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-indigo-950/40 border border-indigo-800/40' :
                    isDone ? 'bg-emerald-950/20 border border-emerald-800/20' :
                    'bg-gray-800/30 border border-gray-700/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-indigo-600' : isDone ? 'bg-emerald-700' : 'bg-gray-700'
                    }`}>
                      {isDone
                        ? <CheckCircle2 size={16} className="text-white" />
                        : <Icon size={16} className={isActive ? 'text-white animate-pulse' : 'text-gray-500'} />
                      }
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {s.label}
                      </p>
                      {isActive && <p className="text-xs text-gray-500">{s.desc}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-600 text-center">Esto puede tardar 3-5 minutos para 20 posts...</p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && error && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-red-400" />
              <p className="text-sm font-medium text-red-400">Error en el pipeline</p>
            </div>
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Resultados */}
        {result && step === 'done' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Posts generados', value: result.totalPosts, color: 'text-white' },
                { label: 'Aprobados', value: result.approved, color: 'text-emerald-400' },
                { label: 'Rechazados', value: result.rejected, color: 'text-red-400' },
                { label: 'Score promedio', value: `${result.avgQualityScore}/10`, color: result.avgQualityScore >= 7 ? 'text-emerald-400' : 'text-amber-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Resumen estratégico */}
            {result.strategicSummary && (
              <div className="bg-indigo-950/20 border border-indigo-800/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={14} className="text-indigo-400" />
                  <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Resumen estratégico</p>
                </div>
                <p className="text-sm text-gray-300">{result.strategicSummary}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('aprobados')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'aprobados'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                Aprobados ({result.approved})
              </button>
              {result.rejected > 0 && (
                <button
                  onClick={() => setActiveTab('rechazados')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'rechazados'
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Rechazados ({result.rejected})
                </button>
              )}
            </div>

            {/* Lista de posts */}
            <div className="space-y-2">
              {activeTab === 'aprobados' && result.posts.map((post, i) => (
                <PostCard key={i} post={post} index={i} />
              ))}
              {activeTab === 'rechazados' && result.rejectedPosts.map((post, i) => (
                <PostCard key={i} post={post} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
