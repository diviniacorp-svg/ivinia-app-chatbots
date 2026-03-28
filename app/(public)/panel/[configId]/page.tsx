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
  status: 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  sena_ars?: number
  created_at: string
}

interface PanelData {
  company_name: string
  color: string
  owner_phone: string
  appointments: Appointment[]
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_CAB = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DIAS_FULL = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function fDate(d: string) { if (!d) return ''; const [y,m,day] = d.split('-'); return `${day}/${m}/${y}` }
function fARS(n: number) { return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0}).format(n) }
function buildWA(phone: string, msg: string) { return `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}` }
function todayStr() { return new Date().toISOString().split('T')[0] }

// ─── Splash ──────────────────────────────────────────────────────
function PanelSplash({ companyName, color, onDone }: { companyName: string; color: string; onDone: () => void }) {
  const [fading, setFading] = useState(false)
  function close() { if (fading) return; setFading(true); setTimeout(onDone, 700) }
  useEffect(() => { const t = setTimeout(close, 3000); return () => clearTimeout(t) }, [])

  return (
    <>
      <style>{`
        @keyframes ps-star{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:.6;transform:scale(1.2)}}
        @keyframes ps-in{0%{opacity:0;transform:translateY(28px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes ps-sub{0%{opacity:0}100%{opacity:.75}}
        @keyframes ps-hint{0%,100%{opacity:.3}50%{opacity:.8}}
        @keyframes ps-out{to{opacity:0;visibility:hidden}}
        .ps-fade{animation:ps-out .7s ease forwards}
      `}</style>
      <div onClick={close}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none${fading ? ' ps-fade' : ''}`}
        style={{background:`linear-gradient(150deg,color-mix(in srgb,${color} 50%,#000) 0%,${color} 55%,color-mix(in srgb,${color} 70%,#fff) 100%)`}}>
        {Array.from({length:16},(_,i)=>(
          <div key={i} className="absolute rounded-full bg-white"
            style={{width:2+(i*3)%5,height:2+(i*3)%5,top:`${5+(i*53)%88}%`,left:`${3+(i*71)%92}%`,
              animation:`ps-star ${2+(i*.3)%2}s ${(i*.2)%2}s ease-in-out infinite`}}/>
        ))}
        <div style={{fontSize:'4rem',animation:'ps-in .7s ease both'}}>🌸</div>
        <p className="text-white/60 text-xs font-bold uppercase tracking-[.3em] mt-4 mb-2"
          style={{animation:'ps-sub .6s .5s ease both'}}>Panel de Gestión</p>
        <h1 className="text-white font-black text-center px-8 uppercase tracking-widest"
          style={{fontSize:'clamp(1.8rem,7vw,3rem)',animation:'ps-in .8s .2s ease both',textShadow:'0 2px 20px rgba(0,0,0,.3)'}}>
          Bienvenida, {companyName.split(' ')[0]}
        </h1>
        <p className="text-white/70 text-center mt-2 uppercase tracking-widest text-sm"
          style={{animation:'ps-sub .9s .7s ease both'}}>A tu panel de gestión</p>
        <p className="absolute bottom-10 text-white/50 text-xs tracking-widest uppercase"
          style={{animation:'ps-hint 2s 2s ease-in-out infinite'}}>Tocá para ingresar</p>
      </div>
    </>
  )
}

// ─── Calendario con puntos ────────────────────────────────────────
function AgendaCal({ appointments, color, selectedDay, onSelectDay }: {
  appointments: Appointment[]; color: string; selectedDay: string; onSelectDay:(d:string)=>void
}) {
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
        <div className="flex items-center gap-2"><span>📅</span><span className="font-bold text-gray-800">Calendario de Turnos</span></div>
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
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 p-0.5 ${isSel?'text-white shadow-md':''}`}
                style={isSel?{backgroundColor:color}:isToday?{outline:`2px solid ${color}`,color}:{}}>
                <span className={`text-sm font-bold ${isSel||isToday?'':' text-gray-800'}`}>{day}</span>
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
  const [tab, setTab] = useState<'agenda'|'solicitudes'|'historial'>('agenda')
  const [selectedDay, setSelectedDay] = useState(todayStr())
  const [solFilter, setSolFilter] = useState<'todas'|'pendiente'|'confirmado'|'cancelado'>('todas')
  const [apptState, setApptState] = useState<Record<string,{sena:string;processing:boolean;done:'approved'|'rejected'|null}>>({})

  const color = data?.color || '#7c3aed'
  const today = todayStr()

  const loadData = useCallback(async(pinValue:string)=>{
    setLoading(true)
    const res = await fetch(`/api/panel/${configId}?pin=${pinValue}`)
    if(res.status===401){setPinError('PIN incorrecto.');setAuthed(false);setLoading(false);return}
    if(!res.ok){setLoading(false);return}
    setData(await res.json()); setAuthed(true); setLoading(false)
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

  useEffect(()=>{
    if(!data) return
    setApptState(p=>{const n={...p};data.appointments.forEach(a=>{if(!n[a.id])n[a.id]={sena:'',processing:false,done:null}});return n})
  },[data])

  const appts = data?.appointments||[]
  const pending = appts.filter(a=>a.status==='pending')
  const confirmed = appts.filter(a=>a.status==='confirmed')
  const todayConf = confirmed.filter(a=>a.appointment_date===today)
  const todayCob = todayConf.reduce((s,a)=>s+(a.sena_ars||0),0)
  const todayPend = todayConf.reduce((s,a)=>s+(a.service_price_ars-(a.sena_ars||0)),0)

  const dayAppts = appts
    .filter(a=>a.appointment_date===selectedDay&&['confirmed','pending','pending_payment'].includes(a.status))
    .sort((a,b)=>a.appointment_time.localeCompare(b.appointment_time))

  const solicitudes = appts.filter(a=>{
    if(solFilter==='todas') return ['pending','confirmed','cancelled'].includes(a.status)
    if(solFilter==='pendiente') return a.status==='pending'
    if(solFilter==='confirmado') return a.status==='confirmed'
    return a.status==='cancelled'
  }).sort((a,b)=>b.created_at.localeCompare(a.created_at))

  const historial = appts
    .filter(a=>['completed','no_show','cancelled'].includes(a.status))
    .sort((a,b)=>b.appointment_date.localeCompare(a.appointment_date))

  // LOGIN
  if(!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🌸</div>
        <h1 className="text-xl font-black text-gray-900 mb-1">Panel de turnos</h1>
        <p className="text-gray-500 text-sm mb-6">Ingresá tu PIN de 4 dígitos</p>
        <form onSubmit={handlePin} className="space-y-4">
          <input type="text" inputMode="numeric" maxLength={4} value={pin}
            onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}
            placeholder="· · · ·" autoFocus
            className="w-full text-center text-3xl font-mono tracking-[.5em] border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-purple-400"/>
          {pinError&&<p className="text-red-500 text-sm">{pinError}</p>}
          <button type="submit" disabled={pin.length!==4||loading}
            className="w-full text-white font-bold py-3.5 rounded-xl disabled:opacity-50"
            style={{backgroundColor:'#7c3aed'}}>
            {loading?'Verificando...':'Entrar al panel'}
          </button>
        </form>
      </div>
    </div>
  )

  // SPLASH
  if(!splashDone) return <PanelSplash companyName={data?.company_name||''} color={color} onDone={()=>setSplashDone(true)}/>

  // PANEL
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="text-white px-5 py-4 flex items-center gap-3 shadow-sm" style={{backgroundColor:color}}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">🌸</div>
        <div className="min-w-0">
          <h1 className="font-black text-sm leading-tight truncate">{data?.company_name} · Panel de Gestión</h1>
          <p className="text-white/60 text-xs">San Luis · Panel interno</p>
        </div>
        <button onClick={()=>loadData(pin)} className="ml-auto text-white/70 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg shrink-0">↻ Actualizar</button>
      </header>

      <nav className="flex border-b border-gray-200 bg-white">
        {[
          {key:'agenda',label:'✨ Agenda'},
          {key:'solicitudes',label:`📋 Solicitudes${pending.length>0?` (${pending.length})`:''}` },
          {key:'historial',label:'📁 Historial'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as typeof tab)}
            className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${tab===t.key?'':'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={tab===t.key?{borderBottomColor:color,color}:{}}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto p-4 pb-16">
        {loading&&<p className="text-center text-gray-400 py-10 text-sm">Cargando...</p>}

        {/* AGENDA */}
        {tab==='agenda'&&!loading&&(
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <AgendaCal appointments={appts} color={color} selectedDay={selectedDay} onSelectDay={setSelectedDay}/>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">✨ Agenda del día</p>
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
                            <p className="text-xs text-gray-600 truncate">💅 {appt.service_name}</p>
                            {appt.customer_phone&&<a href={`https://wa.me/${appt.customer_phone.replace(/\D/g,'')}`}
                              target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 mt-0.5 inline-block">
                              💬 {appt.customer_phone}</a>}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {appt.status==='confirmed'&&<>
                              <button onClick={()=>updateStatus(appt.id,'completed')}
                                className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium hover:bg-blue-100">✓ Listo</button>
                              <button onClick={()=>updateStatus(appt.id,'no_show')}
                                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg font-medium hover:bg-gray-200">👻 No vino</button>
                            </>}
                            {appt.status==='pending'&&<>
                              <button onClick={()=>handleAction(appt.id,'approve')} disabled={apptState[appt.id]?.processing}
                                className="text-xs text-white px-2.5 py-1.5 rounded-lg font-medium disabled:opacity-50"
                                style={{backgroundColor:color}}>✓ OK</button>
                              <button onClick={()=>handleAction(appt.id,'reject')} disabled={apptState[appt.id]?.processing}
                                className="text-xs bg-red-500 text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">✕</button>
                            </>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            appt.status==='confirmed'?'bg-green-100 text-green-700':
                            appt.status==='pending'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>
                            {appt.status==='confirmed'?'CONFIRMADO':appt.status==='pending'?'PENDIENTE':appt.status.toUpperCase()}
                          </span>
                          {appt.service_price_ars>0&&<span className="text-xs text-gray-400">{fARS(appt.service_price_ars)}</span>}
                        </div>
                        {appt.customer_notes&&<p className="text-xs text-gray-500 mt-1.5 italic bg-gray-50 px-2 py-1 rounded-lg">&ldquo;{appt.customer_notes}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                }

                {selectedDay===today&&(
                  <div className="grid grid-cols-3 border-t border-gray-100">
                    {[{label:'Turnos hoy',val:String(todayConf.length)},{label:'Cobrado',val:fARS(todayCob)},{label:'Pendiente',val:fARS(todayPend)}]
                      .map(s=>(
                        <div key={s.label} className="py-3 text-center border-r last:border-0 border-gray-100">
                          <p className="text-xs text-gray-400">{s.label}</p>
                          <p className="text-sm font-bold" style={{color}}>{s.val}</p>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SOLICITUDES */}
        {tab==='solicitudes'&&!loading&&(
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="font-semibold text-gray-700 text-sm">📋 Solicitudes</span>
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
                  const waNO=st.done==='rejected'&&appt.customer_phone?buildWA(appt.customer_phone,`Hola ${appt.customer_name}, lamentablemente no podemos confirmar tu turno de *${appt.service_name}* el *${fDate(appt.appointment_date)}*. Si querés, podés elegir otro horario. 🙏`):null
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
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                            appt.status==='confirmed'?'bg-green-100 text-green-700':
                            appt.status==='pending'?'bg-amber-100 text-amber-700':
                            appt.status==='cancelled'?'bg-red-100 text-red-600':'bg-gray-100 text-gray-600'}`}>
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
                            <button onClick={()=>handleAction(appt.id,'approve')} disabled={st.processing}
                              className="py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                              style={{backgroundColor:color}}>{st.processing?'...':'✓ Aprobar'}</button>
                            <button onClick={()=>handleAction(appt.id,'reject')} disabled={st.processing}
                              className="py-3 rounded-xl font-bold text-sm bg-red-500 text-white disabled:opacity-50 hover:bg-red-600">{st.processing?'...':'✕ Rechazar'}</button>
                          </div>
                        </>}

                        {(waOK||waNO)&&<div className="mt-2 space-y-2">
                          {waOK&&<a href={waOK} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600">
                            💬 Avisar — confirmado</a>}
                          {waNO&&<a href={waNO} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-gray-600 text-white hover:bg-gray-700">
                            💬 Avisar — rechazado</a>}
                        </div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            }
          </div>
        )}

        {/* HISTORIAL */}
        {tab==='historial'&&!loading&&(
          <div className="max-w-2xl mx-auto">
            {historial.length===0
              ?<div className="text-center py-14 text-gray-400"><p className="text-sm">Sin historial todavía.</p></div>
              :<div className="space-y-2">
                {historial.map(appt=>{
                  const labels:Record<string,string>={cancelled:'❌ Cancelado',completed:'✅ Completado',no_show:'👻 No vino'}
                  return (
                    <div key={appt.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{appt.customer_name}</p>
                        <p className="text-xs text-gray-500 truncate">{appt.service_name}</p>
                        <p className="text-xs text-gray-400">{fDate(appt.appointment_date)} · {appt.appointment_time}</p>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{labels[appt.status]||appt.status}</span>
                    </div>
                  )
                })}
              </div>
            }
          </div>
        )}
      </div>
    </div>
  )
}
