import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DIVINIA - Chatbots con IA para tu negocio',
  description: 'Automatizá la atención al cliente de tu PYME con inteligencia artificial. Chatbots personalizados para restaurantes, clínicas, inmobiliarias y más. Probalo gratis 14 días.',
  keywords: 'chatbot IA Argentina, automatización WhatsApp, atención al cliente 24/7, San Luis',
  openGraph: {
    title: 'DIVINIA - Chatbots con IA para tu negocio',
    description: 'Automatizá la atención de tu negocio con IA. 14 días gratis.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  )
}
