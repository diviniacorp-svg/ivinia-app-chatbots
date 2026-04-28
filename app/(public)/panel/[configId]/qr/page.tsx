import { redirect } from 'next/navigation'

// El QR siempre apunta al link de reservas (no al panel privado)
// Redirige al QR del mismo configId en /reservas/[id]/qr
export default function PanelQRRedirect({ params }: { params: { configId: string } }) {
  redirect(`/reservas/${params.configId}/qr`)
}
