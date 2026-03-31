import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// GET /api/seed/demo-rufina
// Crea (o actualiza) el cliente demo Rufina Nails con su booking config completa
export async function GET() {
  const db = createAdminClient()

  const chatbotId = 'rufina-nails-demo'

  // 1. Crear o actualizar cliente
  const { data: existing } = await db
    .from('clients')
    .select('id')
    .eq('chatbot_id', chatbotId)
    .maybeSingle()

  let clientId = existing?.id

  const clientData = {
    chatbot_id: chatbotId,
    company_name: 'Rufina Nails',
    contact_name: 'Rufina',
    email: 'rufina@rufinaunas.com',
    status: 'active',
    plan: 'pro',
    custom_config: {
      color: '#d63384',
      system_prompt: `Sos la asistente virtual de Rufina Nails, un nail bar de San Luis, Argentina. Respondés consultas sobre servicios, precios y horarios con amabilidad. Usás español argentino. Si alguien quiere turno, los mandás al link de turnos online.`,
      welcome_message: '¡Hola! Soy la asistente de Rufina Nails 💅 ¿En qué te puedo ayudar?',
      horario: 'Mar a Sáb 9:00 a 19:00',
      direccion: 'San Luis Capital',
      whatsapp: '5492664000000',
      instagram: 'rufinaunas1',
      intro_emoji: '💅',
      intro_tagline: 'Tus uñas, tu estilo',
      intro_style: 'sparkles',
      deposits_enabled: 'true',
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

  // 2. Crear o actualizar booking config — buscar si ya existe para este cliente
  const { data: existingCfg } = await db
    .from('booking_configs')
    .select('id')
    .eq('client_id', clientId)
    .maybeSingle()

  const services = [
    { id: crypto.randomUUID(), category: 'Esmaltado', name: 'Semipermanente manos', description: 'Duración hasta 3 semanas', duration_minutes: 60, price_ars: 16000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Esmaltado', name: 'Esmaltado común manos', description: 'Acabado brillante o mate', duration_minutes: 45, price_ars: 9000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Esmaltado', name: 'Semipermanente pies', description: 'Con limpieza incluida', duration_minutes: 60, price_ars: 13000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Esmaltado', name: 'Esmaltado común pies', description: '', duration_minutes: 45, price_ars: 7500, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Esculpidas', name: 'Uñas en gel', description: 'Manos completas, diseño incluido', duration_minutes: 90, price_ars: 28000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Esculpidas', name: 'Uñas en acrílico', description: 'Manos completas, diseño incluido', duration_minutes: 90, price_ars: 26000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Remoción', name: 'Remoción semipermanente', description: 'Incluye hidratación', duration_minutes: 30, price_ars: 5500, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Remoción', name: 'Remoción esculpidas', description: 'Con cuidado de la uña natural', duration_minutes: 45, price_ars: 8000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Extras', name: 'Diseño nail art', description: 'Diseños personalizados, precio por consultar', duration_minutes: 30, price_ars: 0, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Manicura & Pedicura', name: 'Manicura completa', description: 'Limpieza + cutícula + esmaltado', duration_minutes: 60, price_ars: 13000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Manicura & Pedicura', name: 'Pedicura completa', description: 'Limpieza + cutícula + esmaltado', duration_minutes: 75, price_ars: 17000, deposit_percentage: 0 },
  ]

  const bookingConfigData = {
    client_id: clientId,
    is_active: true,
    slot_duration_minutes: 15,
    advance_booking_days: 60,
    blocked_dates: [],
    owner_phone: '5492664000000',
    schedule: {
      lun: null,
      mar: { open: '09:00', close: '19:00' },
      mie: { open: '09:00', close: '19:00' },
      jue: { open: '09:00', close: '19:00' },
      vie: { open: '09:00', close: '19:00' },
      sab: { open: '09:00', close: '18:00' },
      dom: null,
    },
    services,
    professionals: [
      { id: crypto.randomUUID(), name: 'Rufina', emoji: '💅', color: '#d63384', bio: 'Especialista en uñas esculpidas y nail art', service_ids: [] },
      { id: crypto.randomUUID(), name: 'Valentina', emoji: '✨', color: '#9333ea', bio: 'Experta en semipermanente y manicura', service_ids: [] },
    ],
  }

  let configId: string

  if (existingCfg) {
    // Actualizar la config existente (mantener el UUID)
    configId = existingCfg.id
    const { error: cfgError } = await db
      .from('booking_configs')
      .update(bookingConfigData)
      .eq('id', configId)

    if (cfgError) {
      return NextResponse.json({ error: 'Error actualizando booking config', detail: cfgError.message }, { status: 500 })
    }
  } else {
    // Insertar nueva config (Supabase genera el UUID)
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
    message: 'Demo Rufina Nails creado correctamente',
    urls: {
      reservas: `/reservas/${configId}`,
      reservas_full: `https://divinia.vercel.app/reservas/${configId}`,
      panel: `/panel/${configId}`,
      panel_full: `https://divinia.vercel.app/panel/${configId}`,
      chatbot_widget_id: chatbotId,
    },
    client_id: clientId,
    config_id: configId,
    services_count: services.length,
  })
}
