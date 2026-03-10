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
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas del dashboard (la página pública de reservas está en /reservas/[id], no en /turnos/)
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  if (isAdminRoute) {
    const session = request.cookies.get('divinia_session')?.value
    const validSecret = process.env.ADMIN_SECRET || 'divinia2024'
    if (session !== validSecret) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Proteger rutas API internas (excepto webhooks públicos)
  const isProtectedApi = PROTECTED_API_ROUTES.some(r => pathname.startsWith(r))
  if (isProtectedApi) {
    // Aceptar cookie de sesión (requests desde el dashboard) o header API key
    const session = request.cookies.get('divinia_session')?.value
    const apiKey = request.headers.get('x-api-key')
    const validSecret = process.env.ADMIN_SECRET || 'divinia2024'

    if (session !== validSecret && apiKey !== validSecret) {
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
    '/turnos/config/:path*',
    '/pagos/:path*',
    '/templates/:path*',
    '/outreach/:path*',
    '/api/seed/:path*',
    '/api/clients/:path*',
    '/api/leads/:path*',
    '/api/apify/:path*',
    '/api/outreach/:path*',
    '/api/mercadopago/create-preference/:path*',
    '/api/templates/:path*',
    '/api/bookings/appointments/:path*',
    '/api/bookings/configs/:path*',
    // rutas exactas sin slash final
    '/api/seed',
    '/api/clients',
    '/api/leads',
    '/api/apify',
    '/api/outreach',
    '/api/mercadopago/create-preference',
    '/api/templates',
    '/api/bookings/appointments',
    '/api/bookings/configs',
  ],
}
