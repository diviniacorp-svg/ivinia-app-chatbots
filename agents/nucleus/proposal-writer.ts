import Anthropic from '@anthropic-ai/sdk'
import type { NucleusScope, NucleusArchitecture, NucleusProposal } from './types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

export async function writeNucleusProposal(
  scope: NucleusScope,
  arch: NucleusArchitecture
): Promise<NucleusProposal> {
  const adelanto = Math.round(scope.precio * 0.5)
  const precioDisplay = `$${scope.precio.toLocaleString('es-AR')} setup + $${scope.precio_mantenimiento.toLocaleString('es-AR')}/mes`

  const agentesResumen = scope.agentes_propuestos.map(a => ({
    nombre: a.nombre,
    que_hace: a.descripcion,
  }))

  const prompt = `Sos el copywriter senior de DIVINIA. Escribí la propuesta comercial para un proyecto NUCLEUS.

Cliente: ${scope.company_name} (${scope.rubro})
Problema: ${scope.problema_central}
Agentes: ${agentesResumen.map(a => `${a.nombre}: ${a.que_hace}`).join(' | ')}
Semanas: ${scope.semanas_estimadas}
Precio setup: $${scope.precio.toLocaleString('es-AR')}
Mantenimiento: $${scope.precio_mantenimiento.toLocaleString('es-AR')}/mes
Adelanto (50%): $${adelanto.toLocaleString('es-AR')}

Quick wins: ${arch.quick_wins.join(', ')}

Devolvé JSON:
{
  "headline": "título de la propuesta (max 10 palabras, impacta)",
  "problema": "descripción del dolor actual en 2 oraciones (como si el cliente lo dijera)",
  "vision": "cómo va a quedar la empresa en 60 días con NUCLEUS funcionando (2 oraciones)",
  "agentes_resumen": ${JSON.stringify(agentesResumen)},
  "timeline": [
    { "semana": 1, "entregable": "qué recibe el cliente en semana 1" },
    { "semana": 2, "entregable": "semana 2" },
    { "semana": ${scope.semanas_estimadas}, "entregable": "entrega final y capacitación" }
  ],
  "precio_setup": ${scope.precio},
  "precio_mantenimiento": ${scope.precio_mantenimiento},
  "precio_display": "${precioDisplay}",
  "adelanto": ${adelanto},
  "roi_estimado": "cálculo concreto de ahorro de tiempo o dinero (ej: '20hs/semana ahorradas = $X al mes')",
  "garantia": "frase que reduce el riesgo percibido del cliente",
  "mensaje_wa": "mensaje WA de 3 líneas para enviar junto al link de propuesta"
}

Tono: argentino, directo, sin hype. Números concretos. Solo el JSON.`

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  return JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
}
