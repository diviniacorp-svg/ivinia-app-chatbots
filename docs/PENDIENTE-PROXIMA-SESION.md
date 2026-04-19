# Pendiente — próxima sesión (reset 7pm ARG)

## 1. Fábrica de Contenido — REESCRIBIR completo
`app/(dashboard)/contenido/page.tsx` — el deploy no reflejó los cambios o quedó con diseño dark viejo.
Reescribir con layout 3 columnas v2:
- Col izq (260px): formulario creación rápida (tipo/plataforma/brief/botón IA + plantillas)
- Col centro: lista content_calendar con badges de plataforma coloreados (IG rosa, TT negro, LI azul) + badge estado
- Col derecha (220px): stats del mes desde Supabase

## 2. Oficinas de Agentes — CREAR
`app/(dashboard)/agents/[dept]/page.tsx` — página de "entrar a la oficina" de cada departamento.
- Header con Orb del dept + descripción
- Col izq: actividad reciente desde agent_logs + agent_runs filtrados por dept keyword
- Col derecha: lista de agentes del dept con avatares iniciales + card "esta hora" (runs count)
- DEPT_MAP hardcodeado con 11 departamentos, colores, agentes

## 3. Linkear NeuralGraph a oficinas
En `app/(dashboard)/dashboard/_components/NeuralGraphClient.tsx`:
- Click en nodo → router.push(`/dashboard/agents/${dept.id}`)
En `app/(dashboard)/agents/page.tsx`:
- Cada card/dept tiene botón "Entrar →" → `/dashboard/agents/[dept.id]`

## 4. Marketplace — arrancar
- Correr schema SQL (tablas mp_*) en Supabase proyecto dsekibwfbbxnglvcirso
- Crear `app/(market)/page.tsx` con identidad naranja #FF6B35
- Blueprint completo en `docs/MARKETPLACE-SAN-LUIS.md`

## 5. Generador IA en Fábrica
- Conectar botón "Generar con IA" a endpoint `/api/content/generate`
- Usa Claude Haiku (costo mínimo), prompt: tipo + plataforma + brief → genera caption/copy listo

## Lo que YA está en producción (no rehacer)
- Navbar: 5-click easter egg + link Academy ✓
- /agents: toggle Cards↔Grafo ✓
- /clientes, /leads, /crm: diseño v2 ✓
- /dashboard/academy: lista tracks + editor markdown split ✓
- /dashboard/redes: cards plataformas + próximos posts ✓
- NeuralGraph, KPIBand, TodaySnapshot en /dashboard ✓
- Academy pública /academy/[track]/[lesson] ✓
- APIs: ceo-metrics, agents/graph, agenda-joaco, academy/lesson ✓
