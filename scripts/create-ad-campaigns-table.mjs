// Run: node scripts/create-ad-campaigns-table.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = {}
readFileSync(resolve(__dirname, '../.env.local'), 'utf8').split('\n').forEach(line => {
  const eq = line.indexOf('=')
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
})

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  // Verificar si ya existe
  const { data: existing } = await db.from('ad_campaigns').select('id').limit(1)
  if (existing !== null) {
    console.log('✅ Tabla ad_campaigns ya existe')
    return
  }

  console.log('❌ Tabla ad_campaigns no existe — correr el SQL de abajo en el SQL Editor de Supabase:')
  console.log('\nURL: https://supabase.com/dashboard/project/dsekibwfbbxnglvcirso/sql\n')
  console.log(`
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name         TEXT NOT NULL,
  rubro               TEXT,
  platform            TEXT NOT NULL CHECK (platform IN ('meta','google','instagram','tiktok')),
  campaign_name       TEXT NOT NULL,
  objective           TEXT DEFAULT 'leads',
  status              TEXT DEFAULT 'borrador' CHECK (status IN ('borrador','activa','pausada','finalizada')),
  budget_monthly_ars  NUMERIC DEFAULT 0,
  budget_spent_ars    NUMERIC DEFAULT 0,
  impressions         INTEGER DEFAULT 0,
  clicks              INTEGER DEFAULT 0,
  leads               INTEGER DEFAULT 0,
  conversions         INTEGER DEFAULT 0,
  cpc_ars             NUMERIC DEFAULT 0,
  cpl_ars             NUMERIC DEFAULT 0,
  roas                NUMERIC DEFAULT 0,
  start_date          DATE,
  end_date            DATE,
  target_audience     TEXT,
  ad_copies           JSONB DEFAULT '[]',
  strategy            JSONB,
  notas               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_ad_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ad_campaigns_updated_at ON ad_campaigns;
CREATE TRIGGER trg_ad_campaigns_updated_at
  BEFORE UPDATE ON ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_ad_campaigns_updated_at();

-- RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_ad_campaigns" ON ad_campaigns;
CREATE POLICY "service_role_all_ad_campaigns" ON ad_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed demo
INSERT INTO ad_campaigns (client_name, rubro, platform, campaign_name, objective, status, budget_monthly_ars, impressions, clicks, leads, cpc_ars, cpl_ars)
VALUES
  ('Estética Luna Llena', 'estetica', 'meta', 'Promoción Marzo — Lifting facial', 'leads', 'activa', 80000, 24500, 312, 18, 256, 4444),
  ('Clínica San Martín', 'clinica', 'instagram', 'Turnos consulta general', 'leads', 'activa', 120000, 41200, 489, 32, 245, 3750),
  ('Taller AutoFix', 'taller', 'meta', 'Cambio de aceite + descuento', 'traffic', 'pausada', 50000, 8900, 143, 7, 350, 7142)
ON CONFLICT DO NOTHING;
`)
}

run().catch(console.error)
