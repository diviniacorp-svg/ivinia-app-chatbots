-- ============================================================
-- SCHEMA: Sistema de Turnos DIVINIA
-- Correr en: Supabase → SQL Editor
-- ============================================================

-- Configuración del sistema de turnos por cliente
CREATE TABLE IF NOT EXISTS booking_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  services jsonb DEFAULT '[]',          -- [{ id, name, duration_minutes, price_ars, description }]
  schedule jsonb DEFAULT '{}',          -- { lun: { open, close } | null, mar: ..., etc }
  blocked_dates text[] DEFAULT '{}',    -- fechas bloqueadas YYYY-MM-DD
  slot_duration_minutes integer DEFAULT 30,
  advance_booking_days integer DEFAULT 30,
  owner_phone text DEFAULT '',          -- WhatsApp del dueño (sin + ni espacios)
  owner_pin text DEFAULT '1234',        -- PIN de 4 dígitos para panel del dueño
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Turnos / solicitudes
CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  booking_config_id uuid REFERENCES booking_configs(id) ON DELETE SET NULL,
  service_id text DEFAULT '',
  service_name text NOT NULL,
  service_duration_minutes integer DEFAULT 30,
  service_price_ars integer DEFAULT 0,
  appointment_date date NOT NULL,       -- YYYY-MM-DD
  appointment_time text NOT NULL,       -- HH:MM
  customer_name text NOT NULL,
  customer_phone text DEFAULT '',
  customer_email text DEFAULT '',
  customer_notes text DEFAULT '',
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  sena_ars integer DEFAULT 0,           -- seña cobrada
  saldo_ars integer GENERATED ALWAYS AS (service_price_ars - sena_ars) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_booking_configs_client_id ON booking_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- RLS
ALTER TABLE booking_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on booking_configs"
  ON booking_configs FOR ALL USING (true);
CREATE POLICY "Service role full access on appointments"
  ON appointments FOR ALL USING (true);

-- ============================================================
-- MIGRACION: agregar columnas si las tablas ya existen
-- (correr solo si ya tenés las tablas sin estas columnas)
-- ============================================================

-- Agregar owner_phone y owner_pin a booking_configs existente
ALTER TABLE booking_configs ADD COLUMN IF NOT EXISTS owner_phone text DEFAULT '';
ALTER TABLE booking_configs ADD COLUMN IF NOT EXISTS owner_pin text DEFAULT '1234';

-- Agregar seña a appointments existente
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sena_ars integer DEFAULT 0;

-- Agregar saldo_ars generado (solo si sena_ars ya existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'saldo_ars'
  ) THEN
    ALTER TABLE appointments
      ADD COLUMN saldo_ars integer GENERATED ALWAYS AS (service_price_ars - sena_ars) STORED;
  END IF;
END $$;

-- Actualizar status check para incluir 'pending' y 'pending_payment'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('pending','pending_payment','confirmed','cancelled','completed','no_show'));
