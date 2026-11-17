'use client'
import {catalogGroup} from '../../../celulab/_components/QuoteParts'
import type { QuoteOrderSeed } from '../../../celulab/_components/quote-order'
import {quoteGroups,quoteSummary,type QuoteLine} from '../../../celulab/_components/quote-groups'
import {useEffect,useState} from 'react'
type Rate={job:string;labor_ars:number|null}
type Quote={quote_id:string;revision:number;issued_at:string;partner_id:string|null;issuer:string;customer:string;customer_phone:string;lines:QuoteLine[];order_id?:string|null}
const card={background:'white',border:'1px solid #e2e8f0',borderRadius:12,padding:14,margin:'10px 0'}
const btn={border:'1px solid #ccd7ea',borderRadius:8,padding:'7px 12px',color:'#244c99',background:'white',cursor:'pointer'}
function color(id:string|null){let h=0;for(const c of id||'CeluLab')h=(h*31+c.charCodeAt(0))>>>0;return 'hsl('+h%360+',58%,40%)'}
async function api(body:object){const r=await fetch('/api/celulab/quotes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error();return r.json()}
export default function QuotesTab({ratesOnly=false,catalogTabs=[],partner,onConvert}:{ratesOnly?:boolean;catalogTabs?:string[];partner?:string;onConvert?:(seed:QuoteOrderSeed)=>void}){
 const [search,setSearch]=useState('')
 const [quotes,set]=useState<Quote[]>([]),[rates,setRates]=useState<Rate[]>([]),[offset,page]=useState(0),[more,next]=useState(false),[msg,status]=useState(''),[busy,wait]=useState(false)
 async function get(n:number){wait(true);try{const data:Quote[]=await api({action:'archive',offset:n,partner});set(q=>n?[...q,...data]:data);page(n+data.length);next(data.length===100)}catch{status('No se pudo leer el archivo.')}finally{wait(false)}}
 useEffect(()=>{if(!ratesOnly){get(0);return}api({action:'rates'}).then(setRates).catch(()=>status('No se pudo cargar la mano de obra.'))},[ratesOnly,partner])
 const grouped=new Map<string,Quote[]>();for(const q of quotes){const g=grouped.get(q.quote_id)||[];g.push(q);grouped.set(q.quote_id,g)}
 const query=search.trim().toLocaleLowerCase('es-AR')
 const matches=Array.from(grouped.values()).filter(vs=>!query||vs.some(q=>[q.customer,q.customer_phone,q.issuer,...q.lines.map(l=>l.device+' '+l.job)].some(v=>v?.toLocaleLowerCase('es-AR').includes(query))))
 return <section style={{fontFamily:'inherit',fontSize:13,color:'#233047'}}>
 {msg&&<p role="status">{msg}</p>}{!ratesOnly?<><input type="search" aria-label="Buscar presupuesto" placeholder="Buscar por cliente, teléfono, equipo o reparación" value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',boxSizing:'border-box',border:'1px solid #d1d5db',borderRadius:10,padding:'10px 12px',font:'inherit',background:'#fff'}}/>
 {!matches.length&&!busy&&<p>{query?'No hay coincidencias entre los presupuestos cargados.':'Sin presupuestos emitidos.'}</p>}
 {matches.map(versions=>{const q=versions[0];return <details key={q.quote_id} style={{...card,borderLeft:'4px solid '+color(q.partner_id)}}><summary style={{cursor:'pointer'}}><strong>{q.customer||'Sin nombre'}</strong> · <span style={{color:color(q.partner_id)}}>{q.issuer}</span> · {new Date(q.issued_at).toLocaleString('es-AR',{timeZone:'America/Argentina/Buenos_Aires'})}</summary>{q.customer_phone&&<p>{q.customer_phone}</p>}
 {onConvert&&!q.order_id&&quoteGroups(q.lines).map((group,i)=>{const device=group.variants[0]?.lines[0]?.device;if(!device)return null
 return <button type="button" key={i} style={{...btn,margin:'8px 6px 0 0',borderRadius:16}} onClick={()=>onConvert({quoteId:q.quote_id,revision:q.revision,partnerId:q.partner_id,customer:q.customer,phone:q.customer_phone,device,jobs:group.variants[0].lines.map(l=>l.job)})}>Crear orden{group.title&&' · '+device}</button>})}
 {versions.map(v=><div key={v.revision}><h4>Versión {v.revision}</h4><pre style={{whiteSpace:'pre-wrap',font:'inherit'}}>{quoteSummary(v.lines)}</pre></div>)}</details>})}
 {more&&<button style={btn} disabled={busy} onClick={()=>get(offset)}>Cargar presupuestos anteriores</button>}</>:rates.filter(r=>!catalogTabs.includes(catalogGroup(r.job)?.[0]||'')).map(r=><form key={r.job} style={{...card,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}} onSubmit={async e=>{e.preventDefault();const raw=new FormData(e.currentTarget).get('amount');try{await api({action:'rate',job:r.job,amount:raw===''?null:Number(raw)});setRates(rows=>rows.map(x=>x.job===r.job?{...x,labor_ars:raw===''?null:Number(raw)}:x));status('Tarifa guardada: '+r.job)}catch{status('No se pudo guardar la tarifa.')}}}><strong style={{flex:'1 1 220px'}}>{r.job}</strong><input style={btn} aria-label={'Mano de obra en pesos para '+r.job} type="number" min="0" step="1" name="amount" placeholder="A confirmar" defaultValue={r.labor_ars??''}/><button style={btn}>Guardar</button></form>)}</section>
}
