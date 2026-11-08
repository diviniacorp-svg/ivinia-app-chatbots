'use client'
import { useState } from 'react'

export default function TechnicianPin({ manage = false, onSuccess }: { manage?: boolean; onSuccess?: () => void }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  return <form style={{display:'grid', gap:8, padding:12}} onSubmit={async event => {
    event.preventDefault()
    const form = event.currentTarget
    const credentials = Object.fromEntries(new FormData(form))
    setBusy(true)
    try {
      const response = await fetch('/api/celulab/technicians', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...credentials, manage}) })
      const data = await response.json()
      if (!response.ok) { setMessage(data.error || 'Intentá nuevamente.'); return }
      form.reset()
      setMessage(manage ? 'PIN guardado.' : '')
      onSuccess?.()
    } catch { setMessage('No pudimos conectar. Volvé a intentar.') }
    finally { setBusy(false) }
  }}>
    <label>Usuario técnico<input required name="username" pattern="[a-z0-9_\-]{2,40}" autoCapitalize="none" style={{width:'100%'}} /></label>
    <label>{manage ? 'Nuevo PIN' : 'PIN'}<input required name="pin" type="password" inputMode="numeric" pattern="[0-9]{6,12}" autoComplete={manage ? 'new-password' : 'current-password'} style={{width:'100%'}} /></label>
    <button disabled={busy}>{manage ? 'Guardar PIN individual' : 'Entrar al catálogo técnico'}</button>
    {message && <span role="status">{message}</span>}
  </form>
}