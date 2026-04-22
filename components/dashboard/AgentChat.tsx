'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AgentInfo {
  id: string
  nombre: string
  emoji: string
  rol: string
  model: string
  color?: string
}

interface Props {
  agent: AgentInfo
  placeholder?: string
  suggestions?: string[]
  collapsed?: boolean
}

export default function AgentChat({ agent, placeholder, suggestions = [], collapsed = false }: Props) {
  const [open, setOpen] = useState(!collapsed)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const MODEL_LABELS: Record<string, string> = {
    haiku: 'Haiku · rápido',
    sonnet: 'Sonnet · avanzado',
    opus: 'Opus · máxima capacidad',
  }

  async function send(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/agents/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: text.trim(),
          history: messages,
        }),
      })

      if (!res.ok || !res.body) {
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: 'Error al conectar con el agente.' } : m))
        setStreaming(false)
        return
      }

      const reader = res.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: m.content + parsed.text } : m
              ))
            }
            if (parsed.error) {
              setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: `Error: ${parsed.error}` } : m
              ))
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: 'Error de conexión.' } : m))
    } finally {
      setStreaming(false)
    }
  }

  const accentColor = agent.color ?? '#C6FF3D'

  return (
    <div style={{
      background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden',
      borderLeft: `3px solid ${accentColor}`,
    }}>
      {/* Header — siempre visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18,
          background: accentColor + '20', flexShrink: 0,
        }}>
          {agent.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
            {agent.nombre}
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {agent.rol} · {MODEL_LABELS[agent.model] ?? agent.model}
          </div>
        </div>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: streaming ? '#4ade80' : open ? accentColor : 'var(--muted)',
          flexShrink: 0,
          boxShadow: streaming ? '0 0 8px #4ade80' : 'none',
          transition: 'all 0.3s',
        }} />
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
          ▾
        </div>
      </button>

      {open && (
        <>
          {/* Messages */}
          <div style={{
            height: 320, overflowY: 'auto', padding: '0 20px',
            display: 'flex', flexDirection: 'column', gap: 12,
            borderTop: '1px solid var(--line)',
          }}>
            {messages.length === 0 && (
              <div style={{ paddingTop: 20 }}>
                {suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        style={{
                          padding: '6px 12px', borderRadius: 20, border: `1px solid ${accentColor}40`,
                          background: accentColor + '10', color: 'var(--ink)',
                          fontFamily: 'var(--f-display)', fontSize: 12, cursor: 'pointer',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 16, fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>
                  Hola, soy {agent.nombre}. ¿En qué te ayudo?
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                gap: 8, alignItems: 'flex-start', paddingTop: i === 0 ? 16 : 0,
              }}>
                {m.role === 'assistant' && (
                  <div style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{agent.emoji}</div>
                )}
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
                  background: m.role === 'user' ? 'var(--ink)' : 'var(--paper-2)',
                  color: m.role === 'user' ? 'var(--paper)' : 'var(--ink)',
                  fontFamily: 'var(--f-display)', fontSize: 13, lineHeight: 1.6,
                  borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: m.role === 'assistant' ? 4 : 12,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content || (streaming && i === messages.length - 1 ? '▋' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', gap: 8, padding: '12px 16px',
            borderTop: '1px solid var(--line)', background: 'var(--paper-2)',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder={placeholder ?? `Preguntale a ${agent.nombre}...`}
              disabled={streaming}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8,
                border: '1px solid var(--line)', background: 'var(--paper)',
                fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', outline: 'none',
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              style={{
                padding: '9px 16px', borderRadius: 8, border: 'none',
                background: (!input.trim() || streaming) ? 'var(--line)' : accentColor,
                color: 'var(--ink)', cursor: (!input.trim() || streaming) ? 'default' : 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                fontWeight: 700, flexShrink: 0,
              }}
            >
              {streaming ? '...' : 'Enviar'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
