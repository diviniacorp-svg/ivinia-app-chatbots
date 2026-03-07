'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, ArrowRight } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const DEMO_RESPONSES: Record<string, string> = {
  default: 'Buena pregunta! Podés preguntarme sobre horarios, precios o servicios. Esto es solo una demo — el chatbot real tendría info de tu negocio.',
  hola: '¡Hola! 👋 Bienvenido al demo de DIVINIA. Preguntame lo que quieras.',
  precio: 'Los planes arrancan desde $50.000 ARS/mes con 14 días de prueba gratis! Incluye chatbot para tu rubro, instalación y soporte.',
  horario: 'El chatbot que instalamos atiende las 24hs los 7 días. Nosotros (humanos) atendemos lunes a viernes de 9 a 18hs.',
  turno: 'En el chatbot real agendaría el turno con nombre, fecha y horario. ¿Querés probarlo en tu negocio?',
  prueba: '14 días gratis sin tarjeta. Te instalamos el chatbot y lo probás con clientes reales. ¿Arrancamos?',
}

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('hola') || lower.includes('buenas')) return DEMO_RESPONSES.hola
  if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuanto')) return DEMO_RESPONSES.precio
  if (lower.includes('horario') || lower.includes('hora')) return DEMO_RESPONSES.horario
  if (lower.includes('turno') || lower.includes('reserva') || lower.includes('cita')) return DEMO_RESPONSES.turno
  if (lower.includes('prueba') || lower.includes('gratis')) return DEMO_RESPONSES.prueba
  return DEMO_RESPONSES.default
}

export default function ChatbotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hola! Soy un chatbot de demo 🤖 Preguntame sobre precios, horarios o turnos.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setMessages(prev => [...prev, { role: 'assistant', content: getDemoResponse(userMsg) }])
    setLoading(false)
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
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Probalo ahora mismo
          </h2>
          <p className="text-gray-500 text-lg">
            Interactuá con el demo y vé cómo hablaría con tus clientes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden" style={{height:'420px',display:'flex',flexDirection:'column'}}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Asistente DIVINIA</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <p className="text-indigo-200 text-xs">En línea ahora</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 text-sm text-gray-400">
                    <span className="animate-pulse">Escribiendo...</span>
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
                placeholder="Escribí tu pregunta..."
                className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900"
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-5 pt-2">
            <h3 className="text-2xl font-bold text-gray-900">Así de simple es para tus clientes</h3>
            <p className="text-gray-500 leading-relaxed text-sm">El chatbot real de tu negocio tendría tu información exacta: menú, precios, horarios, equipo. Responde como un empleado que conoce todo.</p>
            <ul className="space-y-3">
              {['Responde al instante, sin espera','Habla en lenguaje natural','Entiende preguntas mal escritas','Deriva al humano cuando es necesario','Aprende con el tiempo'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 text-xs font-bold">✓</div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/trial" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm">
              Quiero este chatbot para mi negocio
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
