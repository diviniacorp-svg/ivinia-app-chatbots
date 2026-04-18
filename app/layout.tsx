import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DIVINIA — Automatizamos tu negocio con IA',
  description: 'Automatizamos las operaciones de tu PYME con inteligencia artificial. En 90 días o no cobros. San Luis, Argentina.',
  keywords: 'automatización IA Argentina, chatbot WhatsApp, agentes IA, San Luis, PYME',
  openGraph: {
    title: 'DIVINIA — Automatizamos tu negocio con IA',
    description: 'En 90 días automatizamos lo que te hace perder tiempo y plata. O no te cobramos.',
    type: 'website',
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
