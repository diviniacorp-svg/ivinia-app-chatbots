# DIVINIA · Sistema de Turnos Online · Guía de Entrega

**Tiempo estimado por cliente:** 30-45 minutos
**Precio sugerido:** $150.000 ARS (setup único) + $50.000/mes mantenimiento

---

## PASO 1 — CREAR PROYECTO EN SUPABASE

1. Ir a https://app.supabase.com
2. Crear nuevo proyecto:
   - Nombre: `rubro-nombre` (ej: `estetica-romi`, `peluqueria-carlos`)
   - Región: **South America (sa-east-1)**
   - Free tier está bien para mayoría de clientes
3. Copiar credenciales (Settings > API):
   - **Project URL** → va en `CONFIG.sb_url`
   - **Anon Public Key** → va en `CONFIG.sb_key`
4. Abrir SQL Editor → pegar y ejecutar `supabase-setup.sql`

---

## PASO 2 — PERSONALIZAR landing.html

Abrí el archivo y editá **solo el bloque CONFIG** al principio.
No hace falta tocar nada más.

| Variable | Qué poner |
|---|---|
| `CONFIG.nombre` | Nombre del negocio |
| `CONFIG.slogan` | Ciudad / descripción corta |
| `CONFIG.emoji` | Emoji del rubro (💈✂️🏥🐾💅) |
| `CONFIG.instagram` | URL completa de Instagram |
| `CONFIG.ig_handle` | @handle de Instagram |
| `CONFIG.wsp_duena` | WhatsApp: `549` + código área + número (sin 0 ni 15) |
| `CONFIG.nombre_duena` | Nombre de quien atiende |
| `CONFIG.color1..5` | Colores del negocio en hex |
| `CONFIG.hora_inicio` | Hora de apertura (número entero) |
| `CONFIG.hora_cierre` | Última hora disponible |
| `CONFIG.turno_minutos` | Duración de cada slot (30 o 60) |
| `CONFIG.sb_url` | URL de Supabase (Paso 1) |
| `CONFIG.sb_key` | Anon Key de Supabase (Paso 1) |
| `CONFIG.servicios` | Lista de servicios y precios del cliente |

**Formato de servicios:**
```js
{ cat: 'Nombre Categoría', nombre: 'Servicio', precio: 5000 }
```

---

## PASO 3 — DEPLOY EN VERCEL

1. Crear carpeta nueva con estos archivos:
   ```
   nombre-cliente/
   ├── index.html      (= landing.html renombrado)
   └── vercel.json
   ```

2. Contenido de `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/", "destination": "/index.html" }
     ]
   }
   ```

3. En esa carpeta, ejecutar:
   ```bash
   vercel --prod
   ```

4. URL resultante: `https://nombre-cliente.vercel.app`

> **Dominio propio:** Se puede conectar desde Vercel > Settings > Domains.
> Costo extra: ~$3.000/año el .com.ar

---

## PASO 4 — ENTREGAR AL CLIENTE

Enviarle por WhatsApp:
- **Link de la landing** (para compartir a sus clientes)
- **Cómo funciona:** los clientes eligen servicio + fecha + hora y les llega un WhatsApp al dueño/a con los datos

**Capacitación (15 min):**
- La landing es pública, se comparte por WhatsApp/bio de Instagram
- Los días disponibles se muestran automáticamente (lun-vie por defecto)
- Cuando llega una solicitud, aparece el WhatsApp con todos los datos
- El dueño confirma manualmente por WhatsApp al cliente

---

## CHECKLIST FINAL

- [ ] SQL corrido en Supabase (4 tablas creadas)
- [ ] CONFIG editado en landing.html
- [ ] Deploy exitoso en Vercel
- [ ] Prueba de reserva funciona
- [ ] WhatsApp llega al número correcto
- [ ] Link entregado al cliente
- [ ] 50% adelanto cobrado por MercadoPago ($75.000)
- [ ] Saldo cobrado en entrega ($75.000)

---

## RUBROS PROBADOS / COLORES SUGERIDOS

| Rubro | Emoji | Color principal | Color claro |
|---|---|---|---|
| Estética / Beauty | 💅 | `#9b6070` | `#f0d8df` |
| Peluquería | ✂️ | `#5c3d8f` | `#ede0f5` |
| Clínica / Salud | 🏥 | `#2563eb` | `#dbeafe` |
| Odontología | 🦷 | `#0891b2` | `#cffafe` |
| Veterinaria | 🐾 | `#16a34a` | `#dcfce7` |
| Gimnasio | 💪 | `#d97706` | `#fef3c7` |
| Taller mecánico | 🔧 | `#475569` | `#e2e8f0` |
| Restaurante | 🍽️ | `#dc2626` | `#fee2e2` |

---

## NOTAS TÉCNICAS

- **Supabase free tier** se pausa tras 7 días sin actividad.
  Para clientes con poco tráfico, agregar al mantenimiento mensual la gestión.
- **Precio con dominio propio:** sumar $3.000 ARS/año al presupuesto.
- **Agregar seña online:** posible con MercadoPago Checkout (+$200.000 al proyecto).
- **Panel admin:** se puede agregar `panel.html` con almanaque de gestión interna (agregar como `/admin`).
