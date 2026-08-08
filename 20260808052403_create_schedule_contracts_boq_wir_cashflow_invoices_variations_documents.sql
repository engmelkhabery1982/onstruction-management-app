/*
# Add 9 new construction management tables

1. New Tables
- `schedules` — Time/schedule management with activity, dates, duration, dependencies, critical path flag
- `contracts` — Contract management with contractor, type, value, dates, status
- `boq_items` — Bill of Quantities with item code, description, unit, qty, rate, amount
- `wir_entries` — Work Inspection Requests with area, type, date, inspector, status
- `cash_flow` — Cash flow tracking with inflow, outflow, net, cumulative balance
- `subcontractor_invoices` — Subcontractor BOQ invoices with sub, BOQ ref, amount, status, payment status
- `client_invoices` — Main/client invoices with invoice number, amount, status, payment tracking
- `variations` — Variation orders with type, description, cost impact, approval status
- `documents` — Document tracking with name, type, category, upload date, status, responsible

2. Security
- RLS enabled on all 9 tables
- 4 CRUD policies each (TO anon, authenticated) — single-tenant no-auth app
*/

-- SCHEDULES
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  activity text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  duration_days integer DEFAULT 0,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  predecessors text DEFAULT '',
  critical_path boolean DEFAULT false,
  responsible text DEFAULT '',
  status text DEFAULT 'Not Started',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_schedules" ON schedules;
CREATE POLICY "anon_select_schedules" ON schedules FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_schedules" ON schedules;
CREATE POLICY "anon_insert_schedules" ON schedules FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_schedules" ON schedules;
CREATE POLICY "anon_update_schedules" ON schedules FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_schedules" ON schedules;
CREATE POLICY "anon_delete_schedules" ON schedules FOR DELETE TO anon, authenticated USING (true);

-- CONTRACTS
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  contract_number text DEFAULT '',
  title text NOT NULL DEFAULT '',
  contractor text DEFAULT '',
  contract_type text DEFAULT 'Lump Sum',
  contract_value numeric DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'Draft',
  signed_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_contracts" ON contracts;
CREATE POLICY "anon_select_contracts" ON contracts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_contracts" ON contracts;
CREATE POLICY "anon_insert_contracts" ON contracts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_contracts" ON contracts;
CREATE POLICY "anon_update_contracts" ON contracts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_contracts" ON contracts;
CREATE POLICY "anon_delete_contracts" ON contracts FOR DELETE TO anon, authenticated USING (true);

-- BOQ ITEMS
CREATE TABLE IF NOT EXISTS boq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  item_code text DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text DEFAULT '',
  unit text DEFAULT 'pcs',
  quantity numeric DEFAULT 0,
  unit_rate numeric DEFAULT 0,
  amount numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE boq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_boq_items" ON boq_items;
CREATE POLICY "anon_select_boq_items" ON boq_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_boq_items" ON boq_items;
CREATE POLICY "anon_insert_boq_items" ON boq_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_boq_items" ON boq_items;
CREATE POLICY "anon_update_boq_items" ON boq_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_boq_items" ON boq_items;
CREATE POLICY "anon_delete_boq_items" ON boq_items FOR DELETE TO anon, authenticated USING (true);

-- WIR ENTRIES
CREATE TABLE IF NOT EXISTS wir_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  wir_number text DEFAULT '',
  area text DEFAULT '',
  work_type text DEFAULT 'Inspection',
  inspection_date date,
  inspector text DEFAULT '',
  result text DEFAULT 'Pending',
  remarks text DEFAULT '',
  status text DEFAULT 'Open',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wir_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_wir_entries" ON wir_entries;
CREATE POLICY "anon_select_wir_entries" ON wir_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_wir_entries" ON wir_entries;
CREATE POLICY "anon_insert_wir_entries" ON wir_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_wir_entries" ON wir_entries;
CREATE POLICY "anon_update_wir_entries" ON wir_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_wir_entries" ON wir_entries;
CREATE POLICY "anon_delete_wir_entries" ON wir_entries FOR DELETE TO anon, authenticated USING (true);

-- CASH FLOW
CREATE TABLE IF NOT EXISTS cash_flow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  date date,
  description text DEFAULT '',
  inflow numeric DEFAULT 0,
  outflow numeric DEFAULT 0,
  net numeric DEFAULT 0,
  cumulative_balance numeric DEFAULT 0,
  category text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_cash_flow" ON cash_flow;
CREATE POLICY "anon_select_cash_flow" ON cash_flow FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cash_flow" ON cash_flow;
CREATE POLICY "anon_insert_cash_flow" ON cash_flow FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cash_flow" ON cash_flow;
CREATE POLICY "anon_update_cash_flow" ON cash_flow FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cash_flow" ON cash_flow;
CREATE POLICY "anon_delete_cash_flow" ON cash_flow FOR DELETE TO anon, authenticated USING (true);

-- SUBCONTRACTOR INVOICES
CREATE TABLE IF NOT EXISTS subcontractor_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  invoice_number text DEFAULT '',
  subcontractor text DEFAULT '',
  boq_reference text DEFAULT '',
  invoice_date date,
  amount numeric DEFAULT 0,
  status text DEFAULT 'Submitted',
  payment_status text DEFAULT 'Unpaid',
  payment_date date,
  paid_amount numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subcontractor_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_subcontractor_invoices" ON subcontractor_invoices;
CREATE POLICY "anon_select_subcontractor_invoices" ON subcontractor_invoices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subcontractor_invoices" ON subcontractor_invoices;
CREATE POLICY "anon_insert_subcontractor_invoices" ON subcontractor_invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subcontractor_invoices" ON subcontractor_invoices;
CREATE POLICY "anon_update_subcontractor_invoices" ON subcontractor_invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subcontractor_invoices" ON subcontractor_invoices;
CREATE POLICY "anon_delete_subcontractor_invoices" ON subcontractor_invoices FOR DELETE TO anon, authenticated USING (true);

-- CLIENT INVOICES
CREATE TABLE IF NOT EXISTS client_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  invoice_number text DEFAULT '',
  client text DEFAULT '',
  invoice_date date,
  due_date date,
  amount numeric DEFAULT 0,
  status text DEFAULT 'Draft',
  payment_status text DEFAULT 'Unpaid',
  payment_date date,
  paid_amount numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_client_invoices" ON client_invoices;
CREATE POLICY "anon_select_client_invoices" ON client_invoices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_client_invoices" ON client_invoices;
CREATE POLICY "anon_insert_client_invoices" ON client_invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_client_invoices" ON client_invoices;
CREATE POLICY "anon_update_client_invoices" ON client_invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_client_invoices" ON client_invoices;
CREATE POLICY "anon_delete_client_invoices" ON client_invoices FOR DELETE TO anon, authenticated USING (true);

-- VARIATIONS
CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  variation_number text DEFAULT '',
  type text DEFAULT 'Variation',
  title text DEFAULT '',
  description text DEFAULT '',
  cost_impact numeric DEFAULT 0,
  time_impact_days integer DEFAULT 0,
  status text DEFAULT 'Pending',
  approved_by text DEFAULT '',
  approved_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_variations" ON variations;
CREATE POLICY "anon_select_variations" ON variations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_variations" ON variations;
CREATE POLICY "anon_insert_variations" ON variations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_variations" ON variations;
CREATE POLICY "anon_update_variations" ON variations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_variations" ON variations;
CREATE POLICY "anon_delete_variations" ON variations FOR DELETE TO anon, authenticated USING (true);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  document_name text NOT NULL DEFAULT '',
  document_type text DEFAULT 'Drawing',
  category text DEFAULT '',
  version text DEFAULT '1.0',
  upload_date date,
  status text DEFAULT 'Current',
  responsible text DEFAULT '',
  file_reference text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_documents" ON documents;
CREATE POLICY "anon_update_documents" ON documents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE TO anon, authenticated USING (true);
