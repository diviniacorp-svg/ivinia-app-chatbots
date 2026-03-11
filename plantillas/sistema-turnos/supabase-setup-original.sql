-- ══════════════════════════════════════════════════════
-- DIVINIA · Sistema de Turnos Online
-- PASO 1: Correr este SQL en el SQL Editor de Supabase
-- ══════════════════════════════════════════════════════

-- Tabla: solicitudes de turnos (desde la landing pública)
CREATE TABLE IF NOT EXISTS solicitudes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text,
  tel text,
  servicio text,
  fecha date,
  hora_preferida time,
  notas text,
  estado text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

-- Tabla: turnos confirmados (cargados desde el panel admin)
CREATE TABLE IF NOT EXISTS turnos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha date,
  cliente text,
  tel text,
  instagram text,
  notas_piel text,
  servicio text,
  otro_srv text,
  duracion integer DEFAULT 60,
  hora_ini time,
  hora_fin time,
  estado text DEFAULT 'reservado',
  precio_total numeric,
  metodo text DEFAULT 'efectivo',
  sena_recibida numeric,
  saldo_cobrado numeric,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Tabla: alquileres de máquina (si el negocio tiene máquinas)
CREATE TABLE IF NOT EXISTS alquileres (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha_ini date,
  fecha_fin date,
  cliente text,
  tel text,
  dir text,
  hora_ini time,
  hora_fin time,
  precio numeric,
  estado text DEFAULT 'pendiente',
  zona text,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Tabla: días disponibles para reservar (controlados desde el panel)
CREATE TABLE IF NOT EXISTS dias_disponibles (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fecha date UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Deshabilitar RLS (acceso público con anon key)
ALTER TABLE solicitudes     DISABLE ROW LEVEL SECURITY;
ALTER TABLE turnos          DISABLE ROW LEVEL SECURITY;
ALTER TABLE alquileres      DISABLE ROW LEVEL SECURITY;
ALTER TABLE dias_disponibles DISABLE ROW LEVEL SECURITY;

-- Verificar que quedó bien
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('solicitudes','turnos','alquileres','dias_disponibles');
