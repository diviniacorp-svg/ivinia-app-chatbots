import Anthropic from '@anthropic-ai/sdk'
import { PRODUCTS } from '@/lib/nucleus'
import type { NucleusScope, NucleusTier, NucleusAgent } from './types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

const PRECIOS: Record<NucleusTier, { setup: number; mant: number; semanas: number }> = {
  basico:    { setup: 800000,  mant: 200000, semanas: 3 },
  pro:       { setup: 1400000, mant: 250000, semanas: 5 },
  enterprise:{ setup: 2500000, mant: 350000, semanas: 8 },
}

// Preguntas de discovery para hacer al cliente en la reunión
export const DISCOVERY_QUESTIONS = [
  '¿Cuántas personas trabajan en el negocio?',
  '¿Cuál es el proceso que más tiempo les consume por semana?',
  '¿Usás WhatsApp para atender clientes? ¿Cuántos mensajes por día recibís?',
  '¿Cómo manejás los turnos o reservas hoy?',
  '¿Tenés algún sistema de gestión o todo es manual?',
  '¿Qué información necesitás saber de cada cliente?',
  '¿Publicás en redes sociales? ¿Con qué frecuencia?',
  '¿Cuánto tiempo pasás haciendo seguimiento de clientes o cobranzas?',
]

export async function scopeProject(input: {
  company_name: string
  rubro: string
  empleados: number
  procesos_descriptos: string    // descripción libre de los procesos actuales
  presupuesto_aprox?: number
}): Promise<NucleusScope> {
  const nucleusProduct = PRODUCTS.nucleus

  const prompt = `Sos el arquitecto de soluciones de DIVINIA NUCLEUS. Analizá esta empresa y diseñá el scope del proyecto.

Empresa: ${input.company_name}
Rubro: ${input.rubro}
Empleados: ${input.empleados}
Procesos actuales: ${input.procesos_descriptos}
${input.presupuesto_aprox ? `Presupuesto aprox: $${input.presupuesto_aprox.toLocaleString('es-AR')}` : ''}

NUCLEUS es: ${nucleusProduct.descripcion}
Precios: básico $800.000 (2-3 agentes), pro $1.400.000 (4-6 agentes), enterprise $2.500.000 (7+ agentes)

Devolvé JSON:
{
  "company_name": "${input.company_name}",
  "rubro": "${input.rubro}",
  "problema_central": "el problema más costoso que tienen en 1 oración",
  "procesos_a_automatizar": ["proceso 1", "proceso 2", "proceso 3"],
  "agentes_propuestos": [
    {
      "tipo": "turnos|ventas|soporte|contenido|facturacion|reportes|seguimiento|redes|cobranza",
      "nombre": "nombre amigable del agente",
      "descripcion": "qué hace en 1 oración",
      "herramientas": ["herramienta 1", "herramienta 2"],
      "modelo": "haiku|sonnet",
      "triggers": ["qué lo activa"],
      "outputs": ["qué produce"]
    }
  ],
  "integraciones": ["WhatsApp", "MercadoPago", "..."],
  "tier": "basico|pro|enterprise",
  "semanas_estimadas": 3,
  "precio": 800000,
  "precio_mantenimiento": 200000
}

Ser conservador en el scope. Proponer el tier más bajo que resuelva el problema central.
Solo el JSON.`

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  const scope = JSON.parse(text.replace(/```json\n?|\n?```/g, '')) as NucleusScope

  // Asegurar precios correctos según tier
  const precios = PRECIOS[scope.tier]
  scope.precio = precios.setup
  scope.precio_mantenimiento = precios.mant
  scope.semanas_estimadas = precios.semanas

  return scope
}
