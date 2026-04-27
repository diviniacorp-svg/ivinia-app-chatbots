import { NextRequest, NextResponse } from 'next/server'

async function sessionToken(secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('divinia_session_v1'))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const ADMIN_ROUTES = [
  '/dashboard',
  '/leads',
  '/crm',
  '/clientes',
  '/chatbots',
  '/turnos',
  '/pagos',
  '/templates',
  '/outreach',
  '/agents',
  '/contenido',
  '/redes',
  '/calendario',
  '/orquestacion',
  '/finanzas',
  '/comercial',
  '/market',
  '/herramientas',
  '/avatares',
  '/dispatch',
  '/youtube',
  '/ideas',
  '/proyectos',
  '/publicidad',
]

// Exact match — /nucleo/[slug] es público, solo /nucleo exacto requiere auth
const ADMIN_EXACT_ROUTES = ['/nucleo']

// Rutas API públicas aunque su prefijo esté en PROTECTED_API_ROUTES
// Ej: /api/agents/audit es llamado desde la página pública /auditoria
const PUBLIC_API_EXCEPTIONS = [
  '/api/agents/audit',       // formulario público de auditoría
  '/api/agents/demo',        // demos públicas de agentes
]

// Para proposals: el GET de una propuesta específica es público (link compartido)
// El POST (crear) sigue siendo protegido
function isPublicProposalRead(pathname: string, method: string) {
  return method === 'GET' && /^\/api\/proposals\/[^/]+$/.test(pathname)
}

const PROTECTED_API_ROUTES = [
  '/api/seed',
  '/api/clients',
  '/api/leads',
  '/api/apify',
  '/api/outreach',
  '/api/mercadopago/create-preference',
  '/api/mercadopago/subscriptions',
  '/api/templates',
  '/api/bookings/appointments',
  '/api/bookings/configs',
  '/api/turnos/generar-landing',
  '/api/agents',
  '/api/chatbot/knowledge',
  '/api/instagram/pipeline',
  '/api/academy',
  '/api/agenda-joaco',
  '/api/ceo-metrics',
  '/api/content',
  '/api/sales',
  '/api/instagram',
  '/api/proposals',
  '/api/nucleo',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const validSecret = process.env.ADMIN_SECRET
  if (!validSecret) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Servidor mal configurado' }, { status: 503 })
    }
  }
  const secret = validSecret || 'DiViNiA2050'
  const token = await sessionToken(secret)

  const isAdminRoute =
    ADMIN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    ADMIN_EXACT_ROUTES.some(r => pathname === r)

  if (isAdminRoute) {
    const session = request.cookies.get('divinia_session')?.value
    if (session !== token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rutas API con excepción pública explícita
  const isPublicApiException =
    PUBLIC_API_EXCEPTIONS.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    isPublicProposalRead(pathname, request.method)
  if (isPublicApiException) return NextResponse.next()

  const isProtectedApi = PROTECTED_API_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  if (isProtectedApi) {
    const session = request.cookies.get('divinia_session')?.value
    const apiKey = request.headers.get('x-api-key')
    if (session !== token && apiKey !== secret) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/crm/:path*',
    '/clientes/:path*',
    '/chatbots/:path*',
    '/turnos',
    '/turnos/:path*',
    '/pagos/:path*',
    '/templates/:path*',
    '/outreach/:path*',
    '/agents',
    '/agents/:path*',
    '/contenido',
    '/contenido/:path*',
    '/redes',
    '/redes/:path*',
    '/calendario',
    '/calendario/:path*',
    '/orquestacion',
    '/orquestacion/:path*',
    '/finanzas',
    '/finanzas/:path*',
    '/comercial',
    '/comercial/:path*',
    '/market',
    '/market/:path*',
    '/herramientas',
    '/herramientas/:path*',
    '/avatares',
    '/avatares/:path*',
    '/dispatch',
    '/dispatch/:path*',
    '/youtube',
    '/youtube/:path*',
    '/ideas',
    '/ideas/:path*',
    '/proyectos',
    '/proyectos/:path*',
    '/publicidad',
    '/publicidad/:path*',
    '/nucleo',
    '/api/seed',
    '/api/seed/:path*',
    '/api/clients',
    '/api/clients/:path*',
    '/api/leads',
    '/api/leads/:path*',
    '/api/apify',
    '/api/apify/:path*',
    '/api/outreach',
    '/api/outreach/:path*',
    '/api/mercadopago/create-preference',
    '/api/mercadopago/create-preference/:path*',
    '/api/mercadopago/subscriptions',
    '/api/mercadopago/subscriptions/:path*',
    '/api/templates',
    '/api/templates/:path*',
    '/api/bookings/appointments',
    '/api/bookings/appointments/:path*',
    '/api/bookings/configs',
    '/api/bookings/configs/:path*',
    '/api/turnos/generar-landing',
    '/api/agents',
    '/api/agents/:path*',
    '/api/chatbot/knowledge',
    '/api/chatbot/knowledge/:path*',
    '/api/instagram/pipeline',
    '/api/instagram/pipeline/:path*',
    '/api/academy',
    '/api/academy/:path*',
    '/api/agenda-joaco',
    '/api/agenda-joaco/:path*',
    '/api/ceo-metrics',
    '/api/ceo-metrics/:path*',
    '/api/content',
    '/api/content/:path*',
    '/api/sales',
    '/api/sales/:path*',
    '/api/instagram',
    '/api/instagram/:path*',
    '/api/proposals',
    '/api/proposals/:path*',
    '/api/nucleo',
    '/api/nucleo/:path*',
  ],
}
