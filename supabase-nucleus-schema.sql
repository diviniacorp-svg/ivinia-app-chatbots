-- ============================================================
-- DIVINIA NUCLEUS — Schema Supabase Completo
-- Correr en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── MEMORIA DEL SISTEMA ──────────────────────────────────────

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
CREATE INDEX IF NOT EXISTS idx_memory_activo ON nucleus_memory(activo);

-- ── LEADS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  negocio TEXT,
  rubro TEXT,
  telefono TEXT,
  email TEXT,
  instagram TEXT,
  web TEXT,
  ciudad TEXT DEFAULT 'San Luis',
  provincia TEXT DEFAULT 'San Luis',
  score INT DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo','contactado','propuesta','negociacion','cerrado','perdido','nurturing','reactivar')),
  canal_entrada TEXT DEFAULT 'prospector' CHECK (canal_entrada IN ('prospector','landing','instagram','ads','referido','manual')),
  outreach_enviado BOOLEAN DEFAULT FALSE,
  intentos_contacto INT DEFAULT 0,
  ultimo_contacto TIMESTAMPTZ,
  proximo_followup TIMESTAMPTZ,
  notas TEXT,
  fuente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_rubro ON leads(rubro);

-- ── PROPUESTAS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  client_id TEXT,
  rubro TEXT NOT NULL,
  productos TEXT[] NOT NULL,
  precio_total NUMERIC NOT NULL,
  precio_adelanto NUMERIC,
  contenido TEXT NOT NULL,
  status TEXT DEFAULT 'borrador' CHECK (status IN ('borrador','enviada','vista','aceptada','rechazada')),
  link_pago TEXT,
  mp_preference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MENSAJES DE OUTREACH ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp','email','voz','instagram')),
  tipo TEXT NOT NULL CHECK (tipo IN ('primer_contacto','followup_1','followup_2','followup_final','reactivacion')),
  contenido TEXT NOT NULL,
  status TEXT DEFAULT 'generado' CHECK (status IN ('generado','enviado','respondido','sin_respuesta')),
  enviado_at TIMESTAMPTZ,
  respondido_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CALENDARIO DE CONTENIDO ───────────────────────────────────

CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  plataforma TEXT NOT NULL CHECK (plataforma IN ('instagram','youtube','tiktok','linkedin')),
  tipo TEXT NOT NULL CHECK (tipo IN ('post','reel','story','video','shorts')),
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

-- ── REGISTROS FINANCIEROS ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso','egreso')),
  categoria TEXT NOT NULL CHECK (categoria IN ('venta_turnero','venta_chatbot','venta_contenido','venta_nucleus','venta_otro','api_claude','api_freepik','api_vapi','api_otro','infraestructura','impuestos','otro')),
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

-- ── LLAMADAS DE VOZ ───────────────────────────────────────────

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

-- ── AGENT RUNS (ampliar la existente) ────────────────────────

CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running','completed','error','cancelled')),
  input JSONB,
  result JSONB,
  error TEXT,
  tokens_used INT,
  costo_usd NUMERIC(10,6),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_name ON agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON agent_runs(started_at DESC);

-- ── AGENT LOGS (plan diario CEO) ──────────────────────────────

CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  date DATE,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent, date, action)
);

-- ── AGENT CHATS (historial orquestador) ──────────────────────

CREATE TABLE IF NOT EXISTS agent_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENTES ACTIVOS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rubro TEXT,
  ciudad TEXT DEFAULT 'San Luis',
  status TEXT DEFAULT 'trial' CHECK (status IN ('trial','active','paused','cancelled')),
  plan TEXT CHECK (plan IN ('turnero_mensual','turnero_unico','chatbot_basico','chatbot_pro','content_factory','nucleus')),
  mrr NUMERIC DEFAULT 0,
  trial_start TIMESTAMPTZ DEFAULT NOW(),
  trial_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  active_since TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  lead_id UUID REFERENCES leads(id),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOOKING CONFIGS (Turnero) ────────────────────────────────

CREATE TABLE IF NOT EXISTS booking_configs (
  config_id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  rubro TEXT,
  active BOOLEAN DEFAULT TRUE,
  client_id TEXT REFERENCES clients(id),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOOKINGS (Turnos) ─────────────────────────────────────────

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

-- ── FUNCIONES ÚTILES ──────────────────────────────────────────

-- Actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Vista de métricas del CEO (se usa en el heartbeat)
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

-- ── RLS (Row Level Security) ──────────────────────────────────
-- Por ahora deshabilitado para simplicidad, activar en producción con clientes múltiples

-- ============================================================
-- FIN DEL SCHEMA
-- Para cargar datos demo: GET /api/seed/demo-agents
-- ============================================================
