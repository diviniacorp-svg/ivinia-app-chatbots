# DIVINIA - Setup Guide

## ✅ Build exitoso. Para lanzar HOY:

### Paso 1: Completar las credenciales
Abrir el archivo `.env.local` y completar con tus datos reales:

```
NEXT_PUBLIC_SUPABASE_URL=       # De tu proyecto Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # De tu proyecto Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=      # De tu proyecto Supabase → Settings → API

ANTHROPIC_API_KEY=              # De console.anthropic.com → API Keys

APIFY_API_TOKEN=                # De console.apify.com → Settings → Integrations

RESEND_API_KEY=                 # De resend.com → API Keys
RESEND_FROM_EMAIL=ventas@divinia.ar  # El email que configuraste en Resend

MP_ACCESS_TOKEN=                # De mercadopago.com/developers → Credenciales

NEXT_PUBLIC_APP_URL=https://TU-APP.vercel.app  # Lo obtenés después del deploy
```

### Paso 2: Crear la base de datos en Supabase
1. Ir a tu proyecto en supabase.com
2. Ir a `SQL Editor`
3. Copiar todo el contenido de `supabase-schema.sql`
4. Ejecutarlo con `Run`

### Paso 3: Deploy en Vercel (gratis)
```bash
# En la terminal, desde la carpeta divinia-app:
npx vercel --prod
```
O subir a GitHub y conectar con Vercel desde vercel.com

### Paso 4: Cargar los templates
Una vez deployado, visitar:
```
https://TU-APP.vercel.app/api/seed
```
Esto carga los 8 templates de chatbot en la base de datos.

### Paso 5: Personalizar números de WhatsApp
Buscar y reemplazar `5492664000000` con tu número real en:
- `components/public/Navbar.tsx`
- `components/public/Hero.tsx`
- `components/public/TrialCTA.tsx`
- `components/public/PricingCards.tsx`
- `components/public/Footer.tsx`
- `app/(public)/checkout/success/page.tsx`

### Para probar en local primero:
```bash
cd divinia-app
npm run dev
# Abrir http://localhost:3000
```

## 🚀 Flujo de venta de HOY

1. `http://localhost:3000/leads` → Buscá "restaurantes en San Luis"
2. Seleccioná leads con email → "Guardar en CRM"
3. `http://localhost:3000/outreach` → Generá email personalizado → Enviá
4. Si alguien responde → `http://localhost:3000/clientes` → Creá el cliente
5. El sistema genera el embed code automáticamente
6. Si paga → `http://localhost:3000/pagos` → Generá link MercadoPago

## 📱 Dashboard
- **URL pública**: `/`
- **Dashboard interno**: `/dashboard`
- **Buscador leads**: `/leads`
- **Outreach**: `/outreach`
- **CRM**: `/crm`
- **Clientes**: `/clientes`
- **Pagos**: `/pagos`
- **Templates**: `/templates`
