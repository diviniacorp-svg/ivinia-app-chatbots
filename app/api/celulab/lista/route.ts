import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import {chargeLabor,chargeSupplier,isChargeJob,matchesChargePart,matchesDevice} from '@/app/(market)/market/celulab/_components/charge-quote'
import {finalRepairPrice} from '@/app/(market)/market/celulab/_components/repair-guidance'
import {partCaption,partColor,partQuality,repairForCategory} from '@/app/(market)/market/celulab/_components/quote-labels'

export const dynamic = 'force-dynamic'

type Item={id:string;name:string;brand:string;category:string;quality:string;stock:boolean;markup_ars:number;labor_ars:number;final_price:number|null}
type Offer={part_id:string;cost_ars:number;supplier_in_stock:boolean|null;cl_providers:{name:string;is_active:boolean}|{name:string;is_active:boolean}[]|null}
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'no-store'}})
export async function GET(req: NextRequest) {
  const params=req.nextUrl.searchParams, limit=Number(params.get('limit')||50), offset=Number(params.get('offset')||0)
  const job=params.get('quoteJob')||'', device=params.get('device')||'', search=(params.get('q')||'').trim()
  if(!Number.isSafeInteger(limit)||!Number.isSafeInteger(offset)||offset<0||offset>2147483647||device.length>200||job.length>200||search.length>200)return reply({error:'Consulta inválida.'},400)
  const pageSize=Math.max(1,Math.min(limit,100)), tab=params.get('tab')||'modulos', db=createAdminClient()
  const {data,error}=await db.rpc('cl_price_list_v1',{p_tab:tab,p_brand:params.get('brand')||'',p_search:search,p_limit:pageSize,p_offset:offset})
  if(error)return reply({error:'No se pudo cargar la lista de repuestos.'},503)
  const charge=isChargeJob(job), rate=Number(params.get('labor')||0)
  const laborOverride=charge&&chargeLabor(device).includes(rate)?rate:null
  const matches=(data?.items||[] as Item[]).filter((item:Item)=>{
    if(!job)return true
    if(charge)return matchesChargePart(device,item.name,item.category)
    if(!matchesDevice(device,item.name))return false
    const kind=(item.name+' '+item.category).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    if(/vidrio.*cámara/i.test(job))return /glass|vidrio|lente/i.test(kind)&&/camara|lente/i.test(kind)
    if(/micrófono/i.test(job))return /microfono/i.test(kind)
    if(/parlante/i.test(job))return /parlante|buzzer|auricular/i.test(kind)
    if(/botones/i.test(job))return /boton|encendido|volumen/i.test(kind)
    if(/huella/i.test(job))return /huella/i.test(kind)
    if(/flex/i.test(job))return /flex/i.test(kind)
    return true
  }) as Item[]
  const offers=new Map<string,Offer[]>()
  if(matches.length){
    const {data:prices,error:priceError}=await db.from('cl_provider_prices').select('part_id,cost_ars,supplier_in_stock,cl_providers(name,is_active)').in('part_id',matches.map(item=>item.id)).eq('is_latest',true)
    if(priceError)return reply({error:'No se pudo comprobar el stock.'},503)
    for(const row of (prices||[]) as Offer[]){
      const supplier=Array.isArray(row.cl_providers)?row.cl_providers[0]:row.cl_providers
      if(!supplier?.is_active||!(row.cost_ars>0)||(charge&&!chargeSupplier(supplier.name)))continue
      const group=offers.get(row.part_id)||[]
      group.push(row)
      offers.set(row.part_id,group)
    }
  }
  const items=matches.map(item=>{
    const rows=offers.get(item.id)||[], available=rows.filter(row=>row.supplier_in_stock===true)
    const stock=available.length>0, status=stock?'available':rows.some(row=>row.supplier_in_stock==null)?'unknown':'unavailable'
    const labor=charge?laborOverride:Number(item.labor_ars??0)
    const cost=stock?Math.min(...available.map(row=>row.cost_ars)):null
    const final_price=cost!==null&&labor!==null?finalRepairPrice(job||(tab==='modulos'?'Cambio de módulo':repairForCategory(item.category)),cost+Number(item.markup_ars??0)+labor):null
    const quality=partQuality(item.quality||'',item.name)
    const color=partColor(job||(/tapa/i.test(item.category)?'tapa':''),item.name)
    return {id:item.id,name:job?partCaption(job,device,quality,color):item.name,brand:item.brand,category:item.category,quality,color,stock,status,final_price,labor_ars:labor}
  })
  return reply({items,total:data?.total||0,offset,limit:pageSize,brands:data?.brands||[]})
}
