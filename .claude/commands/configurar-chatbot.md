# Skill: Configurar Chatbot para Cliente

Cuando el usuario ejecute este skill, seguí este flujo para configurar un chatbot personalizado para un nuevo cliente.

## Paso 1 — Recopilar info del negocio

Preguntale al usuario:
1. **Nombre del negocio** (ej: "Restaurante La Pampa")
2. **Rubro** (restaurante / clínica / inmobiliaria / gimnasio / peluquería / farmacia / taller / hotel / otro)
3. **Ciudad** (ej: "San Luis")
4. **Teléfono/WhatsApp del negocio**
5. **Horario de atención**
6. **Email de contacto** (opcional)
7. **¿Qué quiere que haga el chatbot?** (responder FAQs / tomar pedidos / agendar turnos / otra cosa)
8. **¿Info adicional importante?** (dirección, servicios, precios, etc.)

## Paso 2 — Generar system prompt personalizado

Con la info recopilada, generá un system prompt en español argentino que:
- Presente al chatbot como asistente del negocio
- Incluya toda la info del negocio
- Tenga reglas de conversación claras (mensajes cortos, preguntas para mantener el diálogo)
- Derive al humano si no sabe algo
- Tenga un flujo de conversación según el rubro

## Paso 3 — Crear cliente en el sistema

Usá el script de actualización o la API para crear/actualizar el cliente en Supabase.

Si es un cliente NUEVO, corré:
```bash
node /c/divinia/scripts/nuevo-cliente.mjs
```

Si es actualizar DIVINIA demo:
```bash
node /c/divinia/scripts/update-divinia-v2.mjs
```

## Paso 4 — Entregar al cliente

Generá el embed code:
```html
<script src="https://divinia.vercel.app/widget.js" data-id="[CHATBOT_ID]" defer></script>
```

Y el mensaje de WhatsApp para configurar:
```
Tu chatbot está listo 🤖
Pegá este código en tu web antes del </body>:
[EMBED CODE]

Para WhatsApp, te mando las instrucciones por separado.
```

## Rubros y templates disponibles
- restaurante → toma pedidos, horarios, reservas
- clinica → turnos, servicios, obras sociales
- inmobiliaria → propiedades, consultas, visitas
- gimnasio → clases, precios, inscripciones
- peluqueria → turnos, servicios, precios
- farmacia → horarios, delivery, consultas
- taller → citas, presupuestos, servicios
- hotel → reservas, servicios, tarifas
- agencia-ia → servicios DIVINIA (para demo)
