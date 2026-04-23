'use client'

import { useState, useEffect, useCallback } from 'react'
import AgentChat from '@/components/dashboard/AgentChat'

const LUNA   = { id: 'luna',   nombre: 'Luna',   emoji: '🌙', rol: 'CRM Manager',     model: 'sonnet', color: '#10B981' }
const NICO   = { id: 'nico',   nombre: 'Nico',   emoji: '🤝', rol: 'Vendedor IA',     model: 'sonnet', color: '#10B981' }
const CLOSER = { id: 'closer', nombre: 'Closer', emoji: '🎯', rol: 'Closer de Ventas', model: 'sonnet', color: '#10B981' }

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Lead {
  id: string
  company_name: string
  rubro: string
  city: string
  phone: string
  email: string
  website: string
  instagram: string
  score: number
  status: string
  notes: string
  updated_at: string
}

interface Qualification {
  score: number
  razon: string
  dolor_principal: string
  servicio_recomendado: string
  precio_estimado: number
  mensaje_wa: string
  proxima_accion: string
}

interface DemoRec {
  rubro: string
  demo_url: string
  pitch_opening: string
  pain_points: string[]
  killer_question: string
  upsell_hint: string
}

interface ObjResp {
  objection: string
  response: string
  follow_up_question: string
  close_attempt: string
}

interface Proposal {
  titulo: string
  resumen_ejecutivo: string
  entregables: string[]
  precio: number
  precio_label: string
  plazo: string
  garantia: string
  cta: string
  mensaje_wa_propuesta: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'nuevo',       label: 'Nuevo',        color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  { key: 'contactado',  label: 'Contactado',   color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { key: 'propuesta',   label: 'Propuesta',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { key: 'negociacion', label: 'Negociando',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { key: 'cerrado',     label: 'Cerrado ✓',    color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'perdido',     label: 'Perdido',      color: '#EF4444', bg: 'rgba(239,68,68,0.08)'  },
]

const RUBRO_EMOJIS: Record<string, string> = {
  peluqueria: '✂️', barberia: '💈', estetica: '💅', nails: '💅', spa: '🌸',
  gimnasio: '🏋️', veterinaria: '🐾', odontologia: '🦷', restaurante: '🍴',
  hotel: '🏨', clinica: '🩺', psicologia: '🧠', abogado: '⚖️',
  contabilidad: '📊', farmacia: '💊', inmobiliaria: '🏠', default: '🏪',
}
function rubroEmoji(r: string) {
  const k = r?.toLowerCase().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u')
  return Object.entries(RUBRO_EMOJIS).find(([key]) => k?.includes(key))?.[1] ?? '🏪'
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#6B7280'
  return (
    <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
      <svg width="40" height="40" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
        <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${(score / 100) * 100.53} 100.53`}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--f-mono)', fontSize:11, fontWeight:700, color }}>
        {score}
      </span>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const s = STAGES.find(st => st.key === status) ?? STAGES[0]
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
      borderRadius: 100, padding: '3px 10px', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

// ─── Panel de detalle / acción ────────────────────────────────────────────────
function LeadPanel({
  lead, onClose, onUpdate,
}: {
  lead: Lead
  onClose: () => void
  onUpdate: (updated: Lead) => void
}) {
  const [qualifying, setQualifying] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [qualification, setQualification] = useState<Qualification | null>(null)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [proposalUrl, setProposalUrl] = useState<string | null>(null)
  const [tab, setTab] = useState<'info' | 'ia' | 'propuesta'>('info')
  const [status, setStatus] = useState(lead.status)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Demo Advisor
  const [demoRec, setDemoRec] = useState<DemoRec | null>(null)
  const [gettingDemo, setGettingDemo] = useState(false)
  // Objection Handler
  const [objInput, setObjInput] = useState('')
  const [objResp, setObjResp] = useState<ObjResp | null>(null)
  const [gettingObj, setGettingObj] = useState(false)
  // Follow-up
  const [followUpMsg, setFollowUpMsg] = useState<string | null>(null)
  const [gettingFollowUp, setGettingFollowUp] = useState(false)

  async function qualify() {
    setQualifying(true)
    try {
      const res = await fetch('/api/agents/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, company_name: lead.company_name, rubro: lead.rubro, city: lead.city, phone: lead.phone, website: lead.website, instagram: lead.instagram, notes: lead.notes }),
      })
      const data = await res.json()
      setQualification(data)
      setTab('ia')
      onUpdate({ ...lead, score: data.score })
    } catch { /* silent */ }
    setQualifying(false)
  }

  async function generateProposal() {
    if (!qualification) return
    setGenerating(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          company_name: lead.company_name,
          rubro: lead.rubro,
          city: lead.city,
          servicio: qualification.servicio_recomendado,
          dolor: qualification.dolor_principal,
          precio_override: qualification.precio_estimado,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setProposalUrl(data.url)
        // Parsear la propuesta del contenido guardado para mostrarla en el panel
        const propRes = await fetch(`/api/proposals/${data.proposal_id}`)
        const propData = await propRes.json()
        if (propData.proposal?.contenido) {
          try { setProposal(JSON.parse(propData.proposal.contenido)) } catch { /* silent */ }
        }
        setTab('propuesta')
      }
    } catch { /* silent */ }
    setGenerating(false)
  }

  async function saveStatus(newStatus: string) {
    setSaving(true)
    setStatus(newStatus)
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      onUpdate({ ...lead, status: newStatus })
    } catch { /* silent */ }
    setSaving(false)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function getDemo() {
    setGettingDemo(true)
    try {
      const res = await fetch('/api/agents/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, company_name: lead.company_name, rubro: lead.rubro, city: lead.city }),
      })
      const data = await res.json()
      if (data.ok) setDemoRec(data)
    } catch { /* silent */ }
    setGettingDemo(false)
  }

  async function getObjResponse() {
    if (!objInput.trim()) return
    setGettingObj(true)
    try {
      const res = await fetch('/api/agents/objection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: lead.company_name, rubro: lead.rubro, city: lead.city, objection: objInput }),
      })
      const data = await res.json()
      if (data.ok) setObjResp(data)
    } catch { /* silent */ }
    setGettingObj(false)
  }

  async function getFollowUp() {
    setGettingFollowUp(true)
    try {
      const res = await fetch('/api/agents/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, company_name: lead.company_name, rubro: lead.rubro, city: lead.city, phone: lead.phone, stage: status }),
      })
      const data = await res.json()
      if (data.ok) setFollowUpMsg(data.mensaje)
    } catch { /* silent */ }
    setGettingFollowUp(false)
  }

  const waLink = (msg: string) =>
    `https://wa.me/${lead.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`

  const s = { fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' as const }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }} onClick={onClose}/>

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 'min(520px, 100vw)', height: '100vh',
        background: '#0F0F12',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        animation: 'panel-slide-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <style>{`
          @keyframes panel-slide-in { from { transform:translateX(100%); } to { transform:translateX(0); } }
        `}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 16 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
            <div style={{ fontSize:36, lineHeight:1 }}>{rubroEmoji(lead.rubro)}</div>
            <div style={{ flex:1 }}>
              <h2 style={{ margin:0, fontFamily:'var(--f-display)', fontWeight:800, fontSize:18, color:'#fff', letterSpacing:'-0.02em' }}>
                {lead.company_name}
              </h2>
              <p style={{ margin:'4px 0 0', ...s, color:'rgba(255,255,255,0.4)' }}>
                {lead.rubro} · {lead.city}
              </p>
            </div>
            <ScoreRing score={lead.score} />
            <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:22, lineHeight:1, padding:4 }}>×</button>
          </div>

          {/* Status selector */}
          <div style={{ display:'flex', gap:6, marginTop:14, flexWrap:'wrap' }}>
            {STAGES.map(st => (
              <button key={st.key} onClick={() => saveStatus(st.key)}
                style={{
                  padding:'4px 12px', borderRadius:100, cursor:'pointer', transition:'all 0.15s',
                  fontFamily:'var(--f-mono)', fontSize:10, fontWeight:700,
                  border: `1px solid ${st.color}44`,
                  background: status === st.key ? st.bg : 'transparent',
                  color: status === st.key ? st.color : 'rgba(255,255,255,0.3)',
                  opacity: saving ? 0.5 : 1,
                }}>
                {st.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:0, marginTop:14 }}>
            {[['info','Info'],['ia','IA 🤖'],['propuesta','Propuesta']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k as 'info'|'ia'|'propuesta')}
                style={{
                  flex:1, padding:'8px 0', background:'none', cursor:'pointer',
                  fontFamily:'var(--f-mono)', fontSize:11, fontWeight:700,
                  color: tab === k ? '#fff' : 'rgba(255,255,255,0.3)',
                  border:'none',
                  borderBottom: `2px solid ${tab === k ? '#8B5CF6' : 'transparent'}`,
                  transition:'all 0.15s',
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>

          {/* TAB: INFO */}
          {tab === 'info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                ['Teléfono', lead.phone || '—'],
                ['Email', lead.email || '—'],
                ['Web', lead.website || '—'],
                ['Instagram', lead.instagram || '—'],
              ].map(([k,v]) => (
                <div key={k}>
                  <p style={{ margin:'0 0 3px', ...s, color:'rgba(255,255,255,0.3)' }}>{k}</p>
                  <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:14, color:'#fff' }}>{v}</p>
                </div>
              ))}
              {lead.notes && (
                <div>
                  <p style={{ margin:'0 0 3px', ...s, color:'rgba(255,255,255,0.3)' }}>Notas</p>
                  <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5, whiteSpace:'pre-line' }}>{lead.notes}</p>
                </div>
              )}

              {/* Acciones rápidas */}
              <div style={{ display:'flex', gap:10, marginTop:8, flexWrap:'wrap' }}>
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} style={{ ...btnStyle('#3B82F6'), textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                    📞 Llamar
                  </a>
                )}
                {lead.phone && (
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                    style={{ ...btnStyle('#10B981'), textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                    💬 WhatsApp
                  </a>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`}
                    style={{ ...btnStyle('#8B5CF6'), textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                    ✉️ Email
                  </a>
                )}
              </div>

              {/* Follow-up */}
              <div style={cardStyle}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: followUpMsg ? 10 : 0 }}>
                  <p style={{ margin:0, ...s, color:'rgba(255,255,255,0.4)' }}>Mensaje de seguimiento</p>
                  <button onClick={getFollowUp} disabled={gettingFollowUp}
                    style={{ ...btnStyle('#F59E0B'), padding:'5px 14px', fontSize:10 }}>
                    {gettingFollowUp ? '⏳ Generando...' : '✍️ Generar follow-up'}
                  </button>
                </div>
                {followUpMsg && (
                  <>
                    <p style={{ margin:'0 0 10px', fontFamily:'var(--f-display)', fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.5, whiteSpace:'pre-line' }}>{followUpMsg}</p>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <button onClick={() => copy(followUpMsg, 'followup')}
                        style={{ ...btnStyle(copied==='followup'?'#10B981':'#F59E0B'), padding:'5px 14px', fontSize:10 }}>
                        {copied==='followup' ? '✓ Copiado' : 'Copiar'}
                      </button>
                      {lead.phone && (
                        <a href={waLink(followUpMsg)} target="_blank" rel="noopener noreferrer"
                          style={{ ...btnStyle('#10B981'), textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', fontSize:10 }}>
                          💬 Enviar WA →
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: IA */}
          {tab === 'ia' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {!qualification ? (
                <div style={{ textAlign:'center', padding:'40px 0' }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
                  <p style={{ fontFamily:'var(--f-display)', color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:24 }}>
                    Claude analiza el perfil del negocio y te dice exactamente qué ofrecerle y cómo.
                  </p>
                  <button onClick={qualify} disabled={qualifying}
                    style={{ ...btnStyle('#8B5CF6'), padding:'14px 32px', fontSize:13 }}>
                    {qualifying ? '⏳ Analizando...' : '🧠 Calificar con IA'}
                  </button>
                </div>
              ) : (
                <>
                  <div style={cardStyle}>
                    <p style={{ margin:'0 0 6px', ...s, color:'#8B5CF6' }}>Score IA</p>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <ScoreRing score={qualification.score} />
                      <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.4 }}>{qualification.razon}</p>
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <p style={{ margin:'0 0 6px', ...s, color:'#F59E0B' }}>Dolor principal</p>
                    <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:14, color:'#fff', lineHeight:1.5 }}>{qualification.dolor_principal}</p>
                  </div>

                  <div style={cardStyle}>
                    <p style={{ margin:'0 0 6px', ...s, color:'#10B981' }}>Servicio recomendado</p>
                    <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:14, color:'#fff' }}>{qualification.servicio_recomendado}</p>
                    <p style={{ margin:'4px 0 0', fontFamily:'var(--f-mono)', fontSize:12, color:'#10B981', fontWeight:700 }}>
                      ${qualification.precio_estimado.toLocaleString('es-AR')} ARS
                    </p>
                  </div>

                  <div style={cardStyle}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <p style={{ margin:0, ...s, color:'#3B82F6' }}>Mensaje WhatsApp</p>
                      <button onClick={() => copy(qualification.mensaje_wa, 'wa')}
                        style={{ ...btnStyle(copied==='wa'?'#10B981':'#3B82F6'), padding:'4px 12px', fontSize:10 }}>
                        {copied==='wa' ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.5 }}>{qualification.mensaje_wa}</p>
                    {lead.phone && (
                      <a href={waLink(qualification.mensaje_wa)} target="_blank" rel="noopener noreferrer"
                        style={{ ...btnStyle('#10B981'), textDecoration:'none', display:'inline-flex', marginTop:12, alignItems:'center', gap:6 }}>
                        💬 Enviar por WhatsApp →
                      </a>
                    )}
                  </div>

                  <div style={cardStyle}>
                    <p style={{ margin:'0 0 6px', ...s, color:'rgba(255,255,255,0.4)' }}>Próxima acción</p>
                    <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'#fff', lineHeight:1.4 }}>{qualification.proxima_accion}</p>
                  </div>

                  {/* ── Demo Advisor ── */}
                  <div style={cardStyle}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: demoRec ? 12 : 0 }}>
                      <p style={{ margin:0, ...s, color:'#C6FF3D' }}>Demo advisor</p>
                      <button onClick={getDemo} disabled={gettingDemo}
                        style={{ ...btnStyle('#C6FF3D'), padding:'5px 14px', fontSize:10 }}>
                        {gettingDemo ? '⏳...' : demoRec ? '🔄 Regenerar' : '🎯 Qué demo mostrar'}
                      </button>
                    </div>
                    {demoRec && (
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <div>
                          <p style={{ margin:'0 0 4px', ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>Apertura</p>
                          <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'#fff', lineHeight:1.4 }}>{demoRec.pitch_opening}</p>
                        </div>
                        <div>
                          <p style={{ margin:'0 0 4px', ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>Pregunta ganadora</p>
                          <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'#C6FF3D', fontStyle:'italic', lineHeight:1.4 }}>"{demoRec.killer_question}"</p>
                        </div>
                        <div>
                          <p style={{ margin:'0 0 4px', ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>Dolores a mencionar</p>
                          {demoRec.pain_points.map((p, i) => (
                            <p key={i} style={{ margin:'0 0 3px', fontFamily:'var(--f-display)', fontSize:12, color:'rgba(255,255,255,0.7)', display:'flex', gap:6 }}>
                              <span style={{ color:'#EF4444' }}>•</span> {p}
                            </p>
                          ))}
                        </div>
                        <a href={demoRec.demo_url} target="_blank" rel="noopener noreferrer"
                          style={{ ...btnStyle('#C6FF3D'), textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', fontSize:10 }}>
                          👁 Ver demo →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* ── Objection Handler ── */}
                  <div style={cardStyle}>
                    <p style={{ margin:'0 0 10px', ...s, color:'#EF4444' }}>Manejador de objeciones</p>
                    <div style={{ display:'flex', gap:8 }}>
                      <input
                        type="text"
                        placeholder="Ej: es muy caro, no tengo tiempo..."
                        value={objInput}
                        onChange={e => setObjInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && getObjResponse()}
                        style={{
                          flex:1, padding:'8px 12px', background:'rgba(255,255,255,0.06)',
                          border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
                          fontFamily:'var(--f-display)', fontSize:13, color:'#fff', outline:'none',
                        }}
                      />
                      <button onClick={getObjResponse} disabled={gettingObj || !objInput.trim()}
                        style={{ ...btnStyle('#EF4444'), padding:'8px 14px', fontSize:11, whiteSpace:'nowrap' }}>
                        {gettingObj ? '⏳' : '→'}
                      </button>
                    </div>
                    {objResp && (
                      <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
                        <div>
                          <p style={{ margin:'0 0 4px', ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>Respuesta</p>
                          <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'#fff', lineHeight:1.5 }}>{objResp.response}</p>
                        </div>
                        <div>
                          <p style={{ margin:'0 0 4px', ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>Pregunta de seguimiento</p>
                          <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'#F59E0B', fontStyle:'italic' }}>"{objResp.follow_up_question}"</p>
                        </div>
                        <div>
                          <p style={{ margin:'0 0 4px', ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>Cierre suave</p>
                          <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'#10B981' }}>{objResp.close_attempt}</p>
                        </div>
                        <button onClick={() => copy(`${objResp.response} ${objResp.close_attempt}`, 'obj')}
                          style={{ ...btnStyle(copied==='obj'?'#10B981':'#EF4444'), padding:'5px 14px', fontSize:10, alignSelf:'flex-start' }}>
                          {copied==='obj' ? '✓ Copiado' : 'Copiar respuesta'}
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={generateProposal} disabled={generating}
                    style={{ ...btnStyle('#8B5CF6'), padding:'14px 0', width:'100%', fontSize:13 }}>
                    {generating ? '⏳ Generando propuesta...' : '📝 Generar propuesta completa'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB: PROPUESTA */}
          {tab === 'propuesta' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {!proposal ? (
                <div style={{ textAlign:'center', padding:'40px 0' }}>
                  <p style={{ fontFamily:'var(--f-display)', color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:16 }}>
                    {!qualification ? 'Primero calificá el lead con IA →' : 'Listo para generar la propuesta.'}
                  </p>
                  <button onClick={qualification ? generateProposal : qualify} disabled={generating || qualifying}
                    style={{ ...btnStyle('#8B5CF6'), padding:'14px 32px', fontSize:13 }}>
                    {generating ? '⏳ Generando...' : qualifying ? '⏳ Calificando...' : qualification ? '📝 Generar propuesta' : '🧠 Calificar primero'}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ ...cardStyle, borderColor: '#8B5CF655' }}>
                    <h3 style={{ margin:'0 0 8px', fontFamily:'var(--f-display)', fontWeight:800, fontSize:17, color:'#fff' }}>{proposal.titulo}</h3>
                    <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>{proposal.resumen_ejecutivo}</p>
                  </div>

                  {proposal.entregables?.length > 0 && (
                    <div style={cardStyle}>
                      <p style={{ margin:'0 0 10px', ...s, color:'#10B981' }}>Entregables</p>
                      {proposal.entregables.map((e, i) => (
                        <p key={i} style={{ margin:'0 0 6px', fontFamily:'var(--f-display)', fontSize:13, color:'rgba(255,255,255,0.8)', display:'flex', gap:8 }}>
                          <span style={{ color:'#10B981' }}>✓</span> {e}
                        </p>
                      ))}
                    </div>
                  )}

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      ['💰 Precio', proposal.precio_label],
                      ['⚡ Plazo', proposal.plazo],
                      ['🛡️ Garantía', proposal.garantia],
                    ].map(([k,v]) => (
                      <div key={k} style={cardStyle}>
                        <p style={{ margin:'0 0 4px', ...s, color:'rgba(255,255,255,0.4)', fontSize:9 }}>{k}</p>
                        <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'#fff', fontWeight:600 }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {proposal.mensaje_wa_propuesta && (
                    <div style={cardStyle}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <p style={{ margin:0, ...s, color:'#3B82F6' }}>WA para enviar propuesta</p>
                        <button onClick={() => copy(proposal.mensaje_wa_propuesta, 'prop')}
                          style={{ ...btnStyle(copied==='prop'?'#10B981':'#3B82F6'), padding:'4px 12px', fontSize:10 }}>
                          {copied==='prop' ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <p style={{ margin:0, fontFamily:'var(--f-display)', fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.5 }}>{proposal.mensaje_wa_propuesta}</p>
                    </div>
                  )}

                  {/* Link sharable de la propuesta */}
                  {proposalUrl && (
                    <div style={{ ...cardStyle, borderColor:'#10B98155' }}>
                      <p style={{ margin:'0 0 8px', ...s, color:'#10B981' }}>Link de propuesta listo</p>
                      <p style={{ margin:'0 0 10px', fontFamily:'var(--f-mono)', fontSize:11, color:'rgba(255,255,255,0.6)', wordBreak:'break-all' }}>
                        {proposalUrl}
                      </p>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button onClick={() => copy(proposalUrl, 'propurl')}
                          style={{ ...btnStyle(copied==='propurl'?'#10B981':'#8B5CF6'), padding:'8px 16px' }}>
                          {copied==='propurl' ? '✓ Copiado' : '🔗 Copiar link'}
                        </button>
                        {lead.phone && proposal?.mensaje_wa_propuesta && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g,'')}?text=${encodeURIComponent(proposal.mensaje_wa_propuesta + '\n\n' + proposalUrl)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ ...btnStyle('#10B981'), textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                            💬 Enviar por WhatsApp
                          </a>
                        )}
                        <a href={proposalUrl} target="_blank" rel="noopener noreferrer"
                          style={{ ...btnStyle('#3B82F6'), textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                          👁 Ver propuesta
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Estilos reutilizables ────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14, padding: '14px 16px',
}

function btnStyle(color: string): React.CSSProperties {
  return {
    background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--f-mono)',
    fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
    transition: 'all 0.15s',
  }
}

// ─── Formulario nuevo lead ────────────────────────────────────────────────────
function NewLeadForm({ onSave, onClose }: { onSave: (l: Lead) => void; onClose: () => void }) {
  const [form, setForm] = useState({ company_name:'', rubro:'', city:'San Luis', phone:'', email:'', website:'', instagram:'' })
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company_name || !form.rubro) return
    setSaving(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, score: 0, status: 'nuevo', source: 'manual' }),
      })
      const data = await res.json()
      if (data.lead) { onSave(data.lead); onClose() }
    } catch { /* silent */ }
    setSaving(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    fontFamily: 'var(--f-display)', fontSize: 14, color: '#fff', outline: 'none',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = { fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }} onClick={onClose}/>
      <form onSubmit={submit} style={{
        position:'relative', zIndex:1, background:'#0F0F12', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:20, padding:32, width:'min(480px,95vw)', display:'flex', flexDirection:'column', gap:16,
      }}>
        <h3 style={{ margin:0, fontFamily:'var(--f-display)', fontWeight:800, fontSize:20, color:'#fff' }}>Nuevo lead</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            ['Empresa *','company_name','text','Ej: Salon Lucía'],
            ['Rubro *','rubro','text','Ej: peluqueria'],
            ['Ciudad','city','text','San Luis'],
            ['Teléfono','phone','tel','+54...'],
            ['Email','email','email',''],
            ['Instagram','instagram','text','@...'],
            ['Web','website','url','https://...'],
          ].map(([label, field, type, placeholder]) => (
            <div key={field} style={field==='company_name'||field==='rubro' ? { gridColumn:'1/-1' } : {}}>
              <label style={lbl}>{label}</label>
              <input type={type} placeholder={placeholder}
                value={(form as Record<string,string>)[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                style={inp} required={label.includes('*')} />
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button type="button" onClick={onClose} style={{ flex:1, ...btnStyle('#6B7280'), padding:'12px 0' }}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ flex:2, ...btnStyle('#8B5CF6'), padding:'12px 0', fontSize:12 }}>
            {saving ? '⏳ Guardando...' : '+ Agregar lead'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function ComercialPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [view, setView] = useState<'kanban' | 'lista'>('kanban')

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  function updateLead(updated: Lead) {
    setLeads(ls => ls.map(l => l.id === updated.id ? updated : l))
    if (selected?.id === updated.id) setSelected(updated)
  }

  const filtered = leads.filter(l => {
    const matchStatus = filter === 'all' || l.status === filter
    const matchSearch = !search || l.company_name.toLowerCase().includes(search.toLowerCase()) || l.rubro.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  // Stats
  const total = leads.length
  const calientes = leads.filter(l => l.score >= 70).length
  const cerrados = leads.filter(l => l.status === 'cerrado').length
  const enProceso = leads.filter(l => !['nuevo','perdido','cerrado'].includes(l.status)).length

  const s = { fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' as const }

  return (
    <div style={{ background:'var(--paper)', minHeight:'100vh', color:'var(--ink)' }}>
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        background:'#09090B', borderBottom:'1px solid rgba(255,255,255,0.07)',
        padding:'20px 28px', position:'sticky', top:0, zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <h1 style={{ margin:0, fontFamily:'var(--f-display)', fontWeight:900, fontSize:22, color:'#fff', letterSpacing:'-0.03em' }}>
              🎯 Comercial
            </h1>
            <p style={{ margin:'2px 0 0', ...s, color:'rgba(255,255,255,0.35)', fontSize:9 }}>
              pipeline · calificación ia · propuestas · cierre
            </p>
          </div>

          {/* Stats */}
          {[
            { label:'Total', val: total, color:'rgba(255,255,255,0.6)' },
            { label:'Calientes', val: calientes, color:'#10B981' },
            { label:'En proceso', val: enProceso, color:'#8B5CF6' },
            { label:'Cerrados', val: cerrados, color:'#F59E0B' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign:'center', padding:'0 16px', borderLeft:'1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ margin:0, fontFamily:'var(--f-display)', fontWeight:800, fontSize:20, color }}>{val}</p>
              <p style={{ margin:0, ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>{label}</p>
            </div>
          ))}

          {/* Acciones */}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setView(v => v==='kanban'?'lista':'kanban')}
              style={{ ...btnStyle('#6B7280'), padding:'8px 14px' }}>
              {view==='kanban' ? '☰ Lista' : '⬛ Kanban'}
            </button>
            <button onClick={() => setShowNew(true)}
              style={{ ...btnStyle('#8B5CF6'), padding:'8px 18px', background:'#8B5CF6', color:'#fff', border:'none' }}>
              + Nuevo lead
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por empresa o rubro..."
            style={{
              padding:'7px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:10, fontFamily:'var(--f-display)', fontSize:13, color:'#fff', outline:'none', width:220,
            }} />
          {[['all','Todos'],['nuevo','Nuevos'],['contactado','Contactados'],['propuesta','Propuesta'],['negociacion','Negociando'],['cerrado','Cerrados']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{
                padding:'6px 14px', borderRadius:100, cursor:'pointer', transition:'all 0.15s',
                fontFamily:'var(--f-mono)', fontSize:10, fontWeight:700,
                background: filter===k ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                color: filter===k ? '#fff' : 'rgba(255,255,255,0.4)',
                border: filter===k ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENIDO ─────────────────────────────────────────────── */}
      <div style={{ padding:'24px 28px' }}>
        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
            <p style={{ fontFamily:'var(--f-mono)', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Cargando leads...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
            <p style={{ fontFamily:'var(--f-display)', fontSize:16, color:'rgba(255,255,255,0.5)', marginBottom:24 }}>
              {leads.length === 0 ? 'Todavía no hay leads. Agregá el primero.' : 'Sin resultados para ese filtro.'}
            </p>
            {leads.length === 0 && (
              <button onClick={() => setShowNew(true)} style={{ ...btnStyle('#8B5CF6'), padding:'12px 28px', fontSize:13 }}>
                + Agregar primer lead
              </button>
            )}
          </div>
        ) : view === 'kanban' ? (
          /* ── KANBAN ── */
          <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:24, alignItems:'flex-start' }}>
            {STAGES.filter(st => st.key !== 'perdido').map(stage => {
              const cols = filtered.filter(l => l.status === stage.key)
              return (
                <div key={stage.key} style={{
                  flexShrink:0, width:260,
                  background:'rgba(255,255,255,0.03)', borderRadius:16,
                  border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden',
                }}>
                  <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:'var(--f-mono)', fontSize:11, fontWeight:700, color:stage.color, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                      {stage.label}
                    </span>
                    <span style={{ background:stage.bg, color:stage.color, borderRadius:100, padding:'2px 8px', fontFamily:'var(--f-mono)', fontSize:10, fontWeight:700 }}>
                      {cols.length}
                    </span>
                  </div>
                  <div style={{ padding:12, display:'flex', flexDirection:'column', gap:10, minHeight:100 }}>
                    {cols.map(lead => (
                      <button key={lead.id} onClick={() => setSelected(lead)}
                        style={{
                          background:'#0F0F12', border:'1px solid rgba(255,255,255,0.08)',
                          borderRadius:12, padding:'12px 14px', cursor:'pointer', textAlign:'left',
                          transition:'all 0.15s', width:'100%',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = stage.color+'66'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                      >
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <span style={{ fontSize:18 }}>{rubroEmoji(lead.rubro)}</span>
                          <span style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:13, color:'#fff', flex:1, lineHeight:1.2 }}>{lead.company_name}</span>
                          <ScoreRing score={lead.score} />
                        </div>
                        <p style={{ margin:0, ...s, color:'rgba(255,255,255,0.3)', fontSize:9 }}>{lead.rubro} · {lead.city}</p>
                        {lead.phone && <p style={{ margin:'4px 0 0', ...s, color:'rgba(255,255,255,0.25)', fontSize:9 }}>{lead.phone}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ── LISTA ── */
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(lead => (
              <button key={lead.id} onClick={() => setSelected(lead)}
                style={{
                  display:'flex', alignItems:'center', gap:16, width:'100%', textAlign:'left',
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:14, padding:'14px 18px', cursor:'pointer', transition:'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <span style={{ fontSize:24, flexShrink:0 }}>{rubroEmoji(lead.rubro)}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'#fff' }}>{lead.company_name}</p>
                  <p style={{ margin:'2px 0 0', ...s, color:'rgba(255,255,255,0.35)', fontSize:9 }}>{lead.rubro} · {lead.city}</p>
                </div>
                <StatusPill status={lead.status} />
                <ScoreRing score={lead.score} />
                <span style={{ ...s, color:'rgba(255,255,255,0.25)', fontSize:9 }}>{lead.phone || lead.email || '—'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── PANEL LATERAL ────────────────────────────────────────── */}
      {selected && (
        <LeadPanel lead={selected} onClose={() => setSelected(null)} onUpdate={updateLead} />
      )}

      {/* ── NUEVO LEAD ────────────────────────────────────────────── */}
      {showNew && (
        <NewLeadForm
          onSave={l => setLeads(ls => [l, ...ls])}
          onClose={() => setShowNew(false)}
        />
      )}

      {/* Equipo Comercial IA */}
      <div style={{ padding: '0 40px 40px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
          Equipo comercial — estrategas en tiempo real
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
          <AgentChat
            agent={LUNA}
            suggestions={['Analizá el pipeline de esta semana', 'Prioridad de seguimiento hoy', 'Cómo califico este lead nuevo']}
            collapsed={false}
          />
          <AgentChat
            agent={NICO}
            suggestions={['Escribí un mensaje de WhatsApp para una peluquería', 'Script para llamada de seguimiento', 'Objeción: "es muy caro"']}
            collapsed={true}
          />
          <AgentChat
            agent={CLOSER}
            suggestions={['Técnica de cierre para un gimnasio', 'Negociación de precio con PYME', 'Cómo presento la propuesta final']}
            collapsed={true}
          />
        </div>
      </div>
    </div>
  )
}
