'use client'
import {useState} from 'react'

export default function ShareOrder({id,number,phone,pin}:{id:string;number:string;phone?:string|null;pin?:string}) {
  const [recipient,setRecipient]=useState(phone||'')
  const [error,setError]=useState('')
  const [path,setPath]=useState('')
  async function prepare(){
    const r=await fetch('/api/celulab/work-orders/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'share',pin})})
    if(!r.ok) throw new Error()
    setPath((await r.json()).path)
  }
  return <details onToggle={e=>{if(e.currentTarget.open&&!path)prepare().catch(()=>setError('No se pudo generar el enlace. Volvé a abrir para reintentar.'))}} style={{fontSize:13,minWidth:0,maxWidth:'100%'}}>
    <summary style={{cursor:'pointer',fontWeight:600,background:'#fff',border:'1px solid #e5e7eb',borderRadius:9,padding:'8px 16px'}}>Enviar orden por WhatsApp</summary>
    <form onSubmit={event=>{
      event.preventDefault()
      const digits=recipient.replace(/\D/g,'')
      if(recipient.trim() && (digits.length<8 || digits.length>15)){setError('Revisá el número con código de país.');return}
      const text='Orden CeluLab '+number+'\nSeguimiento: '+window.location.origin+path
      window.open('https://wa.me/'+digits+'?text='+encodeURIComponent(text),'_blank','noopener,noreferrer')
      setError('')
    }} style={{display:'grid',gap:8,padding:10}}>
      <label>Número con código de país<input type="tel" value={recipient} onChange={e=>setRecipient(e.target.value)} style={{display:'block',maxWidth:'100%',border:'1px solid #d1d5db',borderRadius:8,padding:8}} /></label>
      <small>Podés cambiar el número o dejarlo vacío para elegir un contacto en WhatsApp.</small>
      <button style={{padding:8,borderRadius:8,background:'#2563eb',color:'white'}} disabled={!path}>Abrir WhatsApp</button>{error && <span role="alert">{error}</span>}
    </form>
  </details>
}