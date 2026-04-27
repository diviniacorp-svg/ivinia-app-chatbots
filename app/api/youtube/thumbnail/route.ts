import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Genera el prompt optimizado para el thumbnail con Haiku
async function buildThumbnailPrompt(params: {
  titulo: string
  tema: string
  estilo?: string
}): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Generate a Freepik Mystic image prompt for a YouTube thumbnail.
Title: "${params.titulo}"
Topic: "${params.tema}"
Style hint: ${params.estilo || 'professional tech business'}

Rules:
- Dark background (#09090B near-black)
- Bright violet/purple accent (#8B5CF6)
- NO text in the image (text added in post)
- Cinematic 16:9 horizontal
- Professional, modern, aspirational
- Max 80 words
- Return ONLY the prompt, nothing else`,
    }],
  })
  return msg.content[0].type === 'text' ? msg.content[0].text.trim() : params.titulo
}

// Llama a Freepik Mystic para generar la imagen
async function generateWithFreepik(prompt: string): Promise<{ url: string; job_id: string } | null> {
  const apiKey = process.env.FREEPIK_API_KEY
  if (!apiKey) return null

  try {
    // Iniciar generación
    const createRes = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
      method: 'POST',
      headers: {
        'X-Freepik-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: 'text, watermark, blurry, distorted, oversaturated, amateur',
        guidance_scale: 7,
        num_images: 1,
        image: { size: '16_9' },
        styling: { style: 'photo' },
      }),
    })

    if (!createRes.ok) return null
    const createData = await createRes.json()
    const jobId = createData.data?.task_id || createData.task_id

    if (!jobId) return null

    // Polling: hasta 30s
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const pollRes = await fetch(`https://api.freepik.com/v1/ai/text-to-image/${jobId}`, {
        headers: { 'X-Freepik-API-Key': apiKey },
      })
      if (!pollRes.ok) continue
      const pollData = await pollRes.json()
      const status = pollData.data?.status || pollData.status

      if (status === 'DONE' || status === 'completed') {
        const imgUrl = pollData.data?.generated?.[0]?.url
          || pollData.data?.[0]?.url
          || pollData.generated?.[0]?.url
        if (imgUrl) return { url: imgUrl, job_id: jobId }
      }
      if (status === 'FAILED' || status === 'failed') break
    }
  } catch (e) {
    console.error('[thumbnail freepik]', e)
  }
  return null
}

// POST /api/youtube/thumbnail
export async function POST(req: NextRequest) {
  try {
    const { titulo, tema, estilo, prompt: customPrompt } = await req.json()

    if (!titulo && !customPrompt) {
      return NextResponse.json({ error: 'titulo o prompt requerido' }, { status: 400 })
    }

    // Generar o usar prompt
    const prompt = customPrompt || await buildThumbnailPrompt({ titulo, tema: tema || titulo, estilo })

    // Intentar con Freepik
    if (process.env.FREEPIK_API_KEY) {
      const result = await generateWithFreepik(prompt)
      if (result) {
        return NextResponse.json({ ok: true, url: result.url, job_id: result.job_id, prompt, source: 'freepik' })
      }
    }

    // Fallback: devolver solo el prompt para usar manualmente
    return NextResponse.json({
      ok: true,
      url: null,
      prompt,
      source: 'prompt_only',
      note: 'FREEPIK_API_KEY no configurada o generación falló. Usá el prompt en Freepik manualmente.',
    })
  } catch (err) {
    console.error('[youtube/thumbnail]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
