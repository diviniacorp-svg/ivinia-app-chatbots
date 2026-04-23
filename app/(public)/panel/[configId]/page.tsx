'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { getThemeForRubro } from '@/lib/turnero-themes'

interface Appointment {
  id: string
  service_name: string
  service_duration_minutes: number
  service_price_ars: number
  appointment_date: string
  appointment_time: string
  customer_name: string
  customer_phone: string
  customer_notes: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  sena_ars?: number
  created_at: string
}

interface Service {
  id: string
  category: string
  name: string
  description: string
  duration_minutes: number
  price_ars: number
  deposit_percentage: number
}

interface DaySlot { open: string; close: string }
interface Schedule { lun: DaySlot|null; mar: DaySlot|null; mie: DaySlot|null; jue: DaySlot|null; vie: DaySlot|null; sab: DaySlot|null; dom: DaySlot|null }

interface Product {
  id: string
  name: string
  category?: string
  price_ars: number
  description?: string
  photo_url?: string
  stock?: number
  discount_active?: boolean
  discount_percent?: number
}

interface PanelData {
  company_name: string
  color: string
  owner_phone: string
  rubro?: string
  appointments: Appointment[]
  services: Service[]
  schedule: Schedule
  productos: Product[]
  productos_enabled: boolean
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_CAB = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DIAS_FULL = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
const DIAS_SCHED: (keyof Schedule)[] = ['lun','mar','mie','jue','vie','sab','dom']
const DIAS_LABEL: Record<string, string> = { lun:'Lunes', mar:'Martes', mie:'Miércoles', jue:'Jueves', vie:'Viernes', sab:'Sábado', dom:'Domingo' }

function fDate(d: string) { if (!d) return ''; const [y,m,day] = d.split('-'); return `${day}/${m}/${y}` }
function fARS(n: number) { return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0}).format(n) }
function buildWA(phone: string, msg: string) { return `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}` }
function todayStr() { return new Date().toISOString().split('T')[0] }
function thisMonthStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` }

// ─── Light Card ───────────────────────────────────────────────────
function Card({ children, color, style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--paper)',
      borderRadius: 20,
      border: '1px solid var(--line)',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Splash ───────────────────────────────────────────────────────
function PanelSplash({ companyName, color, rubro, onDone }: { companyName: string; color: string; rubro?: string; onDone: () => void }) {
  const theme = getThemeForRubro(rubro)
  const [fading, setFading] = useState(false)
  function close() { if (fading) return; setFading(true); setTimeout(onDone, 700) }
  useEffect(() => { const t = setTimeout(close, 2800); return () => clearTimeout(t) }, [])
  return (
    <>
      <style>{`
        @keyframes ps-in{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes ps-sub{0%{opacity:0}100%{opacity:.75}}
        @keyframes ps-hint{0%,100%{opacity:.3}50%{opacity:.8}}
        @keyframes ps-out{to{opacity:0;visibility:hidden}}
        .ps-fade{animation:ps-out .7s ease forwards}
      `}</style>
      <div onClick={close}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none${fading?' ps-fade':''}`}
        style={{background: theme.bg}}>
        <div style={{fontSize:'3.5rem',animation:'ps-in .7s ease both'}}>{theme.emoji}</div>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:'11px',fontFamily:'var(--f-mono)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.3em',marginTop:'16px',marginBottom:'8px',animation:'ps-sub .6s .4s ease both'}}>Panel de Gestión</p>
        <h1 style={{color:'#fff',fontFamily:'var(--f-display)',fontWeight:900,textAlign:'center',padding:'0 32px',textTransform:'uppercase',letterSpacing:'0.1em',fontSize:'clamp(1.6rem,6vw,2.8rem)',animation:'ps-in .8s .2s ease both'}}>
          {companyName}
        </h1>
        <p style={{position:'absolute',bottom:'40px',color:'rgba(255,255,255,0.5)',fontSize:'11px',fontFamily:'var(--f-mono)',letterSpacing:'0.2em',textTransform:'uppercase',animation:'ps-hint 2s 2s ease-in-out infinite'}}>Tocá para ingresar</p>
      </div>
    </>
  )
}

// ─── Calendario ───────────────────────────────────────────────────
function AgendaCal({ appointments, color, selectedDay, onSelectDay }: { appointments: Appointment[]; color: string; selectedDay: string; onSelectDay:(d:string)=>void }) {
  const today = todayStr()
  const [vy, setVy] = useState(new Date().getFullYear())
  const [vm, setVm] = useState(new Date().getMonth())
  const byDate = appointments.reduce((acc,a)=>{ (acc[a.appointment_date]??=[]).push(a); return acc }, {} as Record<string,Appointment[]>)
  const firstDay = new Date(vy,vm,1).getDay()
  const dim = new Date(vy,vm+1,0).getDate()
  const cells:(number|null)[] = [...Array(firstDay).fill(null),...Array.from({length:dim},(_,i)=>i+1)]
  function prev(){if(vm===0){setVy(y=>y-1);setVm(11)}else setVm(m=>m-1)}
  function next(){if(vm===11){setVy(y=>y+1);setVm(0)}else setVm(m=>m+1)}
  return (
    <Card color={color}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span>📅</span>
          <span style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)' }}>Calendario</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={prev} style={{ width:32, height:32, borderRadius:10, background:'var(--paper-2)', border:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:18 }}>‹</button>
          <span style={{ fontFamily:'var(--f-display)', fontWeight:700, color:'var(--ink)', fontSize:13, width:128, textAlign:'center' }}>{MESES[vm]} {vy}</span>
          <button onClick={next} style={{ width:32, height:32, borderRadius:10, background:'var(--paper-2)', border:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:18 }}>›</button>
        </div>
      </div>
      <div style={{ padding:'12px 12px 4px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
          {DIAS_CAB.map(d=><div key={d} style={{ textAlign:'center', fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted)', paddingBottom:6 }}>{d}</div>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
          {cells.map((day,i)=>{
            if(!day) return <div key={`e${i}`}/>
            const ds=`${vy}-${String(vm+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const da=byDate[ds]||[]
            const isSel=ds===selectedDay, isToday=ds===today
            const hasConf=da.some(a=>a.status==='confirmed'), hasPend=da.some(a=>a.status==='pending')
            return (
              <button key={ds} onClick={()=>onSelectDay(ds)}
                style={{
                  aspectRatio:'1', borderRadius:10, border:'none', cursor:'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  transition:'all 0.15s',
                  background: isSel ? color : isToday ? `${color}18` : 'transparent',
                  outline: isToday && !isSel ? `1.5px solid ${color}` : 'none',
                  transform: isSel ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSel ? `0 0 14px ${color}55` : 'none',
                }}>
                <span style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:13, color: isSel?'#fff':isToday?color:'var(--ink)' }}>{day}</span>
                {da.length>0&&<div style={{ display:'flex', gap:2, marginTop:2 }}>
                  {hasConf&&<span style={{ width:4, height:4, borderRadius:'50%', display:'inline-block', background: isSel?'rgba(255,255,255,0.7)':color }}/>}
                  {hasPend&&<span style={{ width:4, height:4, borderRadius:'50%', display:'inline-block', background:'#f59e0b' }}/>}
                </div>}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ display:'flex', gap:16, padding:'10px 16px', borderTop:'1px solid var(--line)', background:'var(--paper-2)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--f-mono)', fontSize:9, color:'var(--muted)' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', display:'inline-block', background:color }}/> Confirmado
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--f-mono)', fontSize:9, color:'var(--muted)' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', display:'inline-block', background:'#f59e0b' }}/> Pendiente
        </span>
      </div>
    </Card>
  )
}

// ─── Light input style helper ─────────────────────────────────────
const lightInput: React.CSSProperties = {
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13,
  outline: 'none',
  background: 'var(--paper-2)',
  color: 'var(--ink)',
}

// ─── Panel principal ──────────────────────────────────────────────
export default function OwnerPanel() {
  const params = useParams()
  const searchParams = useSearchParams()
  const configId = params.configId as string

  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('autopin')
    }
    return false
  })

  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState('')
  const [data, setData] = useState<PanelData|null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'agenda'|'solicitudes'|'historial'|'config'|'productos'>('agenda')
  const [selectedDay, setSelectedDay] = useState(todayStr())
  const [solFilter, setSolFilter] = useState<'todas'|'pendiente'|'confirmado'|'cancelado'>('todas')
  const [apptState, setApptState] = useState<Record<string,{sena:string;processing:boolean;done:'approved'|'rejected'|null}>>({})
  const [copiedId, setCopiedId] = useState<string|null>(null)

  // Config editing state
  const [editServices, setEditServices] = useState<Service[]>([])
  const [editSchedule, setEditSchedule] = useState<Partial<Schedule>>({})
  const [editPhone, setEditPhone] = useState('')
  const [editPin, setEditPin] = useState('')
  const [editSvcId, setEditSvcId] = useState<string|null>(null)
  const [newSvcForm, setNewSvcForm] = useState<Partial<Service>|null>(null)

  // Productos state
  const [editProductos, setEditProductos] = useState<Product[]>([])
  const [newProdForm, setNewProdForm] = useState<Partial<Product>|null>(null)
  const [editProdId, setEditProdId] = useState<string|null>(null)
  const [savingProds, setSavingProds] = useState(false)
  const [prodMsg, setProdMsg] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState<string|null>(null)
  const [savingCfg, setSavingCfg] = useState(false)
  const [cfgMsg, setCfgMsg] = useState('')

  const color = data?.color || '#7c3aed'
  const rubro = data?.rubro
  const theme = getThemeForRubro(rubro)
  const today = todayStr()
  const thisMonth = thisMonthStr()

  const loadData = useCallback(async(pinValue:string)=>{
    setLoading(true)
    const res = await fetch(`/api/panel/${configId}?pin=${pinValue}`)
    if(res.status===401){setPinError('PIN incorrecto.');setAuthed(false);setLoading(false);return}
    if(!res.ok){setLoading(false);return}
    const d = await res.json()
    setData(d)
    setEditServices(d.services||[])
    setEditSchedule(d.schedule||{})
    setEditPhone(d.owner_phone||'')
    setEditProductos(d.productos||[])
    setAuthed(true)
    setLoading(false)
  },[configId])

  function handlePin(e:React.FormEvent){e.preventDefault();setPinError('');loadData(pin)}

  useEffect(() => {
    const autopin = searchParams.get('autopin')
    if (autopin && autopin.length === 4) {
      setPin(autopin)
      loadData(autopin)
    }
  }, [searchParams, loadData])

  async function uploadPhoto(file: File, prodId: string | 'new') {
    setUploadingPhoto(prodId)
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'productos')
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    setUploadingPhoto(null)
    if (!res.ok) { alert(json.error || 'Error al subir foto'); return null }
    return json.url as string
  }

  async function handleAction(apptId:string,action:'approve'|'reject'){
    const sena=apptState[apptId]?.sena||'0'
    setApptState(p=>({...p,[apptId]:{...p[apptId],processing:true}}))
    const res=await fetch(`/api/panel/${configId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({pin,appointmentId:apptId,action,sena_ars:Number(sena)})})
    setApptState(p=>({...p,[apptId]:{...p[apptId],processing:false,done:res.ok?(action==='approve'?'approved':'rejected'):null}}))
    if(res.ok) await loadData(pin)
  }

  async function updateStatus(apptId:string,status:string){
    await fetch(`/api/bookings/appointments/${apptId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
    await loadData(pin)
  }

  async function saveConfig(){
    setSavingCfg(true); setCfgMsg('')
    const body: Record<string,unknown> = { pin, services: editServices, schedule: editSchedule, owner_phone: editPhone }
    if(editPin.length===4) body.owner_pin = editPin
    const res = await fetch(`/api/panel/${configId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    setSavingCfg(false)
    if(res.ok){ setCfgMsg('✅ Guardado'); setEditPin(''); setTimeout(()=>setCfgMsg(''),3000); await loadData(pin) }
    else setCfgMsg('❌ Error al guardar')
  }

  function addService(){
    if(!newSvcForm?.name?.trim()) return
    const svc: Service = {
      id: crypto.randomUUID(),
      category: newSvcForm.category||'General',
      name: newSvcForm.name,
      description: newSvcForm.description||'',
      duration_minutes: Number(newSvcForm.duration_minutes)||60,
      price_ars: Number(newSvcForm.price_ars)||0,
      deposit_percentage: 0,
    }
    setEditServices(p=>[...p,svc])
    setNewSvcForm(null)
  }

  function updateService(id:string, field:string, value:string|number){
    setEditServices(p=>p.map(s=>s.id===id?{...s,[field]:field==='price_ars'||field==='duration_minutes'?Number(value):value}:s))
  }

  function deleteService(id:string){
    setEditServices(p=>p.filter(s=>s.id!==id))
    if(editSvcId===id) setEditSvcId(null)
  }

  function toggleDay(day:keyof Schedule){
    setEditSchedule(p=>{
      if(p[day]) return {...p,[day]:null}
      return {...p,[day]:{open:'09:00',close:'18:00'}}
    })
  }

  function setDayTime(day:keyof Schedule, field:'open'|'close', val:string){
    setEditSchedule(p=>({...p,[day]:{...(p[day]||{open:'09:00',close:'18:00'}),[field]:val}}))
  }

  useEffect(()=>{
    if(!data) return
    setApptState(p=>{const n={...p};data.appointments.forEach(a=>{if(!n[a.id])n[a.id]={sena:'',processing:false,done:null}});return n})
  },[data])

  const appts = data?.appointments||[]
  const pending = appts.filter(a=>a.status==='pending')
  const confirmed = appts.filter(a=>a.status==='confirmed')
  const todayConf = confirmed.filter(a=>a.appointment_date===today)
  const monthAppts = appts.filter(a=>a.appointment_date.startsWith(thisMonth)&&['confirmed','completed'].includes(a.status))
  const monthRevenue = monthAppts.reduce((s,a)=>s+a.service_price_ars,0)
  const todayCob = todayConf.reduce((s,a)=>s+(a.sena_ars||0),0)

  // Semana actual (lun–dom)
  const weekStart = (()=>{ const d=new Date(); const day=d.getDay(); const diff=d.getDate()-(day===0?6:day-1); d.setDate(diff); d.setHours(0,0,0,0); return d.toISOString().split('T')[0] })()
  const weekEnd = (()=>{ const d=new Date(); const day=d.getDay(); const diff=d.getDate()+(day===0?0:7-day); d.setDate(diff); d.setHours(23,59,59,999); return d.toISOString().split('T')[0] })()
  const weekAppts = appts.filter(a=>a.appointment_date>=weekStart&&a.appointment_date<=weekEnd&&['confirmed','completed'].includes(a.status))
  const weekRevenue = weekAppts.reduce((s,a)=>s+a.service_price_ars,0)
  const weekPrev = (()=>{ const d=new Date(weekStart); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0] })()
  const weekPrevAppts = appts.filter(a=>a.appointment_date>=weekPrev&&a.appointment_date<weekStart&&['confirmed','completed'].includes(a.status))
  const weekTrend = weekAppts.length - weekPrevAppts.length

  const dayAppts = appts
    .filter(a=>a.appointment_date===selectedDay&&['confirmed','pending'].includes(a.status))
    .sort((a,b)=>a.appointment_time.localeCompare(b.appointment_time))

  const solicitudes = appts.filter(a=>{
    if(solFilter==='todas') return ['pending','confirmed','cancelled'].includes(a.status)
    if(solFilter==='pendiente') return a.status==='pending'
    if(solFilter==='confirmado') return a.status==='confirmed'
    return a.status==='cancelled'
  }).sort((a,b)=>b.created_at.localeCompare(a.created_at))

  const historial = appts.filter(a=>['completed','no_show','cancelled'].includes(a.status))
    .sort((a,b)=>b.appointment_date.localeCompare(a.appointment_date))

  // Historial agrupado por cliente
  const clientMap: Record<string,{name:string;visits:number;total:number}> = {}
  historial.filter(a=>a.status==='completed').forEach(a=>{
    const k = a.customer_name.toLowerCase()
    if(!clientMap[k]) clientMap[k]={name:a.customer_name,visits:0,total:0}
    clientMap[k].visits++
    clientMap[k].total+=a.service_price_ars
  })
  const topClients = Object.values(clientMap).sort((a,b)=>b.total-a.total).slice(0,10)
  const totalHistorial = historial.filter(a=>a.status==='completed').reduce((s,a)=>s+a.service_price_ars,0)

  // Servicios agrupados por categoría
  const catMap: Record<string,Service[]> = {}
  editServices.forEach(s=>{ (catMap[s.category]??=[]).push(s) })

  // ── LOGIN ──
  if(!authed) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'var(--paper-2)', position:'relative' }}>
      <style>{`
        .panel-pin-input::placeholder { color: var(--muted); }
        .panel-pin-input:focus { border-color: ${color} !important; box-shadow: 0 0 0 3px ${color}22; }
      `}</style>
      <Card style={{ width:'100%', maxWidth:360, textAlign:'center', padding:32 }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px' }}>
          {theme.emoji}
        </div>
        <h1 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:20, color:'var(--ink)', margin:'0 0 4px' }}>Panel de turnos</h1>
        <p style={{ color:'var(--muted)', fontSize:13, marginBottom:24, fontFamily:'var(--f-mono)' }}>Ingresá tu PIN de 4 dígitos</p>
        <form onSubmit={handlePin} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input type="password" inputMode="numeric" maxLength={4} value={pin}
            onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}
            placeholder="· · · ·" autoFocus className="panel-pin-input"
            style={{ width:'100%', textAlign:'center', fontSize:28, fontFamily:'var(--f-mono)', letterSpacing:'0.5em', border:'1px solid var(--line)', borderRadius:12, padding:'14px 0', outline:'none', background:'var(--paper-2)', color:'var(--ink)', boxSizing:'border-box', transition:'border-color 0.2s, box-shadow 0.2s' }}/>
          {pinError&&<p style={{ color:'#dc2626', fontSize:13, margin:0 }}>{pinError}</p>}
          <button type="submit" disabled={pin.length!==4||loading}
            style={{ width:'100%', background:color, color:'#fff', border:'none', borderRadius:10, padding:'14px 0', fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', fontWeight:700, opacity:(pin.length!==4||loading)?0.4:1, boxShadow:`0 4px 20px ${color}44` }}>
            {loading?'Verificando...':'Entrar al panel'}
          </button>
        </form>
      </Card>
    </div>
  )

  // ── SPLASH ──
  if(!splashDone) return <PanelSplash companyName={data?.company_name||''} color={color} rubro={rubro} onDone={()=>setSplashDone(true)}/>

  // ── PANEL ──
  return (
    <div style={{ minHeight:'100vh', background:'var(--paper-2)' }}>
      <style>{`
        .panel-light-input { background: var(--paper-2) !important; color: var(--ink) !important; border: 1px solid var(--line) !important; }
        .panel-light-input::placeholder { color: var(--muted) !important; }
        .panel-light-input:focus { border-color: ${color} !important; outline: none !important; box-shadow: 0 0 0 3px ${color}22 !important; }
        .panel-tab-btn:hover { color: var(--ink) !important; }
        .panel-appt-row:hover { background: var(--paper-2) !important; }
        @media(max-width:700px){.panel-agenda-grid{grid-template-columns:1fr !important}}
      `}</style>

      {/* Header light */}
      <header style={{ background:'var(--paper)', borderBottom:'1px solid var(--line)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:40, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--f-display)', fontWeight:900, fontSize:18, flexShrink:0 }}>
          {(data?.company_name||'').charAt(0).toUpperCase()||theme.emoji}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:18, color:'var(--ink)', margin:0, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data?.company_name}</h1>
          <p style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted)', margin:'2px 0 0' }}>Panel de Gestión · {theme.emoji} {theme.label}</p>
        </div>
        <button onClick={()=>loadData(pin)} style={{ fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.06em', color:'var(--muted)', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:8, padding:'6px 12px', cursor:'pointer', flexShrink:0 }}>↻</button>
      </header>

      {/* Stats rápidas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:1, background:'var(--line)', borderBottom:'1px solid var(--line)' }}>
        {[
          {label:'Hoy',val:String(todayConf.length)+' turnos',sub:todayCob>0?fARS(todayCob):undefined,trend:undefined},
          {label:'Esta semana',val:String(weekAppts.length)+' turnos',sub:weekRevenue>0?fARS(weekRevenue):undefined,trend:weekTrend},
          {label:'Pendientes',val:String(pending.length),sub:pending.length>0?'aprobar':undefined,trend:undefined},
          {label:'Este mes',val:String(monthAppts.length)+' turnos',sub:undefined,trend:undefined},
          {label:'Facturado',val:fARS(monthRevenue),sub:undefined,trend:undefined},
        ].map((s)=>(
          <div key={s.label} style={{ padding:'14px 8px', textAlign:'center', background:'var(--paper)' }}>
            <p style={{ fontFamily:'var(--f-mono)', fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:4 }}>{s.label}</p>
            <p style={{ fontFamily:'var(--f-mono)', fontSize:12, fontWeight:700, color, margin:0 }}>{s.val}</p>
            {s.sub&&<p style={{ fontFamily:'var(--f-mono)', fontSize:8, color:'var(--muted)', margin:'2px 0 0' }}>{s.sub}</p>}
            {s.trend!==undefined&&s.trend!==0&&<p style={{ fontFamily:'var(--f-mono)', fontSize:8, margin:'2px 0 0', color:s.trend>0?'#16a34a':'#dc2626' }}>{s.trend>0?'↑':'↓'} {Math.abs(s.trend)} vs sem. ant.</p>}
          </div>
        ))}
      </div>

      {/* Nav tabs */}
      <nav style={{ display:'flex', background:'var(--paper)', borderBottom:'1px solid var(--line)', overflowX:'auto' }}>
        {[
          {key:'agenda',label:'Agenda'},
          {key:'solicitudes',label:`Solicitudes${pending.length>0?` (${pending.length})`:''}`},
          {key:'historial',label:'Historial'},
          {key:'productos',label:'🛍️ Productos'},
          {key:'config',label:'Configurar'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as typeof tab)}
            className="panel-tab-btn"
            style={{
              padding:'14px 18px', fontFamily:'var(--f-mono)', fontSize:11, fontWeight:tab===t.key?700:500,
              letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap', background:'none', border:'none',
              borderBottom: tab===t.key?`2px solid ${color}`:'2px solid transparent',
              color: tab===t.key?color:'var(--muted)', cursor:'pointer', transition:'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </nav>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'20px 16px 100px' }}>
        {loading&&<p style={{ textAlign:'center', color:'var(--muted)', padding:'40px 0', fontFamily:'var(--f-mono)', fontSize:12 }}>Cargando...</p>}

        {/* ── AGENDA ── */}
        {tab==='agenda'&&!loading&&(
          <div className="panel-agenda-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <AgendaCal appointments={appts} color={color} selectedDay={selectedDay} onSelectDay={setSelectedDay}/>
            <Card color={color}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Turnos del día</p>
                  <p style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', color:'var(--muted)', margin:'2px 0 0', textTransform:'capitalize' }}>
                    {DIAS_FULL[new Date(selectedDay+'T12:00:00').getDay()]}, {fDate(selectedDay)}
                  </p>
                </div>
                {selectedDay===today&&<span style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', background:`${color}18`, color, borderRadius:100, padding:'3px 10px', border:`1px solid ${color}33` }}>Hoy</span>}
              </div>

              {dayAppts.length===0
                ?<div style={{ padding:'40px 0', textAlign:'center', color:'var(--muted)', fontFamily:'var(--f-mono)', fontSize:12 }}>Sin turnos este día</div>
                :<div>
                  {dayAppts.map((appt,i)=>(
                    <div key={appt.id} className="panel-appt-row" style={{ padding:16, borderBottom:i<dayAppts.length-1?'1px solid var(--line)':undefined, transition:'background 0.15s' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', color:'var(--muted)', margin:'0 0 3px' }}>{appt.appointment_time} · {appt.service_duration_minutes}min</p>
                          <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:'0 0 2px' }}>{appt.customer_name}</p>
                          <p style={{ fontSize:12, color:'var(--muted)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{appt.service_name}</p>
                          {appt.customer_phone&&<a href={`https://wa.me/${appt.customer_phone.replace(/\D/g,'')}`}
                            target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#16a34a', marginTop:2, display:'inline-block' }}>
                            💬 {appt.customer_phone}</a>}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                          {appt.status==='confirmed'&&<>
                            <button onClick={()=>updateStatus(appt.id,'completed')} style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', background:'rgba(59,130,246,0.1)', color:'#2563eb', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, padding:'6px 10px', cursor:'pointer' }}>✓ Listo</button>
                            <button onClick={()=>updateStatus(appt.id,'no_show')} style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', background:'var(--paper-2)', color:'var(--muted)', border:'1px solid var(--line)', borderRadius:8, padding:'6px 10px', cursor:'pointer' }}>No vino</button>
                          </>}
                          {appt.status==='pending'&&<>
                            <button onClick={()=>handleAction(appt.id,'approve')} disabled={apptState[appt.id]?.processing} style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', background:color, color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontWeight:700, opacity:apptState[appt.id]?.processing?0.5:1 }}>✓ OK</button>
                            <button onClick={()=>handleAction(appt.id,'reject')} disabled={apptState[appt.id]?.processing} style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', background:'rgba(220,38,38,0.08)', color:'#dc2626', border:'1px solid rgba(220,38,38,0.2)', borderRadius:8, padding:'6px 10px', cursor:'pointer', opacity:apptState[appt.id]?.processing?0.5:1 }}>✕</button>
                          </>}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                        <span style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:100, padding:'3px 8px', ...(appt.status==='confirmed'?{background:'rgba(22,163,74,0.1)',color:'#16a34a',border:'1px solid rgba(22,163,74,0.2)'}:{background:'rgba(245,158,11,0.1)',color:'#b45309',border:'1px solid rgba(245,158,11,0.2)'}) }}>
                          {appt.status==='confirmed'?'Confirmado':'Pendiente'}
                        </span>
                        {appt.service_price_ars>0&&<span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)' }}>{fARS(appt.service_price_ars)}</span>}
                      </div>
                      {appt.customer_notes&&<p style={{ fontSize:11, color:'var(--muted)', marginTop:8, fontStyle:'italic', background:'var(--paper-2)', padding:'6px 10px', borderRadius:8, border:'1px solid var(--line)' }}>&ldquo;{appt.customer_notes}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              }
            </Card>
          </div>
        )}

        {/* ── SOLICITUDES ── */}
        {tab==='solicitudes'&&!loading&&(
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <span style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)' }}>Solicitudes de turno</span>
              <div style={{ display:'flex', gap:6, marginLeft:'auto', flexWrap:'wrap' }}>
                {(['todas','pendiente','confirmado','cancelado'] as const).map(f=>(
                  <button key={f} onClick={()=>setSolFilter(f)}
                    style={{ padding:'5px 12px', borderRadius:100, fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', border:'1px solid var(--line)', cursor:'pointer', fontWeight:solFilter===f?700:500, background:solFilter===f?color:'var(--paper)', color:solFilter===f?'#fff':'var(--muted)', transition:'all 0.15s' }}>
                    {f==='todas'?'Todas':f.charAt(0).toUpperCase()+f.slice(1)+'s'}
                  </button>
                ))}
              </div>
            </div>

            {solicitudes.length===0
              ?<div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)', fontFamily:'var(--f-mono)', fontSize:12 }}>Sin solicitudes.</div>
              :<div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {solicitudes.map(appt=>{
                  const st=apptState[appt.id]||{sena:'',processing:false,done:null}
                  const isPend=appt.status==='pending'
                  const waOK=st.done==='approved'&&appt.customer_phone?buildWA(appt.customer_phone,`Hola ${appt.customer_name}! Tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}* a las *${appt.appointment_time}* fue *confirmado*. ¡Te esperamos!`):null
                  const waNO=st.done==='rejected'&&appt.customer_phone?buildWA(appt.customer_phone,`Hola ${appt.customer_name}, lamentablemente no podemos confirmar tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}*. Podés elegir otro horario.`):null
                  return (
                    <Card key={appt.id} style={{ border:isPend?`1px solid rgba(245,158,11,0.4)`:undefined }}>
                      {isPend&&<div style={{ background:'rgba(245,158,11,0.08)', padding:'8px 16px', borderBottom:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b', display:'inline-block' }}/>
                        <span style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'#b45309', fontWeight:700 }}>Pendiente de aprobación</span>
                      </div>}
                      <div style={{ padding:16 }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:12 }}>
                          <div>
                            <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:15, color:'var(--ink)', margin:'0 0 2px' }}>{appt.customer_name}</p>
                            <p style={{ fontSize:13, color:'var(--muted)', margin:'0 0 4px' }}>{appt.service_name}</p>
                            <p style={{ fontFamily:'var(--f-mono)', fontSize:11, color:'var(--ink)', margin:0 }}>{fDate(appt.appointment_date)} · {appt.appointment_time}</p>
                            {appt.service_price_ars>0&&<p style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', margin:'2px 0 0' }}>{fARS(appt.service_price_ars)}</p>}
                          </div>
                          <span style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', borderRadius:100, padding:'4px 10px', flexShrink:0,
                            ...(appt.status==='confirmed'?{background:'rgba(22,163,74,0.1)',color:'#16a34a',border:'1px solid rgba(22,163,74,0.2)'}:
                               appt.status==='pending'?{background:'rgba(245,158,11,0.1)',color:'#b45309',border:'1px solid rgba(245,158,11,0.25)'}:
                               {background:'rgba(220,38,38,0.08)',color:'#dc2626',border:'1px solid rgba(220,38,38,0.15)'}) }}>
                            {appt.status==='confirmed'?'Confirmado':appt.status==='pending'?'Pendiente':appt.status==='cancelled'?'Cancelado':appt.status}
                          </span>
                        </div>
                        {appt.customer_notes&&<p style={{ fontSize:12, color:'var(--muted)', fontStyle:'italic', background:'var(--paper-2)', padding:'8px 12px', borderRadius:8, marginBottom:12, border:'1px solid var(--line)' }}>&ldquo;{appt.customer_notes}&rdquo;</p>}
                        {isPend&&!st.done&&<>
                          {appt.service_price_ars>0&&(
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, background:'var(--paper-2)', borderRadius:10, padding:'10px 12px', border:'1px solid var(--line)' }}>
                              <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', whiteSpace:'nowrap' }}>Seña $</span>
                              <input type="number" min={0} max={appt.service_price_ars} placeholder="0"
                                value={st.sena} onChange={e=>setApptState(p=>({...p,[appt.id]:{...p[appt.id],sena:e.target.value}}))}
                                className="panel-light-input"
                                style={{ flex:1, borderRadius:8, padding:'6px 8px', fontSize:13, width:80 }}/>
                              {Number(st.sena)>0&&<span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)' }}>Saldo: <strong style={{ color:'var(--ink)' }}>{fARS(appt.service_price_ars-Number(st.sena))}</strong></span>}
                            </div>
                          )}
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                            <button onClick={()=>handleAction(appt.id,'approve')} disabled={st.processing} style={{ padding:'12px 0', borderRadius:10, background:color, color:'#fff', border:'none', fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.06em', cursor:'pointer', fontWeight:700, opacity:st.processing?0.5:1, boxShadow:`0 4px 16px ${color}44` }}>{st.processing?'...':'Aprobar'}</button>
                            <button onClick={()=>handleAction(appt.id,'reject')} disabled={st.processing} style={{ padding:'12px 0', borderRadius:10, background:'rgba(220,38,38,0.08)', color:'#dc2626', border:'1px solid rgba(220,38,38,0.2)', fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.06em', cursor:'pointer', opacity:st.processing?0.5:1 }}>{st.processing?'...':'Rechazar'}</button>
                          </div>
                        </>}
                        {(waOK||waNO)&&<div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
                          {waOK&&<div style={{ display:'flex', gap:8 }}>
                            <a href={waOK} target="_blank" rel="noopener noreferrer" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 0', borderRadius:10, fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.06em', textDecoration:'none', background:'#16a34a', color:'#fff', fontWeight:700 }}>💬 Avisar — confirmado</a>
                            <button onClick={()=>{const txt=`Hola ${appt.customer_name}! Tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}* a las *${appt.appointment_time}* fue *confirmado*. ¡Te esperamos!`;navigator.clipboard.writeText(txt);setCopiedId(appt.id);setTimeout(()=>setCopiedId(null),2000)}} style={{ padding:'12px 14px', borderRadius:10, border:'1px solid #16a34a', background:'rgba(22,163,74,0.08)', color:'#16a34a', fontFamily:'var(--f-mono)', fontSize:11, cursor:'pointer', flexShrink:0 }}>{copiedId===appt.id?'✓':'📋'}</button>
                          </div>}
                          {waNO&&<a href={waNO} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px 0', borderRadius:10, fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.06em', textDecoration:'none', background:'var(--paper-2)', color:'var(--muted)', border:'1px solid var(--line)' }}>Avisar — rechazado</a>}
                        </div>}
                      </div>
                    </Card>
                  )
                })}
              </div>
            }
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab==='historial'&&!loading&&(
          <div style={{ maxWidth:640, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
            {/* Totales */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                {label:'Completados',val:String(historial.filter(a=>a.status==='completed').length)+' turnos'},
                {label:'Facturado total',val:fARS(totalHistorial)},
                {label:'Clientes únicos',val:String(Object.keys(clientMap).length)},
              ].map(s=>(
                <Card key={s.label} style={{ padding:16, textAlign:'center' }}>
                  <p style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{s.label}</p>
                  <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:18, color, margin:0 }}>{s.val}</p>
                </Card>
              ))}
            </div>

            {/* Gráfico semanal */}
            {(()=>{
              const completed = historial.filter(a=>a.status==='completed')
              if(completed.length===0) return null
              // Últimas 8 semanas
              const weeks:{label:string;total:number;count:number}[]=[]
              for(let w=7;w>=0;w--){
                const start=new Date(); start.setDate(start.getDate()-start.getDay()+1-w*7); start.setHours(0,0,0,0)
                const end=new Date(start); end.setDate(end.getDate()+6); end.setHours(23,59,59,999)
                const s0=start.toISOString().split('T')[0]; const e0=end.toISOString().split('T')[0]
                const wa=completed.filter(a=>a.appointment_date>=s0&&a.appointment_date<=e0)
                const label=`${String(start.getDate()).padStart(2,'0')}/${String(start.getMonth()+1).padStart(2,'0')}`
                weeks.push({label,total:wa.reduce((s,a)=>s+a.service_price_ars,0),count:wa.length})
              }
              const maxVal=Math.max(...weeks.map(w=>w.total),1)
              return (
                <Card>
                  <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
                    <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Ingresos por semana</p>
                  </div>
                  <div style={{ padding:'20px 16px', display:'flex', alignItems:'flex-end', gap:8, height:120 }}>
                    {weeks.map((w,i)=>(
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
                        <span style={{ fontFamily:'var(--f-mono)', fontSize:8, color:'var(--muted)', whiteSpace:'nowrap' }}>{w.count>0?String(w.count)+'t':''}</span>
                        <div title={w.total>0?fARS(w.total):''} style={{ width:'100%', borderRadius:6, background:i===7?color:`${color}44`, minHeight:4, height:`${Math.max(4,(w.total/maxVal)*80)}px`, transition:'height 0.4s ease' }}/>
                        <span style={{ fontFamily:'var(--f-mono)', fontSize:8, color:'var(--muted)', whiteSpace:'nowrap' }}>{w.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })()}

            {/* Top clientes */}
            {topClients.length>0&&(
              <Card>
                <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
                  <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Clientes recurrentes</p>
                </div>
                <div>
                  {topClients.map((c,i)=>(
                    <div key={c.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<topClients.length-1?'1px solid var(--line)':undefined }}>
                      <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', width:20 }}>{i+1}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontFamily:'var(--f-display)', fontWeight:600, fontSize:13, color:'var(--ink)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                        <p style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', margin:0 }}>{c.visits} {c.visits===1?'visita':'visitas'}</p>
                      </div>
                      {c.total>0&&<span style={{ fontFamily:'var(--f-mono)', fontSize:11, fontWeight:700, color }}>{fARS(c.total)}</span>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Lista historial */}
            <Card>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
                <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Historial completo</p>
              </div>
              {historial.length===0
                ?<div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)', fontFamily:'var(--f-mono)', fontSize:12 }}>Sin historial todavía.</div>
                :<div>
                  {historial.map((appt,i)=>{
                    const labels:Record<string,string>={cancelled:'Cancelado',completed:'Completado',no_show:'No vino'}
                    const statusColors:Record<string,string>={cancelled:'#dc2626',completed:'#16a34a',no_show:'var(--muted)'}
                    return (
                      <div key={appt.id} style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, borderBottom:i<historial.length-1?'1px solid var(--line)':undefined }}>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontFamily:'var(--f-display)', fontWeight:600, fontSize:13, color:'var(--ink)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{appt.customer_name}</p>
                          <p style={{ fontSize:11, color:'var(--muted)', margin:'1px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{appt.service_name}</p>
                          <p style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', margin:'1px 0 0' }}>{fDate(appt.appointment_date)} · {appt.appointment_time}</p>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, flexShrink:0 }}>
                          <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:statusColors[appt.status]||'var(--muted)' }}>{labels[appt.status]||appt.status}</span>
                          {appt.service_price_ars>0&&<span style={{ fontFamily:'var(--f-mono)', fontSize:11, fontWeight:700, color }}>{fARS(appt.service_price_ars)}</span>}
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid var(--line)', background:'var(--paper-2)' }}>
                    <span style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--muted)', fontWeight:700 }}>Total facturado</span>
                    <span style={{ fontFamily:'var(--f-mono)', fontSize:13, fontWeight:700, color }}>{fARS(totalHistorial)}</span>
                  </div>
                </div>
              }
            </Card>
          </div>
        )}

        {/* ── PRODUCTOS ── */}
        {tab==='productos'&&!loading&&(
          <div style={{ maxWidth:640, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
            <Card>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
                <div>
                  <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Productos</p>
                  <a href={`/catalogo/${configId}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily:'var(--f-mono)', fontSize:10, color, textDecoration:'none', margin:'2px 0 0', display:'block' }}>
                    Ver catálogo público ↗
                  </a>
                </div>
                <button onClick={()=>setNewProdForm({})}
                  style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', background:color, color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:700 }}>+ Agregar</button>
              </div>

              {/* Nuevo producto form */}
              {newProdForm!==null&&(
                <div style={{ padding:16, borderBottom:'1px dashed var(--line)', background:'var(--paper-2)', display:'flex', flexDirection:'column', gap:10 }}>
                  <p style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color, margin:0 }}>Nuevo producto</p>

                  {/* Foto */}
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:56, height:56, borderRadius:10, background:'var(--paper)', border:'1px solid var(--line)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                      {newProdForm.photo_url ? <img src={newProdForm.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📷'}
                    </div>
                    <label style={{ cursor:'pointer', fontFamily:'var(--f-mono)', fontSize:10, color, border:`1px dashed ${color}`, borderRadius:8, padding:'6px 12px', letterSpacing:'0.06em' }}>
                      {uploadingPhoto==='new'?'Subiendo...':'Subir foto'}
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e=>{
                        const file = e.target.files?.[0]; if(!file) return
                        const url = await uploadPhoto(file,'new')
                        if(url) setNewProdForm(p=>({...p,photo_url:url}))
                      }}/>
                    </label>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <input placeholder="Nombre *" value={newProdForm.name||''} onChange={e=>setNewProdForm(p=>({...p,name:e.target.value}))}
                      className="panel-light-input" style={{...lightInput,fontSize:12}} />
                    <input placeholder="Categoría" value={newProdForm.category||''} onChange={e=>setNewProdForm(p=>({...p,category:e.target.value}))}
                      className="panel-light-input" style={{...lightInput,fontSize:12}} />
                    <input placeholder="Precio ARS (0 = Consultar)" type="number" value={newProdForm.price_ars||''} onChange={e=>setNewProdForm(p=>({...p,price_ars:Number(e.target.value)}))}
                      className="panel-light-input" style={{...lightInput,fontSize:12}} />
                    <input placeholder="Stock (opcional)" type="number" value={newProdForm.stock??''} onChange={e=>setNewProdForm(p=>({...p,stock:e.target.value===''?undefined:Number(e.target.value)}))}
                      className="panel-light-input" style={{...lightInput,fontSize:12}} />
                  </div>
                  <input placeholder="Descripción (opcional)" value={newProdForm.description||''} onChange={e=>setNewProdForm(p=>({...p,description:e.target.value}))}
                    className="panel-light-input" style={{...lightInput,fontSize:12}} />

                  {/* Oferta */}
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontFamily:'var(--f-mono)', fontSize:10, color:'var(--ink)' }}>
                      <input type="checkbox" checked={!!newProdForm.discount_active} onChange={e=>setNewProdForm(p=>({...p,discount_active:e.target.checked}))} />
                      Activar oferta
                    </label>
                    {newProdForm.discount_active&&(
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <input type="number" min={1} max={99} value={newProdForm.discount_percent||''} onChange={e=>setNewProdForm(p=>({...p,discount_percent:Number(e.target.value)}))}
                          className="panel-light-input" style={{...lightInput,fontSize:12,width:60}} placeholder="%" />
                        <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)' }}>% desc.</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>{
                      if(!newProdForm.name?.trim()) return
                      const prod: Product = {
                        id: crypto.randomUUID(),
                        name: newProdForm.name,
                        category: newProdForm.category||'General',
                        price_ars: Number(newProdForm.price_ars)||0,
                        description: newProdForm.description||'',
                        photo_url: newProdForm.photo_url,
                        stock: newProdForm.stock,
                        discount_active: newProdForm.discount_active||false,
                        discount_percent: newProdForm.discount_percent||0,
                      }
                      setEditProductos(p=>[...p,prod]); setNewProdForm(null)
                    }} style={{ background:color, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontFamily:'var(--f-mono)', fontSize:10, fontWeight:700, cursor:'pointer' }}>Agregar</button>
                    <button onClick={()=>setNewProdForm(null)} style={{ background:'var(--paper)', border:'1px solid var(--line)', color:'var(--muted)', borderRadius:8, padding:'8px 14px', fontFamily:'var(--f-mono)', fontSize:10, cursor:'pointer' }}>Cancelar</button>
                  </div>
                </div>
              )}

              {editProductos.length===0&&newProdForm===null&&(
                <div style={{ padding:32, textAlign:'center' }}>
                  <p style={{ fontFamily:'var(--f-display)', fontSize:14, color:'var(--muted)', margin:0 }}>Sin productos. Agregá el primero.</p>
                </div>
              )}

              {/* Lista de productos */}
              {editProductos.map(prod=>(
                <div key={prod.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)' }}>
                  {editProdId===prod.id ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {/* Foto edición */}
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:56, height:56, borderRadius:10, background:'var(--paper-2)', border:'1px solid var(--line)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                          {prod.photo_url ? <img src={prod.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📷'}
                        </div>
                        <label style={{ cursor:'pointer', fontFamily:'var(--f-mono)', fontSize:10, color, border:`1px dashed ${color}`, borderRadius:8, padding:'6px 12px', letterSpacing:'0.06em' }}>
                          {uploadingPhoto===prod.id?'Subiendo...':'Cambiar foto'}
                          <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e=>{
                            const file = e.target.files?.[0]; if(!file) return
                            const url = await uploadPhoto(file, prod.id)
                            if(url) setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,photo_url:url}:x))
                          }}/>
                        </label>
                        {prod.photo_url&&<button onClick={()=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,photo_url:undefined}:x))}
                          style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontFamily:'var(--f-mono)', fontSize:10 }}>✕ quitar</button>}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <input value={prod.name} onChange={e=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,name:e.target.value}:x))}
                          className="panel-light-input" style={{...lightInput,fontSize:12}} placeholder="Nombre"/>
                        <input value={prod.category||''} onChange={e=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,category:e.target.value}:x))}
                          className="panel-light-input" style={{...lightInput,fontSize:12}} placeholder="Categoría"/>
                        <input type="number" value={prod.price_ars||''} onChange={e=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,price_ars:Number(e.target.value)}:x))}
                          className="panel-light-input" style={{...lightInput,fontSize:12}} placeholder="Precio ARS"/>
                        <input type="number" value={prod.stock??''} onChange={e=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,stock:e.target.value===''?undefined:Number(e.target.value)}:x))}
                          className="panel-light-input" style={{...lightInput,fontSize:12}} placeholder="Stock"/>
                      </div>
                      <input value={prod.description||''} onChange={e=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,description:e.target.value}:x))}
                        className="panel-light-input" style={{...lightInput,fontSize:12}} placeholder="Descripción"/>
                      {/* Oferta */}
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontFamily:'var(--f-mono)', fontSize:10, color:'var(--ink)' }}>
                          <input type="checkbox" checked={!!prod.discount_active} onChange={e=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,discount_active:e.target.checked}:x))} />
                          Oferta activa
                        </label>
                        {prod.discount_active&&(
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <input type="number" min={1} max={99} value={prod.discount_percent||''} onChange={e=>setEditProductos(p=>p.map(x=>x.id===prod.id?{...x,discount_percent:Number(e.target.value)}:x))}
                              className="panel-light-input" style={{...lightInput,fontSize:12,width:60}} placeholder="%"/>
                            <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)' }}>% desc.</span>
                            {prod.price_ars>0&&prod.discount_percent&&<span style={{ fontFamily:'var(--f-display)', fontSize:12, fontWeight:700, color }}>→ {fARS(Math.round(prod.price_ars*(1-prod.discount_percent/100)))}</span>}
                          </div>
                        )}
                      </div>
                      <button onClick={()=>setEditProdId(null)} style={{ alignSelf:'flex-start', background:color, color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontFamily:'var(--f-mono)', fontSize:10, fontWeight:700, cursor:'pointer' }}>Listo</button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      {/* Thumbnail */}
                      <div style={{ width:44, height:44, borderRadius:8, background:'var(--paper-2)', border:'1px solid var(--line)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                        {prod.photo_url ? <img src={prod.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📦'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <p style={{ fontFamily:'var(--f-display)', fontWeight:600, fontSize:13, color:'var(--ink)', margin:0 }}>{prod.name}</p>
                          {prod.discount_active&&prod.discount_percent&&(
                            <span style={{ background:color, color:'#fff', borderRadius:100, padding:'1px 7px', fontFamily:'var(--f-mono)', fontSize:8, fontWeight:700 }}>-{prod.discount_percent}%</span>
                          )}
                        </div>
                        <p style={{ fontFamily:'var(--f-mono)', fontSize:9, color:'var(--muted)', margin:'2px 0 0' }}>
                          {prod.category||'General'}{prod.stock!==undefined?` · stock: ${prod.stock}`:''}
                        </p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        {prod.price_ars>0?(
                          <div>
                            {prod.discount_active&&prod.discount_percent&&<span style={{ fontFamily:'var(--f-mono)', fontSize:9, color:'var(--muted)', textDecoration:'line-through', display:'block' }}>{fARS(prod.price_ars)}</span>}
                            <span style={{ fontFamily:'var(--f-mono)', fontSize:13, fontWeight:700, color }}>{fARS(prod.discount_active&&prod.discount_percent?Math.round(prod.price_ars*(1-prod.discount_percent/100)):prod.price_ars)}</span>
                          </div>
                        ):<span style={{ fontFamily:'var(--f-mono)', fontSize:11, color:'var(--muted)' }}>Consultar</span>}
                      </div>
                      <button onClick={()=>setEditProdId(prod.id)} style={{ background:'var(--paper-2)', border:'1px solid var(--line)', color:'var(--muted)', borderRadius:8, padding:'6px 10px', fontFamily:'var(--f-mono)', fontSize:10, cursor:'pointer', flexShrink:0 }}>✏️</button>
                      <button onClick={()=>setEditProductos(p=>p.filter(x=>x.id!==prod.id))} style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', color:'#dc2626', borderRadius:8, padding:'6px 10px', fontFamily:'var(--f-mono)', fontSize:10, cursor:'pointer', flexShrink:0 }}>✕</button>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ padding:16, borderTop:'1px solid var(--line)', display:'flex', alignItems:'center', gap:12 }}>
                <button onClick={async()=>{
                  setSavingProds(true); setProdMsg('')
                  const res = await fetch(`/api/panel/${configId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin,productos:editProductos})})
                  setSavingProds(false)
                  if(res.ok){setProdMsg('✅ Guardado');setTimeout(()=>setProdMsg(''),3000);await loadData(pin)}
                  else setProdMsg('❌ Error al guardar')
                }} disabled={savingProds}
                  style={{ background:color, color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontFamily:'var(--f-mono)', fontSize:11, fontWeight:700, cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase', opacity:savingProds?0.5:1 }}>
                  {savingProds?'Guardando...':'Guardar productos'}
                </button>
                {prodMsg&&<span style={{ fontFamily:'var(--f-mono)', fontSize:11, color:'var(--ink)' }}>{prodMsg}</span>}
              </div>
            </Card>
          </div>
        )}

        {/* ── CONFIGURACIÓN ── */}
        {tab==='config'&&!loading&&(
          <div style={{ maxWidth:640, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>

            {/* Servicios */}
            <Card>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
                <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Servicios</p>
                <button onClick={()=>setNewSvcForm({})}
                  style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', background:color, color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:700 }}>+ Agregar</button>
              </div>

              {newSvcForm!==null&&(
                <div style={{ padding:16, borderBottom:'1px dashed var(--line)', background:'var(--paper-2)', display:'flex', flexDirection:'column', gap:10 }}>
                  <p style={{ fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', margin:0 }}>Nuevo servicio</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <input placeholder="Nombre del servicio *" value={newSvcForm.name||''}
                      onChange={e=>setNewSvcForm(p=>({...p,name:e.target.value}))}
                      className="panel-light-input"
                      style={{ ...lightInput, gridColumn:'1/-1' }}/>
                    <input placeholder="Categoría" value={newSvcForm.category||''}
                      onChange={e=>setNewSvcForm(p=>({...p,category:e.target.value}))}
                      className="panel-light-input" style={lightInput}/>
                    <input placeholder="Descripción" value={newSvcForm.description||''}
                      onChange={e=>setNewSvcForm(p=>({...p,description:e.target.value}))}
                      className="panel-light-input" style={lightInput}/>
                    <div style={{ display:'flex', alignItems:'center', gap:8, ...lightInput, borderRadius:10 }}>
                      <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', flexShrink:0 }}>min</span>
                      <input type="number" min={15} step={15} placeholder="60" value={newSvcForm.duration_minutes||''}
                        onChange={e=>setNewSvcForm(p=>({...p,duration_minutes:Number(e.target.value)}))}
                        style={{ width:'100%', fontSize:13, outline:'none', border:'none', background:'transparent', color:'var(--ink)' }}/>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, ...lightInput, borderRadius:10 }}>
                      <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', flexShrink:0 }}>$</span>
                      <input type="number" min={0} placeholder="0" value={newSvcForm.price_ars||''}
                        onChange={e=>setNewSvcForm(p=>({...p,price_ars:Number(e.target.value)}))}
                        style={{ width:'100%', fontSize:13, outline:'none', border:'none', background:'transparent', color:'var(--ink)' }}/>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={addService} disabled={!newSvcForm.name?.trim()}
                      style={{ flex:1, padding:'10px 0', borderRadius:10, background:color, color:'#fff', border:'none', fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.06em', cursor:'pointer', fontWeight:700, opacity:!newSvcForm.name?.trim()?0.4:1 }}>Agregar</button>
                    <button onClick={()=>setNewSvcForm(null)} style={{ padding:'10px 16px', borderRadius:10, background:'var(--paper)', border:'1px solid var(--line)', fontFamily:'var(--f-mono)', fontSize:11, color:'var(--muted)', cursor:'pointer' }}>Cancelar</button>
                  </div>
                </div>
              )}

              {editServices.length===0&&newSvcForm===null&&(
                <p style={{ textAlign:'center', color:'var(--muted)', fontFamily:'var(--f-mono)', fontSize:12, padding:'32px 0' }}>Sin servicios. Agregá uno.</p>
              )}

              {Object.entries(catMap).map(([cat,svcs])=>(
                <div key={cat}>
                  <div style={{ padding:'8px 16px', background:'var(--paper-2)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)' }}>
                    <p style={{ fontFamily:'var(--f-mono)', fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', color, margin:0, fontWeight:700 }}>{cat}</p>
                  </div>
                  {svcs.map((svc,i)=>(
                    <div key={svc.id} style={{ borderBottom:i<svcs.length-1?'1px solid var(--line)':undefined }}>
                      {editSvcId===svc.id?(
                        <div style={{ padding:16, background:'var(--paper-2)', display:'flex', flexDirection:'column', gap:8 }}>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                            <input value={svc.name} onChange={e=>updateService(svc.id,'name',e.target.value)}
                              placeholder="Nombre" className="panel-light-input" style={{ ...lightInput, gridColumn:'1/-1' }}/>
                            <input value={svc.category} onChange={e=>updateService(svc.id,'category',e.target.value)}
                              placeholder="Categoría" className="panel-light-input" style={lightInput}/>
                            <input value={svc.description} onChange={e=>updateService(svc.id,'description',e.target.value)}
                              placeholder="Descripción" className="panel-light-input" style={lightInput}/>
                            <div style={{ display:'flex', alignItems:'center', gap:8, ...lightInput, borderRadius:10 }}>
                              <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', flexShrink:0 }}>min</span>
                              <input type="number" min={15} step={15} value={svc.duration_minutes}
                                onChange={e=>updateService(svc.id,'duration_minutes',e.target.value)}
                                style={{ width:'100%', fontSize:13, outline:'none', border:'none', background:'transparent', color:'var(--ink)' }}/>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, ...lightInput, borderRadius:10 }}>
                              <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', flexShrink:0 }}>$</span>
                              <input type="number" min={0} value={svc.price_ars}
                                onChange={e=>updateService(svc.id,'price_ars',e.target.value)}
                                style={{ width:'100%', fontSize:13, outline:'none', border:'none', background:'transparent', color:'var(--ink)' }}/>
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={()=>setEditSvcId(null)} style={{ flex:1, padding:'10px 0', borderRadius:10, background:color, color:'#fff', border:'none', fontFamily:'var(--f-mono)', fontSize:11, cursor:'pointer', fontWeight:700 }}>Listo</button>
                            <button onClick={()=>deleteService(svc.id)} style={{ padding:'10px 14px', borderRadius:10, background:'rgba(220,38,38,0.08)', color:'#dc2626', border:'1px solid rgba(220,38,38,0.2)', fontFamily:'var(--f-mono)', fontSize:11, cursor:'pointer' }}>Eliminar</button>
                          </div>
                        </div>
                      ):(
                        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontFamily:'var(--f-display)', fontWeight:600, fontSize:13, color:'var(--ink)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{svc.name}</p>
                            {svc.description&&<p style={{ fontSize:11, color:'var(--muted)', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{svc.description}</p>}
                            <p style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', marginTop:2 }}>
                              {svc.duration_minutes}min{svc.price_ars>0?` · ${fARS(svc.price_ars)}`:''}
                            </p>
                          </div>
                          <button onClick={()=>setEditSvcId(svc.id)} style={{ fontFamily:'var(--f-mono)', fontSize:10, letterSpacing:'0.06em', color:'var(--muted)', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:8, padding:'6px 10px', cursor:'pointer' }}>Editar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </Card>

            {/* Horarios */}
            <Card>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
                <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Horarios de atención</p>
              </div>
              <div>
                {DIAS_SCHED.map((day,i)=>{
                  const slot = editSchedule[day]
                  const isOpen = !!slot
                  return (
                    <div key={day} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<DIAS_SCHED.length-1?'1px solid var(--line)':undefined }}>
                      <button onClick={()=>toggleDay(day)}
                        style={{ width:40, height:24, borderRadius:100, border:'none', position:'relative', cursor:'pointer', flexShrink:0, background:isOpen?color:'var(--line)', transition:'background 0.2s' }}>
                        <span style={{ position:'absolute', top:4, width:16, height:16, background:'#fff', borderRadius:'50%', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 0.2s', left:isOpen?20:4 }}/>
                      </button>
                      <span style={{ fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.04em', color:isOpen?'var(--ink)':'var(--muted)', width:88, fontWeight:isOpen?700:400 }}>{DIAS_LABEL[day]}</span>
                      {isOpen&&slot?(
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
                          <input type="time" value={slot.open} onChange={e=>setDayTime(day,'open',e.target.value)}
                            className="panel-light-input" style={{ ...lightInput, padding:'6px 8px', fontSize:12, fontFamily:'var(--f-mono)' }}/>
                          <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)' }}>a</span>
                          <input type="time" value={slot.close} onChange={e=>setDayTime(day,'close',e.target.value)}
                            className="panel-light-input" style={{ ...lightInput, padding:'6px 8px', fontSize:12, fontFamily:'var(--f-mono)' }}/>
                        </div>
                      ):(
                        <span style={{ marginLeft:'auto', fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)' }}>Cerrado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Datos del negocio */}
            <Card>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--line)' }}>
                <p style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:14, color:'var(--ink)', margin:0 }}>Datos del negocio</p>
              </div>
              <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:6 }}>WhatsApp del dueño</label>
                  <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)}
                    placeholder="5492664000000" className="panel-light-input"
                    style={{ ...lightInput, width:'100%', boxSizing:'border-box' }}/>
                  <p style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', marginTop:4 }}>Sin espacios ni +. Ej: 5492664864731</p>
                </div>
                <div>
                  <label style={{ display:'block', fontFamily:'var(--f-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:6 }}>Cambiar PIN de acceso</label>
                  <input type="text" inputMode="numeric" maxLength={4} value={editPin} onChange={e=>setEditPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                    placeholder="· · · ·" className="panel-light-input"
                    style={{ ...lightInput, width:'100%', boxSizing:'border-box', fontSize:20, fontFamily:'var(--f-mono)', letterSpacing:'0.4em', textAlign:'center' }}/>
                  <p style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--muted)', marginTop:4 }}>Dejalo vacío para no cambiar el PIN actual.</p>
                </div>
              </div>
            </Card>

            {/* Guardar */}
            {cfgMsg&&(
              <div style={{ padding:'12px 16px', borderRadius:10, fontSize:13, fontWeight:600, textAlign:'center',
                ...(cfgMsg.startsWith('✅')?{background:`${color}12`,color:color,border:`1px solid ${color}33`}:{background:'rgba(220,38,38,0.08)',color:'#dc2626',border:'1px solid rgba(220,38,38,0.2)'}) }}>
                {cfgMsg}
              </div>
            )}
            <button onClick={saveConfig} disabled={savingCfg}
              style={{ width:'100%', padding:'16px 0', borderRadius:12, background:color, color:'#fff', border:'none', fontFamily:'var(--f-mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, cursor:'pointer', opacity:savingCfg?0.5:1, boxShadow:`0 4px 24px ${color}44` }}>
              {savingCfg?'Guardando...':'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {/* Botón flotante "Nuevo turno" */}
      <div style={{ position:'fixed', bottom:28, right:24, zIndex:50 }}>
        <a
          href={`/reservas/${configId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', gap:8,
            background:color, color:'#fff',
            borderRadius:100, padding:'14px 24px',
            fontFamily:'var(--f-mono)', fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700,
            textDecoration:'none', boxShadow:`0 4px 20px ${color}55`,
            whiteSpace:'nowrap',
          }}
        >
          + Nuevo turno
        </a>
      </div>
    </div>
  )
}
