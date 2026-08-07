export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
export type ProcurementStatus = 'Requested' | 'Ordered' | 'Partially Delivered' | 'Delivered';
export type SafetyStatus = 'Open' | 'Closed' | 'Investigating';
export type CostStatus = 'On Budget' | 'Over Budget' | 'Under Budget';

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  category: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  spent: number;
  status: ProjectStatus | string;
  progress: number;
  project_manager: string;
  contractor: string;
  notes: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  assignee: string;
  category: string;
  start_date: string | null;
  end_date: string | null;
  cost: number;
  status: TaskStatus | string;
  progress: number;
  predecessors: string;
  priority: string;
  created_at: string;
}

export interface Cost {
  id: string;
  project_id: string;
  category: string;
  description: string;
  planned: number;
  actual: number;
  committed: number;
  status: CostStatus | string;
  notes: string;
  created_at: string;
}

export interface Procurement {
  id: string;
  project_id: string;
  item: string;
  supplier: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  status: ProcurementStatus | string;
  order_date: string | null;
  delivery_date: string | null;
  notes: string;
  created_at: string;
}

export interface Safety {
  id: string;
  project_id: string;
  type: string;
  severity: string;
  date: string | null;
  description: string;
  location: string;
  responsible: string;
  status: SafetyStatus | string;
  action_taken: string;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  project_id: string;
  date: string;
  area: string;
  percent_complete: number;
  weather: string;
  workers: number;
  notes: string;
  created_at: string;
}

export interface ProjectWithStats extends Project {
  task_count: number;
  completed_tasks: number;
}

export type ViewKey = 'dashboard' | 'projects' | 'tasks' | 'costs' | 'procurement' | 'safety' | 'progress';

export const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed'];
export const TASK_STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Delayed'];
export const PROCUREMENT_STATUSES: ProcurementStatus[] = ['Requested', 'Ordered', 'Partially Delivered', 'Delivered'];
export const SAFETY_STATUSES: SafetyStatus[] = ['Open', 'Closed', 'Investigating'];
export const SAFETY_TYPES = ['Inspection', 'Incident', 'Near Miss', 'Audit', 'Meeting'];
export const SAFETY_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
export const COST_STATUSES: CostStatus[] = ['On Budget', 'Over Budget', 'Under Budget'];
export const PROJECT_CATEGORIES = ['Residential', 'Commercial', 'Infrastructure', 'Renovation', 'Industrial'];
export const TASK_CATEGORIES = ['Excavation', 'Foundation', 'Framing', 'Electrical', 'Plumbing', 'Roofing', 'Finishing', 'Inspection'];
export const COST_CATEGORIES = ['Labor', 'Materials', 'Equipment', 'Subcontractors', 'Permits & Fees', 'Contingency', 'Overhead'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
