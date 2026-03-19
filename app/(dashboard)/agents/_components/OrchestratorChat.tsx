'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User } from 'lucide-react'
import type { ChatMessage } from '@/lib/agents/types'

const SUGGESTIONS = [
  'Mostrá el reporte de DIVINIA de hoy',
  'Buscá restaurantes en San Luis',
  'Enviá emails a leads nuevos',
  'Monitoreá trials de clientes',
]

const STREAM_TIMEOUT_MS = 45_000 // 45s máximo de espera

interface OrchestratorChatProps {
  initialMessages: ChatMessage[]
}

export default function OrchestratorChat({ initialMessages }: OrchestratorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function setAssistantContent(id: string, updater: (prev: string) => string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content: updater(m.content) } : m))
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', created_at: new Date().toISOString() }])

    // Timeout: si en 45s no llegó ningún chunk, mostrar error
    const timeoutId = setTimeout(() => {
      readerRef.current?.cancel()
      setAssistantContent(assistantId, c =>
        c || '⏱ El orquestador tardó demasiado. Los agentes pueden seguir corriendo en background. Intentá de nuevo.'
      )
      setStreaming(false)
    }, STREAM_TIMEOUT_MS)

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `HTTP ${res.status}`)
      }

      if (!res.body) throw new Error('Sin stream')

      const reader = res.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let receivedAny = false

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break outer

          try {
            const parsed = JSON.parse(payload)
            if (parsed.error) {
              setAssistantContent(assistantId, () => `❌ ${parsed.error}`)
              receivedAny = true
            } else if (parsed.text) {
              setAssistantContent(assistantId, c => c + parsed.text)
              receivedAny = true
            }
          } catch { /* ignore malformed chunks */ }
        }
      }

      // Si el stream terminó pero no llegó nada, mostrar aviso
      if (!receivedAny) {
        setAssistantContent(assistantId, () =>
          '⚠️ El modelo no devolvió respuesta. Puede que el agente haya corrido igual. Revisá la actividad en la oficina.'
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setAssistantContent(assistantId, c =>
        c || `❌ ${msg}`
      )
    } finally {
      clearTimeout(timeoutId)
      readerRef.current = null
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-3">
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-base"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🧠
        </motion.div>
        <div>
          <p className="text-white text-sm font-bold">Agente Orquestador</p>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Online · Puede activar sub-agentes
          </p>
        </div>
        {streaming && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-yellow-400">
            <Loader2 size={12} className="animate-spin" />
            <span>Procesando...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-gray-400 text-sm font-medium">Hola Joaco, soy tu Orquestador.</p>
            <p className="text-gray-600 text-xs mt-1">Pedime que ejecute agentes, busque leads o monitoree clientes.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'
              }`}>
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>

              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-100 rounded-tl-sm'
              }`}>
                {msg.content === '' && msg.role === 'assistant' ? (
                  <span className="flex gap-1 items-center py-0.5">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-700">
        <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={streaming}
            placeholder="Pedile algo al orquestador..."
            className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500 placeholder-gray-600 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
          >
            {streaming
              ? <Loader2 size={16} className="text-white animate-spin" />
              : <Send size={16} className="text-white" />}
          </button>
        </form>
      </div>
    </div>
  )
}
