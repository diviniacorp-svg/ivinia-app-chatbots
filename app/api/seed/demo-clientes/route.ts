import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateChatbotId, generateEmbedCode } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/seed/demo-clientes
// Crea los clientes demo: FA, Turnero, Complejo Los Paraísos, Cantera Hotel, Hostería Míninco

const DEMOS = [
  {
    chatbot_id: 'fa-faby-demo',
    company_name: 'FA',
    contact_name: 'Faby',
    email: 'FabyanaYAndres@gmail.com',
    status: 'active',
    plan: 'basic',
    color: '#7c3aed',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de FA. Respondés consultas con amabilidad en español argentino.',
    welcome_message: '¡Hola! ¿En qué te puedo ayudar?',
    services: [
      { cat: 'Servicios', name: 'Consulta general', desc: '', dur: 60 },
      { cat: 'Servicios', name: 'Asesoramiento', desc: '', dur: 90 },
    ],
    schedule: {
      lun: { open: '09:00', close: '18:00' },
      mar: { open: '09:00', close: '18:00' },
      mie: { open: '09:00', close: '18:00' },
      jue: { open: '09:00', close: '18:00' },
      vie: { open: '09:00', close: '18:00' },
      sab: null, dom: null,
    },
  },
  {
    chatbot_id: 'turnero-joaquin-demo',
    company_name: 'Turnero',
    contact_name: 'Joaquin',
    email: 'asesorjoaquin6@gmail.com',
    status: 'trial',
    plan: 'trial',
    color: '#f59e0b',
    withTurnos: false,
    withChatbot: true,
    system_prompt: 'Sos el asistente virtual de Turnero. Respondés consultas sobre el sistema de turnos online en español argentino.',
    welcome_message: '¡Hola! Soy el asistente de Turnero 📅 ¿En qué te puedo ayudar?',
    services: [],
    schedule: null,
  },
  {
    chatbot_id: 'complejo-paraisos-demo',
    company_name: 'Complejo Los Paraísos',
    contact_name: 'Recepción Los Paraísos',
    email: 'reservas@complejolosparaisos.com',
    status: 'active',
    plan: 'trial',
    color: '#0284c7',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de Complejo Los Paraísos. Respondés consultas sobre reservas, instalaciones y servicios del complejo. Usás español argentino.',
    welcome_message: '¡Bienvenido a Complejo Los Paraísos! 🌴 ¿En qué te puedo ayudar?',
    services: [
      { cat: 'Alojamiento', name: 'Check-in / Check-out', desc: 'Gestión de ingreso y egreso', dur: 30 },
      { cat: 'Alojamiento', name: 'Consulta de disponibilidad', desc: 'Verificación de habitaciones', dur: 30 },
      { cat: 'Servicios', name: 'Reserva de actividades', desc: 'Actividades del complejo', dur: 60 },
    ],
    schedule: {
      lun: { open: '08:00', close: '20:00' },
      mar: { open: '08:00', close: '20:00' },
      mie: { open: '08:00', close: '20:00' },
      jue: { open: '08:00', close: '20:00' },
      vie: { open: '08:00', close: '20:00' },
      sab: { open: '08:00', close: '20:00' },
      dom: { open: '09:00', close: '18:00' },
    },
  },
  {
    chatbot_id: 'cantera-boutique-hotel-demo',
    company_name: 'Cantera Boutique Hotel',
    contact_name: 'Recepción Cantera',
    email: 'info@canterahotel.com',
    status: 'active',
    plan: 'trial',
    color: '#92400e',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de Cantera Boutique Hotel. Respondés consultas sobre reservas, habitaciones, servicios y tarifas. Usás español argentino con tono elegante.',
    welcome_message: '¡Bienvenido a Cantera Boutique Hotel! 🏨 ¿En qué le puedo ayudar?',
    services: [
      { cat: 'Reservas', name: 'Check-in', desc: 'Ingreso al hotel', dur: 30 },
      { cat: 'Reservas', name: 'Consulta de habitaciones', desc: 'Disponibilidad y tarifas', dur: 30 },
      { cat: 'Servicios', name: 'Servicio de spa', desc: 'Reserva de spa y bienestar', dur: 60 },
      { cat: 'Servicios', name: 'Desayuno especial', desc: 'Reserva de desayuno', dur: 60 },
    ],
    schedule: {
      lun: { open: '07:00', close: '22:00' },
      mar: { open: '07:00', close: '22:00' },
      mie: { open: '07:00', close: '22:00' },
      jue: { open: '07:00', close: '22:00' },
      vie: { open: '07:00', close: '22:00' },
      sab: { open: '07:00', close: '22:00' },
      dom: { open: '07:00', close: '22:00' },
    },
  },
  {
    chatbot_id: 'hosteria-mininco-demo',
    company_name: 'Hostería Míninco',
    contact_name: 'Recepción Míninco',
    email: 'reservas@hosteriamininco.com.ar',
    status: 'active',
    plan: 'trial',
    color: '#16a34a',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de Hostería Míninco. Respondés consultas sobre reservas, habitaciones, actividades y servicios. Usás español argentino.',
    welcome_message: '¡Bienvenido a Hostería Míninco! 🌿 ¿En qué te puedo ayudar?',
    services: [
      { cat: 'Alojamiento', name: 'Reserva de habitación', desc: 'Check-in y disponibilidad', dur: 30 },
      { cat: 'Actividades', name: 'Cabalgatas', desc: 'Reserva de cabalgata guiada', dur: 120 },
      { cat: 'Actividades', name: 'Senderismo', desc: 'Circuitos de trekking', dur: 180 },
      { cat: 'Gastronomía', name: 'Reserva en restaurante', desc: 'Mesa en el restaurante de la hostería', dur: 90 },
    ],
    schedule: {
      lun: { open: '08:00', close: '20:00' },
      mar: { open: '08:00', close: '20:00' },
      mie: { open: '08:00', close: '20:00' },
      jue: { open: '08:00', close: '20:00' },
      vie: { open: '08:00', close: '20:00' },
      sab: { open: '08:00', close: '20:00' },
      dom: { open: '09:00', close: '18:00' },
    },
  },
]

export async function GET() {
  const db = createAdminClient()
  const results = []

  for (const demo of DEMOS) {
    // Verificar si ya existe
    const { data: existing } = await db
      .from('clients')
      .select('id')
      .eq('chatbot_id', demo.chatbot_id)
      .maybeSingle()

    let clientId = existing?.id

    const chatbotId = demo.chatbot_id
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
    const embedCode = generateEmbedCode(chatbotId, appUrl)

    const clientData = {
      chatbot_id: chatbotId,
      embed_code: embedCode,
      company_name: demo.company_name,
      contact_name: demo.contact_name,
      email: demo.email,
      status: demo.status,
      plan: demo.plan,
      custom_config: {
        color: demo.color,
        system_prompt: demo.system_prompt,
        welcome_message: demo.welcome_message,
      },
    }

    if (!clientId) {
      const { data: newClient, error } = await db
        .from('clients').insert(clientData).select('id').single()
      if (error || !newClient) {
        results.push({ name: demo.company_name, error: error?.message })
        continue
      }
      clientId = newClient.id
    } else {
      await db.from('clients').update(clientData).eq('id', clientId)
    }

    // Crear booking config si tiene turnos
    if (demo.withTurnos && demo.schedule && demo.services.length > 0) {
      const { data: existingCfg } = await db
        .from('booking_configs').select('id').eq('client_id', clientId).maybeSingle()

      const services = demo.services.map(s => ({
        id: crypto.randomUUID(),
        category: s.cat,
        name: s.name,
        description: s.desc,
        duration_minutes: s.dur,
        price_ars: 0,
        deposit_percentage: 0,
      }))

      const cfgData = {
        client_id: clientId,
        is_active: true,
        slot_duration_minutes: 30,
        advance_booking_days: 60,
        blocked_dates: [],
        owner_phone: '5492665286110',
        schedule: demo.schedule,
        services,
        professionals: [],
      }

      if (existingCfg) {
        await db.from('booking_configs').update(cfgData).eq('id', existingCfg.id)
      } else {
        await db.from('booking_configs').insert(cfgData)
      }
    }

    results.push({ name: demo.company_name, id: clientId, ok: true })
  }

  return NextResponse.json({ success: true, results })
}
