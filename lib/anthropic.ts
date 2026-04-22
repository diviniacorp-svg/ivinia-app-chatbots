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

// ─── AGENTE: Auditoría Digital ────────────────────────────────────────────────
export interface DigitalAudit {
  score_general: number              // 0-100
  resumen_ejecutivo: string          // 2-3 oraciones, impacto real
  web: {
    score: number
    estado: string
    problemas: string[]
    oportunidades: string[]
  }
  seo: {
    score: number
    estado: string
    problemas: string[]
    keywords_perdidas: string[]
  }
  redes_sociales: {
    score: number
    estado: string
    frecuencia: string
    problemas: string[]
  }
  mensajeria: {
    score: number
    tiene_whatsapp_business: boolean
    tiene_chatbot: boolean
    tiempo_respuesta_estimado: string
    problemas: string[]
  }
  publicidad: {
    score: number
    invierte_en_ads: boolean
    canales_detectados: string[]
    problemas: string[]
  }
  recomendaciones: Array<{
    prioridad: 'alta' | 'media' | 'baja'
    area: string
    accion: string
    impacto_estimado: string
    servicio_divinia: string
    precio_estimado: string
  }>
  mensaje_wa_audit: string           // WA para compartir el informe
  cta: string                        // llamada a la acción
}

export async function auditarNegocio(params: {
  company_name: string
  rubro: string
  city: string
  website?: string
  instagram?: string
  facebook?: string
  google_maps?: string
  notas_adicionales?: string
}): Promise<DigitalAudit> {
  const system = `${DIVINIA_SYSTEM}

Sos el agente Auditor Digital de DIVINIA. Tu especialidad es analizar la presencia digital de una PYME argentina y encontrar exactamente dónde está perdiendo dinero por no tener IA ni automatización.
Sos honesto, directo y específico. No das puntajes inflados. Si algo está mal, lo decís sin rodeos.
Respondé SIEMPRE con JSON válido, sin markdown, sin texto extra.`

  const productosAudit = [
    'Chatbot WhatsApp básico: $150.000 (48hs)',
    'Chatbot WhatsApp pro: $250.000 (1 semana)',
    'Landing page: $100.000 (24-48hs)',
    'Sitio web completo: $300.000-$500.000',
    'Pack 30 posts/mes redes: $80.000/mes',
    'Automatización ventas completa: $350.000',
    'Avatar IA corporativo: $200.000-$400.000',
  ].join('\n')

  const user = `Auditá la presencia digital de este negocio:

Empresa: ${params.company_name}
Rubro: ${params.rubro}
Ciudad: ${params.city}
${params.website ? `Web: ${params.website}` : 'Web: NO TIENE'}
${params.instagram ? `Instagram: ${params.instagram}` : 'Instagram: desconocido'}
${params.facebook ? `Facebook: ${params.facebook}` : ''}
${params.google_maps ? `Google Maps: ${params.google_maps}` : ''}
${params.notas_adicionales ? `Notas: ${params.notas_adicionales}` : ''}

SERVICIOS DIVINIA (para las recomendaciones):
${productosAudit}

Devolvé JSON con exactamente esta estructura:
{
  "score_general": número 0-100,
  "resumen_ejecutivo": "2-3 oraciones del estado actual y el dinero que está perdiendo",
  "web": {
    "score": número 0-100,
    "estado": "sin web | básica | aceptable | buena | excelente",
    "problemas": ["problema específico 1", ...],
    "oportunidades": ["oportunidad concreta 1", ...]
  },
  "seo": {
    "score": número 0-100,
    "estado": "invisible | débil | medio | fuerte",
    "problemas": ["problema 1", ...],
    "keywords_perdidas": ["keyword que debería rankear", ...]
  },
  "redes_sociales": {
    "score": número 0-100,
    "estado": "sin redes | inactivas | irregulares | activas | profesionales",
    "frecuencia": "estimación de frecuencia de publicación",
    "problemas": ["problema 1", ...]
  },
  "mensajeria": {
    "score": número 0-100,
    "tiene_whatsapp_business": boolean,
    "tiene_chatbot": boolean,
    "tiempo_respuesta_estimado": "ej: más de 2hs",
    "problemas": ["problema 1", ...]
  },
  "publicidad": {
    "score": número 0-100,
    "invierte_en_ads": boolean,
    "canales_detectados": ["Google Ads", "Meta Ads", etc o []],
    "problemas": ["problema 1", ...]
  },
  "recomendaciones": [
    {
      "prioridad": "alta | media | baja",
      "area": "Web | SEO | Redes | Mensajería | Publicidad | IA",
      "accion": "qué hacer exactamente",
      "impacto_estimado": "ej: +30% leads mensuales",
      "servicio_divinia": "nombre del servicio DIVINIA que lo resuelve",
      "precio_estimado": "ej: $150.000"
    }
  ],
  "mensaje_wa_audit": "mensaje WhatsApp para enviar el informe al cliente (argentino, genera urgencia, menciona el score)",
  "cta": "texto del CTA principal (ej: Empezar a crecer con IA →)"
}`

  const raw = await ask(SONNET, system, user, 2500)
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
  return json as DigitalAudit
}

// ─── AGENTE: Generador de Workflows n8n ─────────────────────────────────────
export interface N8nWorkflow {
  nombre: string
  descripcion: string
  trigger: string
  pasos: Array<{ nodo: string; tipo: string; descripcion: string }>
  integraciones: string[]
  tiempo_setup: string
  caso_uso: string
  json_esquema: string   // JSON simplificado del workflow para copiar en n8n
  instrucciones: string  // Paso a paso para armarlo en n8n
}

export async function generarWorkflowN8n(params: {
  objetivo: string
  rubro?: string
  integraciones_disponibles?: string[]
}): Promise<N8nWorkflow> {
  const system = `${DIVINIA_SYSTEM}

Sos el agente de Automatizaciones de DIVINIA. Diseñás workflows para n8n que automatizan procesos reales de PYMEs argentinas.
Usás n8n, Google Sheets, WhatsApp (Twilio/WABA), Gmail, Supabase, MercadoPago, Instagram, y Claude AI como herramientas disponibles.
Respondé SIEMPRE con JSON válido.`

  const user = `Diseñá un workflow de n8n para este objetivo:
"${params.objetivo}"
${params.rubro ? `Rubro: ${params.rubro}` : ''}
${params.integraciones_disponibles ? `Integraciones disponibles: ${params.integraciones_disponibles.join(', ')}` : ''}

Devolvé JSON con estas claves exactas:
{
  "nombre": "nombre descriptivo del workflow",
  "descripcion": "qué hace en 1 oración",
  "trigger": "qué dispara el workflow (ej: formulario enviado, nueva fila en Sheets, cron)",
  "pasos": [
    { "nodo": "nombre del nodo en n8n", "tipo": "tipo de nodo (Trigger/Action/Filter/AI)", "descripcion": "qué hace este paso" }
  ],
  "integraciones": ["servicio 1", "servicio 2"],
  "tiempo_setup": "ej: 45 minutos",
  "caso_uso": "ejemplo concreto de cómo lo usaría un negocio del rubro",
  "json_esquema": "objeto JSON simplificado con estructura del workflow (nodes y connections como los exporta n8n, resumido)",
  "instrucciones": "paso a paso para configurarlo en n8n (máx 8 pasos, concretos y técnicos)"
}`

  const raw = await ask(SONNET, system, user, 2000)
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
  return json as N8nWorkflow
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
