import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateChatbotId, generateEmbedCode } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/seed/mis-proyectos
// Carga los clientes reales y proyectos propios de DIVINIA:
// Buggi Viajes, El Shopping del Usado, Oniria, Eco SL, ParkingSL, Tubi (Ediro)

const PROYECTOS = [
  // ── CLIENTES REALES ───────────────────────────────────────────────
  {
    chatbot_id: 'buggi-viajes',
    company_name: 'Buggi Viajes',
    contact_name: 'Buggi',
    email: 'buggiviajes@gmail.com',
    phone: '',
    status: 'active',
    plan: 'pro',
    rubro: 'turismo',
    city: 'San Luis',
    color: '#0ea5e9',
    products: 'web,chatbot',
    intro_emoji: '✈️,🌍,🗺️',
    intro_tagline: 'Tu próxima aventura empieza acá',
    intro_style: 'sparkles',
    system_prompt: 'Sos el asistente virtual de Buggi Viajes, agencia de viajes de San Luis. Respondés consultas sobre paquetes, destinos, precios y reservas en español argentino con entusiasmo.',
    welcome_message: '¡Hola! Soy el asistente de Buggi Viajes ✈️ ¿A dónde querés ir?',
    withTurnos: false,
    services: [],
    schedule: null,
  },
  {
    chatbot_id: 'shopping-del-usado',
    company_name: 'El Shopping del Usado',
    contact_name: 'Admin',
    email: 'shoppingdelusado@gmail.com',
    phone: '',
    status: 'active',
    plan: 'basic',
    rubro: 'ecommerce',
    city: 'San Luis',
    color: '#f59e0b',
    products: 'web',
    intro_emoji: '🛍️,♻️,💰',
    intro_tagline: 'Comprá y vendé lo que ya no usás',
    intro_style: 'bubbles',
    system_prompt: 'Sos el asistente virtual de El Shopping del Usado, marketplace de artículos usados de San Luis. Respondés consultas sobre cómo publicar, comprar y gestionar envíos en español argentino.',
    welcome_message: '¡Hola! Soy el asistente de El Shopping del Usado 🛍️ ¿En qué te puedo ayudar?',
    withTurnos: false,
    services: [],
    schedule: null,
  },
  {
    chatbot_id: 'tubi-ediro',
    company_name: 'Tubi',
    contact_name: 'Ediro',
    email: 'ediro@gmail.com',
    phone: '',
    status: 'active',
    plan: 'basic',
    rubro: 'otro',
    city: 'San Luis',
    color: '#8b5cf6',
    products: 'web',
    intro_emoji: '📱,🎯',
    intro_tagline: 'La app de Ediro, potenciada por DIVINIA',
    intro_style: 'sparkles',
    system_prompt: 'Sos el asistente virtual de Tubi. Respondés consultas de los usuarios en español argentino con amabilidad.',
    welcome_message: '¡Hola! Soy el asistente de Tubi 📱 ¿En qué te puedo ayudar?',
    withTurnos: false,
    services: [],
    schedule: null,
  },

  // ── PROYECTOS PROPIOS DIVINIA (en desarrollo) ─────────────────────
  {
    chatbot_id: 'oniria-app',
    company_name: 'Oniria',
    contact_name: 'Joaco — DIVINIA',
    email: 'diviniacorp@gmail.com',
    phone: '',
    status: 'trial',
    plan: 'trial',
    rubro: 'bienestar',
    city: 'San Luis',
    color: '#6366f1',
    products: 'web',
    intro_emoji: '🌙,✨,💤',
    intro_tagline: 'Explorá tu mundo interior — App DIVINIA',
    intro_style: 'petals',
    system_prompt: 'Sos el asistente de Oniria, app de bienestar y sueños de DIVINIA. Respondés consultas sobre la app en español argentino.',
    welcome_message: '¡Hola! Soy el asistente de Oniria 🌙 ¿En qué te puedo ayudar?',
    withTurnos: false,
    services: [],
    schedule: null,
  },
  {
    chatbot_id: 'eco-sl-app',
    company_name: 'Eco SL',
    contact_name: 'Joaco — DIVINIA',
    email: 'diviniacorp@gmail.com',
    phone: '',
    status: 'trial',
    plan: 'trial',
    rubro: 'otro',
    city: 'San Luis',
    color: '#10b981',
    products: 'web',
    intro_emoji: '🌿,♻️,🌎',
    intro_tagline: 'Plataforma eco para San Luis — App DIVINIA',
    intro_style: 'sparkles',
    system_prompt: 'Sos el asistente de Eco SL, plataforma de comercio y servicios sustentables de San Luis. Respondés consultas en español argentino.',
    welcome_message: '¡Hola! Soy el asistente de Eco SL 🌿 ¿En qué te puedo ayudar?',
    withTurnos: false,
    services: [],
    schedule: null,
  },
  {
    chatbot_id: 'parking-sl-app',
    company_name: 'ParkingSL',
    contact_name: 'Joaco — DIVINIA',
    email: 'diviniacorp@gmail.com',
    phone: '',
    status: 'trial',
    plan: 'trial',
    rubro: 'otro',
    city: 'San Luis',
    color: '#f97316',
    products: 'web,turnero',
    intro_emoji: '🚗,🅿️,📍',
    intro_tagline: 'Encontrá tu lugar — Parking inteligente San Luis',
    intro_style: 'sparkles',
    system_prompt: 'Sos el asistente de ParkingSL, app para encontrar y reservar estacionamiento en San Luis. Respondés consultas en español argentino.',
    welcome_message: '¡Hola! Soy el asistente de ParkingSL 🚗 ¿Necesitás un lugar para estacionar?',
    withTurnos: false,
    services: [],
    schedule: null,
  },
]

export async function GET() {
  const db = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const results = []

  for (const p of PROYECTOS) {
    const wantsChatbot = p.products.includes('chatbot')
    const chatbotId = p.chatbot_id
    const embedCode = wantsChatbot ? generateEmbedCode(chatbotId, appUrl) : null

    const clientData = {
      chatbot_id: chatbotId,
      embed_code: embedCode,
      company_name: p.company_name,
      contact_name: p.contact_name,
      email: p.email,
      phone: p.phone,
      status: p.status,
      plan: p.plan,
      custom_config: {
        color: p.color,
        rubro: p.rubro,
        city: p.city,
        products: p.products,
        system_prompt: p.system_prompt,
        welcome_message: p.welcome_message,
        intro_emoji: p.intro_emoji,
        intro_tagline: p.intro_tagline,
        intro_style: p.intro_style,
      },
    }

    const { data: upserted, error: upsertError } = await db
      .from('clients')
      .upsert(clientData, { onConflict: 'chatbot_id' })
      .select('id')
      .single()

    if (upsertError || !upserted) {
      results.push({ name: p.company_name, error: upsertError?.message })
      continue
    }

    results.push({ name: p.company_name, id: upserted.id, ok: true, products: p.products })
  }

  const ok = results.filter(r => r.ok).length
  const errors = results.filter(r => r.error)

  return NextResponse.json({
    success: errors.length === 0,
    message: `${ok}/${PROYECTOS.length} proyectos cargados`,
    results,
  })
}
