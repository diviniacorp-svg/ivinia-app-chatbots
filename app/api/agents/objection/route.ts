import { NextRequest, NextResponse } from 'next/server'
import { handleObjection } from '@/agents/turnero/objection-handler'
import type { RubroTurnero } from '@/agents/turnero/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_name, rubro, city, objection } = body

    if (!company_name || !rubro || !objection) {
      return NextResponse.json({ error: 'company_name, rubro y objection son requeridos' }, { status: 400 })
    }

    const result = await handleObjection(objection, {
      company_name,
      rubro: rubro as RubroTurnero,
      city,
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[objection]', err)
    return NextResponse.json({ error: 'Error procesando objeción' }, { status: 500 })
  }
}
