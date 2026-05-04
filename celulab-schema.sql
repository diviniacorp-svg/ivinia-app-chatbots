-- ============================================================
-- CELULAB — Schema de proveedores y scraping de precios
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Proveedores de repuestos (MercadoLibre, CelRepair, etc.)
CREATE TABLE IF NOT EXISTS cl_providers (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  url           text NOT NULL,
  scrape_type   text DEFAULT 'manual' CHECK (scrape_type IN ('playwright', 'manual')),
  scrape_selector text DEFAULT '',
  is_active     boolean DEFAULT true,
  last_scraped_at timestamptz,
  notes         text DEFAULT '',
  created_at    timestamptz DEFAULT now()
);

-- Catálogo interno de repuestos (uno por tipo de reparación)
CREATE TABLE IF NOT EXISTS cl_parts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  category     text NOT NULL,
  service_name text DEFAULT '',  -- nombre exacto del servicio en booking_configs.services
  notes        text DEFAULT '',
  created_at   timestamptz DEFAULT now()
);

-- Precios scrapeados por proveedor × repuesto
CREATE TABLE IF NOT EXISTS cl_provider_prices (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES cl_providers(id) ON DELETE CASCADE NOT NULL,
  part_id     uuid REFERENCES cl_parts(id) ON DELETE CASCADE NOT NULL,
  cost_ars    integer NOT NULL,
  url_item    text DEFAULT '',
  scraped_at  timestamptz DEFAULT now(),
  is_latest   boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_cl_prices_part     ON cl_provider_prices(part_id);
CREATE INDEX IF NOT EXISTS idx_cl_prices_provider ON cl_provider_prices(provider_id);
CREATE INDEX IF NOT EXISTS idx_cl_prices_latest   ON cl_provider_prices(part_id, is_latest) WHERE is_latest = true;

-- Log de cada run de scraping
CREATE TABLE IF NOT EXISTS cl_scrape_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id   uuid REFERENCES cl_providers(id) ON DELETE CASCADE,
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  items_found   integer DEFAULT 0,
  error_message text DEFAULT '',
  started_at    timestamptz DEFAULT now(),
  finished_at   timestamptz
);

-- RLS
ALTER TABLE cl_providers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cl_parts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cl_provider_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cl_scrape_logs     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on cl_providers"       ON cl_providers       FOR ALL USING (true);
CREATE POLICY "Service role full access on cl_parts"           ON cl_parts           FOR ALL USING (true);
CREATE POLICY "Service role full access on cl_provider_prices" ON cl_provider_prices FOR ALL USING (true);
CREATE POLICY "Service role full access on cl_scrape_logs"     ON cl_scrape_logs     FOR ALL USING (true);
