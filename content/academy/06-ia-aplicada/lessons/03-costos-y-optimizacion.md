---
titulo: "Cuánto cuesta realmente usar IA en tu negocio"
duracion: "10 min"
tipo: "lectura"
---

# Cuánto cuesta realmente usar IA en tu negocio

El miedo al costo de la IA es uno de los principales frenos. La realidad es que para la mayoría de los usos de DIVINIA, el costo mensual de IA es menos que un café por día.

## Los modelos que usamos y cuánto cuestan

### Claude Haiku (el modelo barato y rápido)
- **Uso:** chatbots, calificación de leads, content factory, análisis rápidos
- **Precio:** $0.00025 por 1.000 tokens de input / $0.00125 por 1.000 tokens de output
- **En práctica:** 1.000 conversaciones de chatbot por mes ≈ $2-3 USD

### Claude Sonnet (el modelo inteligente)
- **Uso:** propuestas comerciales, auditorías, estrategia, contenido complejo
- **Precio:** ~10x más caro que Haiku
- **En práctica:** 100 propuestas por mes ≈ $15-20 USD

---

## Regla de selección de modelo (la que usa DIVINIA)

```
¿La tarea requiere razonamiento complejo, creatividad o síntesis profunda?
  SÍ → Sonnet
  NO → Haiku

¿El volumen es alto (>500 llamadas/mes)?
  SÍ → Haiku aunque sea un poco peor
  NO → Sonnet si el resultado importa

¿Es una tarea repetitiva y predecible?
  SÍ → Haiku siempre
```

---

## Presupuesto real de un negocio DIVINIA

Para un negocio con:
- Chatbot respondiendo 2.000 mensajes/mes
- 50 leads calificados/mes
- 20 propuestas generadas/mes
- 30 posts de contenido/mes

**Costo de API mensual:**
- Chatbot (Haiku): ~$3 USD
- Calificación leads (Haiku): ~$0.50 USD
- Propuestas (Sonnet): ~$4 USD
- Contenido (Haiku): ~$0.50 USD

**Total: ~$8 USD/mes** (aproximadamente $8.000-$10.000 ARS al tipo de cambio actual)

Ese es el costo de inteligencia artificial para un negocio completo. El precio de una hamburguesa por semana.

---

## Cómo optimizar si el costo sube

Si empezás a escalar y los costos de API suben, estas son las palancas:

1. **Caché de respuestas:** las preguntas frecuentes del chatbot no necesitan llamar a la API cada vez. Guardás las respuestas comunes y las servís directo.

2. **Prompts más cortos:** cada token que no escribís en el prompt es dinero que no gastás. Prompts concisos = menor costo.

3. **Batching:** en lugar de procesar leads uno por uno, juntás 10 y los analizás en una sola llamada con contexto compartido.

4. **Degradar el modelo para tareas simples:** si Haiku hace el 90% del trabajo de Sonnet para cierta tarea, usás Haiku.

---

## El cálculo que siempre gana

Costo de IA: $8.000/mes
Tiempo ahorrado: 40 horas/mes
Valor de ese tiempo: $200.000+ (a $5.000/hora)

ROI: 2.500%

La pregunta no es si podés pagar la IA. Es cuánto te está costando no usarla.
