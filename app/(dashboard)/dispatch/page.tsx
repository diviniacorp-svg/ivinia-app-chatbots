'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Zap, Send, Loader2, CheckCircle, XCircle, Video,
  Copy, RefreshCw, ChevronDown, Sparkles, Activity,
  DollarSign, Users, TrendingUp, Bot, Image, FileText,
  Play, Clock, AlertCircle,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────
interface DispatchResult {
  success: boolean
  action: string
  client?: { name: string; rubro: string }
  result?: {
    caption?: string
    hashtags?: string
    reelScript?: string
    freepikPrompt?: string
    message?: string
  }
  qa?: { approved: boolean; score: number; feedback: string }
  video?: {
    jobId: string; engine: string; status: string
    estimatedMinutes: number; pollUrl: string
  }
  durationMs?: number
}

interface Message {
  role: 'user' | 'agent'
  content: string
  result?: DispatchResult
  ts: number
}

// ─── Quick Commands ───────────────────────────────────────────────────────────
const QUICK_COMMANDS = [
  { icon: '🎬', label: 'Reel peluquería', cmd: 'generar reel para peluquería La Tijera Dorada San Luis' },
  { icon: '📸', label: 'Post lanzamiento', cmd: 'crear post de lanzamiento DIVINIA San Luis' },
  { icon: '💰', label: 'Mensaje de ventas', cmd: 'generar mensaje de ventas para estéticas San Luis' },
  { icon: '🤖', label: 'Status agentes', cmd: 'status agentes' },
  { icon: '🎯', label: 'Pipeline completo', cmd: 'pipeline completo para estética Belleza Rosa' },
  { icon: '✨', label: 'Prompt Freepik', cmd: 'prompt freepik para peluquería unisex' },
]

// ─── Status Card ─────────────────────────────────────────────────────────────
function StatusCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  return (
    <div style={{
      background: '#111', borderRadius: 12, padding: '12px 16px',
      border: '1px solid #222', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</div>
      </div>
    </div>
  )
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result }: { result: DispatchResult }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (result.action === 'status' && result.result) {
    const status = result.result as any
    return (
      <div style={{ background: '#111', borderRadius: 12, padding: 16, border: '1px solid #1a1a2e' }}>
        <div style={{ fontSize: 12, color: '#8B5CF6', marginBottom: 10, fontWeight: 700 }}>
          ⚡ SISTEMA DIVINIA
        </div>
        {status.agents && Object.entries(status.agents).map(([name, info]: [string, any]) => (
          <div key={name} style={{
            display: 'flex', justifyContent: 'space-between', padding: '4px 0',
            borderBottom: '1px solid #1a1a1a', fontSize: 12,
          }}>
            <span style={{ color: '#aaa', textTransform: 'capitalize' }}>{name}</span>
            <span style={{ color: info.status === 'online' ? '#10B981' : '#EC4899' }}>
              {info.status === 'online' ? '● ONLINE' : '○ ' + info.status}
            </span>
          </div>
        ))}
        {status.pricing && (
          <div style={{ marginTop: 10, background: '#0a1a0a', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginBottom: 6 }}>
              💰 PRICING (SIN FREE TRIAL)
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>
              Starter: {status.pricing.starter}<br />
              Pro: {status.pricing.pro}<br />
              Todo DIVINIA: {status.pricing.todo_divinia}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (result.action === 'chat' && result.result?.message) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: 12, padding: 14, border: '1px solid #1a1a2e' }}>
        <p style={{ fontSize: 13, color: '#e0e0ff', margin: 0, lineHeight: 1.5 }}>
          {result.result.message}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* QA Score */}
      {result.qa && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: result.qa.approved ? '#0a1a0a' : '#1a0a0a',
          borderRadius: 10, padding: '8px 12px',
        }}>
          {result.qa.approved
            ? <CheckCircle size={14} color="#10B981" />
            : <AlertCircle size={14} color="#EC4899" />}
          <span style={{ fontSize: 12, color: result.qa.approved ? '#10B981' : '#EC4899' }}>
            QA Score: {result.qa.score}/100 — {result.qa.feedback}
          </span>
        </div>
      )}

      {/* Caption */}
      {result.result?.caption && (
        <div style={{ background: '#111', borderRadius: 12, padding: 14, border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 700 }}>📝 CAPTION INSTAGRAM</span>
            <button
              onClick={() => copy(result.result!.caption! + '\n\n' + result.result!.hashtags!, 'caption')}
              style={{
                background: copied === 'caption' ? '#10B981' : '#8B5CF620',
                border: 'none', borderRadius: 6, padding: '4px 10px',
                color: copied === 'caption' ? '#fff' : '#8B5CF6', fontSize: 11, cursor: 'pointer',
              }}
            >
              {copied === 'caption' ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <p style={{ fontSize: 13, color: '#e0e0ff', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {result.result.caption}
          </p>
          {result.result.hashtags && (
            <p style={{ fontSize: 11, color: '#666', marginTop: 8, margin: '8px 0 0' }}>
              {result.result.hashtags}
            </p>
          )}
        </div>
      )}

      {/* Reel Script */}
      {result.result?.reelScript && (
        <div style={{ background: '#0f0f1a', borderRadius: 12, padding: 14, border: '1px solid #1a1a2e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#EC4899', fontWeight: 700 }}>🎬 SCRIPT REEL</span>
            <button
              onClick={() => copy(result.result!.reelScript!, 'script')}
              style={{
                background: copied === 'script' ? '#10B981' : '#EC489920',
                border: 'none', borderRadius: 6, padding: '4px 10px',
                color: copied === 'script' ? '#fff' : '#EC4899', fontSize: 11, cursor: 'pointer',
              }}
            >
              {copied === 'script' ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#c0c0e0', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {result.result.reelScript}
          </p>
        </div>
      )}

      {/* Freepik Prompt */}
      {result.result?.freepikPrompt && (
        <div style={{ background: '#0a0a1a', borderRadius: 12, padding: 14, border: '1px solid #8B5CF620' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 700 }}>✨ PROMPT FREEPIK</span>
            <button
              onClick={() => copy(result.result!.freepikPrompt!, 'freepik')}
              style={{
                background: copied === 'freepik' ? '#10B981' : '#8B5CF620',
                border: 'none', borderRadius: 6, padding: '4px 10px',
                color: copied === 'freepik' ? '#fff' : '#8B5CF6', fontSize: 11, cursor: 'pointer',
              }}
            >
              {copied === 'freepik' ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#9090c0', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
            {result.result.freepikPrompt}
          </p>
          <div style={{ marginTop: 8, fontSize: 10, color: '#555' }}>
            {result.result.freepikPrompt.split(/\s+/).length} palabras •
            Pegar en freepik.es/pikaso → Generar vídeos
          </div>
        </div>
      )}

      {/* Video Status */}
      {result.video && (
        <div style={{
          background: '#0a1a0a', borderRadius: 12, padding: 14,
          border: `1px solid ${result.video.status === 'failed' ? '#EC489920' : '#10B98120'}`,
        }}>
          <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginBottom: 8 }}>
            🎥 VIDEO {result.video.engine.toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            Job ID: <code style={{ color: '#8B5CF6' }}>{result.video.jobId}</code>
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
            Status: <span style={{ color: '#10B981' }}>{result.video.status}</span>
            {result.video.estimatedMinutes > 0 && ` (~${result.video.estimatedMinutes} min)`}
          </div>
          {result.video.pollUrl && (
            <div style={{ marginTop: 8, fontSize: 10, color: '#555' }}>
              Poll: {result.video.pollUrl}
            </div>
          )}
        </div>
      )}

      {result.durationMs && (
        <div style={{ fontSize: 10, color: '#444', textAlign: 'right' }}>
          Pipeline ejecutado en {result.durationMs}ms
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DispatchPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'agent',
    content: '⚡ DIVINIA Dispatch activo. Decime qué necesitás — genero reels, posts, prompts Freepik, o te muestro el status del sistema.',
    ts: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats] = useState({ clients: 0, mrr: 0, reels: 5, margin: '97%' })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const dispatch = async (command: string) => {
    if (!command.trim() || loading) return

    const userMsg: Message = { role: 'user', content: command, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agents/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      })

      const data: DispatchResult = await res.json()
      const agentMsg: Message = {
        role: 'agent',
        content: data.action === 'status'
          ? 'Estado del sistema DIVINIA:'
          : data.action === 'chat'
          ? data.result?.message || 'Listo.'
          : `✅ ${data.action.replace(/_/g, ' ').toUpperCase()} generado para ${data.client?.name || 'DIVINIA'}`,
        result: data,
        ts: Date.now(),
      }
      setMessages(prev => [...prev, agentMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `❌ Error: ${String(err)}`,
        ts: Date.now(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      dispatch(input)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#0A0A0A', color: '#fff', fontFamily: 'Inter, sans-serif',
      maxWidth: 600, margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #1a1a1a',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #0f0a1a 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900,
          }}>D</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.5px' }}>DIVINIA Dispatch</div>
            <div style={{ fontSize: 11, color: '#8B5CF6' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10B981', marginRight: 5 }} />
              Sistema activo · 8 agentes
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatusCard icon={<Users size={16} />} label="Clientes" value={`${stats.clients}`} color="#8B5CF6" />
          <StatusCard icon={<DollarSign size={16} />} label="MRR" value={stats.mrr === 0 ? '$0 — ¡A vender!' : `$${stats.mrr.toLocaleString()}`} color="#10B981" />
          <StatusCard icon={<Video size={16} />} label="Reels listos" value={`${stats.reels} scripts`} color="#EC4899" />
          <StatusCard icon={<TrendingUp size={16} />} label="Margen" value={stats.margin} color="#10B981" />
        </div>
      </div>

      {/* Quick Commands */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none',
        }}>
          {QUICK_COMMANDS.map((qc, i) => (
            <button
              key={i}
              onClick={() => dispatch(qc.cmd)}
              disabled={loading}
              style={{
                flexShrink: 0,
                background: '#111', border: '1px solid #222', borderRadius: 20,
                padding: '5px 12px', color: '#bbb', fontSize: 11, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {qc.icon} {qc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 8, alignItems: 'flex-start',
          }}>
            {msg.role === 'agent' && (
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900,
              }}>D</div>
            )}
            <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : '#111',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                padding: '10px 14px', fontSize: 13, lineHeight: 1.5,
                border: msg.role === 'agent' ? '1px solid #1a1a1a' : 'none',
              }}>
                {msg.content}
              </div>
              {msg.result && <ResultCard result={msg.result} />}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{
              background: '#111', borderRadius: '4px 16px 16px 16px',
              padding: '10px 14px', fontSize: 13, border: '1px solid #1a1a1a',
            }}>
              <span style={{ color: '#8B5CF6' }}>●</span>
              <span style={{ color: '#8B5CF6', marginLeft: 4 }}>●</span>
              <span style={{ color: '#8B5CF6', marginLeft: 4 }}>●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid #1a1a1a',
        background: '#0A0A0A',
      }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          background: '#111', borderRadius: 16, padding: '8px 8px 8px 14px',
          border: '1px solid #222',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Decime qué generar... (Enter para enviar)"
            disabled={loading}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 13, resize: 'none', lineHeight: 1.5,
              maxHeight: 100, overflowY: 'auto',
            }}
          />
          <button
            onClick={() => dispatch(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                : '#222',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {loading
              ? <Loader2 size={16} color="#666" />
              : <Send size={16} color={input.trim() ? '#fff' : '#444'} />
            }
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#333', textAlign: 'center', marginTop: 6 }}>
          Copy (Haiku) + QA (Haiku) + Video (Seedance/Kling) · ~$0.002/reel
        </div>
      </div>
    </div>
  )
}
