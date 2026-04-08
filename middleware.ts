import { NextRequest, NextResponse } from 'next/server'

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
]

const PROTECTED_API_ROUTES = [
  '/api/seed',
  '/api/clients',
  '/api/leads',
  '/api/apify',
  '/api/outreach',
  '/api/mercadopago/create-preference',
  '/api/templates',
  '/api/bookings/appointments',
  '/api/bookings/configs',
  '/api/turnos/generar-landing',
  '/api/agents',
  '/api/instagram/pipeline',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const validSecret = process.env.ADMIN_SECRET
  if (!validSecret) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Servidor mal configurado' }, { status: 503 })
    }
  }
  const secret = validSecret || 'divinia2024'

  // Proteger rutas del dashboard
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  if (isAdminRoute) {
    const session = request.cookies.get('divinia_session')?.value
    if (session !== secret) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Proteger rutas API internas
  const isProtectedApi = PROTECTED_API_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  if (isProtectedApi) {
    const session = request.cookies.get('divinia_session')?.value
    const apiKey = request.headers.get('x-api-key')

    if (session !== secret && apiKey !== secret) {
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
    '/api/templates',
    '/api/templates/:path*',
    '/api/bookings/appointments',
    '/api/bookings/appointments/:path*',
    '/api/bookings/configs',
    '/api/bookings/configs/:path*',
    '/api/turnos/generar-landing',
    '/api/agents',
    '/api/agents/:path*',
    '/api/instagram/pipeline',
    '/api/instagram/pipeline/:path*',
  ],
}
