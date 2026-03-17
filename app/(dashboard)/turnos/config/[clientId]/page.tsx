'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, ExternalLink, Copy, Check, Bot } from 'lucide-react'
import Link from 'next/link'

const DIAS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
]

interface Service {
  id: string
  name: string
  duration_minutes: number
  price_ars: number
}

interface Schedule {
  [day: string]: { open: string; close: string } | null
}

interface ClientOption {
  id: string
  company_name: string
  contact_name: string
  email: string
  chatbot_id: string | null
  status: string
}

export default function TurnosConfigPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string
  const isNew = clientId === 'nuevo'

  const [clients, setClients] = useState<ClientOption[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [configId, setConfigId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([
    { id: crypto.randomUUID(), name: '', duration_minutes: 30, price_ars: 0 },
  ])
  const [schedule, setSchedule] = useState<Schedule>({
    lun: { open: '09:00', close: '18:00' },
    mar: { open: '09:00', close: '18:00' },
    mie: { open: '09:00', close: '18:00' },
    jue: { open: '09:00', close: '18:00' },
    vie: { open: '09:00', close: '18:00' },
    sab: null,
    dom: null,
  })
  const [slotDuration, setSlotDuration] = useState(30)
  const [advanceDays, setAdvanceDays] = useState(30)
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerPin, setOwnerPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadConfig = useCallback(async (cId: string) => {
    const res = await fetch(`/api/bookings/${cId}/config`)
    if (res.ok) {
      const data = await res.json()
      if (data.config) {
        setConfigId(data.config.id)
        setServices(data.config.services?.length ? data.config.services : [{ id: crypto.randomUUID(), name: '', duration_minutes: 30, price_ars: 0 }])
        setSchedule(data.config.schedule || {})
        setSlotDuration(data.config.slot_duration_minutes || 30)
        setAdvanceDays(data.config.advance_booking_days || 30)
        setOwnerPhone(data.config.owner_phone || '')
        setOwnerPin(data.config.owner_pin || '')
      }
    }
  }, [])

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []))
    if (!isNew) {
      loadConfig(clientId)
    }
  }, [clientId, isNew, loadConfig])

  useEffect(() => {
    if (selectedClientId && isNew) {
      loadConfig(selectedClientId)
    }
  }, [selectedClientId, isNew, loadConfig])

  const effectiveClientId = isNew ? selectedClientId : clientId
  const selectedClient = clients.find(c => c.id === effectiveClientId)

  function addService() {
    setServices(prev => [...prev, { id: crypto.randomUUID(), name: '', duration_minutes: 30, price_ars: 0 }])
  }

  function removeService(id: string) {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  function updateService(id: string, field: keyof Service, value: string | number) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function toggleDay(day: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day] ? null : { open: '09:00', close: '18:00' },
    }))
  }

  function updateSchedule(day: string, field: 'open' | 'close', value: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day] ? { ...prev[day]!, [field]: value } : { open: '09:00', close: '18:00', [field]: value },
    }))
  }

  async function save() {
    if (!effectiveClientId) {
      setError('Seleccioná un cliente')
      return
    }
    const validServices = services.filter(s => s.name.trim())
    if (validServices.length === 0) {
      setError('Agregá al menos un servicio')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${effectiveClientId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: validServices,
          schedule,
          slot_duration_minutes: slotDuration,
          advance_booking_days: advanceDays,
          owner_phone: ownerPhone,
          owner_pin: ownerPin || '1234',
          is_active: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setConfigId(data.config?.id || null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (isNew) router.replace(`/turnos/config/${effectiveClientId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function copyPublicLink() {
    if (!configId) return
    navigator.clipboard.writeText(`${window.location.origin}/reservas/${configId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/turnos" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">
            {isNew ? 'Nuevo cliente de turnos' : `Configurar turnos`}
          </h1>
          {selectedClient && (
            <p className="text-sm text-gray-500">{selectedClient.company_name}</p>
          )}
        </div>
      </div>

      {/* Seleccionar cliente (solo en modo nuevo) */}
      {isNew && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">¿Para qué cliente?</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                Seleccionar cliente existente
              </label>
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200 bg-white"
              >
                <option value="">— Buscar cliente —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} {c.chatbot_id ? '🤖' : ''} — {c.contact_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">🤖 = ya tiene chatbot activo</p>
            </div>
            {selectedClient && (
              <div className="bg-purple-50 rounded-lg p-3 flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900">{selectedClient.company_name}</p>
                  <p className="text-xs text-purple-600">{selectedClient.email}</p>
                  {selectedClient.chatbot_id && (
                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mt-1">
                      <Bot size={10} /> Chatbot vinculado
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link público (si ya tiene config) */}
      {configId && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-0.5">Link público de turnos</p>
            <p className="text-sm text-purple-900 font-mono break-all">{typeof window !== 'undefined' ? `${window.location.origin}/reservas/${configId}` : `/reservas/${configId}`}</p>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <button onClick={copyPublicLink} className="flex items-center gap-1 text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium">
              {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
            </button>
            <a href={`/reservas/${configId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium">
              <ExternalLink size={11} /> Ver página
            </a>
          </div>
        </div>
      )}

      {/* Servicios */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Servicios</h2>
          <button onClick={addService} className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium">
            <Plus size={13} /> Agregar
          </button>
        </div>
        <div className="space-y-3">
          {services.map((service, i) => (
            <div key={service.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                {i === 0 && <label className="block text-xs text-gray-400 mb-1">Nombre</label>}
                <input
                  type="text"
                  value={service.name}
                  onChange={e => updateService(service.id, 'name', e.target.value)}
                  placeholder="Ej: Corte de pelo"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div className="col-span-3">
                {i === 0 && <label className="block text-xs text-gray-400 mb-1">Duración (min)</label>}
                <input
                  type="number"
                  value={service.duration_minutes}
                  onChange={e => updateService(service.id, 'duration_minutes', parseInt(e.target.value) || 30)}
                  min={15}
                  step={15}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div className="col-span-3">
                {i === 0 && <label className="block text-xs text-gray-400 mb-1">Precio ($)</label>}
                <input
                  type="number"
                  value={service.price_ars}
                  onChange={e => updateService(service.id, 'price_ars', parseInt(e.target.value) || 0)}
                  min={0}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div className="col-span-1 flex items-end pb-0.5">
                {i === 0 && <div className="h-5" />}
                <button
                  onClick={() => removeService(service.id)}
                  disabled={services.length === 1}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Horarios de atención</h2>
        <div className="space-y-2.5">
          {DIAS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <button
                onClick={() => toggleDay(key)}
                className={`w-24 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  schedule[key]
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
              {schedule[key] ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={schedule[key]!.open}
                    onChange={e => updateSchedule(key, 'open', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <span className="text-gray-400 text-sm">a</span>
                  <input
                    type="time"
                    value={schedule[key]!.close}
                    onChange={e => updateSchedule(key, 'close', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400">Cerrado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configuración extra */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Configuración adicional</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Duración base del slot (min)
            </label>
            <select
              value={slotDuration}
              onChange={e => setSlotDuration(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200 bg-white"
            >
              {[15, 20, 30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d}>{d} minutos</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Reservar con anticipación (días)
            </label>
            <input
              type="number"
              value={advanceDays}
              onChange={e => setAdvanceDays(parseInt(e.target.value) || 30)}
              min={1}
              max={120}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </div>
      </div>

      {/* Acceso del dueño */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-1">Panel del dueño del negocio</h2>
        <p className="text-xs text-gray-400 mb-4">Con esto el cliente puede ver y gestionar sus propios turnos sin necesitar tu clave.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              WhatsApp del dueño
            </label>
            <input
              type="tel"
              value={ownerPhone}
              onChange={e => setOwnerPhone(e.target.value)}
              placeholder="5492665286110"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200"
            />
            <p className="text-xs text-gray-400 mt-1">Sin + ni espacios. Ej: 5492665000000</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              PIN de acceso (4 dígitos)
            </label>
            <input
              type="text"
              value={ownerPin}
              onChange={e => setOwnerPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200 font-mono tracking-widest"
            />
          </div>
        </div>
        {configId && ownerPhone && (
          <div className="mt-3 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs font-semibold text-purple-700 mb-1">Link del panel del dueño:</p>
            <p className="text-xs text-purple-900 font-mono break-all">{typeof window !== 'undefined' ? `${window.location.origin}/panel/${configId}` : `/panel/${configId}`}</p>
            <p className="text-xs text-purple-500 mt-1">PIN: <span className="font-mono font-bold">{ownerPin || '1234'}</span> — Mandárselo al cliente para que entre a su panel.</p>
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <button
        onClick={save}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
      >
        {loading ? 'Guardando...' : saved ? <><Check size={16} /> Guardado!</> : <><Save size={16} /> Guardar configuración</>}
      </button>
    </div>
  )
}
