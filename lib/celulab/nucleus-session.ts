import {createHash} from 'node:crypto'
import type {NextRequest} from 'next/server'
import {createAdminClient} from '@/lib/supabase'

export const sessionHash = (value:string) => createHash('sha256').update(value).digest('hex')
export async function hasNucleusSession(req:NextRequest) {
  const value = req.cookies.get('cl_nucleus_session')?.value
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return false
  const {data} = await createAdminClient().from('cl_nucleus_sessions').select('expires_at').eq('token_hash',sessionHash(value)).gt('expires_at',new Date().toISOString()).maybeSingle()
  return !!data
}