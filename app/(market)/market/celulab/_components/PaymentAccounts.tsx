'use client'
import {useEffect,useState} from 'react'
import type {PaymentAccount} from '@/lib/celulab/payment-accounts'
const input={border:'1px solid #cbd5e1',borderRadius:8,padding:'8px 10px',background:'white',font:'inherit'}
export type DepositMethod='efectivo'|'transferencia'|'mercadopago'
export function usePaymentAccounts(partner?:string|null,enabled=true){
 const [items,setItems]=useState<PaymentAccount[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false)
 useEffect(()=>{
  if(!enabled)return
  const c=new AbortController();setLoading(true);setError('')
  fetch('/api/celulab/payment-accounts'+(partner?'?partner='+encodeURIComponent(partner):''),{signal:c.signal}).then(async r=>{
   const value=await r.json()
   if(!r.ok||!Array.isArray(value))throw Error()
   if(!c.signal.aborted)setItems(value)
  }).catch(()=>{if(!c.signal.aborted)setError('No se pudieron cargar las cuentas.')}).finally(()=>{if(!c.signal.aborted)setLoading(false)})
  return ()=>c.abort()
 },[partner,enabled])
 return {items,setItems,error,loading}
}
export default function PaymentAccounts(){
 const {items,setItems,error,loading}=usePaymentAccounts(),[message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 const edit=(id:string,change:Partial<PaymentAccount>)=>setItems(rows=>rows.map(a=>a.id===id?{...a,...change}:a))
 function upload(id:string,file?:File){
  if(!file)return
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>126000){setMessage('Elegí una imagen PNG, JPG o WebP de hasta 126 KB.');return}
  const reader=new FileReader()
  reader.onload=()=>{if(typeof reader.result==='string'){edit(id,{qr:reader.result});setMessage('QR listo para guardar.')}}
  reader.readAsDataURL(file)
 }
 async function save(){
  setBusy(true);setMessage('')
  try{const r=await fetch('/api/celulab/payment-accounts',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(items)});const data=await r.json();if(!r.ok)throw Error(data.error||'Error al guardar');setMessage('Cuentas guardadas.')}
  catch(e){setMessage(e instanceof Error?e.message:'No se pudo guardar.')}finally{setBusy(false)}
 }
 return <details style={{border:'1px solid #dce4ed',borderRadius:12,padding:14,margin:'12px 0',background:'white'}}>
  <summary style={{cursor:'pointer',fontWeight:700}}>Cuentas de transferencia y QR</summary>
  <p style={{fontSize:13,color:'#475569'}}>Los alias y sus QR se muestran al elegir Transferencia en el ingreso.</p>
  {items.map(a=><div key={a.id} style={{display:'grid',gap:8,marginBlock:10,padding:10,border:'1px solid #e2e8f0',borderRadius:8}}>
   <label>Nombre de la cuenta <input style={input} value={a.name} onChange={e=>edit(a.id,{name:e.target.value})}/></label>
   <label>Alias <input style={input} value={a.alias} onChange={e=>edit(a.id,{alias:e.target.value})}/></label>
   <label>QR de la cuenta <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(a.id,e.target.files?.[0])}/></label>
   {a.qr&&<img src={a.qr} width={105} height={105} style={{objectFit:'contain'}} alt={'QR de '+(a.name||'esta cuenta')}/>}
   <div>{a.qr&&<button type="button" onClick={()=>edit(a.id,{qr:''})}>Quitar QR</button>} <button type="button" onClick={()=>setItems(rows=>rows.filter(r=>r.id!==a.id))}>Quitar cuenta</button></div>
  </div>)}
  <button type="button" disabled={loading||!!error||items.length>=5} onClick={()=>setItems(rows=>[...rows,{id:crypto.randomUUID(),name:'',alias:'',qr:''}])}>+ Agregar cuenta</button> <button type="button" disabled={busy||loading||!!error} onClick={save}>{busy?'Guardando…':'Guardar cuentas'}</button>
  <p role="status">{error||message}</p>
 </details>
}
