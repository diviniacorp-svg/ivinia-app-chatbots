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
    company_name: 'Top Quality Piscinas',
    contact_name: 'Top Quality Piscinas',
    email: 'info@topqualitypiscinas.com.ar',
    status: 'active',
    plan: 'pro',
    custom_config: {
      color: '#1d4ed8', // azul marca Top Quality
      system_prompt: `Sos el asistente virtual de Top Quality Piscinas, una empresa de limpieza y mantenimiento de piscinas en San Luis, Argentina. Atendés todo el año. Respondés consultas sobre servicios de limpieza, mantenimiento, desinfección, cuarzo filtrante, arreglos, pintura, instalación de bombas y equipos. Usás español argentino. Si alguien quiere reservar una visita o turno, los mandás al link de reservas.`,
      welcome_message: '¡Hola! Soy el asistente de Top Quality Piscinas 🏊 ¿En qué te puedo ayudar?',
      horario: 'Lun a Vie 8:00 a 18:00 · Sáb 9:00 a 13:00',
      direccion: 'San Luis Capital',
      whatsapp: '5492664864731',
      facebook: 'topqualitypiscina',
      intro_emoji: '🏊,💧,🔵',
      intro_tagline: 'Limpieza y mantenimiento de piscinas todo el año',
      intro_style: 'waves',
    },
  }

  // Upsert cliente
  const { data: upsertedClient, error: clientError } = await db
    .from('clients')
    .upsert(clientData, { onConflict: 'chatbot_id' })
    .select('id')
    .single()

  if (clientError || !upsertedClient) {
    return NextResponse.json({ error: 'Error creando cliente', detail: clientError?.message }, { status: 500 })
  }
  clientId = upsertedClient.id

  // 2. Crear o actualizar booking config
  const { data: existingCfgs } = await db
    .from('booking_configs')
    .select('id')
    .eq('client_id', clientId)
    .limit(1)

  const services = [
    {
      id: crypto.randomUUID(),
      category: 'Limpieza',
      name: 'Limpieza y aspirado completo',
      description: 'Aspirado de fondo, cepillado de paredes y limpieza de skimmer',
      duration_minutes: 90,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Limpieza',
      name: 'Desinfección de piscina',
      description: 'Tratamiento completo de desinfección y limpieza',
      duration_minutes: 60,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Mantenimiento',
      name: 'Mantenimiento mensual',
      description: 'Limpieza, control de químicos y revisión de equipos. Todo el año.',
      duration_minutes: 120,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Mantenimiento',
      name: 'Tratamiento de agua verde',
      description: 'Choque de cloro + algicida + limpieza completa',
      duration_minutes: 120,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Equipos y bombas',
      name: 'Instalación de bomba',
      description: 'Instalación y puesta en marcha de bomba de filtración',
      duration_minutes: 180,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Equipos y bombas',
      name: 'Cambio de cuarzo filtrante',
      description: 'Vaciado del filtro y recarga con cuarzo nuevo',
      duration_minutes: 120,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Arreglos y pintura',
      name: 'Pintura de piscina',
      description: 'Preparación de superficie y aplicación de pintura para piletas',
      duration_minutes: 240,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Arreglos y pintura',
      name: 'Arreglos y reparaciones',
      description: 'Reparación de pérdidas, grietas y daños en la pileta',
      duration_minutes: 180,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Visita técnica',
      name: 'Visita técnica de diagnóstico',
      description: 'Evaluación completa del estado de la piscina y equipos',
      duration_minutes: 60,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Temporada',
      name: 'Apertura de temporada',
      description: 'Puesta en marcha completa para el verano',
      duration_minutes: 240,
      price_ars: 0,
      deposit_percentage: 0,
    },
    {
      id: crypto.randomUUID(),
      category: 'Temporada',
      name: 'Cierre de temporada',
      description: 'Preparación de la pileta para pasar el invierno',
      duration_minutes: 180,
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
    owner_phone: '5492664864731',
    owner_pin: '4861',
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
  }

  let configId: string

  if (existingCfgs && existingCfgs.length > 0) {
    configId = existingCfgs[0].id
    const { error: cfgError } = await db.from('booking_configs').update(bookingConfigData).eq('id', configId)
    if (cfgError) return NextResponse.json({ error: 'Error actualizando booking config', detail: cfgError.message }, { status: 500 })
  } else {
    const { data: newCfg, error: cfgError } = await db.from('booking_configs').insert(bookingConfigData).select('id').single()
    if (cfgError || !newCfg) return NextResponse.json({ error: 'Error creando booking config', detail: cfgError?.message }, { status: 500 })
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
