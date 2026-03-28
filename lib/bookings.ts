export type Service = {
  id: string
  name: string
  category?: string            // opcional — para agrupar servicios por categoría
  duration_minutes: number
  price_ars: number
  description: string
  deposit_percentage?: number  // 0-100 — si > 0, habilita pago de seña
}

export type DaySchedule = { open: string; close: string } | null

export type Schedule = {
  lun: DaySchedule
  mar: DaySchedule
  mie: DaySchedule
  jue: DaySchedule
  vie: DaySchedule
  sab: DaySchedule
  dom: DaySchedule
}

export type BookingConfig = {
  id: string
  client_id: string
  is_active: boolean
  slot_duration_minutes: number
  schedule: Schedule
  services: Service[]
  blocked_dates: string[]
  advance_booking_days: number
  owner_phone?: string   // WhatsApp del dueño del negocio (para notificaciones)
  owner_pin?: string     // PIN de 4 dígitos para acceder al panel del dueño
}

export type Appointment = {
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
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  created_at: string
}

const DAY_MAP: Record<number, keyof Schedule> = {
  0: 'dom', 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab'
}

// Convierte "09:30" a minutos desde medianoche
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

// Convierte minutos a "09:30"
function minutesToTime(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

// Genera todos los slots posibles para una fecha dado un config y servicio
export function getAvailableSlots(
  config: BookingConfig,
  date: string,        // YYYY-MM-DD
  serviceDurationMinutes: number,
  existingAppointments: { appointment_time: string; service_duration_minutes: number }[]
): string[] {
  // Verificar si la fecha está bloqueada
  if (config.blocked_dates.includes(date)) return []

  // Obtener día de semana
  const d = new Date(date + 'T12:00:00') // mediodía para evitar timezone issues
  const dayKey = DAY_MAP[d.getDay()]
  const daySchedule = config.schedule[dayKey]
  if (!daySchedule) return []

  const openMin = timeToMinutes(daySchedule.open)
  const closeMin = timeToMinutes(daySchedule.close)
  const slotStep = config.slot_duration_minutes

  // Generar todos los slots posibles
  const allSlots: string[] = []
  for (let t = openMin; t + serviceDurationMinutes <= closeMin; t += slotStep) {
    allSlots.push(minutesToTime(t))
  }

  // Filtrar slots que se solapan con turnos existentes
  return allSlots.filter(slot => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + serviceDurationMinutes

    return !existingAppointments.some(appt => {
      const apptStart = timeToMinutes(appt.appointment_time)
      const apptEnd = apptStart + appt.service_duration_minutes
      // Se solapan si uno empieza antes que el otro termine
      return slotStart < apptEnd && slotEnd > apptStart
    })
  })
}

// Genera los próximos N días disponibles
export function getNextAvailableDates(config: BookingConfig, daysAhead = 90): string[] {
  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]

    if (config.blocked_dates.includes(dateStr)) continue

    const dayKey = DAY_MAP[d.getDay()]
    if (config.schedule[dayKey]) {
      dates.push(dateStr)
    }
  }

  return dates
}

// Devuelve el primer mes con fechas disponibles { year, month } (0-indexed)
export function getFirstAvailableMonth(availableDates: string[]): { year: number; month: number } {
  if (!availableDates.length) {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth() }
  }
  const first = availableDates[0]
  const [y, m] = first.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export function formatDateAR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function formatPriceARS(amount: number): string {
  if (amount === 0) return 'Consultar'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0
  }).format(amount)
}
