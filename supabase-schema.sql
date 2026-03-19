-- ============================================================
-- DIVINIA - Schema completo de Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Templates de chatbot por rubro
CREATE TABLE IF NOT EXISTS templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rubro text NOT NULL,
  description text,
  system_prompt text NOT NULL,
  welcome_message text NOT NULL,
  faqs jsonb DEFAULT '[]'::jsonb,
  color_primary text DEFAULT '#6366f1',
  price_monthly integer DEFAULT 50000,
  trial_days integer DEFAULT 14,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Leads scrapeados
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  contact_name text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  website text DEFAULT '',
  instagram text DEFAULT '',
  city text NOT NULL,
  rubro text NOT NULL,
  score integer DEFAULT 0,
  status text DEFAULT 'nuevo' CHECK (status IN ('nuevo','contactado','propuesta','negociacion','cerrado','perdido')),
  notes text DEFAULT '',
  source text DEFAULT 'apify',
  outreach_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clientes activos
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  contact_name text DEFAULT '',
  email text NOT NULL,
  phone text DEFAULT '',
  custom_config jsonb DEFAULT '{}'::jsonb,
  chatbot_id text UNIQUE NOT NULL,
  embed_code text DEFAULT '',
  plan text DEFAULT 'trial' CHECK (plan IN ('trial','basic','pro','enterprise')),
  status text DEFAULT 'trial' CHECK (status IN ('trial','active','expired','cancelled')),
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz DEFAULT (now() + interval '14 days'),
  mp_subscription_id text DEFAULT '',
  whatsapp_number text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Historial de conversaciones WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  wa_number text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(phone, wa_number);

-- Leads generados por WhatsApp (una fila por número que inicia conversación)
CREATE TABLE IF NOT EXISTS whatsapp_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  wa_number text NOT NULL,
  company_name text DEFAULT '',
  summary text DEFAULT '',
  interested_in text DEFAULT '',
  status text DEFAULT 'nuevo' CHECK (status IN ('nuevo','en_conversacion','interesado','cerrado')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(phone, wa_number)
);

-- Pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text DEFAULT 'ARS',
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  mp_preference_id text DEFAULT '',
  mp_payment_id text DEFAULT '',
  type text DEFAULT 'one-time' CHECK (type IN ('one-time','subscription')),
  created_at timestamptz DEFAULT now()
);

-- Campañas de outreach
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rubro text NOT NULL,
  city text NOT NULL,
  total_leads integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  replies integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Mensajes de outreach individuales
CREATE TABLE IF NOT EXISTS outreach_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES outreach_campaigns(id) ON DELETE SET NULL,
  channel text DEFAULT 'email' CHECK (channel IN ('email','whatsapp')),
  subject text DEFAULT '',
  message text NOT NULL,
  whatsapp_link text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending','sent','opened','replied')),
  sent_at timestamptz,
  resend_message_id text DEFAULT ''
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_rubro ON leads(rubro);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_chatbot_id ON clients(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_lead_id ON outreach_messages(lead_id);

-- RLS Policies (Row Level Security)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

-- Para el dashboard (service role tiene acceso total)
-- Estas políticas permiten acceso total cuando se usa la service_role key
CREATE POLICY "Service role full access on templates" ON templates FOR ALL USING (true);
CREATE POLICY "Service role full access on leads" ON leads FOR ALL USING (true);
CREATE POLICY "Service role full access on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Service role full access on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Service role full access on outreach_campaigns" ON outreach_campaigns FOR ALL USING (true);
CREATE POLICY "Service role full access on outreach_messages" ON outreach_messages FOR ALL USING (true);
