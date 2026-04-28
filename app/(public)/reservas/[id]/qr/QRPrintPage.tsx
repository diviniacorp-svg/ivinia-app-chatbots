'use client'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  companyName: string
  rubro: string
  reservasUrl: string
  id: string
}

export default function QRPrintPage({ companyName, rubro, reservasUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(reservasUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#09090b', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(setQrDataUrl)
  }, [reservasUrl])

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { box-shadow: none !important; border: none !important; }
        }
        @page { size: A4; margin: 0; }
      `}</style>

      {/* Botones — solo en pantalla */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#09090b', borderBottom: '1px solid #27272a',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 900, fontSize: 16 }}>
          <span style={{ width: 8, height: 8, background: '#c6ff3d', borderRadius: '50%', display: 'inline-block' }} />
          DIVINIA · QR {companyName}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={reservasUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 13, padding: '8px 18px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Ver página de reservas
          </a>
          <button
            onClick={() => window.print()}
            style={{ background: '#c6ff3d', color: '#09090b', fontWeight: 800, fontSize: 13, padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Página imprimible */}
      <div style={{ minHeight: '100vh', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 40 }}>
        <div className="print-page" style={{
          width: 400, background: '#fff', borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          overflow: 'hidden', fontFamily: 'system-ui, sans-serif',
        }}>
          {/* Header negro */}
          <div style={{ background: '#09090b', padding: '28px 32px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, background: '#c6ff3d', borderRadius: '50%' }} />
              <span style={{ color: '#c6ff3d', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Sistema de turnos online
              </span>
            </div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 26, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {companyName}
            </div>
            {rubro && (
              <div style={{ color: '#71717a', fontSize: 13, marginTop: 4 }}>{rubro} · San Luis</div>
            )}
          </div>

          {/* QR */}
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: '#fff', border: '3px solid #09090b',
              borderRadius: 16, padding: 16, marginBottom: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR de reservas" width={240} height={240} style={{ display: 'block' }} />
              ) : (
                <canvas ref={canvasRef} width={240} height={240} />
              )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.3px', marginBottom: 4 }}>
                Reservá tu turno
              </div>
              <div style={{ color: '#71717a', fontSize: 13, lineHeight: 1.5 }}>
                Escaneá el código con la cámara<br />de tu celular
              </div>
            </div>

            {/* Features rápidos */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                '✓  Elegís el servicio y el horario que te queda cómodo',
                '✓  Recibís confirmación automática por WhatsApp',
                '✓  Te avisamos 24hs antes para que no te olvides',
                '✓  Sin llamadas · Sin mensajes · Sin espera',
              ].map(t => (
                <div key={t} style={{ fontSize: 12, color: '#52525b', padding: '6px 12px', background: '#f9fafb', borderRadius: 8 }}>{t}</div>
              ))}
            </div>

            {/* URL como texto */}
            <div style={{
              width: '100%', background: '#f4f4f5', borderRadius: 10,
              padding: '10px 14px', textAlign: 'center',
              fontFamily: 'monospace', fontSize: 11, color: '#52525b',
              wordBreak: 'break-all', letterSpacing: '-0.2px',
            }}>
              {reservasUrl}
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#09090b', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, background: '#c6ff3d', borderRadius: '50%' }} />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>DIVINIA</span>
            </div>
            <span style={{ color: '#52525b', fontSize: 11 }}>divinia.vercel.app</span>
          </div>
        </div>
      </div>
    </>
  )
}
