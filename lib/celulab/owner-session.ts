import {NextRequest} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {sessionHash,hasNucleusSession} from './nucleus-session'

export async function canReadEarnings(req:NextRequest, partnerId?:string) {
  if(await hasNucleusSession(req)) return true
  const token=req.cookies.get('cl_owner_session')?.value
  if(!partnerId || !token || !/^[a-f0-9]{64}$/.test(token)) return false
  const {data}=await createAdminClient().from('cl_owner_sessions').select('partner_id,cl_partners!inner(is_active)').eq('token_hash',sessionHash(token)).eq('partner_id',partnerId).eq('cl_partners.is_active',true).gt('expires_at',new Date().toISOString()).maybeSingle()
  return Boolean(data)
}
export function hideCommission<T extends Record<string,unknown>>(order:T) {
  const {commission_ars,commission_pct,...rest}=order
  return rest
}