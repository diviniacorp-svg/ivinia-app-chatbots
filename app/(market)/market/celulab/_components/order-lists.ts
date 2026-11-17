
export const finalOrderStatus=(status:string)=>['entregado_al_cliente','entregado','rechazado'].includes(status)
const tz='America/Argentina/Buenos_Aires'
export const period=(iso:string)=>new Intl.DateTimeFormat('sv-SE',{timeZone:tz,year:'numeric',month:'2-digit'}).format(new Date(iso))
export const monthLabel=(iso:string)=>new Intl.DateTimeFormat('es-AR',{timeZone:tz,month:'long'}).format(new Date(iso))
export function groupOrderMonths<T extends {created_at:string;damage_diagram?:{completedAt?:string}}>(rows:T[]){
 const source=(r:T)=>r.damage_diagram?.completedAt||r.created_at
 const months=new Map<string,{key:string;year:string;month:string;rows:T[]}>()
 for(const row of [...rows].sort((a,b)=>source(b).localeCompare(source(a)))){
  const key=period(source(row)), group=months.get(key)||{key,year:key.split('-')[0],month:monthLabel(source(row)),rows:[]}
  group.rows.push(row);months.set(key,group)
 }
 return Array.from(months.values())
}
export async function fetchOrderPages<T>(partner?:string|null,direct=false):Promise<T[]>{
 const lines:T[]=[]
 for(let offset=0;;offset+=200){
  const q=new URLSearchParams({offset:String(offset)})
  if(partner)q.set('partner_id',partner)
  if(direct)q.set('scope','direct')
  const r=await fetch('/api/celulab/orders?'+q,{cache:'no-store'})
  if(!r.ok)throw Error('No se pudieron cargar las órdenes')
  const data=await r.json()
  if(!Array.isArray(data))throw Error('Respuesta inesperada')
  lines.push(...data)
  if(data.length<200)return lines
 }
}

const dateKey=(iso:string)=>new Intl.DateTimeFormat('sv-SE',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))
export function orderMetricWindow(now=new Date().toISOString()){
 const today=dateKey(now), start=new Date(today+'T12:00:00Z')
 start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7))
 return {today,monday:start.toISOString().slice(0,10),month:today.slice(0,7)}
}
export type MetricOrder={status:string;created_at:string;budget_ars?:number|null}
export function matchesOrderMetric(o:MetricOrder,filter:string,window:ReturnType<typeof orderMetricWindow>){
 switch(filter){
  case 'all': case 'todas': return true
  case 'active': return !finalOrderStatus(o.status)
  case 'delivered': return o.status==='entregado_al_cliente'||o.status==='entregado'
  case 'week': {const date=dateKey(o.created_at);return date>=window.monday&&date<=window.today}
  case 'month': return period(o.created_at)===window.month
  case 'budgetMonth': return period(o.created_at)===window.month&&o.status!=='rechazado'&&Number(o.budget_ars)>0
  default: return o.status===filter
 }
}
export function orderMetrics(orders:MetricOrder[],window=orderMetricWindow()){
 const result={active:0,listo:0,delivered:0,week:0,month:0,budgetMonth:0}
 for(const order of orders){
  for(const filter of ['active','listo','delivered','week','month'] as const){
   if(matchesOrderMetric(order,filter,window))result[filter]++
  }
  if(matchesOrderMetric(order,'budgetMonth',window))result.budgetMonth+=Number(order.budget_ars)
 }
 return result
}
