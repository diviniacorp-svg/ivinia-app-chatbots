'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Campaign {
  id: string
  client_name: string
  rubro: string
  platform: string
  campaign_name: string
  objective: string
  status: string
  budget_monthly_ars: number
  budget_spent_ars: number
  impressions: number
  clicks: number
  leads: number
  conversions: number
  cpc_ars: number
  cpl_ars: number
  roas: number
  start_date: string | null
  end_date: string | null
  target_audience: string | null
  ad_copies: AdCopy[]
  strategy: CampaignStrategy | null
  notas: string | null
  created_at: string
}

interface AdCopy {
  id: string
  headline: string
  texto_principal: string
  descripcion: string
  cta: string
  angulo: string
}

interface CampaignStrategy {
  resumen: string
  audiencia_primaria: { edad: string; genero: string; intereses: string[]; comportamientos: string[]; ubicacion: string }
  kpis_objetivo: { cpc_esperado_ars: number; cpl_esperado_ars: number; leads_estimados_mes: number; roas_esperado: number }
  recomendaciones_creativas: string[]
  mensaje_wa_cliente: string
}

interface AnalisisResult {
  score: number
  estado_general: string
  resumen: string
  fortalezas: string[]
  problemas: string[]
  acciones_inmediatas: { prioridad: string; accion: string; impacto_esperado: string }[]
  proyeccion_30_dias: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const STATUSES = [
  { key: 'borrador',   label: 'Borrador',   color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  { key: 'activa',     label: 'Activa',     color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'pausada',    label: 'Pausada',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { key: 'finalizada', label: 'Finalizada', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
]

const PLATFORMS: Record<string, { label: string; emoji: string; color: string }> = {
  meta:      { label: 'Meta Ads',      emoji: '📘', color: '#1877F2' },
  google:    { label: 'Google Ads',    emoji: '🔍', color: '#EA4335' },
  instagram: { label: 'Instagram Ads', emoji: '📸', color: '#E1306C' },
  tiktok:    { label: 'TikTok Ads',    emoji: '🎵', color: '#000000' },
}

const OBJECTIVES: Record<string, string> = {
  leads:       'Generación de leads',
  conversions: 'Conversiones',
  awareness:   'Reconocimiento de marca',
  traffic:     'Tráfico web',
  engagement:  'Interacción',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ars(n: number) {
  if (!n) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}
function num(n: number) { return n?.toLocaleString('es-AR') || '0' }
function ctr(c: Campaign) {
  if (!c.impressions) return '—'
  return ((c.clicks / c.impressions) * 100).toFixed(2) + '%'
}

const s = { fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' as const }

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14, padding: '14px 16px',
}

function btn(color: string): React.CSSProperties {
  return {
    background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--f-mono)',
    fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
    transition: 'all 0.15s',
  }
}

function StatusPill({ status }: { status: string }) {
  const st = STATUSES.find(s => s.key === status) ?? STATUSES[0]
  return (
    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33`,
      borderRadius: 100, padding: '3px 10px', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700 }}>
      {st.label}
    </span>
  )
}

// ─── Panel de detalle ─────────────────────────────────────────────────────────
function CampaignPanel({ campaign, onClose, onUpdate }: {
  campaign: Campaign
  onClose: () => void
  onUpdate: (c: Campaign) => void
}) {
  const [tab, setTab] = useState<'info' | 'metricas' | 'copy' | 'estrategia'>('info')
  const [status, setStatus] = useState(campaign.status)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Métricas editables
  const [metrics, setMetrics] = useState({
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    leads: campaign.leads,
    conversions: campaign.conversions,
    budget_spent_ars: campaign.budget_spent_ars,
    cpc_ars: campaign.cpc_ars,
    cpl_ars: campaign.cpl_ars,
    roas: campaign.roas,
  })
  const [savingMetrics, setSavingMetrics] = useState(false)

  // Copy generator
  const [generatingCopy, setGeneratingCopy] = useState(false)
  const [copies, setCopies] = useState<AdCopy[]>(campaign.ad_copies || [])
  const [copyConfig, setCopyConfig] = useState({ objetivo: campaign.objective, tono: 'cercano', producto: '' })
  const [imagenSugerida, setImagenSugerida] = useState('')
  const [notasCreativas, setNotasCreativas] = useState('')

  // Estrategia
  const [generatingStrategy, setGeneratingStrategy] = useState(false)
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(campaign.strategy)

  // Análisis
  const [generatingAnalisis, setGeneratingAnalisis] = useState(false)
  const [analisis, setAnalisis] = useState<AnalisisResult | null>(null)

  async function saveStatus(newStatus: string) {
    setSaving(true); setStatus(newStatus)
    await fetch(`/api/publicidad/campaigns/${campaign.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    onUpdate({ ...campaign, status: newStatus })
    setSaving(false)
  }

  async function saveMetrics() {
    setSavingMetrics(true)
    const res = await fetch(`/api/publicidad/campaigns/${campaign.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    })
    const data = await res.json()
    if (data.campaign) onUpdate(data.campaign)
    setSavingMetrics(false)
  }

  async function generateCopy() {
    setGeneratingCopy(true)
    try {
      const res = await fetch('/api/publicidad/copy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: campaign.client_name, rubro: campaign.rubro,
          objetivo: copyConfig.objetivo, plataforma: PLATFORMS[campaign.platform]?.label,
          producto: copyConfig.producto, tono: copyConfig.tono,
          audiencia: campaign.target_audience,
        }),
      })
      const data = await res.json()
      if (data.variantes) {
        setCopies(data.variantes)
        setImagenSugerida(data.imagen_sugerida || '')
        setNotasCreativas(data.notas_creativas || '')
        await fetch(`/api/publicidad/campaigns/${campaign.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ad_copies: data.variantes }),
        })
        onUpdate({ ...campaign, ad_copies: data.variantes })
      }
    } catch { /* silent */ }
    setGeneratingCopy(false)
  }

  async function generateStrategy() {
    setGeneratingStrategy(true)
    try {
      const res = await fetch('/api/publicidad/strategy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: campaign.client_name, rubro: campaign.rubro,
          objective: campaign.objective, budget_monthly_ars: campaign.budget_monthly_ars,
          platform: campaign.platform, notas: campaign.notas,
        }),
      })
      const data = await res.json()
      if (data.strategy) {
        setStrategy(data.strategy)
        await fetch(`/api/publicidad/campaigns/${campaign.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strategy: data.strategy }),
        })
        onUpdate({ ...campaign, strategy: data.strategy })
      }
    } catch { /* silent */ }
    setGeneratingStrategy(false)
  }

  async function runAnalisis() {
    setGeneratingAnalisis(true)
    try {
      const res = await fetch('/api/publicidad/analisis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign: { ...campaign, ...metrics } }),
      })
      const data = await res.json()
      if (data.analisis) setAnalisis(data.analisis)
    } catch { /* silent */ }
    setGeneratingAnalisis(false)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const plt = PLATFORMS[campaign.platform] || { label: campaign.platform, emoji: '📢', color: '#8B5CF6' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      <div style={{
        position: 'relative', zIndex: 1, width: 'min(560px, 100vw)', height: '100vh',
        background: '#0F0F12', borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        animation: 'slide-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <style>{`@keyframes slide-in { from { transform:translateX(100%) } to { transform:translateX(0) } }`}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>{plt.emoji}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.02em' }}>
                {campaign.campaign_name}
              </h2>
              <p style={{ margin: '3px 0 0', ...s, color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>
                {campaign.client_name} · {plt.label} · {OBJECTIVES[campaign.objective] || campaign.objective}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
            {STATUSES.map(st => (
              <button key={st.key} onClick={() => saveStatus(st.key)} style={{
                padding: '4px 12px', borderRadius: 100, cursor: 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
                border: `1px solid ${st.color}44`,
                background: status === st.key ? st.bg : 'transparent',
                color: status === st.key ? st.color : 'rgba(255,255,255,0.3)',
                opacity: saving ? 0.5 : 1,
              }}>{st.label}</button>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', marginTop: 14 }}>
            {[['info','Info'],['metricas','Métricas'],['copy','Copy IA'],['estrategia','Estrategia']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k as typeof tab)} style={{
                flex: 1, padding: '8px 0', background: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, border: 'none',
                color: tab === k ? '#fff' : 'rgba(255,255,255,0.3)',
                borderBottom: `2px solid ${tab === k ? plt.color : 'transparent'}`,
                transition: 'all 0.15s',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ── INFO ── */}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={card}>
                <p style={{ margin: '0 0 12px', ...s, color: 'rgba(255,255,255,0.3)' }}>Presupuesto</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Mensual</p>
                    <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 800, color: '#C6FF3D', letterSpacing: '-0.02em' }}>{ars(campaign.budget_monthly_ars)}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Gastado</p>
                    <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{ars(campaign.budget_spent_ars)}</p>
                  </div>
                </div>
                {campaign.budget_monthly_ars > 0 && (
                  <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: '#C6FF3D', width: `${Math.min(100, (campaign.budget_spent_ars / campaign.budget_monthly_ars) * 100)}%`, transition: 'width 0.5s' }} />
                  </div>
                )}
              </div>

              {[
                ['Audiencia objetivo', campaign.target_audience || '—'],
                ['Inicio', campaign.start_date || '—'],
                ['Fin', campaign.end_date || '—'],
                ['Notas', campaign.notas || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ margin: '0 0 3px', ...s, color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>{k}</p>
                  <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 13, color: '#fff' }}>{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── MÉTRICAS ── */}
          {tab === 'metricas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, ...s, color: 'rgba(255,255,255,0.3)' }}>Actualizar métricas</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'impressions', label: 'Impresiones' },
                  { key: 'clicks', label: 'Clicks' },
                  { key: 'leads', label: 'Leads' },
                  { key: 'conversions', label: 'Conversiones' },
                  { key: 'budget_spent_ars', label: 'Gastado ($)' },
                  { key: 'cpc_ars', label: 'CPC ($)' },
                  { key: 'cpl_ars', label: 'CPL ($)' },
                  { key: 'roas', label: 'ROAS (x)' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <p style={{ margin: '0 0 4px', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</p>
                    <input
                      type="number"
                      value={(metrics as Record<string, number>)[key] || ''}
                      onChange={e => setMetrics(m => ({ ...m, [key]: parseFloat(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'var(--f-mono)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>

              <button onClick={saveMetrics} disabled={savingMetrics} style={{ ...btn('#10B981'), padding: '12px 0', width: '100%', fontSize: 12, textAlign: 'center' }}>
                {savingMetrics ? '⏳ Guardando...' : '💾 Guardar métricas'}
              </button>

              {/* Resumen calculado */}
              <div style={card}>
                <p style={{ margin: '0 0 10px', ...s, color: '#C6FF3D' }}>Resumen calculado</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['CTR', ctr({ ...campaign, ...metrics })],
                    ['Conv. Rate', metrics.clicks > 0 ? ((metrics.conversions / metrics.clicks) * 100).toFixed(1) + '%' : '—'],
                    ['CPC', ars(metrics.cpc_ars)],
                    ['CPL', ars(metrics.cpl_ars)],
                    ['ROAS', metrics.roas ? metrics.roas + 'x' : '—'],
                    ['Leads', num(metrics.leads)],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ margin: '0 0 2px', fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{k}</p>
                      <p style={{ margin: 0, fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Análisis IA */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: analisis ? 12 : 0 }}>
                  <p style={{ margin: 0, ...s, color: '#8B5CF6' }}>Análisis IA de performance</p>
                  <button onClick={runAnalisis} disabled={generatingAnalisis} style={{ ...btn('#8B5CF6'), padding: '5px 14px', fontSize: 10 }}>
                    {generatingAnalisis ? '⏳...' : analisis ? '🔄 Re-analizar' : '🧠 Analizar'}
                  </button>
                </div>
                {analisis && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${analisis.score >= 70 ? '#10B981' : analisis.score >= 40 ? '#F59E0B' : '#EF4444'}22`, border: `2px solid ${analisis.score >= 70 ? '#10B981' : analisis.score >= 40 ? '#F59E0B' : '#EF4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 14, color: analisis.score >= 70 ? '#10B981' : analisis.score >= 40 ? '#F59E0B' : '#EF4444' }}>
                        {analisis.score}
                      </div>
                      <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 13, color: '#fff', lineHeight: 1.4 }}>{analisis.resumen}</p>
                    </div>
                    {analisis.acciones_inmediatas?.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: a.prioridad === 'alta' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', borderRadius: 8, border: `1px solid ${a.prioridad === 'alta' ? '#EF444433' : '#F59E0B33'}` }}>
                        <span style={{ fontSize: 11 }}>{a.prioridad === 'alta' ? '🔴' : '🟡'}</span>
                        <div>
                          <p style={{ margin: '0 0 2px', fontFamily: 'var(--f-display)', fontSize: 12, color: '#fff' }}>{a.accion}</p>
                          <p style={{ margin: 0, fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{a.impacto_esperado}</p>
                        </div>
                      </div>
                    ))}
                    {analisis.proyeccion_30_dias && (
                      <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, fontStyle: 'italic' }}>{analisis.proyeccion_30_dias}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── COPY IA ── */}
          {tab === 'copy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={card}>
                <p style={{ margin: '0 0 12px', ...s, color: '#F59E0B' }}>Configurar generación</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Producto/servicio a promocionar</p>
                    <input type="text" value={copyConfig.producto} onChange={e => setCopyConfig(c => ({ ...c, producto: e.target.value }))}
                      placeholder="Ej: corte + peinado, limpieza de piscina, turno dental..."
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'var(--f-display)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Tono</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['cercano', 'profesional', 'urgente', 'aspiracional', 'humor'].map(t => (
                        <button key={t} onClick={() => setCopyConfig(c => ({ ...c, tono: t }))} style={{
                          padding: '4px 12px', borderRadius: 100, fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                          background: copyConfig.tono === t ? '#F59E0B22' : 'transparent',
                          border: `1px solid ${copyConfig.tono === t ? '#F59E0B' : 'rgba(255,255,255,0.15)'}`,
                          color: copyConfig.tono === t ? '#F59E0B' : 'rgba(255,255,255,0.4)',
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={generateCopy} disabled={generatingCopy} style={{ ...btn('#F59E0B'), width: '100%', padding: '12px 0', marginTop: 14, fontSize: 12, textAlign: 'center' }}>
                  {generatingCopy ? '⏳ Generando copies...' : '✍️ Generar 3 variantes'}
                </button>
              </div>

              {copies.length > 0 && (
                <>
                  {imagenSugerida && (
                    <div style={{ ...card, borderColor: '#F59E0B33' }}>
                      <p style={{ margin: '0 0 6px', ...s, color: '#F59E0B', fontSize: 9 }}>Imagen sugerida</p>
                      <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{imagenSugerida}</p>
                      {notasCreativas && <p style={{ margin: '8px 0 0', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{notasCreativas}</p>}
                    </div>
                  )}

                  {copies.map((c, i) => (
                    <div key={c.id || i} style={{ ...card, borderColor: i === 0 ? '#10B98133' : 'rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? '#10B981' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: i === 0 ? '#000' : 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                            {c.id || String.fromCharCode(65 + i)}
                          </span>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{c.angulo}</span>
                        </div>
                        <button onClick={() => copy(`${c.headline}\n${c.texto_principal}\n${c.descripcion}\nCTA: ${c.cta}`, `copy-${i}`)} style={{ ...btn(copied === `copy-${i}` ? '#10B981' : '#F59E0B'), padding: '4px 10px', fontSize: 9 }}>
                          {copied === `copy-${i}` ? '✓' : 'Copiar'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          ['Headline', c.headline, '#fff', 700],
                          ['Texto', c.texto_principal, 'rgba(255,255,255,0.8)', 400],
                          ['Desc.', c.descripcion, 'rgba(255,255,255,0.6)', 400],
                          ['CTA', c.cta, '#F59E0B', 700],
                        ].map(([k, v, color, weight]) => (
                          <div key={String(k)} style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', width: 38, flexShrink: 0, paddingTop: 2 }}>{k}</span>
                            <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: String(color), fontWeight: Number(weight), lineHeight: 1.4 }}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {copies.length === 0 && !generatingCopy && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
                  <p style={{ fontFamily: 'var(--f-display)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Configurá y generá los copies con IA</p>
                </div>
              )}
            </div>
          )}

          {/* ── ESTRATEGIA ── */}
          {tab === 'estrategia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!strategy ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                  <p style={{ fontFamily: 'var(--f-display)', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
                    Generá una estrategia de campaña personalizada con IA.
                  </p>
                  <button onClick={generateStrategy} disabled={generatingStrategy} style={{ ...btn('#8B5CF6'), padding: '14px 32px', fontSize: 13 }}>
                    {generatingStrategy ? '⏳ Generando estrategia...' : '🎯 Generar estrategia con IA'}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ ...card, borderColor: '#8B5CF633' }}>
                    <p style={{ margin: '0 0 8px', ...s, color: '#8B5CF6' }}>Resumen</p>
                    <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 14, color: '#fff', lineHeight: 1.5 }}>{strategy.resumen}</p>
                  </div>

                  {strategy.audiencia_primaria && (
                    <div style={card}>
                      <p style={{ margin: '0 0 10px', ...s, color: '#38BDF8' }}>Audiencia primaria</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          ['Edad', strategy.audiencia_primaria.edad],
                          ['Género', strategy.audiencia_primaria.genero],
                          ['Ubicación', strategy.audiencia_primaria.ubicacion],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', width: 60, flexShrink: 0 }}>{k}</span>
                            <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#fff' }}>{v}</span>
                          </div>
                        ))}
                        <div>
                          <p style={{ margin: '4px 0 6px', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Intereses</p>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {strategy.audiencia_primaria.intereses?.map((int, i) => (
                              <span key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 100, padding: '3px 9px', color: '#38BDF8' }}>{int}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {strategy.kpis_objetivo && (
                    <div style={card}>
                      <p style={{ margin: '0 0 10px', ...s, color: '#C6FF3D' }}>KPIs objetivo</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          ['CPC esperado', ars(strategy.kpis_objetivo.cpc_esperado_ars)],
                          ['CPL esperado', ars(strategy.kpis_objetivo.cpl_esperado_ars)],
                          ['Leads/mes', String(strategy.kpis_objetivo.leads_estimados_mes)],
                          ['ROAS objetivo', `${strategy.kpis_objetivo.roas_esperado}x`],
                        ].map(([k, v]) => (
                          <div key={k} style={{ background: 'rgba(198,255,61,0.05)', borderRadius: 8, padding: '8px 12px' }}>
                            <p style={{ margin: '0 0 2px', fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{k}</p>
                            <p style={{ margin: 0, fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 15, color: '#C6FF3D' }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {strategy.recomendaciones_creativas?.length > 0 && (
                    <div style={card}>
                      <p style={{ margin: '0 0 8px', ...s, color: '#F59E0B' }}>Recomendaciones creativas</p>
                      {strategy.recomendaciones_creativas.map((r, i) => (
                        <p key={i} style={{ margin: '0 0 6px', fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                          <span style={{ color: '#F59E0B', flexShrink: 0 }}>→</span> {r}
                        </p>
                      ))}
                    </div>
                  )}

                  {strategy.mensaje_wa_cliente && (
                    <div style={{ ...card, borderColor: '#25D36633' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <p style={{ margin: 0, ...s, color: '#25D366', fontSize: 9 }}>WA para presentar al cliente</p>
                        <button onClick={() => copy(strategy.mensaje_wa_cliente, 'wa-strategy')} style={{ ...btn(copied === 'wa-strategy' ? '#10B981' : '#25D366'), padding: '4px 10px', fontSize: 9 }}>
                          {copied === 'wa-strategy' ? '✓' : 'Copiar'}
                        </button>
                      </div>
                      <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{strategy.mensaje_wa_cliente}</p>
                    </div>
                  )}

                  <button onClick={generateStrategy} disabled={generatingStrategy} style={{ ...btn('#8B5CF6'), padding: '10px 0', width: '100%', fontSize: 11, textAlign: 'center' }}>
                    {generatingStrategy ? '⏳...' : '🔄 Regenerar estrategia'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Formulario nueva campaña ─────────────────────────────────────────────────
function NewCampaignForm({ onSave, onClose }: { onSave: (c: Campaign) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    client_name: '', rubro: '', platform: 'meta', campaign_name: '',
    objective: 'leads', budget_monthly_ars: '', target_audience: '', notas: '',
  })
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_name || !form.campaign_name) return
    setSaving(true)
    try {
      const res = await fetch('/api/publicidad/campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget_monthly_ars: Number(form.budget_monthly_ars) || 0 }),
      })
      const data = await res.json()
      if (data.campaign) { onSave(data.campaign); onClose() }
    } catch { /* silent */ }
    setSaving(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    fontFamily: 'var(--f-display)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <form onSubmit={submit} style={{
        position: 'relative', zIndex: 1, background: '#0F0F12',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        padding: 32, width: 'min(520px, 95vw)', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>Nueva campaña</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Nombre de la campaña *</label>
            <input style={inp} placeholder="Ej: Peluquería Lucía — Leads Mayo" value={form.campaign_name}
              onChange={e => setForm(f => ({ ...f, campaign_name: e.target.value }))} required />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Cliente *</label>
            <input style={inp} placeholder="Ej: Peluquería Lucía" value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} required />
          </div>
          <div>
            <label style={lbl}>Rubro</label>
            <input style={inp} placeholder="Ej: peluqueria" value={form.rubro}
              onChange={e => setForm(f => ({ ...f, rubro: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Presupuesto mensual ($)</label>
            <input type="number" style={inp} placeholder="0" value={form.budget_monthly_ars}
              onChange={e => setForm(f => ({ ...f, budget_monthly_ars: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Plataforma</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
              {Object.entries(PLATFORMS).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Objetivo</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.objective}
              onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}>
              {Object.entries(OBJECTIVES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Notas</label>
            <input style={inp} placeholder="Contexto adicional para la IA..." value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, ...btn('#6B7280'), padding: '12px 0' }}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ flex: 2, ...btn('#C6FF3D'), padding: '12px 0', fontSize: 12, background: '#C6FF3D', color: '#000', border: 'none' }}>
            {saving ? '⏳ Creando...' : '+ Crear campaña'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function PublicidadPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')

  const fetchCampaigns = useCallback(async () => {
    setFetchError('')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const res = await fetch('/api/publicidad/campaigns', { signal: controller.signal })
      clearTimeout(timeoutId)
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || 'Error al cargar'
        setFetchError(msg.includes('does not exist') || msg.includes('relation') ? 'tabla_faltante' : msg)
      } else {
        setCampaigns(data.campaigns || [])
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setFetchError('timeout')
      } else {
        setFetchError(err instanceof Error ? err.message : 'Error de conexión')
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  function updateCampaign(updated: Campaign) {
    setCampaigns(cs => cs.map(c => c.id === updated.id ? updated : c))
    if (selected?.id === updated.id) setSelected(updated)
  }

  const filtered = campaigns.filter(c => {
    const ms = filterStatus === 'all' || c.status === filterStatus
    const mp = filterPlatform === 'all' || c.platform === filterPlatform
    return ms && mp
  })

  // KPIs globales
  const totalBudget = campaigns.filter(c => c.status === 'activa').reduce((s, c) => s + (c.budget_monthly_ars || 0), 0)
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads || 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'activa').length
  const avgRoas = campaigns.filter(c => c.roas > 0).length > 0
    ? (campaigns.filter(c => c.roas > 0).reduce((s, c) => s + c.roas, 0) / campaigns.filter(c => c.roas > 0).length).toFixed(1)
    : '—'

  const INK = '#09090B'
  const LIME = '#C6FF3D'

  return (
    <div style={{ background: INK, minHeight: '100vh', color: '#fff' }}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div style={{ background: INK, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 28px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '-0.04em' }}>
              Publicidad IA
            </h1>
            <p style={{ margin: '2px 0 0', ...s, color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>
              campañas · copy ia · estrategia · performance
            </p>
          </div>

          {/* KPIs */}
          {[
            { label: 'Budget activo', val: totalBudget > 0 ? ars(totalBudget) : '—', color: LIME },
            { label: 'Campañas activas', val: activeCampaigns, color: '#10B981' },
            { label: 'Leads totales', val: totalLeads, color: '#38BDF8' },
            { label: 'ROAS promedio', val: avgRoas !== '—' ? `${avgRoas}x` : '—', color: '#F59E0B' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 20, color }}>{val}</p>
              <p style={{ margin: 0, ...s, color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>{label}</p>
            </div>
          ))}

          <button onClick={() => setShowNew(true)} style={{ ...btn(LIME), padding: '10px 20px', background: LIME, color: INK, border: 'none', fontSize: 12 }}>
            + Nueva campaña
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ ...s, color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>Estado:</span>
          {[['all','Todos'],['borrador','Borrador'],['activa','Activa'],['pausada','Pausada'],['finalizada','Finalizada']].map(([k,l]) => (
            <button key={k} onClick={() => setFilterStatus(k)} style={{
              padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
              background: filterStatus === k ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
              color: filterStatus === k ? '#fff' : 'rgba(255,255,255,0.4)',
              border: filterStatus === k ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.08)',
            }}>{l}</button>
          ))}
          <span style={{ ...s, color: 'rgba(255,255,255,0.25)', fontSize: 9, marginLeft: 8 }}>Plataforma:</span>
          {[['all','Todas'],...Object.entries(PLATFORMS).map(([k,v]) => [k, v.emoji + ' ' + v.label])].map(([k,l]) => (
            <button key={k} onClick={() => setFilterPlatform(k)} style={{
              padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
              background: filterPlatform === k ? '#1877F2' : 'rgba(255,255,255,0.05)',
              color: filterPlatform === k ? '#fff' : 'rgba(255,255,255,0.4)',
              border: filterPlatform === k ? '1px solid #1877F2' : '1px solid rgba(255,255,255,0.08)',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── KANBAN ───────────────────────────────────────────────── */}
      <div style={{ padding: '24px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: LIME, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: 'var(--f-mono)', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Conectando con Supabase...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          </div>
        ) : fetchError ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {fetchError === 'tabla_faltante' ? '🗄️' : fetchError === 'timeout' ? '⏱️' : '⚠️'}
            </div>
            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
              {fetchError === 'tabla_faltante' ? 'Tabla no configurada en Supabase'
                : fetchError === 'timeout' ? 'La conexión tardó demasiado'
                : fetchError}
            </p>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
              {fetchError === 'tabla_faltante'
                ? 'Necesitás crear la tabla ad_campaigns en Supabase para usar esta sección.'
                : 'Verificá la conexión a Supabase o revisá las env vars en Vercel.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => { setLoading(true); fetchCampaigns() }} style={{ ...btn(LIME), padding: '10px 24px', background: LIME, color: INK, border: 'none', fontSize: 12 }}>
                🔄 Reintentar
              </button>
              {fetchError === 'tabla_faltante' && (
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ ...btn('rgba(255,255,255,0.4)'), padding: '10px 24px', fontSize: 12, textDecoration: 'none' }}>
                  Ir a Supabase ↗
                </a>
              )}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📢</div>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              {campaigns.length === 0 ? 'Todavía no hay campañas. Creá la primera.' : 'Sin resultados.'}
            </p>
            {campaigns.length === 0 && (
              <button onClick={() => setShowNew(true)} style={{ ...btn(LIME), padding: '14px 28px', fontSize: 13, background: LIME, color: INK, border: 'none' }}>
                + Crear primera campaña
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 24, alignItems: 'flex-start' }}>
            {STATUSES.map(st => {
              const cols = filtered.filter(c => c.status === st.key)
              return (
                <div key={st.key} style={{
                  flexShrink: 0, width: 280,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: st.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{st.label}</span>
                    <span style={{ background: st.bg, color: st.color, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700 }}>{cols.length}</span>
                  </div>
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 80 }}>
                    {cols.map(c => {
                      const plt = PLATFORMS[c.platform] || { emoji: '📢', color: '#8B5CF6', label: c.platform }
                      return (
                        <button key={c.id} onClick={() => setSelected(c)} style={{
                          background: '#0F0F12', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '14px', cursor: 'pointer', textAlign: 'left',
                          transition: 'border-color 0.15s', width: '100%',
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = st.color + '66'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 18 }}>{plt.emoji}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.campaign_name}
                              </p>
                              <p style={{ margin: '2px 0 0', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{c.client_name}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {c.budget_monthly_ars > 0 && (
                              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: LIME, fontWeight: 700 }}>{ars(c.budget_monthly_ars)}/mes</span>
                            )}
                            {c.leads > 0 && (
                              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#38BDF8' }}>{c.leads} leads</span>
                            )}
                            {c.roas > 0 && (
                              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#F59E0B' }}>ROAS {c.roas}x</span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selected && <CampaignPanel campaign={selected} onClose={() => setSelected(null)} onUpdate={updateCampaign} />}
      {showNew && <NewCampaignForm onSave={c => setCampaigns(cs => [c, ...cs])} onClose={() => setShowNew(false)} />}
    </div>
  )
}
