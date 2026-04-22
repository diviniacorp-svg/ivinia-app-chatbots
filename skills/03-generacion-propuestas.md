# Skill: Generación de Propuestas Comerciales con IA

## Cuándo usar
Después de calificar un lead (score ≥ 50) y tener claro qué servicio necesita.

## Flujo

```
Lead calificado → tab "Propuesta" en LeadPanel
  → datos pre-cargados del lead
  → clic "Generar propuesta con IA"
  → POST /api/agents/proposal { company_name, rubro, city, servicio, dolor, precio }
  → Claude Sonnet genera propuesta completa (30-60s)
  → HTML listo para mandar, WA message, entregables, garantía
```

## Output

| Campo | Descripción |
|---|---|
| `titulo` | Título de la propuesta personalizada |
| `resumen_ejecutivo` | 2 oraciones: problema + solución |
| `problema` | Párrafo específico al rubro del cliente |
| `solucion` | Qué entrega DIVINIA y cómo cambia su operación |
| `entregables` | Lista de hasta 5 ítems concretos |
| `precio` + `precio_label` | Precio final y cómo se presenta |
| `plazo` | Tiempo de entrega |
| `garantia` | 14 días de prueba / satisfacción |
| `cta` | Texto del botón de cierre |
| `mensaje_wa_propuesta` | WA corto para acompañar el PDF |
| `html` | Propuesta completa lista para mostrar |

## Cómo usar el HTML

El `html` generado es una propuesta visual completa con estilos inline.
Opciones para entregarlo:
1. Copiar en un Google Doc → PDF → enviar por WA
2. Pegar en `/propuesta/[id]` (ruta existente) para link sharable
3. Imprimir directamente desde el navegador

## Estructura de precios sugerida

| Servicio | Precio ARS | Adelanto |
|---|---|---|
| Chatbot básico | $150.000 | $75.000 |
| Landing page | $100.000 | $50.000 |
| Pack contenido/mes | $80.000/mes | Pago mes a mes |
| Automatización ventas | $350.000 | $175.000 |
| Sistema multi-agente | desde $800.000 | $400.000 |

## Notas técnicas

- Usa **Claude Sonnet** — calidad de escritura premium para cerrar ventas
- Endpoint: `POST /api/agents/proposal`
- El HTML generado tiene estilos inline (funciona en cualquier cliente de email)
- Siempre incluir garantía de 14 días para bajar la fricción de cierre
