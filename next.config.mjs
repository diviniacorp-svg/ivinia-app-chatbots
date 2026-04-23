/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

// Headers para rutas embeddables (sin X-Frame-Options DENY)
const embeddableHeaders = securityHeaders
  .filter(h => h.key !== 'X-Frame-Options')
  .concat([{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }])

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['apify-client', 'proxy-agent', 'got-scraping'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      // Rutas embeddables en el iframe de demo — SAMEORIGIN en lugar de DENY
      {
        source: '/reservas/:path*',
        headers: embeddableHeaders,
      },
      {
        source: '/panel/:path*',
        headers: embeddableHeaders,
      },
      // Todo lo demás: DENY
      {
        source: '/((?!reservas|panel).*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
