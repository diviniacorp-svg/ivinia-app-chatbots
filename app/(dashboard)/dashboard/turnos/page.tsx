'use client'

import { useState, useEffect } from 'react'

type Appointment = {
  id: string
  client_id: string
  service_name: string
  service_duration_minutes: number
  service_price_ars: number
  appointment_date: string
  appointment_time: string
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_notes: string
  status: string
  created_at: string
  clients?: { company_name: string }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
  no_show: { label: 'No vino', color: 'bg-gray-100 text-gray-600' },
}

export default function TurnosDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('confirmed')

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  async function fetchAppointments() {
    setLoading(true)
    const res = await fetch(`/api/bookings/appointments${filter !== 'all' ? `?status=${filter}` : ''}`)
    const data = await res.json()
    setAppointments(data.appointments || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchAppointments()
  }

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)
  const upcomingAppts = appointments.filter(a => a.appointment_date > today)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
          <p className="text-gray-500 text-sm mt-1">Todos los turnos de tus clientes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{todayAppts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Próximos</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{upcomingAppts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[['confirmed', 'Confirmados'], ['completed', 'Completados'], ['cancelled', 'Cancelados'], ['all', 'Todos']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-gray-400 text-center py-12">Cargando...</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hay turnos</div>
      ) : (
        <div className="space-y-3">
          {appointments.map(appt => {
            const statusInfo = STATUS_LABELS[appt.status] || { label: appt.status, color: 'bg-gray-100 text-gray-600' }
            return (
              <div key={appt.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{appt.customer_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{appt.service_name} · {appt.service_duration_minutes} min</p>
                    <p className="text-sm font-medium text-indigo-600 mt-0.5">
                      📅 {appt.appointment_date.split('-').reverse().join('/')} · ⏰ {appt.appointment_time}
                    </p>
                    {appt.clients?.company_name && (
                      <p className="text-xs text-gray-400 mt-0.5">Cliente: {appt.clients.company_name}</p>
                    )}
                    {appt.customer_phone && (
                      <a
                        href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 mt-1 inline-block"
                      >
                        📱 {appt.customer_phone}
                      </a>
                    )}
                    {appt.customer_notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">"{appt.customer_notes}"</p>
                    )}
                  </div>
                  {appt.status === 'confirmed' && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateStatus(appt.id, 'completed')}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => updateStatus(appt.id, 'cancelled')}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"
                      >
                        Cancelar
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
  )
}
