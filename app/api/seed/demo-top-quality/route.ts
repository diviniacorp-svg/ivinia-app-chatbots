import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/seed/demo-top-quality
// Crea (o actualiza) el cliente demo Top Quality con su booking config completa
export async function GET() {
  const db = createAdminClient()

  const chatbotId = 'top-quality-demo'

  // 1. Crear o actualizar cliente
  const { data: existing } = await db
    .from('clients')
    .select('id')
    .eq('chatbot_id', chatbotId)
    .maybeSingle()

  let clientId = existing?.id

  const clientData = {
    chatbot_id: chatbotId,
    company_name: 'Top Quality 🏊',
    contact_name: 'Top Quality',
    email: 'info@topquality.com.ar',
    status: 'active',
    plan: 'pro',
    custom_config: {
      color: '#0891b2', // cyan-600
      system_prompt: `Sos el asistente virtual de Top Quality, una empresa de mantenimiento y productos para piscinas en San Luis, Argentina. Respondés consultas sobre servicios, productos y cómo reservar una visita técnica. Usás español argentino. Si alguien quiere turno o visita, los mandás al link de reservas online.`,
      welcome_message: '¡Hola! Soy el asistente de Top Quality 🏊 ¿Necesitás ayuda con tu piscina?',
      horario: 'Lun a Vie 8:00 a 18:00 · Sáb 9:00 a 13:00',
      direccion: 'San Luis Capital',
      whatsapp: '5492665286110',
      intro_emoji: '🏊',
      intro_tagline: 'Tu piscina, siempre lista',
      intro_style: 'waves',
    },
  }

  if (!clientId) {
    const { data: newClient, error } = await db
      .from('clients')
      .insert(clientData)
      .select('id')
      .single()

    if (error || !newClient) {
      return NextResponse.json({ error: 'Error creando cliente', detail: error?.message }, { status: 500 })
    }
    clientId = newClient.id
  } else {
    await db.from('clients').update(clientData).eq('id', clientId)
  }

  // 2. Crear o actualizar booking config
  const { data: existingCfg } = await db
    .from('booking_configs')
    .select('id')
    .eq('client_id', clientId)
    .maybeSingle()

  const services = [
    {
      id: crypto.randomUUID(),
      category: 'Mantenimiento',
      name: 'Mantenimiento mensual de pileta',
      description: 'Limpieza, análisis de agua y ajuste de químicos',
      duration_minutes: 120,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Mantenimiento',
      name: 'Limpieza y aspirado',
      description: 'Aspirado de fondo, cepillado de paredes y skimmer',
      duration_minutes: 90,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Análisis',
      name: 'Análisis de agua completo',
      description: 'pH, cloro, alcalinidad y tratamiento incluido',
      duration_minutes: 60,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Análisis',
      name: 'Tratamiento de agua verde',
      description: 'Choque de cloro + algicida + limpieza',
      duration_minutes: 120,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Instalación y reparación',
      name: 'Instalación de bomba o filtro',
      description: 'Instalación y puesta en marcha de equipos',
      duration_minutes: 180,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Instalación y reparación',
      name: 'Reparación de pérdidas',
      description: 'Diagnóstico y reparación de pérdidas en cañerías',
      duration_minutes: 120,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Visita técnica',
      name: 'Visita técnica de diagnóstico',
      description: 'Evaluación completa del estado de la piscina',
      duration_minutes: 60,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Temporada',
      name: 'Apertura de temporada',
      description: 'Puesta en marcha completa para el verano',
      duration_minutes: 180,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Temporada',
      name: 'Cierre de temporada',
      description: 'Preparación de la pileta para el invierno',
      duration_minutes: 120,
      price_ars: 0,
      deposit_percentage: 0,
    },
  ]

  const bookingConfigData = {
    client_id: clientId,
    is_active: true,
    slot_duration_minutes: 30,
    advance_booking_days: 60,
    blocked_dates: [],
    owner_phone: '5492665286110',
    schedule: {
      lun: { open: '08:00', close: '18:00' },
      mar: { open: '08:00', close: '18:00' },
      mie: { open: '08:00', close: '18:00' },
      jue: { open: '08:00', close: '18:00' },
      vie: { open: '08:00', close: '18:00' },
      sab: { open: '09:00', close: '13:00' },
      dom: null,
    },
    services,
    professionals: [
      {
        id: crypto.randomUUID(),
        name: 'Técnico Top Quality',
        emoji: '🔧',
        color: '#0891b2',
        bio: 'Especialista en mantenimiento y tratamiento de piscinas',
        service_ids: [],
      },
    ],
  }

  let configId: string

  if (existingCfg) {
    configId = existingCfg.id
    const { error: cfgError } = await db
      .from('booking_configs')
      .update(bookingConfigData)
      .eq('id', configId)

    if (cfgError) {
      return NextResponse.json({ error: 'Error actualizando booking config', detail: cfgError.message }, { status: 500 })
    }
  } else {
    const { data: newCfg, error: cfgError } = await db
      .from('booking_configs')
      .insert(bookingConfigData)
      .select('id')
      .single()

    if (cfgError || !newCfg) {
      return NextResponse.json({ error: 'Error creando booking config', detail: cfgError?.message }, { status: 500 })
    }
    configId = newCfg.id
  }

  return NextResponse.json({
    success: true,
    message: '✅ Demo Top Quality creado correctamente',
    urls: {
      reservas: `/reservas/${configId}`,
      reservas_full: `https://divinia.vercel.app/reservas/${configId}`,
      panel: `/panel/${configId}`,
      panel_full: `https://divinia.vercel.app/panel/${configId}`,
      propuesta: `https://divinia.vercel.app/propuesta/top-quality`,
      chatbot_widget_id: chatbotId,
    },
    client_id: clientId,
    config_id: configId,
    services_count: services.length,
    instrucciones: [
      '1. Mandá el link de reservas a Top Quality para que lo vea en vivo',
      '2. El panel muestra todos los turnos que entren',
      '3. Los precios dicen "Consultar" — los completamos cuando cierren',
    ],
  })
}
