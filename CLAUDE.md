# DIVINIA — Contexto de Código para Claude

> Leer SIEMPRE antes de tocar cualquier archivo. Este es el contexto canónico del proyecto.

---

## Qué es DIVINIA

DIVINIA es una empresa de software de San Luis, Argentina que vende **2 productos SaaS + servicios de agencia IA** a PYMEs.

### Los 3 productos

| Producto | Descripción | Ruta pública |
|---|---|---|
| **TURNERO** | Sistema de turnos online SaaS. El negocio tiene una página de reservas pública, calendario, profesionales, cobro de seña vía MercadoPago. | `/reservas/[configId]` |
| **CENTRAL IA** | Chatbot WhatsApp 24hs + contenido IA para redes. Setup + mantenimiento mensual. | (no tiene ruta propia aún) |
| **PROYECTOS** | Automatizaciones a medida, CRM IA, agentes, NUCLEUS (multi-agente). Venta de proyecto único. | (sin ruta pública) |

### El combo estrella

**TODO DIVINIA** = Turnero + Central IA a precio especial. El que más convierte.

---

## Precios DEFINITIVOS (canónicos — usar estos en TODO el código)

### TURNERO

| Plan | Precio | Modalidad |
|---|---|---|
| Mensual | **$45.000/mes** | Sin permanencia, cancelás cuando querés |
| Anual | **$35.000/mes** (factura $420.000/año) | Equivale a 2 meses gratis |
| Único | **$120.000** pago único | Incluye 6 meses soporte, sin cuota mensual |
| Único + Mantenimiento | $120.000 setup + $40.000/mes | Para quien quiere pagar único pero con soporte continuo |

### CENTRAL IA (Chatbot WA + Contenido)

| Plan | Precio | Modalidad |
|---|---|---|
| Básico | **$90.000/mes** | Chatbot 24hs, 20 consultas tipo, deriva a humano |
| Pro | **$150.000/mes** | Chatbot IA avanzado + 12 posts IA/mes |
| Setup único | **$180.000** | Sin cuota mensual, chatbot configurado y entrenado |

### TODO DIVINIA (combo)

| Plan | Precio |
|---|---|
| Mensual | **$120.000/mes** |
| Único | **$280.000** pago único |

### PROYECTOS A MEDIDA

| Servicio | Precio |
|---|---|
| Automatización de 1 proceso | $120.000 |
| Pack 3 automatizaciones | $300.000 |
| CRM con IA | $400.000 |
| Ventas automáticas end-to-end | $350.000 |
| Sistema multi-agente (NUCLEUS) | desde $800.000 |
| Landing page | $100.000 |

**Método de cobro:** MercadoPago. 50% adelanto, 50% entrega. Siempre en ARS.

---

## Stack técnico

```
Framework:    Next.js 14 (App Router)
Lenguaje:     TypeScript
CSS:          Tailwind CSS v4 (@tailwindcss/postcss — NO usar @apply salvo casos muy específicos)
Base de datos: Supabase (proyecto: dsekibwfbbxnglvcirso)
Deploy:       Vercel (proyecto: joacos-projects-9c3dbc62/divinia)
AI:           Anthropic Claude (Haiku para chatbots, Sonnet para outreach/agentes)
Email:        Resend (from: ventas@divinia.ar)
Pagos:        MercadoPago
Scraping:     Apify (Google Maps Scraper)
```

**CRÍTICO:** Todos los clientes (Supabase, Resend, MercadoPago, Anthropic) son **lazy** — se inicializan en runtime, nunca en módulo. Ver `lib/supabase.ts` como referencia del patrón Proxy.

---

## Estructura de carpetas

```
C:/divinia/
├── app/
│   ├── (public)/          # Rutas públicas (sin auth)
│   │   ├── page.tsx       # Landing principal
│   │   ├── reservas/[id]/ # Turnero: página de reservas por negocio
│   │   ├── panel/[configId]/ # Panel del negocio (dueño)
│   │   ├── demo/          # Demo interactiva
│   │   ├── rubros/        # 20 demos por rubro
│   │   ├── precios/       # Página de precios
│   │   ├── qr/[configId]/ # QR imprimible
│   │   ├── propuesta/[leadId]/ # Propuesta comercial sharable
│   │   └── checkout/      # Flujo de pago
│   ├── (market)/          # Market San Luis
│   │   └── market/        # Marketplace comercios + oficios
│   ├── (dashboard)/       # Panel interno (requiere auth)
│   │   ├── dashboard/     # Home del panel
│   │   ├── comercial/     # CRM + leads + propuestas (UNIFICADO)
│   │   ├── clientes/      # Lista de clientes activos
│   │   ├── turnero/       # Gestión de configs de Turnero
│   │   ├── agents/        # Agentes IA internos
│   │   └── ...
│   └── api/               # API routes
│       ├── bookings/      # Turnero: slots disponibles, crear turno
│       ├── chatbot/       # Chatbot SaaS endpoint
│       ├── leads/         # Scraping de leads
│       ├── market/        # Market API
│       └── ...
├── components/
│   ├── public/            # Componentes de la landing
│   └── dashboard/         # Componentes del panel
├── lib/
│   ├── supabase.ts        # Lazy Supabase clients (Proxy pattern)
│   ├── claude.ts          # Haiku (chatbots) + Sonnet (outreach)
│   ├── turnero-themes.ts  # 15 rubros con colores, emojis, animaciones
│   ├── turnero-plans.ts   # Planes TURNERO (FUENTE DE VERDAD de precios)
│   ├── templates-data.ts  # Templates de chatbot por rubro
│   └── bookings.ts        # Lógica de slots y disponibilidad
└── remotion/              # Videos con React + Remotion
```

---

## Identidad visual (design tokens)

```css
--ink:      #0C0C0C   /* negro casi puro, texto principal */
--paper:    #F5F4EF   /* blanco roto, fondo claro */
--paper-2:  #EEEDE8   /* variante más oscura del fondo */
--lime:     #C6FF3D   /* verde lima, acento primario */
--line:     rgba(12,12,12,0.08) /* bordes sutiles */
--muted:    rgba(12,12,12,0.35) /* texto secundario */
--muted-2:  rgba(12,12,12,0.55) /* texto terciario */

/* Tipografía */
--f-display:  'Gambetta', serif        /* headings editoriales */
--f-sans:     'Inter', sans-serif      /* body */
--f-mono:     'JetBrains Mono', mono   /* etiquetas, código, eyebrows */
```

**Clases utilitarias clave:** `wrap-v2`, `h-display`, `h-title`, `eyebrow`, `btn-v2 btn-ink`, `btn-v2 btn-ghost-v2`, `tag-v2`

---

## Rubros del Turnero (15 mapeados)

`lib/turnero-themes.ts` tiene: peluqueria, clinica, spa, restaurante, gimnasio, veterinaria, odontologia, estetica, psicologia, abogado, contabilidad, nails, hotel, hosteria, default.

Cada rubro tiene: `bg` (fondo animado), `accentGlow` (RGB para orbs), `particleEmojis`, `introAnimation`.

**Clientes activos con rubro en DB:**
- Rufina Nails → `nails`
- Cantera Boutique, Los Paraísos, Potrero → `hotel`
- (demo) `rufina-nails-demo`, `fa-faby-demo`

---

## Clientes activos

| Cliente | Rubro | Estado | Notas |
|---|---|---|---|
| Rufina Nails | Nails | Activo | Demo principal |
| Cantera Boutique | Hotel | Activo | |
| Los Paraísos | Hotel | Activo | |
| Potrero | Hotel | Activo | |

---

## Reglas de código

1. **Nunca editar** `c:/Users/divin/OneDrive/Desktop/chatbots plantillas/divinia-app/` — es una copia desactualizada en OneDrive. Editar siempre en `C:/divinia/`
2. **Precios**: siempre importar de `lib/turnero-plans.ts`. Nunca hardcodear precios en componentes.
3. **Clientes lazy**: cualquier cliente de servicio externo debe seguir el patrón Proxy de `lib/supabase.ts`
4. **Español argentino** en todos los textos visibles al usuario (vos/sos/tenés)
5. **WhatsApp de contacto**: `+5492665286110`
6. **No comentarios** excepto cuando el WHY es no obvio
7. **Route groups**: `(public)` sin auth, `(dashboard)` con auth, `(market)` Market San Luis

---

## Flujo de venta (Joaco sale a vender en persona)

```
1. Abre divinia.vercel.app/rubros en el celu
2. Elige el rubro del cliente → lo muestra en vivo
3. Si le interesa → abre /comercial → crea lead → genera propuesta
4. Manda el link de propuesta por WhatsApp al cliente
5. Cliente acepta → link MercadoPago 50% adelanto
6. Se configura en /dashboard/clientes → se activa el Turnero
7. Se le da el QR imprimible en /qr/[configId]
```

---

## Variables de entorno necesarias

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
APIFY_API_TOKEN
RESEND_API_KEY
RESEND_FROM_EMAIL=ventas@divinia.ar
MP_ACCESS_TOKEN
NEXT_PUBLIC_APP_URL
ADMIN_EMAIL=joaco@divinia.ar
```

---

## Lo que existe y funciona (abril 2026)

- Turnero completo: reservas, calendario, profesionales, seña MP, recordatorios
- Splash animada por rubro (15 rubros)
- Fondo animado con orbs por rubro
- Panel del negocio (dueño): turnos del día, stats, PIN
- QR imprimible por negocio
- CRM/Comercial: pipeline leads, calificación IA, propuestas auto
- Market San Luis: comercios + oficios, 60+ rubros, formulario oficios
- Academy: 6 tracks con lecciones seed
- Dashboard interno v2: DashboardShellV2, SidebarV2, NeuralGraph, KPIBand
- Landing completa con 14 secciones
- Remotion: compositions para videos IA

## Agentes estrategas (abrir carpeta = cargar contexto del agente)

| Agente | Carpeta | Cuándo usarlo |
|---|---|---|
| Estratega Turnero | `agents/turnero/` | Demos, propuestas, activar clientes nuevos |
| Estratega Comercial | `agents/comercial/` | CRM, scoring leads, links de cobro |
| Estratega Content Factory | `agents/content/` | Packs mensuales, @autom_atia |
| Estratega NUCLEUS | `agents/nucleus/` | Proyectos enterprise, multi-agente |

---

## Lo que NO existe todavía

- Propuesta sharable pública en `/propuesta/[leadId]`
- Flujo de onboarding self-service para nuevos clientes
- Notificaciones push / recordatorios automáticos reales (WhatsApp API)
- Comercios reales en Market (solo demo data)
- Contenido real en Academy (solo estructura)
- Stripe/MP suscripción recurrente automática
