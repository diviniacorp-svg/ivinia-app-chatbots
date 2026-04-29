import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateChatbotId } from '@/lib/utils'
import { sendTrialNotification } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { planId, negocio, servicios } = await request.json()

    if (!negocio?.nombre || !negocio?.email || !negocio?.whatsapp) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const db = createAdminClient()
    const chatbot_id = generateChatbotId()
    const trial_end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    // 1. Crear lead en CRM
    const { data: lead } = await db
      .from('leads')
      .insert({
        company_name: negocio.nombre,
        contact_name: negocio.nombre,
        email: negocio.email,
        phone: negocio.whatsapp,
        city: negocio.ciudad || 'San Luis',
        rubro: negocio.rubro || 'otro',
        score: 80,
        status: 'negociacion',
        source: 'self_service_onboarding',
        notes: `Trial iniciado por autoservicio. Plan: ${planId}. Servicios: ${(servicios || []).map((s: { nombre: string }) => s.nombre).join(', ')}`,
      })
      .select('id')
      .single()

    // 2. Crear cliente en trial
    // Asignar agente responsable según rubro
    const RUBRO_AGENT: Record<string, string> = {
      peluqueria: 'servicios_turnero', estetica: 'servicios_turnero', spa: 'servicios_turnero',
      odontologia: 'servicios_turnero', clinica: 'servicios_turnero', psicologia: 'servicios_turnero',
      veterinaria: 'servicios_turnero', gimnasio: 'servicios_turnero',
      restaurante: 'contenido_marketing', hotel: 'contenido_marketing',
      abogado: 'ventas_crm', contabilidad: 'ventas_crm',
    }
    const agente_responsable = RUBRO_AGENT[negocio.rubro || ''] || 'ventas_crm'

    const { data: client, error: clientError } = await db
      .from('clients')
      .insert({
        lead_id: lead?.id || null,
        company_name: negocio.nombre,
        contact_name: negocio.nombre,
        email: negocio.email,
        phone: negocio.whatsapp,
        chatbot_id,
        embed_code: '',
        plan: 'trial',
        status: 'trial',
        trial_end,
        custom_config: {
          rubro: negocio.rubro || '',
          ciudad: negocio.ciudad || '',
          whatsapp: negocio.whatsapp,
          source: 'self_service_trial',
          plan_elegido: planId,
          agente_responsable,
          ...(negocio.mp_access_token ? { mp_access_token: negocio.mp_access_token } : {}),
        },
      })
      .select('id')
      .single()

    if (clientError || !client) {
      console.error('Error creando cliente trial:', clientError)
      return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
    }

    // 3. Crear booking_config con servicios y horario
    const mappedServices = (servicios || []).map((s: {
      id: string; nombre: string; duracion: number; precio: number
    }) => ({
      id: s.id,
      name: s.nombre,
      duration_minutes: s.duracion,
      price_ars: s.precio,
      description: '',
    }))

    const { data: config, error: configError } = await db
      .from('booking_configs')
      .insert({
        client_id: client.id,
        is_active: true,
        services: mappedServices,
        schedule: negocio.schedule || {
          lun: { open: '09:00', close: '18:00' },
          mar: { open: '09:00', close: '18:00' },
          mie: { open: '09:00', close: '18:00' },
          jue: { open: '09:00', close: '18:00' },
          vie: { open: '09:00', close: '18:00' },
          sab: { open: '09:00', close: '14:00' },
          dom: null,
        },
        owner_phone: negocio.whatsapp,
        owner_pin: Math.floor(1000 + Math.random() * 9000).toString(),
        slot_duration_minutes: 30,
        advance_booking_days: 30,
      })
      .select('id, owner_pin')
      .single()

    if (configError || !config) {
      console.error('Error creando booking_config:', configError)
      return NextResponse.json({ error: 'Error al configurar el turnero' }, { status: 500 })
    }

    // 4. Notificar a Joaco (sin bloquear)
    Promise.resolve().then(() =>
      sendTrialNotification({
        company_name: negocio.nombre,
        contact_name: negocio.nombre,
        email: negocio.email,
        phone: negocio.whatsapp,
        rubro: negocio.rubro || '',
        city: negocio.ciudad || '',
        chatbot_id,
      }).catch(err => console.error('Notification error:', err))
    )

    return NextResponse.json({
      ok: true,
      client_id: client.id,
      config_id: config.id,
      owner_pin: config.owner_pin,
      panel_url: `/panel/${config.id}`,
    })
  } catch (error) {
    console.error('Trial onboarding error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}
