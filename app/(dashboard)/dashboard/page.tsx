export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'
import NeuralGraphClient from './_components/NeuralGraphClient'

async function getDashboardData() {
  const db = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [leadsRes, agendaRes, clientsRes, subsRes, bookingsRes, contentRes] = await Promise.all([
    db.from('leads').select('id, company_name, rubro, score, status, city').gte('score', 60).order('score', { ascending: false }).limit(6),
    db.from('nucleus_memory').select('id, contenido, importancia').contains('tags', ['agenda']).eq('activo', true).order('importancia', { ascending: false }).limit(5),
    db.from('clients').select('id, status, mrr, plan'),
    db.from('subscriptions').select('id, estado, monto_ars'),
    db.from('bookings').select('id, status').gte('created_at', today + 'T00:00:00'),
    db.from('leads').select('id, created_at').gte('created_at', weekAgo),
  ])

  const clients = clientsRes.data ?? []
  const subs = subsRes.data ?? []
  const bookings = bookingsRes.data ?? []
  const newLeads = contentRes.data ?? []

  const mrr_clientes = clients.filter(c => c.status === 'active').reduce((s, c) => s + (c.mrr || 0), 0)
  const mrr_subs = subs.filter(s => s.estado === 'active' || s.estado === 'authorized').reduce((s, sub) => s + (sub.monto_ars || 0), 0)

  const metrics = {
    mrr_actual: mrr_clientes + mrr_subs,
    clientes_activos: clients.filter(c => c.status === 'active').length,
    en_trial: clients.filter(c => c.status === 'trial').length,
    reservas_hoy: bookings.filter(b => b.status !== 'cancelled').length,
    leads_nuevos: newLeads.length,
    leads_calientes: (leadsRes.data ?? []).filter(l => (l.score || 0) >= 70).length,
    agent_runs_hoy: 0,
  }

  return {
    metrics,
    leads: (leadsRes.data ?? []) as any[],
    agenda: (agendaRes.data ?? []) as any[],
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

const LIME = '#C6FF3D'
const INK = '#09090B'

// ── Productos con su estado ──────────────────────────────────────────────────
const PRODUCTOS = [
  { icon: '📅', nombre: 'Turnero', href: '/turnos', estado: 'listo', desc: '$45k/mes', color: '#4ade80' },
  { icon: '💬', nombre: 'Chatbot IA', href: '/chatbots', estado: 'bloqueado', desc: 'Meta pendiente', color: '#f87171' },
  { icon: '🧠', nombre: 'Núcleo IA', href: '/nucleo', estado: 'nuevo', desc: '$400k setup', color: LIME },
  { icon: '✨', nombre: 'Content', href: '/contenido', estado: 'parcial', desc: '$80-150k/mes', color: '#fb923c' },
  { icon: '🎭', nombre: 'Avatares', href: '/avatares', estado: 'parcial', desc: '$200-600k', color: '#fb923c' },
]

// ── Agentes IA ───────────────────────────────────────────────────────────────
const AGENTES = [
  { icon: '🔍', nombre: 'Prospector', desc: 'Busca leads', href: '/agents/clientes', activo: true },
  { icon: '🧠', nombre: 'Qualifier', desc: 'Califica leads', href: '/agents/ia-auto', activo: true },
  { icon: '📄', nombre: 'Strategist', desc: 'Genera propuestas', href: '/agents/clientes', activo: false },
  { icon: '📬', nombre: 'Follow-up', desc: 'Seguimiento', href: '/agents/clientes', activo: false },
  { icon: '⚙️', nombre: 'Onboarder', desc: 'Setup clientes', href: '/agents/ia-auto', activo: false },
  { icon: '📊', nombre: 'Reporter', desc: 'Digest diario', href: '/agents/ia-auto', activo: true },
]

// ── Acciones rápidas ─────────────────────────────────────────────────────────
const ACCIONES = [
  { icon: '🎯', label: 'Buscar leads',   href: '/leads',      primary: true },
  { icon: '🔥', label: 'Pipeline',        href: '/comercial',  primary: true },
  { icon: '🗂',  label: 'CRM',            href: '/crm',        primary: false },
  { icon: '👥', label: 'Clientes',        href: '/clientes',   primary: false },
  { icon: '💳', label: 'Generar pago',    href: '/pagos',      primary: false },
  { icon: '✨', label: 'Redes / Content', href: '/redes',      primary: false },
  { icon: '📅', label: 'Turnos hoy',      href: '/turnos',     primary: false },
  { icon: '🔧', label: 'Generadores',     href: '/herramientas',primary: false },
]

const ESTADO_BADGE: Record<string, string> = {
  listo: 'Listo', bloqueado: 'Bloqueado', nuevo: 'Nuevo', parcial: 'Parcial',
}

export default async function DashboardPage() {
  let data = { metrics: null as any, leads: [] as any[], agenda: [] as any[] }
  try { data = await getDashboardData() } catch {}

  const date = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const mrr = data.metrics?.mrr_actual ?? 0
  const clientes = data.metrics?.clientes_activos ?? 0
  const reservasHoy = data.metrics?.reservas_hoy ?? 0
  const leadsNuevos = data.metrics?.leads_nuevos ?? 0
  const agentesActivos = data.metrics?.agent_runs_hoy ?? 0

  const KPIS = [
    { label: 'MRR', value: mrr > 0 ? ars(mrr) : '—', highlight: mrr > 0, icon: '💰' },
    { label: 'Clientes activos', value: clientes || '—', highlight: false, icon: '👥' },
    { label: 'Turnos hoy', value: reservasHoy || '—', highlight: Number(reservasHoy) > 0, icon: '📅' },
    { label: 'Leads nuevos', value: leadsNuevos || '—', highlight: Number(leadsNuevos) > 0, icon: '🎯' },
    { label: 'Agentes activos', value: agentesActivos || '—', highlight: Number(agentesActivos) > 0, icon: '🤖' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', color: INK }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background: INK, padding: '24px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, maxWidth: 1400, margin: '0 auto' }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
              DIVINIA OS · {date}
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 36px)', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              {getGreeting()}, Joaco.
            </h1>
          </div>
          {/* CTAs principales */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/leads" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: LIME, color: INK, borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 13 }}>
              🎯 Buscar leads
            </Link>
            <Link href="/comercial" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--f-display)', fontSize: 13 }}>
              🔥 Pipeline
            </Link>
            <Link href="/crm" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--f-display)', fontSize: 13 }}>
              🗂 CRM
            </Link>
            <Link href="/pagos" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--f-display)', fontSize: 13 }}>
              💳 Cobrar
            </Link>
          </div>
        </div>

        {/* ── KPI strip ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, maxWidth: 1400, margin: '20px auto 0' }}>
          {KPIS.map((k, i) => (
            <div key={k.label} style={{ padding: '4px 0', borderRight: i < KPIS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', paddingRight: 20 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                {k.icon} {k.label}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 22, color: k.highlight ? LIME : 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 28px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── Fila principal: Pipeline + Agenda + Acciones ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 16, marginBottom: 16 }}>

          {/* Pipeline leads */}
          <Section title="Pipeline" sub="leads con score ≥ 60" action={{ label: 'Ver CRM →', href: '/crm' }}>
            {data.leads.length === 0 ? (
              <EmptyState icon="🎯" text="Sin leads calientes." cta="Buscar leads" href="/leads" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data.leads.map((lead: any) => (
                  <Link key={lead.id} href={`/comercial?leadId=${lead.id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid #E4E4E7', textDecoration: 'none',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: INK }}>{lead.company_name}</div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {lead.rubro} · {lead.status}
                      </div>
                    </div>
                    <ScoreBadge score={lead.score} />
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {/* Agenda Joaco */}
          <Section title="Agenda" sub="pendientes para vos" action={{ label: 'Ver leads →', href: '/leads' }}>
            {data.agenda.length === 0 ? (
              <EmptyState icon="✅" text="Sin pendientes urgentes." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data.agenda.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #E4E4E7' }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                      background: item.importancia >= 3 ? '#ef4444' : item.importancia === 2 ? '#f59e0b' : '#94A3B8',
                    }} />
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: INK, lineHeight: 1.45 }}>{item.contenido}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Acciones rápidas */}
          <Section title="Acceso rápido" sub="">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ACCIONES.map(a => (
                <Link key={a.href + a.label} href={a.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9,
                  background: a.primary ? `${LIME}18` : '#F4F4F5',
                  border: a.primary ? `1px solid ${LIME}44` : '1px solid #E4E4E7',
                  textDecoration: 'none', transition: 'background 0.1s',
                }}>
                  <span style={{ fontSize: 15 }}>{a.icon}</span>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: a.primary ? 600 : 400, color: INK }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Fila: Productos ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Productos DIVINIA" sub="estado de cada producto" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {PRODUCTOS.map(p => (
              <Link key={p.nombre} href={p.href} style={{
                display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px', borderRadius: 12,
                background: '#fff', border: `1px solid ${p.estado === 'listo' ? '#4ade8030' : p.estado === 'nuevo' ? '#C6FF3D30' : '#E4E4E7'}`,
                textDecoration: 'none',
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{
                    fontSize: 8, fontFamily: 'var(--f-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '2px 7px', borderRadius: 10, background: `${p.color}18`, color: p.color,
                    fontWeight: 700,
                  }}>{ESTADO_BADGE[p.estado]}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 13, color: INK }}>{p.nombre}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#71717A', marginTop: 2 }}>{p.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Fila: Agentes ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Agentes IA" sub="pipeline multi-agente" action={{ label: 'Gestionar →', href: '/agents' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {AGENTES.map(ag => (
              <Link key={ag.nombre} href={ag.href} style={{
                display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 10,
                background: '#fff', border: `1px solid ${ag.activo ? '#4ade8030' : '#E4E4E7'}`,
                textDecoration: 'none', position: 'relative', overflow: 'hidden',
              }}>
                {ag.activo && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#4ade80',
                    boxShadow: '0 0 6px #4ade80',
                  }} />
                )}
                <span style={{ fontSize: 20 }}>{ag.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 12, color: INK }}>{ag.nombre}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#71717A', marginTop: 2 }}>{ag.desc}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: ag.activo ? '#4ade80' : '#94A3B8', fontWeight: 600,
                }}>
                  {ag.activo ? '● activo' : '○ inactivo'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Neural Graph ────────────────────────────────────────────── */}
      <div style={{ padding: '0 28px 32px', maxWidth: 1400, margin: '0 auto' }}>
        <SectionHeader title="Red de Agentes IA" sub="actividad en tiempo real" action={{ label: 'Sala de Mando →', href: '/agents' }} />
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4E4E7', padding: '4px 4px', overflow: 'hidden' }}>
          <NeuralGraphClient />
        </div>
      </div>
    </div>
  )
}

// ── Componentes internos ─────────────────────────────────────────────────────

function SectionHeader({ title, sub, action }: { title: string; sub: string; action?: { label: string; href: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A' }}>
          {title}
        </span>
        {sub && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#A1A1AA', marginLeft: 8 }}>{sub}</span>}
      </div>
      {action && (
        <Link href={action.href} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717A', textDecoration: 'none' }}>
          {action.label}
        </Link>
      )}
    </div>
  )
}

function Section({ title, sub, action, children }: {
  title: string; sub: string; action?: { label: string; href: string }; children: React.ReactNode
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4E4E7', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SectionHeader title={title} sub={sub} action={action} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}

function EmptyState({ icon, text, cta, href }: { icon: string; text: string; cta?: string; href?: string }) {
  return (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#71717A' }}>
        {text}{' '}
        {cta && href && <Link href={href} style={{ color: '#09090B', textDecoration: 'underline' }}>{cta} →</Link>}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 65 ? '#d97706' : '#71717A'
  const bg = score >= 80 ? 'rgba(22,163,74,0.08)' : score >= 65 ? 'rgba(217,119,6,0.08)' : '#F4F4F5'
  return (
    <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13, color, background: bg, border: `1px solid ${color}33`, borderRadius: 7, padding: '3px 10px', flexShrink: 0 }}>
      {score}
    </div>
  )
}
