import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

export async function sendOutreachEmail(params: {
  to: string
  subject: string
  body: string
  fromName?: string
}): Promise<{ id: string }> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'ventas@divinia.ar'
  const fromName = params.fromName || 'Joaco de DIVINIA'

  const htmlBody = params.body
    .split('\n')
    .map(line => line.trim() ? `<p style="margin: 0 0 12px 0; color: #333; font-size: 15px; line-height: 1.6;">${line}</p>` : '')
    .join('')

  const { data, error } = await getResend().emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: [params.to],
    subject: params.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">DIVINIA</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 13px;">Automatización con IA para empresas</p>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
          ${htmlBody}
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
            <a href="https://wa.me/549XXXXXXXXX?text=Hola%20Joaco%2C%20recib%C3%AD%20tu%20email%20y%20me%20interesa%20saber%20m%C3%A1s"
               style="background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              💬 Escribime por WhatsApp
            </a>
          </div>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; text-align: center;">
          DIVINIA · San Luis, Argentina ·
          <a href="mailto:${fromEmail}" style="color: #9ca3af;">Cancelar suscripción</a>
        </p>
      </body>
      </html>
    `,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  return { id: data!.id }
}
