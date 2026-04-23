import Anthropic from '@anthropic-ai/sdk'
import type { NucleusScope, NucleusArchitecture } from './types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

export async function designArchitecture(scope: NucleusScope): Promise<NucleusArchitecture> {
  const agentesStr = scope.agentes_propuestos
    .map(a => `- ${a.nombre} (${a.tipo}): ${a.descripcion}`)
    .join('\n')

  const prompt = `Sos el arquitecto senior de DIVINIA NUCLEUS. Diseñá la arquitectura técnica del sistema.

Empresa: ${scope.company_name} (${scope.rubro})
Problema central: ${scope.problema_central}

Agentes propuestos:
${agentesStr}

Integraciones: ${scope.integraciones.join(', ')}

Stack disponible: Claude API (Haiku/Sonnet), Next.js API routes, Supabase, WhatsApp (Twilio), MercadoPago, n8n

Devolvé JSON:
{
  "diagrama_descripcion": "descripción del flujo entre agentes en 2-3 oraciones (cómo se comunican)",
  "agentes": [los mismos agentes del scope con detalles técnicos completados],
  "flujo_principal": [
    "paso 1: ...",
    "paso 2: ...",
    "paso 3: ..."
  ],
  "datos_necesarios": [
    "dato que el cliente debe proveer para configurar el sistema",
    "..."
  ],
  "riesgos": [
    "riesgo potencial y cómo mitigarlo",
    "..."
  ],
  "quick_wins": [
    "qué se puede entregar en semana 1 para mostrar valor al cliente"
  ]
}

Solo el JSON.`

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  return JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
}
