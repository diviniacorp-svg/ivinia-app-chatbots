import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech, listVoices, getUserInfo, cleanScriptForTTS } from '@/lib/elevenlabs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST /api/youtube/voz — sintetiza voz para un guión de YouTube
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { guion, voice_id, stability, similarity_boost } = body

    if (!guion || typeof guion !== 'string') {
      return NextResponse.json({ error: 'guion requerido' }, { status: 400 })
    }

    const cleanedText = cleanScriptForTTS(guion)
    if (cleanedText.length < 10) {
      return NextResponse.json({ error: 'El guión está vacío después de limpiar instrucciones' }, { status: 400 })
    }

    // ElevenLabs tiene límite de ~5000 chars por request en el plan free
    // Para guiones largos, avisamos pero lo intentamos igual
    const charCount = cleanedText.length
    if (charCount > 10000) {
      return NextResponse.json(
        { error: `Guión demasiado largo (${charCount} chars). Dividilo en secciones de máx 10.000 chars.` },
        { status: 400 }
      )
    }

    const audioBuffer = await synthesizeSpeech({
      text: cleanedText,
      voice_id,
      stability,
      similarity_boost,
    })

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="voz-${Date.now()}.mp3"`,
        'X-Char-Count': String(charCount),
      },
    })
  } catch (err) {
    console.error('[youtube/voz]', err)
    const msg = err instanceof Error ? err.message : 'Error generando voz'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/youtube/voz — voces disponibles + créditos
export async function GET() {
  try {
    const [voices, sub] = await Promise.allSettled([listVoices(), getUserInfo()])
    return NextResponse.json({
      voices: voices.status === 'fulfilled' ? voices.value : [],
      subscription: sub.status === 'fulfilled' ? sub.value : null,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Error obteniendo voces' }, { status: 500 })
  }
}
