import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEPARTMENTS = [
  { id: 'ia-auto', label: '01 IA & Auto', color: '#C6FF3D', x: 0.5, y: 0.1 },
  { id: 'web-apps', label: '02 Web Apps', color: '#38BDF8', x: 0.8, y: 0.22 },
  { id: 'youtube', label: '03 YouTube', color: '#FF5E3A', x: 0.92, y: 0.5 },
  { id: 'content', label: '04 Content', color: '#E879F9', x: 0.8, y: 0.78 },
  { id: 'clientes', label: '05 Clientes', color: '#34D399', x: 0.5, y: 0.9 },
  { id: 'avatares', label: '06 Avatares', color: '#FCD34D', x: 0.2, y: 0.78 },
  { id: 'legal', label: '07 Legal', color: '#818CF8', x: 0.08, y: 0.5 },
  { id: 'seguridad', label: '08 Seguridad', color: '#F87171', x: 0.2, y: 0.22 },
  { id: 'finanzas', label: '09 Finanzas', color: '#FB923C', x: 0.35, y: 0.15 },
  { id: 'rrhh', label: '10 RRHH', color: '#A78BFA', x: 0.65, y: 0.15 },
  { id: 'innovacion', label: '11 Innovación', color: '#67E8F9', x: 0.5, y: 0.5 },
]

export async function GET() {
  try {
    const db = createAdminClient()
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

    const { data: runs } = await db
      .from('agent_runs')
      .select('agent_name, status, started_at')
      .gte('started_at', oneHourAgo)

    const { data: logs } = await db
      .from('agent_logs')
      .select('agent, action, date')
      .eq('date', new Date().toISOString().split('T')[0])
      .limit(50)

    const activeAgents = runs?.map(r => r.agent_name) ?? []
    const todayAgents = logs?.map(l => l.agent) ?? []

    const nodes = DEPARTMENTS.map(d => ({
      ...d,
      active: activeAgents.some(a => a.toLowerCase().includes(d.id.split('-')[0])),
      hasActivity: todayAgents.some(a => a.toLowerCase().includes(d.id.split('-')[0])),
      runCount: runs?.filter(r => r.agent_name.toLowerCase().includes(d.id.split('-')[0])).length ?? 0,
    }))

    const edges: { from: string; to: string; strength: number }[] = []
    const pairs = [
      ['clientes', 'ia-auto'], ['clientes', 'content'], ['clientes', 'finanzas'],
      ['ia-auto', 'web-apps'], ['content', 'youtube'], ['content', 'avatares'],
      ['innovacion', 'ia-auto'], ['innovacion', 'content'],
      ['finanzas', 'clientes'], ['rrhh', 'ia-auto'],
    ]
    pairs.forEach(([from, to]) => {
      const fromNode = nodes.find(n => n.id === from)
      const toNode = nodes.find(n => n.id === to)
      if (fromNode && toNode) {
        edges.push({ from, to, strength: (fromNode.active || toNode.active) ? 1 : 0.3 })
      }
    })

    return NextResponse.json({ nodes, edges, ceo: { id: 'ceo', label: 'CEO', color: '#C6FF3D', x: 0.5, y: 0.5 } })
  } catch {
    return NextResponse.json({ nodes: DEPARTMENTS.map(d => ({ ...d, active: false, hasActivity: false, runCount: 0 })), edges: [], ceo: { id: 'ceo', label: 'CEO', color: '#C6FF3D', x: 0.5, y: 0.5 } })
  }
}
