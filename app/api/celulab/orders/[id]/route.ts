import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
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
  const body = await req.json()
  const db = createAdminClient()

  const updates: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }

  // Auto-compute commission when economic fields are present
  if (updates.total_ars != null && updates.part_cost_ars != null) {
    const labor = Number(updates.total_ars) - Number(updates.part_cost_ars)
    const pct = Number(updates.commission_pct ?? 33)
    updates.commission_ars = Math.round(labor * pct / 100)
  }

  // Read previous status before update (only if status is changing to a notifiable state)
  let prevStatus: string | null = null
  if (typeof body.status === 'string' && NOTIFY_STATUSES.has(body.status)) {
    const { data: prev } = await db.from('cl_orders').select('status').eq('id', params.id).single()
    prevStatus = prev?.status ?? null
  }

  const { data, error } = await db
    .from('cl_orders')
    .update(updates)
    .eq('id', params.id)
    .select('*, cl_partners(name, phone, address)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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