'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

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

interface PanelData {
  company_name: string
  color: string
  owner_phone: string
  appointments: Appointment[]
  services: Service[]
  schedule: Schedule
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

// ─── Splash ───────────────────────────────────────────────────────
function PanelSplash({ companyName, color, onDone }: { companyName: string; color: string; onDone: () => void }) {
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
        style={{background:`linear-gradient(150deg,color-mix(in srgb,${color} 60%,#000) 0%,${color} 100%)`}}>
        <div style={{fontSize:'3.5rem',animation:'ps-in .7s ease both'}}>📅</div>
        <p className="text-white/60 text-xs font-bold uppercase tracking-[.3em] mt-4 mb-2" style={{animation:'ps-sub .6s .4s ease both'}}>Panel de Gestión</p>
        <h1 className="text-white font-black text-center px-8 uppercase tracking-widest" style={{fontSize:'clamp(1.6rem,6vw,2.8rem)',animation:'ps-in .8s .2s ease both'}}>
          {companyName}
        </h1>
        <p className="absolute bottom-10 text-white/50 text-xs tracking-widest uppercase" style={{animation:'ps-hint 2s 2s ease-in-out infinite'}}>Tocá para ingresar</p>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2"><span>📅</span><span className="font-bold text-gray-800">Calendario</span></div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">‹</button>
          <span className="font-bold text-gray-700 text-sm w-32 text-center">{MESES[vm]} {vy}</span>
          <button onClick={next} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">›</button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 mb-1">{DIAS_CAB.map(d=><div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day,i)=>{
            if(!day) return <div key={`e${i}`}/>
            const ds=`${vy}-${String(vm+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const da=byDate[ds]||[]
            const isSel=ds===selectedDay, isToday=ds===today
            const hasConf=da.some(a=>a.status==='confirmed'), hasPend=da.some(a=>a.status==='pending')
            return (
              <button key={ds} onClick={()=>onSelectDay(ds)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 ${isSel?'text-white shadow-md':''}`}
                style={isSel?{backgroundColor:color}:isToday?{outline:`2px solid ${color}`,color}:{}}>
                <span className="text-sm font-bold">{day}</span>
                {da.length>0&&<div className="flex gap-0.5 mt-0.5">
                  {hasConf&&<span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:isSel?'white':color}}/>}
                  {hasPend&&<span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>}
                </div>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex gap-4 px-5 py-3 border-t border-gray-50 bg-gray-50 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor:color}}/> Confirmado</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/> Pendiente</span>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────
export default function OwnerPanel() {
  const params = useParams()
  const configId = params.configId as string

  const [splashDone, setSplashDone] = useState(false)
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState('')
  const [data, setData] = useState<PanelData|null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'agenda'|'solicitudes'|'historial'|'config'>('agenda')
  const [selectedDay, setSelectedDay] = useState(todayStr())
  const [solFilter, setSolFilter] = useState<'todas'|'pendiente'|'confirmado'|'cancelado'>('todas')
  const [apptState, setApptState] = useState<Record<string,{sena:string;processing:boolean;done:'approved'|'rejected'|null}>>({})

  // Config editing state
  const [editServices, setEditServices] = useState<Service[]>([])
  const [editSchedule, setEditSchedule] = useState<Partial<Schedule>>({})
  const [editPhone, setEditPhone] = useState('')
  const [editPin, setEditPin] = useState('')
  const [editSvcId, setEditSvcId] = useState<string|null>(null)
  const [newSvcForm, setNewSvcForm] = useState<Partial<Service>|null>(null)
  const [savingCfg, setSavingCfg] = useState(false)
  const [cfgMsg, setCfgMsg] = useState('')

  const color = data?.color || '#7c3aed'
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
    setAuthed(true)
    setLoading(false)
  },[configId])

  function handlePin(e:React.FormEvent){e.preventDefault();setPinError('');loadData(pin)}

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--paper)' }}>
      <div style={{ background: 'var(--paper)', borderRadius: 20, border: '1px solid var(--line)', padding: 32, width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>📅</div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', margin: '0 0 4px' }}>Panel de turnos</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, fontFamily: 'var(--f-mono)' }}>Ingresá tu PIN de 4 dígitos</p>
        <form onSubmit={handlePin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" inputMode="numeric" maxLength={4} value={pin}
            onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}
            placeholder="· · · ·" autoFocus
            style={{ width: '100%', textAlign: 'center', fontSize: 28, fontFamily: 'var(--f-mono)', letterSpacing: '0.5em', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 0', outline: 'none', background: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}/>
          {pinError&&<p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{pinError}</p>}
          <button type="submit" disabled={pin.length!==4||loading}
            style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '14px 0', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', opacity: (pin.length!==4||loading) ? 0.4 : 1 }}>
            {loading?'Verificando...':'Entrar al panel'}
          </button>
        </form>
      </div>
    </div>
  )

  // ── SPLASH ──
  if(!splashDone) return <PanelSplash companyName={data?.company_name||''} color={color} onDone={()=>setSplashDone(true)}/>

  // ── PANEL ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>
      {/* Header v2 */}
      <header style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
          {(data?.company_name||'').charAt(0).toUpperCase()||'📅'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data?.company_name}</h1>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '2px 0 0' }}>Panel de Gestión</p>
        </div>
        <button onClick={()=>loadData(pin)} style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}>↻</button>
      </header>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
        {[
          {label:'Hoy',val:String(todayConf.length)+' turnos',sub:todayCob>0?fARS(todayCob):undefined},
          {label:'Pendientes',val:String(pending.length),sub:pending.length>0?'aprobar':undefined},
          {label:'Este mes',val:String(monthAppts.length)+' turnos',sub:undefined},
          {label:'Facturado',val:fARS(monthRevenue),sub:undefined},
        ].map((s,i)=>(
          <div key={s.label} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i<3?'1px solid var(--line)':undefined }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{s.val}</p>
            {s.sub&&<p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', margin: '2px 0 0' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Nav tabs v2 */}
      <nav style={{ display: 'flex', background: 'var(--paper)', borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
        {[
          {key:'agenda',label:'Agenda'},
          {key:'solicitudes',label:`Solicitudes${pending.length>0?` (${pending.length})`:''}`},
          {key:'historial',label:'Historial'},
          {key:'config',label:'Configurar'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as typeof tab)}
            style={{
              padding: '14px 18px', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: tab===t.key?700:500,
              letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', background: 'none', border: 'none',
              borderBottom: tab===t.key?`2px solid var(--ink)`:'2px solid transparent',
              color: tab===t.key?'var(--ink)':'var(--muted)', cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 100px' }}>
        {loading&&<p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', fontFamily: 'var(--f-mono)', fontSize: 12 }}>Cargando...</p>}

        {/* ── AGENDA ── */}
        {tab==='agenda'&&!loading&&(
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <AgendaCal appointments={appts} color={color} selectedDay={selectedDay} onSelectDay={setSelectedDay}/>
            <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>Turnos del día</p>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--muted)', margin: '2px 0 0', textTransform: 'capitalize' }}>
                    {DIAS_FULL[new Date(selectedDay+'T12:00:00').getDay()]}, {fDate(selectedDay)}
                  </p>
                </div>
                {selectedDay===today&&<span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(198,255,61,0.25)', color: 'var(--ink)', borderRadius: 100, padding: '3px 10px' }}>Hoy</span>}
              </div>

              {dayAppts.length===0
                ?<div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>Sin turnos este día</div>
                :<div>
                  {dayAppts.map((appt,i)=>(
                    <div key={appt.id} style={{ padding: 16, borderBottom: i<dayAppts.length-1?'1px solid var(--line)':undefined }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--muted)', margin: '0 0 3px' }}>{appt.appointment_time} · {appt.service_duration_minutes}min</p>
                          <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: '0 0 2px' }}>{appt.customer_name}</p>
                          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.service_name}</p>
                          {appt.customer_phone&&<a href={`https://wa.me/${appt.customer_phone.replace(/\D/g,'')}`}
                            target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#16a34a', marginTop: 2, display: 'inline-block' }}>
                            💬 {appt.customer_phone}</a>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                          {appt.status==='confirmed'&&<>
                            <button onClick={()=>updateStatus(appt.id,'completed')} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>✓ Listo</button>
                            <button onClick={()=>updateStatus(appt.id,'no_show')} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', background: 'var(--paper-2)', color: 'var(--muted)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>No vino</button>
                          </>}
                          {appt.status==='pending'&&<>
                            <button onClick={()=>handleAction(appt.id,'approve')} disabled={apptState[appt.id]?.processing} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', opacity: apptState[appt.id]?.processing?0.5:1 }}>✓ OK</button>
                            <button onClick={()=>handleAction(appt.id,'reject')} disabled={apptState[appt.id]?.processing} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', opacity: apptState[appt.id]?.processing?0.5:1 }}>✕</button>
                          </>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 100, padding: '3px 8px', ...(appt.status==='confirmed'?{background:'rgba(22,163,74,0.12)',color:'#16a34a'}:{background:'rgba(245,158,11,0.12)',color:'#d97706'}) }}>
                          {appt.status==='confirmed'?'Confirmado':'Pendiente'}
                        </span>
                        {appt.service_price_ars>0&&<span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>{fARS(appt.service_price_ars)}</span>}
                      </div>
                      {appt.customer_notes&&<p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, fontStyle: 'italic', background: 'var(--paper-2)', padding: '6px 10px', borderRadius: 8 }}>&ldquo;{appt.customer_notes}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}

        {/* ── SOLICITUDES ── */}
        {tab==='solicitudes'&&!loading&&(
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Solicitudes de turno</span>
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
                {(['todas','pendiente','confirmado','cancelado'] as const).map(f=>(
                  <button key={f} onClick={()=>setSolFilter(f)}
                    style={{ padding: '5px 12px', borderRadius: 100, fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontWeight: solFilter===f?700:500, background: solFilter===f?'var(--ink)':'var(--paper-2)', color: solFilter===f?'var(--paper)':'var(--muted)' }}>
                    {f==='todas'?'Todas':f.charAt(0).toUpperCase()+f.slice(1)+'s'}
                  </button>
                ))}
              </div>
            </div>

            {solicitudes.length===0
              ?<div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>Sin solicitudes.</div>
              :<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {solicitudes.map(appt=>{
                  const st=apptState[appt.id]||{sena:'',processing:false,done:null}
                  const isPend=appt.status==='pending'
                  const waOK=st.done==='approved'&&appt.customer_phone?buildWA(appt.customer_phone,`Hola ${appt.customer_name}! Tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}* a las *${appt.appointment_time}* fue *confirmado*. ¡Te esperamos!`):null
                  const waNO=st.done==='rejected'&&appt.customer_phone?buildWA(appt.customer_phone,`Hola ${appt.customer_name}, lamentablemente no podemos confirmar tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}*. Podés elegir otro horario.`):null
                  const statusStyle: Record<string,React.CSSProperties>={
                    confirmed:{background:'rgba(22,163,74,0.12)',color:'#16a34a'},
                    pending:{background:'rgba(245,158,11,0.12)',color:'#d97706'},
                    cancelled:{background:'rgba(220,38,38,0.08)',color:'#dc2626'},
                  }
                  return (
                    <div key={appt.id} style={{ background: 'var(--paper)', borderRadius: 14, border: isPend?'1px solid rgba(245,158,11,0.4)':'1px solid var(--line)', overflow: 'hidden' }}>
                      {isPend&&<div style={{ background: 'rgba(245,158,11,0.08)', padding: '8px 16px', borderBottom: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}/>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d97706', fontWeight: 700 }}>Pendiente de aprobación</span>
                      </div>}
                      <div style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                          <div>
                            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', margin: '0 0 2px' }}>{appt.customer_name}</p>
                            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 4px' }}>{appt.service_name}</p>
                            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)', margin: 0 }}>{fDate(appt.appointment_date)} · {appt.appointment_time}</p>
                            {appt.service_price_ars>0&&<p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>{fARS(appt.service_price_ars)}</p>}
                          </div>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 100, padding: '4px 10px', flexShrink: 0, ...(statusStyle[appt.status]||{background:'var(--paper-2)',color:'var(--muted)'}) }}>
                            {appt.status==='confirmed'?'Confirmado':appt.status==='pending'?'Pendiente':appt.status==='cancelled'?'Cancelado':appt.status}
                          </span>
                        </div>
                        {appt.customer_notes&&<p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', background: 'var(--paper-2)', padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>&ldquo;{appt.customer_notes}&rdquo;</p>}
                        {isPend&&!st.done&&<>
                          {appt.service_price_ars>0&&(
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: 'var(--paper-2)', borderRadius: 10, padding: '10px 12px' }}>
                              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Seña $</span>
                              <input type="number" min={0} max={appt.service_price_ars} placeholder="0"
                                value={st.sena} onChange={e=>setApptState(p=>({...p,[appt.id]:{...p[appt.id],sena:e.target.value}}))}
                                style={{ flex: 1, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px', fontSize: 13, outline: 'none', color: 'var(--ink)', width: 80 }}/>
                              {Number(st.sena)>0&&<span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>Saldo: <strong style={{ color: 'var(--ink)' }}>{fARS(appt.service_price_ars-Number(st.sena))}</strong></span>}
                            </div>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <button onClick={()=>handleAction(appt.id,'approve')} disabled={st.processing} style={{ padding: '12px 0', borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', border: 'none', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', opacity: st.processing?0.5:1 }}>{st.processing?'...':'Aprobar'}</button>
                            <button onClick={()=>handleAction(appt.id,'reject')} disabled={st.processing} style={{ padding: '12px 0', borderRadius: 10, background: '#dc2626', color: '#fff', border: 'none', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', opacity: st.processing?0.5:1 }}>{st.processing?'...':'Rechazar'}</button>
                          </div>
                        </>}
                        {(waOK||waNO)&&<div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {waOK&&<a href={waOK} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', borderRadius: 10, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', textDecoration: 'none', background: '#16a34a', color: '#fff' }}>Avisar — confirmado</a>}
                          {waNO&&<a href={waNO} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', borderRadius: 10, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', textDecoration: 'none', background: 'var(--muted)', color: '#fff' }}>Avisar — rechazado</a>}
                        </div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            }
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab==='historial'&&!loading&&(
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Totales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                {label:'Completados',val:String(historial.filter(a=>a.status==='completed').length)+' turnos'},
                {label:'Facturado total',val:fARS(totalHistorial)},
                {label:'Clientes únicos',val:String(Object.keys(clientMap).length)},
              ].map(s=>(
                <div key={s.label} style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', padding: 16, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Top clientes */}
            {topClients.length>0&&(
              <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                  <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>Clientes recurrentes</p>
                </div>
                <div>
                  {topClients.map((c,i)=>(
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i<topClients.length-1?'1px solid var(--line)':undefined }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', width: 20 }}>{i+1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', margin: 0 }}>{c.visits} {c.visits===1?'visita':'visitas'}</p>
                      </div>
                      {c.total>0&&<span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{fARS(c.total)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista historial */}
            <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>Historial completo</p>
              </div>
              {historial.length===0
                ?<div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>Sin historial todavía.</div>
                :<div>
                  {historial.map((appt,i)=>{
                    const labels:Record<string,string>={cancelled:'Cancelado',completed:'Completado',no_show:'No vino'}
                    const statusColors:Record<string,string>={cancelled:'#dc2626',completed:'#16a34a',no_show:'var(--muted)'}
                    return (
                      <div key={appt.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: i<historial.length-1?'1px solid var(--line)':undefined }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.customer_name}</p>
                          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.service_name}</p>
                          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', margin: '1px 0 0' }}>{fDate(appt.appointment_date)} · {appt.appointment_time}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: statusColors[appt.status]||'var(--muted)' }}>{labels[appt.status]||appt.status}</span>
                          {appt.service_price_ars>0&&<span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{fARS(appt.service_price_ars)}</span>}
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', background: 'var(--paper-2)' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>Total facturado</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{fARS(totalHistorial)}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        )}

        {/* ── CONFIGURACIÓN ── */}
        {tab==='config'&&!loading&&(
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Servicios */}
            <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>Servicios</p>
                <button onClick={()=>setNewSvcForm({})}
                  style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>+ Agregar</button>
              </div>

              {newSvcForm!==null&&(
                <div style={{ padding: 16, borderBottom: '1px dashed var(--line)', background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Nuevo servicio</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input placeholder="Nombre del servicio *" value={newSvcForm.name||''}
                      onChange={e=>setNewSvcForm(p=>({...p,name:e.target.value}))}
                      style={{ gridColumn: '1/-1', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)' }}/>
                    <input placeholder="Categoría" value={newSvcForm.category||''}
                      onChange={e=>setNewSvcForm(p=>({...p,category:e.target.value}))}
                      style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)' }}/>
                    <input placeholder="Descripción" value={newSvcForm.description||''}
                      onChange={e=>setNewSvcForm(p=>({...p,description:e.target.value}))}
                      style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)' }}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', background: 'var(--paper)' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>min</span>
                      <input type="number" min={15} step={15} placeholder="60" value={newSvcForm.duration_minutes||''}
                        onChange={e=>setNewSvcForm(p=>({...p,duration_minutes:Number(e.target.value)}))}
                        style={{ width: '100%', fontSize: 13, outline: 'none', border: 'none', background: 'transparent', color: 'var(--ink)' }}/>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', background: 'var(--paper)' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>$</span>
                      <input type="number" min={0} placeholder="0" value={newSvcForm.price_ars||''}
                        onChange={e=>setNewSvcForm(p=>({...p,price_ars:Number(e.target.value)}))}
                        style={{ width: '100%', fontSize: 13, outline: 'none', border: 'none', background: 'transparent', color: 'var(--ink)' }}/>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addService} disabled={!newSvcForm.name?.trim()}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', border: 'none', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', opacity: !newSvcForm.name?.trim()?0.4:1 }}>Agregar</button>
                    <button onClick={()=>setNewSvcForm(null)} style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--paper)', border: '1px solid var(--line)', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </div>
              )}

              {editServices.length===0&&newSvcForm===null&&(
                <p style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: 12, padding: '32px 0' }}>Sin servicios. Agregá uno.</p>
              )}

              {Object.entries(catMap).map(([cat,svcs])=>(
                <div key={cat}>
                  <div style={{ padding: '8px 16px', background: 'var(--paper-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0, fontWeight: 700 }}>{cat}</p>
                  </div>
                  {svcs.map((svc,i)=>(
                    <div key={svc.id} style={{ borderBottom: i<svcs.length-1?'1px solid var(--line)':undefined }}>
                      {editSvcId===svc.id?(
                        <div style={{ padding: 16, background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input value={svc.name} onChange={e=>updateService(svc.id,'name',e.target.value)}
                              placeholder="Nombre" style={{ gridColumn: '1/-1', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)' }}/>
                            <input value={svc.category} onChange={e=>updateService(svc.id,'category',e.target.value)}
                              placeholder="Categoría" style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)' }}/>
                            <input value={svc.description} onChange={e=>updateService(svc.id,'description',e.target.value)}
                              placeholder="Descripción" style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)' }}/>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', background: 'var(--paper)' }}>
                              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>min</span>
                              <input type="number" min={15} step={15} value={svc.duration_minutes}
                                onChange={e=>updateService(svc.id,'duration_minutes',e.target.value)}
                                style={{ width: '100%', fontSize: 13, outline: 'none', border: 'none', background: 'transparent', color: 'var(--ink)' }}/>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', background: 'var(--paper)' }}>
                              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>$</span>
                              <input type="number" min={0} value={svc.price_ars}
                                onChange={e=>updateService(svc.id,'price_ars',e.target.value)}
                                style={{ width: '100%', fontSize: 13, outline: 'none', border: 'none', background: 'transparent', color: 'var(--ink)' }}/>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={()=>setEditSvcId(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', border: 'none', fontFamily: 'var(--f-mono)', fontSize: 11, cursor: 'pointer' }}>Listo</button>
                            <button onClick={()=>deleteService(svc.id)} style={{ padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#dc2626', border: 'none', fontFamily: 'var(--f-mono)', fontSize: 11, cursor: 'pointer' }}>Eliminar</button>
                          </div>
                        </div>
                      ):(
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.name}</p>
                            {svc.description&&<p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.description}</p>}
                            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                              {svc.duration_minutes}min{svc.price_ars>0?` · ${fARS(svc.price_ars)}`:''}
                            </p>
                          </div>
                          <button onClick={()=>setEditSvcId(svc.id)} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--muted)', background: 'var(--paper-2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Editar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Horarios */}
            <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>Horarios de atención</p>
              </div>
              <div>
                {DIAS_SCHED.map((day,i)=>{
                  const slot = editSchedule[day]
                  const isOpen = !!slot
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i<DIAS_SCHED.length-1?'1px solid var(--line)':undefined }}>
                      <button onClick={()=>toggleDay(day)}
                        style={{ width: 40, height: 24, borderRadius: 100, border: 'none', position: 'relative', cursor: 'pointer', flexShrink: 0, background: isOpen?'var(--ink)':'var(--paper-2)', transition: 'background 0.2s' }}>
                        <span style={{ position: 'absolute', top: 4, width: 16, height: 16, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: isOpen?20:4 }}/>
                      </button>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.04em', color: isOpen?'var(--ink)':'var(--muted)', width: 88, fontWeight: isOpen?700:400 }}>{DIAS_LABEL[day]}</span>
                      {isOpen&&slot?(
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                          <input type="time" value={slot.open} onChange={e=>setDayTime(day,'open',e.target.value)}
                            style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px', fontSize: 12, outline: 'none', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'var(--f-mono)' }}/>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>a</span>
                          <input type="time" value={slot.close} onChange={e=>setDayTime(day,'close',e.target.value)}
                            style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px', fontSize: 12, outline: 'none', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'var(--f-mono)' }}/>
                        </div>
                      ):(
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)' }}>Cerrado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Datos del negocio */}
            <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>Datos del negocio</p>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>WhatsApp del dueño</label>
                  <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)}
                    placeholder="5492664000000" style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}/>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>Sin espacios ni +. Ej: 5492664864731</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Cambiar PIN de acceso</label>
                  <input type="text" inputMode="numeric" maxLength={4} value={editPin} onChange={e=>setEditPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                    placeholder="· · · ·" style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 20, outline: 'none', background: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box', fontFamily: 'var(--f-mono)', letterSpacing: '0.4em', textAlign: 'center' }}/>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>Dejalo vacío para no cambiar el PIN actual.</p>
                </div>
              </div>
            </div>

            {/* Guardar */}
            {cfgMsg&&(
              <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center', ...(cfgMsg.startsWith('✅')?{background:'rgba(198,255,61,0.15)',color:'var(--ink)',border:'1px solid rgba(198,255,61,0.3)'}:{background:'#fee2e2',color:'#dc2626',border:'1px solid #fca5a5'}) }}>
                {cfgMsg}
              </div>
            )}
            <button onClick={saveConfig} disabled={savingCfg}
              style={{ width: '100%', padding: '16px 0', borderRadius: 12, background: 'var(--ink)', color: 'var(--paper)', border: 'none', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', opacity: savingCfg?0.5:1 }}>
              {savingCfg?'Guardando...':'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {/* Botón flotante "Nuevo turno" */}
      <div style={{ position: 'fixed', bottom: 28, right: 24, zIndex: 50 }}>
        <a
          href={`/reservas/${configId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--ink)', color: 'var(--paper)',
            borderRadius: 100, padding: '14px 24px',
            fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
          }}
        >
          + Nuevo turno
        </a>
      </div>
    </div>
  )
}
