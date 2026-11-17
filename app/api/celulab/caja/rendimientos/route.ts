import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { hasNucleusSession } from '@/lib/celulab/nucleus-session'

type Entry = { id:string; order_number:string; device:string; deposit_ars:number; budget_ars:number; commission_pct:number|null; commission_ars:number|null; status:string; created_at:string }
type PartnerReport = { partner_id:string; partner_name:string; orders_count:number; deposits_total:number; budget_total:number; commission_owed:number; missing:number; reconciled:boolean; orders:Entry[] }
export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req))return NextResponse.json({}, {status:403})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams, from=params.get('desde'), to=params.get('hasta')
  const min=from?Date.parse(from):-Infinity, max=to?Date.parse(to):Infinity
  if(Number.isNaN(min)||Number.isNaN(max)||min>max)return NextResponse.json({}, {status:400})
  const groups=new Map<string,PartnerReport>()
  for(let offset=0;;offset+=500){
    const {data,error}=await db.from('cl_orders').select('id,order_number,device_brand,device_model,partner_id,cl_partners(name),deposit_ars,budget_ars,commission_pct,commission_ars,status,created_at,damage_diagram')
      .not('partner_id','is',null).in('status',['entregado_al_cliente','entregado']).order('created_at',{ascending:false}).order('id').range(offset,offset+499)
    if(error)return NextResponse.json({error:'No se pudieron leer las comisiones'},{status:503})
    for(const row of data||[]){
      if(!row.partner_id)continue
      const date=Date.parse(row.damage_diagram?.completedAt||row.created_at)
      if(!Number.isFinite(date)||date<min||date>max)continue
      const partner=Array.isArray(row.cl_partners)?row.cl_partners[0]:row.cl_partners
      const p:PartnerReport=groups.get(row.partner_id)??{partner_id:row.partner_id,partner_name:partner?.name||'Local sin nombre',orders_count:0,deposits_total:0,budget_total:0,commission_owed:0,missing:0,reconciled:false,orders:[]}
      const commission=row.commission_ars==null?null:Number(row.commission_ars)
      p.orders_count++
      p.deposits_total+=Number(row.deposit_ars)||0
      p.budget_total+=Number(row.budget_ars)||0
      if(commission==null)p.missing++
      else p.commission_owed+=commission
      p.orders.push({id:row.id,order_number:row.order_number,device:[row.device_brand,row.device_model].join(' '),deposit_ars:Number(row.deposit_ars)||0,budget_ars:Number(row.budget_ars)||0,commission_pct:row.commission_pct,commission_ars:commission,status:row.status,created_at:row.created_at})
      groups.set(row.partner_id,p)
    }
    if(!data||data.length<500)break
  }
  return NextResponse.json(Array.from(groups.values()),{headers:{'Cache-Control':'no-store'}})
}
