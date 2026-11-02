import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const db = createAdminClient()

  let q = db
    .from('cl_orders')
    .select('*, cl_partners(name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (status) q = q.eq('status', status)
  const partner_id = searchParams.get('partner_id')
  if (partner_id) q = q.eq('partner_id', partner_id)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    partner_id,
    client_name, client_dni, client_phone,
    device_brand, device_model,
    has_battery, has_chip, has_cover, has_memory,
    turns_on, water_damage,
    unlock_type, unlock_code,
    damage_diagram,
    requested_work,
    deposit_ars,
    notes,
    commission_pct,
  } = body

  if (!client_name || !device_brand || !device_model) {
    return NextResponse.json({ error: 'cliente, marca y modelo son obligatorios' }, { status: 400 })
  }

  const db = createAdminClient()

  // Sequential order number — count existing + 1
  const { count } = await db.from('cl_orders').select('id', { count: 'exact', head: true })
  const n = String((count ?? 0) + 1).padStart(6, '0')
  const order_number = `CL-${n}`

  const { data, error } = await db
    .from('cl_orders')
    .insert({
      order_number,
      partner_id: partner_id ?? null,
      client_name,
      client_dni: client_dni ?? '',
      client_phone: client_phone ?? '',
      device_brand,
      device_model,
      has_battery: has_battery ?? false,
      has_chip: has_chip ?? false,
      has_cover: has_cover ?? false,
      has_memory: has_memory ?? false,
      turns_on: turns_on ?? true,
      water_damage: water_damage ?? false,
      unlock_type: unlock_type ?? 'none',
      unlock_code: unlock_code ?? '',
      damage_diagram: damage_diagram ?? {},
      requested_work: requested_work ?? '',
      deposit_ars: deposit_ars ?? 0,
      notes: notes ?? '',
      commission_pct: commission_pct ?? 33,
      status: 'ingresado',
      revision_required: turns_on === false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-registro de seña en caja si deposit > 0
  if ((deposit_ars ?? 0) > 0 && data) {
    await db.from('cl_caja_movimientos').insert({
      tipo: 'ingreso',
      concepto: `Seña ${data.order_number} — ${device_brand} ${device_model}`,
      categoria: null,
      metodo_pago: 'efectivo',
      monto_ars: Number(deposit_ars),
      equipo_modelo: `${device_brand} ${device_model}`,
      orden_id: data.id,
      partner_id: partner_id ?? null,
      notas: `Ingreso automático al crear orden`,
      fecha: new Date().toISOString(),
    }).select().single()
    // fire-and-forget: no bloqueamos si falla
  }

  return NextResponse.json(data, { status: 201 })
}