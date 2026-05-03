import type { Metadata } from 'next'
import './globals.css'

const APP_URL = 'https://divinia.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'DIVINIA — Automatizamos tu PYME con IA · San Luis',
    template: '%s · DIVINIA',
  },
  description: 'Sistema de turnos online, chatbot WhatsApp y agentes IA para PYMEs argentinas. En 48hs tu negocio acepta reservas solo. Desde $45.000/mes.',
  keywords: [
    'sistema de turnos online Argentina',
    'turnero peluquería San Luis',
    'chatbot WhatsApp PYME',
    'automatización IA negocio',
    'agenda online gratis Argentina',
    'turnos online clínica',
    'DIVINIA IA San Luis',
  ],
  authors: [{ name: 'DIVINIA', url: APP_URL }],
  creator: 'DIVINIA',
  publisher: 'DIVINIA',
  alternates: { canonical: APP_URL },
  openGraph: {
    title: 'DIVINIA — Tu PYME en piloto automático con IA',
    description: 'Turnero online + chatbot 24hs + contenido IA. Desde $45.000/mes. Setup en 48hs o no cobrás.',
    type: 'website',
    url: APP_URL,
    siteName: 'DIVINIA',
    locale: 'es_AR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DIVINIA — Automatización IA para PYMEs argentinas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DIVINIA — Tu PYME en piloto automático',
    description: 'Turnero + chatbot + contenido IA. $45k/mes. Setup 48hs.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
