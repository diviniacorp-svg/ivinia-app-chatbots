/**
 * Rate limiter distribuido para producción.
 * Usa Supabase como store — persiste entre cold starts e instancias múltiples.
 * Fallback en memoria para dev.
 */

import { createAdminClient } from '@/lib/supabase'

const memoryMap = new Map<string, { count: number; resetAt: number }>()

// Limpia entradas vencidas del mapa en memoria (evita memory leak en long-running)
let lastCleanup = Date.now()
function cleanMemoryMap() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  memoryMap.forEach((entry, key) => {
    if (now > entry.resetAt) memoryMap.delete(key)
  })
}

// Rate limit en memoria (dev / fallback)
function checkMemory(key: string, max: number, windowMs: number): boolean {
  cleanMemoryMap()
  const now = Date.now()
  const entry = memoryMap.get(key)
  if (!entry || now > entry.resetAt) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

// Rate limit via Supabase (producción — persiste entre instancias)
async function checkSupabase(key: string, max: number, windowMs: number): Promise<boolean> {
  const db = createAdminClient()
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)

  try {
    const { data, error } = await db.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window_ms: windowMs,
    })

    // Si la función RPC no existe aún, caer a memoria
    if (error) return checkMemory(key, max, windowMs)

    return data === true

  } catch {
    // Fallback en memoria si Supabase no responde
    return checkMemory(key, max, windowMs)
  }
}

/**
 * Comprueba si una key está dentro del rate limit.
 * En producción usa Supabase; en dev usa memoria.
 *
 * @param key    Identificador (ej: IP, userId)
 * @param max    Máximo de requests en la ventana
 * @param windowMs  Tamaño de la ventana en milisegundos (default: 60s)
 */
export async function checkRateLimit(
  key: string,
  max = 20,
  windowMs = 60_000
): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    return checkSupabase(key, max, windowMs)
  }
  return checkMemory(key, max, windowMs)
}
