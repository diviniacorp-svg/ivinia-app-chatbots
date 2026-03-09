# Crear nuevo cliente en DIVINIA

Guiá a Joaco para crear un cliente con chatbot activado:

1. Preguntá los datos del cliente:
   - Nombre de la empresa
   - Email de contacto
   - Rubro (restaurante, clinica, inmobiliaria, gimnasio, contabilidad, farmacia, peluqueria, taller, agencia, turismo, consultora)
   - Ciudad
   - Horario de atención
   - Número de WhatsApp del negocio (opcional, para el chatbot de WA)

2. Llamá a la API: `POST https://divinia.vercel.app/api/clients` con los datos

3. Mostrá el resultado:
   - chatbot_id generado
   - embed_code para pegar en su web
   - Link de prueba: `https://divinia.vercel.app/api/chatbot/[chatbot_id]`

4. Si tiene WhatsApp configurado, recordale que tiene que agregar el `whatsapp_number` en Supabase tabla `clients`

5. Preguntá si querés generar el link de pago MercadoPago

Directorio del proyecto: `C:/divinia`
