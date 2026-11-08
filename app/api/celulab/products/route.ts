import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({error:'Ingresá a Nucleus'},{status:401})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams
  let query=db.from('cl_products').select('id,name,category,brand,price_ars,image_url,is_offer,offer_label').eq('is_latest',true)
  if(params.get('offers')==='1') query=query.eq('is_offer',true)
  const q=params.get('q')
  if(q) query=query.ilike('name','%'+q+'%')
  const limit=Math.min(200,Math.max(1,Number(params.get('limit'))||50))
  const [{data,error},rates]=await Promise.all([query.order('name').limit(limit),db.from('cl_product_markups').select('category,markup_pct')])
  if(error||rates.error) return NextResponse.json({error:'Error de lectura'},{status:503})
  const markups=new Map((rates.data||[]).map(r=>[r.category,Number(r.markup_pct)]))
  return NextResponse.json({items:(data||[]).map(row=>({...row,final_price:Math.round(row.price_ars*(1+(markups.get(row.category)||0)/100))}))})
}