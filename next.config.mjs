/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita que webpack bundlee paquetes con dependencias nativas (Apify, proxy-agent)
  serverExternalPackages: ['apify-client', 'proxy-agent', 'got-scraping'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
