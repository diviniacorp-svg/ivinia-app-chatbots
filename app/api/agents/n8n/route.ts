import { NextRequest, NextResponse } from 'next/server'
import { generarWorkflowN8n } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { objetivo, rubro, integraciones_disponibles } = body

    if (!objetivo) {
      return NextResponse.json({ error: 'Falta el objetivo del workflow' }, { status: 400 })
    }

    const result = await generarWorkflowN8n({ objetivo, rubro, integraciones_disponibles })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[n8n-agent]', err)
    return NextResponse.json({ error: 'Error generando el workflow' }, { status: 500 })
  }
}
