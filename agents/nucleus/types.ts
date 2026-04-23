export type NucleusAgentType =
  | 'turnos'
  | 'ventas'
  | 'soporte'
  | 'contenido'
  | 'facturacion'
  | 'reportes'
  | 'seguimiento'
  | 'redes'
  | 'cobranza'

export type NucleusTier = 'basico' | 'pro' | 'enterprise'

export interface NucleusAgent {
  tipo: NucleusAgentType
  nombre: string               // nombre del agente para el cliente (ej: "Agente Citas")
  descripcion: string          // qué hace en 1 oración
  herramientas: string[]       // tools que necesita (ej: ['supabase', 'whatsapp', 'calendar'])
  modelo: 'haiku' | 'sonnet'  // haiku para tareas simples, sonnet para razonamiento
  triggers: string[]           // qué lo activa (ej: "mensaje WA recibido", "lunes 9am")
  outputs: string[]            // qué produce (ej: "turno confirmado en DB", "mensaje WA enviado")
}

export interface NucleusScope {
  company_name: string
  rubro: string
  problema_central: string
  procesos_a_automatizar: string[]
  agentes_propuestos: NucleusAgent[]
  integraciones: string[]      // ej: ['WhatsApp', 'MercadoPago', 'Google Calendar']
  tier: NucleusTier
  semanas_estimadas: number
  precio: number
  precio_mantenimiento: number
}

export interface NucleusArchitecture {
  diagrama_descripcion: string  // descripción del flujo entre agentes
  agentes: NucleusAgent[]
  flujo_principal: string[]     // paso a paso del flujo más importante
  datos_necesarios: string[]    // qué info necesita el cliente para configurar
  riesgos: string[]             // qué puede fallar y cómo mitigarlo
  quick_wins: string[]          // qué se puede entregar en semana 1 para mostrar valor
}

export interface NucleusProposal {
  headline: string
  problema: string
  vision: string               // cómo va a quedar la empresa en 60 días
  agentes_resumen: { nombre: string; que_hace: string }[]
  timeline: { semana: number; entregable: string }[]
  precio_setup: number
  precio_mantenimiento: number
  precio_display: string
  adelanto: number             // 50% del setup
  roi_estimado: string         // ej: "Ahorrás 20hs/semana = $X al mes"
  garantia: string
  mensaje_wa: string
}
