-- ============================================================
-- SCHEMA: Sistema Multiagente DIVINIA
-- Correr en: Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name text NOT NULL,
  status text DEFAULT 'running' CHECK (status IN ('running','completed','error')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  result jsonb,
  error text
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid REFERENCES agent_runs(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  status text DEFAULT 'running',
  data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_name ON agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_run_id ON agent_tasks(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_chats_created_at ON agent_chats(created_at);

-- RLS
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on agent_runs"
  ON agent_runs FOR ALL USING (true);
CREATE POLICY "Service role full access on agent_tasks"
  ON agent_tasks FOR ALL USING (true);
CREATE POLICY "Service role full access on agent_chats"
  ON agent_chats FOR ALL USING (true);

-- Asegurarse que la tabla leads tiene los campos necesarios
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_sent boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text DEFAULT '';
