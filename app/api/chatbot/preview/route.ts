import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateChatbotResponse } from '@/lib/claude'

export const dynamic = 'force-dynamic'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, message, history = [] } = await request.json()

    if (!templateId || !message) {
      return NextResponse.json({ error: 'templateId y message son requeridos' }, { status: 400 })
    }

    const db = createAdminClient()
    const { data: template, error } = await db
      .from('templates')
      .select('name, system_prompt, welcome_message')
      .eq('id', templateId)
      .single()

    if (error || !template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    const systemPrompt = template.system_prompt
      .replace(/\{NOMBRE_NEGOCIO\}/g, template.name.replace('Chatbot para ', ''))
      .replace(/\{CIUDAD\}/g, 'San Luis, Argentina')
      .replace(/\{DIRECCION\}/g, 'Centro')
      .replace(/\{HORARIO\}/g, 'Lunes a Viernes 9-18hs')
      .replace(/\{TELEFONO\}/g, '+54 9 266 0000000')
      .replace(/\{EMAIL\}/g, 'info@ejemplo.com')
      .replace(/\{WHATSAPP\}/g, '+54 9 266 0000000')
      .replace(/\{ESPECIALIDADES\}/g, 'todos nuestros servicios')

    const conversationHistory: Message[] = (history as Message[]).slice(-10)

    const response = await generateChatbotResponse(systemPrompt, conversationHistory, message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 })
  }
}
