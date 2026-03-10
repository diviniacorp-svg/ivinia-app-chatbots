# Skill: Vender Chatbot a un Prospecto

Este skill ayuda a cerrar una venta de chatbot. Seguí el flujo.

## Paso 1 — Perfil del prospecto

Preguntale al usuario:
1. **Nombre del negocio / prospecto**
2. **Rubro**
3. **Ciudad**
4. **Cómo llegó** (Instagram / WhatsApp / referido / frío)
5. **Qué problema tiene** (no responde rápido / pierde clientes / no tiene web)

## Paso 2 — Propuesta personalizada

Generá una propuesta en texto para enviar por WhatsApp, que incluya:
- Apertura con el dolor específico del rubro
- Solución concreta (qué hace el chatbot para ESE negocio)
- Precio claro con la promo
- CTA: prueba 14 días gratis

**Ejemplo de mensaje para restaurante:**
```
Hola [nombre]! Vi [Restaurante] y me surgió una idea.

¿Cuántos pedidos perdés cuando cerrás el local o estás ocupado en el salón?

Armamos un chatbot que toma pedidos por WhatsApp automáticamente, las 24hs, sin que tengas que responder vos.

👉 Precio: $80.000 ARS/mes (menos que 1hs de delivery perdido)
👉 Probalo 14 días GRATIS, sin tarjeta

¿Tenés 5 minutos para que te muestre cómo funciona?
Joaco - DIVINIA IA
```

## Paso 3 — Seguimiento

Si el prospecto muestra interés:
1. Mandar demo del chatbot: divinia.vercel.app (chatbot de DIVINIA)
2. Agendar llamada/reunión
3. Crear el chatbot con `/configurar-chatbot`

Si no responde en 48hs:
```
Hola [nombre]! Te mando un recordatorio del chatbot que te comenté.
Esta semana tenemos solo 2 lugares disponibles para la prueba gratis.
¿Arrancamos?
```

## Paso 4 — Cobro

Cuando el cliente dice que sí:
1. Ir a divinia.vercel.app/pagos
2. Crear link de MercadoPago con el monto acordado
3. Enviar el link al cliente
4. Esperar confirmación del pago
5. Configurar el chatbot con `/configurar-chatbot`

## Precios vigentes
- Chatbot web: $50.000 ARS/mes
- Chatbot WhatsApp: $80.000 ARS/mes
- Chatbot web + WhatsApp: $100.000 ARS/mes
- Trial 14 días: GRATIS (sin tarjeta)
