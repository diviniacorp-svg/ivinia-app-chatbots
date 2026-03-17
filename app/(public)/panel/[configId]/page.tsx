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

interface PanelData {
  company_name: string
  color: string
  owner_phone: string
  appointments: Appointment[]
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  const names = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const dow = names[new Date(d + 'T12:00:00').getDay()]
  return `${dow} ${day}/${m}/${y}`
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function buildWA(phone: string, msg: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

export default function OwnerPanel() {
  const params = useParams()
  const configId = params.configId as string

  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState('')
  const [data, setData] = useState<PanelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'pendientes' | 'confirmados' | 'historial'>('pendientes')

  // Estado local por turno: { [id]: { sena: string, processing: bool, done: 'approved'|'rejected'|null } }
  const [apptState, setApptState] = useState<Record<string, { sena: string; processing: boolean; done: 'approved' | 'rejected' | null }>>({})

  const today = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async (pinValue: string) => {
    setLoading(true)
    const res = await fetch(`/api/panel/${configId}?pin=${pinValue}`)
    if (res.status === 401) {
      setPinError('PIN incorrecto.')
      setAuthed(false)
      setLoading(false)
      return
    }
    if (!res.ok) { setLoading(false); return }
    const json = await res.json()
    setData(json)
    setAuthed(true)
    setLoading(false)
  }, [configId])

  function handlePin(e: React.FormEvent) {
    e.preventDefault()
    setPinError('')
    loadData(pin)
  }

  async function handleAction(apptId: string, action: 'approve' | 'reject') {
    const sena = apptState[apptId]?.sena || '0'
    setApptState(prev => ({ ...prev, [apptId]: { ...prev[apptId], processing: true } }))

    const res = await fetch(`/api/panel/${configId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, appointmentId: apptId, action, sena_ars: Number(sena) }),
    })

    if (res.ok) {
      setApptState(prev => ({ ...prev, [apptId]: { ...prev[apptId], processing: false, done: action === 'approve' ? 'approved' : 'rejected' } }))
      // Recargar datos
      await loadData(pin)
    } else {
      setApptState(prev => ({ ...prev, [apptId]: { ...prev[apptId], processing: false } }))
    }
  }

  // Efecto: inicializar estado por turno
  useEffect(() => {
    if (!data) return
    setApptState(prev => {
      const next = { ...prev }
      data.appointments.forEach(a => {
        if (!next[a.id]) next[a.id] = { sena: '', processing: false, done: null }
      })
      return next
    })
  }, [data])

  const appts = data?.appointments || []
  const pending    = appts.filter(a => a.status === 'pending').sort((a, b) => a.created_at.localeCompare(b.created_at))
  const confirmed  = appts.filter(a => a.status === 'confirmed').sort((a, b) => (a.appointment_date + a.appointment_time).localeCompare(b.appointment_date + b.appointment_time))
  const historial  = appts.filter(a => ['cancelled','completed','no_show'].includes(a.status))
  const color = data?.color || '#7c3aed'

  const todayConfirmed = confirmed.filter(a => a.appointment_date === today)

  // ── LOGIN ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f8f7ff' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: color + '22' }}>
            📅
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-1">Panel de turnos</h1>
          <p className="text-gray-500 text-sm mb-6">Ingresá tu PIN de 4 dígitos para acceder.</p>
          <form onSubmit={handlePin} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="· · · ·"
              className="w-full text-center text-3xl font-mono tracking-[0.5em] border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-purple-400"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm font-medium">{pinError}</p>}
            <button
              type="submit"
              disabled={pin.length !== 4 || loading}
              className="w-full text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-opacity text-base"
              style={{ backgroundColor: color }}
            >
              {loading ? 'Verificando...' : 'Entrar al panel'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── PANEL ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white px-4 pt-6 pb-5" style={{ backgroundColor: color }}>
        <div className="max-w-lg mx-auto">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Panel de turnos</p>
          <h1 className="text-xl font-black mt-0.5 mb-4">{data?.company_name}</h1>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: pending.length,       label: 'Pendientes', alert: pending.length > 0 },
              { n: todayConfirmed.length, label: 'Hoy',       alert: false },
              { n: confirmed.length,      label: 'Confirmados',alert: false },
            ].map(({ n, label, alert }) => (
              <div key={label} className="bg-white/15 rounded-xl px-3 py-2.5 text-center">
                <p className={`text-2xl font-black ${alert && n > 0 ? 'text-yellow-300' : 'text-white'}`}>{n}</p>
                <p className="text-white/70 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-5 shadow-sm">
          {[
            { key: 'pendientes',  label: `Solicitudes${pending.length > 0 ? ` (${pending.length})` : ''}` },
            { key: 'confirmados', label: `Agenda${confirmed.length > 0 ? ` (${confirmed.length})` : ''}` },
            { key: 'historial',   label: 'Historial' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t.key ? 'text-white shadow-sm' : 'text-gray-500'}`}
              style={tab === t.key ? { backgroundColor: color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-400 py-10 text-sm">Actualizando...</p>}

        {/* ── SOLICITUDES PENDIENTES ── */}
        {tab === 'pendientes' && !loading && (
          pending.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-medium text-gray-500">No hay solicitudes pendientes</p>
              <p className="text-sm mt-1">Todas las solicitudes fueron procesadas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(appt => {
                const st = apptState[appt.id] || { sena: '', processing: false, done: null }
                const saldo = appt.service_price_ars - (Number(st.sena) || 0)
                const waApprove = appt.customer_phone
                  ? buildWA(appt.customer_phone,
                      `Hola ${appt.customer_name}! 🎉 Tu turno de *${appt.service_name}* el *${formatDate(appt.appointment_date)}* a las *${appt.appointment_time}* fue *confirmado*.\n` +
                      (Number(st.sena) > 0 ? `\n💰 Seña: ${formatARS(Number(st.sena))}\n💳 Saldo restante: ${formatARS(saldo)}\n` : '') +
                      `\n¡Te esperamos! 🙌`)
                  : null
                const waReject = appt.customer_phone
                  ? buildWA(appt.customer_phone,
                      `Hola ${appt.customer_name}, lamentablemente no podemos confirmar tu turno de *${appt.service_name}* el *${formatDate(appt.appointment_date)}* a las *${appt.appointment_time}*. Si querés, podés elegir otro horario. 🙏`)
                  : null

                return (
                  <div key={appt.id} className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden">
                    <div className="bg-amber-50 px-4 py-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Nueva solicitud</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-black text-gray-900 text-base">{appt.customer_name}</p>
                          <p className="text-sm font-semibold text-gray-700">{appt.service_name}</p>
                          <p className="text-sm font-bold mt-0.5" style={{ color }}>
                            📅 {formatDate(appt.appointment_date)} · ⏰ {appt.appointment_time}
                          </p>
                          {appt.service_price_ars > 0 && (
                            <p className="text-sm text-gray-500 mt-0.5">💰 Precio: {formatARS(appt.service_price_ars)}</p>
                          )}
                        </div>
                        {appt.customer_phone && (
                          <a href={`https://wa.me/${appt.customer_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1.5 rounded-lg font-medium whitespace-nowrap">
                            💬 WA
                          </a>
                        )}
                      </div>

                      {appt.customer_notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mb-3 italic">
                          &ldquo;{appt.customer_notes}&rdquo;
                        </p>
                      )}

                      {/* Seña (solo si hay precio) */}
                      {appt.service_price_ars > 0 && !st.done && (
                        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl px-3 py-2">
                          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Seña $</span>
                          <input
                            type="number"
                            min={0}
                            max={appt.service_price_ars}
                            placeholder="0"
                            value={st.sena}
                            onChange={e => setApptState(prev => ({ ...prev, [appt.id]: { ...prev[appt.id], sena: e.target.value } }))}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-purple-400 w-24"
                          />
                          {Number(st.sena) > 0 && (
                            <span className="text-xs text-gray-500">Saldo: <strong>{formatARS(saldo)}</strong></span>
                          )}
                        </div>
                      )}

                      {/* Botones aprobar/rechazar */}
                      {!st.done ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAction(appt.id, 'approve')}
                            disabled={st.processing}
                            className="py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-opacity"
                            style={{ backgroundColor: color }}
                          >
                            {st.processing ? '...' : '✓ Aprobar'}
                          </button>
                          <button
                            onClick={() => handleAction(appt.id, 'reject')}
                            disabled={st.processing}
                            className="py-3 rounded-xl font-bold text-sm bg-red-500 text-white disabled:opacity-50 hover:bg-red-600 transition-colors"
                          >
                            {st.processing ? '...' : '✕ Rechazar'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {st.done === 'approved' && waApprove && (
                            <a href={waApprove} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors">
                              💬 Avisarle al cliente que fue confirmado
                            </a>
                          )}
                          {st.done === 'rejected' && waReject && (
                            <a href={waReject} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                              💬 Avisarle al cliente que fue rechazado
                            </a>
                          )}
                          <p className="text-center text-xs text-gray-400">
                            {st.done === 'approved' ? '✅ Turno aprobado' : '❌ Turno rechazado'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ── AGENDA (confirmados) ── */}
        {tab === 'confirmados' && !loading && (
          confirmed.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm">No hay turnos confirmados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {confirmed.map(appt => (
                <div key={appt.id} className={`bg-white rounded-xl border p-4 ${appt.appointment_date === today ? 'border-purple-200 shadow-sm' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-gray-900">{appt.customer_name}</span>
                        {appt.appointment_date === today && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Hoy</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{appt.service_name}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color }}>
                        📅 {formatDate(appt.appointment_date)} · ⏰ {appt.appointment_time}
                      </p>
                      {appt.sena_ars != null && appt.sena_ars > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          💰 Seña: {formatARS(appt.sena_ars)} · Saldo: {formatARS(appt.service_price_ars - appt.sena_ars)}
                        </p>
                      )}
                      {appt.customer_phone && (
                        <a href={`https://wa.me/${appt.customer_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-green-600 mt-1 inline-block">💬 {appt.customer_phone}</a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={async () => {
                          await fetch(`/api/bookings/appointments/${appt.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'completed' }),
                          })
                          loadData(pin)
                        }}
                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100"
                      >
                        ✓ Completar
                      </button>
                      <button
                        onClick={async () => {
                          await fetch(`/api/bookings/appointments/${appt.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'cancelled' }),
                          })
                          loadData(pin)
                        }}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── HISTORIAL ── */}
        {tab === 'historial' && !loading && (
          historial.length === 0 ? (
            <div className="text-center py-14 text-gray-400"><p className="text-sm">Sin historial todavía.</p></div>
          ) : (
            <div className="space-y-2">
              {[...historial].sort((a,b) => b.appointment_date.localeCompare(a.appointment_date)).map(appt => {
                const labels: Record<string,string> = { cancelled: '❌ Cancelado', completed: '✅ Completado', no_show: '👻 No vino' }
                return (
                  <div key={appt.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-3 opacity-70">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{appt.customer_name} · {appt.service_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(appt.appointment_date)} · {appt.appointment_time}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{labels[appt.status] || appt.status}</span>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
