# Testear un chatbot de DIVINIA

Probá que un chatbot específico esté funcionando:

1. Preguntá el chatbot_id a testear (o usá "demo" para el de prueba)
2. Hacé POST a `https://divinia.vercel.app/api/chatbot/[id]` con `{"message": "Hola, ¿qué servicios tienen?"}`
3. Mostrá la respuesta de Claude
4. Hacé una segunda pregunta para verificar que el historial funciona
5. Mostrá latencia y confirmá que el chatbot responde en carácter (según su rubro)

Directorio del proyecto: `C:/divinia`
