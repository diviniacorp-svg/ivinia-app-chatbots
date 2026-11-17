import type {createAdminClient} from '@/lib/supabase'
import {chargeSupplier,isChargeJob} from '@/app/(market)/market/celulab/_components/charge-quote'
import {finalRepairPrice} from '@/app/(market)/market/celulab/_components/repair-guidance'
import {publicOption} from '@/app/(market)/market/celulab/_components/quote-labels'

type Draft={device:string;job:string;part:number;labor:number;option?:string;partId?:string}
type Offer={part_id:string;cost_ars:number;cl_providers:{name:string;is_active:boolean}|{name:string;is_active:boolean}[]|null}

export function parseOrderDraft(value:unknown):Draft[]{
 if(!Array.isArray(value))return []
 return value.slice(0,100).filter(l=>l&&typeof l.device==='string'&&typeof l.job==='string'&&Number.isSafeInteger(l.part)&&l.part>=0&&Number.isSafeInteger(l.labor)&&l.labor>=0).map(l=>({
   device:l.device.slice(0,200),job:l.job.slice(0,200),part:finalRepairPrice(l.job,l.part+l.labor)-l.labor,labor:l.labor,
   option:typeof l.option==='string'&&publicOption(l.option)?l.option.slice(0,500):undefined,
   partId:typeof l.partId==='string'&&/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(l.partId)?l.partId:undefined
 }))
}
export async function orderSourcing(db:ReturnType<typeof createAdminClient>,draft:Draft[]){
 const ids=Array.from(new Set(draft.flatMap(l=>l.partId?[l.partId]:[])))
 if(!ids.length)return []
 const {data,error}=await db.from('cl_provider_prices').select('part_id,cost_ars,cl_providers(name,is_active)').in('part_id',ids).eq('is_latest',true).eq('supplier_in_stock',true).gt('cost_ars',0).order('cost_ars')
 if(error)throw error
 return draft.filter(l=>l.partId).map(l=>{
  const row=(data as Offer[]||[]).find(p=>{
   if(p.part_id!==l.partId)return false
   const provider=Array.isArray(p.cl_providers)?p.cl_providers[0]:p.cl_providers
   return provider?.is_active&&(!isChargeJob(l.job)||chargeSupplier(provider.name))
  })
  const provider=Array.isArray(row?.cl_providers)?row?.cl_providers[0]:row?.cl_providers
  return {caption:publicOption(l.option)||l.job,supplier:provider?.name||null,cost:row?.cost_ars??0,quotedTotal:l.part+l.labor,estimatedMargin:row?l.part+l.labor-row.cost_ars:null}
 })
}
