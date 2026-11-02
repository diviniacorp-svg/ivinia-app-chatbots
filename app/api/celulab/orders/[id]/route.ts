import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { economicPatch } from '@/lib/celulab/economic-patch'
import {
  sendWhatsAppMessage,
  normalizeArgPhone,
  buildCelulabOrdenLista,
  buildCelulabOrdenDiagnosticada,
} from '@/lib/twilio'

export const dynamic = 'force-dynamic'

const NOTIFY_STATUSES = new Set(['listo', 'diagnosticado'])

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_orders')
    .select('*, cl_partners(name, phone, address)')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: Record<string, unknown>
  try {
    const input: unknown = await req.json()
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Objeto requerido')
    body = input as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
  const db = createAdminClient()

  const { data: previous, error: readError } = await db.from('cl_orders')
    .select('status, total_ars, part_cost_ars, commission_pct, commission_ars, updated_at')
    .eq('id', params.id).maybeSingle()
  if (readError) return NextResponse.json({ error: 'No se pudo leer la orden' }, { status: 500 })
  if (!previous) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

  const updates: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }

  // Commission amounts are derived by the server, not accepted from the client.
  delete updates.commission_ars
  try {
    Object.assign(updates, economicPatch(previous, body))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Importes inválidos' }, { status: 400 })
  }

  // Read previous status before update (only if status is changing to a notifiable state)
  const prevStatus: string | null = previous.status

  let updateQuery = db
    .from('cl_orders')
    .update(updates)
    .eq('id', params.id)
  updateQuery = previous.updated_at === null
    ? updateQuery.is('updated_at', null)
    : updateQuery.eq('updated_at', previous.updated_at)
  const { data, error } = await updateQuery
    .select('*, cl_partners(name, phone, address)')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'La orden cambió mientras la editabas. Actualizá e intentá nuevamente.' }, { status: 409 })

  // Disparar WA si el status cambió a un estado notificable
  if (
    data &&
    typeof body.status === 'string' &&
    NOTIFY_STATUSES.has(body.status) &&
    prevStatus !== body.status
  ) {
    const phone = normalizeArgPhone(data.client_phone ?? '')
    if (phone) {
      const partner = data.cl_partners as { name: string } | null
      const msgParams = {
        clientName: data.client_name,
        device: `${data.device_brand} ${data.device_model}`,
        orderNumber: data.order_number,
        partnerName: (Array.isArray(partner) ? partner[0]?.name : partner?.name) ?? 'CeluLab',
      }
      const message =
        body.status === 'listo'
          ? buildCelulabOrdenLista(msgParams)
          : buildCelulabOrdenDiagnosticada(msgParams)
      // fire-and-forget
      sendWhatsAppMessage(phone, message).catch(() => {})
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = createAdminClient()
  const { error } = await db.from('cl_orders').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
