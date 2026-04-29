-- DIVINIA — Strategy System Schema
-- Correr en Supabase SQL Editor

-- ─── Projects table ───────────────────────────────────────────────────────────
-- Engloba dos tipos de proyecto:
--   tipo='cliente'          → engagement con un PYME cliente
--   tipo='producto-divinia' → producto propio de DIVINIA (Turnero, Nucleus, etc.)
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
  nombre          TEXT NOT NULL,
  tagline         TEXT,
  descripcion     TEXT,
  tipo            TEXT NOT NULL DEFAULT 'cliente'
                    CHECK (tipo IN ('cliente', 'producto-divinia', 'interno')),
  categoria       TEXT,   -- 'turnero' | 'chatbot' | 'landing' | 'content_factory' | 'nucleus' | 'ads'
  status          TEXT DEFAULT 'en-desarrollo'
                    CHECK (status IN ('idea', 'en-desarrollo', 'activo', 'pausado', 'completado')),
  icon            TEXT DEFAULT '📁',
  color           TEXT DEFAULT '#C6FF3D',
  progreso        INT DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  -- Estrategia: objetivo, audiencia, kpis, approach, insights, notas
  estrategia      JSONB DEFAULT '{}',
  -- Scope del proyecto: deliverables, hitos, qué incluye, qué NO incluye
  scope           JSONB DEFAULT '{}',
  -- Próximos pasos como array de strings
  proximos        JSONB DEFAULT '[]',
  -- KPIs: [{label, valor, meta}]
  kpis            JSONB DEFAULT '[]',
  href            TEXT,
  fecha_inicio    DATE,
  fecha_entrega   DATE,
  presupuesto_ars BIGINT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at automático
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_projects_updated_at();

-- ─── Add estrategia to clients ────────────────────────────────────────────────
-- Estructura del JSONB:
-- {
--   objetivo_3m: string,
--   health_score: 0-100,
--   productos_activos: string[],
--   contenido: { mix: {educativo, venta, comunidad, entretenimiento}, frecuencia: string, pilares: string[] },
--   proximas_acciones: string[],
--   notas: string,
--   ultima_revision: ISO timestamp
-- }
ALTER TABLE clients ADD COLUMN IF NOT EXISTS estrategia JSONB DEFAULT '{}';

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON projects;
CREATE POLICY "Service role full access" ON projects
  USING (true) WITH CHECK (true);

-- ─── Seed: proyectos DIVINIA internos ─────────────────────────────────────────
-- (Los productos propios de DIVINIA como proyectos en la DB)
INSERT INTO projects (nombre, tagline, descripcion, tipo, categoria, status, icon, color, progreso,
  estrategia, proximos, kpis) VALUES

('Turnero IA',
 'Sistema de reservas inteligente para PYMEs',
 'Producto hero de DIVINIA. Sistema de turnos con IA, confirmaciones automáticas y panel de gestión. Activo y en venta desde San Luis.',
 'producto-divinia', 'turnero', 'activo', '📅', '#C6FF3D', 85,
 '{"objetivo":"Llegar a 20 clientes pagos antes de agosto 2026","mercado":"PYMEs con turnos: estéticas, peluquerías, médicos, veterinarias, talleres","diferencial":"Setup en 24hs, sin hardware, con seña automática MP","geo":"San Luis → Cuyo → Nacional","precio_desde":43000}',
 '["Integración recordatorios WhatsApp","Analytics por rubro","App PWA para clientes","Demo videos por rubro"]',
 '[{"label":"Clientes activos","valor":"1 (Romina)","meta":"20"},{"label":"MRR","valor":"$43k","meta":"$860k"},{"label":"Setup","valor":"24-48hs"}]'),

('NUCLEUS IA',
 'Cerebro IA para negocios — memoria, agentes, automatización total',
 'El producto más diferenciador. Sistema operativo IA que automatiza el negocio completo del cliente. Primer cierre target: Shopping del Usado.',
 'producto-divinia', 'nucleus', 'en-desarrollo', '🧠', '#A78BFA', 40,
 '{"objetivo":"Cerrar primer cliente enterprise antes de junio 2026","mercado":"Empresas y organismos con procesos repetitivos y alta carga operativa","diferencial":"IA + memoria + automatización sin código + agentes propios","precio_desde":800000}',
 '["Cerrar Shopping del Usado","Entregar Dorotea (Santiago Peral)","Memory store en Supabase","Agente comercial autónomo"]',
 '[{"label":"Primer cliente","valor":"En negociación"},{"label":"Precio base","valor":"$800k"},{"label":"Agentes","valor":"40+ definidos"}]'),

('Market San Luis',
 'Super app comercio local — marketplace + delivery + oficios',
 'Webapp independiente para la comunidad de San Luis. Comercios, delivery, oficios y loyalty en una sola app.',
 'producto-divinia', 'marketplace', 'en-desarrollo', '🗺️', '#38BDF8', 20,
 '{"objetivo":"50 comercios activos en San Luis para fin de 2026","mercado":"Comercios locales San Luis Capital (~3000 negocios)","modelo":"Comisión por transacción + suscripción mensual","escala":"San Luis → Cuyo → Nacional"}',
 '["Landing propia de Market SL","Reclutar 10 comercios piloto","Sistema de delivery básico","Loyalty por QR"]',
 '[{"label":"Comercios objetivo","valor":"50 en 6 meses"},{"label":"Ciudad piloto","valor":"San Luis Capital"},{"label":"Modelo","valor":"Comisión + suscripción"}]'),

('Content Factory',
 'Producción masiva de contenido IA para clientes DIVINIA',
 'Sistema para producir y programar contenido de redes sociales. Reels, posts, copys, calendarios en minutos.',
 'producto-divinia', 'content_factory', 'activo', '🎬', '#FF6B5B', 65,
 '{"objetivo":"Ofrecer plan de contenido IA a todos los clientes Turnero como upsell","modelo":"$80k básico / $120k pro / $150k full mensual","diferencial":"Generación IA + diseño Freepik + publicación automática"}',
 '["Templates de contenido por rubro","Publicación automática Instagram","Generador de reels con Remotion","Integración con Freepik API"]',
 '[{"label":"Posts generados","valor":"Ver /redes"},{"label":"Precio desde","valor":"$80k/mes"},{"label":"Automatización","valor":"80%"}]')

ON CONFLICT DO NOTHING;
