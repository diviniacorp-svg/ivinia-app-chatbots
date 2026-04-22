# Skill: Content Factory — Posts Instagram con IA

## Cuándo usar
Para generar contenido de Instagram para @autom_atia (la cuenta de DIVINIA) o para clientes del pack de redes.

## Flujo

```
Panel interno → /contenido
  → elegir tema + tipo de post
  → POST /api/agents/content { tema, tipo, rubro_cliente? }
  → Claude Haiku genera caption + hashtags + CTA
  → Copiar caption → Canva → publicar
```

## Tipos de post

| Tipo | Cuándo usarlo | Frecuencia ideal |
|---|---|---|
| `educativo` | Explicar IA a PYMEs sin jerga | 2x semana |
| `social_proof` | Resultados de clientes reales | 1x semana |
| `oferta` | Promo o servicio específico | 1x cada 2 semanas |
| `detras_de_escena` | Joaco trabajando, el sistema DIVINIA | 1x semana |
| `viral` | Hook fuerte, pregunta polémica | 1x semana |

## Mix recomendado (10 posts/mes)
- 4 educativos
- 2 social proof
- 2 detrás de escena
- 1 oferta
- 1 viral

## Templates de temas que funcionan

**Educativos:**
- "3 cosas que hace un chatbot IA mientras vos dormís"
- "Por qué tu competencia ya responde en 10 segundos (y vos tardás 2 horas)"
- "Cómo una peluquería de San Luis llena su agenda sin llamar a nadie"

**Social proof:**
- "[Cliente] pasó de X a Y con el turnero IA"
- "Score 34/100 → acciones que tomamos → resultado en 30 días"

**Viral:**
- "Tu negocio tiene una fuga de dinero y no lo sabés (auditalo gratis)"
- "El chatbot no reemplaza al vendedor. Hace algo mejor."

## Notas técnicas

- Usa **Claude Haiku** — barato para generar volumen de contenido
- Endpoint: `POST /api/agents/content` (o generarPostInstagram en lib/anthropic.ts)
- Output: `{ caption, hashtags, cta, tipo }`
- Límite de caption: ~2200 caracteres (Instagram). Haiku suele generar ~300-500 palabras, perfecto.
