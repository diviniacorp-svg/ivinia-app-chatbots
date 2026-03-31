'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, ExternalLink, Copy, Check, Bot, Smile, X } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

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
  const [displayColor, setDisplayColor] = useState('#6366f1')
  const [introEmoji, setIntroEmoji] = useState('📅')
  const [introTagline, setIntroTagline] = useState('')
  const [introStyle, setIntroStyle] = useState('bubbles')
  const [instagram, setInstagram] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showEmojiPicker) return
    function handleClick(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showEmojiPicker])

  function addEmoji(emojiData: { emoji: string }) {
    const current = introEmoji.split(',').map(e => e.trim()).filter(Boolean)
    if (current.length >= 3) return
    if (current.includes(emojiData.emoji)) return
    const next = [...current, emojiData.emoji]
    setIntroEmoji(next.join(','))
  }

  function removeEmoji(emoji: string) {
    const next = introEmoji.split(',').map(e => e.trim()).filter(e => e && e !== emoji)
    setIntroEmoji(next.join(','))
  }

  const emojiList = introEmoji.split(',').map(e => e.trim()).filter(Boolean)

  const loadConfig = useCallback(async (cId: string) => {
    const [cfgRes, clientRes] = await Promise.all([
      fetch(`/api/bookings/${cId}/config`),
      fetch(`/api/clients/${cId}`),
    ])
    if (cfgRes.ok) {
      const data = await cfgRes.json()
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
    if (clientRes.ok) {
      const data = await clientRes.json()
      const cfg = (data.client?.custom_config || {}) as Record<string, string>
      setDisplayColor(cfg.color || '#6366f1')
      setIntroEmoji(cfg.intro_emoji || '📅')
      setIntroTagline(cfg.intro_tagline || '')
      setIntroStyle(cfg.intro_style || 'bubbles')
      setInstagram(cfg.instagram || '')
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
      const [cfgRes] = await Promise.all([
        fetch(`/api/bookings/${effectiveClientId}/config`, {
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
        }),
        fetch(`/api/clients/${effectiveClientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color: displayColor,
            intro_emoji: introEmoji,
            intro_tagline: introTagline,
            intro_style: introStyle,
            instagram: instagram,
            whatsapp: ownerPhone,
          }),
        }),
      ])
      const data = await cfgRes.json()
      if (!cfgRes.ok) throw new Error(data.error || 'Error al guardar')
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

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function copyAll() {
    if (!configId) return
    const origin = window.location.origin
    const pin = ownerPin || '1234'
    const msg =
      `¡Hola! Acá están los links de tu sistema de turnos 🎉\n\n` +
      `📅 *Link para que tus clientes reserven:*\n${origin}/reservas/${configId}\n\n` +
      `⚙️ *Tu panel de administración:*\n${origin}/panel/${configId}\n\n` +
      `🔑 PIN de acceso: ${pin}\n\n` +
      `Guardá estos links, son tuyos para siempre.`
    copyText(msg, 'all')
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

      {/* Panel de entrega — dos links listos para mandar al cliente */}
      {configId && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-600 text-lg">✅</span>
            <p className="font-bold text-green-800 text-sm">Sistema listo — enviá estos links al cliente</p>
          </div>

          {/* Link de reservas */}
          <div className="bg-white border border-green-100 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">📅 Link para que sus clientes reserven</p>
            <p className="text-sm text-gray-800 font-mono break-all mb-2">
              {typeof window !== 'undefined' ? `${window.location.origin}/reservas/${configId}` : `/reservas/${configId}`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => copyText(`${window.location.origin}/reservas/${configId}`, 'public')}
                className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium"
              >
                {copied === 'public' ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
              </button>
              <a href={`/reservas/${configId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium">
                <ExternalLink size={11} /> Ver
              </a>
            </div>
          </div>

          {/* Link del panel */}
          <div className="bg-white border border-green-100 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">⚙️ Panel del dueño (admin)</p>
            <p className="text-sm text-gray-800 font-mono break-all mb-1">
              {typeof window !== 'undefined' ? `${window.location.origin}/panel/${configId}` : `/panel/${configId}`}
            </p>
            <p className="text-xs text-gray-400 mb-2">🔑 PIN de acceso: <span className="font-mono font-bold text-gray-700">{ownerPin || '1234'}</span></p>
            <div className="flex gap-2">
              <button
                onClick={() => copyText(`${window.location.origin}/panel/${configId}`, 'panel')}
                className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium"
              >
                {copied === 'panel' ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
              </button>
              <a href={`/panel/${configId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium">
                <ExternalLink size={11} /> Ver panel
              </a>
            </div>
          </div>

          {/* Copiar todo de una */}
          <button
            onClick={copyAll}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            {copied === 'all' ? <><Check size={14} /> ¡Copiado! Pegalo en WhatsApp</> : <><Copy size={14} /> Copiar todo para enviar por WhatsApp</>}
          </button>
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
      </div>

      {/* Apariencia e intro animada */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-1">Apariencia e intro animada</h2>
        <p className="text-xs text-gray-400 mb-4">Cómo se ve la página pública de reservas para los clientes del negocio.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                Color del negocio
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={displayColor}
                  onChange={e => setDisplayColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={displayColor}
                  onChange={e => setDisplayColor(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200 font-mono"
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                Instagram (sin @)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value.replace('@', ''))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="facoiffeur"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Emojis de la intro
            </label>
            <div className="relative" ref={emojiPickerRef}>
              <div className="flex flex-wrap items-center gap-2 min-h-[42px] border border-gray-200 rounded-lg px-3 py-2 bg-white">
                {emojiList.map(e => (
                  <span
                    key={e}
                    className="flex items-center gap-1 bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5 text-lg"
                  >
                    {e}
                    <button
                      type="button"
                      onClick={() => removeEmoji(e)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  title={emojiList.length >= 3 ? 'Eliminá uno para agregar otro' : 'Agregar emoji'}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors text-xl ${
                    showEmojiPicker
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-200'
                  }`}
                >
                  😊
                </button>
              </div>
              {showEmojiPicker && (
                <div className="absolute z-50 top-full mt-1 left-0 shadow-xl rounded-xl overflow-hidden">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      addEmoji(emojiData)
                      if (emojiList.length + 1 >= 3) setShowEmojiPicker(false)
                    }}
                    searchPlaceholder="Buscar emoji..."
                    height={380}
                    width={320}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Hasta 3 emojis. Aparecen flotando en la pantalla de bienvenida.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Tagline / slogan de bienvenida
            </label>
            <input
              type="text"
              value={introTagline}
              onChange={e => setIntroTagline(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="Reservá tu turno online"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Estilo de la animación
            </label>
            <select
              value={introStyle}
              onChange={e => setIntroStyle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-200 bg-white"
            >
              <option value="bubbles">Burbujas flotantes (los emojis suben)</option>
              <option value="sparkles">Destellos (emojis + brillos)</option>
              <option value="petals">Pétalos (emojis flotantes suaves)</option>
            </select>
          </div>
          {/* Preview del color */}
          <div className="rounded-xl p-3 text-white text-sm font-semibold text-center" style={{ backgroundColor: displayColor }}>
            Vista previa: {selectedClient?.company_name || 'Nombre del negocio'} — {introEmoji}
          </div>
        </div>
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
