import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

function equal(a: string, b: string) {
  const first = Buffer.from(a), second = Buffer.from(b)
  return first.length === second.length && timingSafeEqual(first, second)
}
export function canSyncCatalogue(req: NextRequest) {
  const cron = process.env.CRON_SECRET
  if (cron && equal(req.headers.get('authorization') || '', `Bearer ${cron}`)) return true
  const secret = process.env.ADMIN_SECRET
  if (!secret || req.method !== 'POST') return false
  const origin = req.headers.get('origin')
  if (!origin || origin !== new URL(req.url).origin) return false
  const expected = createHmac('sha256', secret).update('divinia_session_v1').digest('hex')
  return equal(req.cookies.get('divinia_session')?.value || '', expected)
}
