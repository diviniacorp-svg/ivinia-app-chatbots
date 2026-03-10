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
- `/configurar-chatbot` — Configura chatbot personalizado para un cliente
- `/vender-chatbot` — Flujo completo de venta de chatbot
- `/instagram` — Gestión de contenido @divinia624
- `/nuevo-cliente` — Crear cliente en el sistema
- `/deploy` — Deployar a Vercel
- `/status` — Ver estado del sistema
- `/test-chatbot` — Probar un chatbot
- `/seed` — Recargar templates

## Tips para buenos skills
- Sé específico en los pasos (Claude los sigue literalmente)
- Incluí ejemplos reales de outputs esperados
- Indicá cuándo debe pedirle confirmación a Joaco
- Incluí los precios/datos actualizados de DIVINIA
