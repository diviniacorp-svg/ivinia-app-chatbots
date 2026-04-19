'use client'

import { useState, useEffect } from 'react'
import { TURNERO_PLANS, getPlan, formatPrecio } from '@/lib/turnero-plans'

interface Client {
  id: string
  company_name: string
  plan: string
  status: string
  created_at: string
}

function PlanCard({ plan, onVerClientes }: {
  plan: typeof TURNERO_PLANS[0]
  onVerClientes: (planId: string) => void
}) {
  const isLime = plan.color === '#C6FF3D'
  const textColor = isLime ? 'var(--ink)' : plan.color

  return (
    <div style={{
      background: 'var(--paper)',
      borderRadius: 16,
      border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--line)',
      padding: 24,
      position: 'relative',
      flex: 1,
      minWidth: 260,
    }}>
      {plan.popular && (
        <span style={{
          position: 'absolute', top: -12, left: 24,
          fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: plan.color, color: 'var(--ink)',
          borderRadius: 100, padding: '4px 12px', fontWeight: 700,
        }}>
          Mas popular
        </span>
      )}

      <div style={{ marginBottom: 16 }}>
        <h3 style={{
          fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20,
          color: 'var(--ink)', margin: '0 0 4px',
        }}>{plan.nombre}</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>{plan.descripcion}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 28,
            color: textColor,
          }}>
            {formatPrecio(plan.precio)}
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>/mes</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {plan.features.map((feat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              background: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <svg width="8" height="8" fill="none" viewBox="0 0 8 8">
                <path d="M1.5 4l2 2 3-3" stroke={isLime ? '#0E0E0E' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.4 }}>{feat}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onVerClientes(plan.id)}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
          background: plan.popular ? plan.color : 'var(--paper-2)',
          color: plan.popular ? (isLime ? 'var(--ink)' : '#fff') : 'var(--ink)',
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
          textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer',
        }}
      >
        Ver clientes con este plan
      </button>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days}d`
  return `hace ${Math.floor(days / 30)}m`
}

export default function TurneroGestionPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [planFilter, setPlanFilter] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => {
        setClients(d.clients || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const planClients = clients.filter(c =>
    TURNERO_PLANS.some(p => p.id === c.plan)
  )

  const filtered = planFilter ? planClients.filter(c => c.plan === planFilter) : planClients

  const mrr = planClients.reduce((sum, c) => {
    const plan = getPlan(c.plan)
    return sum + (plan?.precio || 0)
  }, 0)

  function handleVerClientes(planId: string) {
    setPlanFilter(current => current === planId ? null : planId)
    setTimeout(() => {
      document.getElementById('clientes-table')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  return (
    <div style={{ padding: '32px 40px', background: 'var(--paper-2)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
          fontSize: 36, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 4px',
        }}>
          Turnero IA
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>
          Gestion de planes y clientes
        </p>
      </div>

      {/* Stats MRR */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Clientes en planes', val: String(planClients.length) },
          { label: 'MRR total', val: formatPrecio(mrr) },
          { label: 'Plan mas popular', val: planClients.length > 0 ? (() => {
            const counts: Record<string,number> = {}
            planClients.forEach(c => { counts[c.plan] = (counts[c.plan]||0)+1 })
            const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]
            return top ? getPlan(top[0])?.nombre || top[0] : '-'
          })() : '-' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', padding: '16px 24px', minWidth: 160 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 6px' }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', margin: 0 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Planes */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', margin: '0 0 20px' }}>
          Los 3 planes
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {TURNERO_PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} onVerClientes={handleVerClientes} />
          ))}
        </div>
      </div>

      {/* Tabla de clientes */}
      <div id="clientes-table">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', margin: 0 }}>
            Clientes activos con plan
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPlanFilter(null)}
              style={{ padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: planFilter === null ? 700 : 400, background: planFilter === null ? 'var(--ink)' : 'var(--paper-2)', color: planFilter === null ? 'var(--paper)' : 'var(--muted)' }}>
              Todos
            </button>
            {TURNERO_PLANS.map(p => (
              <button key={p.id}
                onClick={() => setPlanFilter(current => current === p.id ? null : p.id)}
                style={{ padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: planFilter === p.id ? 700 : 400, background: planFilter === p.id ? p.color : 'var(--paper-2)', color: planFilter === p.id ? (p.color === '#C6FF3D' ? 'var(--ink)' : '#fff') : 'var(--muted)' }}>
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
          {/* Cabecera tabla */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 140px', gap: 0, padding: '10px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
            {['Negocio', 'Plan', 'Desde', 'MRR'].map(h => (
              <p key={h} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0, fontWeight: 700 }}>{h}</p>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>
              Cargando...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>
              {planFilter ? `No hay clientes con plan ${getPlan(planFilter)?.nombre}` : 'Sin clientes con plan pago todavía'}
            </div>
          ) : (
            filtered.map((client, i) => {
              const plan = getPlan(client.plan)
              const isLime = plan?.color === '#C6FF3D'
              return (
                <div key={client.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 140px', gap: 0, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : undefined, alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)', margin: 0 }}>{client.company_name}</p>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: plan?.color || '#6B7280',
                    color: isLime ? 'var(--ink)' : '#fff',
                    borderRadius: 100, padding: '4px 10px', fontWeight: 700,
                    display: 'inline-block',
                  }}>{plan?.nombre || client.plan}</span>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', margin: 0 }}>{timeAgo(client.created_at)}</p>
                  <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: 0 }}>
                    {formatPrecio(plan?.precio || 0)}
                  </p>
                </div>
              )
            })
          )}

          {/* Total MRR */}
          {filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 140px', gap: 0, padding: '14px 20px', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0, fontWeight: 700, gridColumn: '1/4' }}>
                MRR {planFilter ? `(${getPlan(planFilter)?.nombre})` : 'total'}
              </p>
              <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
                {formatPrecio(filtered.reduce((sum, c) => sum + (getPlan(c.plan)?.precio || 0), 0))}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
