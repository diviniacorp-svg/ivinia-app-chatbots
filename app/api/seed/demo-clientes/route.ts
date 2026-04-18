import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateChatbotId, generateEmbedCode } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/seed/demo-clientes
// Crea los clientes demo: FA, Turnero, Complejo Los Paraísos, Cantera Hotel, Hostería Míninco

const DEMOS = [
  {
    chatbot_id: 'fa-faby-demo',
    pin: '2580',
    company_name: 'FA',
    contact_name: 'Faby',
    email: 'FabyanaYAndres@gmail.com',
    status: 'active',
    plan: 'basic',
    color: '#7c3aed',
    intro_emoji: '💼,📋',
    intro_tagline: 'Asesoramiento contable y profesional',
    intro_style: 'sparkles',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de FA. Respondés consultas con amabilidad en español argentino.',
    welcome_message: '¡Hola! ¿En qué te puedo ayudar?',
    services: [
      { cat: 'Consultas', name: 'Consulta inicial gratuita', desc: 'Primera consulta sin cargo para conocer tu caso', dur: 30 },
      { cat: 'Consultas', name: 'Asesoramiento contable', desc: 'Consulta sobre contabilidad general y libros', dur: 60 },
      { cat: 'Consultas', name: 'Consulta AFIP / Monotributo', desc: 'Altas, bajas, recategorización y trámites AFIP', dur: 30 },
      { cat: 'Impuestos', name: 'Declaración jurada mensual', desc: 'Presentación y pago de impuestos mensuales', dur: 45 },
      { cat: 'Impuestos', name: 'Cierre de ejercicio', desc: 'Balance anual y presentación de declaración', dur: 120 },
      { cat: 'Auditoría', name: 'Auditoría financiera', desc: 'Revisión completa de cuentas y estados financieros', dur: 120 },
    ],
    schedule: {
      lun: { open: '09:00', close: '18:00' },
      mar: { open: '09:00', close: '18:00' },
      mie: { open: '09:00', close: '18:00' },
      jue: { open: '09:00', close: '18:00' },
      vie: { open: '09:00', close: '17:00' },
      sab: null, dom: null,
    },
  },
  {
    chatbot_id: 'turnero-joaquin-demo',
    pin: '',
    company_name: 'Turnero',
    contact_name: 'Joaquin',
    email: 'asesorjoaquin6@gmail.com',
    status: 'trial',
    plan: 'trial',
    color: '#f59e0b',
    intro_emoji: '📅',
    intro_tagline: 'Sistema de turnos online para tu negocio',
    intro_style: 'sparkles',
    withTurnos: false,
    withChatbot: true,
    system_prompt: 'Sos el asistente virtual de Turnero. Respondés consultas sobre el sistema de turnos online en español argentino.',
    welcome_message: '¡Hola! Soy el asistente de Turnero 📅 ¿En qué te puedo ayudar?',
    services: [],
    schedule: null,
  },
  {
    chatbot_id: 'complejo-paraisos-demo',
    pin: '1357',
    company_name: 'Complejo Los Paraísos',
    contact_name: 'Recepción Los Paraísos',
    email: 'reservas@complejolosparaisos.com',
    status: 'active',
    plan: 'trial',
    color: '#0284c7',
    intro_emoji: '🌴,🏖️,☀️',
    intro_tagline: 'Tu escapada perfecta te espera',
    intro_style: 'bubbles',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de Complejo Los Paraísos. Respondés consultas sobre reservas, instalaciones y servicios del complejo. Usás español argentino.',
    welcome_message: '¡Bienvenido a Complejo Los Paraísos! 🌴 ¿En qué te puedo ayudar?',
    services: [
      { cat: 'Alojamiento', name: 'Check-in / Check-out', desc: 'Gestión de ingreso y egreso de la cabaña', dur: 30 },
      { cat: 'Alojamiento', name: 'Reserva de cabaña', desc: 'Consulta disponibilidad y reserva con anticipo', dur: 30 },
      { cat: 'Pileta', name: 'Pileta privada — jornada completa', desc: 'Acceso exclusivo a pileta privada todo el día', dur: 480 },
      { cat: 'Pileta', name: 'Pileta privada — media jornada', desc: 'Acceso a pileta privada por 4 horas', dur: 240 },
      { cat: 'Actividades', name: 'Paseo en bote', desc: 'Recorrido guiado por el lago con bote a remo', dur: 90 },
      { cat: 'Actividades', name: 'Excursión guiada', desc: 'Trekking y senderismo con guía por los cerros', dur: 180 },
      { cat: 'Gastronomía', name: 'Asado en quincho privado', desc: 'Reserva del quincho con parrilla y vajilla', dur: 120 },
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
    pin: '7410',
    company_name: 'Cantera Boutique Hotel',
    contact_name: 'Recepción Cantera',
    email: 'info@canterahotel.com',
    status: 'active',
    plan: 'trial',
    color: '#92400e',
    intro_emoji: '🏨,🥂,🌹',
    intro_tagline: 'Confort exclusivo en cada detalle',
    intro_style: 'petals',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de Cantera Boutique Hotel. Respondés consultas sobre reservas, habitaciones, servicios y tarifas. Usás español argentino con tono elegante.',
    welcome_message: '¡Bienvenido a Cantera Boutique Hotel! 🏨 ¿En qué le puedo ayudar?',
    services: [
      { cat: 'Hospedaje', name: 'Check-in habitación', desc: 'Ingreso y asignación de habitación', dur: 30 },
      { cat: 'Hospedaje', name: 'Consulta de disponibilidad', desc: 'Verificación de habitaciones y tarifas', dur: 20 },
      { cat: 'Spa & Bienestar', name: 'Masajes relajantes', desc: 'Sesión de masajes profesionales 60 minutos', dur: 60 },
      { cat: 'Spa & Bienestar', name: 'Circuito hidrotermal', desc: 'Jacuzzi, sauna y sala de vapor', dur: 90 },
      { cat: 'Gastronomía', name: 'Cena romántica', desc: 'Mesa reservada en restaurante para dos personas', dur: 90 },
      { cat: 'Gastronomía', name: 'Desayuno gourmet en habitación', desc: 'Desayuno premium servido en su habitación', dur: 60 },
      { cat: 'Experiencias', name: 'Tour por la bodega', desc: 'Visita guiada con degustación de vinos', dur: 90 },
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
    pin: '8642',
    company_name: 'Hostería Míninco',
    contact_name: 'Recepción Míninco',
    email: 'reservas@hosteriamininco.com.ar',
    status: 'active',
    plan: 'trial',
    color: '#16a34a',
    intro_emoji: '🌿,🏔️,🦅',
    intro_tagline: 'Naturaleza, aventura y descanso',
    intro_style: 'sparkles',
    withTurnos: true,
    withChatbot: true,
    system_prompt: 'Sos la asistente virtual de Hostería Míninco. Respondés consultas sobre reservas, habitaciones, actividades y servicios. Usás español argentino.',
    welcome_message: '¡Bienvenido a Hostería Míninco! 🌿 ¿En qué te puedo ayudar?',
    services: [
      { cat: 'Alojamiento', name: 'Reserva de habitación', desc: 'Check-in y asignación de habitación', dur: 30 },
      { cat: 'Aventura', name: 'Cabalgata guiada (2hs)', desc: 'Cabalgata por senderos del monte con guía', dur: 120 },
      { cat: 'Aventura', name: 'Trekking corto (2hs)', desc: 'Circuito de senderismo nivel principiante', dur: 120 },
      { cat: 'Aventura', name: 'Trekking completo (4hs)', desc: 'Circuito completo con cumbre y vistas panorámicas', dur: 240 },
      { cat: 'Aventura', name: 'Mountain bike', desc: 'Alquiler de bici y guía por los senderos', dur: 120 },
      { cat: 'Gastronomía', name: 'Reserva en restaurante', desc: 'Mesa en el restaurante de la hostería', dur: 90 },
      { cat: 'Gastronomía', name: 'Fogón nocturno', desc: 'Experiencia nocturna con asado y fogón bajo las estrellas', dur: 180 },
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
        intro_emoji: demo.intro_emoji,
        intro_tagline: demo.intro_tagline,
        intro_style: demo.intro_style,
      },
    }

    // Upsert cliente — inserta o actualiza por chatbot_id
    const { data: upserted, error: upsertError } = await db
      .from('clients').upsert(clientData, { onConflict: 'chatbot_id' }).select('id').single()
    if (upsertError || !upserted) {
      results.push({ name: demo.company_name, error: upsertError?.message })
      continue
    }
    clientId = upserted.id

    // Crear booking config si tiene turnos
    if (demo.withTurnos && demo.schedule && demo.services.length > 0) {
      const { data: existingCfgs } = await db
        .from('booking_configs').select('id').eq('client_id', clientId).limit(1)

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
        owner_pin: demo.pin || '1234',
        schedule: demo.schedule,
        services,
      }

      if (existingCfgs && existingCfgs.length > 0) {
        const { error: cfgErr } = await db.from('booking_configs').update(cfgData).eq('id', existingCfgs[0].id)
        if (cfgErr) { results.push({ name: demo.company_name, id: clientId, cfg_error: cfgErr.message }); continue }
      } else {
        const { error: cfgErr } = await db.from('booking_configs').insert(cfgData)
        if (cfgErr) { results.push({ name: demo.company_name, id: clientId, cfg_error: cfgErr.message }); continue }
      }
    }

    results.push({ name: demo.company_name, id: clientId, ok: true })
  }

  return NextResponse.json({ success: true, results })
}
