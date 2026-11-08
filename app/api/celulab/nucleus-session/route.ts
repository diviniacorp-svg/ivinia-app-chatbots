import {randomBytes} from 'node:crypto'
import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession,sessionHash} from '@/lib/celulab/nucleus-session'

export async function GET(req:NextRequest) {
  return NextResponse.json({}, {status:await hasNucleusSession(req)?200:401})
}
export async function POST(req:NextRequest) {
  if(req.headers.get('origin')!==req.nextUrl.origin) return NextResponse.json({}, {status:403})
  const pin=(await req.json().catch(()=>null))?.pin
  if(typeof pin!=='string'||!pin||pin.length>8) return NextResponse.json({}, {status:400})
  const token=randomBytes(32).toString('hex')
  const {data,error}=await createAdminClient().rpc('cl_nucleus_login',{p_pin:pin,p_hash:sessionHash(token)})
  if(!data||error) return NextResponse.json({}, {status:error?503:401})
  const res=NextResponse.json({ok:true})
  res.cookies.set('cl_nucleus_session',token,{httpOnly:true,secure:true,sameSite:'strict',path:'/api/celulab',maxAge:28800})
  return res
}