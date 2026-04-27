export interface SynthesisParams {
  text: string
  voice_id?: string
  model_id?: string
  stability?: number
  similarity_boost?: number
  output_format?: 'mp3_44100_128' | 'mp3_22050_32' | 'pcm_16000' | 'pcm_22050'
}

export interface VoiceInfo {
  voice_id: string
  name: string
  labels?: Record<string, string>
}

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('ELEVENLABS_API_KEY no configurada')
  return key
}

// Voz por defecto — "Adam" (multilingual, masculino, neutro argentino-compatible)
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'
const DEFAULT_MODEL = 'eleven_multilingual_v2'

export async function synthesizeSpeech(params: SynthesisParams): Promise<ArrayBuffer> {
  const apiKey = getApiKey()
  const voiceId = params.voice_id || DEFAULT_VOICE_ID
  const modelId = params.model_id || DEFAULT_MODEL
  const outputFormat = params.output_format || 'mp3_44100_128'

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: params.text,
        model_id: modelId,
        voice_settings: {
          stability: params.stability ?? 0.5,
          similarity_boost: params.similarity_boost ?? 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`ElevenLabs ${res.status}: ${body}`)
  }

  return res.arrayBuffer()
}

export async function listVoices(): Promise<VoiceInfo[]> {
  const apiKey = getApiKey()
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
  })
  if (!res.ok) throw new Error(`ElevenLabs voices ${res.status}`)
  const data = await res.json()
  return (data.voices ?? []).map((v: VoiceInfo) => ({
    voice_id: v.voice_id,
    name: v.name,
    labels: v.labels,
  }))
}

export async function getUserInfo(): Promise<{ character_count: number; character_limit: number }> {
  const apiKey = getApiKey()
  const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    headers: { 'xi-api-key': apiKey },
  })
  if (!res.ok) throw new Error(`ElevenLabs user ${res.status}`)
  return res.json()
}

// Limpia texto de guión antes de sintetizar:
// - Elimina instrucciones entre corchetes: [pausa], [cut], etc.
// - Colapsa espacios múltiples
export function cleanScriptForTTS(script: string): string {
  return script
    .replace(/\[([^\]]*)\]/g, '')   // elimina [instrucciones de pantalla]
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // quita markdown bold
    .replace(/^#{1,3}\s.+$/gm, '')  // quita headers markdown
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
