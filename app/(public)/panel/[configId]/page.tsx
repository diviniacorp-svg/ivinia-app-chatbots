'use client'

import { useState, useEffect, useCallback } from 'react'
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">📅</div>
        <h1 className="text-xl font-black text-gray-900 mb-1">Panel de turnos</h1>
        <p className="text-gray-500 text-sm mb-6">Ingresá tu PIN de 4 dígitos</p>
        <form onSubmit={handlePin} className="space-y-4">
          <input type="text" inputMode="numeric" maxLength={4} value={pin}
            onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}
            placeholder="· · · ·" autoFocus
            className="w-full text-center text-3xl font-mono tracking-[.5em] border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-indigo-400"/>
          {pinError&&<p className="text-red-500 text-sm">{pinError}</p>}
          <button type="submit" disabled={pin.length!==4||loading}
            className="w-full text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors"
            style={{backgroundColor:color}}>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white px-4 py-3 flex items-center gap-3 shadow-sm" style={{backgroundColor:color}}>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shrink-0">📅</div>
        <div className="min-w-0 flex-1">
          <h1 className="font-black text-sm leading-tight truncate">{data?.company_name}</h1>
          <p className="text-white/60 text-xs">Panel de Gestión</p>
        </div>
        <button onClick={()=>loadData(pin)} className="text-white/70 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg shrink-0">↻</button>
      </header>

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 bg-white border-b border-gray-100 divide-x divide-gray-100">
        {[
          {label:'Hoy',val:String(todayConf.length)+' turnos',sub:todayCob>0?fARS(todayCob):undefined},
          {label:'Pendientes',val:String(pending.length),sub:pending.length>0?'de aprobar':undefined},
          {label:'Este mes',val:String(monthAppts.length)+' turnos',sub:undefined},
          {label:'Facturado mes',val:fARS(monthRevenue),sub:undefined},
        ].map(s=>(
          <div key={s.label} className="py-3 px-2 text-center">
            <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
            <p className="text-xs font-bold text-gray-800 leading-tight">{s.val}</p>
            {s.sub&&<p className="text-xs text-gray-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="flex border-b border-gray-200 bg-white overflow-x-auto">
        {[
          {key:'agenda',label:'Agenda'},
          {key:'solicitudes',label:`Solicitudes${pending.length>0?` (${pending.length})`:''}`},
          {key:'historial',label:'Historial'},
          {key:'config',label:'⚙ Configurar'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as typeof tab)}
            className={`px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${tab===t.key?'':'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={tab===t.key?{borderBottomColor:color,color}:{}}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto p-4 pb-20">
        {loading&&<p className="text-center text-gray-400 py-10 text-sm">Cargando...</p>}

        {/* ── AGENDA ── */}
        {tab==='agenda'&&!loading&&(
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <AgendaCal appointments={appts} color={color} selectedDay={selectedDay} onSelectDay={setSelectedDay}/>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Turnos del día</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {DIAS_FULL[new Date(selectedDay+'T12:00:00').getDay()]}, {fDate(selectedDay)}
                    </p>
                  </div>
                  {selectedDay===today&&<span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-semibold">Hoy</span>}
                </div>

                {dayAppts.length===0
                  ?<div className="py-10 text-center text-gray-400 text-sm">Sin turnos este día</div>
                  :<div className="divide-y divide-gray-50">
                    {dayAppts.map(appt=>(
                      <div key={appt.id} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 font-semibold">⏰ {appt.appointment_time} · {appt.service_duration_minutes}min</p>
                            <p className="font-bold text-gray-900 text-sm">{appt.customer_name}</p>
                            <p className="text-xs text-gray-600 truncate">{appt.service_name}</p>
                            {appt.customer_phone&&<a href={`https://wa.me/${appt.customer_phone.replace(/\D/g,'')}`}
                              target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 mt-0.5 inline-block">
                              💬 {appt.customer_phone}</a>}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {appt.status==='confirmed'&&<>
                              <button onClick={()=>updateStatus(appt.id,'completed')} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium hover:bg-blue-100">✓ Listo</button>
                              <button onClick={()=>updateStatus(appt.id,'no_show')} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg font-medium hover:bg-gray-200">👻 No vino</button>
                            </>}
                            {appt.status==='pending'&&<>
                              <button onClick={()=>handleAction(appt.id,'approve')} disabled={apptState[appt.id]?.processing} className="text-xs text-white px-2.5 py-1.5 rounded-lg font-medium disabled:opacity-50" style={{backgroundColor:color}}>✓ OK</button>
                              <button onClick={()=>handleAction(appt.id,'reject')} disabled={apptState[appt.id]?.processing} className="text-xs bg-red-500 text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">✕</button>
                            </>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${appt.status==='confirmed'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
                            {appt.status==='confirmed'?'CONFIRMADO':'PENDIENTE'}
                          </span>
                          {appt.service_price_ars>0&&<span className="text-xs text-gray-400">{fARS(appt.service_price_ars)}</span>}
                        </div>
                        {appt.customer_notes&&<p className="text-xs text-gray-500 mt-1.5 italic bg-gray-50 px-2 py-1 rounded-lg">&ldquo;{appt.customer_notes}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>
          </div>
        )}

        {/* ── SOLICITUDES ── */}
        {tab==='solicitudes'&&!loading&&(
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="font-semibold text-gray-700 text-sm">Solicitudes de turno</span>
              <div className="flex gap-1.5 ml-auto flex-wrap">
                {(['todas','pendiente','confirmado','cancelado'] as const).map(f=>(
                  <button key={f} onClick={()=>setSolFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${solFilter===f?'text-white':'bg-gray-100 text-gray-600'}`}
                    style={solFilter===f?{backgroundColor:color}:{}}>
                    {f==='todas'?'Todas':f.charAt(0).toUpperCase()+f.slice(1)+'s'}
                  </button>
                ))}
              </div>
            </div>

            {solicitudes.length===0
              ?<div className="text-center py-14 text-gray-400"><p className="text-4xl mb-3">✅</p><p className="text-sm">Sin solicitudes.</p></div>
              :<div className="space-y-3">
                {solicitudes.map(appt=>{
                  const st=apptState[appt.id]||{sena:'',processing:false,done:null}
                  const isPend=appt.status==='pending'
                  const waOK=st.done==='approved'&&appt.customer_phone?buildWA(appt.customer_phone,`Hola ${appt.customer_name}! 🎉 Tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}* a las *${appt.appointment_time}* fue *confirmado*. ¡Te esperamos!`):null
                  const waNO=st.done==='rejected'&&appt.customer_phone?buildWA(appt.customer_phone,`Hola ${appt.customer_name}, lamentablemente no podemos confirmar tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}*. Podés elegir otro horario. 🙏`):null
                  return (
                    <div key={appt.id} className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${isPend?'border-amber-200':'border-gray-100'}`}>
                      {isPend&&<div className="bg-amber-50 px-4 py-2 flex items-center gap-2 border-b border-amber-100">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Pendiente de aprobación</span>
                      </div>}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-black text-gray-900">{appt.customer_name}</p>
                            <p className="text-sm text-gray-700">{appt.service_name}</p>
                            <p className="text-sm font-bold mt-0.5" style={{color}}>📅 {fDate(appt.appointment_date)} · ⏰ {appt.appointment_time}</p>
                            {appt.service_price_ars>0&&<p className="text-xs text-gray-500 mt-0.5">💰 {fARS(appt.service_price_ars)}</p>}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${appt.status==='confirmed'?'bg-green-100 text-green-700':appt.status==='pending'?'bg-amber-100 text-amber-700':appt.status==='cancelled'?'bg-red-100 text-red-600':'bg-gray-100 text-gray-600'}`}>
                            {appt.status==='confirmed'?'✅ Confirmado':appt.status==='pending'?'⏳ Pendiente':appt.status==='cancelled'?'❌ Cancelado':appt.status}
                          </span>
                        </div>
                        {appt.customer_notes&&<p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg mb-3">&ldquo;{appt.customer_notes}&rdquo;</p>}
                        {isPend&&!st.done&&<>
                          {appt.service_price_ars>0&&(
                            <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl px-3 py-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap">Seña $</span>
                              <input type="number" min={0} max={appt.service_price_ars} placeholder="0"
                                value={st.sena} onChange={e=>setApptState(p=>({...p,[appt.id]:{...p[appt.id],sena:e.target.value}}))}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none w-24"/>
                              {Number(st.sena)>0&&<span className="text-xs text-gray-500">Saldo: <strong>{fARS(appt.service_price_ars-Number(st.sena))}</strong></span>}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={()=>handleAction(appt.id,'approve')} disabled={st.processing} className="py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50" style={{backgroundColor:color}}>{st.processing?'...':'✓ Aprobar'}</button>
                            <button onClick={()=>handleAction(appt.id,'reject')} disabled={st.processing} className="py-3 rounded-xl font-bold text-sm bg-red-500 text-white disabled:opacity-50 hover:bg-red-600">{st.processing?'...':'✕ Rechazar'}</button>
                          </div>
                        </>}
                        {(waOK||waNO)&&<div className="mt-2 space-y-2">
                          {waOK&&<a href={waOK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600">💬 Avisar — confirmado</a>}
                          {waNO&&<a href={waNO} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-gray-600 text-white hover:bg-gray-700">💬 Avisar — rechazado</a>}
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
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Totales */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {label:'Total completados',val:String(historial.filter(a=>a.status==='completed').length)+' turnos'},
                {label:'Total facturado',val:fARS(totalHistorial)},
                {label:'Clientes únicos',val:String(Object.keys(clientMap).length)},
              ].map(s=>(
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                  <p className="font-bold text-gray-800 text-sm">{s.val}</p>
                </div>
              ))}
            </div>

            {/* Top clientes */}
            {topClients.length>0&&(
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <p className="font-bold text-gray-700 text-sm">👥 Clientes recurrentes</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {topClients.map((c,i)=>(
                    <div key={c.name} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-xs font-bold text-gray-400 w-5">{i+1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.visits} {c.visits===1?'visita':'visitas'}</p>
                      </div>
                      {c.total>0&&<span className="text-xs font-bold" style={{color}}>{fARS(c.total)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista historial */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100">
                <p className="font-bold text-gray-700 text-sm">📋 Historial completo</p>
              </div>
              {historial.length===0
                ?<div className="text-center py-10 text-gray-400 text-sm">Sin historial todavía.</div>
                :<div className="divide-y divide-gray-50">
                  {historial.map(appt=>{
                    const labels:Record<string,string>={cancelled:'❌ Cancelado',completed:'✅ Completado',no_show:'👻 No vino'}
                    return (
                      <div key={appt.id} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{appt.customer_name}</p>
                          <p className="text-xs text-gray-500 truncate">{appt.service_name}</p>
                          <p className="text-xs text-gray-400">{fDate(appt.appointment_date)} · {appt.appointment_time}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="text-xs text-gray-500">{labels[appt.status]||appt.status}</span>
                          {appt.service_price_ars>0&&<span className="text-xs font-semibold text-gray-600">{fARS(appt.service_price_ars)}</span>}
                        </div>
                      </div>
                    )
                  })}
                  <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                    <span className="text-xs font-bold text-gray-600">Total facturado</span>
                    <span className="text-sm font-black" style={{color}}>{fARS(totalHistorial)}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        )}

        {/* ── CONFIGURACIÓN ── */}
        {tab==='config'&&!loading&&(
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Servicios */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                <p className="font-bold text-gray-700 text-sm">🛠 Servicios</p>
                <button onClick={()=>setNewSvcForm({})}
                  className="text-xs font-bold text-white px-3 py-1.5 rounded-lg"
                  style={{backgroundColor:color}}>+ Agregar</button>
              </div>

              {/* Formulario nuevo servicio */}
              {newSvcForm!==null&&(
                <div className="p-4 border-b border-dashed border-gray-200 bg-gray-50 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nuevo servicio</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Nombre del servicio *" value={newSvcForm.name||''}
                      onChange={e=>setNewSvcForm(p=>({...p,name:e.target.value}))}
                      className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/>
                    <input placeholder="Categoría" value={newSvcForm.category||''}
                      onChange={e=>setNewSvcForm(p=>({...p,category:e.target.value}))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/>
                    <input placeholder="Descripción" value={newSvcForm.description||''}
                      onChange={e=>setNewSvcForm(p=>({...p,description:e.target.value}))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-400 shrink-0">⏱ min</span>
                      <input type="number" min={15} step={15} placeholder="60" value={newSvcForm.duration_minutes||''}
                        onChange={e=>setNewSvcForm(p=>({...p,duration_minutes:Number(e.target.value)}))}
                        className="w-full text-sm outline-none"/>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-400 shrink-0">$ precio</span>
                      <input type="number" min={0} placeholder="0" value={newSvcForm.price_ars||''}
                        onChange={e=>setNewSvcForm(p=>({...p,price_ars:Number(e.target.value)}))}
                        className="w-full text-sm outline-none"/>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addService} disabled={!newSvcForm.name?.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                      style={{backgroundColor:color}}>Agregar</button>
                    <button onClick={()=>setNewSvcForm(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100">Cancelar</button>
                  </div>
                </div>
              )}

              {editServices.length===0&&newSvcForm===null&&(
                <p className="text-center text-gray-400 text-sm py-8">Sin servicios. Agregá uno.</p>
              )}

              {Object.entries(catMap).map(([cat,svcs])=>(
                <div key={cat}>
                  <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cat}</p>
                  </div>
                  {svcs.map(svc=>(
                    <div key={svc.id} className="border-b border-gray-50 last:border-0">
                      {editSvcId===svc.id?(
                        <div className="p-4 space-y-2 bg-indigo-50/40">
                          <div className="grid grid-cols-2 gap-2">
                            <input value={svc.name} onChange={e=>updateService(svc.id,'name',e.target.value)}
                              placeholder="Nombre" className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/>
                            <input value={svc.category} onChange={e=>updateService(svc.id,'category',e.target.value)}
                              placeholder="Categoría" className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/>
                            <input value={svc.description} onChange={e=>updateService(svc.id,'description',e.target.value)}
                              placeholder="Descripción" className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                              <span className="text-xs text-gray-400">⏱ min</span>
                              <input type="number" min={15} step={15} value={svc.duration_minutes}
                                onChange={e=>updateService(svc.id,'duration_minutes',e.target.value)}
                                className="w-full text-sm outline-none"/>
                            </div>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                              <span className="text-xs text-gray-400">$</span>
                              <input type="number" min={0} value={svc.price_ars}
                                onChange={e=>updateService(svc.id,'price_ars',e.target.value)}
                                className="w-full text-sm outline-none"/>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={()=>setEditSvcId(null)} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{backgroundColor:color}}>Listo</button>
                            <button onClick={()=>deleteService(svc.id)} className="px-4 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100">🗑</button>
                          </div>
                        </div>
                      ):(
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{svc.name}</p>
                            {svc.description&&<p className="text-xs text-gray-400 truncate">{svc.description}</p>}
                            <p className="text-xs text-gray-500 mt-0.5">
                              ⏱ {svc.duration_minutes}min
                              {svc.price_ars>0?` · ${fARS(svc.price_ars)}`:' · Consultar precio'}
                            </p>
                          </div>
                          <button onClick={()=>setEditSvcId(svc.id)} className="text-xs text-gray-400 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100">✏ Editar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Horarios */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100">
                <p className="font-bold text-gray-700 text-sm">🕐 Horarios de atención</p>
              </div>
              <div className="divide-y divide-gray-50">
                {DIAS_SCHED.map(day=>{
                  const slot = editSchedule[day]
                  const isOpen = !!slot
                  return (
                    <div key={day} className="flex items-center gap-3 px-4 py-3">
                      <button onClick={()=>toggleDay(day)}
                        className={`w-10 h-6 rounded-full transition-colors shrink-0 relative ${isOpen?'':'bg-gray-200'}`}
                        style={isOpen?{backgroundColor:color}:{}}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isOpen?'left-5':'left-1'}`}/>
                      </button>
                      <span className={`text-sm font-semibold w-24 ${isOpen?'text-gray-800':'text-gray-400'}`}>{DIAS_LABEL[day]}</span>
                      {isOpen&&slot?(
                        <div className="flex items-center gap-2 ml-auto">
                          <input type="time" value={slot.open} onChange={e=>setDayTime(day,'open',e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-200"/>
                          <span className="text-xs text-gray-400">a</span>
                          <input type="time" value={slot.close} onChange={e=>setDayTime(day,'close',e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-200"/>
                        </div>
                      ):(
                        <span className="ml-auto text-xs text-gray-400">Cerrado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Configuración extra */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100">
                <p className="font-bold text-gray-700 text-sm">⚙ Datos del negocio</p>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">WhatsApp del dueño</label>
                  <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)}
                    placeholder="5492664000000" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/>
                  <p className="text-xs text-gray-400 mt-1">Sin espacios ni +. Ej: 5492664864731</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cambiar PIN de acceso</label>
                  <input type="text" inputMode="numeric" maxLength={4} value={editPin} onChange={e=>setEditPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                    placeholder="Nuevo PIN (4 dígitos)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 tracking-widest font-mono text-center text-lg"/>
                  <p className="text-xs text-gray-400 mt-1">Dejalo vacío para no cambiar el PIN actual.</p>
                </div>
              </div>
            </div>

            {/* Guardar */}
            {cfgMsg&&(
              <div className={`px-4 py-3 rounded-xl text-sm font-semibold text-center ${cfgMsg.startsWith('✅')?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>
                {cfgMsg}
              </div>
            )}
            <button onClick={saveConfig} disabled={savingCfg}
              className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg disabled:opacity-50 transition-opacity"
              style={{backgroundColor:color}}>
              {savingCfg?'Guardando...':'💾 Guardar cambios'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
