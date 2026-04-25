import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import {
  createSubscriptionPlan,
  createSubscription,
  cancelSubscription,
  getSubscription,
} from '@/lib/mercadopago'
import { TURNERO_PLANS } from '@/lib/turnero-plans'

export const dynamic = 'force-dynamic'

const SUBSCRIPTION_PLANS: Record<string, { reason: string; amount: number }> = {
  'turnero-mensual':  { reason: 'Turnero DIVINIA — Plan Mensual',  amount: 45000 },
  'turnero-anual':    { reason: 'Turnero DIVINIA — Plan Anual',    amount: 35000 },
  'central-basico':   { reason: 'Central IA DIVINIA — Básico',     amount: 90000 },
  'central-pro':      { reason: 'Central IA DIVINIA — Pro',        amount: 150000 },
  'content-starter':  { reason: 'Content Factory DIVINIA — Starter', amount: 80000 },
  'content-growth':   { reason: 'Content Factory DIVINIA — Crecimiento', amount: 120000 },
  'todo-divinia':     { reason: 'Todo DIVINIA — Bundle completo',  amount: 120000 },
}

// POST /api/mercadopago/subscriptions — crear suscripción para un cliente
export async function POST(req: NextRequest) {
  try {
    const { plan, client_id, client_email, client_name, back_url } = await req.json()

    if (!plan || !client_email) {
      return NextResponse.json({ error: 'plan y client_email son requeridos' }, { status: 400 })
    }

    const planConfig = SUBSCRIPTION_PLANS[plan]
    if (!planConfig) {
      return NextResponse.json({ error: `Plan desconocido: ${plan}` }, { status: 400 })
    }

    // 1. Crear plan en MP (o reutilizar si ya existe)
    const db = createAdminClient()
    const { data: existing } = await db
      .from('subscriptions')
      .select('mp_plan_id')
      .eq('plan', plan)
      .not('mp_plan_id', 'is', null)
      .limit(1)
      .single()

    let mp_plan_id = existing?.mp_plan_id

    if (!mp_plan_id) {
      const mpPlan = await createSubscriptionPlan({
        reason: planConfig.reason,
        amount: planConfig.amount,
        frequency: 1,
        frequency_type: 'months',
        external_reference: `divinia-plan-${plan}`,
      })
      mp_plan_id = mpPlan.id
    }

    // 2. Crear suscripción para el cliente
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
    const external_reference = client_id || `lead-${Date.now()}`

    const mpSub = await createSubscription({
      plan_id: mp_plan_id!,
      client_email,
      client_name,
      external_reference,
      back_url: back_url || `${appUrl}/checkout/success`,
    })

    // 3. Guardar en tabla subscriptions
    const { data: saved, error } = await db
      .from('subscriptions')
      .insert({
        client_id: client_id || null,
        plan,
        producto: planConfig.reason,
        monto_ars: planConfig.amount,
        frecuencia: 'monthly',
        estado: 'pending',
        mp_preapproval_id: mpSub.id,
        mp_plan_id,
        mp_init_point: mpSub.init_point,
        client_email,
        client_name: client_name || null,
        external_reference,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      ok: true,
      subscription_id: saved.id,
      mp_preapproval_id: mpSub.id,
      init_point: mpSub.init_point,
      monto: planConfig.amount,
      plan: planConfig.reason,
    })
  } catch (err) {
    console.error('[subscriptions POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al crear suscripción' },
      { status: 500 }
    )
  }
}

// GET /api/mercadopago/subscriptions?client_id=xxx — listar suscripciones
export async function GET(req: NextRequest) {
  const client_id = req.nextUrl.searchParams.get('client_id')
  const db = createAdminClient()

  const query = db
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (client_id) query.eq('client_id', client_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ subscriptions: data })
}

// PATCH /api/mercadopago/subscriptions — cancelar o pausar
export async function PATCH(req: NextRequest) {
  try {
    const { subscription_id, accion } = await req.json()
    if (!subscription_id || !accion) {
      return NextResponse.json({ error: 'subscription_id y accion requeridos' }, { status: 400 })
    }

    const db = createAdminClient()
    const { data: sub } = await db
      .from('subscriptions')
      .select('mp_preapproval_id')
      .eq('id', subscription_id)
      .single()

    if (!sub?.mp_preapproval_id) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    if (accion === 'cancelar') {
      await cancelSubscription(sub.mp_preapproval_id)
      await db
        .from('subscriptions')
        .update({ estado: 'cancelled', fecha_cancelacion: new Date().toISOString().split('T')[0] })
        .eq('id', subscription_id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscriptions PATCH]', err)
    return NextResponse.json({ error: 'Error al actualizar suscripción' }, { status: 500 })
  }
}
