'use client'
import { useRef, useState } from 'react'
import { loadOrderTracking, type OrderTracking } from './order-tracking'

export default function ShareOrder({id, number, phone}: {id: string; number: string; phone?: string | null}) {
  const [recipient, setRecipient] = useState(phone || '')
  const [error, setError] = useState('')
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const pending = useRef(false)
  async function prepare() {
    if (tracking || pending.current) return
    pending.current = true
    setError('')
    try {
      setTracking(await loadOrderTracking(id))
    } catch {
      setError('No se pudo generar el enlace. Volvé a abrir para reintentar.')
    } finally {
      pending.current = false
    }
  }
  return <details onToggle={e => { if (e.currentTarget.open) void prepare() }} style={{ fontSize: 13, minWidth: 0, maxWidth: '100%' }}>
    <summary style={{ cursor: 'pointer', fontWeight: 600, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, padding: '8px 16px' }}>Seguimiento · QR y WhatsApp</summary>
    <form onSubmit={event => {
      event.preventDefault()
      if (!tracking) return
      const digits = recipient.replace(/[^0-9]/g, '')
      if (recipient.trim() && (digits.length < 8 || digits.length > 15)) {
        setError('Revisá el número con código de país.')
        return
      }
      const text = ['Orden CeluLab ' + number, 'Seguimiento: ' + tracking.url].join('\n')
      window.open('https://wa.me/' + digits + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer')
      setError('')
    }} style={{ display: 'grid', gap: 8, padding: 10 }}>
      {tracking && <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderRadius: 12, background: '#f0fdf4', padding: 8 }}>
        <img src={tracking.qr} width={104} height={104} alt="QR de seguimiento de la orden" />
        <a href={tracking.url} target="_blank" rel="noreferrer" style={{ color: '#166534', fontWeight: 600 }}>Abrir seguimiento</a>
      </div>}
      <label>Número con código de país<input type="tel" value={recipient} onChange={e => setRecipient(e.target.value)} style={{ display: 'block', maxWidth: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: 8 }} /></label>
      <small>Podés cambiar el número o dejarlo vacío para elegir un contacto en WhatsApp.</small>
      <button style={{ padding: 8, borderRadius: 8, background: '#2563eb', color: 'white' }} disabled={!tracking}>Abrir WhatsApp</button>
      {error && <span role="alert">{error}</span>}
    </form>
  </details>
}
