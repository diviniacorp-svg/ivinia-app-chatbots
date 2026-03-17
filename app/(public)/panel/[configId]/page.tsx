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
  status: string
}

interface PanelData {
  company_name: string
  color: string
  appointments: Appointment[]
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  confirmed: { label: 'Confirmado', bg: 'bg-green-100', text: 'text-green-700' },
  cancelled:  { label: 'Cancelado',  bg: 'bg-red-100',   text: 'text-red-700' },
  completed:  { label: 'Completado', bg: 'bg-blue-100',  text: 'text-blue-700' },
  no_show:    { label: 'No vino',    bg: 'bg-gray-100',  text: 'text-gray-500' },
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export default function OwnerPanel() {
  const params = useParams()
  const configId = params.configId as string

  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState('')
  const [data, setData] = useState<PanelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'hoy' | 'proximos' | 'todos'>('hoy')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async (pinValue: string) => {
    setLoading(true)
    const res = await fetch(`/api/panel/${configId}?pin=${pinValue}`)
    if (res.status === 401) {
      setPinError('PIN incorrecto. Verificá con el negocio.')
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

  async function updateStatus(apptId: string, status: string) {
    setUpdatingId(apptId)
    await fetch(`/api/bookings/appointments/${apptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await loadData(pin)
    setUpdatingId(null)
  }

  const appts = data?.appointments || []
  const todayAppts    = appts.filter(a => a.appointment_date === today && a.status === 'confirmed')
  const upcomingAppts = appts.filter(a => a.appointment_date > today  && a.status === 'confirmed')
  const allAppts      = [...appts].sort((a, b) => (a.appointment_date + a.appointment_time).localeCompare(b.appointment_date + b.appointment_time))

  const visibleAppts = tab === 'hoy' ? todayAppts : tab === 'proximos' ? upcomingAppts : allAppts
  const color = data?.color || '#7c3aed'

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-black text-gray-900 mb-1">Panel de turnos</h1>
          <p className="text-gray-500 text-sm mb-6">Ingresá el PIN que te dio DIVINIA para ver tus turnos.</p>
          <form onSubmit={handlePin} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="_ _ _ _"
              className="w-full text-center text-3xl font-mono tracking-[0.5em] border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-purple-500"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm">{pinError}</p>}
            <button
              type="submit"
              disabled={pin.length !== 4 || loading}
              style={{ backgroundColor: color }}
              className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-6 px-4" style={{ backgroundColor: color }}>
        <div className="max-w-lg mx-auto">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Panel de turnos</p>
          <h1 className="text-xl font-black">{data?.company_name}</h1>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-2xl font-black">{todayAppts.length}</p>
              <p className="text-white/70 text-xs">Hoy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">{upcomingAppts.length}</p>
              <p className="text-white/70 text-xs">Próximos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">{appts.filter(a => a.status === 'confirmed').length}</p>
              <p className="text-white/70 text-xs">Total activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-4">
          {[
            { key: 'hoy',      label: `Hoy (${todayAppts.length})` },
            { key: 'proximos', label: `Próximos (${upcomingAppts.length})` },
            { key: 'todos',    label: 'Todos' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                tab === t.key ? 'text-white' : 'text-gray-500'
              }`}
              style={tab === t.key ? { backgroundColor: color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Cargando...</p>
        ) : visibleAppts.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">No hay turnos en esta sección.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAppts.map(appt => {
              const s = STATUS_MAP[appt.status] || { label: appt.status, bg: 'bg-gray-100', text: 'text-gray-600' }
              const isToday = appt.appointment_date === today
              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-xl border p-4 ${isToday && appt.status === 'confirmed' ? 'border-purple-200 shadow-sm' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-gray-900">{appt.customer_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                        {isToday && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Hoy</span>}
                      </div>
                      <p className="text-sm text-gray-700 font-medium">{appt.service_name}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color }}>
                        📅 {formatDate(appt.appointment_date)} · ⏰ {appt.appointment_time}
                      </p>
                      {appt.customer_phone && (
                        <a
                          href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-green-600 mt-1 inline-flex items-center gap-1"
                        >
                          💬 {appt.customer_phone}
                        </a>
                      )}
                      {appt.customer_notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">&ldquo;{appt.customer_notes}&rdquo;</p>
                      )}
                    </div>

                    {appt.status === 'confirmed' && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => updateStatus(appt.id, 'completed')}
                          disabled={updatingId === appt.id}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50"
                        >
                          ✓ Completar
                        </button>
                        <button
                          onClick={() => updateStatus(appt.id, 'cancelled')}
                          disabled={updatingId === appt.id}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 disabled:opacity-50"
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
