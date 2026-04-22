# DIVINIA Skills — Índice

Skills reutilizables del sistema DIVINIA. Cada archivo es un playbook completo para un agente o flujo de trabajo.

## Skills disponibles

| # | Skill | Agente IA | Endpoint |
|---|---|---|---|
| 01 | [Auditoría Digital](01-auditoria-digital.md) | Claude Sonnet | `POST /api/agents/audit` |
| 02 | [Calificación de Leads](02-calificacion-leads.md) | Claude Haiku | `POST /api/agents/qualify` |
| 03 | [Generación de Propuestas](03-generacion-propuestas.md) | Claude Sonnet | `POST /api/agents/proposal` |
| 04 | [Content Factory Instagram](04-content-factory.md) | Claude Haiku | `POST /api/agents/content` |

## Cuándo usar cada una

```
Lead entra → Auditoría (01) → Calificación (02) → Propuesta (03) → Cierre
                                                                       ↓
                                                          Content (04) — siempre activo
```

## Principios de diseño de agentes DIVINIA

1. **Haiku para volumen** — calificación, contenido, análisis rápido
2. **Sonnet para calidad** — propuestas, auditorías, estrategia
3. **Siempre JSON válido** — los agentes nunca devuelven texto libre
4. **Lazy clients** — nunca inicializar SDK en módulo, siempre en runtime
5. **Español argentino** — todos los agentes responden con vos/sos/tenés
6. **Sin humo corporativo** — directo al dolor, al precio, a la acción
