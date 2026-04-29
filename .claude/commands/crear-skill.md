# Skill: Crear Nuevo Skill para DIVINIA

Este skill te ayuda a crear nuevos skills (comandos) para el sistema DIVINIA.

## ¿Qué es un skill?
Un skill es un archivo .md en `/c/divinia/.claude/commands/` que define un flujo de trabajo que Claude puede ejecutar con `/nombre-del-skill`.

## Paso 1 — Definir el skill

Preguntale al usuario:
1. **¿Qué nombre tendrá el skill?** (ej: `crear-propuesta`, `onboarding-cliente`, `reportes`)
2. **¿Qué problema resuelve?** (descripción breve)
3. **¿Qué pasos tiene el flujo?**
4. **¿Qué datos necesita del usuario para ejecutarse?**
5. **¿Qué produce como resultado?** (texto, archivo, acción en sistema)

## Paso 2 — Crear el archivo

Creá el archivo en `/c/divinia/.claude/commands/[nombre].md` con esta estructura:

```markdown
# Skill: [Nombre del Skill]

[Descripción breve de qué hace]

## Paso 1 — [Título]
[Instrucciones detalladas]

## Paso 2 — [Título]
[Instrucciones detalladas]

## Resultado esperado
[Qué produce el skill al finalizar]
```

## Paso 3 — Documentar

Agregarlo al listado en `/c/divinia/.claude/commands/README.md` (crear si no existe).

## Skills existentes

### Contenido & Marketing
- `/post-divinia` — Genera post IG completo (brief visual + caption + hashtags + prompts Freepik)
- `/video-guion` — Guión técnico de Reel frame a frame (voz en off + prompts Freepik Seedance/Kling)
- `/instagram` — Gestión de contenido @divinia624 (plan de 10 días legacy)

### Ventas & Leads
- `/buscar-leads` — Búsqueda Apify por rubro/ciudad + filtro + carga al CRM + plan de outreach
- `/propuesta-divinia` — Propuesta personalizada por rubro/dolor (WA + email + demo link)
- `/vender-chatbot` — Flujo de venta legacy (actualizar con /propuesta-divinia)

### Clientes & Operación
- `/nuevo-cliente` — Crear cliente en el sistema
- `/configurar-chatbot` — Configura chatbot personalizado para un cliente
- `/test-chatbot` — Probar un chatbot

### Sistema
- `/deploy` — Deployar a Vercel
- `/status` — Ver estado del sistema
- `/seed` — Recargar templates
- `/crear-skill` — Crear un nuevo skill (este archivo)

## Tips para buenos skills
- Sé específico en los pasos (Claude los sigue literalmente)
- Incluí ejemplos reales de outputs esperados
- Indicá cuándo debe pedirle confirmación a Joaco
- Incluí los precios/datos actualizados de DIVINIA
