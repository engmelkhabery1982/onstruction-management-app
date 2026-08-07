/*
# Create projects and tasks tables for construction project management

1. New Tables
- `projects`: Construction/contracting projects with client, budget, progress tracking
  - id (uuid, primary key)
  - name (text, project name)
  - client (text, client name)
  - location (text, project site location)
  - category (text, e.g. Residential, Commercial, Infrastructure)
  - start_date (date)
  - end_date (date)
  - budget (numeric, planned budget)
  - spent (numeric, amount spent so far)
  - status (text, e.g. Planning, In Progress, On Hold, Completed)
  - progress (integer 0-100, completion percentage)
  - notes (text)
  - created_at (timestamp)
- `tasks`: Individual tasks within a project
  - id (uuid, primary key)
  - project_id (uuid, foreign key to projects)
  - name (text, task name)
  - assignee (text, person responsible)
  - category (text, e.g. Excavation, Foundation, Framing, Electrical, Plumbing)
  - start_date (date)
  - end_date (date)
  - cost (numeric, task cost)
  - status (text, e.g. Not Started, In Progress, Completed, Delayed)
  - progress (integer 0-100)
  - created_at (timestamp)

2. Security
- Enable RLS on both tables.
- Single-tenant app (no sign-in): allow anon + authenticated full CRUD on both tables.

3. Notes
- No user_id columns (no auth required for this app).
- Foreign key from tasks.project_id to projects.id with CASCADE delete.
- Indexes on project_id for task queries and status for filtering.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client text,
  location text,
  category text,
  start_date date,
  end_date date,
  budget numeric(14,2) DEFAULT 0,
  spent numeric(14,2) DEFAULT 0,
  status text DEFAULT 'Planning',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  assignee text,
  category text,
  start_date date,
  end_date date,
  cost numeric(14,2) DEFAULT 0,
  status text DEFAULT 'Not Started',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);