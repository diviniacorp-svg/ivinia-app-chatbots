export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'
import AgentChat from '@/components/dashboard/AgentChat'

const FRANCO = { id: 'franco', nombre: 'Franco', emoji: '💹', rol: 'Contador IA', model: 'sonnet', color: '#FCD34D' }
const MILA   = { id: 'mila',   nombre: 'Mila',   emoji: '🏛️', rol: 'Fiscal AFIP',      model: 'sonnet', color: '#FCD34D' }

async function getFinanzasData() {
  const db = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [metricsRes, runsRes, clientesRes] = await Promise.all([
    db.from('ceo_metrics').select('*').single(),
    db.from('agent_runs').select('cost_ars, created_at, agent, department')
      .gte('created_at', startOfMonth)
      .order('created_at', { ascending: false })
      .limit(100),
    db.from('clients').select('id, company_name, plan, mrr, status, created_at').in('status', ['active', 'activo']),
  ])

  return {
    metrics: metricsRes.data as any,
    runs: (runsRes.data ?? []) as any[],
    clientes: (clientesRes.data ?? []) as any[],
  }
}

const COSTOS_FIJOS = [
  { nombre: 'Vercel Pro', valor: 20, moneda: 'USD', categoria: 'infra' },
  { nombre: 'Supabase Pro', valor: 25, moneda: 'USD', categoria: 'infra' },
  { nombre: 'Anthropic API', valor: 0, moneda: 'USD', categoria: 'ia', nota: 'Variable' },
  { nombre: 'Resend', valor: 0, moneda: 'USD', categoria: 'email', nota: 'Free tier' },
  { nombre: 'Monotributo', valor: 32000, moneda: 'ARS', categoria: 'impuesto' },
]

const USD_ARS = 1200

export default async function FinanzasPage() {
  let data = { metrics: null as any, runs: [] as any[], clientes: [] as any[] }
  try { data = await getFinanzasData() } catch {}

  const mrr = data.metrics?.mrr_actual ?? 0
  const ingresosEstimados = data.metrics?.ingresos_mes ?? mrr
  const costoIAMes = data.metrics?.costo_ia_mes ?? 0

  const totalCostosUSD = COSTOS_FIJOS.filter(c => c.moneda === 'USD').reduce((a, c) => a + c.valor, 0)
  const totalCostosARS = COSTOS_FIJOS.filter(c => c.moneda === 'ARS').reduce((a, c) => a + c.valor, 0)
  const totalCostosEnARS = totalCostosUSD * USD_ARS + totalCostosARS + (costoIAMes ?? 0)
  const margenBruto = ingresosEstimados - totalCostosEnARS

  const mesDDMMYYYY = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  // Próxima fecha de vencimiento monotributo (día 20 del mes actual)
  const hoy = new Date()
  const vencMono = new Date(hoy.getFullYear(), hoy.getMonth(), 20)
  const diasParaMono = Math.ceil((vencMono.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Page header */}
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
              DIVINIA OS · Empresa · {mesDDMMYYYY}
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Finanzas
            </h1>
          </div>
          <Link href="/pagos" style={{
            padding: '9px 18px', borderRadius: 8, border: '1px solid var(--line)',
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--ink)', textDecoration: 'none', background: 'var(--paper)',
          }}>
            Generar pago MP
          </Link>
        </div>
      </div>

      {/* KPI row — 3 main stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        {[
          { label: 'MRR actual', value: mrr > 0 ? `$${Number(mrr).toLocaleString('es-AR')}` : '—', note: 'ARS/mes', accent: mrr > 0 },
          { label: 'Costos fijos', value: `$${Math.round(totalCostosEnARS).toLocaleString('es-AR')}`, note: 'ARS equivalente', accent: false },
          { label: 'Margen bruto', value: `$${Math.round(margenBruto).toLocaleString('es-AR')}`, note: margenBruto > 0 ? 'positivo' : 'negativo', accent: margenBruto > 0 },
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
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: 'var(--muted-2)', marginTop: 4 }}>{k.note}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 1200, margin: '0 auto' }}>

        {/* Costos operativos */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Costos operativos mensuales
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {COSTOS_FIJOS.map(c => (
              <div key={c.nombre} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--line)',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>{c.nombre}</div>
                  {c.nota && <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)' }}>{c.nota}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                    {c.valor > 0 ? `${c.moneda === 'USD' ? 'U$D' : '$'} ${c.valor.toLocaleString('es-AR')}` : '—'}
                  </div>
                  {c.moneda === 'USD' && c.valor > 0 && (
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>
                      ≈ ${(c.valor * USD_ARS).toLocaleString('es-AR')} ARS
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 700 }}>
                TOTAL
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
                ${Math.round(totalCostosEnARS).toLocaleString('es-AR')} ARS
              </div>
            </div>
          </div>
        </div>

        {/* Clientes con MRR */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Clientes activos · MRR
          </div>
          {data.clientes.length === 0 ? (
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', padding: '20px 0' }}>
              No hay clientes activos todavía.{' '}
              <Link href="/clientes" style={{ color: 'var(--lime)', textDecoration: 'none' }}>Agregar clientes →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.clientes.map((c: any) => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--line)',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>{c.company_name}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.plan}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--lime)' }}>
                    ${Number(c.mrr ?? 0).toLocaleString('es-AR')}/mes
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monotributo tracker */}
        <div style={{
          background: diasParaMono <= 5 ? 'rgba(255,80,80,0.06)' : 'var(--paper)',
          border: `1px solid ${diasParaMono <= 5 ? 'rgba(255,80,80,0.3)' : 'var(--line)'}`,
          borderRadius: 12, padding: 24,
        }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Impuestos · Monotributo AFIP
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: diasParaMono <= 5 ? '#f87171' : 'var(--ink)', letterSpacing: '-0.04em' }}>
                {diasParaMono <= 0 ? '⚠ VENCIÓ' : `${diasParaMono} días`}
              </div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>
                Vence el 20 de {new Date().toLocaleDateString('es-AR', { month: 'long' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>$32.000</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>aprox. / mes</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Pagar en AFIP', href: 'https://www.afip.gob.ar/landing/default.asp' },
              { label: 'Mis comprobantes', href: 'https://monotributo.afip.gob.ar' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid var(--line)',
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--ink)', textDecoration: 'none', background: 'var(--paper)',
              }}>
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>

        {/* Últimas ejecuciones IA con costo */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Runs IA este mes · Costo tokens
          </div>
          {data.runs.length === 0 ? (
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', padding: '20px 0' }}>
              Sin ejecuciones este mes todavía.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.runs.slice(0, 8).map((r: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--line)',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)' }}>{r.agent}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {new Date(r.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: r.cost_ars > 0 ? '#f87171' : 'var(--muted-2)' }}>
                    {r.cost_ars > 0 ? `$${Number(r.cost_ars).toFixed(2)}` : '—'}
                  </div>
                </div>
              ))}
              {data.runs.length > 8 && (
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)', paddingTop: 8 }}>
                  +{data.runs.length - 8} ejecuciones más este mes
                </div>
              )}
            </div>
          )}
        </div>

      {/* Agentes financieros */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            Consultores IA del departamento
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
            <AgentChat
              agent={FRANCO}
              suggestions={['¿Cuál es nuestro margen bruto este mes?', 'Analizá los costos de IA', 'Proyectá el MRR para el próximo mes']}
              collapsed={false}
            />
            <AgentChat
              agent={MILA}
              suggestions={['¿Cuándo vence el monotributo?', 'Qué categoría de monotributo corresponde', 'Checklist AFIP del mes']}
              collapsed={true}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
