import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({error:'Ingresá a Nucleus'},{status:401})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams
  let query=db.from('cl_caja_movimientos').select('*').order('fecha',{ascending:false})
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