'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Inquiry = {
  id: string; name: string; email: string; phone?: string
  message: string; status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED'
  createdAt: string; response?: string | null
  package?: { title: string } | null
}

type Reservation = {
  id: string; code: string; status: string
  package: { title: string; slug: string }
  user: { firstName: string; lastName: string; email: string }
  totalPassengers: number
  travelStartDate?: string | null; travelEndDate?: string | null
  totalPriceArs?: number | null; createdAt: string
  _count?: { passengers: number }
}

type Package = {
  id: string; title: string; slug: string
  basePriceUsd: number; nights: number; status: string; isFeatured: boolean
  images: Array<{ url: string }>
  destinations: Array<{ destination: { name: string } }>
}

type Stats = {
  pendingInquiries: number
  activeReservations: number
  publishedPackages: number
  totalInquiries: number
}

// ─── Status configs ───────────────────────────────────────────────────────────

const INQUIRY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'Sin responder', color: '#ea580c', bg: '#ea580c22' },
  IN_PROGRESS: { label: 'En proceso',    color: '#2563eb', bg: '#2563eb22' },
  RESOLVED:    { label: 'Respondida',    color: '#16a34a', bg: '#16a34a22' },
  ARCHIVED:    { label: 'Archivada',     color: '#6b7280', bg: '#6b728022' },
}

const RES_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:           { label: 'Borrador',     color: '#6b7280', bg: '#6b728022' },
  PENDING:         { label: 'Pendiente',    color: '#ca8a04', bg: '#ca8a0422' },
  CONFIRMED:       { label: 'Confirmada',   color: '#16a34a', bg: '#16a34a22' },
  PARTIALLY_PAID:  { label: 'Pago parcial', color: '#2563eb', bg: '#2563eb22' },
  PAID:            { label: 'Pagada',       color: '#059669', bg: '#05966922' },
  COMPLETED:       { label: 'Completada',   color: '#7c3aed', bg: '#7c3aed22' },
  CANCELLED:       { label: 'Cancelada',    color: '#dc2626', bg: '#dc262622' },
}

const PKG_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED: { label: 'Publicado',  color: '#16a34a', bg: '#16a34a22' },
  DRAFT:     { label: 'Borrador',   color: '#ca8a04', bg: '#ca8a0422' },
  ARCHIVED:  { label: 'Archivado',  color: '#6b7280', bg: '#6b728022' },
  SOLD_OUT:  { label: 'Sin cupos',  color: '#dc2626', bg: '#dc262622' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ago(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000
  if (d < 60) return 'ahora'
  if (d < 3600) return `hace ${Math.floor(d / 60)}min`
  if (d < 86400) return `hace ${Math.floor(d / 3600)}h`
  if (d < 86400 * 7) return `hace ${Math.floor(d / 86400)}d`
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function Badge({ status, map }: { status: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const s = map[status] ?? { label: status, color: '#9ca3af', bg: '#9ca3af22' }
  return (
    <span style={{
      fontSize: 11, padding: '3px 9px', borderRadius: 20,
      color: s.color, background: s.bg, fontWeight: 600,
    }}>{s.label}</span>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function BuggiNucleusClient({
  clientId, companyName, pin, color, publicUrl,
}: {
  clientId: string; companyName: string; pin: string; color: string; publicUrl: string
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinErr, setPinErr] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(`nucleus-${clientId}`) === 'ok') setUnlocked(true)
  }, [clientId])

  function tryPin() {
    if (pinInput === pin) {
      setUnlocked(true)
      sessionStorage.setItem(`nucleus-${clientId}`, 'ok')
    } else {
      setPinErr(true)
      setPinInput('')
      setTimeout(() => setPinErr(false), 2000)
    }
  }

  if (!unlocked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14', fontFamily: 'system-ui' }}>
      <div style={{ background: '#0d1829', border: '1px solid #1e2a3a', borderRadius: 20, padding: '40px 36px', width: 340, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: color + '22', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 20px' }}>✈️</div>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a6080', marginBottom: 6 }}>Panel privado</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 28 }}>{companyName}</div>
        <input
          type="password" maxLength={8} value={pinInput}
          onChange={e => setPinInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryPin()}
          placeholder="PIN de acceso"
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${pinErr ? '#ef4444' : '#1e2a3a'}`, background: '#060a10', color: '#fff', fontSize: 16, textAlign: 'center', letterSpacing: '0.3em', outline: 'none', boxSizing: 'border-box', marginBottom: 12, transition: 'border-color .2s' }}
          autoFocus
        />
        {pinErr && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 10 }}>PIN incorrecto</div>}
        <button onClick={tryPin} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Ingresar →
        </button>
      </div>
    </div>
  )

  return <BuggiAdminPanel clientId={clientId} companyName={companyName} color={color} publicUrl={publicUrl} />
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

type Tab = 'resumen' | 'consultas' | 'reservas' | 'paquetes' | 'guia'

function BuggiAdminPanel({ companyName, color, publicUrl }: {
  clientId: string; companyName: string; color: string; publicUrl: string
}) {
  const [tab, setTab] = useState<Tab>('resumen')
  const [stats, setStats] = useState<Stats | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState<Record<Tab, boolean>>({ resumen: false, consultas: false, reservas: false, paquetes: false, guia: false })
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [aiResp, setAiResp] = useState<Record<string, string>>({})
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null)
  const [iSearch, setISearch] = useState('')
  const [iFilter, setIFilter] = useState('all')

  const setLoad = (t: Tab, v: boolean) => setLoading(prev => ({ ...prev, [t]: v }))

  const fetchInquiries = useCallback(async () => {
    setLoad('consultas', true)
    try {
      const r = await fetch('/api/buggi/inquiries?limit=50')
      if (r.ok) { const d = await r.json(); setInquiries(d.inquiries ?? []) }
    } finally { setLoad('consultas', false) }
  }, [])

  const fetchReservations = useCallback(async () => {
    setLoad('reservas', true)
    try {
      const r = await fetch('/api/buggi/reservations?limit=50')
      if (r.ok) { const d = await r.json(); setReservations(d.reservations ?? []) }
    } finally { setLoad('reservas', false) }
  }, [])

  const fetchPackages = useCallback(async () => {
    setLoad('paquetes', true)
    try {
      const r = await fetch('/api/buggi/packages?status=ALL&limit=100')
      if (r.ok) { const d = await r.json(); setPackages(d.packages ?? []) }
    } finally { setLoad('paquetes', false) }
  }, [])

  const fetchStats = useCallback(async () => {
    setLoad('resumen', true)
    try {
      const [iRes, rRes, pRes] = await Promise.all([
        fetch('/api/buggi/inquiries?limit=1'),
        fetch('/api/buggi/reservations?limit=1&status=CONFIRMED'),
        fetch('/api/buggi/packages?limit=1&status=PUBLISHED'),
      ])
      const [iData, rData, pData] = await Promise.all([iRes.json(), rRes.json(), pRes.json()])
      const pendRes = await fetch('/api/buggi/inquiries?limit=1&status=PENDING')
      const pendData = await pendRes.json()
      setStats({
        pendingInquiries: pendData.pagination?.total ?? 0,
        activeReservations: rData.pagination?.total ?? 0,
        publishedPackages: pData.pagination?.total ?? 0,
        totalInquiries: iData.pagination?.total ?? 0,
      })
    } finally { setLoad('resumen', false) }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchInquiries()
  }, [fetchStats, fetchInquiries])

  useEffect(() => {
    if (tab === 'reservas' && reservations.length === 0) fetchReservations()
    if (tab === 'paquetes' && packages.length === 0) fetchPackages()
  }, [tab, reservations.length, packages.length, fetchReservations, fetchPackages])

  async function updateInquiryStatus(id: string, status: string) {
    await fetch(`/api/buggi/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as Inquiry['status'] } : i))
  }

  async function respondWithAI(inquiry: Inquiry) {
    setAiLoading(prev => ({ ...prev, [inquiry.id]: true }))
    try {
      const r = await fetch('/api/buggi/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: inquiry.id, message: inquiry.message, name: inquiry.name, packageTitle: inquiry.package?.title }),
      })
      if (r.ok) {
        const d = await r.json()
        setAiResp(prev => ({ ...prev, [inquiry.id]: d.response ?? '' }))
        setExpandedInquiry(inquiry.id)
        await updateInquiryStatus(inquiry.id, 'IN_PROGRESS')
      }
    } finally {
      setAiLoading(prev => ({ ...prev, [inquiry.id]: false }))
    }
  }

  const filteredInquiries = inquiries.filter(i => {
    const matchSearch = !iSearch || [i.name, i.email, i.message].join(' ').toLowerCase().includes(iSearch.toLowerCase())
    const matchStatus = iFilter === 'all' || i.status === iFilter
    return matchSearch && matchStatus
  })

  // ── Styles ───
  const S = {
    page: { minHeight: '100vh', background: '#080c14', fontFamily: 'system-ui', color: '#e2e8f0' } as React.CSSProperties,
    topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#0d1829', borderBottom: '1px solid #1e2a3a', position: 'sticky', top: 0, zIndex: 50 } as React.CSSProperties,
    tabs: { display: 'flex', gap: 4, padding: '12px 20px', background: '#0a0f1a', borderBottom: '1px solid #1e2a3a', overflowX: 'auto' as const },
    tab: (active: boolean) => ({ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? color + '22' : 'transparent', color: active ? color : '#4a6080', transition: 'all .15s' } as React.CSSProperties),
    body: { padding: '24px 20px', maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
    card: { background: '#0d1829', border: '1px solid #1e2a3a', borderRadius: 14, padding: '18px 20px', marginBottom: 10 } as React.CSSProperties,
    statCard: (c: string) => ({ background: '#0d1829', border: `1px solid ${c}33`, borderRadius: 14, padding: '20px', flex: 1, minWidth: 120 } as React.CSSProperties),
    input: { background: '#060a10', border: '1px solid #1e2a3a', color: '#e2e8f0', padding: '8px 14px', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%' } as React.CSSProperties,
    select: { background: '#060a10', border: '1px solid #1e2a3a', color: '#e2e8f0', padding: '8px 12px', borderRadius: 8, fontSize: 13, outline: 'none' } as React.CSSProperties,
    btn: (c: string) => ({ background: c, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties),
    btnSec: { background: '#1e2a3a', color: '#7aa3cc', border: '1px solid #2d3a4a', padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    empty: { textAlign: 'center' as const, padding: '48px 0', color: '#2d4a6a', fontSize: 14 },
    loading: { textAlign: 'center' as const, padding: '48px 0', color: '#2d4a6a', fontSize: 14 },
  }

  const pendingCount = inquiries.filter(i => i.status === 'PENDING').length

  return (
    <div style={S.page}>
      {/* Top Bar */}
      <div style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>✈️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>{companyName}</div>
            <div style={{ fontSize: 11, color: '#2d4a6a' }}>NUCLEUS · Panel operativo</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {pendingCount > 0 && (
            <span style={{ background: '#ea580c', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
              {pendingCount} sin responder
            </span>
          )}
          <a href={publicUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: '#4a6080', fontSize: 12, textDecoration: 'none', padding: '6px 12px', border: '1px solid #1e2a3a', borderRadius: 7 }}>
            Ver sitio →
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {([
          { id: 'resumen', label: '📊 Resumen' },
          { id: 'consultas', label: `📋 Consultas${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { id: 'reservas', label: '📅 Reservas' },
          { id: 'paquetes', label: '✈️ Paquetes' },
          { id: 'guia', label: '📖 Guía de uso' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={S.body}>

        {/* ── RESUMEN ── */}
        {tab === 'resumen' && (
          <div>
            {loading.resumen ? (
              <div style={S.loading}>Cargando...</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                  <div style={S.statCard('#ea580c')}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ea580c' }}>{stats?.pendingInquiries ?? 0}</div>
                    <div style={{ fontSize: 12, color: '#7aa3cc', marginTop: 2 }}>Consultas sin responder</div>
                  </div>
                  <div style={S.statCard('#16a34a')}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{stats?.activeReservations ?? 0}</div>
                    <div style={{ fontSize: 12, color: '#7aa3cc', marginTop: 2 }}>Reservas confirmadas</div>
                  </div>
                  <div style={S.statCard('#2563eb')}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{stats?.publishedPackages ?? 0}</div>
                    <div style={{ fontSize: 12, color: '#7aa3cc', marginTop: 2 }}>Paquetes publicados</div>
                  </div>
                  <div style={S.statCard('#7c3aed')}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{stats?.totalInquiries ?? 0}</div>
                    <div style={{ fontSize: 12, color: '#7aa3cc', marginTop: 2 }}>Consultas totales</div>
                  </div>
                </div>

                {/* Recent inquiries quick view */}
                <div style={{ ...S.card, marginBottom: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Últimas consultas</span>
                    <button style={S.btnSec} onClick={() => setTab('consultas')}>Ver todas</button>
                  </div>
                  {inquiries.slice(0, 5).length === 0 ? (
                    <div style={S.empty}>Sin consultas aún</div>
                  ) : (
                    inquiries.slice(0, 5).map(i => (
                      <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e2a3a' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{i.name}</div>
                          <div style={{ fontSize: 11, color: '#4a6080' }}>{i.message.slice(0, 60)}{i.message.length > 60 ? '...' : ''}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Badge status={i.status} map={INQUIRY_STATUS} />
                          <span style={{ fontSize: 11, color: '#2d4a6a' }}>{ago(i.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CONSULTAS ── */}
        {tab === 'consultas' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                style={{ ...S.input, maxWidth: 280 }}
                placeholder="Buscar por nombre, email o mensaje..."
                value={iSearch}
                onChange={e => setISearch(e.target.value)}
              />
              <select style={S.select} value={iFilter} onChange={e => setIFilter(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="PENDING">Sin responder</option>
                <option value="IN_PROGRESS">En proceso</option>
                <option value="RESOLVED">Respondidas</option>
                <option value="ARCHIVED">Archivadas</option>
              </select>
              <button style={S.btnSec} onClick={fetchInquiries}>↺ Actualizar</button>
            </div>

            {loading.consultas ? (
              <div style={S.loading}>Cargando consultas...</div>
            ) : filteredInquiries.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                Sin consultas
              </div>
            ) : (
              filteredInquiries.map(i => (
                <div key={i.id} style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{i.name}</div>
                      <div style={{ fontSize: 12, color: '#4a6080' }}>{i.email}{i.phone ? ` · ${i.phone}` : ''}</div>
                      {i.package && (
                        <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 2 }}>✈️ {i.package.title}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge status={i.status} map={INQUIRY_STATUS} />
                      <span style={{ fontSize: 11, color: '#2d4a6a' }}>{ago(i.createdAt)}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#7aa3cc', margin: '0 0 12px', lineHeight: 1.6, background: '#060a10', padding: '10px 14px', borderRadius: 8, border: '1px solid #1e2a3a' }}>
                    {i.message}
                  </p>

                  {/* AI response */}
                  {(aiResp[i.id] || i.response) && expandedInquiry === i.id && (
                    <div style={{ background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: '#2563eb', marginBottom: 6, fontWeight: 600 }}>✨ Respuesta sugerida por IA</div>
                      <p style={{ fontSize: 13, color: '#7aa3cc', margin: 0, lineHeight: 1.6 }}>
                        {aiResp[i.id] || i.response}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {i.status === 'PENDING' && (
                      <button
                        style={S.btn('#2563eb')}
                        onClick={() => respondWithAI(i)}
                        disabled={aiLoading[i.id]}
                      >
                        {aiLoading[i.id] ? '...' : '✨ Responder con IA'}
                      </button>
                    )}
                    {(aiResp[i.id] || i.response) && (
                      <button style={S.btnSec} onClick={() => setExpandedInquiry(expandedInquiry === i.id ? null : i.id)}>
                        {expandedInquiry === i.id ? 'Ocultar' : 'Ver respuesta'}
                      </button>
                    )}
                    {i.status !== 'RESOLVED' && (
                      <button style={S.btn('#16a34a')} onClick={() => updateInquiryStatus(i.id, 'RESOLVED')}>
                        ✓ Marcar resuelta
                      </button>
                    )}
                    {i.status !== 'ARCHIVED' && (
                      <button style={S.btnSec} onClick={() => updateInquiryStatus(i.id, 'ARCHIVED')}>
                        Archivar
                      </button>
                    )}
                    {i.email && (
                      <a href={`mailto:${i.email}`} style={{ ...S.btnSec, textDecoration: 'none' }}>
                        📧 Email
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── RESERVAS ── */}
        {tab === 'reservas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
              <span style={{ color: '#4a6080', fontSize: 13 }}>{reservations.length} reservas</span>
              <button style={S.btnSec} onClick={fetchReservations}>↺ Actualizar</button>
            </div>

            {loading.reservas ? (
              <div style={S.loading}>Cargando reservas...</div>
            ) : reservations.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                Sin reservas aún
              </div>
            ) : (
              reservations.map(r => (
                <div key={r.id} style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>#{r.code}</span>
                        <Badge status={r.status} map={RES_STATUS} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{r.package?.title}</div>
                      <div style={{ fontSize: 12, color: '#4a6080', marginTop: 2 }}>
                        👤 {r.user?.firstName} {r.user?.lastName} — {r.user?.email}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                        {r.travelStartDate && (
                          <span style={{ fontSize: 11, color: '#5a7a9a' }}>
                            📅 {new Date(r.travelStartDate).toLocaleDateString('es-AR')}
                            {r.travelEndDate && ` → ${new Date(r.travelEndDate).toLocaleDateString('es-AR')}`}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#5a7a9a' }}>
                          👥 {r.totalPassengers || r._count?.passengers || 1} pasajeros
                        </span>
                        {r.totalPriceArs && (
                          <span style={{ fontSize: 11, color: '#5a7a9a' }}>
                            💰 {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(r.totalPriceArs)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#2d4a6a', flexShrink: 0 }}>
                      {ago(r.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PAQUETES ── */}
        {tab === 'paquetes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
              <span style={{ color: '#4a6080', fontSize: 13 }}>{packages.length} paquetes</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btnSec} onClick={fetchPackages}>↺ Actualizar</button>
                <a
                  href={`${process.env.NEXT_PUBLIC_BUGGI_URL || 'https://buggiviajes.tur.ar'}/admin/paquetes/new`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ ...S.btn(color), textDecoration: 'none' }}
                >
                  + Nuevo paquete
                </a>
              </div>
            </div>

            {loading.paquetes ? (
              <div style={S.loading}>Cargando paquetes...</div>
            ) : packages.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✈️</div>
                Sin paquetes aún
              </div>
            ) : (
              packages.map(pkg => {
                const img = pkg.images?.[0]?.url
                const dests = pkg.destinations?.map(d => d.destination.name).join(', ')
                return (
                  <div key={pkg.id} style={{ ...S.card, display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 10, flexShrink: 0,
                      background: img ? `url(${img}) center/cover` : '#0a1628',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, border: '1px solid #1e2a3a',
                    }}>
                      {!img && '✈️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{pkg.title}</span>
                        <Badge status={pkg.status} map={PKG_STATUS} />
                        {pkg.isFeatured && <span style={{ fontSize: 11, color: '#ca8a04' }}>⭐ Destacado</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#4a6080' }}>
                        {dests && `📍 ${dests} · `}🌙 {pkg.nights} noches
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa', marginTop: 2 }}>
                        USD {pkg.basePriceUsd.toLocaleString('es-AR')}
                      </div>
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_BUGGI_URL || 'https://buggiviajes.tur.ar'}/admin/paquetes/${pkg.id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ ...S.btnSec, textDecoration: 'none', flexShrink: 0 }}
                    >
                      Editar →
                    </a>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── GUÍA DE USO ── */}
        {tab === 'guia' && (
          <div>
            <div style={{ ...S.card, marginBottom: 16, background: '#0a1628', border: '1px solid #1e3a5f' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
                Bienvenida al NUCLEUS de BUGGI Viajes
              </div>
              <p style={{ fontSize: 13, color: '#7aa3cc', margin: 0, lineHeight: 1.7 }}>
                Este es tu panel de operaciones. Desde acá podés ver y gestionar todo lo importante del negocio sin necesidad de entrar al admin completo. Usalo como tu punto de partida diario.
              </p>
            </div>

            {[
              {
                icon: '📊',
                titulo: 'Resumen',
                subtitulo: 'Tu punto de partida cada día',
                pasos: [
                  'Abrí el panel y fijate en las 4 cards de arriba: cuántas consultas están sin responder, cuántas reservas confirmadas tenés, etc.',
                  'Abajo aparecen las últimas 5 consultas recibidas para que tengas un vistazo rápido.',
                  'Si hay consultas pendientes, el número aparece en rojo en la barra superior como recordatorio.',
                ],
              },
              {
                icon: '📋',
                titulo: 'Consultas',
                subtitulo: 'Respondé a los clientes que te escribieron',
                pasos: [
                  'Cada consulta muestra el nombre, email y mensaje del cliente.',
                  'Hacé clic en "✨ Responder con IA" para que la IA genere un borrador de respuesta basado en lo que preguntaron. Podés copiarlo y enviarlo por email o WhatsApp.',
                  'Una vez que respondiste, hacé clic en "✓ Marcar resuelta" para que no aparezca más como pendiente.',
                  'Si una consulta ya no es relevante, usá "Archivar" para quitarla de la vista principal.',
                  'El botón "📧 Email" abre directamente tu cliente de correo con el email del cliente.',
                ],
              },
              {
                icon: '📅',
                titulo: 'Reservas',
                subtitulo: 'Seguí el estado de las reservas',
                pasos: [
                  'Ves todas las reservas con su código único, el cliente, el paquete, fechas de viaje y cantidad de pasajeros.',
                  'El color del estado te indica dónde está cada reserva: amarillo = pendiente, verde = confirmada, azul = pago parcial, etc.',
                  'Para gestionar pagos o cambiar el estado de una reserva, usá el enlace "Ver sitio" arriba y entrá al admin completo.',
                ],
              },
              {
                icon: '✈️',
                titulo: 'Paquetes',
                subtitulo: 'Revisá y editá tus paquetes publicados',
                pasos: [
                  'Ves todos los paquetes con su estado: Publicado (verde), Borrador (amarillo), Archivado (gris).',
                  'Para editar un paquete (cambiar precio, fotos, itinerario), hacé clic en "Editar →". Se abre el editor completo en buggiviajes.tur.ar.',
                  'Para crear un paquete nuevo, usá el botón "+ Nuevo paquete" arriba a la derecha.',
                  'Un paquete en "Borrador" no es visible para los clientes hasta que lo publiques.',
                ],
              },
            ].map(sec => (
              <div key={sec.titulo} style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: 24 }}>{sec.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>{sec.titulo}</div>
                    <div style={{ fontSize: 12, color: '#4a6080' }}>{sec.subtitulo}</div>
                  </div>
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sec.pasos.map((paso, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#7aa3cc', lineHeight: 1.6 }}>
                      {paso}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            <div style={{ ...S.card, background: '#0a1a0a', border: '1px solid #1a3a1a', marginTop: 8 }}>
              <div style={{ fontWeight: 700, color: '#4ade80', fontSize: 14, marginBottom: 8 }}>
                💡 Rutina diaria sugerida
              </div>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Abrí el Resumen → fijate si hay consultas sin responder (número rojo).',
                  'Entrá a Consultas → respondé con IA y marcalas como resueltas.',
                  'Revisá Reservas → confirmá que no haya ninguna en estado "Pendiente" hace más de 24hs.',
                  'Si publicaste un paquete nuevo, verificalo en la tab Paquetes que esté en verde.',
                ].map((paso, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#86efac', lineHeight: 1.6 }}>{paso}</li>
                ))}
              </ol>
            </div>

            <div style={{ ...S.card, background: '#0a0a1a', border: '1px solid #1a1a3a', marginTop: 8 }}>
              <div style={{ fontWeight: 700, color: '#818cf8', fontSize: 14, marginBottom: 8 }}>
                ❓ ¿Algo no funciona o necesitás ayuda?
              </div>
              <p style={{ fontSize: 13, color: '#7aa3cc', margin: '0 0 10px', lineHeight: 1.6 }}>
                Contactá a Joaco de DIVINIA por WhatsApp y te ayuda enseguida.
              </p>
              <a
                href="https://wa.me/5492665286110?text=Hola%20Joaco!%20Necesito%20ayuda%20con%20el%20panel%20NUCLEUS%20de%20BUGGI"
                target="_blank" rel="noopener noreferrer"
                style={{ ...S.btn('#16a34a'), textDecoration: 'none', display: 'inline-block' }}
              >
                💬 WhatsApp Joaco
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}