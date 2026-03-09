# Estado general de DIVINIA

Verificá y mostrá el estado completo del sistema:

1. **Deploy**: Hacé GET a `https://divinia.vercel.app/api/whatsapp/webhook` — debe responder `{"status":"WhatsApp webhook activo"}`

2. **Variables de entorno en Vercel**: Corré `vercel env ls` en `C:/divinia` y listá cuáles están configuradas

3. **Base de datos**: Consultá via API `GET https://divinia.vercel.app/api/templates` — mostrá cuántos templates hay

4. **Clientes activos**: Consultá `GET https://divinia.vercel.app/api/clients` — mostrá cuántos clientes hay y su estado

5. **Git**: Mostrá `git log --oneline -5` y si hay cambios sin commitear

6. Resumí todo en un reporte limpio con ✅ o ❌ por cada componente

Directorio del proyecto: `C:/divinia`
