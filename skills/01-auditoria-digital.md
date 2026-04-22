# Skill: Auditoría Digital DIVINIA

## Cuándo usar
Cuando un prospect no sabe bien qué necesita. La auditoría convierte un "me interesa IA" en una propuesta concreta con problemas reales y precios visibles.

## Flujo

```
PYME llena /auditoria
  → POST /api/agents/audit
  → Claude Sonnet analiza (60s)
  → Scorecard: web / SEO / redes / mensajería / ads
  → Recomendaciones priorizadas con precios DIVINIA
  → Lead guardado automáticamente en Supabase
  → PYME recibe WA message para compartir el informe
  → CTA → WhatsApp Joaco
```

## Output que genera la IA

| Campo | Descripción |
|---|---|
| `score_general` | 0-100, comparable entre leads |
| `resumen_ejecutivo` | 2-3 oraciones para el pitch |
| `web / seo / redes / mensajería / publicidad` | score + problemas + oportunidades |
| `recomendaciones` | prioridad alta/media/baja + servicio DIVINIA + precio |
| `mensaje_wa_audit` | listo para copiar y enviar |

## Cómo vender la auditoría

### Pitch público
> "¿Cuánto dinero está perdiendo tu negocio online? En 60 segundos te lo decimos gratis."

### Secuencia post-auditoría
1. Lead llena el form → lead guardado en CRM con `score_general`
2. Joaco lo abre en `/comercial` → ve el score y el resumen
3. Clic en "Calificar con IA" → corre `/api/agents/qualify` sobre el mismo lead
4. "Generar Propuesta" → `/api/agents/proposal` → propuesta personalizada lista
5. Joaco la revisa → la envía por WA

### Scripts de WhatsApp para seguimiento

**Lead con score ≥ 70:**
> Hola [nombre], soy Joaco de DIVINIA. Vi que tu negocio tiene un score de [X]/100 en presencia digital. El punto más urgente es [dolor_principal]. Puedo mostrarte cómo lo resolvemos esta semana.

**Lead con score 40-69:**
> Hola [nombre], el informe dice que tu principal oportunidad está en [área]. Con nuestra solución de [servicio_recomendado] lo resolvemos en [plazo]. ¿Charlamos 15 minutos?

## Precios para cerrar en la misma llamada

| Problema detectado | Servicio | Precio |
|---|---|---|
| Sin web o web rota | Landing page | $100.000 |
| Sin chatbot, demora en WA | Chatbot básico | $150.000 |
| Redes inactivas | Pack 30 posts/mes | $80.000/mes |
| Sin automatización de ventas | Automatización ventas | $350.000 |
| Sin avatar para contenido | Avatar IA | $200.000+ |

## Notas técnicas

- El agente usa **Claude Sonnet** (no Haiku) porque necesita razonamiento profundo
- `save_as_lead: true` guarda el negocio automáticamente en la tabla `leads` de Supabase
- El score de la auditoría se copia al campo `score` del lead → visible en `/comercial`
- Endpoint: `POST /api/agents/audit`
