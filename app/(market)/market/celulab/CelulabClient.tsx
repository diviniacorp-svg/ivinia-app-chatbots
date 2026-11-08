'use client'
import { useState, useEffect, useRef, useMemo } from 'react'

const BLUE = '#2D7DFF'
const INK = '#0D1B2A'
const PAPER = '#F2F4F7'
const CELULAB_WA = 'https://wa.me/5492664501140'

interface Partner {
  id: string
  name: string
  address: string
}

interface Props {
  partners?: Partner[]
}

export default function CelulabClient({ partners = [] }: Props) {
  const [pinOpen, setPinOpen] = useState(false)
  const [payConfig, setPayConfig] = useState<{ alias?: string; nombre?: string; mp_link?: string } | null>(null)
  const [trackInput, setTrackInput] = useState('')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const [requestModal, setRequestModal] = useState<RequestPrefill | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: '¡Hola! ¿Qué reparación necesitás? Consultame precio, modelo o servicio.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Modal: acceso (PIN) o registro
  const [modalMode, setModalMode] = useState<'acceso' | 'registro'>('acceso')

  // PIN único — enruta a mayorista o local según qué devuelve la API
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  // Registro
  const [regForm, setRegForm] = useState({ nombre_local: '', contacto: '', direccion: '', telefono: '' })
  const [regSent, setRegSent] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => {
    fetch('/api/celulab/payment-config').then(r => r.json()).then(d => setPayConfig(d)).catch(() => {})
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function sendMessage() {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: msg }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/celulab/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const { reply } = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply || 'Consultá por WhatsApp para un presupuesto exacto.' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error. Escribinos por WhatsApp.' }])
    }
    setChatLoading(false)
  }

  function openModal() { resetModal(); setPinOpen(true) }
  function closeModal() { setPinOpen(false); resetModal() }

  function resetModal() {
    setPinInput(''); setPinError(''); setPinLoading(false)
    setRegForm({ nombre_local: '', contacto: '', direccion: '', telefono: '' })
    setRegSent(false); setRegLoading(false); setModalMode('acceso')
  }

  async function handlePin() {
    if (!pinInput || pinInput.length < 4) { setPinError('Ingresá tu PIN'); return }
    setPinLoading(true); setPinError('')
    try {
      const res = await fetch('/api/celulab/partners/verify-pin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      })
      if (!res.ok) { setPinError('PIN incorrecto. Si sos local, consultá al técnico.'); setPinLoading(false); return }
      const { id, slug } = await res.json()
      // Pre-autenticar para que el panel del local no pida el PIN de nuevo
      sessionStorage.setItem(`local-${id}`, 'ok')
      window.location.href = `/market/celulab/local/${slug}`
    } catch { setPinError('Error de conexión. Intentá de nuevo.'); setPinLoading(false) }
  }

  async function handleRegistration() {
    const { nombre_local, contacto, telefono, direccion } = regForm
    if (!nombre_local || !telefono) return
    setRegLoading(true)
    try {
      await fetch('/api/celulab/partners/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_local, contacto, direccion, telefono }),
      })
    } catch { /* non-critical */ }
    setRegLoading(false)
    setRegSent(true)
  }

  return (
    <div style={{ background: INK, color: PAPER, minHeight: '100vh', fontFamily: "'Poppins', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{
        background: INK, borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/celulab-logo.png" alt="celuLAB" style={{ height: 38, width: 'auto', objectFit: 'contain', flexShrink: 0, borderRadius: 8 }} />
        {/* Tracking — pill compacto */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.02em', paddingLeft: 4 }}>📦 ¿Ya dejaste tu teléfono?</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              value={trackInput}
              onChange={e => setTrackInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter' && trackInput.trim()) window.location.href = `/seguimiento/${trackInput.trim()}` }}
              placeholder="CL-000123"
              style={{ flex: 1, minWidth: 0, padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 12, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.04em' }}
            />
            <button
              onClick={() => { if (trackInput.trim()) window.location.href = `/seguimiento/${trackInput.trim()}` }}
              disabled={!trackInput.trim()}
              style={{ padding: '5px 12px', borderRadius: 20, border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: 12, cursor: trackInput.trim() ? 'pointer' : 'default', opacity: trackInput.trim() ? 1 : 0.4, flexShrink: 0 }}
            >
              Ver →
            </button>
          </div>
        </div>
        {/* Locales */}
        <button
          onClick={openModal}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 13px', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
        >
          🏪 Locales
        </button>
      </header>

      {/* ─── Modal ─── */}
      {pinOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#111', borderRadius: 22, padding: '28px 28px 24px', width: '100%', maxWidth: 380, border: '1px solid rgba(255,255,255,0.1)' }}>

            {modalMode === 'registro' ? (
              regSent ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 19, color: '#fff', marginBottom: 8 }}>¡Solicitud recibida!</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 22, lineHeight: 1.6 }}>
                    Revisamos tu solicitud y te mandamos el PIN de acceso a la brevedad.
                  </div>
                  <a
                    href={`https://wa.me/5492664501140?text=${encodeURIComponent(`Hola! Acabo de solicitar acceso como local en CeluLab.\nLocal: ${regForm.nombre_local} · Tel: ${regForm.telefono}`)}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'block', padding: '12px', borderRadius: 10, background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', marginBottom: 10 }}
                  >
                    📲 Confirmar por WhatsApp
                  </a>
                  <button onClick={closeModal} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: 13, cursor: 'pointer' }}>
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setModalMode('acceso')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13, marginBottom: 18, padding: 0 }}>← Volver</button>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>Registrar mi local</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 22, lineHeight: 1.6 }}>
                    Completá los datos y te contactamos para activar tu panel y empezar a recibir equipos.
                  </div>
                  {[
                    { key: 'nombre_local', label: 'Nombre del local *', placeholder: 'Ej: DOT Celulares' },
                    { key: 'contacto', label: 'Tu nombre', placeholder: 'Nombre de contacto' },
                    { key: 'direccion', label: 'Dirección', placeholder: 'Ej: Av. Illia 234, San Luis' },
                    { key: 'telefono', label: 'WhatsApp *', placeholder: '+54 9 266 XXXXXXX' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} style={{ marginBottom: 11 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 5 }}>{label}</div>
                      <input
                        value={(regForm as Record<string, string>)[key]}
                        onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleRegistration}
                    disabled={!regForm.nombre_local || !regForm.telefono || regLoading}
                    style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 6, opacity: !regForm.nombre_local || !regForm.telefono ? 0.5 : 1 }}
                  >
                    {regLoading ? 'Enviando...' : '✓ Enviar solicitud'}
                  </button>
                </>
              )
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 22 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔐</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>Acceso privado</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                    Ingresá el PIN que te asignó el técnico
                  </div>
                </div>

                <input
                  type="password" inputMode="numeric" maxLength={6}
                  value={pinInput}
                  onChange={e => { setPinInput(e.target.value); setPinError('') }}
                  onKeyDown={e => e.key === 'Enter' && handlePin()}
                  placeholder="● ● ● ●"
                  autoFocus
                  style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${pinError ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius: 10, color: '#fff', fontSize: 22, textAlign: 'center', letterSpacing: '0.4em', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                />
                {pinError && <div style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>{pinError}</div>}

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={handlePin} disabled={pinLoading} style={{ flex: 2, padding: '12px', borderRadius: 9, background: BLUE, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: pinLoading ? 0.7 : 1 }}>
                    {pinLoading ? 'Verificando...' : 'Ingresar →'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>¿No tenés PIN?</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                </div>
                <button
                  onClick={() => setModalMode('registro')}
                  style={{ width: '100%', padding: '12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  🏪 Registrar mi local para recibir equipos
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {requestModal && <RequestModal prefill={requestModal} onClose={() => setRequestModal(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        @keyframes celuFloat1{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-11px) rotate(4deg)}}
        @keyframes celuFloat2{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-15px) rotate(-4deg)}}
        @keyframes celuFloat3{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-9px) scale(1.08)}}
        @keyframes celuFloat4{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-13px) rotate(8deg)}}
        @keyframes celuFloat5{0%,100%{transform:translateY(0)}55%{transform:translateY(-7px)}}
        @keyframes celuPulse{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.5;transform:scale(1.06)}}
        @keyframes celuGlow{0%,100%{box-shadow:0 0 24px ${BLUE}44}50%{box-shadow:0 0 40px ${BLUE}66}}
        @media(max-width:640px){
          .cl-hero{grid-template-columns:1fr!important;padding:28px 0 20px!important;gap:0!important}
          .cl-phone-hero{display:none!important}
          .cl-steps{grid-template-columns:repeat(2,1fr)!important}
          .cl-info-strip{flex-direction:column!important;gap:10px!important}
          .cl-wa-float{left:16px!important;transform:none!important;padding:13px 16px!important}
          .cl-wa-label{display:none!important}
          .cl-chat-float{bottom:16px!important;right:14px!important}
          .cl-chat-float .cl-chat-label{display:none!important}
          .cl-chat-panel{width:300px!important;max-width:calc(100vw - 28px)!important;max-height:55vh!important}
        }
        @media(min-width:900px){
          .cl-steps{grid-template-columns:repeat(4,1fr)!important}
          .cl-cards{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 100px' }}>

        {/* ── Hero ── */}
        <div className="cl-hero" style={{ padding: '52px 0 44px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${BLUE}22`, border: `1px solid ${BLUE}55`, borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#5EB8FF', marginBottom: 20, fontWeight: 600 }}>
              ⚡ San Luis Capital · Técnico certificado
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5.5vw,52px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 16px', lineHeight: 1.05, fontFamily: "'Poppins', sans-serif" }}>
              TU CELULAR EN<br />
              <span style={{ background: `linear-gradient(135deg, ${BLUE}, #5EB8FF)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                BUENAS MANOS.
              </span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', margin: '0 0 28px', lineHeight: 1.7 }}>
              Revisión diagnóstica, precio fijo antes de empezar.<br />
              Pantallas · Baterías · Conectores · Software
            </p>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[
                { n: '$15.000', label: 'revisión diagnóstica' },
                { n: 'En el día', label: 'o al día siguiente' },
                { n: '100%', label: 'piezas verificadas' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated phone — brand 3D style */}
          <div className="cl-phone-hero" style={{ position: 'relative', width: 210, height: 310, flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%,${BLUE}38,transparent 68%)`, animation: 'celuPulse 4s ease-in-out infinite' }} />
            <svg viewBox="0 0 80 146" width="90" height="164" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', filter: `drop-shadow(0 6px 22px ${BLUE}55) drop-shadow(0 2px 6px rgba(0,0,0,.5))` }}>
              <defs>
                <linearGradient id="phonebody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E2833"/>
                  <stop offset="100%" stopColor="#0D1B2A"/>
                </linearGradient>
                <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2D7DFF" stopOpacity=".9"/>
                  <stop offset="100%" stopColor="#0D40A0" stopOpacity=".8"/>
                </linearGradient>
                <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,.18)"/>
                  <stop offset="60%" stopColor="rgba(255,255,255,0)"/>
                </linearGradient>
              </defs>
              {/* Body */}
              <rect x="2" y="2" width="76" height="142" rx="16" fill="url(#phonebody)" stroke="rgba(255,255,255,.18)" strokeWidth="1.2"/>
              {/* Screen */}
              <rect x="8" y="14" width="64" height="108" rx="8" fill="url(#screen)"/>
              {/* Screen gloss */}
              <rect x="8" y="14" width="64" height="54" rx="8" fill="url(#gloss)"/>
              {/* Notch/pill */}
              <rect x="28" y="8" width="24" height="4" rx="2" fill="rgba(255,255,255,.15)"/>
              {/* Home indicator */}
              <rect x="28" y="130" width="24" height="4" rx="2" fill="rgba(255,255,255,.15)"/>
              {/* Check icon center */}
              <circle cx="40" cy="68" r="18" fill="rgba(255,255,255,.12)"/>
              <path d="M31 68 l7 7 l11-12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              {/* Brand text on screen */}
              <text x="40" y="95" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="5.5" fontWeight="700" letterSpacing="1" fontFamily="system-ui">celuLAB</text>
            </svg>
            <div style={{ position: 'absolute', top: 14, left: 4, animation: 'celuFloat1 3.2s ease-in-out infinite', fontSize: 24 }}>🔋</div>
            <div style={{ position: 'absolute', top: 6, right: 8, animation: 'celuFloat2 4s ease-in-out infinite .5s', fontSize: 22 }}>⚙️</div>
            <div style={{ position: 'absolute', top: 126, right: 2, animation: 'celuFloat3 3.6s ease-in-out infinite 1s', fontSize: 20 }}>🛡️</div>
            <div style={{ position: 'absolute', bottom: 48, left: 2, animation: 'celuFloat4 3s ease-in-out infinite 1.5s', fontSize: 20 }}>⚡</div>
            <div style={{ position: 'absolute', bottom: 16, right: 16, animation: 'celuFloat5 2.8s ease-in-out infinite .8s', fontSize: 18 }}>🔧</div>
          </div>
        </div>

        {/* ── Video Hero placeholder (reemplazar con <video> cuando esté listo) ── */}
        {/*
        <div style={{ marginBottom: 40, borderRadius: 20, overflow: 'hidden', aspectRatio: '16/9', background: '#0D1B2A', border: '1px solid rgba(45,125,255,0.2)' }}>
          <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <source src="/videos/celulab-hero.mp4" type="video/mp4" />
          </video>
        </div>
        */}

        {/* ── Bloques: Lista + Tienda ── */}
        <div className="cl-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, marginBottom: 40 }}>
          {/* Lista de precios */}
          <div style={{ background: 'linear-gradient(135deg,rgba(13,27,42,0.95),rgba(30,64,115,0.55))', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>🔧 Servicio técnico</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Lista de precios</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.6 }}>
                Módulos, baterías, conectores, cámaras y más.<br />
                Precios actualizados con stock real.
              </p>
            </div>
            <a href="/market/celulab/lista" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', width: 'fit-content' }}>
              📋 Ver lista completa →
            </a>
          </div>
          {/* Tienda de accesorios */}
          <div style={{ background: 'linear-gradient(135deg,rgba(45,125,255,0.22),rgba(13,27,42,0.6))', border: `1px solid ${BLUE}55`, borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>🛒 Accesorios</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Tienda CeluLab</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.6 }}>
                Auriculares, cargadores, cables, smartwatches, power banks y más.
              </p>
            </div>
            <a href="/market/celulab/tienda" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE, color: '#fff', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', width: 'fit-content' }}>
              🛒 Ver catálogo →
            </a>
          </div>
        </div>

        {/* ── Cómo trabajamos ── */}
        <div style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px', fontFamily: "'Poppins', sans-serif" }}>¿Cómo funciona?</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)', margin: '0 0 20px' }}>Rápido, transparente y sin sorpresas.</p>
          <div className="cl-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
            {[
              { n: '01', icon: '📲', title: 'Traés el equipo', desc: 'En persona o coordinamos por WhatsApp' },
              { n: '02', icon: '🔍', title: 'Revisión diagnóstica', desc: 'Se cobra $15.000 e incluye informe técnico. Si aprobás la reparación, se descuenta del total' },
              { n: '03', icon: '💬', title: 'Aprobás el precio', desc: 'Precio fijo antes de tocar nada. Para repuestos se requiere el 50% de seña para poder comprar el material' },
              { n: '04', icon: '✅', title: 'Retirás reparado', desc: 'Si ingresa a la mañana, listo esa tarde. Si ingresa a la tarde, al otro día.' },
            ].map(step => (
              <div key={step.n} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', marginBottom: 8 }}>{step.n}</div>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pago / Seña ── */}
        {payConfig && (payConfig.alias || payConfig.mp_link) && (
          <div style={{ marginBottom: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>💳 Cómo pagar la seña</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16, lineHeight: 1.5 }}>
              Para repuestos se requiere el 50% de seña antes de comprar el material.
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                {payConfig.nombre && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Titular: <strong style={{ color: '#fff' }}>{payConfig.nombre}</strong></div>}
                {payConfig.alias && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                    Alias: <strong style={{ color: '#60a5fa', letterSpacing: '0.02em', fontFamily: 'monospace', fontSize: 14 }}>{payConfig.alias}</strong>
                  </div>
                )}
                {!payConfig.mp_link && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Transferencia bancaria / CVU / alias</div>}
              </div>
              {payConfig.mp_link && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(payConfig.mp_link)}`}
                    alt="QR MercadoPago"
                    style={{ width: 110, height: 110, borderRadius: 8, background: '#fff', padding: 4, display: 'block' }}
                  />
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 4 }}>Escanear con MercadoPago</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Info strip ── */}
        <div className="cl-info-strip" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 20px', marginBottom: 28, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { icon: '📍', label: 'San Luis Capital' },
            { icon: '⏰', label: 'Lun–Vie 9 a 18 · Sáb 9 a 13' },
            { icon: '🔍', label: 'Revisión diagnóstica $15.000' },
            { icon: '📞', label: '+54 9 2664 50-1140' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* ── Cotizador ── */}
        <Cotizador onRequest={p => setRequestModal(p)} />

        {/* ── Calidades de repuestos ── */}
        <style>{`
          .cl-quality-grid{display:grid;grid-template-columns:1fr;gap:12px}
          @media(min-width:540px){.cl-quality-grid{grid-template-columns:1fr 1fr}}
        `}</style>
        <div style={{ marginTop: 48, marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px', fontFamily: "'Poppins', sans-serif" }}>¿Qué calidad de repuesto usamos?</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)', margin: '0 0 20px' }}>No todos los repuestos son iguales. Te explicamos cada tipo para que elijas con información.</p>

          <div className="cl-quality-grid" style={{ marginBottom: 16 }}>
            {/* Card Módulos */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '20px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>📱 Pantallas / Módulos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { badge: 'INCELL', color: '#6366f1', desc: 'LCD genérica. Más económica, colores correctos para uso cotidiano.' },
                  { badge: 'OLED', color: '#2563EB', desc: 'OLED genérica. Mayor fidelidad de color, brillo superior y negros profundos.' },
                  { badge: 'ORIG', color: '#16a34a', desc: 'Especificaciones originales, fabricada por proveedores certificados.' },
                  { badge: 'EQUIP', color: '#d97706', desc: 'Pantalla original desmontada de equipos sin uso. 100% original.' },
                ].map(q => (
                  <div key={q.badge} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: q.color, background: q.color + '22', border: `1px solid ${q.color}44`, borderRadius: 5, padding: '3px 0', width: 52, textAlign: 'center', letterSpacing: '0.05em', flexShrink: 0, marginTop: 2 }}>{q.badge}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{q.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Baterías */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '20px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>🔋 Baterías</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { badge: 'ORIGINAL', color: '#16a34a', desc: 'Baterías originales desmontadas de equipos sin uso. La mejor opción.' },
                  { badge: 'CALID ORIG', color: '#2563EB', desc: 'Proveedores certificados, prestaciones equivalentes a las originales.' },
                  { badge: 'GEN', color: '#6366f1', desc: 'Compatibles con buena capacidad. La opción más accesible.' },
                  { badge: 'AMPS', color: '#d97706', desc: 'Marca AMPSENTRIX importada de USA. Ideal para iPhones.' },
                ].map(q => (
                  <div key={q.badge} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: q.color, background: q.color + '22', border: `1px solid ${q.color}44`, borderRadius: 5, padding: '3px 0', width: 68, textAlign: 'center', letterSpacing: '0.05em', flexShrink: 0, marginTop: 2 }}>{q.badge}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{q.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: `${BLUE}18`, border: `1px solid ${BLUE}33`, borderRadius: 10, fontSize: 13, color: '#93c5fd', lineHeight: 1.6 }}>
            💬 En cada caso te recomendamos el tipo de repuesto según tu equipo y presupuesto. Consultanos por WhatsApp antes de decidir.
          </div>
        </div>

        {/* ── Seguimiento de orden (repetido abajo) ── */}
        <div style={{ marginTop: 32, marginBottom: 8, background: `${BLUE}14`, border: `1px solid ${BLUE}33`, borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>📦</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>¿Ya ingresaste tu equipo?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Seguí el estado de tu reparación en tiempo real</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={trackInput}
              onChange={e => setTrackInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter' && trackInput.trim()) window.location.href = `/seguimiento/${trackInput.trim()}` }}
              placeholder="Ej: CL-000123"
              style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.04em' }}
            />
            <button
              onClick={() => { if (trackInput.trim()) window.location.href = `/seguimiento/${trackInput.trim()}` }}
              disabled={!trackInput.trim()}
              style={{ padding: '11px 20px', borderRadius: 10, border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14, cursor: trackInput.trim() ? 'pointer' : 'default', opacity: trackInput.trim() ? 1 : 0.45 }}
            >
              Ver estado →
            </button>
          </div>
        </div>

        {/* ── Locales asociados ── */}
        {partners.length > 0 && (
          <div style={{ marginTop: 56, marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px', fontFamily: "'Poppins', sans-serif" }}>Locales asociados</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)', margin: '0 0 24px' }}>
              Podés dejar tu celular en estos locales. Ellos lo envían al taller y te lo devuelven reparado.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {partners.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>🏪</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{p.name}</div>
                  {p.address && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>📍 {p.address}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              ¿Tenés un local y querés sumarte? Hacé click en <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Locales</strong> arriba y registrate.
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        <div style={{ marginTop: 56, marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px', fontFamily: "'Poppins', sans-serif" }}>Preguntas frecuentes</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)', margin: '0 0 24px' }}>Todo lo que necesitás saber antes de traer el equipo.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                q: '¿Cuánto sale la revisión diagnóstica?',
                a: '$15.000. Se cobra antes de tocar el equipo e incluye un informe técnico completo. Si aprobás la reparación, ese monto se descuenta del total.',
              },
              {
                q: '¿Necesito pagar algo antes de la reparación?',
                a: 'Sí. Para reparaciones que requieren repuestos, pedimos el 50% del total como seña para poder comprar el material. Para trabajos de software o sin repuesto, se paga al retirar.',
              },
              {
                q: '¿Cuánto tarda la reparación?',
                a: 'Si el equipo entra a la mañana, generalmente está listo esa misma tarde. Si entra a la tarde, al día siguiente. Te avisamos por WhatsApp cuando esté listo.',
              },
              {
                q: '¿Tienen garantía?',
                a: 'Sí. Todas las reparaciones tienen garantía mínima de 30 días. Pantallas y baterías tienen 90 días. La garantía cubre fallas relacionadas al trabajo realizado, no daños posteriores.',
              },
              {
                q: '¿Trabajan con todas las marcas y modelos?',
                a: 'Sí. Trabajamos con iPhone, Samsung, Motorola, Xiaomi, Huawei, LG, Nokia, OPPO y más. Consultanos por WhatsApp si tenés dudas con un modelo específico.',
              },
              {
                q: '¿Puedo llevar el equipo a un local cercano?',
                a: 'Sí. Contamos con locales asociados en San Luis que pueden recibir el equipo y entregártelo una vez reparado. Hacé click en "Locales" arriba para ver si hay uno cerca tuyo.',
              },
              {
                q: '¿Qué pasa si no apruebo el presupuesto?',
                a: 'Si no aprobás el presupuesto, podés retirar el equipo pagando solo la revisión diagnóstica ($15.000). No se realiza ninguna modificación al equipo.',
              },
              {
                q: '¿Cómo puedo seguir el estado de mi reparación?',
                a: 'Te mandamos actualizaciones por WhatsApp y podés consultar el estado en tiempo real ingresando el número de orden en el buscador de esta página.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: '100%', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', gap: 12 }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{faq.q}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0, transform: faqOpen === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '0 18px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 32, letterSpacing: '0.05em' }}>
          Precios orientativos · Confirmar disponibilidad antes del turno · Actualizados {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Float WA CTA */}
      <div className="cl-wa-float" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
        <a
          href={`${CELULAB_WA}?text=${encodeURIComponent('Hola! Quiero consultar un precio o sacar turno en CeluLab.')}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', borderRadius: 50, padding: '14px 26px', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 8px 32px rgba(37,211,102,0.32)' }}
        >
          <span style={{ fontSize: 18 }}>💬</span>
          <span className="cl-wa-label">Consultar por WhatsApp</span>
        </a>
      </div>

      {/* ── Chat widget ── */}
      <div className="cl-chat-float" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {chatOpen && (
          <div className="cl-chat-panel" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, width: 320, maxHeight: 460, display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', marginBottom: 10, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: BLUE, padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>🤖 Consultar precio</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>CeluLab · responde al instante</div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 8px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '9px 13px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? BLUE : 'rgba(255,255,255,0.09)',
                    fontSize: 13, color: '#fff', lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '9px 14px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.09)', fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>···</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ej: ¿Cuánto sale cambiar pantalla A54?"
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 12, outline: 'none' }}
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !chatInput.trim()}
                style={{ background: BLUE, border: 'none', borderRadius: 10, width: 36, height: 36, color: '#fff', fontSize: 17, cursor: 'pointer', flexShrink: 0, opacity: !chatInput.trim() || chatLoading ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ↑
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(o => !o)}
          style={{ background: chatOpen ? 'rgba(30,30,40,0.95)' : BLUE, border: chatOpen ? '1px solid rgba(255,255,255,0.12)' : 'none', borderRadius: 50, padding: '13px 20px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: chatOpen ? 'none' : '0 8px 28px rgba(37,99,235,.45)', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 17 }}>{chatOpen ? '✕' : '🤖'}</span>
          <span className="cl-chat-label" style={{ display: chatOpen ? 'none' : undefined }}>Consultar precio</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Cotizador ─────────────────────────────────────────────────────────────── */

type CotItem = {
  id: string; name: string; brand: string; quality: string; category: string
  stock: boolean; final_price: number | null; labor_ars: number
}

const COTIZADOR_BRANDS = ['Samsung', 'Motorola', 'iPhone', 'Xiaomi', 'Huawei', 'LG']

const REPAIR_LABEL_COT: Record<string, string> = {
  modulo_android: 'Cambio de módulo (pantalla)',
  modulo_iphone: 'Cambio de módulo (pantalla)',
  modulo_mecanico: 'Cambio de módulo mecánico',
  bateria_android: 'Cambio de batería',
  bateria_iphone: 'Cambio de batería',
  pin_carga: 'Pin de carga',
  placa_carga: 'Placa de carga',
  camara: 'Cámara',
  tapa: 'Tapa trasera',
  glass: 'Glass (vidrio)',
  placa_main: 'Placa madre',
  placa_prueba: 'Placa prueba',
  flex_interconexion: 'Flex de interconexión',
  huellas: 'Sensor huella',
  buzzer: 'Buzzer',
}

function arsF(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

const SERIES_ORDER_COT: Record<string, string[]> = {
  Samsung:  ['Serie S', 'Serie A', 'Serie M', 'Note', 'Galaxy Z', 'Serie J'],
  iPhone:   ['iPhone 16', 'iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'X / XS / XR', 'SE', '6 / 7 / 8'],
  Motorola: ['Edge', 'Moto G', 'Moto E', 'Moto One'],
  Xiaomi:   ['POCO', 'Redmi', 'Mi'],
  Huawei:   ['Mate', 'Nova', 'Serie P', 'Serie Y'],
}

function getCotSeries(brand: string, name: string): string {
  const u = name.toUpperCase()
  switch (brand) {
    case 'Samsung':
      if (/\bS\s?\d{2,3}\b|\bSFE\b/.test(u)) return 'Serie S'
      if (/\bA\s?\d{2}\b/.test(u)) return 'Serie A'
      if (/\bM\s?\d{2}\b/.test(u)) return 'Serie M'
      if (/\bNOTE\b/.test(u)) return 'Note'
      if (/\bFOLD\b|\bFLIP\b/.test(u)) return 'Galaxy Z'
      if (/\bJ\s?\d{1,2}\b/.test(u)) return 'Serie J'
      return 'Otros'
    case 'iPhone':
      if (/\b16\b/.test(name)) return 'iPhone 16'
      if (/\b15\b/.test(name)) return 'iPhone 15'
      if (/\b14\b/.test(name)) return 'iPhone 14'
      if (/\b13\b/.test(name)) return 'iPhone 13'
      if (/\b12\b/.test(name)) return 'iPhone 12'
      if (/\b11\b/.test(name)) return 'iPhone 11'
      if (/XS|XR/.test(name)) return 'X / XS / XR'
      if (/\bSE\b/i.test(name)) return 'SE'
      if (/\b[678]\b/.test(name)) return '6 / 7 / 8'
      return 'Otros'
    case 'Motorola':
      if (/\bEDGE\b/.test(u)) return 'Edge'
      if (/\bG\s?\d{2}\b|\bG\s?(PLAY|POWER|PLUS|PURE|STYLUS)\b/.test(u)) return 'Moto G'
      if (/\bE\s?\d{1,2}\b|\bE\s?PLUS\b/.test(u)) return 'Moto E'
      if (/\bONE\b/.test(u)) return 'Moto One'
      return 'Otros'
    case 'Xiaomi':
      if (/\bPOCO\b/.test(u)) return 'POCO'
      if (/\bREDMI\b/.test(u)) return 'Redmi'
      if (/\bMI\s?\d/.test(u)) return 'Mi'
      return 'Otros'
    case 'Huawei':
      if (/\bMATE\b/.test(u)) return 'Mate'
      if (/\bNOVA\b/.test(u)) return 'Nova'
      if (/\bP\s?\d{1,2}\b|\bP\s?(SMART|LITE|PRO)\b/.test(u)) return 'Serie P'
      if (/\bY\s?\d{1,2}\b/.test(u)) return 'Serie Y'
      return 'Otros'
    default: return ''
  }
}

function getModelKey(brand: string, name: string): string {
  let n = name.toUpperCase()
  n = n.replace(/^(MODULO|BATERIA|BATERÍA|CAMARA|CÁMARA|PANTALLA|TAPA|GLASS|PIN DE CARGA|PLACA DE CARGA|PLACA|FLEX)\s+/i, '')
  switch (brand) {
    case 'Motorola': while (/^(?:MOTOROLA|MOTO|MOT|M)\s+/i.test(n)) n = n.replace(/^(?:MOTOROLA|MOTO|MOT|M)\s+/i, ''); break
    case 'Samsung':  n = n.replace(/^(SAMSUNG|SAM)\s+/i, ''); break
    case 'iPhone':   n = n.replace(/^(IPHONE)\s+/i, ''); break
    case 'Xiaomi':   n = n.replace(/^(XIAOMI)\s+/i, ''); break
    case 'Huawei':   n = n.replace(/^(HUAWEI|HW)\s+/i, ''); break
    case 'LG':       n = n.replace(/^(LG)\s+/i, ''); break
    case 'TCL':      n = n.replace(/^(TCL)\s+/i, ''); break
  }
  n = n.replace(/\s+(OLED|INCELL|MECAN[IÍ]CO|ORIG|ORIGINAL|CALID|COPY|GEN|AMPS|WUZIP|T20|AMM|OEM)\b.*$/i, '')
  n = n.replace(/\s+(XT|NP)-?\d+.*$/i, '')
  n = n.replace(/\s+-\s*\d+.*$/i, '')
  n = n.replace(/\s+(NEGRO|NEGRA|BLANCO|BLANCA|AZUL|GRIS|VERDE|ROJO|ROJA|VIOLETA|ORO|GOLD|BLACK|WHITE|BLUE|GRAY|GREEN|RED)\b.*$/i, '')
  n = n.replace(/\s+(C\/MARCO|C\/M|VR)\b.*$/i, '')
  // Normalizar nombres multi-modelo tipo "G22 / E13 / E32" → "G22"
  n = n.replace(/\s*\/.*$/, '')
  // Eliminar códigos entre paréntesis tipo "(NH50)"
  n = n.replace(/\s*\(.*$/, '')
  // Limpiar trailing guiones y espacios
  n = n.replace(/[\s\-]+$/, '')
  return n.trim()
}

function getVariantLabel(name: string): string {
  const n = name.toUpperCase()
  const tags: string[] = []
  if (/C\/M(?:ARCO)?(?:\s|$|\/)/.test(n) || /CON\s+MARCO/.test(n)) tags.push('Con marco')
  else if (/SIN\s+MARCO/.test(n)) tags.push('Sin marco')
  if (/CALID\s*ORIG/.test(n)) tags.push('Calidad original')
  else if (/ORIG(?:INAL)?\s*EQUIP/.test(n)) tags.push('Original equipado')
  else if (/\bORIG(?:INAL)?\b/.test(n)) tags.push('Original')
  else if (/MECÁNICO|MECANICO/.test(n)) tags.push('Mecánico')
  else if (/\bGEN(?:ÉRICO|ERICO)?\b/.test(n)) tags.push('Genérico')
  return tags.join(' · ')
}

const REPAIR_TYPES_COT = [
  { label: 'Módulo / Pantalla',   icon: '📱', test: (c: string) => c.startsWith('modulo') },
  { label: 'Batería',             icon: '🔋', test: (c: string) => c.startsWith('bateria') },
  { label: 'Pin / Placa carga',   icon: '⚡', test: (c: string) => ['pin_carga', 'placa_carga'].includes(c) },
  { label: 'Cámara',              icon: '📷', test: (c: string) => c === 'camara' },
  { label: 'Tapa trasera',        icon: '🔲', test: (c: string) => c === 'tapa' },
  { label: 'Glass / Vidrio',      icon: '💎', test: (c: string) => c === 'glass' },
  { label: 'Placa / Electrónica', icon: '🔌', test: (c: string) => ['placa_main', 'placa_prueba'].includes(c) },
  { label: 'Flex / Conector',     icon: '🔗', test: (c: string) => c === 'flex_interconexion' },
  { label: 'Huella dactilar',     icon: '👆', test: (c: string) => c === 'huellas' },
  { label: 'Altavoz / Buzzer',    icon: '🔊', test: (c: string) => c === 'buzzer' },
]

function Cotizador({ onRequest }: { onRequest: (p: RequestPrefill) => void }) {
  const [brand, setBrand] = useState('')
  const [allItems, setAllItems] = useState<CotItem[]>([])
  const [loading, setLoading] = useState(false)
  const [series, setSeries] = useState('')
  const [modelKey, setModelKey] = useState('')
  const [repairType, setRepairType] = useState('')
  const [cart, setCart] = useState<CotItem[]>([])

  async function pickBrand(b: string) {
    setBrand(b); setSeries(''); setModelKey(''); setAllItems([]); setLoading(true)
    // modulos tiene campo brand bien poblado → filtrar por brand
    // los demás tabs tienen brand='' en muchos registros → buscar por nombre
    const nameQ: Record<string, string> = {
      Motorola: 'moto', Samsung: 'samsung', iPhone: 'iphone',
      Xiaomi: 'xiaomi', Huawei: 'huawei', LG: 'LG', TCL: 'TCL',
    }
    const q = nameQ[b] ?? b.toLowerCase()
    const results = await Promise.all([
      fetch(`/api/celulab/lista?tab=modulos&brand=${encodeURIComponent(b)}&limit=200`).then(r => r.json()).catch(() => ({ items: [] })),
      fetch(`/api/celulab/lista?tab=baterias&q=${encodeURIComponent(q)}&limit=300`).then(r => r.json()).catch(() => ({ items: [] })),
      fetch(`/api/celulab/lista?tab=partes&q=${encodeURIComponent(q)}&limit=300`).then(r => r.json()).catch(() => ({ items: [] })),
      fetch(`/api/celulab/lista?tab=camaras&q=${encodeURIComponent(q)}&limit=200`).then(r => r.json()).catch(() => ({ items: [] })),
      fetch(`/api/celulab/lista?tab=tapas&q=${encodeURIComponent(q)}&limit=200`).then(r => r.json()).catch(() => ({ items: [] })),
      fetch(`/api/celulab/lista?tab=glass&q=${encodeURIComponent(q)}&limit=200`).then(r => r.json()).catch(() => ({ items: [] })),
    ])
    setAllItems(results.flatMap((r: { items?: CotItem[] }) => r.items ?? []))
    setLoading(false)
  }

  // Items del tipo de reparación seleccionado
  const tabItems = useMemo(() => {
    if (!repairType) return []
    const rt = REPAIR_TYPES_COT.find(r => r.label === repairType)
    if (!rt) return []
    return allItems.filter(it => rt.test(it.category) && it.final_price != null)
  }, [allItems, repairType])

  const availableSeries = useMemo(() => {
    const order = SERIES_ORDER_COT[brand]
    if (!order) return []
    const found = new Set<string>()
    for (const it of tabItems) found.add(getCotSeries(brand, it.name))
    return order.filter(s => found.has(s))
  }, [tabItems, brand])

  const seriesItems = useMemo(() => {
    if (!series) return tabItems
    return tabItems.filter(it => getCotSeries(brand, it.name) === series)
  }, [tabItems, brand, series])

  const availableModels = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const it of seriesItems) {
      const m = getModelKey(brand, it.name)
      if (m && !seen.has(m)) { seen.add(m); out.push(m) }
    }
    return out.sort()
  }, [seriesItems, brand])

  // Items para este modelo + tipo de reparación (ya filtrado por tabItems)
  const modelItems = useMemo(() =>
    modelKey ? seriesItems.filter(it => getModelKey(brand, it.name) === modelKey) : []
  , [seriesItems, brand, modelKey])

  const cartTotal = cart.reduce((s, it) => s + (it.final_price ?? 0), 0)

  function addToCart(it: CotItem) {
    setCart(prev => [...prev, it])
    setRepairType('')   // Vuelve al paso 1
    setSeries('')       // Limpia serie para que el próximo tipo vaya directo al modelo
  }

  function requestAll() {
    const items = cart.length > 0 ? cart : modelItems
    onRequest({
      modelo: `${brand}${modelKey ? ' ' + modelKey : ''}`,
      servicio: Array.from(new Set(items.map(it => REPAIR_LABEL_COT[it.category] || it.category))).join(' + '),
      precio: cartTotal > 0 ? arsF(cartTotal) : undefined,
    })
  }

  return (
    <div style={{ marginBottom: 44, padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20 }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, flexWrap: 'wrap', lineHeight: 2 }}>
          {repairType ? (
            <button onClick={() => { setRepairType(''); setSeries(''); setModelKey(''); setBrand(''); setAllItems([]) }}
              style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontSize: 13, padding: 0, fontWeight: 700 }}>{repairType}</button>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>💰 Cotizador</span>
          )}
          {brand && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <button onClick={() => { setBrand(''); setAllItems([]); setSeries(''); setModelKey('') }}
              style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontSize: 13, padding: 0 }}>{brand}</button>
          </>}
          {series && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <button onClick={() => { setSeries(''); setModelKey('') }}
              style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontSize: 13, padding: 0 }}>{series}</button>
          </>}
          {modelKey && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{modelKey}</span>
          </>}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>💰 Cotizador</div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div style={{ background: `${BLUE}18`, border: `1px solid ${BLUE}44`, borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>🛒 Reparaciones agregadas</div>
          {cart.map((it, i) => {
            const v = getVariantLabel(it.name)
            return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                {REPAIR_LABEL_COT[it.category] || it.category}
                {v && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginLeft: 5 }}>({v})</span>}
                {it.quality && <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 4, padding: '1px 5px', marginLeft: 6 }}>{it.quality}</span>}
              </span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{it.final_price ? arsF(it.final_price) : '—'}</span>
                <button onClick={() => setCart(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, fontSize: 14 }}>✕</button>
              </div>
            </div>
            )
          })}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total estimado</span>
            <span style={{ color: '#fff' }}>{arsF(cartTotal)}</span>
          </div>
          <button onClick={requestAll}
            style={{ width: '100%', marginTop: 12, padding: '12px', borderRadius: 10, border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            📋 Solicitar turno · {cart.length} reparación{cart.length !== 1 ? 'es' : ''}
          </button>
        </div>
      )}

      {/* ── Paso 1: Tipo de reparación ── */}
      {!repairType ? (
        <div>
          {!brand && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>¿Cuánto sale reparar mi celular?</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 16px', lineHeight: 1.5 }}>Precio estimado al instante. Sujeto a stock y confirmación.</p>
            </>
          )}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
            {cart.length > 0 && modelKey ? `¿Agregar otra reparación para ${brand} ${modelKey}?` : '¿Qué querés reparar?'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {REPAIR_TYPES_COT.map(rt => {
              const inCart = cart.some(it => rt.test(it.category))
              return (
                <button key={rt.label} onClick={() => setRepairType(rt.label)} style={{
                  padding: '9px 16px', borderRadius: 20,
                  border: inCart ? `1px solid ${BLUE}88` : '1px solid rgba(255,255,255,0.12)',
                  background: inCart ? `${BLUE}22` : 'rgba(255,255,255,0.06)',
                  color: inCart ? BLUE : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {rt.icon} {rt.label}{inCart ? ' ✓' : ''}
                </button>
              )
            })}
          </div>
        </div>

      /* ── Paso 2: Marca ── */
      ) : !brand ? (
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>¿Cuál es tu marca de celular?</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COTIZADOR_BRANDS.map(b => (
              <button key={b} onClick={() => pickBrand(b)} style={{
                padding: '9px 20px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>{b === 'iPhone' ? '🍎' : '📱'} {b}</button>
            ))}
            <button onClick={() => pickBrand('Varios')} style={{
              padding: '9px 20px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent', color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: 13, cursor: 'pointer',
            }}>Otra marca</button>
          </div>
        </div>

      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Cargando repuestos...</div>

      /* ── Paso 3: Familia / Serie ── */
      ) : !series && !modelKey && availableSeries.length > 0 ? (
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>¿Cuál es la familia de tu {brand}?</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {availableSeries.map(s => (
              <button key={s} onClick={() => setSeries(s)} style={{
                padding: '9px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>{s}</button>
            ))}
            <button onClick={() => setSeries('Otros')} style={{
              padding: '9px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)',
              background: 'transparent', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 13, cursor: 'pointer',
            }}>Otro modelo</button>
          </div>
        </div>

      /* ── Paso 4: Modelo ── */
      ) : !modelKey ? (
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>¿Cuál es el modelo de tu {brand}?</div>
          {availableModels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 16 }}>No hay precios para esta familia.<br />Consultanos por WhatsApp.</div>
              <button onClick={() => onRequest({ modelo: `${brand} ${series}`, servicio: repairType })}
                style={{ background: BLUE, color: '#fff', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                📋 Solicitar presupuesto
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
              {availableModels.map(m => (
                <button key={m} onClick={() => setModelKey(m)} style={{
                  padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                }}>{m}</button>
              ))}
            </div>
          )}
        </div>

      /* ── Paso 5: Opciones del modelo para esa reparación ── */
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {modelItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 16 }}>No encontramos precio para este modelo.<br />Consultanos por WhatsApp.</div>
              <button onClick={() => onRequest({ modelo: `${brand} ${modelKey}`, servicio: repairType })}
                style={{ background: BLUE, color: '#fff', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                📋 Solicitar presupuesto
              </button>
            </div>
          ) : modelItems.map(it => {
            const variant = getVariantLabel(it.name)
            return (
              <div key={it.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: variant ? 4 : 0 }}>
                    {REPAIR_LABEL_COT[it.category] || it.category}
                  </div>
                  {variant && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: it.quality ? 4 : 0 }}>{variant}</div>
                  )}
                  {it.quality && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.12)', color: '#93c5fd', letterSpacing: '0.05em' }}>
                      {it.quality}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>{it.final_price ? arsF(it.final_price) : '—'}</span>
                  <button onClick={() => addToCart(it)}
                    style={{ background: BLUE, color: '#fff', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Agregar
                  </button>
                </div>
              </div>
            )
          })}
          <div style={{ padding: '11px 16px', borderRadius: 10, background: `${BLUE}14`, fontSize: 12, color: '#93c5fd', lineHeight: 1.6 }}>
            💡 Precio estimado, incluye repuesto + mano de obra. Sujeto a stock y confirmación. Revisión diagnóstica ($15.000) se descuenta si aprobás.
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Modal de solicitud de turno ────────────────────────────────────────────── */

type RequestPrefill = { servicio?: string; modelo?: string; precio?: string }

function RequestModal({ prefill, onClose }: { prefill: RequestPrefill; onClose: () => void }) {
  const [form, setForm] = useState({
    nombre: '',
    whatsapp: '',
    equipo: prefill.modelo || '',
    problema: '',
  })

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function send() {
    if (!form.nombre || !form.whatsapp) return
    const lines = [
      '📱 *Consulta CeluLab*',
      '',
      `👤 Nombre: ${form.nombre}`,
      `📞 WhatsApp: ${form.whatsapp}`,
    ]
    if (form.equipo) lines.push(`📱 Equipo: ${form.equipo}`)
    if (prefill.servicio) lines.push(`🔧 Reparación: ${prefill.servicio}`)
    if (prefill.precio) lines.push(`💰 Precio estimado: ${prefill.precio}`)
    if (form.problema) lines.push(`\n💬 Problema: ${form.problema}`)
    window.open(`${CELULAB_WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
    onClose()
  }

  const ready = form.nombre.trim() && form.whatsapp.trim()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#111', borderRadius: 22, padding: '28px 24px 22px', width: '100%', maxWidth: 420, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              📋 Solicitar turno
            </div>
            {prefill.servicio && (
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 2 }}>{prefill.servicio}</div>
            )}
            {prefill.modelo && (
              <div style={{ fontSize: 13, color: '#60a5fa' }}>{prefill.modelo}</div>
            )}
            {prefill.precio && (
              <div style={{ fontSize: 13, color: '#4ade80', marginTop: 2, fontWeight: 600 }}>Precio estimado: {prefill.precio}</div>
            )}
            {!prefill.servicio && !prefill.modelo && (
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Consulta general</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 24, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0, marginLeft: 12 }}>×</button>
        </div>

        {/* Fields */}
        {([
          { key: 'nombre', label: 'Tu nombre *', placeholder: 'Ej: Martín García', type: 'text' },
          { key: 'whatsapp', label: 'Tu WhatsApp *', placeholder: '+54 9 266 XXXXXXX', type: 'tel' },
          { key: 'equipo', label: 'Marca y modelo del equipo', placeholder: 'Ej: Motorola G22 negro', type: 'text' },
        ] as const).map(f => (
          <div key={f.key} style={{ marginBottom: 11 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>{f.label}</div>
            <input
              type={f.type}
              value={(form as Record<string, string>)[f.key]}
              onChange={e => upd(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Descripción del problema</div>
          <textarea
            value={form.problema}
            onChange={e => upd('problema', e.target.value)}
            placeholder="Ej: Se me cayó y la pantalla quedó rota, el táctil no responde..."
            rows={3}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'system-ui' }}
          />
        </div>

        <button
          onClick={send}
          disabled={!ready}
          style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: ready ? '#25d366' : 'rgba(37,211,102,0.25)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: ready ? 'pointer' : 'default', transition: 'background 0.15s' }}
        >
          📲 Enviar consulta por WhatsApp →
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
          Abre WhatsApp con toda la info completada. Te respondemos a la brevedad.
        </div>
      </div>
    </div>
  )
}
