import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { DEPARTMENTS, NUCLEUS_AGENTS, DepartmentId } from '@/lib/nucleus/index'
import Link from 'next/link'
import AgentCard from './_components/AgentCard'

export const dynamic = 'force-dynamic'

const MODEL_COLORS: Record<string, string> = {
  haiku: '#06B6D4',
  sonnet: '#8B5CF6',
  opus: '#F59E0B',
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default async function DeptPage({ params }: { params: { dept: string } }) {
  const deptId = params.dept as DepartmentId
  const dept = DEPARTMENTS[deptId]
  if (!dept) notFound()

  const agents = NUCLEUS_AGENTS.filter(a => a.depto === deptId)
  const db = createAdminClient()
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const todayStart = new Date().toISOString().split('T')[0] + 'T00:00:00'

  const agentNames = agents.flatMap(a => [a.id, a.nombre])
  const keyword = agents[0]?.id.split('-')[0] ?? deptId

  const [{ data: runs }, { data: recentRuns }, { data: logs }] = await Promise.all([
    db.from('agent_runs').select('id, agent, status, created_at, duration_ms')
      .or(agentNames.map(n => `agent.ilike.%${n.split('-')[0]}%`).join(','))
      .order('created_at', { ascending: false }).limit(10),
    db.from('agent_runs').select('id, agent, status')
      .ilike('agent', `%${keyword}%`)
      .gte('created_at', oneHourAgo),
    db.from('agent_logs').select('id, agent, action, created_at')
      .ilike('agent', `%${keyword}%`)
      .gte('created_at', todayStart)
      .order('created_at', { ascending: false }).limit(15),
  ])

  const recentCount = recentRuns?.length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', color: '#09090B' }}>

      {/* Header */}
      <div style={{ background: '#09090B', padding: '24px 32px' }}>
        <Link href="/agents" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'block', marginBottom: 20 }}>
          ← Volver a Agentes
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24,
            background: `radial-gradient(circle at 35% 35%, ${dept.color}44, ${dept.color}11)`,
            border: `1.5px solid ${dept.color}40`,
          }}>
            {dept.emoji}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
              Departamento DIVINIA
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>
              {dept.nombre}
            </h1>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
              {dept.mision}
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 28, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { label: 'Agentes', val: agents.length },
            { label: 'Runs esta hora', val: recentCount, highlight: recentCount > 0 },
            { label: 'Modelo base', val: dept.modelo_base.toUpperCase() },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 20, color: s.highlight ? '#C6FF3D' : '#fff', letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, maxWidth: 1200, margin: '0 auto' }}>

        {/* Left: Agents */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 14 }}>
            {agents.length} agentes en este departamento
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} deptColor={dept.color} modelColor={MODEL_COLORS[agent.modelo] ?? '#71717A'} />
            ))}
          </div>

          {/* Activity log */}
          {(logs && logs.length > 0) && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 12 }}>
                Actividad hoy
              </div>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #E4E4E7', alignItems: 'flex-start' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: dept.color, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#71717A' }}>{log.agent}</div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#09090B', lineHeight: 1.4 }}>{log.action}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#A1A1AA', flexShrink: 0 }}>{formatDate(log.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Runs + connections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Runs box */}
          <div style={{ background: '#09090B', borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 48, color: recentCount > 0 ? '#C6FF3D' : 'rgba(255,255,255,0.15)', lineHeight: 1 }}>
              {recentCount}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              ejecuciones última hora
            </div>
          </div>

          {/* Recent runs */}
          {(runs && runs.length > 0) && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4E4E7', padding: '16px 18px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 12 }}>
                Últimas ejecuciones
              </div>
              {runs.slice(0, 6).map(run => {
                const sc = run.status === 'running' ? { color: '#16a34a', bg: 'rgba(22,163,74,0.08)' }
                  : run.status === 'completed' ? { color: '#71717A', bg: '#F4F4F5' }
                  : { color: '#dc2626', bg: 'rgba(220,38,38,0.08)' }
                return (
                  <div key={run.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #F4F4F5' }}>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: '#09090B', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(run as any).agent}
                    </span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 4, color: sc.color, background: sc.bg, flexShrink: 0, letterSpacing: '0.04em' }}>
                      {run.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Connects to */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4E4E7', padding: '16px 18px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 12 }}>
              Conectado con
            </div>
            {(() => {
              const connected = new Set<DepartmentId>()
              for (const agent of agents) {
                for (const outId of (agent.outputA ?? [])) {
                  const target = NUCLEUS_AGENTS.find(a => a.id === outId)
                  if (target && target.depto !== deptId) connected.add(target.depto)
                }
              }
              const list = Array.from(connected)
              if (list.length === 0) return (
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: '#71717A' }}>
                  Sin salidas a otros departamentos
                </div>
              )
              return list.map(id => {
                const d = DEPARTMENTS[id]
                return (
                  <Link key={id} href={`/agents/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #F4F4F5', textDecoration: 'none' }}>
                    <span style={{ fontSize: 14 }}>{d.emoji}</span>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: '#09090B' }}>{d.nombre}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 9, color: '#A1A1AA' }}>→</span>
                  </Link>
                )
              })
            })()}
          </div>

          <Link href="/agents/arquitectura" style={{
            display: 'block', padding: '12px 16px', background: '#F4F4F5', borderRadius: 10,
            border: '1px solid #E4E4E7', textDecoration: 'none', textAlign: 'center',
            fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717A',
          }}>
            Ver arquitectura completa →
          </Link>
        </div>
      </div>
    </div>
  )
}
