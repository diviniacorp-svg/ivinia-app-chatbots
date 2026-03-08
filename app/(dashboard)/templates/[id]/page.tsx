'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const RUBRO_EMOJIS: Record<string, string> = {
  restaurante: '🍽️', clinica: '🏥', inmobiliaria: '🏠',
  gimnasio: '💪', contabilidad: '📊', farmacia: '💊',
  peluqueria: '✂️', taller: '🔧', hotel: '🏨',
  veterinaria: '🐾', ecommerce: '🛍️', odontologia: '🦷', legal: '⚖️',
  agencia: '🚀', turismo: '✈️', consultora: '💼',
}

interface Template {
  id: string
  name: string
  rubro: string
  description: string
  color_primary: string
  price_monthly: number
  trial_days: number
  welcome_message: string
  system_prompt: string
  faqs: { q: string; a: string }[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function parseFlowSteps(systemPrompt: string): string[] {
  const lines = systemPrompt.split('\n')
  const steps: string[] = []
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)/)
    if (match) steps.push(match[1].trim())
  }
  return steps
}

function parseSections(systemPrompt: string): { title: string; items: string[] }[] {
  const sections: { title: string; items: string[] }[] = []
  let currentSection: { title: string; items: string[] } | null = null

  for (const line of systemPrompt.split('\n')) {
    if (line.endsWith(':') && !line.startsWith('-') && !line.match(/^\d/)) {
      if (currentSection && currentSection.items.length > 0) sections.push(currentSection)
      currentSection = { title: line.replace(':', ''), items: [] }
    } else if (line.startsWith('- ') && currentSection) {
      currentSection.items.push(line.replace('- ', '').replace(/\{[^}]+\}/g, '...'))
    }
  }
  if (currentSection && currentSection.items.length > 0) sections.push(currentSection)
  return sections
}

export default function TemplatePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'chat' | 'flujo' | 'prompt'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => {
        const t = (d.templates || []).find((t: Template) => t.id === id)
        if (!t) { router.push('/templates'); return }
        setTemplate(t)
        const welcome = t.welcome_message
          .replace(/\{NOMBRE_NEGOCIO\}/g, t.name.replace('Chatbot para ', ''))
          .replace(/\{[^}]+\}/g, '...')
        setMessages([{ role: 'assistant', content: welcome }])
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending || !template) return
    const userMsg = input.trim()
    setInput('')
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newHistory)
    setSending(true)
    try {
      const res = await fetch('/api/chatbot/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id, message: userMsg, history: messages }),
      })
      const data = await res.json()
      setMessages([...newHistory, { role: 'assistant', content: data.response || 'Error al responder' }])
    } catch {
      setMessages([...newHistory, { role: 'assistant', content: 'Error de conexión. Verificá que el servidor esté corriendo.' }])
    } finally {
      setSending(false)
    }
  }

  const resetChat = () => {
    if (!template) return
    const welcome = template.welcome_message
      .replace(/\{NOMBRE_NEGOCIO\}/g, template.name.replace('Chatbot para ', ''))
      .replace(/\{[^}]+\}/g, '...')
    setMessages([{ role: 'assistant', content: welcome }])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!template) return null

  const flowSteps = parseFlowSteps(template.system_prompt)
  const sections = parseSections(template.system_prompt)
  const emoji = RUBRO_EMOJIS[template.rubro] || '🤖'
  const color = template.color_primary || '#6366f1'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/templates" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: color + '20' }}>
            {emoji}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{template.name}</h1>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">${(template.price_monthly).toLocaleString('es-AR')}/mes</span>
          <Link href={`/clientes?template=${template.id}`}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            Usar con un cliente
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(['chat', 'flujo', 'prompt'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'chat' ? '💬 Chat en vivo' : t === 'flujo' ? '🗺️ Flujo' : '⚙️ Prompt'}
          </button>
        ))}
      </div>

      {/* Tab: Chat */}
      {tab === 'chat' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: '560px' }}>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100" style={{ backgroundColor: color + '10' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: color }}>
                  {emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{template.name.replace('Chatbot para ', '')}</p>
                  <p className="text-xs text-green-600 font-medium">● En línea — modo preview</p>
                </div>
                <button onClick={resetChat} className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Reiniciar chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Escribí un mensaje para probar el chatbot..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button onClick={sendMessage} disabled={sending || !input.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                    style={{ backgroundColor: color }}>
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs panel */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Preguntas frecuentes del template</h3>
            <div className="space-y-2">
              {(template.faqs || []).map((faq, i) => (
                <button key={i} onClick={() => setInput(faq.q)}
                  className="w-full text-left bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                  <p className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium">{faq.q}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{faq.a}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Hacé click en una pregunta para probarla en el chat</p>
          </div>
        </div>
      )}

      {/* Tab: Flujo */}
      {tab === 'flujo' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Flow steps */}
          {flowSteps.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5">Flujo de conversación</h3>
              <div className="space-y-3">
                {flowSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: color }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-4">
            {sections.slice(0, 4).map((section, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-bold text-gray-800 text-sm mb-3">{section.title}</h4>
                <ul className="space-y-1.5">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-xs mt-0.5" style={{ color }}>●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Welcome message */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h4 className="font-bold text-gray-800 text-sm mb-3">Mensaje de bienvenida</h4>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-600 italic">
                  "{template.welcome_message.replace(/\{NOMBRE_NEGOCIO\}/g, template.name.replace('Chatbot para ', '')).replace(/\{[^}]+\}/g, '...')}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Prompt */}
      {tab === 'prompt' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">System Prompt completo</h3>
            <button onClick={() => navigator.clipboard.writeText(template.system_prompt)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
              Copiar
            </button>
          </div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-5 font-mono leading-relaxed overflow-auto max-h-[500px]">
            {template.system_prompt}
          </pre>
        </div>
      )}
    </div>
  )
}
