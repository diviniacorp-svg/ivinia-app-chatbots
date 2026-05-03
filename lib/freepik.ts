const FREEPIK_API = 'https://api.freepik.com/v1/ai/text-to-image'

interface MysticResponse {
  data: {
    task_id: string
    status: 'CREATED' | 'IN_PROGRESS' | 'DONE' | 'ERROR'
    generated?: string[]
    error?: string
  }
}

export async function generateImageMystic(
  prompt: string,
  options: {
    aspect_ratio?: 'square_1_1' | 'social_story_9_16' | 'widescreen_16_9' | 'traditional_3_4'
    model?: 'realism' | 'fluid' | 'flexible' | 'zen'
    resolution?: '1k' | '2k'
  } = {}
): Promise<string | null> {
  const key = process.env.FREEPIK_API_KEY
  if (!key) throw new Error('FREEPIK_API_KEY no configurada')

  const body = {
    prompt,
    aspect_ratio: options.aspect_ratio ?? 'square_1_1',
    model: options.model ?? 'flexible',
    resolution: options.resolution ?? '1k',
  }

  // Iniciar generación
  const startRes = await fetch(FREEPIK_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-freepik-api-key': key },
    body: JSON.stringify(body),
  })

  if (!startRes.ok) {
    const err = await startRes.text()
    throw new Error(`Freepik error ${startRes.status}: ${err}`)
  }

  const start: MysticResponse = await startRes.json()
  const taskId = start.data.task_id

  // Si ya vino DONE en el primer response (raro pero posible)
  if (start.data.status === 'DONE' && start.data.generated?.[0]) {
    return start.data.generated[0]
  }

  // Polling: máximo 30 intentos × 2s = 60s timeout
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const pollRes = await fetch(`${FREEPIK_API}/${taskId}`, {
      headers: { 'x-freepik-api-key': key },
    })

    if (!pollRes.ok) continue

    const poll: MysticResponse = await pollRes.json()

    if (poll.data.status === 'DONE' && poll.data.generated?.[0]) {
      return poll.data.generated[0]
    }
    if (poll.data.status === 'ERROR') {
      throw new Error(`Freepik task error: ${poll.data.error}`)
    }
  }

  throw new Error('Freepik timeout — imagen no generada en 60s')
}
