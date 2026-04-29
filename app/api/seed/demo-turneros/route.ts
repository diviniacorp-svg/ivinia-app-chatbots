import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/seed/demo-turneros — crea 5 demos de Turnero para distintos rubros.
// Usar solo en setup inicial. Idempotente por chatbot_id.

const DEMOS = [
  {
    chatbot_id: 'barberia-el-cuchillo',
    company_name: 'Barbería El Cuchillo',
    contact_name: 'Nico',
    email: 'nico@barberiael cuchillo.com',
    rubro: 'barberia',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664111001',
    pin: '4521',
    schedule: {
      lun: { open: '09:00', close: '19:00' },
      mar: { open: '09:00', close: '19:00' },
      mie: { open: '09:00', close: '19:00' },
      jue: { open: '09:00', close: '19:00' },
      vie: { open: '09:00', close: '19:00' },
      sab: { open: '09:00', close: '17:00' },
      dom: null,
    },
    services: [
      { name: 'Corte de cabello', category: 'Cortes', duration_minutes: 30, price_ars: 8500 },
      { name: 'Corte + barba', category: 'Combos', duration_minutes: 60, price_ars: 14000 },
      { name: 'Arreglo de barba', category: 'Barba', duration_minutes: 30, price_ars: 6000 },
      { name: 'Afeitado clásico', category: 'Barba', duration_minutes: 45, price_ars: 9500 },
      { name: 'Corte de niño (hasta 12)', category: 'Cortes', duration_minutes: 20, price_ars: 6000 },
    ],
  },
  {
    chatbot_id: 'clinica-dental-arce',
    company_name: 'Consultorio Dental Arce',
    contact_name: 'Dra. Arce',
    email: 'consultorio@dentalarce.com',
    rubro: 'odontologia',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664222002',
    pin: '7834',
    schedule: {
      lun: { open: '08:00', close: '20:00' },
      mar: { open: '08:00', close: '20:00' },
      mie: { open: '08:00', close: '20:00' },
      jue: { open: '08:00', close: '20:00' },
      vie: { open: '08:00', close: '17:00' },
      sab: null,
      dom: null,
    },
    services: [
      { name: 'Consulta + revisación', category: 'Consultas', duration_minutes: 30, price_ars: 12000, deposit_percentage: 50 },
      { name: 'Limpieza dental', category: 'Preventiva', duration_minutes: 60, price_ars: 22000, deposit_percentage: 50 },
      { name: 'Extracción simple', category: 'Cirugía', duration_minutes: 45, price_ars: 18000, deposit_percentage: 50 },
      { name: 'Blanqueamiento', category: 'Estética', duration_minutes: 90, price_ars: 45000, deposit_percentage: 50 },
      { name: 'Ortodoncia — consulta', category: 'Ortodoncia', duration_minutes: 60, price_ars: 15000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'gym-iron-power',
    company_name: 'Iron Power Gym',
    contact_name: 'Marce',
    email: 'info@ironpowergym.com',
    rubro: 'gimnasio',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664333003',
    pin: '2019',
    schedule: {
      lun: { open: '06:00', close: '22:00' },
      mar: { open: '06:00', close: '22:00' },
      mie: { open: '06:00', close: '22:00' },
      jue: { open: '06:00', close: '22:00' },
      vie: { open: '06:00', close: '21:00' },
      sab: { open: '08:00', close: '18:00' },
      dom: { open: '09:00', close: '13:00' },
    },
    services: [
      { name: 'Clase de funcional', category: 'Clases grupales', duration_minutes: 60, price_ars: 4500 },
      { name: 'Clase de spinning', category: 'Clases grupales', duration_minutes: 45, price_ars: 4500 },
      { name: 'Entrenamiento personal (1hs)', category: 'Personal Training', duration_minutes: 60, price_ars: 18000 },
      { name: 'Evaluación física inicial', category: 'Evaluación', duration_minutes: 60, price_ars: 8000, deposit_percentage: 0 },
      { name: 'Clase de yoga', category: 'Bienestar', duration_minutes: 60, price_ars: 4000 },
    ],
  },
  {
    chatbot_id: 'spa-zen-san-luis',
    company_name: 'Spa Zen San Luis',
    contact_name: 'Valen',
    email: 'reservas@spazen.com',
    rubro: 'spa',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664444004',
    pin: '5566',
    schedule: {
      lun: null,
      mar: { open: '10:00', close: '20:00' },
      mie: { open: '10:00', close: '20:00' },
      jue: { open: '10:00', close: '20:00' },
      vie: { open: '10:00', close: '20:00' },
      sab: { open: '10:00', close: '19:00' },
      dom: { open: '11:00', close: '17:00' },
    },
    services: [
      { name: 'Masaje relajante (60 min)', category: 'Masajes', duration_minutes: 60, price_ars: 28000, deposit_percentage: 30 },
      { name: 'Masaje descontracturante', category: 'Masajes', duration_minutes: 60, price_ars: 30000, deposit_percentage: 30 },
      { name: 'Ritual facial purificante', category: 'Facial', duration_minutes: 75, price_ars: 35000, deposit_percentage: 30 },
      { name: 'Wrap corporal de chocolate', category: 'Corporal', duration_minutes: 90, price_ars: 45000, deposit_percentage: 30 },
      { name: 'Paquete Zen (masaje + facial)', category: 'Paquetes', duration_minutes: 150, price_ars: 60000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'psicologia-consultorio-luna',
    company_name: 'Consultorio Psicológico Luna',
    contact_name: 'Lic. Luna',
    email: 'consultas@psicologialuna.com',
    rubro: 'psicologia',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664555005',
    pin: '3377',
    schedule: {
      lun: { open: '08:00', close: '20:00' },
      mar: { open: '08:00', close: '20:00' },
      mie: { open: '08:00', close: '20:00' },
      jue: { open: '08:00', close: '20:00' },
      vie: { open: '08:00', close: '18:00' },
      sab: null,
      dom: null,
    },
    services: [
      { name: 'Primera consulta (evaluación)', category: 'Consultas', duration_minutes: 60, price_ars: 15000, deposit_percentage: 0 },
      { name: 'Sesión individual', category: 'Terapia', duration_minutes: 50, price_ars: 12000, deposit_percentage: 0 },
      { name: 'Sesión de pareja', category: 'Terapia', duration_minutes: 60, price_ars: 18000, deposit_percentage: 0 },
      { name: 'Taller de manejo del estrés (grupal)', category: 'Talleres', duration_minutes: 90, price_ars: 8000, deposit_percentage: 0 },
    ],
  },
]

export async function GET() {
  const db = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const resultados: Array<{ nombre: string; urls: Record<string, string>; error?: string }> = []

  for (const demo of DEMOS) {
    try {
      const { data: client, error: clientError } = await db
        .from('clients')
        .upsert({
          chatbot_id: demo.chatbot_id,
          company_name: demo.company_name,
          contact_name: demo.contact_name,
          email: demo.email,
          phone: demo.whatsapp,
          plan: 'mensual',
          status: 'active',
          mrr: 45000,
          custom_config: {
            rubro: demo.rubro,
            ciudad: demo.ciudad,
            whatsapp: demo.whatsapp,
            source: 'demo_seed',
          },
        }, { onConflict: 'chatbot_id' })
        .select('id')
        .single()

      if (clientError || !client) {
        resultados.push({ nombre: demo.company_name, urls: {}, error: clientError?.message })
        continue
      }

      const clientId = client.id
      const services = demo.services.map(s => ({
        id: crypto.randomUUID(),
        category: s.category,
        name: s.name,
        description: '',
        duration_minutes: s.duration_minutes,
        price_ars: s.price_ars,
        deposit_percentage: (s as Record<string, unknown>).deposit_percentage ?? 0,
      }))

      const { data: existingCfgs } = await db
        .from('booking_configs')
        .select('id')
        .eq('client_id', clientId)
        .limit(1)

      let configId: string

      const cfgPayload = {
        client_id: clientId,
        is_active: true,
        slot_duration_minutes: 30,
        advance_booking_days: 60,
        blocked_dates: [],
        owner_phone: demo.whatsapp,
        owner_pin: demo.pin,
        schedule: demo.schedule,
        services,
      }

      if (existingCfgs && existingCfgs.length > 0) {
        configId = existingCfgs[0].id
        await db.from('booking_configs').update(cfgPayload).eq('id', configId)
      } else {
        const { data: newCfg } = await db.from('booking_configs').insert(cfgPayload).select('id').single()
        configId = newCfg!.id
      }

      const turneroUrl = `${appUrl}/reservas/${configId}`
      const panelUrl = `${appUrl}/panel/${configId}`

      // Actualizar custom_config del cliente con las URLs
      await db.from('clients').update({
        custom_config: {
          rubro: demo.rubro,
          ciudad: demo.ciudad,
          whatsapp: demo.whatsapp,
          source: 'demo_seed',
          turnero_url: turneroUrl,
          panel_url: panelUrl,
          panel_pin: demo.pin,
          provisioned_at: new Date().toISOString(),
        },
      }).eq('id', clientId)

      resultados.push({
        nombre: demo.company_name,
        urls: {
          reservas: turneroUrl,
          panel: panelUrl,
          pin: demo.pin,
        },
      })
    } catch (e) {
      resultados.push({ nombre: demo.company_name, urls: {}, error: String(e) })
    }
  }

  return NextResponse.json({
    ok: true,
    total: DEMOS.length,
    exitosos: resultados.filter(r => !r.error).length,
    resultados,
  })
}
