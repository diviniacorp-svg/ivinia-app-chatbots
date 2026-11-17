export type OrderTracking = { url: string; qr: string }

export function trackingUrl(origin: string, path: unknown): string {
  if (typeof path !== 'string' || !/^\/market\/celulab\/seguimiento\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(path)) {
    throw new Error('Enlace de seguimiento inválido')
  }
  return new URL(path, origin).href
}

export async function loadOrderTracking(orderId: string): Promise<OrderTracking> {
  const response = await fetch('/api/celulab/work-orders/' + encodeURIComponent(orderId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'share' }),
  })
  if (!response.ok) throw new Error('No se pudo preparar el seguimiento')
  const { path } = await response.json()
  const url = trackingUrl(window.location.origin, path)
  const { toDataURL } = await import('qrcode')
  return { url, qr: await toDataURL(url, { width: 240, margin: 4, errorCorrectionLevel: 'M' }) }
}

export function trackingPrintBlock(tracking: OrderTracking | null): string {
  if (!tracking) return '<p style="font-size:10px;color:#555;">No se pudo generar el seguimiento. Pedí el enlace a CeluLab.</p>'
  const { url, qr } = tracking
  return [
    '<div style="margin-top:8px;padding:8px 10px;background:#f0fdf4;border:1px solid #86efac;border-radius:7px;font-size:10px;color:#14532d;display:flex;align-items:center;gap:10px;break-inside:avoid;">',
    '<img src="' + qr + '" width="96" height="96" alt="QR de seguimiento" style="flex:none;">',
    '<div><strong>Seguí el estado de tu equipo</strong><br>Escaneá el QR o abrí el enlace.<br>',
    '<a style="word-break:break-all;color:#14532d;" href="' + url + '">' + url + '</a></div></div>',
  ].join('')
}

export async function openTrackingPrint(orderId: string, render: (tracking: OrderTracking | null) => string) {
  const popup = window.open('', '_blank')
  if (!popup) return
  popup.opener = null
  popup.document.body.textContent = 'Preparando el comprobante…'
  const tracking = await loadOrderTracking(orderId).catch(() => null)
  if (popup.closed) return
  popup.document.open()
  popup.document.write(render(tracking))
  popup.document.close()
}
