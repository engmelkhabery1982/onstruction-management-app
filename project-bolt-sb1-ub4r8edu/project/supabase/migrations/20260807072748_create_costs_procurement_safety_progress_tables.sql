-- ============ COSTS ============
CREATE TABLE IF NOT EXISTS costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  planned numeric(14,2) DEFAULT 0,
  actual numeric(14,2) DEFAULT 0,
  committed numeric(14,2) DEFAULT 0,
  status text DEFAULT 'On Budget',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_costs" ON costs;
CREATE POLICY "anon_select_costs" ON costs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_costs" ON costs;
CREATE POLICY "anon_insert_costs" ON costs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_costs" ON costs;
CREATE POLICY "anon_update_costs" ON costs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_costs" ON costs;
CREATE POLICY "anon_delete_costs" ON costs FOR DELETE TO anon, authenticated USING (true);

-- ============ PROCUREMENT ============
CREATE TABLE IF NOT EXISTS procurement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  item text NOT NULL,
  supplier text,
  quantity numeric(14,2) DEFAULT 1,
  unit text DEFAULT 'pcs',
  unit_cost numeric(14,2) DEFAULT 0,
  total_cost numeric(14,2) DEFAULT 0,
  status text DEFAULT 'Requested',
  order_date date,
  delivery_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE procurement ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_proc" ON procurement;
CREATE POLICY "anon_select_proc" ON procurement FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_proc" ON procurement;
CREATE POLICY "anon_insert_proc" ON procurement FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_proc" ON procurement;
CREATE POLICY "anon_update_proc" ON procurement FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_proc" ON procurement;
CREATE POLICY "anon_delete_proc" ON procurement FOR DELETE TO anon, authenticated USING (true);

-- ============ SAFETY ============
CREATE TABLE IF NOT EXISTS safety (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'Inspection',
  severity text DEFAULT 'Low',
  date date,
  description text,
  location text,
  responsible text,
  status text DEFAULT 'Open',
  action_taken text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE safety ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_safety" ON safety;
CREATE POLICY "anon_select_safety" ON safety FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_safety" ON safety;
CREATE POLICY "anon_insert_safety" ON safety FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_safety" ON safety;
CREATE POLICY "anon_update_safety" ON safety FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_safety" ON safety;
CREATE POLICY "anon_delete_safety" ON safety FOR DELETE TO anon, authenticated USING (true);

-- ============ PROGRESS ENTRIES ============
CREATE TABLE IF NOT EXISTS progress_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  date date NOT NULL,
  area text,
  percent_complete integer DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  weather text,
  workers integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_progress" ON progress_entries;
CREATE POLICY "anon_select_progress" ON progress_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_progress" ON progress_entries;
CREATE POLICY "anon_insert_progress" ON progress_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_progress" ON progress_entries;
CREATE POLICY "anon_update_progress" ON progress_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_progress" ON progress_entries;
CREATE POLICY "anon_delete_progress" ON progress_entries FOR DELETE TO anon, authenticated USING (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_costs_project_id ON costs(project_id);
CREATE INDEX IF NOT EXISTS idx_proc_project_id ON procurement(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_project_id ON safety(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_project_id ON progress_entries(project_id);