# Skill: Buscar Leads con Agentes DIVINIA

Orquesta la búsqueda de prospectos: usa Apify para raspar Google Maps por rubro y ciudad, filtra por score, carga los mejores al CRM, y prepara el siguiente paso (propuesta o outreach).

---

## CONTEXTO

DIVINIA busca PYMEs argentinas que necesiten Turnero IA, Landing Page o NUCLEUS.

**Rubros calientes (priorizarlos):**
- Peluquería / Barbería / Estética / Nail Art → Turnero IA (pain: turnos por WA)
- Clínica / Odontología / Psicología / Veterinaria → Turnero IA
- Restaurante / Cafetería / Panadería → Turnero + Landing
- Abogado / Contador / Consultora → Landing + NUCLEUS
- Gimnasio / Personal trainer / CrossFit → Turnero IA

**Ciudades objetivo (en orden):**
1. San Luis Capital
2. Villa Mercedes (San Luis)
3. Mendoza Capital
4. San Rafael (Mendoza)
5. San Juan Capital
6. Córdoba (barrios: Villa Carlos Paz, Río Cuarto)

**Score mínimo para cargar al CRM: 40 puntos**
- Email disponible: +30pts
- Web propia: +20pts
- Rating ≥ 4: +20pts
- Reviews ≥ 50: +15pts
- Instagram disponible: +15pts

---

## Paso 1 — Definir la búsqueda

Preguntale a Joaco (o inferí del contexto):
1. **¿Qué rubro?** (puede ser múltiple)
2. **¿Qué ciudad?** (puede ser múltiple)
3. **¿Cuántos leads quiere?** (default: 20 por búsqueda)
4. **¿Qué producto va a ofrecer?** (afecta el score y el filtro)

Si no hay contexto, buscar: **peluquerías en San Luis** — 20 leads.

---

## Paso 2 — Ejecutar la búsqueda

Usar el endpoint existente:

```
POST /api/leads/scrape
{
  "rubro": "[rubro en español, singular]",
  "city": "[ciudad]",
  "maxItems": 20
}
```

Si el endpoint no responde, recordarle a Joaco que debe tener `APIFY_API_TOKEN` en `.env.local`.

Mientras espera (puede tardar 1-2 min), mostrar:
```
🔍 Buscando [rubro] en [ciudad]...
Apify está rastreando Google Maps. Esto tarda ~1 minuto.
```

---

## Paso 3 — Analizar resultados

Al recibir los leads, mostrar un resumen:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULTADOS — [Rubro] en [Ciudad]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total encontrados: X
Con email: X
Con web propia: X
Con Instagram: X
Score ≥ 70 (calientes): X
Score 40-69 (tibios): X
Score < 40 (fríos, omitir): X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Listar los TOP 5 con más score:
```
1. [Nombre] — Score: XX — 📧 [email] — 🌐 [web si tiene] — 📸 [ig si tiene]
2. ...
```

---

## Paso 4 — Cargar al CRM

Los leads con score ≥ 40 se cargan automáticamente al CRM via:

```
POST /api/leads (bulk)
```

Para los calientes (score ≥ 70), también:
- Asignar status: `nuevo`
- Asignar source: `apify_google_maps`
- Agregar nota: `Score [X]. Rubro: [rubro]. Ciudad: [ciudad].`

Confirmar con Joaco antes de cargar si son más de 20 leads nuevos.

---

## Paso 5 — Priorizar el outreach

Después de cargar, mostrar el plan de contacto:

```
PLAN DE OUTREACH — próximos 3 días

HOY (calientes — score ≥ 70):
[Lista de hasta 5 negocios con nombre, teléfono, IG]
→ Acción: WhatsApp directo + seguimiento en 48hs
→ Usar skill: /propuesta-divinia

MAÑANA (tibios — score 40-69):
[Lista de 5-10 negocios]
→ Acción: Email personalizado vía Resend
→ Usar: /api/outreach/email

ESTE FIN DE SEMANA (fríos con web):
[Resto]
→ Acción: DM Instagram si tienen cuenta
```

---

## Paso 6 — Buscar más rubros (opcional)

Si Joaco quiere más leads, ofrecer:
```
¿Querés que busque también?
A) Estética / nail art en [misma ciudad]
B) Odontología en [misma ciudad]
C) [mismo rubro] en [ciudad vecina]
D) Definir otro rubro/ciudad

Respondé A, B, C o D, o describí lo que querés.
```

---

## Reglas de outreach

**Lo que NUNCA hacer:**
- No enviar propuestas genéricas a todos a la vez
- No contactar sin revisar primero su IG/web (personalizar el mensaje)
- No insistir más de 2 veces si no responde

**Lo que SIEMPRE hacer:**
- Mencionar algo específico del negocio en el primer mensaje
- Ofrecer la demo del Turnero como primer paso (no pedir compra)
- Responder dentro de las 4hs si el prospecto contesta

---

## Resultado esperado

Al finalizar entregá:
1. Resumen de búsqueda (cantidad, calidad)
2. Lista de leads cargados al CRM con scores
3. Plan de outreach priorizado (hoy / mañana / esta semana)
4. Siguiente acción sugerida → `/propuesta-divinia` para los top leads
