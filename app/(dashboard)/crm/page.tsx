'use client'
import { useState, useEffect } from 'react'
import { Phone, Mail, ChevronDown } from 'lucide-react'

interface Lead {
  id: string
  company_name: string
  email: string
  phone: string
  rubro: string
  city: string
  score: number
  status: string
  notes: string
  updated_at: string
}

const STATUSES = [
  { key: 'nuevo',       label: 'Nuevo' },
  { key: 'contactado',  label: 'Contactado' },
  { key: 'propuesta',   label: 'Propuesta' },
  { key: 'negociacion', label: 'Negociación' },
  { key: 'cerrado',     label: 'Cerrado ✓' },
  { key: 'perdido',     label: 'Perdido' },
]

function ScoreBadge({ score }: { score: number }) {
  const style: React.CSSProperties = score >= 70
    ? { background: 'var(--lime)', color: 'var(--ink)' }
    : score >= 40
    ? { background: 'rgba(251,146,60,0.2)', color: 'var(--ink)' }
    : { background: 'var(--paper-2)', color: 'var(--muted)' }
  return (
    <span style={{
      ...style,
      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
      borderRadius: 100, padding: '2px 8px',
    }}>
      {score}
    </span>
  )
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch { /* error silencioso */ }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } catch { /* error silencioso */ }
    setUpdating(null)
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = leads.filter(l => l.status === s.key).length
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div style={{ padding: '32px 40px', background: 'var(--paper-2)', minHeight: '100vh' }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>Cargando CRM...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 40px', background: 'var(--paper-2)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
          fontSize: 36, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0,
        }}>CRM</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, fontFamily: 'var(--f-mono)' }}>
          Pipeline de ventas y seguimiento de leads
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            fontFamily: 'var(--f-mono)', letterSpacing: '0.04em', border: '1px solid var(--line)',
            cursor: 'pointer', transition: 'all 0.15s',
            background: filter === 'all' ? 'var(--ink)' : 'var(--paper)',
            color: filter === 'all' ? 'var(--paper)' : 'var(--muted-2)',
          }}>
          Todos ({leads.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--f-mono)', letterSpacing: '0.04em', border: '1px solid var(--line)',
              cursor: 'pointer', transition: 'all 0.15s',
              background: filter === s.key ? 'var(--ink)' : 'var(--paper)',
              color: filter === s.key ? 'var(--paper)' : 'var(--muted-2)',
            }}>
            {s.label} ({counts[s.key] || 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)',
          padding: '48px 40px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>
            {leads.length === 0
              ? 'No hay leads en el CRM. Buscá con Apify en la sección Leads.'
              : 'No hay leads con este estado.'}
          </p>
        </div>
      ) : filter === 'all' ? (
        /* Kanban view when showing all */
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {STATUSES.map(col => {
            const colLeads = leads.filter(l => l.status === col.key)
            if (colLeads.length === 0) return null
            return (
              <div key={col.key} style={{
                background: 'var(--paper-2)', borderRadius: 12, border: '1px solid var(--line)',
                minWidth: 240, maxWidth: 280, flex: '0 0 260px', padding: '16px 12px',
              }}>
                {/* Column header */}
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>{col.label}</span>
                  <span style={{
                    background: 'var(--paper)', border: '1px solid var(--line)',
                    borderRadius: 100, padding: '1px 8px', fontSize: 10,
                  }}>{colLeads.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colLeads.map(lead => (
                    <div key={lead.id} style={{
                      background: 'var(--paper)', border: '1px solid var(--line)',
                      borderRadius: 8, padding: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13, margin: 0, lineHeight: 1.3 }}>{lead.company_name}</p>
                        <ScoreBadge score={lead.score} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 8px', fontFamily: 'var(--f-mono)' }}>
                        {lead.city} · {lead.rubro}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {lead.phone && (
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--muted)', display: 'flex' }}>
                            <Phone size={13} />
                          </a>
                        )}
                        {lead.email && (
                          <a href={`/outreach?email=${lead.email}&company=${encodeURIComponent(lead.company_name)}&rubro=${lead.rubro}&city=${lead.city}`}
                            style={{ color: 'var(--muted)', display: 'flex' }}>
                            <Mail size={13} />
                          </a>
                        )}
                        <div style={{ marginLeft: 'auto', position: 'relative' }}>
                          <select
                            value={lead.status}
                            onChange={e => updateStatus(lead.id, e.target.value)}
                            disabled={updating === lead.id}
                            style={{
                              fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em',
                              textTransform: 'uppercase', background: 'var(--paper-2)',
                              border: '1px solid var(--line)', borderRadius: 6,
                              padding: '4px 20px 4px 8px', color: 'var(--ink)',
                              cursor: 'pointer', appearance: 'none',
                            }}>
                            {STATUSES.map(s => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={9} style={{
                            position: 'absolute', right: 5, top: '50%',
                            transform: 'translateY(-50%)', pointerEvents: 'none',
                            color: 'var(--muted)',
                          }} />
                        </div>
                      </div>
                      <a
                        href={`/clientes?lead=${lead.id}&company=${encodeURIComponent(lead.company_name)}&email=${lead.email}&phone=${lead.phone}`}
                        style={{
                          display: 'block', marginTop: 8, fontFamily: 'var(--f-mono)',
                          fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'var(--ink)', textDecoration: 'none', fontWeight: 700,
                        }}>
                        + Convertir a cliente →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table view when filtering by status */
        <div style={{
          background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Empresa', 'Rubro', 'Contacto', 'Score', 'Estado', ''].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '12px 20px',
                      fontFamily: 'var(--f-mono)', fontSize: 10,
                      letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)',
                      fontWeight: 400,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13, margin: 0 }}>{lead.company_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, fontFamily: 'var(--f-mono)' }}>{lead.city}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 12, color: 'var(--muted-2)', textTransform: 'capitalize' }}>{lead.rubro}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {lead.phone && (
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--muted)', display: 'flex' }}>
                            <Phone size={13} />
                          </a>
                        )}
                        {lead.email && (
                          <a href={`/outreach?email=${lead.email}&company=${encodeURIComponent(lead.company_name)}&rubro=${lead.rubro}&city=${lead.city}`}
                            style={{ color: 'var(--muted)', display: 'flex' }}>
                            <Mail size={13} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          disabled={updating === lead.id}
                          style={{
                            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                            textTransform: 'uppercase', background: 'var(--paper-2)',
                            border: '1px solid var(--line)', borderRadius: 8,
                            padding: '6px 24px 6px 10px', color: 'var(--ink)',
                            cursor: 'pointer', appearance: 'none',
                          }}>
                          {STATUSES.map(s => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={10} style={{
                          position: 'absolute', right: 6, top: '50%',
                          transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)',
                        }} />
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <a
                        href={`/clientes?lead=${lead.id}&company=${encodeURIComponent(lead.company_name)}&email=${lead.email}&phone=${lead.phone}`}
                        style={{
                          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                          textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 700,
                          textDecoration: 'none', whiteSpace: 'nowrap',
                        }}>
                        + Cliente
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
