import { NextRequest, NextResponse } from 'next/server'

const ADMIN_ROUTES = [
  '/dashboard',
  '/leads',
  '/crm',
  '/clientes',
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
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas del dashboard
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
    // rutas exactas sin slash final
    '/api/seed',
    '/api/clients',
    '/api/leads',
    '/api/apify',
    '/api/outreach',
    '/api/mercadopago/create-preference',
    '/api/templates',
    '/api/bookings/appointments',
  ],
}
