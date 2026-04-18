'use client'
import { useState } from 'react'
import { Search, Mail, MessageCircle, Globe, Phone } from 'lucide-react'

interface Lead {
  id?: string
  company_name: string
  phone: string
  email: string
  website: string
  city: string
  rubro: string
  score: number
  status?: string
  address?: string
}

const RUBROS = [
  'restaurante', 'clinica', 'inmobiliaria', 'gimnasio',
  'contabilidad', 'farmacia', 'peluqueria', 'taller', 'otro'
]

const CIUDADES = [
  'San Luis', 'Villa Mercedes', 'Buenos Aires', 'Córdoba', 'Mendoza',
  'Rosario', 'Tucumán', 'Salta', 'Mar del Plata', 'Otra ciudad'
]

function ScoreBadge({ score }: { score: number }) {
  const style: React.CSSProperties = score >= 70
    ? { background: 'var(--lime)', color: 'var(--ink)' }
    : score >= 40
    ? { background: 'rgba(251,146,60,0.2)', color: 'var(--ink)' }
    : { background: 'var(--paper-2)', color: 'var(--ink)' }

  return (
    <span style={{
      ...style,
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 100,
      padding: '3px 10px',
    }}>
      {score}pts
    </span>
  )
}

export default function LeadsPage() {
  const [rubro, setRubro] = useState('restaurante')
  const [city, setCity] = useState('San Luis')
  const [maxItems, setMaxItems] = useState(20)
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [savingLeads, setSavingLeads] = useState(false)

  async function scrape() {
    setLoading(true)
    setError('')
    setLeads([])
    setSelected(new Set())
    try {
      const res = await fetch('/api/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubro, city, maxItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al buscar leads')
      setLeads(data.leads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function saveSelected() {
    if (selected.size === 0) return
    setSavingLeads(true)
    const toSave = leads.filter((_, i) => selected.has(i))
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toSave }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      alert(`${toSave.length} leads guardados en el CRM`)
      setSelected(new Set())
    } catch {
      alert('Error al guardar leads')
    } finally {
      setSavingLeads(false)
    }
  }

  function toggleAll() {
    if (selected.size === leads.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(leads.map((_, i) => i)))
    }
  }

  const selectStyle: React.CSSProperties = {
    width: '100%', border: '1px solid var(--line)', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, outline: 'none',
    background: 'var(--paper)', color: 'var(--ink)',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6,
  }

  return (
    <div style={{ padding: '32px 40px', background: 'var(--paper-2)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
          fontSize: 36, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0,
        }}>Buscador de Leads</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, fontFamily: 'var(--f-mono)' }}>
          Encontrá negocios potenciales con Apify
        </p>
      </div>

      {/* Search form */}
      <div style={{
        background: 'var(--paper)', borderRadius: 12, padding: 24,
        border: '1px solid var(--line)', marginBottom: 24,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16 }}>
          <div>
            <label style={labelStyle}>Rubro</label>
            <select value={rubro} onChange={e => setRubro(e.target.value)} style={selectStyle}>
              {RUBROS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <select value={city} onChange={e => setCity(e.target.value)} style={selectStyle}>
              {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cantidad</label>
            <select value={maxItems} onChange={e => setMaxItems(Number(e.target.value))} style={selectStyle}>
              <option value={10}>10 resultados</option>
              <option value={20}>20 resultados</option>
              <option value={50}>50 resultados</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={scrape}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--ink)', color: 'var(--paper)', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontFamily: 'var(--f-mono)',
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap',
              }}>
              <Search size={14} />
              {loading ? 'Buscando...' : 'Buscar leads'}
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ marginTop: 16, textAlign: 'center', padding: '32px 0' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, border: '3px solid var(--line)', borderTopColor: 'var(--ink)',
                borderRadius: '50%', animation: 'spin 1s linear infinite',
              }} />
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Apify está buscando negocios en Google Maps...</p>
              <p style={{ color: 'var(--muted)', fontSize: 11 }}>Puede tardar 1-2 minutos</p>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 16, background: '#fee2e2', border: '1px solid #fca5a5',
            color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 13,
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {leads.length > 0 && (
        <div style={{
          background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden',
        }}>
          {/* Table header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1px solid var(--line)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                checked={selected.size === leads.length}
                onChange={toggleAll}
                style={{ width: 16, height: 16 }}
              />
              <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13, margin: 0 }}>
                {leads.length} leads encontrados
                {selected.size > 0 && (
                  <span style={{ color: 'var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>
                    {' '}· {selected.size} seleccionados
                  </span>
                )}
              </p>
            </div>
            {selected.size > 0 && (
              <button
                onClick={saveSelected}
                disabled={savingLeads}
                style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                  textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--paper)',
                  border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                  opacity: savingLeads ? 0.5 : 1,
                }}>
                {savingLeads ? 'Guardando...' : `Guardar ${selected.size} en CRM`}
              </button>
            )}
          </div>

          {/* Lead rows */}
          <div>
            {leads.map((lead, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '16px 24px', borderBottom: i < leads.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => {
                    const next = new Set(selected)
                    next.has(i) ? next.delete(i) : next.add(i)
                    setSelected(next)
                  }}
                  style={{ width: 16, height: 16, marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13, margin: 0 }}>{lead.company_name}</p>
                      {lead.address && (
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{lead.address}</p>
                      )}
                    </div>
                    <ScoreBadge score={lead.score} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    {lead.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
                        <Phone size={11} /> {lead.phone}
                      </span>
                    )}
                    {lead.email && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
                        <Mail size={11} /> {lead.email}
                      </span>
                    )}
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink)', textDecoration: 'none' }}>
                        <Globe size={11} /> Web
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {lead.email && (
                    <a
                      href={`/outreach?email=${encodeURIComponent(lead.email)}&company=${encodeURIComponent(lead.company_name)}&rubro=${lead.rubro}&city=${lead.city}`}
                      style={{
                        padding: 6, color: 'var(--muted)', borderRadius: 8,
                        display: 'flex', alignItems: 'center', textDecoration: 'none',
                      }}
                      title="Enviar email">
                      <Mail size={15} />
                    </a>
                  )}
                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hola%2C%20soy%20Joaco%20de%20DIVINIA`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        padding: 6, color: 'var(--muted)', borderRadius: 8,
                        display: 'flex', alignItems: 'center', textDecoration: 'none',
                      }}
                      title="WhatsApp">
                      <MessageCircle size={15} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
