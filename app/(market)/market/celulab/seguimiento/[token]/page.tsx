import {notFound} from 'next/navigation'
import {createAdminClient} from '@/lib/supabase'
export const dynamic='force-dynamic'
export const metadata={robots:{index:false,follow:false},referrer:'no-referrer' as const}
export default async function Tracking({params}:{params:{token:string}}){
  if(!/^[a-f0-9-]{36}$/i.test(params.token)) notFound()
  const db=createAdminClient()
  const {data:link}=await db.from('cl_order_tracking').select('order_id').eq('token',params.token).maybeSingle()
  if(!link) notFound()
  const [order,jobs,evidence]=await Promise.all([
    db.from('cl_orders').select('order_number,device_brand,device_model,status,requested_work,budget_ars,deposit_ars').eq('id',link.order_id).single(),
    db.from('cl_order_extra_jobs').select('id,title,labor,part,status,created_at').eq('order_id',link.order_id).order('created_at'),
    db.from('cl_customer_evidence').select('id,object_key,media_type,caption,created_at').eq('order_id',link.order_id).order('created_at'),
  ])
  if(!order.data||order.error||jobs.error||evidence.error) throw new Error('Seguimiento no disponible')
  const media=await Promise.all((evidence.data||[]).map(async item=>({...item,url:(await db.storage.from('celulab-evidence').createSignedUrl(item.object_key,600)).data?.signedUrl})))
  const o=order.data
  const money=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n)
  return <main style={{maxWidth:660,margin:'auto',padding:20}}><img src="/celulab-logo.png" alt="CeluLab" width={86}/><h1>Orden {o.order_number}</h1>
    <p>{o.device_brand} {o.device_model} · {String(o.status).replaceAll('_',' ')}</p><p>{o.requested_work}</p>
    <p>Presupuesto original {money(o.budget_ars)} · Seña {money(o.deposit_ars)}</p>
    {jobs.data?.map(j=><section key={j.id}><h3>{j.title}</h3><p>{money(j.labor+j.part)} · {j.status}</p></section>)}
    {media.length>0 && <h2>Evidencias de la reparación</h2>}
    {media.map(m=><figure key={m.id}>{m.url && (m.media_type.startsWith('video/')?<video controls src={m.url} style={{maxWidth:'100%'}}/>:<img src={m.url} alt={m.caption||'Evidencia de reparación'} style={{maxWidth:'100%'}}/>)}<figcaption>{m.caption}</figcaption></figure>)}
  </main>
}