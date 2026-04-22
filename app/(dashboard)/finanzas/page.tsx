export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'

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
    db.from('clients').select('id, nombre, plan, mrr, status, created_at').eq('status', 'activo'),
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

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              09 — CONTABILIDAD & FINANZAS
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              Finanzas DIVINIA
            </h1>
            <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)' }}>
              {mesDDMMYYYY} · MRR real desde Supabase
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/pagos" style={{
              padding: '9px 18px', borderRadius: 8, border: '1px solid var(--line)',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--ink)', textDecoration: 'none', background: 'var(--paper)',
            }}>
              Generar pago MP
            </Link>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
        {[
          { label: 'MRR actual', value: `$${Number(mrr).toLocaleString('es-AR')}`, accent: mrr > 0, note: 'ARS/mes' },
          { label: 'Ingresos mes', value: `$${Number(ingresosEstimados).toLocaleString('es-AR')}`, accent: ingresosEstimados > 0, note: 'estimado' },
          { label: 'Costos fijos', value: `$${Math.round(totalCostosEnARS).toLocaleString('es-AR')}`, accent: false, note: 'ARS equivalente' },
          { label: 'Costo IA mes', value: costoIAMes > 0 ? `$${Number(costoIAMes).toLocaleString('es-AR')}` : '—', accent: false, note: 'tokens Claude' },
          { label: 'Margen bruto', value: `$${Math.round(margenBruto).toLocaleString('es-AR')}`, accent: margenBruto > 0, note: margenBruto > 0 ? '✓ positivo' : '⚠ negativo' },
          { label: 'Clientes activos', value: data.clientes.length || data.metrics?.clientes_activos || '—', accent: false, note: 'con MRR' },
        ].map((k, i, arr) => (
          <div key={k.label} style={{
            flex: '0 0 auto', minWidth: 140, padding: '20px 24px',
            borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
              fontSize: 26, letterSpacing: '-0.04em', lineHeight: 1,
              color: k.accent ? 'var(--lime)' : 'var(--ink)', marginBottom: 4,
            }}>{k.value}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>{k.note}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

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
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>{c.nombre}</div>
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

      </div>
    </div>
  )
}
