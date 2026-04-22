import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import Orb from '@/components/public/Orb'

export const dynamic = 'force-dynamic'

const DEPT_MAP: Record<string, {
  label: string
  color: string
  description: string
  agents: string[]
  number: string
}> = {
  'ia-auto': {
    label: 'IA & Automatizaciones', color: '#C6FF3D',
    description: 'Diseño y construcción de agentes IA, workflows y automatizaciones',
    agents: ['Director de IA', 'Dev de Agentes', 'Integrador API', 'Orquestador', 'Optimizador de Costos'],
    number: '01',
  },
  'web-apps': {
    label: 'Web Apps', color: '#38BDF8',
    description: 'Desarrollo de sitios, dashboards y apps',
    agents: ['Director de Desarrollo', 'Frontend Dev', 'Backend Dev', 'DevOps'],
    number: '02',
  },
  'youtube': {
    label: 'YouTube & Multimedia', color: '#FF5E3A',
    description: 'Canal YouTube, guiones y producción con IA',
    agents: ['Director Multimedia', 'Guionista IA', 'Productor AV', 'SEO YouTube'],
    number: '03',
  },
  'content': {
    label: 'Content Factory', color: '#E879F9',
    description: 'Fábrica de contenido: textos, imágenes, videos',
    agents: ['Director de Contenido', 'Copywriter IA', 'Diseñador IA', 'Video Creator'],
    number: '04',
  },
  'clientes': {
    label: 'Clientes & Servicios', color: '#34D399',
    description: 'Pipeline comercial, propuestas y delivery',
    agents: ['Director Comercial', 'CRM Manager', 'Vendedor IA', 'Project Delivery', 'Soporte'],
    number: '05',
  },
  'avatares': {
    label: 'Avatares IA', color: '#FCD34D',
    description: 'Creación y venta de avatares digitales',
    agents: ['Director de Avatares', 'Diseñador Avatares', 'Voice Cloner', 'Integrador Video'],
    number: '06',
  },
  'legal': {
    label: 'Legal & Compliance', color: '#818CF8',
    description: 'Contratos, NDA y compliance IA',
    agents: ['Director Legal', 'Contratos IA', 'Compliance', 'Propiedad Intelectual'],
    number: '07',
  },
  'seguridad': {
    label: 'Ciberseguridad', color: '#F87171',
    description: 'Seguridad, accesos y auditorías',
    agents: ['Director Seguridad', 'Security Agent', 'Infra Manager', 'Auditor'],
    number: '08',
  },
  'finanzas': {
    label: 'Contabilidad & Finanzas', color: '#FB923C',
    description: 'Contabilidad, impuestos y flujo de caja',
    agents: ['Director Financiero', 'Contador IA', 'Fiscal IA', 'Cash Flow', 'Facturador'],
    number: '09',
  },
  'rrhh': {
    label: 'RRHH Digital', color: '#A78BFA',
    description: 'Crear y entrenar agentes, documentación',
    agents: ['Director RRHH', 'Agent Creator', 'Agent Trainer', 'Documentador'],
    number: '10',
  },
  'innovacion': {
    label: 'Innovación Continua', color: '#67E8F9',
    description: 'Monitoreo de tecnologías y mejoras',
    agents: ['Director Innovación', 'Tech Researcher', 'System Updater', 'Innovador'],
    number: '11',
  },
}

function getStatusColor(status: string) {
  switch (status) {
    case 'running':
      return { background: 'rgba(198,255,61,0.2)', color: '#5A7A00' }
    case 'completed':
      return { background: 'rgba(52,211,153,0.2)', color: '#065F46' }
    case 'failed':
      return { background: 'rgba(248,113,113,0.2)', color: '#991B1B' }
    default:
      return { background: 'var(--paper-2)', color: 'var(--muted)' }
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default async function DeptPage({ params }: { params: { dept: string } }) {
  const dept = DEPT_MAP[params.dept]
  if (!dept) notFound()

  const db = createAdminClient()

  const keyword = params.dept.split('-')[0]
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()

  const [{ data: logs }, { data: runs }, { data: recentRuns }] = await Promise.all([
    db.from('agent_logs')
      .select('id, agent, action, date, created_at')
      .ilike('agent', `%${keyword}%`)
      .order('date', { ascending: false })
      .limit(15),
    db.from('agent_runs')
      .select('id, agent, status, created_at, duration_ms')
      .ilike('agent', `%${keyword}%`)
      .order('created_at', { ascending: false })
      .limit(8),
    db.from('agent_runs')
      .select('id, agent, status')
      .ilike('agent', `%${keyword}%`)
      .gte('created_at', oneHourAgo),
  ])

  const hasActivity = (logs && logs.length > 0) || (runs && runs.length > 0)
  const recentCount = recentRuns?.length ?? 0

  return (
    <div style={{ padding: '32px 40px', minHeight: '100vh', background: 'var(--paper)' }}>

      {/* HEADER */}
      <div style={{ paddingBottom: 32, borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
        <a
          href="/dashboard/agents"
          style={{
            display: 'block',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            textDecoration: 'none',
            marginBottom: 20,
          }}
        >
          ← Volver a Agentes
        </a>

        <div style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
          <Orb size={52} color={dept.color} colorDeep={dept.color} shade="rgba(0,0,0,0.3)" />
          <div>
            <p style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 4,
            }}>
              Departamento {dept.number}
            </p>
            <h1 style={{
              fontFamily: 'var(--f-display)',
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
              marginBottom: 4,
              lineHeight: 1,
            }}>
              {dept.label}
            </h1>
            <p style={{
              fontFamily: 'var(--f-display)',
              fontSize: 15,
              color: 'var(--muted-2)',
            }}>
              {dept.description}
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>

        {/* COL IZQUIERDA — Actividad */}
        <div>
          <p style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 16,
          }}>
            Actividad reciente
          </p>

          {!hasActivity ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 15 }}>
                Sin actividad registrada todavía
              </p>
              <p style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                marginTop: 8,
              }}>
                Los runs de los agentes de este departamento aparecerán aquí
              </p>
            </div>
          ) : (
            <>
              {logs && logs.length > 0 && (
                <div>
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        background: 'var(--paper-2)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        padding: '14px 18px',
                        marginBottom: 4,
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: dept.color,
                        marginTop: 6, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--muted)',
                          marginBottom: 2,
                        }}>
                          {log.agent}
                        </p>
                        <p style={{
                          fontFamily: 'var(--f-display)',
                          fontSize: 14,
                          color: 'var(--ink)',
                          lineHeight: 1.4,
                        }}>
                          {log.action}
                        </p>
                        <p style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 10,
                          color: 'var(--muted)',
                          marginTop: 4,
                        }}>
                          {formatDate(log.date ?? log.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {runs && runs.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <p style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: 12,
                  }}>
                    Ejecuciones
                  </p>
                  {runs.map((run) => {
                    const statusStyle = getStatusColor(run.status ?? '')
                    return (
                      <div
                        key={run.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 0',
                          borderBottom: '1px solid var(--line)',
                        }}
                      >
                        <span style={{
                          fontFamily: 'var(--f-display)',
                          fontSize: 14,
                          color: 'var(--ink)',
                          flex: 1,
                        }}>
                          {(run as any).agent ?? (run as any).agent_name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          borderRadius: 20,
                          padding: '3px 10px',
                          ...statusStyle,
                        }}>
                          {run.status ?? 'unknown'}
                        </span>
                        <span style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 10,
                          color: 'var(--muted)',
                        }}>
                          {formatDate((run as any).created_at ?? (run as any).started_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* COL DERECHA */}
        <div>

          {/* Card Equipo */}
          <div style={{
            background: 'var(--paper-2)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 16,
          }}>
            <p style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 16,
            }}>
              Equipo
            </p>
            <div>
              {dept.agents.map((agent, i) => (
                <div
                  key={agent}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: i < dept.agents.length - 1 ? '1px solid var(--line)' : 'none',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: dept.color + '22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: dept.color,
                    }}>
                      {agent.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    flex: 1,
                  }}>
                    {agent}
                  </span>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#34D399',
                    flexShrink: 0,
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Card Esta hora */}
          <div style={{
            background: 'var(--ink)',
            borderRadius: 12,
            padding: 20,
          }}>
            <p style={{
              fontFamily: 'var(--f-display)',
              fontSize: 48,
              fontWeight: 700,
              color: recentCount > 0 ? 'var(--lime)' : 'rgba(255,255,255,0.2)',
              lineHeight: 1,
            }}>
              {recentCount}
            </p>
            <p style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 4,
            }}>
              ejecuciones en la última hora
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
