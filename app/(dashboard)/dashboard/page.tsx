export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import NeuralGraphClient from './_components/NeuralGraphClient'
import Link from 'next/link'

async function getDashboardData() {
  const db = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const [metricsRes, leadsRes, contentRes, agendaRes] = await Promise.all([
    db.from('ceo_metrics').select('*').single(),
    db.from('leads').select('id, company_name, negocio, score, status').gte('score', 60).order('score', { ascending: false }).limit(5),
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

const QUICK_ACTIONS = [
  { href: '/comercial', label: 'Nuevo lead', icon: '🎯' },
  { href: '/pagos', label: 'Generar pago', icon: '💳' },
  { href: '/turnos', label: 'Turnero', icon: '📅' },
  { href: '/nucleo', label: 'Núcleo IA', icon: '🧠' },
  { href: '/comercial', label: 'Propuesta', icon: '📄' },
  { href: '/herramientas', label: 'Generadores', icon: '🔧' },
]

const PRODUCTOS_STATUS = [
  { nombre: 'Turnero', icon: '📅', href: '/turnos', estado: 'listo', desc: 'Reservas online' },
  { nombre: 'Chatbot IA', icon: '💬', href: '/chatbots', estado: 'bloqueado', desc: 'Meta WA pendiente' },
  { nombre: 'Núcleo IA', icon: '🧠', href: '/nucleo', estado: 'nuevo', desc: 'Sistema de gestión' },
  { nombre: 'Content Factory', icon: '✨', href: '/contenido', estado: 'parcial', desc: 'Herramientas listas' },
  { nombre: 'Avatares IA', icon: '🎭', href: '/avatares', estado: 'parcial', desc: 'Proceso a definir' },
]

const ESTADO_PRODUCTO: Record<string, { label: string; color: string; bg: string }> = {
  listo:    { label: 'Listo',     color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  parcial:  { label: 'Parcial',   color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
  bloqueado:{ label: 'Bloqueado', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  nuevo:    { label: 'Nuevo',     color: '#C6FF3D', bg: 'rgba(198,255,61,0.08)' },
}

export default async function DashboardPage() {
  let data = { metrics: null as any, leads: [] as any[], content: [] as any[], agenda: [] as any[] }
  try { data = await getDashboardData() } catch {}

  const date = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const leadsHoy = data.metrics?.leads_nuevos ?? 0
  const runsHoy = data.metrics?.agent_runs_hoy ?? 0
  const mrr = data.metrics?.mrr_actual ?? 0
  const clientesActivos = data.metrics?.clientes_activos ?? 0
  const reservasHoy = data.metrics?.reservas_hoy ?? 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Page header */}
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
              DIVINIA OS · {date}
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(26px, 4vw, 44px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              {getGreeting()}, Joaco.
            </h1>
            {(leadsHoy > 0 || runsHoy > 0) && (
              <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)' }}>
                {leadsHoy > 0 && `${leadsHoy} lead${leadsHoy > 1 ? 's' : ''} nuevo${leadsHoy > 1 ? 's' : ''} hoy`}
                {leadsHoy > 0 && runsHoy > 0 && ' · '}
                {runsHoy > 0 && `${runsHoy} agente${runsHoy > 1 ? 's' : ''} activo${runsHoy > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KPI row — 4 stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        {[
          { label: 'MRR actual', value: mrr > 0 ? `$${Number(mrr).toLocaleString('es-AR')}` : '—', accent: mrr > 0 },
          { label: 'Clientes activos', value: clientesActivos || '—', accent: false },
          { label: 'Turnos hoy', value: reservasHoy || '—', accent: Number(reservasHoy) > 0 },
          { label: 'Leads nuevos', value: leadsHoy || '—', accent: Number(leadsHoy) > 0 },
        ].map((k, i, arr) => (
          <div key={k.label} style={{
            padding: '20px 24px',
            borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              {k.label}
            </p>
            <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 28, color: k.accent ? 'var(--lime)' : 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Pipeline rápido */}
        <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Pipeline · Leads calientes
          </p>
          {data.leads.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>
                Sin leads calientes todavía.{' '}
                <Link href="/leads" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Buscar leads →</Link>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.leads.map((lead: any) => (
                <div key={lead.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                }}>
                  <div>
                    <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)', margin: 0 }}>
                      {lead.company_name}
                    </p>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                      {lead.negocio} · {lead.status}
                    </p>
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-mono)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: lead.score >= 80 ? '#15803d' : 'var(--ink)',
                    background: lead.score >= 80 ? 'rgba(22,163,74,0.1)' : 'var(--paper-2)',
                    border: lead.score >= 80 ? '1px solid rgba(22,163,74,0.25)' : '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '4px 10px',
                  }}>
                    {lead.score}
                  </div>
                </div>
              ))}
              <Link href="/crm" style={{
                display: 'block',
                marginTop: 12,
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                textDecoration: 'none',
              }}>
                Ver CRM completo →
              </Link>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Acciones rápidas
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {QUICK_ACTIONS.map(action => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--line)',
                  background: 'var(--paper-2)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{action.icon}</span>
                <span style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--ink)',
                }}>
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Estado de hoy — contenido programado */}
        {data.content.length > 0 && (
          <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              Contenido programado hoy
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.content.map((item: any) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--line)',
                }}>
                  <div>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', margin: 0 }}>{item.titulo}</p>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                      {item.tipo} · {item.plataforma}
                    </p>
                  </div>
                  <span style={{
                    background: 'rgba(245,158,11,0.1)',
                    color: '#b45309',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 100,
                    padding: '3px 10px',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 9,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                  }}>
                    planificado
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda Joaco */}
        {data.agenda.length > 0 && (
          <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 24px' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              Agenda · Pendientes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.agenda.map((item: any) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 0', borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: item.importancia >= 3 ? '#ef4444' : item.importancia === 2 ? '#f59e0b' : 'var(--muted)',
                  }} />
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', margin: 0, lineHeight: 1.4 }}>
                    {item.contenido}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Productos DIVINIA — estado rápido */}
      <div style={{ padding: '0 32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12, marginTop: 8 }}>
          Productos DIVINIA
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {PRODUCTOS_STATUS.map(p => {
            const est = ESTADO_PRODUCTO[p.estado]
            return (
              <Link
                key={p.nombre}
                href={p.href}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 6,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--paper)', border: '1px solid var(--line)',
                  textDecoration: 'none', transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <span style={{
                    fontSize: 9, fontFamily: 'var(--f-mono)', letterSpacing: '0.06em',
                    textTransform: 'uppercase', padding: '2px 7px', borderRadius: 10,
                    background: est.bg, color: est.color,
                  }}>{est.label}</span>
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{p.nombre}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: 'var(--muted-2)' }}>{p.desc}</div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Neural Graph */}
      <div style={{ background: 'var(--ink)', padding: '32px 32px 0' }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
          Sistema DIVINIA · tiempo real · actualiza cada 30s
        </p>
        <NeuralGraphClient />
      </div>

    </div>
  )
}
