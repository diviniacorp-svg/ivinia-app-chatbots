export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import NeuralGraphClient from './_components/NeuralGraphClient'
import KPIBand from '@/components/dashboard/KPIBand'
import TodaySnapshot from '@/components/dashboard/TodaySnapshot'
import Link from 'next/link'

async function getDashboardData() {
  const db = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const [metricsRes, leadsRes, contentRes, agendaRes] = await Promise.all([
    db.from('ceo_metrics').select('*').single(),
    db.from('leads').select('id, nombre, negocio, score, status').gte('score', 60).order('score', { ascending: false }).limit(3),
    db.from('content_calendar').select('id, titulo, tipo, plataforma, status').eq('fecha', today).eq('status', 'planificado').limit(4),
    db.from('nucleus_memory').select('id, contenido, importancia').contains('tags', ['agenda']).eq('activo', true).order('importancia', { ascending: false }).limit(4),
  ])
  return {
    metrics: metricsRes.data as any,
    leads: (leadsRes.data ?? []) as any[],
    content: (contentRes.data ?? []) as any[],
    agenda: (agendaRes.data ?? []) as any[],
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function DashboardPage() {
  let data = { metrics: null as any, leads: [] as any[], content: [] as any[], agenda: [] as any[] }
  try { data = await getDashboardData() } catch {}

  const date = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const leadsHoy = data.metrics?.leads_nuevos ?? 0
  const runsHoy = data.metrics?.agent_runs_hoy ?? 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header editorial */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              {date}
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              {getGreeting()}, Joaco.
            </h1>
            {(leadsHoy > 0 || runsHoy > 0) && (
              <p style={{ marginTop: 10, fontFamily: 'var(--f-display)', fontSize: 15, color: 'var(--muted-2)' }}>
                {leadsHoy > 0 && `${leadsHoy} lead${leadsHoy > 1 ? 's' : ''} nuevo${leadsHoy > 1 ? 's' : ''} hoy`}
                {leadsHoy > 0 && runsHoy > 0 && ' · '}
                {runsHoy > 0 && `${runsHoy} agente${runsHoy > 1 ? 's' : ''} activo${runsHoy > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { href: '/leads', label: 'Nuevo lead' },
              { href: '/crm', label: 'Propuesta' },
              { href: '/contenido', label: 'Contenido' },
              { href: '/agents', label: 'Agentes' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{
                padding: '9px 18px', borderRadius: 8, border: '1px solid var(--line)',
                fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--ink)', textDecoration: 'none', background: 'var(--paper)', whiteSpace: 'nowrap',
              }}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Band */}
      <KPIBand metrics={data.metrics} />

      {/* Neural Graph — ink section */}
      <div style={{ background: 'var(--ink)', padding: '32px 40px 0' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
          Sistema DIVINIA · tiempo real · actualiza cada 30s
        </div>
        <NeuralGraphClient />
      </div>

      {/* Today snapshot */}
      <div style={{ padding: '32px 40px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
          Estado de hoy
        </div>
        <TodaySnapshot leads={data.leads} content={data.content} agenda={data.agenda} />
      </div>

    </div>
  )
}
