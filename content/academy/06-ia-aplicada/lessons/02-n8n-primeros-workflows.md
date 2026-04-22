---
titulo: "Tus primeros workflows en n8n: automatizaciones reales en 1 hora"
duracion: "20 min"
tipo: "tutorial"
---

# Tus primeros workflows en n8n: automatizaciones reales en 1 hora

n8n es el Zapier de código abierto. Más poderoso, más barato, y con integración nativa de IA. Acá van los 3 workflows que más valor generan para negocios DIVINIA.

## Setup inicial (10 minutos)

n8n corre localmente o en la nube. Para empezar, la forma más rápida es usar n8n Cloud (gratis para los primeros flujos).

1. Registrarse en n8n.cloud
2. Crear un nuevo workflow
3. Conectar las integraciones que necesitás (Google Sheets, WhatsApp, Gmail)

---

## Workflow 1: Notificación de lead nuevo → WhatsApp

**Problema que resuelve:** un lead completa un formulario y hay que avisar rápido para llamar.

**Flujo:**
```
Formulario enviado → Google Sheets → Filtro (si score > 60) → Mensaje WA automático a Joaco
```

**Pasos en n8n:**
1. Trigger: "Google Sheets - Row Added"
2. Filtro: `{{ $json.score >= 60 }}`
3. WhatsApp node: mensaje a tu número con los datos del lead
4. Activar workflow

**Tiempo de setup:** 20 minutos
**Valor:** nunca más perdés un lead caliente por no verlo a tiempo

---

## Workflow 2: Reporte diario automático del negocio

**Problema que resuelve:** saber el estado del negocio sin tener que entrar al panel todos los días.

**Flujo:**
```
Cron (8am) → Supabase (métricas de ayer) → Claude Haiku (genera resumen) → WhatsApp a Joaco
```

**El prompt que usa Claude:**
> "Sos el asistente de negocios de DIVINIA. Resumí estas métricas en 3 oraciones directas: [datos]. Decí qué está bien, qué preocupa y qué hacer hoy."

**Resultado:** cada mañana a las 8am recibís un mensaje de WA con el estado del negocio en 3 líneas.

---

## Workflow 3: Seguimiento automático de propuestas no respondidas

**Problema que resuelve:** las propuestas que enviaste y nunca tuvieron respuesta.

**Flujo:**
```
Cron (diario) → Supabase (propuestas enviadas hace 3 días sin respuesta) → Claude (genera follow-up personalizado) → Gmail/WA
```

**El prompt para el follow-up:**
> "Escribí un mensaje de seguimiento para [empresa] que recibió una propuesta de [servicio] hace 3 días. Tono: amigable, no insistente. Máximo 3 oraciones. Terminá con una pregunta abierta."

---

## Cuánto cuesta n8n

- n8n Cloud gratuito: hasta 5 workflows activos, 1.000 ejecuciones/mes
- n8n Cloud Starter: $20 USD/mes = ilimitado para la mayoría de los negocios
- n8n self-hosted: gratis, pero necesitás un servidor (Railway, Fly.io = $5-10 USD/mes)

Para un negocio que empieza, el plan gratuito alcanza para los primeros 3-4 meses.

---

## El principio de automatización incremental

No intentes automatizar todo de golpe. El orden correcto:

1. Hacer la tarea manualmente y entender bien el proceso
2. Identificar qué parte se repite exactamente igual cada vez
3. Automatizar solo esa parte
4. Medir si la automatización funciona como esperabas
5. Agregar más pasos

Los workflows más complejos son la suma de muchos workflows simples que funcionan bien.
