import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/cliente/portal?token=xxx
// El token es el client_id de Supabase — simple y sin JWT por ahora.
// El cliente recibe este link al activarse su cuenta.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token requerido' }, { status: 400 })

  const db = createAdminClient()

  const { data: client } = await db
    .from('clients')
    .select('id, company_name, email, phone, plan, status, mrr, custom_config, created_at')
    .eq('id', token)
    .single()

  if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

  const cfg = (client.custom_config as Record<string, unknown>) ?? {}
  const turneroUrl = cfg.turnero_url as string | undefined
  const panelUrl = cfg.panel_url as string | undefined
  const panelPin = cfg.panel_pin as string | undefined

  // Bookings del mes actual
  const mesInicio = new Date()
  mesInicio.setDate(1)
  mesInicio.setHours(0, 0, 0, 0)

  const { data: bookings } = await db
    .from('bookings')
    .select('id, date, time, service_name, status, customer_name')
    .eq('client_id', token)
    .gte('date', mesInicio.toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(20)

  // Suscripción activa
  const { data: sub } = await db
    .from('subscriptions')
    .select('plan, estado, monto_ars, mp_preapproval_id, created_at')
    .eq('client_id', token)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const qrUrl = turneroUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(turneroUrl)}`
    : null

  return NextResponse.json({
    cliente: {
      id: client.id,
      nombre: client.company_name,
      email: client.email,
      plan: client.plan,
      estado: client.status,
      mrr: client.mrr,
      creado: client.created_at,
    },
    turnero: turneroUrl
      ? {
          url: turneroUrl,
          panel_url: panelUrl,
          panel_pin: panelPin,
          qr_url: qrUrl,
        }
      : null,
    suscripcion: sub
      ? {
          plan: sub.plan,
          estado: sub.estado,
          monto_ars: sub.monto_ars,
          desde: sub.created_at,
        }
      : null,
    turnos_este_mes: bookings ?? [],
    soporte_wa: `https://wa.me/5492665286110?text=${encodeURIComponent(`Hola Joaco, soy cliente de ${client.company_name} y necesito ayuda`)}`,
  })
}
