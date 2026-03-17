'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, ArrowRight, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGERENCIAS = [
  '¿Cuánto sale el chatbot?',
  'Tengo una peluquería, ¿me sirve?',
  '¿En cuánto tiempo lo instalan?',
  '¿Cómo funciona el sistema de turnos?',
]

export default function ChatbotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy un chatbot con IA real 🤖 Preguntame lo que quieras sobre DIVINIA o sobre cómo podría funcionar en tu negocio.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSugerencias, setShowSugerencias] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const userMsg = (text ?? input).trim()
    if (!userMsg || loading) return
    setInput('')
    setShowSugerencias(false)
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-8),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Hubo un problema. Probá de nuevo.',
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hubo un problema de conexión. Probá de nuevo.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Sparkles size={12} />
            IA real · Claude de Anthropic
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Probalo ahora mismo
          </h2>
          <p className="text-gray-500 text-lg">
            Este chatbot usa IA real — igual que el que instalamos en tu negocio
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Chat */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '460px' }}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Asistente DIVINIA</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-indigo-200 text-xs">IA real · Claude Haiku</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {showSugerencias && messages.length === 1 && (
                <div className="space-y-2">
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="block w-full text-left px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-gray-100 flex gap-2 bg-white flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Preguntá lo que quieras..."
                className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Info lateral */}
          <div className="space-y-5 pt-2">
            <h3 className="text-2xl font-bold text-gray-900">El chatbot real de tu negocio</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Lo que acabás de probar es Claude de Anthropic — la misma IA que instalaríamos en tu negocio, con <strong>tu información exacta</strong>: menú, precios, horarios, equipo, preguntas frecuentes.
            </p>
            <ul className="space-y-3">
              {[
                'Responde al instante, sin espera ni horario',
                'Entiende preguntas mal escritas o incompletas',
                'Habla como un empleado que conoce el negocio',
                'Deriva al humano cuando es necesario',
                'Se instala con una línea de código en tu web',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 text-xs font-bold">✓</div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="/trial"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
            >
              Quiero este chatbot para mi negocio
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
