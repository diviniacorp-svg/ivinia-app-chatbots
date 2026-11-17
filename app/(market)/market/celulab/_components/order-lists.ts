
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
export async function fetchOrderPages<T>(partner?:string|null):Promise<T[]>{
 const lines:T[]=[]
 for(let offset=0;;offset+=200){
  const q=new URLSearchParams({offset:String(offset)})
  if(partner)q.set('partner_id',partner)
  const r=await fetch('/api/celulab/orders?'+q,{cache:'no-store'})
  if(!r.ok)throw Error('No se pudieron cargar las órdenes')
  const data=await r.json()
  if(!Array.isArray(data))throw Error('Respuesta inesperada')
  lines.push(...data)
  if(data.length<200)return lines
 }
}
