-- Sistema de Turnos DIVINIA
-- Correr este SQL en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS booking_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  slot_duration_minutes integer DEFAULT 30,
  schedule jsonb DEFAULT '{
    "lun": {"open": "09:00", "close": "18:00"},
    "mar": {"open": "09:00", "close": "18:00"},
    "mie": {"open": "09:00", "close": "18:00"},
    "jue": {"open": "09:00", "close": "18:00"},
    "vie": {"open": "09:00", "close": "18:00"},
    "sab": null,
    "dom": null
  }'::jsonb,
  services jsonb DEFAULT '[]'::jsonb,
  blocked_dates jsonb DEFAULT '[]'::jsonb,
  advance_booking_days integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  booking_config_id uuid REFERENCES booking_configs(id) ON DELETE CASCADE NOT NULL,
  service_id text NOT NULL,
  service_name text NOT NULL,
  service_duration_minutes integer NOT NULL,
  service_price_ars integer DEFAULT 0,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  customer_name text NOT NULL,
  customer_phone text DEFAULT '',
  customer_email text DEFAULT '',
  customer_notes text DEFAULT '',
  status text DEFAULT 'confirmed'
    CHECK (status IN ('confirmed','cancelled','completed','no_show')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_booking_configs_client_id ON booking_configs(client_id);

ALTER TABLE booking_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read booking_configs" ON booking_configs FOR SELECT USING (true);
CREATE POLICY "Public insert appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Service full booking_configs" ON booking_configs FOR ALL USING (true);
CREATE POLICY "Service full appointments" ON appointments FOR ALL USING (true);
