-- ============================================================
-- DIVINIA NUCLEUS — Migración v2 (segura, idempotente)
-- Solo agrega lo que falta. No rompe nada existente.
-- Correr en: https://supabase.com/dashboard/project/cdgthrelwqrzhuylmcgf/sql
-- ============================================================

-- ── 1. NUEVA TABLA: nucleus_memory ───────────────────────────
CREATE TABLE IF NOT EXISTS nucleus_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('decision', 'aprendizaje', 'contexto', 'alerta', 'estado')),
  agente TEXT NOT NULL,
  contenido TEXT NOT NULL,
  importancia INT DEFAULT 5 CHECK (importancia BETWEEN 1 AND 10),
  tags TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_memory_agente ON nucleus_memory(agente);
CREATE INDEX IF NOT EXISTS idx_memory_tipo ON nucleus_memory(tipo);

-- ── 2. AMPLIAR: leads ────────────────────────────────────────
ALTER TABLE leads ADD COLUMN IF NOT EXISTS negocio TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rubro TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS web TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ciudad TEXT DEFAULT 'San Luis';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS provincia TEXT DEFAULT 'San Luis';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS canal_entrada TEXT DEFAULT 'prospector';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_enviado BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS intentos_contacto INT DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ultimo_contacto TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proximo_followup TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fuente TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);

-- ── 3. NUEVA TABLA: proposals ────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  client_id TEXT,
  rubro TEXT NOT NULL DEFAULT 'general',
  productos TEXT[] NOT NULL DEFAULT '{}',
  precio_total NUMERIC NOT NULL DEFAULT 0,
  precio_adelanto NUMERIC,
  contenido TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'borrador' CHECK (status IN ('borrador','enviada','vista','aceptada','rechazada')),
  link_pago TEXT,
  mp_preference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. AMPLIAR: outreach_messages ────────────────────────────
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS canal TEXT DEFAULT 'whatsapp';
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'primer_contacto';
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS contenido TEXT;
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'generado';
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS enviado_at TIMESTAMPTZ;
ALTER TABLE outreach_messages ADD COLUMN IF NOT EXISTS respondido_at TIMESTAMPTZ;

-- ── 5. NUEVA TABLA: content_calendar ────────────────────────
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  plataforma TEXT NOT NULL DEFAULT 'instagram' CHECK (plataforma IN ('instagram','youtube','tiktok','linkedin')),
  tipo TEXT NOT NULL DEFAULT 'post' CHECK (tipo IN ('post','reel','story','video','shorts')),
  objetivo TEXT CHECK (objetivo IN ('awareness','consideracion','conversion')),
  titulo TEXT,
  caption TEXT,
  hashtags TEXT,
  prompt_imagen TEXT,
  prompt_video TEXT,
  imagen_url TEXT,
  video_url TEXT,
  freepik_job_id TEXT,
  status TEXT DEFAULT 'planificado' CHECK (status IN ('planificado','en_produccion','listo','publicado','cancelado')),
  score_evaluacion INT,
  feedback_evaluacion TEXT,
  publicado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_fecha ON content_calendar(fecha);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_calendar(status);

-- ── 6. NUEVA TABLA: financial_records ───────────────────────
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso','egreso')),
  categoria TEXT NOT NULL DEFAULT 'venta_otro',
  monto NUMERIC NOT NULL,
  moneda TEXT DEFAULT 'ARS',
  descripcion TEXT,
  client_id TEXT,
  lead_id UUID REFERENCES leads(id),
  comprobante_url TEXT,
  mp_payment_id TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_financial_tipo ON financial_records(tipo);
CREATE INDEX IF NOT EXISTS idx_financial_fecha ON financial_records(fecha);

-- ── 7. NUEVA TABLA: voice_calls ──────────────────────────────
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  vapi_call_id TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','calling','completed','no_answer','failed')),
  duracion_segundos INT,
  resultado TEXT CHECK (resultado IN ('interesado','no_interesado','volver_a_llamar','no_disponible','numero_incorrecto')),
  transcripcion TEXT,
  proximo_paso TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. AMPLIAR: agent_runs ───────────────────────────────────
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS input JSONB;
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS result JSONB;
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS tokens_used INT;
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS costo_usd NUMERIC(10,6);
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_agent_runs_name ON agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON agent_runs(started_at DESC);

-- ── 9. NUEVA TABLA: agent_logs ───────────────────────────────
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  date DATE,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent, date, action)
);

-- ── 10. AMPLIAR: agent_chats ─────────────────────────────────
ALTER TABLE agent_chats ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ── 11. AMPLIAR: clients ─────────────────────────────────────
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rubro TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ciudad TEXT DEFAULT 'San Luis';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS mrr NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE clients ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
ALTER TABLE clients ADD COLUMN IF NOT EXISTS active_since TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── 12. AMPLIAR: booking_configs ─────────────────────────────
ALTER TABLE booking_configs ADD COLUMN IF NOT EXISTS rubro TEXT;
ALTER TABLE booking_configs ADD COLUMN IF NOT EXISTS client_id TEXT REFERENCES clients(id);
ALTER TABLE booking_configs ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- ── 13. NUEVA TABLA: bookings ────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id TEXT REFERENCES booking_configs(config_id),
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  servicio TEXT,
  fecha DATE,
  hora TIME,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente','confirmado','cancelado','completado')),
  seña_pagada BOOLEAN DEFAULT FALSE,
  mp_payment_id TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_fecha ON bookings(fecha);
CREATE INDEX IF NOT EXISTS idx_bookings_config ON bookings(config_id);

-- ── 14. FUNCIÓN update_updated_at ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (IF NOT EXISTS en triggers requiere workaround)
DO $$ BEGIN
  CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 15. VISTA CEO METRICS ────────────────────────────────────
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

-- ============================================================
-- ✅ DIVINIA NUCLEUS v2 — Migración completa
-- Próximo paso: GET /api/seed/demo-agents  →  para ver la oficina animada
-- ============================================================
