# Skill: Calificación de Leads con IA

## Cuándo usar
Cuando entra un lead nuevo (por WA, redes, auditoría, o ingreso manual) y hay que decidir cuánta energía ponerle.

## Flujo

```
Lead en CRM → abrir LeadPanel → tab "IA 🤖"
  → clic "Calificar con IA"
  → POST /api/agents/qualify { lead_id, company_name, rubro, city, ... }
  → Claude Haiku analiza (5-10s)
  → score + razon + dolor + servicio + precio + WA message
  → score guardado en Supabase automáticamente
```

## Output

| Campo | Uso |
|---|---|
| `score` (0-100) | Priorizar. ≥70 = caliente, 40-69 = tibio, <40 = frío |
| `razon` | Una oración que explica el score — para el pitch |
| `dolor_principal` | El problema que más duele — arrancá por acá |
| `servicio_recomendado` | Qué producto DIVINIA ofrecerle primero |
| `precio_estimado` | Rango de precio para la propuesta |
| `mensaje_wa` | Listo para copiar y mandar por WA |
| `proxima_accion` | Qué hacer exactamente ahora con este lead |

## Regla de priorización

| Score | Acción inmediata |
|---|---|
| 85-100 | Llamar ahora, propuesta en 24hs |
| 70-84 | WA hoy, propuesta en 48hs |
| 50-69 | WA esta semana, nutrir |
| <50 | Marcar como frío, newsletter |

## Notas técnicas

- Usa **Claude Haiku** — rápido y barato para calificación masiva
- Endpoint: `POST /api/agents/qualify`
- Actualiza `leads.score` y `leads.notes` en Supabase automáticamente
- El lead queda con tag `[IA]` en sus notas para saber que fue calificado por IA
