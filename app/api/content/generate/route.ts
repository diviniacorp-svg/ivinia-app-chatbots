import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { tipo, plataforma, brief } = await req.json()

  if (!brief || brief.trim().length < 5) {
    return NextResponse.json({ error: 'Brief muy corto' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const systemPrompt = `Sos un experto en marketing digital para PYMEs argentinas.
Creás contenido para DIVINIA, una empresa de IA y automatizaciones de San Luis, Argentina.
Tu tono es directo, sin humo, con ejemplos concretos. Usás lenguaje argentino (vos, sos, tenés).
Siempre incluís un hook potente al inicio y un CTA claro al final.`

  const userPrompt = `Creá un ${tipo} para ${plataforma} sobre este tema: "${brief}"

Formato de respuesta:
- Para Instagram/TikTok: hook (primera línea que para el scroll) + desarrollo (2-3 párrafos cortos) + CTA + hashtags (5-8 relevantes)
- Para LinkedIn: título + 3 puntos clave + CTA profesional
- Para Email: asunto (max 50 chars) + preview text + cuerpo (300-400 palabras)
- Para Blog: título SEO + intro + 3 secciones con subtítulos + conclusión

Sé específico, usá números y ejemplos reales cuando sea posible.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({ content })
}
