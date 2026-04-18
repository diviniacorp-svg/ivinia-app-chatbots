---
titulo: "Cuándo usar Claude Haiku y cuándo Sonnet"
duracion: "10 min"
tipo: "lectura técnica"
---

# Cuándo usar Claude Haiku y cuándo Sonnet

Uno de los errores más caros que cometen los emprendedores que incorporan IA a su negocio es usar el modelo más potente para todo. Como usar un Ferrari para ir al kiosco.

## La diferencia práctica

| | **Haiku** | **Sonnet** |
|---|---|---|
| **Velocidad** | ~1s por respuesta | ~3-5s por respuesta |
| **Costo** | $0.00025 / 1k tokens | $0.003 / 1k tokens (12x más caro) |
| **Ideal para** | Tareas simples y repetitivas | Análisis, redacción compleja, razonamiento |

**Regla general**: si la tarea la podría hacer una persona promedio en menos de 30 segundos sin pensar mucho → Haiku. Si requiere criterio, comparación, análisis → Sonnet.

## Ejemplos concretos

**Haiku** (rápido, barato):
- Clasificar si un mensaje de WhatsApp es una consulta, una queja o un spam
- Extraer el nombre, servicio y horario de un mensaje de reserva
- Responder preguntas frecuentes de un FAQ
- Formatear datos de una planilla

**Sonnet** (más lento, vale la pena):
- Generar una propuesta comercial personalizada
- Analizar el historial de un lead y determinar el nivel de interés
- Redactar contenido para Instagram con voz de marca específica
- Evaluar si una automatización cumple los objetivos

## La arquitectura que usamos en DIVINIA

```
Chatbot de WhatsApp → Claude Haiku (classify_intent)
    ↓ si es venta potencial
Scoring de lead → Claude Sonnet (analyze_potential)
    ↓ si score > 70
Propuesta personalizada → Claude Sonnet (generate_proposal)
```

Tres llamadas a la API. Las dos primeras en Haiku (baratas). Solo la última en Sonnet (cara pero vale la pena).

## Cómo calcular el costo de una automatización

Un chatbot que maneja 100 conversaciones por día, con un promedio de 10 mensajes por conversación:

- 1.000 llamadas/día × 200 tokens promedio = 200.000 tokens/día
- Con Haiku: 200.000 × $0.00025/1000 = **$0.05 por día** → $1.50/mes
- Con Sonnet: 200.000 × $0.003/1000 = **$0.60 por día** → $18/mes

La diferencia no es enorme en absoluto. Pero a escala (10 clientes, 1M tokens/día) sí importa.

En la próxima lección: cómo conectar Claude con n8n para automatizar flujos reales.
