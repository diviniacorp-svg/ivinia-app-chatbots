import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createAdminClient()
  const chatbotId = 'celulab-demo'

  const clientData = {
    chatbot_id: chatbotId,
    company_name: 'CeluLab',
    contact_name: 'Joaquin',
    email: 'diviniacorp@gmail.com',
    status: 'active',
    plan: 'pro',
    custom_config: {
      color: '#2563eb',
      system_prompt: `Sos el asistente virtual de CeluLab, un servicio técnico especializado en reparación de celulares en San Luis, Argentina. Respondés consultas sobre reparaciones, precios y tiempos de entrega con amabilidad y precisión. Usás español argentino. Si alguien quiere traer su equipo, los ayudás a sacar un turno online.`,
      welcome_message: '¡Hola! Soy el asistente de CeluLab 📱 ¿En qué te puedo ayudar con tu celular?',
      horario: 'Lun a Vie 9:00 a 18:00, Sáb 9:00 a 13:00',
      direccion: 'San Luis Capital',
      whatsapp: '5492665286110',
      intro_emoji: '📱,🔧,⚡',
      intro_tagline: 'Tu celular, siempre en las mejores manos',
      intro_style: 'tech',
      deposits_enabled: 'true',
    },
  }

  const { data: client, error: clientError } = await db
    .from('clients')
    .upsert(clientData, { onConflict: 'chatbot_id' })
    .select('id')
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Error creando cliente', detail: clientError?.message }, { status: 500 })
  }

  const clientId = client.id

  const services = [
    { id: crypto.randomUUID(), category: 'Pantallas', name: 'Cambio de pantalla iPhone (11 a 13)', description: 'Original o calidad OEM, con garantía 90 días', duration_minutes: 60, price_ars: 75000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Pantallas', name: 'Cambio de pantalla iPhone (14 a 16)', description: 'Original o calidad OEM, con garantía 90 días', duration_minutes: 60, price_ars: 110000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Pantallas', name: 'Cambio de pantalla Samsung A-series', description: 'Pantalla original, cubre A14 a A55', duration_minutes: 60, price_ars: 55000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Pantallas', name: 'Cambio de pantalla Samsung S-series', description: 'Pantalla original, cubre S21 a S24', duration_minutes: 75, price_ars: 95000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Pantallas', name: 'Cambio de pantalla (otros Android)', description: 'Xiaomi, Motorola, LG y más — consultar modelo', duration_minutes: 60, price_ars: 45000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Batería', name: 'Cambio de batería iPhone', description: 'Batería nueva con ciclos completos, garantía 6 meses', duration_minutes: 45, price_ars: 32000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Batería', name: 'Cambio de batería Android', description: 'Compatible con Samsung, Motorola, Xiaomi', duration_minutes: 45, price_ars: 25000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Conectores', name: 'Reparación puerto de carga iPhone', description: 'Lightning o USB-C según modelo', duration_minutes: 60, price_ars: 28000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Conectores', name: 'Reparación puerto de carga Android', description: 'USB-C, micro-USB según modelo', duration_minutes: 60, price_ars: 22000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Cámara', name: 'Reparación de cámara trasera', description: 'Cambio de módulo o vidrio protector', duration_minutes: 60, price_ars: 35000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Cámara', name: 'Reparación de cámara delantera', description: 'Selfie cam o Face ID/sensor de profundidad', duration_minutes: 60, price_ars: 28000, deposit_percentage: 30 },
    { id: crypto.randomUUID(), category: 'Datos & Software', name: 'Recuperación de datos', description: 'Backup y recuperación de fotos, contactos y archivos', duration_minutes: 90, price_ars: 20000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Datos & Software', name: 'Liberación de equipo', description: 'Unlock de operadora, sin borrar datos', duration_minutes: 30, price_ars: 15000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Mantenimiento', name: 'Limpieza interna y diagnóstico', description: 'Limpieza de placa, conectores y altavoces + informe', duration_minutes: 45, price_ars: 12000, deposit_percentage: 0 },
    { id: crypto.randomUUID(), category: 'Mantenimiento', name: 'Cambio de vidrio trasero', description: 'Cristal posterior iPhone o Samsung', duration_minutes: 60, price_ars: 30000, deposit_percentage: 30 },
  ]

  const bookingConfigData = {
    client_id: clientId,
    is_active: true,
    slot_duration_minutes: 15,
    advance_booking_days: 30,
    blocked_dates: [],
    owner_phone: '5492665286110',
    owner_pin: '2050',
    schedule: {
      lun: { open: '09:00', close: '18:00' },
      mar: { open: '09:00', close: '18:00' },
      mie: { open: '09:00', close: '18:00' },
      jue: { open: '09:00', close: '18:00' },
      vie: { open: '09:00', close: '18:00' },
      sab: { open: '09:00', close: '13:00' },
      dom: null,
    },
    services,
  }

  const { data: existingCfgs } = await db
    .from('booking_configs')
    .select('id')
    .eq('client_id', clientId)
    .limit(1)

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
    message: 'Demo CeluLab creado correctamente',
    urls: {
      reservas: `/reservas/${configId}`,
      reservas_full: `https://divinia.vercel.app/reservas/${configId}`,
      panel: `/panel/${configId}`,
      panel_full: `https://divinia.vercel.app/panel/${configId}`,
    },
    client_id: clientId,
    config_id: configId,
  })
}
