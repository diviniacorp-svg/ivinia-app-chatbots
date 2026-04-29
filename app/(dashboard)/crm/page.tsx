'use client'
import { useState, useEffect } from 'react'
import { Phone, Mail, MessageCircle, FileText, UserPlus, Trash2, ChevronDown, SlidersHorizontal, Search } from 'lucide-react'
import Link from 'next/link'

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
  created_at: string
}

const STATUSES = [
  { key: 'nuevo',       label: 'Nuevo',       color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  { key: 'contactado',  label: 'Contactado',  color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  { key: 'propuesta',   label: 'Propuesta',   color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
  { key: 'negociacion', label: 'Negociación', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  { key: 'cerrado',     label: 'Cerrado ✓',  color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
  { key: 'perdido',     label: 'Perdido',     color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
]

function getStatus(key: string) {
  return STATUSES.find(s => s.key === key) ?? STATUSES[0]
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 70 ? '#C6FF3D' : score >= 40 ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.07)'
  const color = score >= 70 ? '#09090B' : score >= 40 ? '#FB923C' : '#71717A'
  return (
    <span style={{
      background: bg, color,
      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
      borderRadius: 100, padding: '2px 8px', flexShrink: 0,
    }}>
      {score}
    </span>
  )
}

function waLink(phone: string) {
  const clean = phone.replace(/\D/g, '')
  const num = clean.startsWith('549') ? clean : clean.startsWith('54') ? clean : `549${clean}`
  return `https://wa.me/${num}`
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch { /* silencioso */ }
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
    } catch { /* silencioso */ }
    setUpdating(null)
  }

  async function deleteLead(id: string) {
    if (!confirm('¿Eliminar este lead del CRM?')) return
    setDeleting(id)
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
    } catch { /* silencioso */ }
    setDeleting(null)
  }

  const filtered = leads
    .filter(l => filter === 'all' || l.status === filter)
    .filter(l => !search || l.company_name.toLowerCase().includes(search.toLowerCase()) || l.rubro?.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()))

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = leads.filter(l => l.status === s.key).length
    return acc
  }, {} as Record<string, number>)

  const totalPipeline = leads.filter(l => !['perdido', 'cerrado'].includes(l.status)).length
  const calientes = leads.filter(l => l.score >= 70).length
  const cerrados = leads.filter(l => l.status === 'cerrado').length

  if (loading) {
    return (
      <div style={{ padding: '32px 40px', background: 'var(--paper-2)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>Cargando CRM...</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--paper-2)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
              DIVINIA OS · Ventas
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0 }}>
              CRM
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/leads" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--ink)', textDecoration: 'none', background: 'var(--paper)',
            }}>
              🎯 Buscar leads
            </Link>
            <Link href="/comercial" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--paper)', textDecoration: 'none', background: 'var(--ink)',
            }}>
              🔥 Pipeline comercial
            </Link>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Total leads', value: leads.length, color: 'var(--ink)' },
            { label: 'En pipeline', value: totalPipeline, color: '#60A5FA' },
            { label: 'Score ≥ 70', value: calientes, color: '#C6FF3D' },
            { label: 'Cerrados', value: cerrados, color: '#4ADE80' },
          ].map(k => (
            <div key={k.label}>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 22, color: k.color, letterSpacing: '-0.02em' }}>{k.value}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '16px 28px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: 200, maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar empresa, rubro, ciudad..."
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8,
              fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--ink)',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button onClick={() => setFilter('all')} style={{
            padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600,
            fontFamily: 'var(--f-mono)', letterSpacing: '0.04em', border: '1px solid var(--line)',
            cursor: 'pointer', background: filter === 'all' ? 'var(--ink)' : 'var(--paper)',
            color: filter === 'all' ? 'var(--paper)' : 'var(--muted-2)',
          }}>
            Todos ({leads.length})
          </button>
          {STATUSES.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)} style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600,
              fontFamily: 'var(--f-mono)', letterSpacing: '0.04em',
              border: filter === s.key ? `1.5px solid ${s.color}` : '1px solid var(--line)',
              cursor: 'pointer',
              background: filter === s.key ? s.bg : 'var(--paper)',
              color: filter === s.key ? s.color : 'var(--muted-2)',
            }}>
              {s.label} ({counts[s.key] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 28px 32px' }}>
        {filtered.length === 0 ? (
          <div style={{
            background: 'var(--paper)', borderRadius: 12, border: '1px dashed var(--line)',
            padding: '48px 40px', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              {leads.length === 0 ? 'Sin leads en el CRM.' : 'Sin leads con este filtro.'}
            </p>
            <Link href="/leads" style={{
              display: 'inline-block', marginTop: 12, padding: '8px 20px',
              background: 'var(--ink)', color: 'var(--paper)', borderRadius: 8,
              fontFamily: 'var(--f-mono)', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.06em', textDecoration: 'none',
            }}>
              🎯 Buscar leads con Apify
            </Link>
          </div>
        ) : filter === 'all' ? (
          /* ── Kanban ─────────────────────────────────── */
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {STATUSES.map(col => {
              const colLeads = filtered.filter(l => l.status === col.key)
              if (colLeads.length === 0) return null
              return (
                <div key={col.key} style={{
                  background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)',
                  minWidth: 250, maxWidth: 280, flex: '0 0 265px', padding: '14px 12px',
                }}>
                  {/* Column header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.color, boxShadow: `0 0 6px ${col.color}66` }} />
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        {col.label}
                      </span>
                    </div>
                    <span style={{
                      background: col.bg, color: col.color,
                      borderRadius: 100, padding: '1px 8px', fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700,
                    }}>{colLeads.length}</span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {colLeads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        updating={updating === lead.id}
                        deleting={deleting === lead.id}
                        expandedNotes={expandedNotes === lead.id}
                        onToggleNotes={() => setExpandedNotes(n => n === lead.id ? null : lead.id)}
                        onStatusChange={s => updateStatus(lead.id, s)}
                        onDelete={() => deleteLead(lead.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ── Table (filter activo) ──────────────────── */
          <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden' }}>
            {filtered.map((lead, i) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                last={i === filtered.length - 1}
                updating={updating === lead.id}
                deleting={deleting === lead.id}
                onStatusChange={s => updateStatus(lead.id, s)}
                onDelete={() => deleteLead(lead.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────── */
/* KANBAN CARD                                                          */
/* ──────────────────────────────────────────────────────────────────── */
function LeadCard({ lead, updating, deleting, expandedNotes, onToggleNotes, onStatusChange, onDelete }: {
  lead: Lead
  updating: boolean
  deleting: boolean
  expandedNotes: boolean
  onToggleNotes: () => void
  onStatusChange: (s: string) => void
  onDelete: () => void
}) {
  const st = getStatus(lead.status)

  return (
    <div style={{
      background: 'var(--paper-2)', border: '1px solid var(--line)',
      borderRadius: 9, padding: '11px 11px 9px', position: 'relative',
    }}>
      {/* Top row: name + score */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
        <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 12.5, margin: 0, lineHeight: 1.35 }}>
          {lead.company_name}
        </p>
        <ScoreBadge score={lead.score} />
      </div>

      {/* Meta */}
      <p style={{ fontSize: 10, color: 'var(--muted)', margin: '0 0 8px', fontFamily: 'var(--f-mono)' }}>
        {[lead.city, lead.rubro].filter(Boolean).join(' · ')}
      </p>

      {/* Notes preview */}
      {lead.notes && (
        <div style={{ marginBottom: 8 }}>
          <button onClick={onToggleNotes} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--muted)', textAlign: 'left', width: '100%',
          }}>
            {expandedNotes ? lead.notes : `📝 ${lead.notes.slice(0, 55)}${lead.notes.length > 55 ? '…' : ''}`}
          </button>
        </div>
      )}

      {/* Status selector */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <select
          value={lead.status}
          onChange={e => onStatusChange(e.target.value)}
          disabled={updating}
          style={{
            width: '100%', fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '0.05em',
            background: st.bg, border: `1px solid ${st.color}44`,
            borderRadius: 6, padding: '5px 22px 5px 8px', color: st.color,
            cursor: 'pointer', appearance: 'none', outline: 'none',
          }}
        >
          {STATUSES.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <ChevronDown size={9} style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: st.color,
        }} />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {lead.phone && (
          <a
            href={waLink(lead.phone)}
            target="_blank" rel="noopener noreferrer"
            title="WhatsApp"
            style={actionBtn('#25D366', true)}
          >
            <MessageCircle size={11} />
          </a>
        )}
        {lead.email && (
          <Link
            href={`/outreach?email=${encodeURIComponent(lead.email)}&company=${encodeURIComponent(lead.company_name)}&rubro=${encodeURIComponent(lead.rubro || '')}&city=${encodeURIComponent(lead.city || '')}`}
            title="Outreach con IA"
            style={actionBtn('#6366F1', true)}
          >
            <Mail size={11} />
          </Link>
        )}
        <Link
          href={`/comercial?leadId=${lead.id}`}
          title="Trabajar en Pipeline"
          style={{ ...actionBtn('var(--ink)', false), flex: 1, justifyContent: 'center' }}
        >
          <FileText size={11} />
          <span style={{ fontSize: 9.5, fontFamily: 'var(--f-mono)', letterSpacing: '0.05em' }}>Pipeline</span>
        </Link>
        <Link
          href={`/clientes?lead=${lead.id}&company=${encodeURIComponent(lead.company_name)}&email=${encodeURIComponent(lead.email || '')}&phone=${encodeURIComponent(lead.phone || '')}`}
          title="Convertir a cliente"
          style={actionBtn('#C6FF3D', false)}
        >
          <UserPlus size={11} style={{ color: '#09090B' }} />
        </Link>
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Eliminar lead"
          style={{ ...actionBtn('#F87171', true), border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────── */
/* TABLE ROW (filtered view)                                            */
/* ──────────────────────────────────────────────────────────────────── */
function LeadRow({ lead, last, updating, deleting, onStatusChange, onDelete }: {
  lead: Lead
  last: boolean
  updating: boolean
  deleting: boolean
  onStatusChange: (s: string) => void
  onDelete: () => void
}) {
  const st = getStatus(lead.status)

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 110px 100px 90px auto',
      alignItems: 'center', gap: 12,
      padding: '12px 20px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      {/* Company */}
      <div>
        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13 }}>{lead.company_name}</div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--muted)', marginTop: 1 }}>
          {[lead.city, lead.rubro].filter(Boolean).join(' · ')}
        </div>
        {lead.notes && (
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>
            {lead.notes.slice(0, 60)}{lead.notes.length > 60 ? '…' : ''}
          </div>
        )}
      </div>

      {/* Score */}
      <ScoreBadge score={lead.score} />

      {/* Status */}
      <div style={{ position: 'relative' }}>
        <select
          value={lead.status}
          onChange={e => onStatusChange(e.target.value)}
          disabled={updating}
          style={{
            width: '100%', fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '0.05em',
            background: st.bg, border: `1px solid ${st.color}44`,
            borderRadius: 6, padding: '5px 22px 5px 8px', color: st.color,
            cursor: 'pointer', appearance: 'none', outline: 'none',
          }}
        >
          {STATUSES.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <ChevronDown size={9} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: st.color }} />
      </div>

      {/* Contact shortcuts */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {lead.phone && (
          <a href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', display: 'flex' }} title="WhatsApp">
            <MessageCircle size={14} />
          </a>
        )}
        {lead.email && (
          <Link href={`/outreach?email=${encodeURIComponent(lead.email)}&company=${encodeURIComponent(lead.company_name)}&rubro=${encodeURIComponent(lead.rubro || '')}`} style={{ color: '#6366F1', display: 'flex' }} title="Outreach">
            <Mail size={14} />
          </Link>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Link href={`/comercial?leadId=${lead.id}`} style={{
          fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--paper)', background: 'var(--ink)', borderRadius: 6, padding: '5px 10px',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          Pipeline →
        </Link>
        <Link href={`/clientes?lead=${lead.id}&company=${encodeURIComponent(lead.company_name)}&email=${encodeURIComponent(lead.email || '')}&phone=${encodeURIComponent(lead.phone || '')}`} style={{
          fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--ink)', background: '#C6FF3D', borderRadius: 6, padding: '5px 10px',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Cliente
        </Link>
        <button onClick={onDelete} disabled={deleting} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#F87171', display: 'flex', padding: 4,
        }} title="Eliminar">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────── */
/* HELPERS                                                              */
/* ──────────────────────────────────────────────────────────────────── */
function actionBtn(color: string, icon: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: icon ? '5px 7px' : '5px 9px',
    borderRadius: 6, border: 'none', cursor: 'pointer',
    background: color === 'var(--ink)' ? 'var(--ink)' : color === '#C6FF3D' ? '#C6FF3D' : `${color}18`,
    color: color === 'var(--ink)' ? 'var(--paper)' : color === '#C6FF3D' ? '#09090B' : color,
    textDecoration: 'none', fontSize: 11, flexShrink: 0,
  }
}
