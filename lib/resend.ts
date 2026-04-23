import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

export async function sendAuditLeadNotification(params: {
  company_name: string
  rubro: string
  city: string
  score: number
  resumen: string
  website?: string
  instagram?: string
  recomendaciones_top: string[]
}): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@divinia.ar'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const scoreColor = params.score >= 70 ? '#ef4444' : params.score >= 40 ? '#f59e0b' : '#6b7280'
  const urgencia = params.score >= 70 ? '🔴 CALIENTE' : params.score >= 40 ? '🟡 TIBIO' : '⚪ FRÍO'
  const waText = encodeURIComponent(`Hola! Vi que ${params.company_name} acaba de hacer su auditoría digital en DIVINIA y obtuvo un score de ${params.score}/100. ¿Tenés 10 minutos para que te cuente cómo mejorar eso?`)

  await getResend().emails.send({
    from: `DIVINIA Leads <${fromEmail}>`,
    to: ['diviniacorp@gmail.com'],
    subject: `${urgencia} Lead auditoría: ${params.company_name} (${params.score}/100)`,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
        <div style="background:#06060A;border-radius:16px 16px 0 0;padding:24px 28px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="color:#C6FF3D;font-weight:900;font-size:20px;letter-spacing:-0.04em">DIVINIA.</div>
            <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;font-family:monospace;letter-spacing:0.05em">NUEVO LEAD — AUDITORÍA DIGITAL</div>
          </div>
          <div style="background:${scoreColor};color:#fff;border-radius:50%;width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900">${params.score}</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 16px 16px">
          <h2 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111">${params.company_name}</h2>
          <p style="margin:0 0 20px;color:#6b7280;font-size:14px">${params.rubro} · ${params.city}${params.website ? ` · <a href="${params.website}" style="color:#6366f1">${params.website}</a>` : ''}${params.instagram ? ` · ${params.instagram}` : ''}</p>

          <div style="background:#f8fafc;border-left:4px solid ${scoreColor};padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:20px">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${params.resumen}</p>
          </div>

          ${params.recomendaciones_top.length > 0 ? `
          <div style="margin-bottom:24px">
            <p style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px">PRIORIDADES DETECTADAS</p>
            ${params.recomendaciones_top.map(r => `<div style="display:flex;gap:10px;margin-bottom:8px;font-size:14px;color:#374151"><span style="color:#ef4444;flex-shrink:0">→</span>${r}</div>`).join('')}
          </div>` : ''}

          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a href="https://wa.me/5492665286110?text=${waText}" style="background:#25D366;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">💬 Contactar ahora</a>
            <a href="${appUrl}/comercial" style="background:#06060A;color:#C6FF3D;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">Ver en CRM →</a>
          </div>
          <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">💡 Leads con score ≥ 70 convierten 3x más si los contactás en las primeras 2hs.</p>
        </div>
      </body></html>
    `,
  }).catch(e => console.error('[audit-notif]', e))
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

export async function sendTrialNotification(params: {
  company_name: string
  contact_name: string
  email: string
  phone: string
  rubro: string
  city: string
  chatbot_id: string
}): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'ventas@divinia.ar'
  const waText = encodeURIComponent(`Hola ${params.contact_name || params.company_name}! Vi que te registraste para probar el chatbot de DIVINIA. ¿Tenés 5 minutos para que lo activemos juntos?`)
  const waLink = `https://wa.me/5492665286110?text=${waText}`
  const panelLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'}/chatbots`

  const { error } = await getResend().emails.send({
    from: `DIVINIA Sistema <${fromEmail}>`,
    to: ['joacobaigorria6@gmail.com'],
    subject: `🔥 Nuevo trial: ${params.company_name}`,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 18px;">🔥 Nuevo trial registrado</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 130px;">Empresa</td><td style="padding: 8px 0; font-weight: 700; color: #111; font-size: 14px;">${params.company_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Contacto</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${params.contact_name || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${params.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Teléfono</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${params.phone || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Rubro</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${params.rubro || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Ciudad</td><td style="padding: 8px 0; color: #111; font-size: 14px;">${params.city || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Chatbot ID</td><td style="padding: 8px 0; color: #6366f1; font-size: 13px; font-family: monospace;">${params.chatbot_id}</td></tr>
          </table>
          <div style="margin-top: 20px; display: flex; gap: 12px;">
            <a href="${waLink}" style="background: #25D366; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; margin-right: 10px;">💬 Escribirle por WA</a>
            <a href="${panelLink}" style="background: #6366f1; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">📊 Ver en panel</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Este es un lead caliente — contactalo en las próximas 2hs para cerrar.</p>
        </div>
      </body></html>
    `,
  })

  if (error) console.error('Trial notification error:', error)
}

export async function sendBookingNotification(params: {
  company_name: string
  owner_email?: string | null
  customer_name: string
  customer_phone: string
  service_names: string
  date: string
  time: string
  price?: number
  client_id: string
}): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'ventas@divinia.ar'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const dateObj = new Date(params.date + 'T12:00:00')
  const dateStr = dateObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const waLink = params.customer_phone
    ? `https://wa.me/${params.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${params.customer_name}! Confirmo tu turno de ${params.service_names} el ${dateStr} a las ${params.time}hs en ${params.company_name}. ¡Nos vemos!`)}`
    : null

  const recipients = ['diviniacorp@gmail.com']
  if (params.owner_email && params.owner_email !== 'diviniacorp@gmail.com') {
    recipients.push(params.owner_email)
  }

  await getResend().emails.send({
    from: `DIVINIA Turnero <${fromEmail}>`,
    to: recipients,
    subject: `📅 Nuevo turno: ${params.customer_name} — ${params.service_names}`,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
        <div style="background:#06060A;border-radius:16px 16px 0 0;padding:20px 24px">
          <div style="color:#C6FF3D;font-weight:900;font-size:18px;letter-spacing:-0.03em">DIVINIA.</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:4px;font-family:monospace;letter-spacing:0.06em">NUEVO TURNO — ${params.company_name.toUpperCase()}</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 16px 16px">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.06em">Turno confirmado</p>
            <p style="margin:0;font-size:20px;font-weight:800;color:#111">${params.service_names}</p>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:110px">Cliente</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-weight:700;color:#111;font-size:14px">${params.customer_name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#111;font-size:14px">${params.customer_phone || '—'}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px">Fecha</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#111;font-size:14px;text-transform:capitalize">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Hora</td><td style="padding:8px 0;color:#111;font-size:14px;font-weight:700">${params.time}hs</td></tr>
            ${params.price ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Precio</td><td style="padding:8px 0;color:#111;font-size:14px">$${params.price.toLocaleString('es-AR')}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
            ${waLink ? `<a href="${waLink}" style="background:#25D366;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">💬 Confirmar por WA</a>` : ''}
            <a href="${appUrl}/dashboard/turnos" style="background:#06060A;color:#C6FF3D;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">Ver turnos →</a>
          </div>
        </div>
        <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:12px">DIVINIA Turnero · San Luis, Argentina</p>
      </body></html>
    `,
  }).catch(e => console.error('[booking-notif]', e))
}

export async function sendWelcomeEmail(params: {
  company_name: string
  contact_name: string
  email: string
  chatbot_id: string
  embed_code: string
  trial_end: string
}): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'ventas@divinia.ar'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const waLink = `https://wa.me/5492665286110?text=${encodeURIComponent(`Hola! Acabo de activar mi chatbot de DIVINIA para ${params.company_name}. Quiero que me ayuden a instalarlo.`)}`
  const trialEndDate = new Date(params.trial_end).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })

  const { error } = await getResend().emails.send({
    from: `Joaco de DIVINIA <${fromEmail}>`,
    to: [params.email],
    subject: `¡Tu chatbot está listo, ${params.contact_name || params.company_name}! 🤖`,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">🤖 Tu chatbot está activo</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0 0; font-size: 14px;">DIVINIA · Automatización con IA</p>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Hola <strong>${params.contact_name || params.company_name}</strong>,</p>
          <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">Tu chatbot para <strong>${params.company_name}</strong> ya está creado y listo para atender a tus clientes. Tenés <strong>14 días gratis</strong> hasta el <strong>${trialEndDate}</strong>.</p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Próximos pasos</p>
            <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
              <li>Escribime por WhatsApp para que instalemos el chatbot en tu web</li>
              <li>Probamos juntos que responda bien a tus consultas más frecuentes</li>
              <li>Lo dejamos funcionando y vos ves los resultados en vivo</li>
            </ol>
          </div>

          <a href="${waLink}" style="background: #25D366; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; margin-bottom: 24px;">💬 Escribime para instalarlo ahora</a>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <p style="color: #64748b; font-size: 12px; font-weight: 600; margin: 0 0 6px;">Tu código de instalación (para uso técnico):</p>
            <code style="color: #6366f1; font-size: 11px; word-break: break-all;">${params.embed_code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin: 0;">Cualquier duda respondé este email o escribime al WhatsApp. Estoy en San Luis y respondo rápido.</p>
          <p style="color: #374151; font-size: 14px; margin: 12px 0 0;"><strong>Joaco</strong> · DIVINIA</p>
        </div>
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">DIVINIA · San Luis, Argentina · <a href="${appUrl}" style="color: #9ca3af;">divinia.vercel.app</a></p>
      </body></html>
    `,
  })

  if (error) console.error('Welcome email error:', error)
}
