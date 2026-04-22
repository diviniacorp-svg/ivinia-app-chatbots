import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const { tema, estructura } = await req.json()
    if (!tema) return NextResponse.json({ error: 'Falta el tema' }, { status: 400 })

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Sos un guionista experto en YouTube para PYMEs argentinas.
Escribí un guión completo para un video de YouTube sobre: "${tema}"

Usá esta estructura como base:
${estructura}

El tono es cercano, práctico y directo. Hablás de vos a vos con el dueño de la PYME.
Usás ejemplos concretos de San Luis y Argentina. No usás gerundios innecesarios.
El guión debe durar entre 8 y 12 minutos de video.

Incluí:
- Texto completo para narrar (no solo bullets)
- Notas de pantalla/visual entre [corchetes]
- Timestamps aproximados
- Variantes del título para SEO (3 opciones)`,
      }],
    })

    const guion = msg.content[0].type === 'text' ? msg.content[0].text : ''
    return NextResponse.json({ ok: true, guion })
  } catch (err) {
    console.error('[youtube/guion]', err)
    return NextResponse.json({ error: 'Error generando guión' }, { status: 500 })
  }
}
