import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

import {canReadEarnings} from '@/lib/celulab/owner-session'
import {orderActor,sameOrigin,validPartnerId} from '@/lib/celulab/partner-session'
import {partnerOrder} from '@/lib/celulab/public-order'
import {readPaymentAccounts} from '@/lib/celulab/payment-accounts'

import {sendWhatsAppMessage} from '@/lib/twilio'
import {orderSourcing,parseOrderDraft} from '@/lib/celulab/order-sourcing'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status'), partner_id=searchParams.get('partner_id')
  const actor=await orderActor(req,partner_id)
  if(!actor.allowed)return NextResponse.json({}, {status:401})
  const offset=Number(searchParams.get('offset')||0)
  if(!Number.isSafeInteger(offset)||offset<0||offset>1000000)return NextResponse.json({}, {status:400})
  const db = createAdminClient()

  let q = db
    .from('cl_orders')
    .select('*, cl_partners(name)')
    .order('created_at', { ascending: false }).order('id')
    .range(offset,offset+199)

  if (status) q = q.eq('status', status)
  if (partner_id) q = q.eq('partner_id', partner_id)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if(actor.admin&&!partner_id)return NextResponse.json(data)
  const earnings=await canReadEarnings(req,partner_id||undefined)
  return NextResponse.json(data.map(order=>partnerOrder(order,earnings)))
}

export async function POST(req: NextRequest) {
  if(!sameOrigin(req))return NextResponse.json({}, {status:403})
  const body = await req.json().catch(()=>null)
  if(!body)return NextResponse.json({}, {status:400})
  const actor=await orderActor(req,body.partner_id)
  if(!actor.allowed)return NextResponse.json({}, {status:403})
  if(body.partner_id!=null&&!validPartnerId(body.partner_id))return NextResponse.json({}, {status:400})
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
  } = body

  if (![client_name,device_brand,device_model].every(s=>typeof s==='string'&&s.trim()&&s.length<=150)) {
    return NextResponse.json({ error: 'cliente, marca y modelo son obligatorios' }, { status: 400 })
  }

  const db = createAdminClient()

  const {data:local,error:partnerError}=partner_id?await db.from('cl_partners').select('name,commission_pct').eq('id',partner_id).eq('is_active',true).maybeSingle():{data:null,error:null}
  if(partner_id&&(!local||partnerError))return NextResponse.json({}, {status:403})
  const deposit=Number(deposit_ars??0),method=body.deposit_method
  if(!Number.isSafeInteger(deposit)||deposit<0||deposit>2147483647||(deposit>0&&!['efectivo','transferencia','mercadopago'].includes(method)))return NextResponse.json({error:'Revisá monto y método de seña.'}, {status:400})
  let paymentAlias=''
  if(deposit>0&&method==='transferencia'){
    try{paymentAlias=(await readPaymentAccounts()).find(a=>a.id===body.deposit_account)?.alias||''}catch{return NextResponse.json({error:'No se pudieron verificar los alias de pago.'},{status:503})}
    if(!paymentAlias)return NextResponse.json({error:'Elegí una cuenta de transferencia configurada.'},{status:400})
  }
  const draft=parseOrderDraft(body.quote_draft_lines)
  const accessUnknown=body.unknown_access===true&&unlock_type==='none'
  const diagram=damage_diagram&&typeof damage_diagram==='object'&&!Array.isArray(damage_diagram)?damage_diagram:{}
  if(typeof turns_on!=='boolean'||!['pin','patron','none'].includes(unlock_type)||((unlock_type==='pin'||unlock_type==='patron')&&(typeof unlock_code!=='string'||!unlock_code.trim()||unlock_code.length>40)))return NextResponse.json({error:'Confirmá el encendido y el acceso del equipo.'},{status:400})
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
      damage_diagram: {markers:Array.isArray(diagram.markers)?diagram.markers.slice(0,50):[],possibleRepair:['battery','charge','board','water'].includes(diagram.possibleRepair)?diagram.possibleRepair:null,accessUnknown,depositMethod:deposit>0?method:null,depositAlias:paymentAlias||null},
      quote_draft_lines: draft,
      reported_fault: typeof body.reported_fault === 'string' ? body.reported_fault.slice(0,5000) : '',
      requested_work: requested_work ?? '',
      deposit_ars: deposit,
      notes: notes ?? '',
      commission_pct: local?.commission_pct ?? (partner_id?33:0),
      status: 'ingresado',
      revision_required: turns_on === false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-registro de seña en caja si deposit > 0
  if (deposit > 0 && data) {
    await db.from('cl_caja_movimientos').insert({
      tipo: 'ingreso',
      concepto: `Seña ${data.order_number} — ${device_brand} ${device_model}`,
      categoria: null,
      metodo_pago: method==='mercadopago'?'mercadopago':method,
      monto_ars: deposit,
      equipo_modelo: `${device_brand} ${device_model}`,
      orden_id: data.id,
      partner_id: partner_id ?? null,
      notas: 'Ingreso automático al crear orden'+(paymentAlias?' · Alias '+paymentAlias:''),
      fecha: new Date().toISOString(),
    }).select().single()
    // fire-and-forget: no bloqueamos si falla
  }

  // Notifications are only sent to the owner configured on the server, never to a client-supplied number.
  const ownerPhone=process.env.CELULAB_OWNER_WHATSAPP
  if(ownerPhone&&local){
    try{
      if(local){
        const sourcing=await orderSourcing(db,draft).catch(()=>[])
        const info=sourcing.map(r=>r.caption+(r.supplier?' · '+r.supplier+' · costo ARS '+r.cost.toLocaleString('es-AR'):' · proveedor por confirmar'))
        await sendWhatsAppMessage(ownerPhone,[
          'CeluLab · Nuevo ingreso '+data.order_number,
          'Local: '+local.name,
          'Equipo: '+device_brand+' '+device_model,
          'Trabajo: '+(requested_work||body.reported_fault||'A confirmar'),
          ...info
        ].join('\n'))
      }
    }catch{console.warn('[CeluLab] No se pudo procesar el aviso de nuevo ingreso.')}
  }

  return NextResponse.json(actor.admin?data:partnerOrder(data), { status: 201 })
}