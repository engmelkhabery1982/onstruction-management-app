/*
  Phase 1 — architectural foundation for code-based lookups (BOQ refactor)

  PURELY ADDITIVE. Nothing existing is dropped, renamed, or altered in a
  breaking way, so the app keeps working exactly as before even if this
  migration is applied and the old frontend code is still running against it.

  1. projects.project_code       — human-entered project code (e.g. PRJ-001)
  2. boq_headers (new table)     — the "BOQ" itself: one row per project/company/contract
  3. boq_items.boq_code          — links a line item back to its boq_headers row
  4. boq_items.item_name         — short item name, separate from the long description
*/

-- 1) project_code on projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_code text DEFAULT '';

-- 2) boq_headers — the BOQ (المقايسة) itself
CREATE TABLE IF NOT EXISTS boq_headers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  boq_code text NOT NULL DEFAULT '',
  classification text DEFAULT 'Main Contractor',
  company_name text DEFAULT '',
  contract_type text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE boq_headers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_boq_headers" ON boq_headers;
CREATE POLICY "anon_select_boq_headers" ON boq_headers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_boq_headers" ON boq_headers;
CREATE POLICY "anon_insert_boq_headers" ON boq_headers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_boq_headers" ON boq_headers;
CREATE POLICY "anon_update_boq_headers" ON boq_headers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_boq_headers" ON boq_headers;
CREATE POLICY "anon_delete_boq_headers" ON boq_headers FOR DELETE TO anon, authenticated USING (true);

-- 3) + 4) link boq_items to boq_headers, add item_name
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS boq_code text DEFAULT '';
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS item_name text DEFAULT '';
