import { NextRequest, NextResponse } from 'next/server'
import { ProspectorAgent } from '@/lib/agents/prospector'
import { SalesAgent } from '@/lib/agents/sales'
import { MonitorAgent } from '@/lib/agents/monitor'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { agent, params } = await request.json()

  switch (agent) {
    case 'prospector':
      new ProspectorAgent().run(params).catch(console.error)
      break
    case 'sales':
      new SalesAgent().run(params).catch(console.error)
      break
    case 'monitor':
      new MonitorAgent().run().catch(console.error)
      break
    default:
      return NextResponse.json({ error: 'Agente desconocido' }, { status: 400 })
  }

  return NextResponse.json({ message: `Agente ${agent} iniciado en background` })
}
