'use client'
import {useState} from 'react'

export default function ShareOrder({number,phone}:{number:string;phone?:string|null}) {
  const [recipient,setRecipient]=useState(phone||'')
  const [error,setError]=useState('')
  return <details style={{margin:'12px 0'}}>
    <summary style={{cursor:'pointer',fontWeight:700}}>Enviar orden por WhatsApp</summary>
    <form onSubmit={event=>{
      event.preventDefault()
      const digits=recipient.replace(/\D/g,'')
      if(recipient.trim() && (digits.length<8 || digits.length>15)){setError('Revisá el número con código de país.');return}
      const text='Orden CeluLab '+number+'\nSeguimiento: '+window.location.origin+'/seguimiento/'+encodeURIComponent(number)
      window.open('https://wa.me/'+digits+'?text='+encodeURIComponent(text),'_blank','noopener,noreferrer')
      setError('')
    }} style={{display:'grid',gap:8,padding:10}}>
      <label>Número con código de país<input type="tel" value={recipient} onChange={e=>setRecipient(e.target.value)} style={{display:'block',maxWidth:'100%'}} /></label>
      <small>Podés cambiar el número o dejarlo vacío para elegir un contacto en WhatsApp.</small>
      <button>Abrir WhatsApp</button>{error && <span role="alert">{error}</span>}
    </form>
  </details>
}