import type { Metadata } from 'next'
import TiendaClient from './_components/TiendaClient'

export const metadata: Metadata = {
  title: { absolute: 'Tienda · CeluLab' },
  description: 'Accesorios, cargadores, auriculares, smartwatches y más. Stock mayorista Only San Luis.',
}

export const dynamic = 'force-dynamic'

export default function TiendaPage() {
  return <TiendaClient />
}