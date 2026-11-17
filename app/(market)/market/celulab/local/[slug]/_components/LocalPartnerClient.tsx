'use client'
import { useState, useEffect, useCallback } from 'react'
import {partCaption,repairForCategory} from '../../../_components/quote-labels'
import {ChargeOptions,RepairPicker,standardRepairRates,type RepairRate} from '../../../_components/RepairPicker'
import QuoteParts,{catalogGroup} from '../../../_components/QuoteParts'
import {isChargeJob} from '../../../_components/charge-quote'
import {chargeCaution,chargeProfile,chargeTierOptions,intakeChoices,suggestIntake,REVIEW_PRICE,UNKNOWN_ACCESS} from '../../../_components/repair-guidance'
import CustomersTab,{useCustomers} from '../../../../nucleus/[slug]/_components/CustomersTab'
import {usePaymentAccounts,type DepositMethod} from '../../../_components/PaymentAccounts'
import {fetchOrderPages,finalOrderStatus,groupOrderMonths} from '../../../_components/order-lists'
import QuoteEditor from '../../../_components/QuoteEditor'
import ExtraJobs from '../../../_components/ExtraJobs'
import ShareOrder from '../../../_components/ShareOrder'
import { LocalEarnings, OrderEarnings } from './LocalEarnings'
import { PatternLock } from '../../../_components/PatternLock'
import CeluLabPriceList, { type PriceListItem } from '../../../_components/CeluLabPriceList'

// ─── Types ────────────────────────────────────────────────────────────────────

type DamageMarker = { x: number; y: number; side: 'front' | 'back' }

type RepairLineItem = {
  partId: string
  caption?: string
  job: string
  quality: string
  color: string
  final_price: number
  commission: number
  labor_ars: number
}


type Order = {
  id: string
  order_number: string
  status: string
  created_at: string
  client_name: string
  client_dni: string
  client_phone: string
  device_brand: string
  device_model: string
  has_battery: boolean; has_chip: boolean; has_cover: boolean; has_memory: boolean
  turns_on: boolean; water_damage: boolean; revision_required: boolean
  unlock_type: 'pin' | 'patron' | 'none'
  unlock_code: string
  damage_diagram: { markers?: DamageMarker[]; accessUnknown?:boolean; possibleRepair?:string; completedAt?:string }
  quote_draft_lines?: {device:string;job:string;part:number;labor:number}[]
  reported_fault?: string
  requested_work: string
  notes: string
  deposit_ars: number
  budget_ars: number
  total_ars?: number | null
  commission_ars?: number | null
  commission_pct?: number | null
  warranty_days: number
  partner_id: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  ingresado: 'Ingresado',
  en_revision: 'En revisión',
  presupuesto_enviado: 'Presupuesto enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  en_reparacion: 'En reparación',
  listo: 'Listo — en taller ✓',
  retirado_por_local: 'Retirado del taller',
  entregado_al_cliente: 'Entregado al cliente',
  entregado: 'Entregado',
}

const STATUS_COLORS: Record<string, string> = {
  ingresado: '#6366f1',
  en_revision: '#f59e0b',
  presupuesto_enviado: '#3b82f6',
  aprobado: '#10b981',
  rechazado: '#ef4444',
  en_reparacion: '#8b5cf6',
  listo: '#059669',
  retirado_por_local: '#0ea5e9',
  entregado_al_cliente: '#9ca3af',
  entregado: '#9ca3af',
}

const JOACO_WA = '5492664501140'

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function LocalPartnerClient({
  partnerId, partnerName, partnerAddress, partnerPhone, logoUrl, isActive, commissionPct,
}: {
  partnerId: string; partnerName: string; partnerAddress: string; partnerPhone: string
  logoUrl: string; isActive: boolean; commissionPct: number
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinErr, setPinErr] = useState(false)

  useEffect(()=>{
    const controller=new AbortController()
    fetch('/api/celulab/partner-session?partner='+encodeURIComponent(partnerId),{signal:controller.signal}).then(r=>{if(!controller.signal.aborted)setUnlocked(r.ok)}).catch(()=>{})
    return ()=>controller.abort()
  },[partnerId])
  async function tryPin(){
    const ok=await fetch('/api/celulab/partner-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({partner:partnerId,pin:pinInput})}).then(r=>r.ok).catch(()=>false)
    setPinInput('')
    setUnlocked(ok)
    if(!ok){setPinErr(true);setTimeout(()=>setPinErr(false),2000)}
  }

  if (!isActive) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>{partnerName}</div>
        <div style={{ fontSize: 14 }}>Panel temporalmente deshabilitado. Contactá al técnico.</div>
      </div>
    </div>
  )

  if (!unlocked) return (
    <PinScreen
      partnerName={partnerName} logoUrl={logoUrl}
      pinInput={pinInput} pinErr={pinErr}
      onInput={setPinInput} onSubmit={tryPin}
    />
  )

  return (
    <LocalDashboard
      partnerId={partnerId}
      partnerName={partnerName}
      partnerAddress={partnerAddress}
      partnerPhone={partnerPhone}
      logoUrl={logoUrl}
      commissionPct={commissionPct}
      pin=""
    />
  )
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────

function PinScreen({ partnerName, logoUrl, pinInput, pinErr, onInput, onSubmit }: {
  partnerName: string; logoUrl: string; pinInput: string; pinErr: boolean
  onInput: (v: string) => void; onSubmit: () => void
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 20, padding: '40px 36px', width: 340, textAlign: 'center' }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={partnerName} style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: '1px solid #333' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🏪</div>
        )}
        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>Panel de local</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 28 }}>{partnerName}</div>
        <input
          type="password" maxLength={8} value={pinInput}
          onChange={e => onInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="PIN de acceso"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${pinErr ? '#ef4444' : '#2a2a2a'}`,
            background: '#0d0d0d', color: '#fff', fontSize: 16,
            textAlign: 'center', letterSpacing: '0.3em', outline: 'none',
            boxSizing: 'border-box', marginBottom: 12, transition: 'border-color .2s',
          }}
          autoFocus
        />
        {pinErr && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 10 }}>PIN incorrecto</div>}
        <button onClick={onSubmit} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          Ingresar →
        </button>
        <div style={{ marginTop: 20, fontSize: 11, color: '#333' }}>
          ¿Problemas? Contactá al técnico · +54 9 2665 286110
        </div>
      </div>
    </div>
  )
}

// ─── Local Dashboard ──────────────────────────────────────────────────────────

function EarningsPin({onUnlock}:{onUnlock:(value:string)=>Promise<boolean>}) {
  const [value,setValue]=useState('')
  const [visible,setVisible]=useState(false)
  const [error,setError]=useState(false)
  return <form style={{background:'white',padding:16,border:'1px solid #dbe1ea',borderRadius:14}} onSubmit={async e=>{
    e.preventDefault();setError(!await onUnlock(value));setValue('')
  }}>
    <label style={{display:'block',fontWeight:600}}>PIN del dueño o encargado
      <input type={visible?'text':'password'} inputMode="numeric" maxLength={4} required pattern="[0-9]{4}" placeholder="••••" value={value} onChange={e=>setValue(e.target.value.replace(/\D/g,''))} style={{display:'block',background:'#f1f5f9',border:'1px solid #cbd5e1',borderRadius:9,width:108,minHeight:46,textAlign:'center',letterSpacing:5,margin:'8px 0'}} />
    </label>
    <button type="button" aria-label="Mostrar u ocultar PIN" onClick={()=>setVisible(!visible)}>👁</button>
    <button style={{background:'#2563eb',color:'white',borderRadius:9,padding:'10px 16px',marginLeft:10}}>Ver ganancias</button>
    {error && <p role="alert">No se pudo desbloquear. Verificá el PIN o volvé a intentar más tarde.</p>}
  </form>
}

function LocalDashboard({
  partnerId, partnerName, partnerAddress, partnerPhone, logoUrl, commissionPct, pin,
}: {
  partnerId: string; partnerName: string; partnerAddress: string
  partnerPhone: string; logoUrl: string; commissionPct: number; pin: string
}) {
  const [view, setView] = useState<'list' | 'new'>('list')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<'ordenes' | 'historial' | 'precios' | 'ganancias' | 'clientes'>('ordenes')
  const [historialView, setHistorialView] = useState<'ordenes' | 'clientes'>('ordenes')
  const [clientFilter, setClientFilter] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [prefilledRepair, setPrefilledRepair] = useState<RepairLineItem | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [commissionUnlocked,setCommissionUnlocked]=useState(false)
  async function unlockCommission(value:string) {
    try {
      const res=await fetch('/api/celulab/partners/'+partnerId+'/owner-pin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:value})})
      if(!res.ok)return false
      await fetchOrders()
      setCommissionUnlocked(true)
      return true
    } catch { return false }
  }
  const fetchOrders = useCallback(async () => {
    try{setOrders(await fetchOrderPages<Order>(partnerId));setLastUpdated(new Date())}catch{}finally{setLoading(false)}
  }, [partnerId])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    const interval = setInterval(() => fetchOrders(), 120000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  if (view === 'new') {
    return (
      <OrderIntake
        partnerId={partnerId}
        partnerName={partnerName}
        partnerAddress={partnerAddress}
        partnerPhone={partnerPhone}
        logoUrl={logoUrl}
        commissionPct={commissionPct}
        pin={pin}
        commissionUnlocked={commissionUnlocked}
        prefilledRepair={prefilledRepair}
        onBack={() => { setView('list'); setPrefilledRepair(null) }}
        onSaved={() => { setView('list'); setPrefilledRepair(null); fetchOrders() }}
      />
    )
  }

  if (selectedOrder) {
    return (
      <LocalOrderDetail
        order={selectedOrder}
        pin={pin} unlockCommission={unlockCommission}
        commissionUnlocked={commissionUnlocked}
        partnerName={partnerName}
        partnerAddress={partnerAddress}
        logoUrl={logoUrl}
        onBack={() => setSelectedOrder(null)}
        onStatusChange={(id, newStatus) => {
          setSelectedOrder(prev => prev?.id === id ? { ...prev, status: newStatus } : prev)
          setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
        }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={logoUrl} alt={partnerName} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
            : <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏪</div>
          }
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1 }}>{partnerName}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Panel de local · CeluLab · <span style={{ color: '#d1d5db' }}>actualizado {Math.floor((Date.now() - lastUpdated.getTime()) / 1000) < 5 ? 'ahora' : `hace ${Math.floor((Date.now() - lastUpdated.getTime()) / 60000)}m`}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowHelp(true)}
            title="Ayuda y tutorial"
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '1px solid #e5e7eb',
              background: '#f9fafb', color: '#6b7280', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >?</button>

        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px' }}>
        {/* Stats row — clickeable */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Activas', val: orders.filter(o => !['entregado_al_cliente', 'entregado', 'rechazado'].includes(o.status)).length, icon: '⚙️', tab: 'ordenes' as const },
            { label: 'Listas', val: orders.filter(o => o.status === 'listo').length, icon: '✅', tab: 'ordenes' as const },
            { label: 'Completadas', val: orders.filter(o => ['entregado_al_cliente', 'entregado', 'rechazado'].includes(o.status)).length, icon: '🏁', tab: 'historial' as const },
          ].map(s => (
            <button key={s.label} onClick={() => {setActiveTab(s.tab);setStatusFilter(s.label==='Listas'?'listo':s.label==='Activas'?'activas':'todas');if(s.tab==='historial'){setHistorialView('ordenes');setClientFilter(null)}}} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 10px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</div>
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap',marginBottom:16}}><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>          <QuoteEditor partner={partnerId} pin={pin}/>
          <button onClick={() => setView('new')} style={{
            padding: '8px 16px', borderRadius: 9, border: 'none',
            background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            + Nueva orden
          </button></div></div>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { key: 'precios', label: '💰 Lista de precios' },
            { key: 'ordenes', label: '📋 Órdenes activas' },
            { key: 'historial', label: '🕐 Historial' },
            { key: 'ganancias', label: '📊 Ganancias' },
            { key: 'clientes', label: '👤 Clientes' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)} style={{
              padding: '7px 14px', borderRadius: 20, whiteSpace: 'nowrap',
              background: activeTab === tab.key ? '#6366f1' : '#fff',
              color: activeTab === tab.key ? '#fff' : '#6b7280',
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
              border: activeTab === tab.key ? 'none' : '1px solid #e5e7eb',
            } as React.CSSProperties}>
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === 'ganancias' || activeTab === 'historial') && <details open={activeTab === 'ganancias' || undefined} key={activeTab}><summary>Ganancias por mes</summary>
          {commissionUnlocked ? <LocalEarnings orders={orders} unlocked /> : <EarningsPin onUnlock={unlockCommission} />}
        </details>}

        {/* ── Tab: Órdenes ── */}
        {activeTab === 'ordenes' && (() => {
          const STATUS_FLOW = ['ingresado','en_revision','presupuesto_enviado','aprobado','rechazado','en_reparacion','listo','retirado_por_local','entregado_al_cliente','entregado']
          const visibleOrders = statusFilter === 'todas' ? orders : statusFilter==='activas'?orders.filter(o=>!finalOrderStatus(o.status)):orders.filter(o => o.status === statusFilter)
          return loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Cargando...</div>
          ) : (
            <>
              {/* Pills de estado */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                <button
                  onClick={() => setStatusFilter('todas')}
                  style={{ padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap', fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0, border: statusFilter === 'todas' ? 'none' : '1px solid #e5e7eb', background: statusFilter === 'todas' ? '#6366f1' : '#fff', color: statusFilter === 'todas' ? '#fff' : '#6b7280' }}
                >
                  Todas <span style={{ opacity: 0.7, fontWeight: 400 }}>({orders.length})</span>
                </button>
                {STATUS_FLOW.map(key => {
                  const count = orders.filter(o => o.status === key).length
                  if (count === 0) return null
                  const active = statusFilter === key
                  const sc = STATUS_COLORS[key] ?? '#6b7280'
                  return (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      style={{ padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap', fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0, border: active ? 'none' : `1px solid ${sc}33`, background: active ? sc : sc + '12', color: active ? '#fff' : sc } as React.CSSProperties}
                    >
                      {STATUS_LABELS[key] ?? key} <span style={{ opacity: 0.75, fontWeight: 400 }}>({count})</span>
                    </button>
                  )
                })}
              </div>

              {/* Lista */}
              {visibleOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Sin órdenes{statusFilter === 'todas' ? '' : ` en "${STATUS_LABELS[statusFilter] ?? statusFilter}"`}</div>
                  {statusFilter === 'todas' && (
                    <button onClick={() => setView('new')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      Ingresar primer equipo
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {visibleOrders.map(order => {
                    const sc = STATUS_COLORS[order.status] ?? '#9ca3af'
                    const isReady = order.status === 'listo'
                    return (
                      <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: isReady ? '#f0fdf4' : '#fff', border: `1px solid ${isReady ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', minWidth: 76, color: '#9ca3af' }}>{order.order_number}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{order.client_name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{order.device_brand} {order.device_model}</div>
                          <OrderEarnings order={order} unlocked={commissionUnlocked} />
                        </div>
                        <div style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: sc + '18', color: sc, flexShrink: 0 }}>{STATUS_LABELS[order.status] ?? order.status}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{fmtDate(order.created_at)}</div>
                        <div style={{ color: '#d1d5db' }}>›</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )
        })()}

        {/* ── Tab: Historial ── */}
        {activeTab === 'historial' && (
          (() => {
            const closed = orders.filter(o => ['entregado_al_cliente', 'entregado', 'rechazado'].includes(o.status))
            if (closed.length === 0) return (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🕐</div>
                <div style={{ fontWeight: 600 }}>Sin órdenes cerradas todavía</div>
              </div>
            )

            // Toggle por orden / por cliente
            const visibleOrders = clientFilter ? closed.filter(o => o.client_name === clientFilter) : closed

            return (
              <div>
                {/* Toggle */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {[{ v: 'ordenes', l: '📋 Por orden' }, { v: 'clientes', l: '👤 Por cliente' }].map(opt => (
                    <button key={opt.v} onClick={() => { setHistorialView(opt.v as typeof historialView); setClientFilter(null) }} style={{
                      padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: historialView === opt.v ? '#6366f1' : '#fff',
                      color: historialView === opt.v ? '#fff' : '#6b7280',
                      border: historialView === opt.v ? 'none' : '1px solid #e5e7eb',
                    }}>{opt.l}</button>
                  ))}
                </div>

                {historialView === 'ordenes' || clientFilter ? (
                  // Vista por orden (o filtrada por cliente)
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {clientFilter && (
                      <button onClick={() => setClientFilter(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer', marginBottom: 4, width: 'fit-content' }}>
                        ← Todos los clientes
                      </button>
                    )}
                    {groupOrderMonths(visibleOrders).map((period,index,all)=><section key={period.key}>{(index===0||all[index-1].year!==period.year)&&<h3 style={{margin:'14px 0 6px'}}>{period.year}</h3>}<details style={{marginBottom:10}} open={index===0||undefined}><summary style={{cursor:'pointer',fontWeight:700,textTransform:'capitalize',marginBottom:8}}>{period.month} · {period.rows.length}</summary><div style={{display:'grid',gap:8}}>{period.rows.map(order => {
                      const sc = STATUS_COLORS[order.status] ?? '#9ca3af'
                      return (
                        <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.85 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', minWidth: 76, color: '#9ca3af' }}>{order.order_number}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{order.client_name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{order.device_brand} {order.device_model}</div>
                          <OrderEarnings order={order} unlocked={commissionUnlocked} />
                          </div>
                          <div style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: sc + '18', color: sc, flexShrink: 0 }}>{STATUS_LABELS[order.status] ?? order.status}</div>
                          <div style={{ fontSize: 11, color: '#d1d5db', flexShrink: 0 }}>{fmtDate(order.created_at)}</div>
                          <div style={{ color: '#d1d5db' }}>›</div>
                        </div>
                      )
                    })}</div></details></section>)}
                  </div>
                ) : (
                  // Vista por cliente
                  (() => {
                    const byClient = closed.reduce<Record<string, Order[]>>((acc, o) => {
                      const k = o.client_name || 'Sin nombre'
                      if (!acc[k]) acc[k] = []
                      acc[k].push(o)
                      return acc
                    }, {})
                    const clients = Object.entries(byClient).sort((a, b) => {
                      const la = a[1][a[1].length - 1].created_at
                      const lb = b[1][b[1].length - 1].created_at
                      return lb.localeCompare(la)
                    })
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {clients.map(([name, clientOrders]) => {
                          const last = clientOrders.reduce((a, b) => a.created_at > b.created_at ? a : b)
                          const phone = clientOrders.find(o => o.client_phone)?.client_phone
                          return (
                            <div key={name} onClick={() => { setClientFilter(name); setHistorialView('ordenes') }} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                                  {phone && <span style={{ marginRight: 8 }}>{phone}</span>}
                                  Última: {fmtDate(last.created_at)}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 18, color: '#6366f1' }}>{clientOrders.length}</div>
                                <div style={{ fontSize: 10, color: '#9ca3af' }}>reparación{clientOrders.length !== 1 ? 'es' : ''}</div>
                              </div>
                              <div style={{ color: '#d1d5db' }}>›</div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()
                )}
              </div>
            )
          })()
        )}

        {activeTab==='clientes'&&<CustomersTab partner={partnerId}/>}
        {/* ── Tab: Lista de precios ── */}
        {activeTab === 'precios' && (
          <div>
            {/* Tiempo de reparación */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>⏰ Tiempos de entrega</div>
              <div style={{ color: '#1d4ed8', lineHeight: 1.5 }}>
                Si ingresa encendido a la <strong>mañana</strong> → listo esa <strong>tarde</strong>.<br />
                Si ingresa a la <strong>tarde</strong> → listo al <strong>día hábil siguiente</strong>.
              </div>
            </div>
            <CeluLabPriceList
              embedded={true}
              localUnlocked={true}
              onItemClick={(item: PriceListItem) => {
                if (!item.stock || item.final_price == null) return
                const commission = Math.round(item.labor_ars * commissionPct / 100)
                setPrefilledRepair({
                  partId: item.id,
      job: repairForCategory(item.category), quality:item.quality||'', color:item.color||'',
                                                  final_price: item.final_price,
                  commission,
                                                  labor_ars: item.labor_ars,
                })
                setView('new')
              }}
            />
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Part Search ─────────────────────────────────────────────────────────────

function OrderRepairPicker({device,partnerId,pin,commissionPct,onAdd,job,setJob}:{device:string;partnerId:string|null;pin?:string;commissionPct:number;onAdd:(r:RepairLineItem)=>void;job:string;setJob:(j:string)=>void}){
 const [rates,setRates]=useState<RepairRate[]>(standardRepairRates),[tier,setTier]=useState(''),[custom,setCustom]=useState('')
 const normalizedTier=tier||chargeProfile(device).tier||''
 useEffect(()=>{
  const ctrl=new AbortController()
  fetch('/api/celulab/quotes',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctrl.signal,body:JSON.stringify({action:'rates',partner:partnerId,pin})}).then(r=>r.ok?r.json():[]).then(data=>{
   if(!ctrl.signal.aborted&&Array.isArray(data)&&data.length)setRates([...data,...standardRepairRates.filter(r=>!data.some((a:RepairRate)=>a.job===r.job))])
  }).catch(()=>{})
  return ()=>ctrl.abort()
 },[partnerId,pin])
 const fee=job==='Revisión'?REVIEW_PRICE:rates.find(r=>r.job===job)?.labor_ars
 const add=(partId:string,caption:string,total:number,labor:number)=>{
  onAdd({partId,caption,job:job==='Otro trabajo'?custom.trim():job,quality:'',color:'',final_price:total,labor_ars:labor,commission:Math.round(labor*commissionPct/100)})
 }
 return <div>
  <RepairPicker device={device} rates={rates} value={job} onChange={v=>{setJob(v);setTier('');setCustom('')}} disabledJob={j=>/excepto iPhone/i.test(j)&&/iphone/i.test(device)}/>
  {isChargeJob(job)&&<ChargeOptions device={device} value={normalizedTier} onChange={setTier}/>}
  {job==='Otro trabajo'&&<FField label="Trabajo personalizado"><input style={inp} value={custom} onChange={e=>setCustom(e.target.value)}/></FField>}
  {catalogGroup(job)?<QuoteParts device={device} job={job} chargeRate={chargeTierOptions(device).find(t=>t.tier===normalizedTier)?.amount||0} selected={[]} onPick={(id,label,total,labor)=>add(id,label.slice('Repuesto: '.length),total,labor)}/>:job&&fee!=null&&<button type="button" onClick={()=>add('','',fee,fee)} style={{...inp,width:'auto',marginTop:8,cursor:'pointer'}}>+ Agregar trabajo</button>}
  {job&&!catalogGroup(job)&&fee==null&&<small style={{display:'block',color:'#64748b',marginTop:7}}>Sin tarifa cargada. Podés anotarlo en trabajo solicitado.</small>}
 </div>
}

const BLANK = {
  client_name: '', client_dni: '', client_phone: '',
  device_brand: '', device_model: '',
  has_battery: false, has_chip: false, has_cover: false, has_memory: false,
  turns_on: null as boolean | null, water_damage: false,
  unlock_type: '' as '' | 'pin' | 'patron' | 'none' | 'unknown',
  unlock_code: '',
  damage_diagram: { markers: [] as DamageMarker[] },
  reported_fault: '', requested_work: '', notes: '', deposit_ars: '',
}

function ScriptTip({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 12, color: '#1e40af', fontStyle: 'italic', marginTop: 4, marginBottom: 2 }}>
      💬 &ldquo;{text}&rdquo;
    </div>
  )
}

function CheckItem({ label, done, onToggle }: { label: string; done: boolean; onToggle: () => void }) {
  return (
    <label onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
      padding: '9px 11px', borderRadius: 9, marginBottom: 5,
      background: done ? '#f0fdf4' : '#f9fafb',
      border: `1px solid ${done ? '#86efac' : '#e5e7eb'}`,
    }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: done ? '#16a34a' : '#fff', border: `2px solid ${done ? '#16a34a' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: done ? '#15803d' : '#374151' }}>{label}</span>
    </label>
  )
}

export function OrderIntake({
  partnerId, partnerName, partnerAddress, partnerPhone, logoUrl, commissionPct, pin, commissionUnlocked, prefilledRepair, origins, onBack, onSaved,
}: {
  partnerId: string|null; partnerName: string; partnerAddress: string
  partnerPhone: string; logoUrl: string; commissionPct: number
  pin?: string; commissionUnlocked: boolean
  origins?:{id:string;name:string;commission_pct:number}[]
  prefilledRepair?: RepairLineItem | null
  onBack: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState(BLANK)
  const [origin,setOrigin]=useState(''),[depositMethod,setDepositMethod]=useState<DepositMethod>('efectivo'),[account,setAccount]=useState('')
  const selectedOrigin=origins?.find(o=>o.id===origin)
  const orderPartner=origins?selectedOrigin?.id||null:partnerId
  const rate=origins?selectedOrigin?.commission_pct||0:commissionPct
  const contacts=useCustomers(origins?null:partnerId),[clientKey,setClientKey]=useState('')
  const payments=usePaymentAccounts(orderPartner,depositMethod==='transferencia')
  const transfer=payments.items.find(a=>a.id===account)
  const [job,setJob]=useState(''),[possible,setPossible]=useState('')
  const suggested=suggestIntake(form.reported_fault)
  const choosePossible=(value:string)=>{setPossible(value);setJob(intakeChoices.find(c=>c.value===value)?.job||'')}
  const repairCaption=(r:RepairLineItem)=>r.caption||(r.partId?partCaption(r.job,form.device_brand+' '+form.device_model,r.quality,r.color):r.job)
  const [repairs, setRepairs] = useState<RepairLineItem[]>(prefilledRepair ? [prefilledRepair] : [])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [savedOrder, setSavedOrder] = useState<Order | null>(null)
  const [patternDots, setPatternDots] = useState<number[]>([])
  const [checks, setChecks] = useState({ chip: false, memory: false, humedad: false, damage: false })
  const [mpLink, setMpLink] = useState<string | null>(null)
  const [mpLoading, setMpLoading] = useState(false)
  const [mpErr, setMpErr] = useState('')

  async function generateMpLink() {
    const amount = Number(form.deposit_ars)
    if (!amount || amount <= 0) { setMpErr('Ingresá el monto de la seña primero'); return }
    setMpLoading(true); setMpErr(''); setMpLink(null)
    const model = [form.device_brand, form.device_model].filter(Boolean).join(' ') || 'equipo'
    const res = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Seña reparación ${model}`, amount, clientName: form.client_name }),
    })
    const data = await res.json()
    if (!res.ok || !data.init_point) { setMpErr(data.error ?? 'Error MP'); setMpLoading(false); return }
    setMpLink(data.init_point)
    setMpLoading(false)
  }

  const totalFinalPrice = repairs.reduce((s, r) => s + r.final_price, 0)
  const totalCommission = repairs.reduce((s, r) => s + r.commission, 0)

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }
  function toggleCheck(k: keyof typeof checks) { setChecks(c => ({ ...c, [k]: !c[k] })) }

  async function handleSubmit() {
    const device=form.device_brand+' '+form.device_model
    const possibleText=form.turns_on===false?intakeChoices.find(c=>c.value===possible)?.label||'':''
    const repairText=repairs.map(repairCaption).join(' + ')
    const freeText = (form.requested_work ?? '').trim()
    const caution=repairs.some(r=>isChargeJob(r.job))||possible==='charge'?chargeCaution(device):''
    const finalRequestedWork=[form.turns_on===false?'Ingresa para revisión — $15.000':null,possibleText,repairText?(form.turns_on===false?'Reparación estimada: ':'')+repairText:'',freeText,caution].filter(Boolean).join(' / ')

    if (!form.client_name.trim() || !form.device_brand.trim() || !form.device_model.trim()) {
      setErr('Nombre, marca y modelo son obligatorios.')
      return
    }
    if(form.turns_on===null){setErr('Verificá si el equipo enciende antes de continuar.');return}
    if(!form.unlock_type){setErr('Elegí cómo se accede al equipo.');return}
    if ((form.unlock_type==='pin'||form.unlock_type==='patron')&&!form.unlock_code.trim()){setErr('Registrá el código de acceso o marcá que no lo recuerda.');return}
    if (!finalRequestedWork.trim() && !form.reported_fault.trim()) {
      setErr('Ingresá el trabajo a realizar o buscá un repuesto.')
      return
    }
    if(Number(form.deposit_ars)>0&&depositMethod==='transferencia'&&!transfer){setErr('Elegí una cuenta para registrar la transferencia.');return}
    setSaving(true)
    try{
    const res = await fetch('/api/celulab/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        unlock_type: form.unlock_type==='unknown'?'none':form.unlock_type,
        unknown_access: form.unlock_type==='unknown',
        damage_diagram:{...form.damage_diagram,possibleRepair:form.turns_on===false?possible:undefined},
        requested_work: finalRequestedWork,
        quote_draft_lines: repairs.map(r=>({device,job:r.job,partId:r.partId,option:r.partId?'Repuesto: '+repairCaption(r):undefined,part:r.final_price-r.labor_ars,labor:r.labor_ars})),
        deposit_ars: Number(form.deposit_ars) || 0,
        deposit_method: depositMethod,
        deposit_account: account,
        partner_id: orderPartner,
      }),
    })

    if (!res.ok) { setErr((await res.json()).error ?? 'Error al guardar'); setSaving(false); return }
    setSavedOrder(await res.json())
    }catch{setErr('No se pudo enviar la orden. Revisá el listado antes de reintentar.')}finally{setSaving(false)}
  }

  if (savedOrder) {
    return <OrderTicket pin={pin||''} order={savedOrder} partnerName={selectedOrigin?.name||partnerName} partnerAddress={partnerAddress} logoUrl={logoUrl} stockWarning={false} onDone={onSaved} />
  }

  const color = '#6366f1'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', padding: 0 }}>←</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>📋 Nueva Orden</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{partnerName}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1020, margin: '0 auto', padding: '20px 16px 100px' }}>


        {/* 2-column grid on wide screens */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Card title="👤 Cliente">
              {origins&&<FField label="Origen de la orden"><select style={inp} value={origin} onChange={e=>{setOrigin(e.target.value);setAccount('')}}><option value="">Directo · CeluLab</option>{origins.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></FField>}
              {contacts.rows.length>0&&<FField label="Usar cliente guardado"><select style={inp} value={clientKey} onChange={e=>{setClientKey(e.target.value);const c=contacts.rows.find(r=>r.key===e.target.value);if(c)setForm(f=>({...f,client_name:c.name,client_dni:c.dni,client_phone:c.phone}))}}><option value="">Ingresar datos nuevos</option>{contacts.rows.filter(c=>!form.client_name.trim()||c.key===clientKey||c.name.toLowerCase().includes(form.client_name.trim().toLowerCase())).map(c=><option key={c.key} value={c.key}>{c.name}{c.dni?' · '+c.dni:''}</option>)}</select></FField>}
              <ScriptTip text="¿Me das tu nombre completo y WhatsApp para avisarte cuando esté listo?" />
              <div style={{ height: 8 }} />
              <FField label="Nombre completo *">
                <input style={inp} value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Nombre y apellido" autoFocus />
              </FField>
              <FField label="WhatsApp">
                <input style={inp} type="tel" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="+54 9 266 XXXXXXX" />
              </FField>
              <FField label="DNI (opcional)">
                <input style={inp} value={form.client_dni} onChange={e => set('client_dni', e.target.value)} placeholder="Sin puntos" />
              </FField>
            </Card>

            <Card title="⚡ Estado de encendido">
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>¿Enciende?</div>
              <div style={{fontSize:12,color:'#475569',marginBottom:8}}>Verificá vos si enciende. No completes este campo a partir de lo que diga el cliente.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => set('turns_on', true)} style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${form.turns_on ? '#16a34a' : '#e5e7eb'}`, background: form.turns_on ? '#f0fdf4' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: form.turns_on ? '#15803d' : '#6b7280' }}>Sí, enciende</div>
                </button>
                <button onClick={() => set('turns_on', false)} style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${form.turns_on===false ? '#f59e0b' : '#e5e7eb'}`, background: form.turns_on===false ? '#fefce8' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>⚠️</div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: form.turns_on===false ? '#92400e' : '#6b7280' }}>No enciende</div>
                </button>
              </div>
              {form.turns_on===false && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                  ⚠️ Ingresa para revisión · $15.000
                </div>
              )}
            </Card>

            <Card title="🔒 Acceso al equipo">
              <ScriptTip text="Registrá cómo se accede al equipo." />
              <div style={{ height: 8 }} />
              <div style={{ display: 'flex', flexWrap:'wrap', gap: 8, marginBottom: 12 }}>
                {[{ v: 'pin', l: '🔢 PIN' }, { v: 'patron', l: '🔷 Patrón' }, { v: 'none', l: 'Sin contraseña' }, { v: 'unknown', l: 'No sabe la clave' }].map(opt => (
                  <button key={opt.v} onClick={() => { set('unlock_type', opt.v); setPatternDots([]); set('unlock_code', '') }} style={{ flex: 1, padding: '9px 4px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 700, border: `2px solid ${opt.v==='unknown'?'#fca5a5':form.unlock_type===opt.v?color:'#e5e7eb'}`, background: opt.v==='unknown'?(form.unlock_type===opt.v?'#fee2e2':'#fff7f7'):form.unlock_type===opt.v?color+'12':'#fff', color: opt.v==='unknown'?'#991b1b':form.unlock_type===opt.v?color:'#6b7280' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
              {form.unlock_type === 'pin' && (
                <FField label="PIN o contraseña">
                  <input style={inp} value={form.unlock_code} onChange={e => set('unlock_code', e.target.value)} placeholder="Ej: 1234" maxLength={20} />
                </FField>
              )}
              {form.unlock_type === 'patron' && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                  <PatternLock value={patternDots} onChange={dots => { setPatternDots(dots); set('unlock_code', dots.join('-')) }} />
                </div>
              )}
              {form.unlock_type === 'unknown' && (
                <div role="alert" style={{ padding: '9px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 9, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
                  {UNKNOWN_ACCESS} Avisale al cliente.
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Card title="📱 Equipo, reparaciones y seña">
              <ScriptTip text="Confirmá marca y modelo del equipo." />
              <div style={{ height: 8 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <FField label="Marca *">
                  <input style={inp} value={form.device_brand} onChange={e => {set('device_brand',e.target.value);setRepairs(prev=>prev.filter(r=>prefilledRepair?.partId===r.partId))}} placeholder="Samsung, iPhone..." />
                </FField>
                <FField label="Modelo *">
                  <input style={inp} value={form.device_model} onChange={e => {set('device_model',e.target.value);setRepairs([])}} placeholder="A54, 14 Pro..." />
                </FField>
              </div>

              {form.turns_on===false ? (
                <ScriptTip text="El diagnóstico es $15.000, se descuenta si aprobás la reparación. ¿Dejás la seña ahora?" />
              ) : (
                <ScriptTip text="Buscá el repuesto para ver el precio final y cotizar la seña." />
              )}
              <div style={{ height: 6 }} />

              <FField label="¿Qué le pasó? · Según el cliente"><textarea style={inp} value={form.reported_fault} onChange={e=>set('reported_fault',e.target.value)} placeholder="Ej. Se hinchó la batería"/></FField>
              {form.turns_on===false&&<FField label="Posible trabajo (opcional)">
                <select style={inp} value={possible} onChange={e=>choosePossible(e.target.value)}><option value="">No sabe / sólo revisión</option>{intakeChoices.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select>
                {!possible&&suggested&&<button type="button" onClick={()=>choosePossible(suggested)} style={{...inp,width:'auto',marginTop:6,cursor:'pointer'}}>Sugerencia: {intakeChoices.find(c=>c.value===suggested)?.label}</button>}
              </FField>}
              <OrderRepairPicker key={form.device_brand+' '+form.device_model+' '+possible} device={form.device_brand+' '+form.device_model} partnerId={orderPartner} pin={pin} commissionPct={rate} job={job} setJob={setJob}
                onAdd={r=>setRepairs(prev=>prev.some(x=>x.job===r.job&&x.partId===r.partId)?prev:[...prev,r])} />

              {/* Selected repairs list */}
              {repairs.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reparaciones seleccionadas</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {repairs.map((r, i) => (
                      <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{repairCaption(r)}</div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                            {origins&&r.partId&&<span style={{fontSize:11,color:'#64748b'}}>Detalle de compra y margen en la orden guardada</span>}
                          </div>
                        </div>
                        <button onClick={() => setRepairs(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 16, padding: 0, flexShrink: 0, marginTop: 2 }} aria-label="Quitar reparación">✕</button><strong style={{whiteSpace:'nowrap',color:'#1d4ed8'}}>{ars(r.final_price)}</strong>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '10px 14px', marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#6b7280' }}>Presupuesto estimado</span>
                      <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{ars(totalFinalPrice)}</span>
                    </div>

                    {form.turns_on===false && <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>* Más $15.000 de revisión diagnóstica</div>}
                  </div>
                </div>
              )}

              <div style={{ height: 10 }} />
              <FField label={repairs.length > 0 ? 'Trabajo adicional (opcional)' : 'Trabajo solicitado (opcional si ingresa para revisión)'}>
                <textarea style={{ ...inp, minHeight: 56, resize: 'vertical' }} value={form.requested_work} onChange={e => set('requested_work', e.target.value)} placeholder={repairs.length > 0 ? 'Algún trabajo extra o nota adicional...' : 'Pantalla rota, no carga, no enciende, cambio de batería...'} />
              </FField>
              <FField label="Observaciones internas">
                <textarea style={{ ...inp, minHeight: 48, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas para el técnico..." />
              </FField>
              <FField label="Seña recibida ($)">
               <input type="number" min="0" step="1" style={inp} value={form.deposit_ars} onChange={e=>{set('deposit_ars',e.target.value);setMpLink(null)}} placeholder={form.turns_on===false?'15000':'0'}/>
               <div role="group" aria-label="Método de seña" style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                {(['efectivo','transferencia','mercadopago'] as const).map((m,i)=><button type="button" key={m} aria-pressed={depositMethod===m} onClick={()=>{setDepositMethod(m);setAccount('');setMpLink(null)}} style={{...inp,width:'auto',cursor:'pointer',background:depositMethod===m?'#eff6ff':'white'}}>{['Efectivo','Transferencia','Mercado Pago'][i]}</button>)}
               </div>
               {depositMethod==='transferencia'&&<div style={{marginTop:10,background:'#eff6ff',borderRadius:9,padding:10}}>
                <label>Cuenta de transferencia<select style={inp} value={account} onChange={e=>setAccount(e.target.value)}><option value="">Elegí un alias</option>{payments.items.map(a=><option key={a.id} value={a.id}>{a.name} · {a.alias}</option>)}</select></label>
                {payments.error&&<p role="status">{payments.error}</p>}{payments.loading&&<p role="status">Cargando alias…</p>}
                {!payments.loading&&!payments.error&&!payments.items.length&&<p>Todavía no hay alias configurados en el Nucleus.</p>}
                {transfer&&<div><strong>{transfer.alias}</strong> <button type="button" onClick={()=>navigator.clipboard?.writeText(transfer.alias)}>Copiar alias</button>{transfer.qr&&<div><img src={transfer.qr} alt={'QR de '+transfer.name} style={{width:155,height:155,objectFit:'contain'}}/></div>}</div>}
                <p style={{color:'#1e40af'}}>Pedile al cliente que envíe el comprobante de transferencia. Registrá la seña al verificar el ingreso.</p>
               </div>}
               {depositMethod==='mercadopago'&&<div style={{marginTop:8}}><button type="button" onClick={generateMpLink} disabled={mpLoading}>{mpLoading?'Generando…':'Generar link de pago'}</button>{mpErr&&<p>{mpErr}</p>}</div>}
              </FField>

              {/* MP payment overlay */}
              {mpLink && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px', marginTop: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e40af', marginBottom: 8 }}>📲 Link de pago generado</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Mostrá este QR al cliente o envialo por WhatsApp:</div>
                  {/* QR de la URL */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mpLink)}`} alt="QR pago" width={180} height={180} style={{ borderRadius: 8, border: '2px solid #bfdbfe' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`https://wa.me/${form.client_phone?.replace(/\D/g, '') || JOACO_WA}?text=${encodeURIComponent(`Hola! Acá está el link para pagar la seña de la reparación: ${mpLink}`)}`} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 8, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                      🟢 Enviar por WA
                    </a>
                    <button onClick={() => { navigator.clipboard?.writeText(mpLink); }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid #bfdbfe', background: '#fff', color: '#1d4ed8', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      📋 Copiar link
                    </button>
                    <button onClick={() => setMpLink(null)} style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              )}
            </Card>
            <Card title="🔍 Revisión al ingreso">
              <ScriptTip text="Revisamos el equipo juntos. ¿Podés retirar el chip y la memoria?" />
              <div style={{ height: 8 }} />
              <CheckItem label="Retiró el chip SIM" done={checks.chip} onToggle={() => toggleCheck('chip')} />
              <CheckItem label="Retiró la memoria SD (si tenía)" done={checks.memory} onToggle={() => toggleCheck('memory')} />
              <CheckItem label="Revisé humedad (mancha blanca en bandeja / placa)" done={checks.humedad} onToggle={() => { toggleCheck('humedad'); if (!checks.humedad) set('water_damage', true) }} />
              <CheckItem label="Marqué los daños preexistentes en el diagrama" done={checks.damage} onToggle={() => toggleCheck('damage')} />

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📦 Accesorios entregados</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                  {[{ k: 'has_battery', l: '🔋 Batería' }, { k: 'has_chip', l: '📡 Chip' }, { k: 'has_cover', l: '📦 Tapa' }, { k: 'has_memory', l: '💾 Memoria' }].map(({ k, l }) => {
                    const checked = (form as Record<string, unknown>)[k] as boolean
                    return (
                      <label key={k} onClick={() => set(k, !checked)} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '7px 9px', borderRadius: 8, background: checked ? '#eff6ff' : '#f9fafb', border: `1px solid ${checked ? '#bfdbfe' : '#e5e7eb'}`, fontSize: 13 }}>
                        <input type="checkbox" checked={checked} onChange={() => {}} style={{ accentColor: color, width: 14, height: 14 }} />
                        {l}
                      </label>
                    )
                  })}
                </div>
                <label onClick={() => set('water_damage', !form.water_damage)} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '7px 9px', borderRadius: 8, background: form.water_damage ? '#fef2f2' : '#f9fafb', border: `1px solid ${form.water_damage ? '#fecaca' : '#e5e7eb'}`, fontSize: 13 }}>
                  <input type="checkbox" checked={form.water_damage} onChange={() => {}} style={{ accentColor: '#ef4444', width: 14, height: 14 }} />
                  💧 Daño por humedad detectado
                </label>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📍 Daños preexistentes</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Tocá el diagrama para marcar rayaduras o golpes. Esto protege al local.</div>
                <MiniPhoneDiagram
                  markers={form.damage_diagram.markers}
                  onAdd={m => { set('damage_diagram', { markers: [...form.damage_diagram.markers, m] }); setChecks(c => ({ ...c, damage: true })) }}
                  onRemove={i => set('damage_diagram', { markers: form.damage_diagram.markers.filter((_, idx) => idx !== i) })}
                />
              </div>
            </Card>


          </div>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginTop: 14 }}>{err}</div>}

      </div>

      {/* Sticky submit */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '12px 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <button onClick={handleSubmit} disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 15, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creando orden...' : '✓ Crear Orden'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Order Ticket (post-save) ─────────────────────────────────────────────────

function OrderTicket({
  order, partnerName, partnerAddress, logoUrl, stockWarning, onDone, pin,
}: {
  order: Order; partnerName: string; partnerAddress: string
  pin:string; logoUrl: string; stockWarning: boolean; onDone: () => void
}) {
  const acc = [
    order.has_battery && 'Batería', order.has_chip && 'Chip',
    order.has_cover && 'Tapa', order.has_memory && 'Memoria',
  ].filter(Boolean).join(', ') || 'Ninguno'

  const waMsg = encodeURIComponent(
    `📋 *NUEVA ORDEN — ${partnerName}*\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `Orden: *${order.order_number}*\n` +
    `Fecha: ${new Date(order.created_at).toLocaleDateString('es-AR')}\n\n` +
    `👤 *Cliente*\n` +
    `Nombre: ${order.client_name}\n` +
    `Tel: ${order.client_phone || '—'}\n` +
    `DNI: ${order.client_dni || '—'}\n\n` +
    `📱 *Equipo*\n` +
    `${order.device_brand} ${order.device_model}\n` +
    `Enciende: ${order.turns_on ? 'SÍ' : 'NO'} | Humedad: ${order.water_damage ? 'SÍ ⚠️' : 'No'}\n` +
    `Accesorios: ${acc}\n` +
    `Acceso: ${order.damage_diagram?.accessUnknown ? 'No recuerda la contraseña · '+UNKNOWN_ACCESS : order.unlock_type === 'none' ? 'Sin contraseña' : 'Registrado'}\n\n` +
    `🔧 *Trabajo pedido*\n` +
    `${order.requested_work || '—'}\n\n` +
    `💰 Seña: $${order.deposit_ars ?? 0}\n` +
    (order.revision_required ? `⚠️ Requiere revisión diagnóstica ($15.000)\n` : '') +
    (stockWarning ? `⚠️ AVISO: revisar stock de repuestos\n` : '') +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `Local: ${partnerName} — ${partnerAddress}`
  )

  const waLink = `https://wa.me/${JOACO_WA}?text=${waMsg}`

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(buildTicketHTML(order, partnerName, partnerAddress, logoUrl))
    win.document.close()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#059669' }}>✓ Orden creada</div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {stockWarning && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
            ⚠️ <strong>Aviso de stock:</strong> hay repuestos con stock en cero. El técnico va a confirmar disponibilidad.
          </div>
        )}

        {/* Ticket card */}
        <div style={{ background: '#fff', border: '2px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          {/* Header */}
          <div style={{ background: '#6366f1', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Orden de Servicio</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{order.order_number}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#c7d2fe' }}>
              <div>{new Date(order.created_at).toLocaleDateString('es-AR')}</div>
              <div>{partnerName}</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '16px 20px' }}>
            <TicketRow icon="👤" label="Cliente" value={order.client_name} />
            {order.client_phone && <TicketRow icon="📱" label="Teléfono" value={order.client_phone} />}
            <TicketRow icon="📱" label="Equipo" value={`${order.device_brand} ${order.device_model}`} />
            <TicketRow icon="⚡" label="Estado" value={order.turns_on ? 'Enciende' : 'NO enciende'} />
            {order.water_damage && <TicketRow icon="💧" label="Humedad" value="Sí ⚠️" />}
            <TicketRow icon="🔧" label="Trabajo" value={order.requested_work || '—'} />
            {order.deposit_ars > 0 && <TicketRow icon="💰" label="Seña" value={ars(order.deposit_ars)} />}
            {order.damage_diagram?.accessUnknown&&<div style={{marginTop:6,color:'#991b1b',fontWeight:700}}>{UNKNOWN_ACCESS}</div>}
            {order.revision_required && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef3c7', borderRadius: 8, fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                ⚠️ Revisión diagnóstica requerida — $15.000
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '10px 20px', fontSize: 11, color: '#9ca3af' }}>
            {order.turns_on
              ? 'Diagnóstico incluido. Sin retiro en 30 días = equipo abandonado (Ley 25232).'
              : '⚠️ Equipo ingresado SIN ENCENDER — no se asume responsabilidad por fallas preexistentes. Sin retiro en 30 días = abandonado (Ley 25232).'}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ShareOrder pin={pin} id={order.id} number={order.order_number} phone={order.client_phone} />
          <a href={waLink} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px', borderRadius: 12, background: '#25d366',
            color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}>
            🔧 Enviar orden al técnico
          </a>
          <button onClick={handlePrint} style={{
            padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb',
            background: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            🖨 Imprimir / Descargar ticket
          </button>
          <button onClick={onDone} style={{
            padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb',
            background: '#fff', fontSize: 14, cursor: 'pointer', color: '#6b7280',
          }}>
            ← Volver al listado
          </button>
        </div>
      </div>
    </div>
  )
}

function TicketRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ color: '#9ca3af', minWidth: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}

// ─── Order Detail (read-only for local) ──────────────────────────────────────

function LocalOrderDetail({
  order, partnerName, partnerAddress, logoUrl, onBack, onStatusChange, commissionUnlocked, pin, unlockCommission,
}: {
  order: Order; partnerName: string; partnerAddress: string; logoUrl: string; commissionUnlocked: boolean; pin:string; unlockCommission:(value:string)=>Promise<boolean>
  onBack: () => void; onStatusChange: (orderId: string, newStatus: string) => void
}) {
  const [advancing, setAdvancing] = useState(false)
  const sc = STATUS_COLORS[order.status] ?? '#9ca3af'
  const acc = [order.has_battery && 'Batería', order.has_chip && 'Chip', order.has_cover && 'Tapa', order.has_memory && 'Memoria'].filter(Boolean).join(', ') || 'Ninguno'

  const [updatedDraft,setUpdatedDraft]=useState<Order['quote_draft_lines']>(undefined)
  async function advanceStatus(newStatus: string) {
    setAdvancing(true)
    try {
      const res = await fetch(`/api/celulab/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        onStatusChange(order.id, newStatus)
      }
    } finally {
      setAdvancing(false)
    }
  }

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(buildTicketHTML(order, partnerName, partnerAddress, logoUrl))
    win.document.close()
  }

  const waMsg = encodeURIComponent(
    `📋 *ORDEN ${order.order_number}*\n` +
    `Cliente: ${order.client_name}\n` +
    `Equipo: ${order.device_brand} ${order.device_model}\n` +
    `Trabajo: ${order.requested_work || '—'}\n` +
    `Estado: ${STATUS_LABELS[order.status] ?? order.status}\n` +
    (order.budget_ars > 0 ? `Presupuesto: ${ars(order.budget_ars)}\n` : '') +
    `Local: ${partnerName}`
  )

  const FLOW_STEPS = [
    { key: 'ingresado', label: 'Ingresado', icon: '📋' },
    { key: 'en_revision', label: 'En revisión', icon: '🔍' },
    { key: 'presupuesto_enviado', label: 'Presupuesto', icon: '💬' },
    { key: 'aprobado', label: 'Aprobado', icon: '✅' },
    { key: 'en_reparacion', label: 'Reparación', icon: '🔧' },
    { key: 'listo', label: 'Listo!', icon: '📦' },
    { key: 'retirado_por_local', label: 'Retirado', icon: '🏪' },
    { key: 'entregado_al_cliente', label: 'Entregado', icon: '🎉' },
  ]
  const currentStep = FLOW_STEPS.findIndex(s => s.key === order.status)
  const isRejected = order.status === 'rechazado'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', padding: 0 }}>←</button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{order.order_number}</div>
        <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: sc + '18', color: sc }}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Status flow timeline ── */}
        {!isRejected && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 16px', marginBottom: 20, overflowX: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Progreso de la orden</div>
            <div style={{ display: 'flex', alignItems: 'center', minWidth: 520 }}>
              {FLOW_STEPS.map((step, i) => {
                const done = i < currentStep
                const active = i === currentStep
                const future = i > currentStep
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < FLOW_STEPS.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                        background: done ? '#059669' : active ? '#6366f1' : '#f3f4f6',
                        border: `2px solid ${done ? '#059669' : active ? '#6366f1' : '#e5e7eb'}`,
                        boxShadow: active ? '0 0 0 3px #6366f122' : 'none',
                        transition: 'all .2s',
                      }}>
                        {done ? <span style={{ fontSize: 13, color: '#fff' }}>✓</span> : <span style={{ filter: future ? 'grayscale(1) opacity(.4)' : 'none' }}>{step.icon}</span>}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: done ? '#059669' : active ? '#6366f1' : '#9ca3af', textAlign: 'center', maxWidth: 52, lineHeight: 1.2 }}>{step.label}</div>
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: done ? '#059669' : '#e5e7eb', margin: '0 4px', marginBottom: 18 }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isRejected && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontWeight: 600, fontSize: 14, color: '#dc2626' }}>
            ❌ Presupuesto rechazado por el cliente.
          </div>
        )}

        {/* Action banners — local can advance status */}
        {order.status === 'listo' && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#15803d', marginBottom: 10 }}>✅ ¡El equipo está listo para retirar del taller!</div>
            <button
              onClick={() => advanceStatus('retirado_por_local')}
              disabled={advancing}
              style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: advancing ? 0.7 : 1 }}
            >
              {advancing ? 'Actualizando...' : '📦 Confirmar retiro del equipo'}
            </button>
          </div>
        )}
        {order.status === 'retirado_por_local' && (
          <div style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0369a1', marginBottom: 10 }}>📦 Equipo en tu local — ¿Ya lo entregaste al cliente?</div>
            <button
              onClick={() => advanceStatus('entregado_al_cliente')}
              disabled={advancing}
              style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: advancing ? 0.7 : 1 }}
            >
              {advancing ? 'Actualizando...' : '✓ Marcar como entregado al cliente'}
            </button>
          </div>
        )}
        {order.status === 'entregado_al_cliente' && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontWeight: 600, fontSize: 14, color: '#6b7280' }}>
            🎉 Equipo entregado al cliente. Proceso completo.
          </div>
        )}

        <Card title="👤 Cliente">
          <TRow label="Nombre" value={order.client_name} />
          <TRow label="DNI" value={order.client_dni || '—'} />
          <TRow label="Teléfono" value={order.client_phone || '—'} />
        </Card>

        <Card title="📱 Equipo" style={{ marginTop: 12 }}>
          <TRow label="Equipo" value={`${order.device_brand} ${order.device_model}`} />
          <TRow label="Enciende" value={order.turns_on ? 'SÍ' : 'NO'} />
          <TRow label="Accesorios" value={acc} />
          {order.water_damage && <TRow label="Humedad" value="SÍ ⚠️" />}
        </Card>

        {order.damage_diagram?.accessUnknown&&<p style={{color:'#991b1b',fontWeight:700}}>{UNKNOWN_ACCESS}</p>}
        <Card title="Falla reportada por el cliente" style={{marginTop:12,borderLeft:'4px solid #cc6673'}}>{order.reported_fault||'Sin registrar'}</Card>
        <Card title="🔧 Trabajo" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{order.requested_work || '—'}</div>
        </Card>

        <QuoteEditor key={updatedDraft?.length??'original'} initialLines={updatedDraft??order.quote_draft_lines} order={order.id} partner={order.partner_id} pin={pin} name={order.client_name} device={order.device_brand+' '+order.device_model}/>
        <ExtraJobs id={order.id} local device={order.device_brand+' '+order.device_model} pin={pin} onDraftChanged={setUpdatedDraft}/>
        <Card title="Ganancia del local" style={{ marginTop: 12 }}>{commissionUnlocked ? <OrderEarnings order={order} unlocked /> : <EarningsPin onUnlock={unlockCommission} />}</Card>

        {order.budget_ars > 0 && (
          <Card title="💰 Presupuesto" style={{ marginTop: 12 }}>
            <TRow label="Presupuesto" value={ars(order.budget_ars)} />
            {order.deposit_ars > 0 && <TRow label="Seña ya cobrada" value={ars(order.deposit_ars)} />}
            <TRow label="Garantía" value={order.warranty_days > 0 ? `${order.warranty_days} días` : 'Sin garantía'} />
          </Card>
        )}

        <ShareOrder pin={pin} id={order.id} number={order.order_number} phone={order.client_phone} />
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handlePrint} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            🖨 Imprimir
          </button>
          {order.client_phone && (
            <a href={`https://wa.me/${JOACO_WA}?text=${waMsg}`} target="_blank" rel="noreferrer" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px', borderRadius: 10, border: '1px solid #25d366',
              color: '#25d366', fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              📲 Compartir
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}

// ─── Phone Diagram (compact) ─────────────────────────────────────────────────

const PW = 140, PH = 250

function MiniPhoneDiagram({
  markers, onAdd, onRemove,
}: { markers: DamageMarker[]; onAdd: (m: DamageMarker) => void; onRemove: (i: number) => void }) {
  const [side, setSide] = useState<'front' | 'back'>('front')
  const sideMarkers = markers.filter(m => m.side === side)
  const sideIdxs = markers.reduce<number[]>((acc, m, i) => { if (m.side === side) acc.push(i); return acc }, [])

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    onAdd({ x: Math.round(((e.clientX - rect.left) / rect.width) * 100), y: Math.round(((e.clientY - rect.top) / rect.height) * 100), side })
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, background: '#f1f5f9', borderRadius: 8, padding: 3, width: 'fit-content' }}>
          {(['front', 'back'] as const).map(s => (
            <button key={s} onClick={() => setSide(s)} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              background: side === s ? '#fff' : 'transparent', color: side === s ? '#6366f1' : '#9ca3af',
              boxShadow: side === s ? '0 1px 2px rgba(0,0,0,.1)' : 'none',
            }}>
              {s === 'front' ? 'Frente' : 'Trasera'}
            </button>
          ))}
        </div>
        <svg viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} onClick={handleClick}
          style={{ cursor: 'crosshair', background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <rect x={8} y={6} width={PW - 16} height={PH - 12} rx={15} ry={15} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2} />
          {side === 'front' ? (
            <>
              <rect x={PW / 2 - 16} y={16} width={32} height={4} rx={2} fill="#cbd5e1" />
              <rect x={12} y={32} width={PW - 24} height={PH - 80} rx={4} fill="#e8f0fe" stroke="#bfcbf9" strokeWidth={1} />
              <rect x={PW / 2 - 18} y={PH - 24} width={36} height={4} rx={2} fill="#cbd5e1" />
            </>
          ) : (
            <>
              <rect x={16} y={22} width={40} height={34} rx={8} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.5} />
              <circle cx={36} cy={39} r={11} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1} />
              <circle cx={36} cy={39} r={5} fill="#1e293b" />
              <circle cx={52} cy={26} r={4} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
            </>
          )}
          {sideMarkers.map((m, i) => (
            <g key={i} style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onRemove(sideIdxs[i]) }}>
              <circle cx={m.x * PW / 100} cy={m.y * PH / 100} r={9} fill="#ef444428" stroke="#ef4444" strokeWidth={1.5} />
              <text x={m.x * PW / 100} y={m.y * PH / 100 + 3} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#ef4444">{sideIdxs[i] + 1}</text>
            </g>
          ))}
        </svg>
      </div>
      {markers.length > 0 && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>DAÑOS</div>
          {markers.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ color: '#6b7280', flex: 1 }}>{m.side === 'front' ? 'Frente' : 'Trasera'}</span>
              <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 13, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Print HTML ───────────────────────────────────────────────────────────────

function buildTicketHTML(order: Order, partnerName: string, partnerAddress: string, logoUrl: string): string {
  const acc = [order.has_battery && 'Batería', order.has_chip && 'Chip', order.has_cover && 'Tapa', order.has_memory && 'Memoria'].filter(Boolean).join(' · ') || 'Ninguno'
  const date = new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  const markers = order.damage_diagram?.markers ?? []
  const frontM = markers.filter(m => m.side === 'front')
  const backM = markers.filter(m => m.side === 'back')
  const PW = 120, PH = 225

  function phoneSVG(sideMarkers: DamageMarker[], label: string) {
    const circles = sideMarkers.map((m, i) =>
      `<circle cx="${m.x * PW / 100}" cy="${m.y * PH / 100}" r="8" fill="#ef444420" stroke="#ef4444" stroke-width="1.5"/>
       <text x="${m.x * PW / 100}" y="${m.y * PH / 100 + 3.5}" text-anchor="middle" font-size="8" font-weight="bold" fill="#ef4444">${i + 1}</text>`
    ).join('')
    return `<div style="text-align:center;margin-right:10px;">
      <div style="font-size:8px;text-transform:uppercase;color:#999;margin-bottom:3px;">${label}</div>
      <svg viewBox="0 0 ${PW} ${PH}" width="60" height="113" style="border:1px solid #e5e7eb;border-radius:5px;background:#fafafa;">
        <rect x="8" y="6" width="${PW - 16}" height="${PH - 12}" rx="14" ry="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="${PW / 2 - 15}" y="17" width="30" height="4" rx="2" fill="#cbd5e1"/>
        <rect x="12" y="32" width="${PW - 24}" height="${PH - 76}" rx="3" fill="#e8f0fe" stroke="#bfcbf9" stroke-width="1"/>
        ${circles}
      </svg>
    </div>`
  }

  const diagSection = markers.length > 0 ? `
    <div style="margin-top:10px;border-top:1px dashed #e5e7eb;padding-top:8px;">
      <div style="font-size:9px;text-transform:uppercase;color:#888;font-weight:bold;margin-bottom:6px;">Daños preexistentes</div>
      <div style="display:flex;align-items:flex-start;">
        ${frontM.length > 0 ? phoneSVG(frontM, 'Frente') : ''}
        ${backM.length > 0 ? phoneSVG(backM, 'Trasera') : ''}
        <div style="font-size:9px;color:#555;flex:1;">
          ${markers.map((m, i) => `<div style="margin-bottom:2px;">${i + 1}. ${m.side === 'front' ? 'Frente' : 'Trasera'}</div>`).join('')}
          <div style="margin-top:4px;font-size:8px;color:#aaa;font-style:italic;">Daños al ingreso. CeluLab no es responsable por estas marcas.</div>
        </div>
      </div>
    </div>` : ''

  const flags = [!order.turns_on && '⚠️ NO ENCIENDE', order.water_damage && '⚠️ HUMEDAD', order.revision_required && '⚠️ REQUIERE REVISIÓN $15.000'].filter(Boolean).join(' &nbsp; ')

  const lbl = `font-size:9px;text-transform:uppercase;color:#888;font-weight:bold;display:block;margin-bottom:1px;`
  const val = `font-size:13px;font-weight:700;color:#111;margin-bottom:8px;display:block;`

  const logoTag = logoUrl
    ? `<img src="${logoUrl}" style="width:40px;height:40px;border-radius:7px;object-fit:cover;border:1px solid #e5e7eb;" alt="${partnerName}"/>`
    : `<div style="width:40px;height:40px;border-radius:7px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:18px;">🏪</div>`

  function copy(type: 'tecnico' | 'local' | 'cliente') {
    const isInternal = type !== 'cliente'
    const label = type === 'tecnico' ? 'Copia técnico' : type === 'local' ? 'Copia local' : 'Copia cliente'
    return `
    <div style="font-family:Arial,sans-serif;font-size:12px;border:2px solid #000;border-radius:8px;padding:16px;margin-bottom:20px;page-break-inside:avoid;max-width:440px;">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #111;">
        ${logoTag}
        <div style="flex:1;">
          <div style="font-weight:700;font-size:14px;">${partnerName}</div>
          <div style="font-size:10px;color:#666;">${partnerAddress}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:9px;color:#999;text-transform:uppercase;">${label}</div>
          <div style="font-size:20px;font-weight:900;font-family:monospace;">${order.order_number}</div>
          <div style="font-size:10px;color:#888;">${date}</div>
        </div>
      </div>

      ${flags ? `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:bold;color:#92400e;margin-bottom:10px;">${flags}</div>` : ''}

      <!-- Grid datos -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">
        <div><span style="${lbl}">Cliente</span><span style="${val}">${order.client_name}</span></div>
        <div><span style="${lbl}">Teléfono</span><span style="${val}">${order.client_phone || '—'}</span></div>
        ${isInternal ? `<div><span style="${lbl}">DNI</span><span style="${val}">${order.client_dni || '—'}</span></div>` : ''}
        <div><span style="${lbl}">Equipo</span><span style="${val}">${order.device_brand} ${order.device_model}</span></div>
        <div><span style="${lbl}">Enciende</span><span style="${val}">${order.turns_on ? 'SÍ' : 'NO ⚠️'}</span></div>
        <div><span style="${lbl}">Accesorios</span><span style="${val}">${acc}</span></div>
        <div><span style="${lbl}">Seña cobrada</span><span style="${val}">$${(order.deposit_ars ?? 0).toLocaleString('es-AR')}</span></div>
      </div>

      ${isInternal ? `
      <!-- Acceso — copias internas -->
      <div style="margin-top:4px;margin-bottom:8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;padding:8px 12px;">
        <div style="font-size:9px;text-transform:uppercase;color:#1d4ed8;font-weight:bold;margin-bottom:3px;">🔒 Acceso al equipo</div>
        <div style="font-size:14px;font-weight:800;color:#1e3a8a;letter-spacing:0.05em;">${order.unlock_type === 'none' ? (order.damage_diagram?.accessUnknown?'No recuerda la contraseña ⚠️':'Sin contraseña') : order.unlock_type === 'pin' ? `PIN: ${order.unlock_code || '—'}` : `Patrón: ${order.unlock_code || '—'}`}</div>
        ${order.damage_diagram?.accessUnknown ? '<div style="font-size:10px;color:#991b1b;margin-top:2px;">'+UNKNOWN_ACCESS+'</div>' : ''}
      </div>` : ''}

      <!-- Trabajo -->
      <div style="margin-bottom:8px;">
        <span style="${lbl}">Trabajo solicitado</span>
        <span style="${val}">${order.requested_work || '—'}</span>
      </div>

      ${isInternal && order.notes ? `<div style="margin-bottom:8px;"><span style="${lbl}">Notas internas</span><span style="font-size:12px;color:#555;">${order.notes}</span></div>` : ''}

      ${isInternal ? diagSection : ''}

      ${!isInternal ? `
      <!-- Seguimiento — solo copia cliente -->
      <div style="margin-top:8px;padding:8px 10px;background:#f0fdf4;border:1px solid #86efac;border-radius:7px;font-size:10px;color:#14532d;">
        📱 Seguí tu equipo en tiempo real:<br/>
        <strong>divinia.vercel.app/seguimiento/${order.order_number}</strong>
      </div>` : ''}

      <!-- Firmas -->
      <div style="display:flex;justify-content:space-between;margin-top:14px;">
        <div style="text-align:center;width:44%;border-top:1px solid #000;padding-top:4px;font-size:9px;color:#888;">Firma y aclaración del cliente</div>
        <div style="text-align:center;width:44%;border-top:1px solid #000;padding-top:4px;font-size:9px;color:#888;">Conformidad con estado declarado</div>
      </div>

      <!-- Legal -->
      <div style="font-size:9px;color:#888;margin-top:10px;border-top:1px dashed #ccc;padding-top:6px;line-height:1.5;">
        ${order.turns_on ? 'Diagnóstico incluido.' : '⚠️ Equipo ingresado SIN ENCENDER — CeluLab no se hace responsable de fallas preexistentes.'} Equipo no retirado en 30 días corridos = abandonado (Ley 25232). · CeluLab · +54 9 2664 501140
      </div>
    </div>`
  }

  return `<html><head><title>Ticket ${order.order_number}</title>
  <style>
    body { margin: 20px; background: #fff; }
    @media print { .copy { page-break-after: always; } .copy:last-child { page-break-after: avoid; } }
  </style></head><body>
  <div class="copy">${copy('tecnico')}</div>
  <div class="copy">${copy('local')}</div>
  <div class="copy">${copy('cliente')}</div>
  <script>window.onload = () => window.print()<\/script>
  </body></html>`
}

// ─── Help Modal ───────────────────────────────────────────────────────────────

const HELP_SECTIONS = [
  {
    id: 'inicio',
    icon: '🏠',
    title: 'Pantalla principal',
    steps: [
      {
        icon: '⚙️',
        title: 'Contadores de estado',
        body: 'Los tres números arriba (Activas · Listas · Completadas) te muestran de un vistazo cuántos equipos tenés en el taller. Tocás cualquiera y te lleva directo a esa lista.',
      },
      {
        icon: '💰',
        title: 'Tab "Lista de precios"',
        body: 'Mirá los precios vigentes de CeluLab antes de cotizarle algo a un cliente. Los precios incluyen mano de obra.',
      },
      {
        icon: '📋',
        title: 'Tab "Órdenes activas"',
        body: 'Todos los equipos que están actualmente en el taller. Tocás una y ves el detalle completo.',
      },
      {
        icon: '🕐',
        title: 'Tab "Historial"',
        body: 'Órdenes ya cerradas (entregadas o rechazadas). Podés ver por orden individual o agrupar por cliente para ver cuántas veces volvió.',
      },
    ],
  },
  {
    id: 'nueva',
    icon: '📋',
    title: 'Crear nueva orden',
    steps: [
      {
        icon: '👤',
        title: 'Datos del cliente',
        body: 'Pedile el nombre completo y el WhatsApp. Con ese número le avisamos automáticamente cuando el equipo esté listo.',
      },
      {
        icon: '📱',
        title: '¿El equipo enciende?',
        body: 'Si NO enciende → hay una revisión diagnóstica de $15.000. Ese monto se descuenta del presupuesto final si el cliente aprueba la reparación. Cobrá la seña antes de que se vaya.',
      },
      {
        icon: '🔒',
        title: 'Acceso al equipo',
        body: 'Pedile el PIN o el patrón de desbloqueo. Sin acceso al equipo no se puede aplicar garantía. Si no lo da, activá "Sin acceso" y el panel te avisa automáticamente.',
      },
      {
        icon: '🔍',
        title: 'Revisión al ingreso (hacela con el cliente presente)',
        body: '① Pedile que retire el chip SIM y la memoria SD\n② Revisá si hay mancha blanca de humedad en la bandeja\n③ Marcá en el diagrama del teléfono cualquier rayadura o golpe preexistente — esto te protege a vos si el cliente reclama después\n④ Anotá qué accesorios dejó (batería externa, funda, etc.)',
      },
      {
        icon: '🔧',
        title: 'Trabajo y seña',
        body: 'Describí qué quiere reparar. Para trabajos con repuesto pedimos al menos el 50% como seña antes de encargar la pieza. Si el equipo no enciende, la seña mínima es $15.000 (el diagnóstico).',
      },
      {
        icon: '✅',
        title: 'Crear orden → enviar por WhatsApp',
        body: 'Al confirmar se genera el ticket con número de orden. Tocá el botón verde para enviárselo al técnico por WhatsApp — eso activa el proceso de reparación.',
      },
    ],
  },
  {
    id: 'estados',
    icon: '📦',
    title: 'Estados y flujo del equipo',
    steps: [
      {
        icon: '📋',
        title: 'Ingresado',
        body: 'El equipo acaba de registrarse. El técnico lo recibe y empieza la revisión.',
      },
      {
        icon: '🔍',
        title: 'En revisión → Presupuesto enviado',
        body: 'El técnico diagnostica el problema y te manda el presupuesto por WhatsApp. Mostráselo al cliente y confirmá si aprueba o rechaza.',
      },
      {
        icon: '🔧',
        title: 'Aprobado → En reparación',
        body: 'El cliente aprobó. El técnico consigue el repuesto y arranca la reparación.',
      },
      {
        icon: '✅',
        title: '¡Listo! → Confirmás el retiro',
        body: 'Cuando el panel muestra "✅ Listo", el equipo ya está reparado en el taller. Andá a buscarlo y tocá "Confirmar retiro del equipo".',
      },
      {
        icon: '🏪',
        title: 'Retirado → Lo entregás al cliente',
        body: 'Tenés el equipo en tu local. Entregáselo al cliente y tocá "Marcar como entregado al cliente" para cerrar la orden.',
      },
      {
        icon: '❌',
        title: 'Rechazado',
        body: 'El cliente no aprobó el presupuesto. El equipo se devuelve sin reparar. Si ya pagó la revisión ($15.000), ese monto no se devuelve.',
      },
    ],
  },
  {
    id: 'tips',
    icon: '💡',
    title: 'Tips importantes',
    steps: [
      {
        icon: '💬',
        title: 'Frases que te ayudan',
        body: '"El diagnóstico es gratuito si el equipo enciende. Si no enciende, son $15.000 que se descuentan si aprobás la reparación."\n\n"Sin el código de desbloqueo, no podemos aplicar garantía por el software."\n\n"Revisamos juntos el equipo antes de que lo dejes, para que quede anotado cualquier rayadura previa."',
      },
      {
        icon: '⏰',
        title: 'Tiempos de entrega',
        body: 'Si ingresa encendido a la mañana → listo esa tarde.\nSi ingresa a la tarde → listo al día hábil siguiente.\nEsas reparaciones son con repuesto en stock. Si hay que pedir, se avisa.',
      },
      {
        icon: '💰',
        title: 'Tu comisión',
        body: 'Ganás una parte de la mano de obra por cada equipo que ingresás. El técnico te la liquida por semana. Podés ver cuánto lleva cada orden en el detalle.',
      },
      {
        icon: '📲',
        title: 'Dudas o problemas',
        body: 'Escribile al técnico directamente por WhatsApp: +54 9 2665 286110',
      },
    ],
  },
]

function HelpModal({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState('inicio')
  const section = HELP_SECTIONS.find(s => s.id === activeSection) ?? HELP_SECTIONS[0]

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: 'system-ui' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + Header */}
        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e7eb', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#111' }}>Ayuda y tutorial</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Cómo usar el panel de CeluLab</div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 16, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
            {HELP_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                padding: '7px 13px', borderRadius: 20, whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeSection === s.id ? '#6366f1' : '#f3f4f6',
                color: activeSection === s.id ? '#fff' : '#374151',
                border: 'none', flexShrink: 0,
              }}>
                {s.icon} {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '20px 20px 32px', flex: 1 }}>
          {section.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              {/* Icon circle */}
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, marginTop: 2 }}>
                {step.icon}
              </div>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{step.title}</div>
                </div>
                <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.65, whiteSpace: 'pre-line', paddingLeft: 28 }}>
                  {step.body}
                </div>
                {i < section.steps.length - 1 && (
                  <div style={{ marginLeft: 28, marginTop: 16, height: 1, background: '#f3f4f6' }} />
                )}
              </div>
            </div>
          ))}

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingLeft: 54 }}>
            {HELP_SECTIONS.findIndex(s => s.id === activeSection) > 0 ? (
              <button onClick={() => setActiveSection(HELP_SECTIONS[HELP_SECTIONS.findIndex(s => s.id === activeSection) - 1].id)}
                style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>
                ← Anterior
              </button>
            ) : <div />}
            {HELP_SECTIONS.findIndex(s => s.id === activeSection) < HELP_SECTIONS.length - 1 ? (
              <button onClick={() => setActiveSection(HELP_SECTIONS[HELP_SECTIONS.findIndex(s => s.id === activeSection) + 1].id)}
                style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Siguiente →
              </button>
            ) : (
              <button onClick={onClose}
                style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                ✓ ¡Entendido!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mini-components ──────────────────────────────────────────────────────────

function Card({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', ...style }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 11px', borderRadius: 8, border: '1px solid #d1d5db',
  fontSize: 14, background: '#fff', boxSizing: 'border-box',
}
