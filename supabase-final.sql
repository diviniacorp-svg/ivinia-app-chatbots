CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

ALTER TABLE clients ADD COLUMN IF NOT EXISTS mrr NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rubro TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS negocio TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notas TEXT;

CREATE TABLE IF NOT EXISTS nucleus_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL, agente TEXT NOT NULL, contenido TEXT NOT NULL,
  importancia INT DEFAULT 5, tags TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW(), expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID, client_id TEXT, rubro TEXT NOT NULL DEFAULT 'general',
  productos TEXT[] NOT NULL DEFAULT '{}', precio_total NUMERIC NOT NULL DEFAULT 0,
  precio_adelanto NUMERIC, contenido TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'borrador', link_pago TEXT, mp_preference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL, plataforma TEXT NOT NULL DEFAULT 'instagram',
  tipo TEXT NOT NULL DEFAULT 'post', objetivo TEXT, titulo TEXT,
  caption TEXT, hashtags TEXT, prompt_imagen TEXT, prompt_video TEXT,
  imagen_url TEXT, video_url TEXT, freepik_job_id TEXT,
  status TEXT DEFAULT 'planificado', score_evaluacion INT,
  feedback_evaluacion TEXT, publicado_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL, categoria TEXT NOT NULL DEFAULT 'venta_otro',
  monto NUMERIC NOT NULL, moneda TEXT DEFAULT 'ARS', descripcion TEXT,
  client_id TEXT, lead_id UUID, comprobante_url TEXT, mp_payment_id TEXT,
  fecha DATE DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID, vapi_call_id TEXT, status TEXT DEFAULT 'scheduled',
  duracion_segundos INT, resultado TEXT, transcripcion TEXT, proximo_paso TEXT,
  scheduled_at TIMESTAMPTZ, started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL, action TEXT NOT NULL, date DATE, payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(agent, date, action)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_config_id UUID, cliente_nombre TEXT, cliente_telefono TEXT,
  servicio TEXT, fecha DATE, hora TIME, status TEXT DEFAULT 'pendiente',
  seña_pagada BOOLEAN DEFAULT FALSE, mp_payment_id TEXT, notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW ceo_metrics AS
SELECT
  (SELECT COUNT(*) FROM leads WHERE status = 'nuevo') as leads_nuevos,
  (SELECT COUNT(*) FROM leads WHERE status NOT IN ('cerrado','perdido')) as leads_activos,
  (SELECT COUNT(*) FROM leads WHERE score >= 70 AND status = 'nuevo') as leads_calientes,
  (SELECT COUNT(*) FROM clients WHERE status = 'active') as clientes_activos,
  (SELECT COUNT(*) FROM clients WHERE status = 'trial') as en_trial,
  (SELECT COALESCE(SUM(mrr), 0) FROM clients WHERE status = 'active') as mrr_actual,
  (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE) as reservas_hoy,
  (SELECT COUNT(*) FROM content_calendar WHERE status = 'planificado' AND fecha = CURRENT_DATE) as contenido_hoy,
  (SELECT COUNT(*) FROM outreach_messages WHERE status = 'generado') as mensajes_pendientes;
