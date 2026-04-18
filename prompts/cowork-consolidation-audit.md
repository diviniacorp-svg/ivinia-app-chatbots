# Prompt para Cowork — Auditoría y Consolidación DIVINIA OS

## Tu Rol

Sos el auditor de arquitectura de DIVINIA. Tu misión es revisar TODOS los proyectos de Vercel, Supabase y carpetas locales que pertenecen a Joaco (fundador de DIVINIA), identificar duplicados, basura y recursos valiosos que no estén integrados, y proponer un plan claro de consolidación.

**REGLA CRÍTICA**: NO ejecutés ninguna acción destructiva sin aprobación explícita de Joaco paso a paso. Cada paso del plan debe ser aprobado antes de ejecutarse.

---

## Contexto de DIVINIA

DIVINIA es una empresa de IA para PYMEs en Argentina. El producto central es un sistema de agentes autónomos (DIVINIA OS) que corre en:

- **App principal**: `C:/divinia/` → Next.js 14 + Supabase + Vercel
- **Deploy activo**: https://divinia.vercel.app
- **GitHub**: https://github.com/diviniacorp-svg/ivinia-app-chatbots
- **Email**: diviniacorp@gmail.com

---

## Inventario Conocido — Verificar y completar

### Supabase (3 proyectos detectados)

| Proyecto | ID | Estado | Uso actual |
|---|---|---|---|
| workflows chatbots prim | `dsekibwfbbxnglvcirso` | ACTIVE | App principal (dsekibwfbbxnglvcirso.supabase.co) |
| DIVINIA-OS | `dbzvglcrtsrmijacaquf` | INACTIVE | Sin uso aparente |
| Desconocido | `cdgthrelwqrzhuylmcgf` | ? | Apareció en .env.local — estado incierto |

**Acción**: Listar tablas de los 3 proyectos y determinar cuál tiene más datos y cuál es la fuente de verdad.

### Vercel

| Proyecto | Org | Deploy |
|---|---|---|
| divinia | joacos-projects-9c3dbc62 | divinia.vercel.app |
| Otros? | ? | ? |

**Acción**: Listar TODOS los proyectos de Vercel de Joaco. Identificar cuáles están activos, cuáles apuntados a repos de clientes.

### Carpetas locales en `C:/Users/divin/OneDrive/Desktop/`

Duplicados graves detectados (VERIFICAR):

```
DIVINIA core:
- C:/divinia/                          ← app principal activa
- chatbots plantillas/divinia-app/     ← posible copia desactualizada
- DIVINIA-OS/                          ← estructura vieja de departamentos
- PROYECTOS-DIVINIA/divinia-os-v3/     ← versión 3 anidada

Clientes (cada uno puede tener múltiples copias):
- BUGGI-VIAJES: Desktop/BUGGI VIAJES Y TURISMO + Desktop/BUGGI-VIAJES + CLIENTES/BUGGI-VIAJES + PROYECTOS-DIVINIA/Buggi-Viajes
- Jime viandas: Desktop/jime viandas + _BORRAR/jime viandas.zip + jime viandas (2).zip
- ESTETICAtuespacio: Desktop/panel-tueespacio + CLIENTES/-ESTETICAtuespacio

Proyectos Next.js sueltos (posibles duplicados o experimentos):
- Desktop/turnero/         → fork del Turnero?
- Desktop/orquestador/     → monorepo turbo (experimental?)
- Desktop/agencia/         → agencia?
- Desktop/rifero/          → rifa app
- Desktop/DOROTEA/         → cliente?
- Desktop/habits-motion-graphic/
- Desktop/panel-tueespacio/

Proyectos en PROYECTOS-DIVINIA/:
- DOROTEA, IVAN-ASIST, SL-parking, SocialFlow, ad-divinia
- app-de-suenos, app-guarderia-perros, app-reciclaje, divinia-os-v3

Basura obvia:
- _BORRAR/ (carpeta completa)
- ACCESOS-DIRECTOS/
- Archivos .zip duplicados
```

---

## Tareas para Cowork

### Tarea 1: Auditoría completa

1. Listá TODOS los proyectos de Vercel de la cuenta de Joaco
2. Listá las tablas y row counts de los 3 proyectos Supabase
3. Revisá las carpetas locales listadas arriba y determiná:
   - ¿Tiene código? ¿Tiene data? ¿Tiene deploy activo?
   - ¿Es duplicado de otro proyecto? ¿De cuál?
   - ¿Hay algo valioso que no esté en `C:/divinia/`?

### Tarea 2: Clasificación

Para CADA item del inventario, asignale una categoría:

| Categoría | Descripción |
|---|---|
| `CORE` | Es parte de DIVINIA OS principal — integrar o mantener |
| `CLIENTE-ACTIVO` | Proyecto de cliente pagante — mantener separado |
| `CLIENTE-INACTIVO` | Proyecto de cliente que ya no activo — archivar |
| `DUPLICADO` | Copia de otro proyecto — identificar cuál es el original |
| `EXPERIMENTO` | Prototipo/prueba que no llegó a nada — archivar |
| `BASURA` | Sin valor, seguro para eliminar |

### Tarea 3: Identificar info valiosa en duplicados

Antes de proponer eliminar NADA, respondé:
- ¿El duplicado tiene commits/código que NO está en la versión principal?
- ¿Tiene data en Supabase que sería pérdida eliminar?
- ¿Tiene assets (imágenes, videos, docs) únicos?

### Tarea 4: Target Architecture

Proponé cómo debería quedar la arquitectura final:

```
DIVINIA OS (objetivo final):
├── 1 proyecto Vercel: divinia → divinia.com.ar
├── 1 proyecto Supabase: divinia-os (el que tenga más datos)
├── C:/divinia/ (único repo local activo)
│   └── Clientes como configuraciones dentro del repo
│       └── /app/[clientSlug]/ o supabase multi-tenant
└── Carpetas archivadas: C:/divinia/archive/clientes/[nombre]
```

### Tarea 5: Plan de consolidación paso a paso

Devolvé un plan con pasos numerados. CADA PASO debe tener:

```markdown
## Paso X: [Título]
- **Qué hacer**: descripción específica
- **Archivos/recursos afectados**: lista
- **Riesgo**: bajo/medio/alto
- **Backup necesario**: sí/no + cómo
- **Estado**: [ ] Pendiente
```

---

## Reglas de Seguridad

1. **NO borres nada sin que Joaco apruebe el paso específico**
2. **NO toques** archivos `.env`, `.env.local` de proyectos de clientes activos
3. **Backup antes de eliminar**: cualquier carpeta con más de 50MB o con código activo
4. **Documentá todo** en `C:/divinia/CONSOLIDATION-LOG.md`
5. Si un proyecto tiene deploy activo en Vercel → **nunca pausar sin aviso**
6. Si un proyecto Supabase tiene data de clientes reales → **jamás borrar sin exportar**

---

## Qué hacer cuando termines la auditoría

1. Creá el archivo `C:/divinia/CONSOLIDATION-AUDIT.md` con TODO el inventario clasificado
2. Creá `C:/divinia/CONSOLIDATION-PLAN.md` con los pasos aprobables por Joaco
3. Presentale el resumen a Joaco con:
   - Cuántos proyectos encontraste
   - Cuántos son basura vs valiosos
   - Cuánto espacio se liberaría
   - Cuáles son los 3 pasos más urgentes
4. **Esperá aprobación** antes de ejecutar cualquier paso

---

## Stack de herramientas disponibles para la auditoría

- MCP Supabase: `list_tables`, `execute_sql` para ver row counts
- MCP Vercel: `list_projects` para ver todos los deploys
- Bash: `ls`, `du -sh`, `find` para analizar carpetas locales
- Git: `git log --oneline -5` para ver actividad reciente de cada repo

---

*Creado: 2026-04-18 | DIVINIA OS v2 | Joaco + Claude*
