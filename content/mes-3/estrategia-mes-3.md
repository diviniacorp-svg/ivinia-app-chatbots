# Estrategia Mes 3 — "Crecimiento y Sistemas"

**Objetivo**: 50+ ventas acumuladas (25+ ventas nuevas en el mes), 1.000+ seguidores reales, >$5.000.000 ARS ingreso acumulado en 3 meses
**Presupuesto publicidad**: $10.000 ARS/día en Meta Ads (escalar de mes 2)
**Cambio estructural**: En mes 3, el negocio pasa de "Joaco vendiendo solo" a "sistema que genera ventas con menos intervención manual". Es el mes donde se construyen los procesos que permiten escalar a Mendoza, Córdoba y Buenos Aires.

---

## El Cambio de Mentalidad del Mes 3

En mes 1: Joaco hace todo.
En mes 2: Joaco más el sistema de Ads.
En mes 3: el sistema hace la mayor parte, Joaco supervisa y cierra.

Para lograr esto hay que construir tres cosas este mes:
1. **Sistema de referidos** — los clientes existentes traen nuevos clientes
2. **Upsell automatizado** — los clientes del Plan Base pasan al Pro o Elite
3. **Outreach semi-automático** — usar los agentes de DIVINIA para escalar el DM proactivo

---

## Sistema de Referidos

### La mecánica
Un cliente de Turnero recomienda a otro negocio → ese negocio contrata Turnero → el cliente referidor recibe un beneficio.

**Los números propuestos**:
- Cliente referidor recibe: 1 mes adicional de soporte gratis O descuento de $20.000 ARS en cualquier mejora futura
- Cliente referido recibe: $10.000 de descuento en su plan

El costo del referido ($30.000 de valor total entre descuentos y soporte) es mucho menor que el costo de adquisición por Ads ($15.000+ por venta). Además, la calidad del lead por referido es más alta — ya llega con confianza.

### Cómo lanzar el sistema de referidos

**Mensaje a enviar a todos los clientes activos en el día 30**:
```
Hola [nombre]! ¿Cómo viene Turnero?

Tengo algo para vos: si recomendás Turnero a otro negocio y lo contratan,
te regalo [beneficio concreto].

No necesitás hacer nada especial — solo mencionarlo cuando alguien te pregunte
cómo manejás los turnos, y que me escriban diciendo que van de tu parte.

¿Hay algún negocio del rubro o del barrio que creas que le vendría bien?
```

### Template de historia para activar referidos (publicar en Stories)
```
Si ya usás Turnero y lo querés recomendar a otro negocio...

Hay algo para vos.

Escribinos por DM "REFIERO" y te contamos cómo funciona.

🙌
```

### Meta del sistema de referidos mes 3
- 5 ventas provenientes de referidos de los 25+ clientes existentes
- Eso representa un 20% de las ventas del mes sin inversión en Ads

---

## Upsell: De Plan Base a Plan Pro o Elite

### Por qué el upsell es la venta más fácil
Un cliente que ya tiene Turnero funcionando ya confía en el sistema. No necesita convencerse de nuevo. Solo necesita ver el valor adicional del plan superior.

**Cuándo hacer el upsell**: En el día 45 de uso (mitad del mes 3 para los clientes del mes 1).

**El disparador del upsell**: Cuando el cliente menciona algo que el plan superior resuelve.
- "¿Puedo ver cuántos turnos hice este mes?" → ahí ofrecés el panel de reportes del Plan Pro
- "¿Se puede recordar al cliente por WhatsApp además de email?" → ahí ofrecés el Plan Elite

### Template de DM de upsell
```
Hola [nombre]! ¿Cómo va todo con Turnero?

Te cuento: vi que ya tenés [X] turnos registrados en el panel. Muy bien.

Tengo algo que creo que te puede servir: el Plan Pro incluye reportes de
qué servicios pedís más, en qué horarios, y cuántos clientes cancelaron.

Con esos datos podés tomar decisiones mejores: ¿agregás un turno extra los sábados?
¿Vale la pena empezar el servicio de tinte si no lo pide nadie?

La diferencia entre Base y Pro es $70.000 (pago único, sin mensualidades).
¿Te interesa verlo?
```

### Meta de upsell mes 3
- 5 upgrades de Plan Base a Plan Pro o Elite
- Ingreso adicional: $70.000 x 5 = $350.000 ARS sin costo de adquisición

---

## Upsell de Paquete: "Turnero + Web"

### El producto combinado
Muchos clientes de Turnero van a querer más. El paso natural después de tener un sistema de turnos es tener una página web donde el link de turnos viva.

**El paquete propuesto**:
- Landing page del negocio (simple, 1 página, con info del negocio y el botón de reservar turno)
- Integrado con Turnero
- Precio del paquete: $280.000 ARS (Plan Base $80.000 + Landing Page $200.000 = $280.000, sin descuento — el valor conjunto justifica el precio)
- Alternativa: si ya tienen Turnero, ofrecerles la landing a $200.000 adicionales

### Cómo comunicarlo en contenido

**Post tipo "Turnero + Web"**:
```
¿Ya tenés Turnero y querés que tus clientes lleguen a tu negocio de forma más prolija?

Armamos la landing page de tu negocio integrada con el sistema de turnos.

Tus clientes ven:
→ Quiénes son, qué ofrecen, cómo contactarlos
→ El botón de "Reservar turno" directo al sistema

Todo en una sola página. Un solo link para bio de Instagram, tarjetas, carteles.

Pack Turnero + Web → $280.000 ARS (pago único)
O si ya tenés Turnero: agregá la web por $200.000 ARS

Escribinos por DM para verlo 🙌
```

### Meta del upsell Turnero + Web
- 3 ventas del paquete completo en el mes
- Ingreso adicional: $280.000 x 3 = $840.000 ARS

---

## Automatizar el Outreach con los Agentes de DIVINIA

### El problema del mes 1 y 2
Joaco mandó los DMs proactivos de forma manual, a 5-10 negocios por día. Eso tiene un techo: hay un límite de cuántos DMs una persona puede mandar antes de que Instagram detecte actividad sospechosa.

### La solución del mes 3
Usar el sistema de agentes de Instagram de DIVINIA (`/agents/instagram/`) para:

1. **Research**: El agente de investigación (`/app/api/instagram/research`) identifica nuevos negocios del rubro target en Instagram San Luis + otras ciudades
2. **Plan de contenido**: El agente de plan (`/app/api/instagram/plan`) genera la secuencia de mensajes personalizados por rubro
3. **DM semi-automático**: Los mensajes se generan automáticamente pero Joaco aprueba y manda manualmente cada uno (no automatizar el envío — Instagram lo detecta)

**El workflow**:
```
Agente de Research → lista de 20 cuentas candidatas por rubro
↓
Agente de Plan → genera mensaje personalizado para cada cuenta
↓
Joaco revisa y aprueba (1 minuto por mensaje) → manda manualmente
↓
Agente de DM → hace seguimiento a los que no respondieron en 48hs
```

**Resultado**: Joaco puede procesar 30-50 DMs proactivos por día en vez de 10, con la misma o menor inversión de tiempo.

---

## Expansión Geográfica: Mendoza, Córdoba, Buenos Aires

### Por qué en mes 3 y no antes
- Mes 1: aprender a vender, construir el proceso
- Mes 2: probar que el proceso funciona repetidamente
- Mes 3: replicar el proceso en nuevos mercados (la mecánica ya está validada)

### Plan de expansión ciudad por ciudad

**Mendoza** (expandir primero porque es más cercano culturalmente a San Luis):
- Semana 9: agregar hashtags de Mendoza en todos los posts (`#mendozaargentina`, `#pymesmendoza`, `#peluqueriamendoza`)
- Semana 9: buscar y hacer DM proactivo a 20 peluquerías/clínicas de Mendoza con el agente
- Semana 10: post específico "Turnero ya llega a Mendoza" si hay clientes o interesados

**Córdoba** (segunda expansión):
- Semana 10-11: misma mecánica que Mendoza
- Hashtags: `#cordobaargentina`, `#pymescordoba`, `#cordobacapital`

**Buenos Aires** (tercera, más difícil por competencia pero mayor volumen):
- Semana 11-12: foco en CABA + Gran Buenos Aires
- Hashtags: `#buenosairesargentina`, `#pymesba`, `#emprendedoresBA`
- Cambio en el DM proactivo: en Buenos Aires hay más competencia, el mensaje tiene que ser más diferenciado. No solo "tengo un sistema de turnos" sino "soy el único con soporte personal de Joaco directamente".

### Meta de expansión geográfica mes 3
- 10 ventas fuera de San Luis (40% del objetivo del mes)
- Primeros seguidores activos de otras provincias en el perfil

---

## Primeras Contrataciones o Colaboraciones

### Cuándo tiene sentido contratar
Si en mes 3 se están cerrando más de 1 venta por día, Joaco ya no puede hacer todo solo: configurar el sistema, dar soporte, mandar DMs, crear contenido.

**Primera contratación recomendada**: Una persona part-time para la configuración y soporte de Turnero.
- Función: hacer el onboarding de los nuevos clientes (configurar el sistema con los datos que manda el cliente)
- Tiempo estimado por cliente: 1-2 horas
- Costo: $150.000-$200.000 ARS/mes por un perfil junior de tecnología
- Break-even: con 3 ventas extra que Joaco pueda hacer porque liberó tiempo, ya se paga

**Alternativa antes de contratar**: colaborar con alguien del entorno de Joaco (estudiante de sistemas, freelancer de confianza) en modelo por proyecto. Pagar $15.000-$20.000 ARS por configuración.

### Colaboraciones de contenido
En mes 3, proponer colaboraciones de contenido con otras cuentas del rubro target:
- Collab con una peluquera con seguidores en San Luis: ella muestra su sistema Turnero en su historia, Joaco la menciona en el feed
- Collab con un coach de negocios o emprendedores local: contenido conjunto sobre "cómo organizarte con IA"

---

## Plan de Contenido Mes 3 — Calendario Simplificado

| Semana | Foco principal | Mix de contenido |
|---|---|---|
| Semana 9 | Referidos + primeras expansiones | 2 posts + 1 reel + stories diarias + lanzar sistema de referidos |
| Semana 10 | Upsell + Turnero+Web | 2 posts + carrusel + 1 reel Joaco + Ads escalados |
| Semana 11 | Expansión Córdoba + nuevos rubros | 3 posts por rubro + 2 reels + historias diarias |
| Semana 12 | Cierre de trimestre + teaser mes 4 | Resumen de 3 meses + post de hitos + CTA final del trimestre |

### Reel clave de mes 3: "3 meses, [X] clientes, esto es lo que aprendí"
Este reel es el más importante del mes. Joaco cuenta en 90 segundos los hitos del trimestre:
- Cuántos clientes activaron Turnero
- En cuántas ciudades
- Qué rubros respondieron mejor
- El momento más difícil y cómo lo resolvió
- Qué viene en el mes 4

Este reel construye autoridad, genera confianza, y es perfecto para boostearlo con Ads.

---

## Objetivo de Ingresos Acumulados al Fin del Trimestre

| Fuente de ingresos | Ventas | Precio promedio | Total |
|---|---|---|---|
| Plan Base | 20 | $80.000 | $1.600.000 |
| Plan Pro | 20 | $150.000 | $3.000.000 |
| Plan Elite | 8 | $200.000 | $1.600.000 |
| Pack Turnero + Web | 3 | $280.000 | $840.000 |
| Upgrades (upsell) | 5 | $70.000 | $350.000 |
| **TOTAL ACUMULADO** | **56 ventas** | — | **$7.390.000 ARS** |

**Costo de adquisición estimado** (solo Ads, mes 2 y 3):
- Mes 2: $150.000 ARS en Ads
- Mes 3: $300.000 ARS en Ads
- Total invertido en Ads: $450.000 ARS
- ROI de Ads: ($2.100.000 generados por Ads) / ($450.000 invertidos) = 4.6x retorno

---

## KPIs del Trimestre Completo

| KPI | Mes 1 | Mes 2 | Mes 3 | Total/Final |
|---|---|---|---|---|
| Ventas cerradas | 10 | 15 | 25+ | 50+ |
| Seguidores | 200 | 500 | 1.000+ | 1.000+ |
| DMs recibidos | 50 | 100 | 150+ | 300+ |
| Tasa conversión | 20% | 25% | 30% | — |
| Ciudades activas | 1 (SL) | 1-2 | 3-4 | 4 |
| Rubros activos | 5 | 9 | 12+ | 12+ |
| Ingresos ARS | ~$1M | ~$1.5-2M | ~$3-4M | >$5.5M |
| Costo por venta | $0 | ~$15k | ~$12k | — |
| NPS (clientes que recomiendan) | — | — | >70% | >70% |

---

## Qué Viene en el Mes 4 (preparar el terreno en mes 3)

En el cierre de mes 3, empezar a sembrar la expectativa del mes 4:
- **Turnero 2.0**: integración nativa con WhatsApp Business (el cliente recibe el recordatorio por WA, no por email)
- **Módulo de pagos**: el cliente paga la seña al reservar el turno online (integración MercadoPago)
- **Panel avanzado**: estadísticas de clientes recurrentes, valor promedio por cliente, proyección de la agenda

Estos features se anuncian en mes 3 para retener a los clientes actuales (razón para quedarse y no buscar alternativas) y para justificar precios más altos en el mes 4.

**Story de teaser de cierre de mes 3**:
```
Mes 4: Turnero se actualiza.

WA Business ✓
Seña online ✓
Panel avanzado ✓

Los clientes actuales lo reciben gratis.

¿Todavía no lo tenés?
Este es el mejor momento para activarlo.

→ DM
```
