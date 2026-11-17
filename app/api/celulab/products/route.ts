import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {accessoryFinalPrice,isAccessoryProduct,searchable} from '@/lib/celulab/catalog'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({error:'Ingresá a Nucleus'},{status:401})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams
  if(params.get('view')==='catalog'){
    const limit=Math.min(100,Math.max(1,Number(params.get('limit'))||24)),offset=Math.max(0,Number(params.get('offset'))||0)
    if(!Number.isSafeInteger(limit)||!Number.isSafeInteger(offset))return NextResponse.json({}, {status:400})
    const readProducts=async()=>{
      const products=[]
      for(let start=0;;start+=500){
        const {data,error}=await db.from('cl_products').select('id,name,category,brand,price_ars,in_stock,image_url,is_offer').eq('is_latest',true).order('id').range(start,start+499)
        if(error)throw error
        products.push(...data)
        if(data.length<500)return products
      }
    }
    try{
      const [products,rates]=await Promise.all([readProducts(),db.from('cl_product_markups').select('category,markup_pct')])
      if(rates.error)throw rates.error
      const marks=new Map((rates.data||[]).map(r=>[r.category,Number(r.markup_pct)]))
      const accessories=products.filter(p=>isAccessoryProduct(p.category||'',p.name||''))
      const category=params.get('category')||'', stock=params.get('stock')
      const terms=searchable((params.get('q')||'').slice(0,140)).split(' ').filter(Boolean)
      const filtered=accessories.filter(p=>(!category||p.category===category)
        &&(stock==='available'?p.in_stock===true:stock==='unavailable'?p.in_stock!==true:true)
        &&terms.every(term=>searchable([p.name,p.brand,p.category].join(' ')).includes(term)))
        .sort((a,b)=>a.name.localeCompare(b.name,'es')||a.id.localeCompare(b.id))
      return NextResponse.json({items:filtered.slice(offset,offset+limit).map(p=>({...p,final_price:accessoryFinalPrice(p.price_ars,marks.get(p.category)||0)})),
        total:filtered.length,available:accessories.filter(p=>p.in_stock===true).length,catalogueSize:accessories.length,categories:Array.from(new Set(accessories.map(p=>p.category).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'es'))},{headers:{'Cache-Control':'no-store'}})
    }catch{return NextResponse.json({error:'No se pudo cargar el catálogo de accesorios'}, {status:503})}
  }
  let query=db.from('cl_products').select('id,name,category,brand,price_ars,image_url,is_offer,offer_label').eq('is_latest',true)
  if(params.get('offers')==='1') query=query.eq('is_offer',true)
  const q=params.get('q')
  if(q) query=query.ilike('name','%'+q+'%')
  const limit=Math.min(200,Math.max(1,Number(params.get('limit'))||50))
  const [{data,error},rates]=await Promise.all([query.order('name').limit(limit),db.from('cl_product_markups').select('category,markup_pct')])
  if(error||rates.error) return NextResponse.json({error:'Error de lectura'},{status:503})
  const markups=new Map((rates.data||[]).map(r=>[r.category,Number(r.markup_pct)]))
  return NextResponse.json({items:(data||[]).map(row=>({...row,final_price:accessoryFinalPrice(row.price_ars,markups.get(row.category)||0)}))})
}