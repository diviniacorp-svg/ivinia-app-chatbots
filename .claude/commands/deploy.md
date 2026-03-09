# Deploy DIVINIA a producción

Ejecutá estos pasos en orden:

1. Corré `git add -A && git status` para ver qué cambió
2. Preguntame un mensaje de commit descriptivo, o usá uno automático basado en los cambios
3. Hacé `git commit -m "[mensaje]"`
4. Hacé `git push origin main`
5. Hacé `vercel --prod` en `C:/divinia`
6. Confirmá que https://divinia.vercel.app esté funcionando con un GET a `/api/whatsapp/webhook`
7. Mostrá la URL del deploy

Directorio del proyecto: `C:/divinia`
