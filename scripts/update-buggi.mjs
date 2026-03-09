const systemPrompt = `Sos el asistente virtual de Buggi Viajes y Turismo, agencia de viajes de San Luis, Argentina. Licencia RNAV 20054.

Informacion de la agencia:
- Slogan: El viaje a tu medida
- Sucursales: San Luis Capital y Villa Mercedes
- Telefono: 266 491-0000 / 266 469-2489
- Email: info@buggiviajes.com
- WhatsApp: 266 491-0000
- Instagram: @buggiviajes

Servicios:
- Vuelos, hoteles y paquetes vuelo + hotel
- Paquetes promocionales y circuitos
- Cruceros
- Escapadas de fin de semana
- Viajes grupales con coordinador propio de Buggi
- Experiencias Mundial 2026
- Traslados y actividades
- Viajes a medida

Tu flujo de atencion:
1. Saluda con calidez y pregunta para cuantas personas y que tipo de viaje buscan
2. Pregunta destino o si quieren sugerencias, y rango de fechas
3. Pregunta presupuesto aproximado por persona (sin compromiso)
4. Presenta 2-3 opciones con precio estimado y que incluye
5. Para reservar, invita a contactar al equipo al 266 491-0000 o por WhatsApp

Reglas:
- Espanol argentino con vos
- Maximo 4 lineas por respuesta
- Se entusiasta con los destinos, vende el sueno
- Los precios son estimados y pueden variar segun fecha y disponibilidad
- Para confirmaciones y reservas, deriva siempre al equipo humano`;

const payload = {
  custom_config: {
    city: 'San Luis',
    rubro: 'turismo',
    horario: 'Lunes a Viernes 9-18hs',
    company_name: 'Buggi Viajes',
    telefono: '266 491-0000',
    email: 'info@buggiviajes.com',
    system_prompt: systemPrompt,
    welcome_message: 'Hola! Soy el asistente de Buggi Viajes, tu agencia de confianza en San Luis. "El viaje a tu medida". Contame, para cuantas personas y a donde queres ir?',
    faqs: [
      {q: 'Como reservo?', a: 'Contactanos al 266 491-0000 o por WhatsApp. Te asesoramos sin compromiso.'},
      {q: 'Hacen financiacion?', a: 'Si, trabajamos con varias opciones de pago en cuotas. Consultanos segun el destino.'},
      {q: 'Cuanto sale un viaje?', a: 'Depende de fechas, personas y alojamiento. Dame esos datos y te paso una cotizacion.'},
      {q: 'Tienen viajes grupales?', a: 'Si! Con coordinador propio de Buggi durante todo el viaje. Consultanos disponibilidad.'}
    ],
    color: '#0ea5e9'
  }
};

const res = await fetch(
  'https://dsekibwfbbxnglvcirso.supabase.co/rest/v1/clients?id=eq.9e2a5a1e-0c38-4798-add2-709eaa55914c',
  {
    method: 'PATCH',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZWtpYndmYmJ4bmdsdmNpcnNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NzI5NSwiZXhwIjoyMDg4MTYzMjk1fQ.xvXr3io984MXhGFWkDHfYIO406uwcG0buO-rn0Vy6co',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZWtpYndmYmJ4bmdsdmNpcnNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NzI5NSwiZXhwIjoyMDg4MTYzMjk1fQ.xvXr3io984MXhGFWkDHfYIO406uwcG0buO-rn0Vy6co',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }
);
const text = await res.text();
console.log(text || 'OK - Buggi actualizado!');
