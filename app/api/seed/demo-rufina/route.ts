import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

function uuidv4(): string {
  return crypto.randomUUID()
}

// GET /api/seed/demo-rufina
// Crea (o actualiza) el cliente demo Rufina Nails con su booking config completa
export async function GET() {
  const db = createAdminClient()

  const chatbotId = 'rufina-nails-demo'
  const configId = 'rufina-nails-config'

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
  const services = [
    { id: uuidv4(), name: 'Esmaltado semipermanente manos', description: 'Duración hasta 3 semanas', duration_minutes: 60, price_ars: 16000, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Esmaltado común manos', description: 'Acabado brillante o mate', duration_minutes: 45, price_ars: 9000, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Esmaltado semipermanente pies', description: 'Con limpieza incluida', duration_minutes: 60, price_ars: 13000, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Esmaltado común pies', description: '', duration_minutes: 45, price_ars: 7500, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Uñas esculpidas en gel', description: 'Manos completas, diseño incluido', duration_minutes: 90, price_ars: 28000, deposit_percentage: 30 },
    { id: uuidv4(), name: 'Uñas esculpidas en acrílico', description: 'Manos completas, diseño incluido', duration_minutes: 90, price_ars: 26000, deposit_percentage: 30 },
    { id: uuidv4(), name: 'Remoción semipermanente', description: 'Incluye hidratación', duration_minutes: 30, price_ars: 5500, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Remoción esculpidas', description: 'Con cuidado de la uña natural', duration_minutes: 45, price_ars: 8000, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Diseño nail art (manos)', description: 'Diseños personalizados, precio por consultar', duration_minutes: 30, price_ars: 0, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Manicura completa', description: 'Limpieza + cutícula + esmaltado', duration_minutes: 60, price_ars: 13000, deposit_percentage: 0 },
    { id: uuidv4(), name: 'Pedicura completa', description: 'Limpieza + cutícula + esmaltado', duration_minutes: 75, price_ars: 17000, deposit_percentage: 0 },
  ]

  const bookingConfig = {
    id: configId,
    client_id: clientId,
    is_active: true,
    slot_duration_minutes: 15,
    advance_booking_days: 30,
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
  }

  const { error: cfgError } = await db
    .from('booking_configs')
    .upsert(bookingConfig, { onConflict: 'id' })

  if (cfgError) {
    return NextResponse.json({ error: 'Error creando booking config', detail: cfgError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Demo Rufina Nails creado correctamente',
    urls: {
      booking: `/turnos/${configId}`,
      booking_full: `https://divinia.vercel.app/turnos/${configId}`,
      chatbot_widget_id: chatbotId,
    },
    client_id: clientId,
    services_count: services.length,
  })
}
