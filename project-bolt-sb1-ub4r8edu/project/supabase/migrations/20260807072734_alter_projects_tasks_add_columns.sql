-- Add new columns to existing projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_manager text,
  ADD COLUMN IF NOT EXISTS contractor text;

-- Add new columns to existing tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS predecessors text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium';