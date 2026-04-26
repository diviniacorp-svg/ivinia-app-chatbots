import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// ─── BASE DE CONOCIMIENTO DIVINIA ────────────────────────────────────────────
// Fuente de verdad para todos los agentes. Actualizar acá = agentes actualizados.

const KNOWLEDGE: {
  title: string
  content: string
  category: 'producto' | 'precio' | 'proceso' | 'faq' | 'cliente' | 'estrategia' | 'tecnico'
  tags: string[]
}[] = [

  // ── PRODUCTOS ──────────────────────────────────────────────────────────────

  {
    title: 'TURNERO — Descripción completa del producto',
    category: 'producto',
    tags: ['turnero', 'agenda', 'reservas', 'turnos'],
    content: `TURNERO es el sistema de agenda online de DIVINIA para PYMEs argentinas.
Permite que los clientes del negocio reserven turnos solos, a cualquier hora, sin enviar mensajes al dueño.
El dueño recibe notificación y ve su agenda desde el celular.

Qué incluye todos los planes:
- Página de reservas personalizada con el nombre y logo del negocio
- Confirmación automática por WhatsApp al cliente
- Recordatorio automático 24hs y 1hs antes del turno
- Panel de gestión (ver, cancelar, bloquear horarios)
- Configuración hecha por DIVINIA en menos de 24hs

Rubros que usan Turnero: peluquerías, barberías, estéticas, clínicas, veterinarias, odontólogos, consultorios, talleres mecánicos, spas, salones de uñas.

Diferencial clave: pago único sin cuota mensual obligatoria. El negocio paga una vez y el sistema es suyo para siempre.`,
  },

  {
    title: 'CENTRAL IA — Descripción completa del chatbot WhatsApp',
    category: 'producto',
    tags: ['chatbot', 'whatsapp', 'central ia', 'bot', 'automatizacion'],
    content: `CENTRAL IA es el chatbot de WhatsApp de DIVINIA, powered by Claude (Anthropic).
Responde automáticamente a los clientes del negocio las 24 horas, los 7 días.

Qué hace:
- Responde preguntas frecuentes (horarios, precios, servicios, ubicación)
- Agenda turnos si el negocio tiene Turnero integrado
- Califica leads automáticamente (pregunta qué necesita, cuándo, presupuesto)
- Deriva a humano cuando no sabe o cuando el cliente lo pide
- Envía presupuestos y propuestas por WhatsApp

Versión Pro (con Claude): conversación natural, sin guiones rígidos, entiende lenguaje informal argentino.
Versión Básica: respuestas a preguntas predefinidas, más económica.

Problema que resuelve: el negocio pierde leads que escriben fuera del horario comercial o cuando el dueño está ocupado atendiendo. Central IA nunca duerme.`,
  },

  {
    title: 'CONTENT FACTORY — Gestión de contenido con IA',
    category: 'producto',
    tags: ['content factory', 'contenido', 'redes sociales', 'instagram', 'reels', 'posts'],
    content: `CONTENT FACTORY es el servicio mensual de creación de contenido de DIVINIA usando IA.

Qué incluye según plan:
- Starter ($80.000/mes): 12 posts mensuales, captions, hashtags, diseño Canva
- Crecimiento ($120.000/mes): 20 posts + 4 reels, stories, métricas
- Gestión total ($150.000/mes): todo lo anterior + DMs automatizados + newsletter

Todo el contenido es específico del rubro del cliente, no genérico.
Las imágenes se generan con Freepik AI o Canva. Los guiones de reels con Claude.
El cliente no tiene que hacer nada: DIVINIA planifica, crea, y publica.

Diferencial: contenido que convierte. No solo "estar en redes" sino contenido que genera consultas reales.`,
  },

  {
    title: 'TODO DIVINIA — Bundle completo Turnero + Central IA + Content',
    category: 'producto',
    tags: ['todo divinia', 'bundle', 'combo', 'pack completo'],
    content: `TODO DIVINIA es el plan mensual que combina los tres productos principales:
- Turnero Pro (reservas online con seña)
- Central IA Pro (chatbot WhatsApp con Claude)
- Content Factory Starter (12 posts/mes)
- CRM con scoring de leads automático
- Dashboard de métricas unificado
- Soporte WhatsApp respuesta en 4hs

Precio: $120.000/mes sin permanencia mínima. Cancelás cuando querés.

Por qué conviene: Un empleado en blanco cuesta mínimo $400.000/mes en Argentina.
Todo DIVINIA hace el trabajo de 3 personas (recepcionista, community manager, asistente de ventas) por $120.000/mes.

Setup: el primer mes incluye la configuración completa de los 3 sistemas.`,
  },

  {
    title: 'AVATARES IA — Portavoces digitales para PYMEs',
    category: 'producto',
    tags: ['avatar', 'portavoz', 'heygen', 'elevenlabs', 'voz clonada'],
    content: `AVATARES IA es el servicio de DIVINIA para crear portavoces digitales con IA.

Qué es: un presentador virtual con la voz clonada del cliente (o una voz profesional del catálogo) que puede generar videos explicando productos, respondiendo FAQs, o presentando la empresa.

Herramientas: HeyGen (avatar parlante), ElevenLabs (clonación de voz), D-ID (animación facial), Hedra (end-to-end), Higgsfield (cinematográfico).

Servicios:
- Avatar corporativo (portavoz de marca): desde $200.000, 5-7 días
- Avatar para atención al cliente: $150.000-$300.000
- Influencer/presentador IA completo: $300.000-$600.000
- Pack 10 videos con avatar existente: $100.000-$200.000

Casos de uso: presentación de la empresa, FAQ en video, stories de Instagram con el dueño presente sin grabar, testimoniales automatizados.`,
  },

  {
    title: 'NUCLEUS IA — Sistema multi-agente para empresas',
    category: 'producto',
    tags: ['nucleus', 'multi-agente', 'automatizacion avanzada', 'empresa'],
    content: `NUCLEUS IA es el producto avanzado de DIVINIA: varios agentes de IA coordinados operando el negocio de forma autónoma.

Qué hace: cada departamento tiene su propio agente IA (ventas, contenido, finanzas, operaciones) que trabaja coordinado con los otros. El dueño solo aprueba las decisiones importantes.

Precio: desde $800.000. Plazo: 2-4 semanas.

Casos de uso: empresas medianas que quieren automatizar múltiples procesos en simultáneo.
No es para PYMEs que recién arrancan — es el paso siguiente después de tener Turnero + Central IA funcionando.

El panel interno de DIVINIA (divinia.vercel.app/dashboard) es una implementación de NUCLEUS para uso interno de DIVINIA.`,
  },

  // ── PRECIOS ────────────────────────────────────────────────────────────────

  {
    title: 'PRECIOS TURNERO — Planes y precios definitivos 2026',
    category: 'precio',
    tags: ['turnero', 'precios', 'planes', 'mensual', 'anual', 'unico'],
    content: `TURNERO — Precios definitivos (ARS, abril 2026):

Plan Mensual: $45.000/mes sin permanencia mínima. Cancelás cuando querés.
Plan Anual: $35.000/mes (factura $420.000/año). Ahorrás $120.000 vs mensual.
Plan Único: $120.000 pago único, sin cuota mensual. Incluye 6 meses de soporte.
Plan Único + Mantenimiento: $120.000 setup + $40.000/mes de soporte continuo.

Todos los planes incluyen:
- Configuración completa hecha por DIVINIA (lista en 24hs)
- Página de reservas personalizada
- Recordatorios automáticos por WhatsApp
- Panel de gestión desde el celular
- Soporte por WhatsApp

Diferencias entre mensual y único: El mensual incluye actualizaciones continuas y nuevas funciones. El único es tuyo para siempre pero actualizaciones tienen costo adicional.

Forma de pago: MercadoPago (tarjeta, débito, transferencia). Para el plan único: 50% al confirmar, 50% cuando está listo.`,
  },

  {
    title: 'PRECIOS CENTRAL IA — Chatbot WhatsApp precios 2026',
    category: 'precio',
    tags: ['central ia', 'chatbot', 'precios', 'mensual', 'setup'],
    content: `CENTRAL IA (Chatbot WhatsApp) — Precios definitivos (ARS, abril 2026):

Plan Básico: $90.000/mes. Responde preguntas frecuentes predefinidas.
Plan Pro: $150.000/mes. IA con Claude, conversación natural, calificación de leads.
Setup único: $180.000 pago único sin cuota mensual (6 meses soporte incluido).

Mantenimiento (para el plan único después del período de soporte):
- Básico: $40.000/mes (1 ajuste/mes, respuesta 48hs)
- Pro: $70.000/mes (ajustes ilimitados, respuesta 24hs)

Forma de pago: MercadoPago. Para mensual: cobro automático mismo día cada mes. Para único: 50% adelanto + 50% al entregar.`,
  },

  {
    title: 'PRECIOS TODO DIVINIA y PROYECTOS A MEDIDA',
    category: 'precio',
    tags: ['precios', 'todo divinia', 'proyectos', 'custom'],
    content: `TODO DIVINIA (bundle completo):
- Mensual: $120.000/mes (Turnero + Central IA Pro + Content Starter + CRM + soporte 4hs)
- Sin permanencia mínima. Cancelás cuando querés.

CONTENT FACTORY:
- Starter: $80.000/mes (12 posts)
- Crecimiento: $120.000/mes (20 posts + 4 reels)
- Gestión total: $150.000/mes (todo + DMs + newsletter)

PROYECTOS A MEDIDA (pago único, 50% adelanto):
- Landing page: $100.000 (48hs)
- Automatización 1 proceso: $120.000 (2-3 días)
- Pack 3 automatizaciones: $300.000 (1 semana)
- CRM con IA: $400.000 (2 semanas)
- Dashboard/Panel admin: desde $400.000 (2-3 semanas)
- Avatar IA corporativo: desde $200.000 (5-7 días)
- Sistema multi-agente NUCLEUS: desde $800.000 (2-4 semanas)

Cobro: MercadoPago siempre. Proyectos: 50% adelanto + 50% al entregar y funcionar.`,
  },

  // ── PROCESO DE VENTA ───────────────────────────────────────────────────────

  {
    title: 'PROCESO DE VENTA — Cómo cerrar un cliente DIVINIA',
    category: 'proceso',
    tags: ['ventas', 'funnel', 'cierre', 'propuesta', 'demo'],
    content: `Proceso de venta DIVINIA paso a paso:

1. ENTRADA: Auditoría digital gratis en divinia.vercel.app/auditoria — captura nombre, negocio, WA.
   O entrada directa: dueño ve la demo en divinia.vercel.app/rubros y pide info.

2. CALIFICACIÓN: Lead entra al CRM (/comercial). Agente Luna califica automáticamente (score 0-100).
   Calificado si: tiene WA activo, tiene empleados/clientes, está frustrado con algún proceso.

3. DEMO EN VIVO: Mostrar divinia.vercel.app/rubros → elegir rubro del cliente → mostrar reservas funcionando.
   Duración: 20 minutos. Punto clave: mostrar el turno reservándose EN VIVO desde el celular del cliente.

4. PROPUESTA: Generar desde /comercial → "Crear propuesta". Se manda por WA.
   Precio: según hot cache. Turnero mensual $45k/mes es la entrada más fácil.

5. CIERRE: Link MercadoPago 50% adelanto. Monto: $22.500 para Turnero mensual primer mes.
   Si el cliente duda: "Si en 30 días no ves resultados, te devuelvo el mes."

6. SETUP: 24 horas desde confirmación de pago. Cliente recibe link de su turnero + QR imprimible.

7. UPSELL MES 2: Cuando el turnero funciona → proponer Central IA o Content Factory.

Objeciones comunes:
- "Es muy caro": "¿Cuánto te cuesta perder 5 turnos por semana? Eso son $50k-100k/mes perdidos."
- "No sé si me va a servir": "Te lo configuro, lo probás 30 días, si no funciona te devuelvo todo."
- "Lo voy a pensar": "¿Qué necesitás para decidirte hoy? Te lo armo mientras hablamos."`,
  },

  {
    title: 'DEMO EN PERSONA — Flujo para venta face-to-face',
    category: 'proceso',
    tags: ['demo', 'venta', 'presencial', 'rubros', 'peluqueria'],
    content: `Flujo para mostrar DIVINIA en persona (ej: en un negocio de San Luis):

Paso 1: Abrir divinia.vercel.app/rubros en el celular del cliente.
Paso 2: Scrollear los 20+ rubros, encontrar el del cliente (peluquería, clínica, etc.).
Paso 3: Tocar "Ver demo" → se abre la splash con animación del rubro.
Paso 4: Mostrar el calendario de reservas → que el cliente INTENTE reservar un turno.
Paso 5: Cuando el turno se confirma → "Esto es lo que ven tus clientes desde mañana."
Paso 6: Mostrar el panel del negocio (/panel/[configId]) → "Y esto ves vos en tu celular."
Paso 7: Mostrar el QR imprimible → "Esto lo pegás en tu vidrio y tus clientes escanean."

Si hay objeción de precio: mostrar la calculadora mental.
"¿Cuántos turnos perdés por semana? × precio del turno = lo que perdés por mes."

Cerrar: "Te lo dejo funcionando hoy. Pagás $22.500 (mitad del primer mes) y listo."`,
  },

  // ── FAQ ────────────────────────────────────────────────────────────────────

  {
    title: 'FAQ — Preguntas frecuentes sobre DIVINIA',
    category: 'faq',
    tags: ['preguntas', 'faq', 'dudas', 'respuestas'],
    content: `Preguntas frecuentes:

¿DIVINIA es de San Luis?
Sí, DIVINIA nació en San Luis Capital. Trabajamos con negocios de todo el país pero nos enfocamos primero en PYMEs del interior.

¿Cómo pago?
Por MercadoPago. Tarjeta, débito, o transferencia. Mensual: débito automático el mismo día. Único: 50% adelanto + 50% entrega.

¿Necesito saber de tecnología?
No. DIVINIA configura todo. Vos solo aprendés a mirar el panel, que es tan simple como revisar el WhatsApp.

¿Cuánto tarda en estar listo?
Turnero: 24hs. Chatbot básico: 48hs. Chatbot Pro: 3-5 días. Proyectos a medida: según alcance.

¿Puedo cancelar?
Para planes mensuales: sí, en cualquier momento, avisando 15 días antes. Sin penalidad.

¿Qué pasa si algo se rompe?
Todos los planes incluyen soporte. Planes mensuales: soporte incluido siempre. Únicos: soporte incluido por 6-12 meses.

¿Los precios incluyen IVA?
No hay IVA adicional. DIVINIA opera como monotributista.

¿Funciona para cualquier rubro?
Sí. Peluquerías, clínicas, veterinarias, estéticas, talleres, consultorios, restaurants, gyms, etc.`,
  },

  // ── ESTRATEGIA ─────────────────────────────────────────────────────────────

  {
    title: 'ESTRATEGIA GO-TO-MARKET San Luis → Cuyo → Nacional',
    category: 'estrategia',
    tags: ['estrategia', 'san luis', 'cuyo', 'mercado', 'go to market'],
    content: `Estrategia de expansión de DIVINIA:

FASE 1 (ahora): San Luis Capital.
- Foco en negocios con alta rotación de turnos: peluquerías, clínicas, estéticas.
- Venta en persona + WhatsApp semi-auto.
- Objetivo: 20 clientes pagando en San Luis.
- Lead magnet: auditoría digital gratis en /auditoria.
- Canal principal: Instagram @autom_atia + venta directa.

FASE 2 (trimestre 3 2026): Cuyo.
- Mendoza y San Juan. Mismo approach, con referidos de San Luis.
- Incorporar 1 vendedor remoto por ciudad.

FASE 3 (fin de 2026): Nacional.
- SEO + contenido YouTube para captura orgánica.
- Clientes de cualquier ciudad.

Cliente ideal:
- Dueño de negocio con 1-10 empleados.
- Usa WhatsApp para gestionar turnos o consultas.
- Factura $500k-$5M ARS/mes.
- Frustrado con el tiempo que pierde en administración.

Canal de ventas más efectivo: demo en vivo en el negocio del cliente (conversión ~60%).`,
  },

  {
    title: 'MARKET SAN LUIS — Plataforma gratuita imán de leads',
    category: 'estrategia',
    tags: ['market san luis', 'marketplace', 'leads', 'registro gratis'],
    content: `Market San Luis es la plataforma gratuita de DIVINIA en divinia.vercel.app/market.

Qué es: directorio de negocios y servicios de San Luis. Negocios se registran gratis.

Por qué es importante para DIVINIA:
- Es el imán de leads más poderoso: el negocio viene solo a registrarse
- Al registrarse, entra al CRM de DIVINIA como lead calificado
- Siguiente paso automático: propuesta de Turnero

Flujo:
1. Negocio ve el Market → se registra gratis con nombre, rubro, WA
2. DIVINIA recibe el lead en /comercial
3. Agente de IA califica y genera propuesta automática
4. Joaco contacta por WA dentro de las 24hs

Rubros disponibles: 60+ categorías (comercios y oficios/servicios).`,
  },

  // ── TÉCNICO ───────────────────────────────────────────────────────────────

  {
    title: 'STACK TÉCNICO — Tecnología de DIVINIA',
    category: 'tecnico',
    tags: ['nextjs', 'supabase', 'anthropic', 'vercel', 'stack'],
    content: `Stack técnico de DIVINIA:

Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS v4.
Backend: Next.js API Routes (serverless), Supabase (PostgreSQL + pgvector).
AI: Anthropic SDK (@anthropic-ai/sdk). Claude Haiku para chatbots (costo mínimo), Claude Sonnet para agentes complejos, Claude Opus para razonamiento profundo.
Deploy: Vercel. URL: divinia.vercel.app.
Pagos: MercadoPago SDK.
Email: Resend.
Scraping/leads: Apify (Google Maps).
Video/Animaciones: Remotion, Framer Motion.

Base de datos: Supabase proyecto dsekibwfbbxnglvcirso.
Tablas principales: clients, leads, agent_runs, content_calendar, nucleus_memory, nucleus_knowledge.

Modelos Claude usados:
- claude-haiku-4-5-20251001: chatbots cliente (costo < $0.01/100 turnos)
- claude-sonnet-4-6: agentes dashboard, outreach, análisis
- claude-opus-4-7: razonamiento estratégico complejo`,
  },

  {
    title: 'CLIENTES ACTIVOS — Estado actual de demos y pagos',
    category: 'cliente',
    tags: ['clientes', 'demos', 'activos', 'rufina', 'cantera', 'los paraisos'],
    content: `Clientes activos DIVINIA (abril 2026):

Rufina Nails — Nails/estética. Demo activa. No paga todavía.
Cantera Boutique — Hotel. Demo activa. No paga todavía.
Los Paraísos — Hotel. Demo activa. No paga todavía.
Potrero — Hotel. Demo activa. No paga todavía.

Objetivo inmediato: convertir estas demos en clientes pagos.
Joaco sale a vender en persona. Prioridad #1: cerrar Rufina Nails con Turnero mensual $45k/mes.

Para crear propuesta de un cliente: ir a /comercial → buscar lead → "Crear propuesta" → enviar por WA.

Contacto de DIVINIA: WhatsApp +5492665286110 (Joaco).
Instagram: @autom_atia.`,
  },

]

export async function GET() {
  try {
    const db = createAdminClient()

    // Upsert por título para idempotencia
    const { data, error } = await db
      .from('nucleus_knowledge')
      .upsert(
        KNOWLEDGE.map(k => ({
          title: k.title,
          content: k.content,
          category: k.category,
          tags: k.tags,
          source: 'seed',
          active: true,
        })),
        { onConflict: 'title' }
      )
      .select('id, title, category')

    if (error) throw error

    return NextResponse.json({
      ok: true,
      seeded: data?.length ?? 0,
      entries: data?.map(d => `[${d.category}] ${d.title}`),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
