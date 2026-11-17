import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

const validId=(value:unknown): value is string => typeof value==='string'&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)

export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({error:'Ingresá a Nucleus'},{status:401})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams
  let query=db.from('cl_caja_movimientos').select('*').order('fecha',{ascending:false})
  const scope=params.get('scope')
  if(scope==='tienda')query=query.eq('categoria','accesorios')
  if(scope==='taller'){
    query=query.or('categoria.is.null,categoria.neq.accesorios')
    const origin=params.get('origin')
    if(origin==='direct')query=query.is('partner_id',null)
    else if(origin){
      if(!validId(origin))return NextResponse.json({error:'Local inválido'},{status:400})
      query=query.eq('partner_id',origin)
    }
  }
  for(const [param,col] of [['tipo','tipo'],['metodo','metodo_pago'],['categoria','categoria']]) {
    const value=params.get(param)
    if(value) query=query.eq(col,value)
  }
  if(params.get('desde')) query=query.gte('fecha',params.get('desde'))
  if(params.get('hasta')) query=query.lte('fecha',params.get('hasta'))
  const movimientos=[]
  for(let start=0;;start+=1000){
    const {data,error}=await query.order('id').range(start,start+999)
    if(error) return NextResponse.json({error:'No se pudo leer la caja'},{status:503})
    movimientos.push(...(data||[]))
    if(!data||data.length<1000) break
  }
  const resumen={totalIngresos:0,totalEgresos:0,neto:0,efectivo:0,digital:0,byCategoria:{} as Record<string,number>,byModelo:{} as Record<string,number>}
  for(const row of movimientos){
    const amount=Number(row.monto_ars)
    const signed=row.tipo==='ingreso'?amount:-amount
    resumen[row.tipo==='ingreso'?'totalIngresos':'totalEgresos']+=amount
    resumen.neto+=signed
    resumen[row.metodo_pago==='efectivo'?'efectivo':'digital']+=signed
    if(row.tipo==='ingreso'){
      const categoria=row.categoria||'otro'
      resumen.byCategoria[categoria]=(resumen.byCategoria[categoria]||0)+amount
      if(row.equipo_modelo) resumen.byModelo[row.equipo_modelo]=(resumen.byModelo[row.equipo_modelo]||0)+amount
    }
  }
  return NextResponse.json({movimientos,resumen})
}
export async function POST(req:NextRequest) {
  if(req.headers.get('origin')!==req.nextUrl.origin||!await hasNucleusSession(req))return NextResponse.json({error:'Ingresá a Nucleus'},{status:403})
  const b=await req.json().catch(()=>null)
  const date=typeof b?.fecha==='string'?new Date(b.fecha):new Date(NaN)
  if(!b||!['ingreso','egreso'].includes(b.tipo)||!['efectivo','digital'].includes(b.metodo_pago)||!Number.isSafeInteger(b.monto_ars)||b.monto_ars<=0||b.monto_ars>2147483647||typeof b.concepto!=='string'||!b.concepto.trim()||!Number.isFinite(date.getTime())||(b.partner_id!=null&&!validId(b.partner_id)))return NextResponse.json({error:'Revisá los datos del movimiento'},{status:400})
  if(b.categoria==='rendicion')return NextResponse.json({error:'Las rendiciones se registran por separado'},{status:400})
  const short=(value:unknown,limit:number)=>typeof value==='string'?value.trim().slice(0,limit)||null:null
  const db=createAdminClient()
  if(b.partner_id){
    const result=await db.from('cl_partners').select('id').eq('id',b.partner_id).maybeSingle()
    if(result.error||!result.data)return NextResponse.json({error:'No se encontró el local'},{status:400})
  }
  const categoria=b.scope==='tienda'?'accesorios':short(b.categoria,70)
  if(b.scope!=='tienda'&&categoria==='accesorios')return NextResponse.json({error:'Cargá los accesorios desde la caja de tienda'},{status:400})
  const {error}=await db.from('cl_caja_movimientos').insert({
    tipo:b.tipo,concepto:b.concepto.trim().slice(0,200),categoria,metodo_pago:b.metodo_pago,monto_ars:b.monto_ars,
    equipo_modelo:short(b.equipo_modelo,160),notas:short(b.notas,1500),fecha:date.toISOString(),
    partner_id:b.scope==='tienda'?null:b.partner_id??null,
  })
  return error?NextResponse.json({error:'No se pudo guardar el movimiento'},{status:503}):NextResponse.json({ok:true},{status:201})
}

export async function DELETE(req:NextRequest) {
  if(req.headers.get('origin')!==req.nextUrl.origin||!await hasNucleusSession(req))return NextResponse.json({error:'Ingresá a Nucleus'},{status:403})
  const id=req.nextUrl.searchParams.get('id')
  if(!validId(id))return NextResponse.json({error:'Movimiento inválido'},{status:400})
  const {data,error}=await createAdminClient().from('cl_caja_movimientos').delete().eq('id',id).is('orden_id',null).or('categoria.is.null,categoria.not.in.(rendicion,accesorios)').select('id').maybeSingle()
  return error||!data?NextResponse.json({error:'El movimiento está vinculado o no se pudo eliminar'},{status:409}):NextResponse.json({ok:true})
}
