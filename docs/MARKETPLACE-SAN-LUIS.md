# DIVINIA Market — Blueprint del Producto

## Qué es
Super app de comercio local para San Luis Capital. Marketplace unificado con delivery integrado, sección de oficios/servicios y loyalty cards. Administrado por DIVINIA, replicable en otras ciudades como template SaaS.

**Referencia base:** deliveryya.store (replicar y expandir — comisión cero, suscripción fija)

---

## Tres Verticales

### 1. Tiendas & Restaurantes (delivery)
- Todos los comercios de San Luis por categoría (comida, farmacia, electrónica, ropa, etc.)
- Sistema de delivery propio: cliente pide → DIVINIA asigna repartidor → tracking en tiempo real
- Costo delivery fijo al cliente: ~$3.500 ARS
- Repartidor gana delivery fee + propina (sin comisión)
- Comercio paga suscripción mensual, CERO comisión por venta

### 2. Oficios & Servicios (agendamiento)
- Plomeros, electricistas, pintores, peluquería a domicilio, limpieza, etc.
- Cliente busca por oficio → ve perfil + reseñas → agenda → paga seña online
- Prestador paga suscripción menor (o % sobre primera transacción como modelo alternativo)

### 3. Loyalty & Fidelización
- Tarjeta digital de cliente frecuente por comercio
- Sistema de puntos canjeables dentro del mismo marketplace
- DIVINIA genera reportes de retención para el comercio (upsell de analytics)

---

## Modelo de Negocio DIVINIA

| Ingreso | Monto | Frecuencia |
|---------|-------|------------|
| Suscripción comercio básico | $35.000 ARS | Mensual |
| Suscripción comercio pro (con web propia) | $65.000 ARS | Mensual |
| Suscripción oficio/servicio | $20.000 ARS | Mensual |
| Publicidad featured listing | $15.000–$50.000 ARS | Mensual |
| Web propia dentro del marketplace | $100.000 ARS | One-time + mantenimiento |
| Comisión delivery (opcional 5%) | Variable | Por pedido |

**Target San Luis Capital:** ~800 comercios activos, ~500 oficios. Penetración 10% = 130 suscripciones = ~$5.200.000 ARS/mes recurrente.

---

## Stack Técnico

**Dentro de DIVINIA OS** — misma base Next.js 14 + Supabase + Vercel + MercadoPago.

Nueva sección de rutas:
```
app/(market)/           ← nuevo route group público
  page.tsx              ← landing marketplace
  [categoria]/
    page.tsx            ← lista tiendas por categoría
    [slug]/
      page.tsx          ← tienda individual + menú
  pedido/[id]/
    page.tsx            ← tracking en tiempo real
  oficios/
    page.tsx            ← directorio de servicios
    [slug]/
      page.tsx          ← perfil prestador + agendar

app/(dashboard)/market/  ← panel admin DIVINIA
  page.tsx               ← overview marketplace (revenue, pedidos, comercios)
  comercios/page.tsx     ← gestionar comercios adheridos
  pedidos/page.tsx       ← pedidos en tiempo real (mapa + lista)
  repartidores/page.tsx  ← gestión de repartidores
  loyalty/page.tsx       ← reportes de fidelización

app/tienda/[slug]/       ← microsite individual por comercio (upsell)
  page.tsx
```

---

## Schema Supabase (tablas nuevas — prefijo `mp_`)

```sql
-- Categorías
CREATE TABLE mp_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  emoji text,
  tipo text CHECK (tipo IN ('comida','tienda','oficio')),
  orden int DEFAULT 0
);

-- Comercios
CREATE TABLE mp_comercios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text UNIQUE NOT NULL,
  categoria_id uuid REFERENCES mp_categorias,
  descripcion text,
  logo_url text,
  banner_url text,
  telefono text,
  direccion text,
  lat numeric, lng numeric,
  horario jsonb,           -- { lun: "9-21", mar: "9-21", ... }
  activo bool DEFAULT true,
  plan text DEFAULT 'basico' CHECK (plan IN ('basico','pro','oficio')),
  mp_subscription_id text,
  created_at timestamptz DEFAULT now()
);

-- Productos/Menú
CREATE TABLE mp_productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id uuid REFERENCES mp_comercios ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  imagen_url text,
  disponible bool DEFAULT true,
  categoria_menu text,
  orden int DEFAULT 0
);

-- Clientes del marketplace
CREATE TABLE mp_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text,
  telefono text UNIQUE,
  email text,
  direccion_default text,
  lat numeric, lng numeric,
  created_at timestamptz DEFAULT now()
);

-- Repartidores
CREATE TABLE mp_repartidores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text UNIQUE,
  activo bool DEFAULT true,
  disponible bool DEFAULT false,
  lat_actual numeric, lng_actual numeric,
  updated_at timestamptz DEFAULT now()
);

-- Pedidos
CREATE TABLE mp_pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES mp_clientes,
  comercio_id uuid REFERENCES mp_comercios,
  repartidor_id uuid REFERENCES mp_repartidores,
  items jsonb NOT NULL,              -- [{ producto_id, nombre, precio, cantidad }]
  total numeric NOT NULL,
  fee_delivery numeric DEFAULT 3500,
  propina numeric DEFAULT 0,
  estado text DEFAULT 'pendiente' CHECK (estado IN (
    'pendiente','confirmado','preparando','en_camino','entregado','cancelado'
  )),
  direccion_entrega text NOT NULL,
  lat_entrega numeric, lng_entrega numeric,
  mp_payment_id text,
  notas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loyalty
CREATE TABLE mp_loyalty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES mp_clientes,
  comercio_id uuid REFERENCES mp_comercios,
  puntos int DEFAULT 0,
  visitas int DEFAULT 0,
  ultima_compra timestamptz,
  UNIQUE(cliente_id, comercio_id)
);

-- Suscripciones de comercios
CREATE TABLE mp_suscripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id uuid REFERENCES mp_comercios UNIQUE,
  plan text NOT NULL,
  monto numeric NOT NULL,
  estado text DEFAULT 'trial' CHECK (estado IN ('trial','activo','pausado','cancelado')),
  trial_ends_at timestamptz,
  mp_subscription_id text,
  created_at timestamptz DEFAULT now()
);

-- Índices clave
CREATE INDEX ON mp_pedidos(estado, created_at DESC);
CREATE INDEX ON mp_productos(comercio_id, disponible);
CREATE INDEX ON mp_comercios(categoria_id, activo);
```

---

## Diseño & Identidad Visual

**Diferente a DIVINIA OS** — el marketplace necesita su propia identidad más cálida/comercial:
- Background: `#FFFBF5` (crema cálido)
- Accent: `#FF6B35` (naranja San Luis — energía, comida, comercio)
- Dark: `#1A1A1A`
- Tipografía: misma Bricolage Grotesque (consistencia DIVINIA)
- Cards de comercios: foto grande, nombre, categoría emoji, badge "Abierto" verde

**Nombre candidatos:**
- **DIVINIA Market** (usa brand DIVINIA)
- **Mercado SL** (local, geográfico)
- **YaLlega** (enfocado en delivery)
- **Plaza Digital San Luis** (municipio-friendly para B2G)

---

## MVP — Fases

### Fase 1 (2-3 semanas) — Catálogo + Pedidos
- Landing marketplace con 10 comercios seed (contactar manualmente)
- Página de tienda con menú
- Flujo de pedido completo (carrito → pago MercadoPago → confirmación)
- Panel básico para comercio: ver pedidos, marcar estado
- Panel DIVINIA: gestionar comercios + ver pedidos en tiempo real

### Fase 2 (1-2 semanas) — Delivery en vivo
- App/PWA para repartidores (Next.js PWA o React Native)
- Asignación de pedidos a repartidores
- Tracking básico (repartidor actualiza estado manualmente primero)

### Fase 3 (ongoing) — Oficios + Loyalty
- Sección de oficios con perfil + sistema de agenda (reutilizar turnero)
- Tarjeta loyalty digital
- Analytics para comercios
- Publicidad featured

---

## Integración con DIVINIA OS

- **Clientes DIVINIA** que contraten chatbot → oferta de sumarse al marketplace
- **Turnero IA** se conecta con la sección de Oficios (mismo backend de bookings)
- **Content Factory** genera posts para comercios adheridos (upsell)
- **Panel DIVINIA** — sección `/dashboard/market` integrada al panel existente

---

## Próximos Pasos (para cuando arranque la sesión)

1. Correr `mp_` schema en Supabase MCP
2. Crear route group `app/(market)/`
3. Landing pública del marketplace (identidad naranja)
4. Seed de 5 comercios demo para testear flujo
5. Panel admin básico en `/dashboard/market`
