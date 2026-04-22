import Anthropic from '@anthropic-ai/sdk'
import { DIVINIA_IDENTITY, PRODUCTS } from './nucleus'

// Lazy client — se inicializa solo en runtime, nunca en build
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

// ─── Modelos ──────────────────────────────────────────────────────────────────
const HAIKU  = 'claude-haiku-4-5-20251001'   // rápido, barato — tareas simples
const SONNET = 'claude-sonnet-4-6'            // inteligente — propuestas, estrategia

// ─── Helper base ─────────────────────────────────────────────────────────────
async function ask(model: string, system: string, user: string, maxTokens = 1024): Promise<string> {
  const msg = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  })
  return (msg.content[0] as { type: string; text: string }).text
}

// ─── Sistema base de DIVINIA (inyectado en todos los agentes) ─────────────────
const DIVINIA_SYSTEM = `
Sos un agente de DIVINIA — ${DIVINIA_IDENTITY.mision}
Fundador: ${DIVINIA_IDENTITY.fundador} | Ubicación: ${DIVINIA_IDENTITY.ubicacion}
Siempre respondés en español argentino (vos, sos, tenés).
Nunca inventás datos. Sos directo, cálido, sin humo corporativo.
`.trim()

// ─── AGENTE: Calificador de Leads ────────────────────────────────────────────
export interface LeadQualification {
  score: number                  // 0–100
  razon: string                  // por qué ese score (1 oración)
  dolor_principal: string        // el problema más urgente que tiene
  servicio_recomendado: string   // qué producto de DIVINIA le va mejor
  precio_estimado: number        // precio en ARS
  mensaje_wa: string             // mensaje WA listo para copiar y enviar
  proxima_accion: string         // qué hacer exactamente ahora
}

export async function calificarLead(lead: {
  company_name: string
  rubro: string
  city: string
  phone?: string
  email?: string
  website?: string
  instagram?: string
  notes?: string
}): Promise<LeadQualification> {
  const productosStr = Object.entries(PRODUCTS)
    .map(([, p]) => `- ${p.nombre}: ${p.descripcion} | Precio: ${JSON.stringify((p as Record<string, unknown>).precios)}`)
    .join('\n')

  const system = `${DIVINIA_SYSTEM}

Sos el agente Calificador de Leads de DIVINIA. Tu trabajo es analizar un prospecto y decidir:
1. Qué tan caliente está (score 0-100)
2. Qué servicio de DIVINIA le va mejor
3. El mensaje de WhatsApp perfecto para abrir conversación

PRODUCTOS DIVINIA:
${productosStr}

Respondé SIEMPRE con JSON válido, sin markdown, sin explicaciones extra.`

  const user = `Analizá este prospecto:
Empresa: ${lead.company_name}
Rubro: ${lead.rubro}
Ciudad: ${lead.city}
${lead.phone ? `Tel: ${lead.phone}` : ''}
${lead.website ? `Web: ${lead.website}` : ''}
${lead.instagram ? `Instagram: ${lead.instagram}` : ''}
${lead.notes ? `Notas: ${lead.notes}` : ''}

Devolvé JSON con exactamente estas claves:
{
  "score": número 0-100,
  "razon": "por qué ese score en 1 oración",
  "dolor_principal": "el problema más urgente que tiene este negocio",
  "servicio_recomendado": "nombre del producto DIVINIA que más le sirve",
  "precio_estimado": número en ARS,
  "mensaje_wa": "mensaje de WhatsApp para enviarle (informal, argentino, máx 120 palabras, con emoji al inicio, sin presentación larga)",
  "proxima_accion": "qué hace Joaco ahora mismo con este lead"
}`

  const raw = await ask(HAIKU, system, user, 800)
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
  return json as LeadQualification
}

// ─── AGENTE: Generador de Propuesta ──────────────────────────────────────────
export interface Proposal {
  titulo: string
  resumen_ejecutivo: string
  problema: string
  solucion: string
  entregables: string[]
  precio: number
  precio_label: string
  plazo: string
  garantia: string
  cta: string
  mensaje_wa_propuesta: string   // WA para enviar con la propuesta
  html: string                   // propuesta completa en HTML para mostrar
}

export async function generarPropuesta(params: {
  company_name: string
  rubro: string
  city: string
  servicio: string
  dolor: string
  precio: number
  qualification?: LeadQualification
}): Promise<Proposal> {
  const system = `${DIVINIA_SYSTEM}

Sos el agente Propuestas de DIVINIA. Generás propuestas comerciales personalizadas que cierran ventas.
Tu propuesta es concisa, directa al dolor del cliente, sin relleno corporativo.
Incluís siempre: qué problema resolvés, qué entregás, en cuánto tiempo, cuánto cuesta y por qué vale la pena.
Respondé SIEMPRE con JSON válido.`

  const user = `Generá una propuesta comercial completa para:
Cliente: ${params.company_name} (${params.rubro}, ${params.city})
Servicio: ${params.servicio}
Dolor detectado: ${params.dolor}
Precio: $${params.precio.toLocaleString('es-AR')} ARS

Devolvé JSON con estas claves:
{
  "titulo": "título de la propuesta (ej: Turnero Online para ${params.company_name})",
  "resumen_ejecutivo": "2 oraciones: problema + solución propuesta",
  "problema": "párrafo del problema actual del cliente (específico al rubro)",
  "solucion": "párrafo de lo que DIVINIA le entrega y cómo cambia su operación",
  "entregables": ["entregable 1", "entregable 2", ...máx 5],
  "precio": ${params.precio},
  "precio_label": "ej: $43.000/mes o $100.000 pago único",
  "plazo": "ej: listo en 48hs",
  "garantia": "ej: 14 días de prueba sin costo",
  "cta": "texto del botón de cierre (ej: Arrancamos esta semana →)",
  "mensaje_wa_propuesta": "mensaje de WhatsApp para enviar junto a la propuesta (corto, genera urgencia, argentino)",
  "html": "propuesta completa en HTML simple (sin CSS externo, con style inline básico, incluí todos los datos anteriores de forma visual)"
}`

  const raw = await ask(SONNET, system, user, 2000)
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
  return json as Proposal
}

// ─── AGENTE: Redactor de Contenido Instagram ─────────────────────────────────
export interface InstagramPost {
  caption: string
  hashtags: string[]
  cta: string
  tipo: 'educativo' | 'social_proof' | 'oferta' | 'detras_de_escena' | 'viral'
}

export async function generarPostInstagram(params: {
  tema: string
  tipo: InstagramPost['tipo']
  rubro_cliente?: string
}): Promise<InstagramPost> {
  const system = `${DIVINIA_SYSTEM}
Sos el agente de Content Factory de DIVINIA. Creás posts de Instagram para @autom_atia que educan, entretienen y venden sin ser spam. Tono: directo, sin emojis excesivos, argentino, como un amigo que sabe de IA.`

  const user = `Creá un post de Instagram sobre: ${params.tema}
Tipo: ${params.tipo}
${params.rubro_cliente ? `Rubro de ejemplo: ${params.rubro_cliente}` : ''}

JSON con: { "caption": "...", "hashtags": ["...", ...], "cta": "...", "tipo": "..." }`

  const raw = await ask(HAIKU, system, user, 600)
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
  return json as InstagramPost
}

// ─── AGENTE: Análisis diario del CEO ─────────────────────────────────────────
export async function reporteCEO(contexto: {
  leads_nuevos: number
  leads_calientes: number
  clientes_activos: number
  mrr: number
  reservas_hoy: number
}): Promise<{ resumen: string; prioridades: string[]; alerta?: string }> {
  const system = `${DIVINIA_SYSTEM}
Sos el Orquestador CEO de DIVINIA. Analizás el estado del negocio y decís exactamente qué hacer hoy. Sin vueltas. 3 prioridades máximo. Respondé JSON.`

  const user = `Estado de hoy:
- Leads nuevos: ${contexto.leads_nuevos}
- Leads calientes (score ≥ 70): ${contexto.leads_calientes}
- Clientes activos: ${contexto.clientes_activos}
- MRR: $${contexto.mrr.toLocaleString('es-AR')}
- Reservas hoy: ${contexto.reservas_hoy}

JSON: { "resumen": "1 oración del estado del negocio", "prioridades": ["acción 1", "acción 2", "acción 3"], "alerta": "si hay algo urgente, sino null" }`

  const raw = await ask(HAIKU, system, user, 400)
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
  return json
}
