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

function extractVariables(text: string): string[] {
  const matches = text.match(/\{[A-Z_]+\}/g) || []
  return [...new Set(matches)].map(v => v.replace(/[{}]/g, ''))
}

const STEP_ICONS: Record<number, string> = {
  0: '👋', 1: '🔍', 2: '💬', 3: '📋', 4: '✅', 5: '📞', 6: '🎯', 7: '📅', 8: '💰',
}

const VAR_LABELS: Record<string, { label: string; placeholder: string }> = {
  NOMBRE_NEGOCIO: { label: 'Nombre del negocio', placeholder: 'Ej: La Trattoria' },
  CIUDAD: { label: 'Ciudad', placeholder: 'Ej: San Luis' },
  DIRECCION: { label: 'Dirección', placeholder: 'Ej: Rivadavia 123' },
  TELEFONO: { label: 'Teléfono', placeholder: 'Ej: 266 4123456' },
  WHATSAPP: { label: 'WhatsApp', placeholder: 'Ej: 5492664123456' },
  EMAIL: { label: 'Email', placeholder: 'Ej: info@negocio.com' },
  HORARIO: { label: 'Horario de atención', placeholder: 'Ej: Lun-Vie 9-18hs' },
  MENU: { label: 'Menú / Carta', placeholder: 'Ej: Pasta, Pizzas, Ensaladas...' },
  PRECIOS: { label: 'Precios', placeholder: 'Ej: Platos desde $5.000' },
  DELIVERY_INFO: { label: 'Info delivery', placeholder: 'Ej: Por PedidosYa y Rappi' },
  ESPECIALIDADES: { label: 'Especialidades / Servicios', placeholder: 'Ej: Cardiología, Clínica General' },
  OBRAS_SOCIALES: { label: 'Obras sociales', placeholder: 'Ej: OSDE, Swiss Medical, PAMI' },
  PRECIO_CONSULTA: { label: 'Precio consulta', placeholder: 'Ej: $10.000' },
  ESPECIALIDAD: { label: 'Especialidad', placeholder: 'Ej: Cocina italiana' },
  HABITACIONES: { label: 'Tipos de habitación', placeholder: 'Ej: Simple, Doble, Suite' },
  TARIFAS: { label: 'Tarifas', placeholder: 'Ej: Desde $50.000/noche' },
  CHECK_IN: { label: 'Hora check-in', placeholder: 'Ej: 14:00' },
  CHECK_OUT: { label: 'Hora check-out', placeholder: 'Ej: 11:00' },
  SERVICIOS: { label: 'Servicios', placeholder: 'Ej: Corte, Color, Peinado' },
  SERVICIOS_PRECIOS: { label: 'Servicios y precios', placeholder: 'Ej: Corte $5.000, Color $15.000' },
  STAFF: { label: 'Equipo / Personal', placeholder: 'Ej: Marta, Lorena, Javier' },
  PRECIO_CORTE: { label: 'Precio corte', placeholder: 'Ej: $4.500' },
  PLANES_PRECIOS: { label: 'Planes y precios', placeholder: 'Ej: Mensual $30.000, Trimestral $80.000' },
  CLASES: { label: 'Clases disponibles', placeholder: 'Ej: Spinning, Yoga, Funcional' },
  PROPIEDADES: { label: 'Propiedades disponibles', placeholder: 'Ej: Dptos 2-3 ambientes, Casas' },
  ZONAS: { label: 'Zonas de operación', placeholder: 'Ej: Centro, Juana Koslay, La Punta' },
  NOMBRE_CONTADOR: { label: 'Nombre del contador', placeholder: 'Ej: CP Martínez Juan' },
  PRECIO_MONO: { label: 'Precio monotributo', placeholder: 'Ej: $8.000/mes' },
  GUARDIA: { label: 'Guardia / Urgencias', placeholder: 'Ej: 24hs en {TELEFONO}' },
  SERVICIOS_EXTRAS: { label: 'Servicios extras', placeholder: 'Ej: Medición de presión, inyectables' },
  HORARIOS: { label: 'Horarios', placeholder: 'Ej: Lunes a Viernes 9-18hs' },
  TRATAMIENTOS: { label: 'Tratamientos', placeholder: 'Ej: Limpieza, Blanqueamiento, Ortodoncia' },
  CATEGORIAS: { label: 'Categorías de productos', placeholder: 'Ej: Ropa, Calzado, Accesorios' },
  INFO_ENVIOS: { label: 'Info de envíos', placeholder: 'Ej: 24-48hs a todo el país via OCA' },
  MEDIOS_PAGO: { label: 'Medios de pago', placeholder: 'Ej: Tarjeta, MercadoPago, transferencia' },
  WEB: { label: 'Sitio web', placeholder: 'Ej: www.minegocio.com.ar' },
  TRATAMIENTOS_DENTAL: { label: 'Tratamientos dentales', placeholder: 'Ej: Limpieza, ortodoncia, blanqueamiento' },
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
  const allVars = extractVariables(template.system_prompt + ' ' + template.welcome_message)

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
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Diagrama de flujo — ocupa 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mensaje de bienvenida */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Inicio de conversación</p>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: color }}>
                  {emoji}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl rounded-tl-sm px-4 py-3">
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{template.welcome_message
                      .replace(/\{NOMBRE_NEGOCIO\}/g, template.name.replace('Chatbot para ', ''))
                      .replace(/\{[^}]+\}/g, '...')}"
                  </p>
                </div>
              </div>
            </div>

            {/* Flecha */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-px h-4 bg-gray-300" />
                <div className="text-gray-300 text-xs">▼</div>
              </div>
            </div>

            {/* Pasos del flujo */}
            {flowSteps.length > 0 ? (
              <div className="relative">
                {flowSteps.map((step, i) => (
                  <div key={i}>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                      {/* Número + icono */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: color }}>
                          {i + 1}
                        </div>
                        <span className="text-base">{STEP_ICONS[i] || '💬'}</span>
                      </div>
                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Paso {i + 1}</p>
                        <p className="text-sm text-gray-800 leading-relaxed">{step}</p>
                      </div>
                    </div>
                    {/* Conector entre pasos */}
                    {i < flowSteps.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="flex flex-col items-center gap-0">
                          <div className="w-px h-3 bg-gray-200" />
                          <div className="text-gray-300 text-xs leading-none">▼</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Si no hay pasos numerados, mostrar secciones del prompt */
              <div className="space-y-3">
                {sections.slice(0, 3).map((section, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{section.title}</p>
                    <ul className="space-y-1">
                      {section.items.slice(0, 5).map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1 flex-shrink-0" style={{ color }}>●</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Cierre */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-px h-4 bg-gray-300" />
                <div className="text-gray-300 text-xs">▼</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-bold text-green-800">Conversación resuelta</p>
                <p className="text-xs text-green-600">El cliente obtuvo la información o agendó su turno</p>
              </div>
            </div>
          </div>

          {/* Panel lateral: Variables a personalizar — ocupa 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-indigo-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔧</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Variables a personalizar</h3>
                  <p className="text-xs text-gray-400">{allVars.length} campos para reemplazar</p>
                </div>
              </div>

              <div className="space-y-2">
                {allVars.map(v => {
                  const info = VAR_LABELS[v]
                  return (
                    <div key={v} className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700">{info?.label || v}</p>
                        <p className="text-xs text-gray-400 truncate">{info?.placeholder || `{${v}}`}</p>
                      </div>
                      <code className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                        {`{${v}}`}
                      </code>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Instrucción de cómo usar */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-800 mb-2">¿Cómo personalizar este flujo?</p>
              <ol className="space-y-1.5 text-xs text-amber-700">
                <li><span className="font-bold">1.</span> Andá al tab <strong>⚙️ Prompt</strong></li>
                <li><span className="font-bold">2.</span> Copiá el texto completo</li>
                <li><span className="font-bold">3.</span> Pegalo en un editor de texto</li>
                <li><span className="font-bold">4.</span> Reemplazá cada <code className="bg-amber-100 px-1 rounded">{'{VARIABLE}'}</code> con los datos del cliente</li>
                <li><span className="font-bold">5.</span> Usá el prompt personalizado al crear el cliente en <strong>/clientes</strong></li>
              </ol>
            </div>

            {/* Secciones de info del prompt */}
            {sections.slice(0, 2).map((section, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{section.title}</p>
                <ul className="space-y-1">
                  {section.items.slice(0, 4).map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="mt-0.5 flex-shrink-0" style={{ color }}>●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
