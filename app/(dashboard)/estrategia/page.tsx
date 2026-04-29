import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'
import { STRATEGY_LEVELS, PRODUCTS, NUCLEUS_AGENTS } from '@/lib/nucleus/index'

export const dynamic = 'force-dynamic'

const INK = '#09090B'
const LIME = '#C6FF3D'

async function getData() {
  const db = createAdminClient()
  const [clientsRes, projectsRes, memoryRes, leadsRes] = await Promise.all([
    db.from('clients').select('id, status, mrr, plan, rubro').eq('status', 'active'),
    db.from('projects').select('id, nombre, status, progreso, tipo, categoria, color, icon').order('updated_at', { ascending: false }).limit(20),
    db.from('nucleus_memory').select('id, contenido, importancia, tags').contains('tags', ['estrategia']).eq('activo', true).order('importancia', { ascending: false }).limit(6),
    db.from('leads').select('id, status').in('status', ['caliente', 'contactado', 'propuesta']),
  ])

  const clients = clientsRes.data ?? []
  const projects = projectsRes.data ?? []
  const decisions = memoryRes.data ?? []
  const leads = leadsRes.data ?? []

  const mrr = clients.reduce((s, c) => s + (c.mrr || 0), 0)
  const clientesActivos = clients.length
  const leadsCalientes = leads.filter(l => l.status === 'caliente').length
  const leadsEnPropuesta = leads.filter(l => l.status === 'propuesta').length

  return { clients, projects, decisions, mrr, clientesActivos, leadsCalientes, leadsEnPropuesta }
}

export default async function EstrategiaPage() {
  const { projects, decisions, mrr, clientesActivos, leadsCalientes, leadsEnPropuesta } = await getData()

  const proyectosCliente = projects.filter(p => p.tipo === 'cliente')
  const proyectosDivinia = projects.filter(p => p.tipo === 'producto-divinia')

  const GEO_STAGES = [
    { label: 'San Luis Capital', status: 'activo', desc: 'Mercado actual — clientes activos', color: LIME },
    { label: 'Interior San Luis', status: 'proximo', desc: 'Q3 2026 — Villa Mercedes, Merlo', color: '#60A5FA' },
    { label: 'Cuyo', status: 'planeado', desc: 'Q4 2026 — Mendoza, SJ, SL', color: '#A78BFA' },
    { label: 'Nacional', status: 'vision', desc: '2027 — DIVINIA en todo AR', color: '#F472B6' },
  ]

  const PRODUCTOS_DIVINIA = [
    { key: 'turnero', label: 'Turnero IA', emoji: '📅', precio: '$43k/mes', estado: 'activo', mercado: 'PYMEs con turnos' },
    { key: 'chatbot_wa', label: 'Chatbot WA', emoji: '💬', precio: '$150k-250k', estado: 'activo', mercado: 'Todo negocio con WA' },
    { key: 'content_factory', label: 'Content Factory', emoji: '🎬', precio: '$80k-150k/mes', estado: 'activo', mercado: 'Negocios en Instagram' },
    { key: 'landing', label: 'Landing Page', emoji: '🌐', precio: '$100k+', estado: 'activo', mercado: 'Sin presencia web' },
    { key: 'avatares_ia', label: 'Avatares IA', emoji: '🎭', precio: '$200k-600k', estado: 'desarrollo', mercado: 'Empresas con cara visible' },
    { key: 'nucleus', label: 'NUCLEUS IA', emoji: '🧠', precio: '$800k-3M', estado: 'desarrollo', mercado: 'Empresas y gobierno' },
  ]

  const strategistAgents = NUCLEUS_AGENTS.filter(a => a.id.startsWith('estratega'))

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: INK, color: '#fff', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
          DIVINIA OS · CAPA ESTRATÉGICA
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#fff' }}>
          Estrategia
        </h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
          Tres niveles: DIVINIA macro · por cliente · por proyecto
        </p>
      </div>

      {/* Métricas actuales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'MRR actual', valor: `$${(mrr / 1000).toFixed(0)}k`, sub: 'ARS mensual', color: LIME },
          { label: 'Clientes activos', valor: clientesActivos, sub: 'pagando', color: '#60A5FA' },
          { label: 'Leads calientes', valor: leadsCalientes, sub: 'en pipeline activo', color: '#FBBF24' },
          { label: 'En propuesta', valor: leadsEnPropuesta, sub: 'esperando cierre', color: '#F472B6' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px',
          }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 800, color: m.color }}>{m.valor}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>

        {/* Expansión geográfica */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
            Expansión geográfica
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GEO_STAGES.map((stage, i) => (
              <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: stage.status === 'activo' ? LIME : 'rgba(255,255,255,0.1)',
                  boxShadow: stage.status === 'activo' ? `0 0 8px ${LIME}` : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 600, color: stage.status === 'activo' ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                    {stage.label}
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{stage.desc}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 20,
                  background: stage.status === 'activo' ? `${LIME}22` : 'rgba(255,255,255,0.05)',
                  color: stage.status === 'activo' ? LIME : 'rgba(255,255,255,0.3)',
                  border: `1px solid ${stage.status === 'activo' ? LIME + '44' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {stage.status === 'activo' ? 'ACTIVO' : stage.status === 'proximo' ? 'PRÓXIMO' : stage.status === 'planeado' ? 'PLAN' : 'VISIÓN'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agentes estrategas */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
            Equipo de estrategas IA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {strategistAgents.map(agent => {
              const modelColor = agent.modelo === 'opus' ? '#F472B6' : agent.modelo === 'sonnet' ? '#60A5FA' : '#A78BFA'
              return (
                <div key={agent.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{agent.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, fontWeight: 600, color: '#fff' }}>{agent.nombre}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{agent.funcion.slice(0, 70)}...</div>
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 6px', borderRadius: 4, background: `${modelColor}18`, color: modelColor, border: `1px solid ${modelColor}33`, flexShrink: 0 }}>
                    {agent.modelo}
                  </div>
                </div>
              )
            })}
          </div>
          <Link href="/agents/cerebro" style={{ display: 'block', marginTop: 14, fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            Ver depto Cerebro →
          </Link>
        </div>
      </div>

      {/* Portfolio de productos DIVINIA */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Portfolio de productos
          </div>
          <Link href="/proyectos?tipo=producto-divinia" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>
            Ver todos →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {PRODUCTOS_DIVINIA.map(p => (
            <div key={p.key} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              border: `1px solid ${p.estado === 'activo' ? 'rgba(198,255,61,0.15)' : 'rgba(255,255,255,0.07)'}`,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.label}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: p.estado === 'activo' ? LIME : '#FBBF24' }}>
                    {p.estado === 'activo' ? '● EN VENTA' : '◌ EN DESARROLLO'}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{p.mercado}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{p.precio}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Proyectos de clientes activos */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Proyectos de clientes
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/proyectos/nuevo" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: LIME, textDecoration: 'none', padding: '4px 10px', border: `1px solid ${LIME}44`, borderRadius: 5 }}>
              + Nuevo proyecto
            </Link>
            <Link href="/proyectos" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>
              Ver todos →
            </Link>
          </div>
        </div>
        {proyectosCliente.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.1)', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
              No hay proyectos de clientes aún
            </div>
            <Link href="/proyectos/nuevo" style={{ display: 'inline-block', marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 10, color: LIME, textDecoration: 'none' }}>
              Crear primer proyecto →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {proyectosCliente.slice(0, 4).map(p => (
              <Link key={p.id} href={`/proyectos/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.nombre}</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <ProgressBar value={p.progreso} color={p.color} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Decisiones estratégicas (nucleus_memory) */}
      {decisions.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
            Decisiones y aprendizajes clave
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {decisions.map(d => (
              <div key={d.id} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.07)', padding: '10px 14px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: d.importancia >= 8 ? LIME : d.importancia >= 5 ? '#FBBF24' : 'rgba(255,255,255,0.2)',
                }} />
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  {d.contenido}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    'activo': { label: 'Activo', color: '#4ade80' },
    'en-desarrollo': { label: 'En desarrollo', color: '#FBBF24' },
    'idea': { label: 'Idea', color: '#60A5FA' },
    'pausado': { label: 'Pausado', color: '#F87171' },
    'completado': { label: 'Completado', color: '#A78BFA' },
  }
  const s = map[status] ?? { label: status, color: 'rgba(255,255,255,0.4)' }
  return (
    <div style={{
      fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 20,
      background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}33`,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </div>
  )
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{value}%</div>
    </div>
  )
}
