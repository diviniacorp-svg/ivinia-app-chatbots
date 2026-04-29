import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { DEPARTMENTS, NUCLEUS_AGENTS, DepartmentId } from '@/lib/nucleus/index'

export const dynamic = 'force-dynamic'

// Radial positions: 12 depts in a circle, CEO at center
const DEPT_IDS = Object.keys(DEPARTMENTS) as DepartmentId[]
const RADIUS = 0.38

const DEPT_POSITIONS: Record<string, { x: number; y: number }> = {}
DEPT_IDS.forEach((id, i) => {
  const angle = (i / DEPT_IDS.length) * 2 * Math.PI - Math.PI / 2
  DEPT_POSITIONS[id] = {
    x: 0.5 + RADIUS * Math.cos(angle),
    y: 0.5 + RADIUS * Math.sin(angle),
  }
})

// Derive dept-level edges from agent outputA connections
const edgeSet = new Set<string>()
for (const agent of NUCLEUS_AGENTS) {
  for (const targetId of (agent.outputA ?? [])) {
    const target = NUCLEUS_AGENTS.find(a => a.id === targetId)
    if (target && target.depto !== agent.depto) {
      edgeSet.add(`${agent.depto}|${target.depto}`)
    }
  }
}
const BASE_EDGES = Array.from(edgeSet).map(key => {
  const [from, to] = key.split('|')
  return { from, to }
})

export async function GET() {
  try {
    const db = createAdminClient()
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
    const todayStart = new Date().toISOString().split('T')[0] + 'T00:00:00'

    const [{ data: runs }, { data: logs }] = await Promise.all([
      db.from('agent_runs').select('agent, department, status, created_at').gte('created_at', oneHourAgo),
      db.from('agent_logs').select('agent').gte('created_at', todayStart).limit(100),
    ])

    const activeAgents = new Set((runs ?? []).filter(r => r.status === 'running').map(r => (r.agent ?? '').toLowerCase()))
    const recentAgents = new Set((runs ?? []).map(r => (r.agent ?? '').toLowerCase()))
    const todayAgents = new Set((logs ?? []).map(l => (l.agent ?? '').toLowerCase()))

    const deptMatches = (deptId: string, agentNames: Set<string>): boolean => {
      const dept = DEPARTMENTS[deptId as DepartmentId]
      if (!dept) return false
      const deptAgents = NUCLEUS_AGENTS.filter(a => a.depto === deptId)
      return deptAgents.some(a =>
        agentNames.has(a.id.toLowerCase()) ||
        agentNames.has(a.nombre.toLowerCase()) ||
        Array.from(agentNames).some(n => n.includes(a.id.split('-')[0]))
      )
    }

    const nodes = DEPT_IDS.map(id => {
      const dept = DEPARTMENTS[id]
      const pos = DEPT_POSITIONS[id]
      const runCount = (runs ?? []).filter(r => {
        const deptAgents = NUCLEUS_AGENTS.filter(a => a.depto === id)
        return deptAgents.some(a => (r.agent ?? '').toLowerCase().includes(a.id.split('-')[0]))
      }).length

      return {
        id,
        label: `${dept.emoji} ${dept.nombre}`,
        color: dept.color,
        x: pos.x,
        y: pos.y,
        active: deptMatches(id, activeAgents),
        hasActivity: deptMatches(id, todayAgents) || deptMatches(id, recentAgents),
        runCount,
      }
    })

    const edges = BASE_EDGES.map(e => {
      const fromNode = nodes.find(n => n.id === e.from)
      const toNode = nodes.find(n => n.id === e.to)
      return {
        from: e.from,
        to: e.to,
        strength: (fromNode?.active || toNode?.active) ? 1 : 0.35,
      }
    })

    return NextResponse.json({
      nodes,
      edges,
      ceo: { id: 'ceo', label: 'CEO', color: '#C6FF3D', x: 0.5, y: 0.5 },
    })
  } catch (err) {
    console.error('[graph]', err)
    const fallback = DEPT_IDS.map(id => {
      const dept = DEPARTMENTS[id]
      const pos = DEPT_POSITIONS[id]
      return { id, label: `${dept.emoji} ${dept.nombre}`, color: dept.color, x: pos.x, y: pos.y, active: false, hasActivity: false, runCount: 0 }
    })
    return NextResponse.json({
      nodes: fallback,
      edges: BASE_EDGES.map(e => ({ ...e, strength: 0.2 })),
      ceo: { id: 'ceo', label: 'CEO', color: '#C6FF3D', x: 0.5, y: 0.5 },
    })
  }
}
