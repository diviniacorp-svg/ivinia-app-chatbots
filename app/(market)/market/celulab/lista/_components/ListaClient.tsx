'use client'
import { useState, useEffect } from 'react'
import CeluLabPriceList from '../../_components/CeluLabPriceList'

export default function ListaClient({ techPct = 70 }: { techPct?: number }) {
  void techPct
  const [localUnlocked, setLocalUnlocked] = useState(false)
  const [localInfo, setLocalInfo] = useState<{ slug: string; name: string } | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinVal, setPinVal] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('celulab-local-pin') === 'ok') {
      setLocalUnlocked(true)
      const saved = sessionStorage.getItem('celulab-local-info')
      if (saved) setLocalInfo(JSON.parse(saved))
    }
  }, [])

  async function tryLocalPin() {
    if (!pinVal.trim()) return
    setPinLoading(true)
    const res = await fetch('/api/celulab/partners/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinVal.trim() }),
    }).then(r => r.json()).catch(() => null)
    setPinLoading(false)
    if (res?.slug) {
      const info = { slug: res.slug, name: res.name }
      setLocalUnlocked(true)
      setLocalInfo(info)
      sessionStorage.setItem('celulab-local-pin', 'ok')
      sessionStorage.setItem('celulab-local-info', JSON.stringify(info))
      setShowPinModal(false)
      setPinVal('')
    } else {
      setPinErr(true)
      setPinVal('')
      setTimeout(() => setPinErr(false), 2000)
    }
  }

  return (
    <>
      <CeluLabPriceList
        localUnlocked={localUnlocked}
        onOpenPin={() => setShowPinModal(true)}
        localName={localInfo?.name}
        localSlug={localInfo?.slug}
      />
      {showPinModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{
            background: '#111', border: '1px solid #222', borderRadius: 20,
            padding: '36px 32px', width: 320, textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔓</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Acceso local</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              Ingresá tu PIN para ver tus comisiones
            </div>
            <input
              type="password" maxLength={6} value={pinVal} autoFocus
              onChange={e => setPinVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryLocalPin()}
              placeholder="••••"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${pinErr ? '#ef4444' : '#2a2a2a'}`,
                background: '#0d0d0d', color: '#fff', fontSize: 20,
                textAlign: 'center', letterSpacing: '0.4em', outline: 'none',
                boxSizing: 'border-box', marginBottom: 10,
              }}
            />
            {pinErr && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>PIN incorrecto</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowPinModal(false); setPinVal('') }}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #2a2a2a', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}
              >Cancelar</button>
              <button
                onClick={tryLocalPin}
                disabled={pinLoading}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: pinLoading ? 'wait' : 'pointer', fontSize: 13, opacity: pinLoading ? 0.7 : 1 }}
              >{pinLoading ? '...' : 'Entrar →'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}