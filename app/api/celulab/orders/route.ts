import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

import {canReadEarnings} from '@/lib/celulab/owner-session'
import {orderActor,sameOrigin,validPartnerId} from '@/lib/celulab/partner-session'
import {partnerOrder} from '@/lib/celulab/public-order'
import {readPaymentAccounts} from '@/lib/celulab/payment-accounts'

import {sendWhatsAppMessage} from '@/lib/twilio'
import {isChargeJob,chargeLabor} from '@/app/(market)/market/celulab/_components/charge-quote'
import {finalRepairPrice} from '@/app/(market)/market/celulab/_components/repair-guidance'
import {orderSourcing,parseOrderDraft} from '@/lib/celulab/order-sourcing'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status'), partner_id=searchParams.get('partner_id')
  const actor=await orderActor(req,partner_id)
  if(!actor.allowed)return NextResponse.json({}, {status:401})
  const direct=searchParams.get('scope')==='direct'
  if(direct&&(!actor.admin||partner_id))return NextResponse.json({}, {status:403})
  if(searchParams.get('summary')==='budget'){
    if(!partner_id||!validPartnerId(partner_id)||!await canReadEarnings(req,partner_id))return NextResponse.json({}, {status:403,headers:{'Cache-Control':'no-store'}})
    const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit'}).format(new Date())
    const from=new Date(date+'-01T00:00:00-03:00')
    const to=new Date(from);to.setUTCMonth(to.getUTCMonth()+1)
    const db=createAdminClient()
    let total=0
    for(let start=0;;start+=500){
      const {data,error}=await db.from('cl_orders').select('budget_ars').eq('partner_id',partner_id).neq('status','rechazado').gt('budget_ars',0)
        .gte('created_at',from.toISOString()).lt('created_at',to.toISOString()).order('id').range(start,start+499)
      if(error)return NextResponse.json({}, {status:503,headers:{'Cache-Control':'no-store'}})
      for(const row of data||[])total+=Number(row.budget_ars)||0
      if(!data||data.length<500)break
    }
    return NextResponse.json({total},{headers:{'Cache-Control':'no-store'}})
  }
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
  if(direct)q=q.is('partner_id',null)

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
  let sourceQuote: {id:string;revision:number}|null=null
  if(body.source_quote){
    const {id,revision}=body.source_quote
    if(!validPartnerId(id)||!Number.isSafeInteger(revision)||revision<1)return NextResponse.json({error:'Presupuesto inválido'},{status:400})
    const {data,error}=await db.from('cl_quote_versions').select('quote_id,revision,partner_id,order_id').eq('quote_id',id).eq('revision',revision).maybeSingle()
    if(error||!data||data.order_id||(!actor.admin&&data.partner_id!==(partner_id??null)))return NextResponse.json({error:'No se pudo verificar el presupuesto de origen'},{status:409})
    sourceQuote={id,revision}
  }
  const deposit=Number(deposit_ars??0),method=body.deposit_method
  if(!Number.isSafeInteger(deposit)||deposit<0||deposit>2147483647||(deposit>0&&!['efectivo','transferencia','mercadopago'].includes(method)))return NextResponse.json({error:'Revisá monto y método de seña.'}, {status:400})
  let paymentAlias=''
  if(deposit>0&&method==='transferencia'){
    try{paymentAlias=(await readPaymentAccounts()).find(a=>a.id===body.deposit_account)?.alias||''}catch{return NextResponse.json({error:'No se pudieron verificar los alias de pago.'},{status:503})}
    if(!paymentAlias)return NextResponse.json({error:'Elegí una cuenta de transferencia configurada.'},{status:400})
  }
  const draft=parseOrderDraft(body.quote_draft_lines)
  if(sourceQuote){
    const selected=draft.filter(line=>line.partId)
    if(selected.length){
      try{
        const ids=Array.from(new Set(selected.map(line=>line.partId!)))
        const [sources,parts,configs]=await Promise.all([
          orderSourcing(db,selected),
          db.from('cl_parts').select('id,category,tab_key').in('id',ids),
          db.from('cl_repair_configs').select('tab_key,category,markup_ars,labor_ars')
        ])
        if(parts.error||configs.error)throw Error()
        const unchanged=selected.every((line,index)=>{
          const part=parts.data.find(p=>p.id===line.partId), source=sources[index]
          if(!part||!source?.supplier||!(source.cost>0))return false
          const config=configs.data.find(c=>c.category===part.category&&c.tab_key===part.tab_key)
          const isCharge=isChargeJob(line.job)
          const labor=isCharge?line.labor:Number(config?.labor_ars??0)
          if(isCharge&&!chargeLabor(line.device).includes(labor))return false
          return line.labor===labor&&line.part+line.labor===finalRepairPrice(line.job,source.cost+Number(config?.markup_ars??0)+labor)
        })
        if(!unchanged)return NextResponse.json({error:'Cambió la disponibilidad o el precio de un repuesto. Volvé a seleccionarlo antes de registrar la orden.'},{status:409})
      }catch{return NextResponse.json({error:'No se pudo volver a comprobar el catálogo. Reintentá antes de guardar.'},{status:503})}
    }
  }
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
      damage_diagram: {markers:Array.isArray(diagram.markers)?diagram.markers.slice(0,50):[],possibleRepair:['battery','charge','board','water'].includes(diagram.possibleRepair)?diagram.possibleRepair:null,accessUnknown,depositMethod:deposit>0?method:null,depositAlias:paymentAlias||null,...(sourceQuote?{sourceQuote}:{})},
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

  let cajaWarning=''
  // Auto-registro de seña en caja si deposit > 0
  if (deposit > 0 && data) {
    const {error:cashError}=await db.from('cl_caja_movimientos').insert({
      tipo: 'ingreso',
      concepto: `Seña ${data.order_number} — ${device_brand} ${device_model}`,
      categoria: null,
      metodo_pago: method==='efectivo'?'efectivo':'digital',
      monto_ars: deposit,
      equipo_modelo: `${device_brand} ${device_model}`,
      orden_id: data.id,
      partner_id: partner_id ?? null,
      notas: 'Seña · '+method+(paymentAlias?' · Alias '+paymentAlias:''),
      fecha: new Date().toISOString(),
    }).select().single()
    if(cashError)cajaWarning='La orden quedó guardada, pero no se registró la seña en Caja. Revisá el movimiento antes de volver a cargarlo.'
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

  return NextResponse.json({...actor.admin?data:partnerOrder(data),caja_warning:cajaWarning||undefined}, { status: 201 })
}