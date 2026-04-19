import { createAdminClient } from '@/lib/supabase'
import { TURNERO_PLANS, getPlan } from '@/lib/turnero-plans'

export const dynamic = 'force-dynamic'

interface ClientRow {
  id: string
  name: string
  email: string
  plan: string
  created_at: string
}

function formatMRR(precio: number): string {
  const n = Math.floor(precio / 1000)
  return `$${n}.000`
}

function formatFecha(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function TurneroPage() {
  const db = createAdminClient()

  const { data: rawClients } = await db
    .from('clients')
    .select('id, company_name, email, plan, created_at')
    .order('created_at', { ascending: false })

  const clients: ClientRow[] = (rawClients || []).map((c: {
    id: string
    company_name: string
    email: string
    plan: string | null
    created_at: string
  }) => ({
    id: c.id,
    name: c.company_name,
    email: c.email,
    plan: c.plan || 'starter',
    created_at: c.created_at,
  }))

  const mrr = clients.reduce((sum, c) => {
    const plan = getPlan(c.plan)
    return sum + plan.precio
  }, 0)

  const mrrFormatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(mrr)

  return (
    <div style={{ padding: '32px 40px', background: 'var(--paper)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: '-0.03em',
          color: 'var(--ink)',
          margin: 0,
        }}>
          Turnero IA
        </h1>
        <p style={{
          fontFamily: 'var(--f-display)',
          fontStyle: 'italic',
          fontSize: 16,
          color: 'var(--muted)',
          marginTop: 6,
        }}>
          Gestión de planes y suscripciones
        </p>
      </div>

      {/* Planes — 3 columnas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 48,
      }}>
        {TURNERO_PLANS.map(plan => (
          <div
            key={plan.id}
            style={{
              background: 'var(--paper-2)',
              border: plan.popular ? '2px solid var(--lime)' : '1px solid var(--line)',
              borderRadius: 16,
              padding: 28,
            }}
          >
            {/* Header del card */}
            <div>
              {plan.popular && (
                <span style={{
                  background: 'var(--lime)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderRadius: 100,
                  padding: '4px 12px',
                  display: 'inline-block',
                  marginBottom: 12,
                }}>
                  Más popular
                </span>
              )}
              <p style={{
                fontFamily: 'var(--f-display)',
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                {plan.nombre}
              </p>
              <p style={{
                fontFamily: 'var(--f-display)',
                fontSize: 14,
                color: 'var(--muted)',
                marginTop: 4,
                marginBottom: 20,
              }}>
                {plan.descripcion}
              </p>
            </div>

            {/* Precio */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{
                fontFamily: 'var(--f-display)',
                fontSize: 40,
                fontWeight: 800,
                color: 'var(--ink)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>
                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(plan.precio)}
              </span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--muted)' }}>
                /mes
              </span>
            </div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', marginTop: 2, marginBottom: 20 }}>
              ARS
            </p>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--line)', margin: '20px 0' }} />

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {plan.features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 12,
                    color: 'var(--lime)',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    ✓
                  </span>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sección clientes */}
      <div style={{ marginTop: 16 }}>
        <p style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          color: 'var(--muted)',
          letterSpacing: '0.08em',
          marginBottom: 16,
        }}>
          Clientes activos por plan
        </p>

        <div style={{ background: 'var(--paper-2)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header de la tabla */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '12px 20px',
            borderBottom: '1px solid var(--line)',
          }}>
            {['Negocio', 'Plan', 'Desde', 'MRR'].map(col => (
              <span key={col} style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                color: 'var(--muted)',
                letterSpacing: '0.06em',
              }}>
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {clients.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>
              Sin clientes todavía
            </div>
          ) : (
            clients.map((client, i) => {
              const plan = getPlan(client.plan)
              const isLast = i === clients.length - 1
              const isLime = plan.color === '#C6FF3D'
              return (
                <div
                  key={client.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '14px 20px',
                    borderBottom: isLast ? 'none' : '1px solid var(--line)',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)', margin: 0, fontWeight: 600 }}>
                      {client.name}
                    </p>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>
                      {client.email}
                    </p>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderRadius: 100,
                      padding: '3px 10px',
                      background: plan.color + '22',
                      color: isLime ? 'var(--ink)' : plan.color,
                      fontWeight: 700,
                    }}>
                      {plan.nombre}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)', margin: 0 }}>
                    {formatFecha(client.created_at)}
                  </p>
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)', margin: 0, fontWeight: 600 }}>
                    {formatMRR(plan.precio)}
                  </p>
                </div>
              )
            })
          )}

          {/* Footer MRR total */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--line)',
            textAlign: 'right',
            background: 'var(--paper)',
          }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
              MRR Total: {mrrFormatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
