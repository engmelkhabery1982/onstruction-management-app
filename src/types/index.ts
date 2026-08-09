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
  status: string;
  progress: number;
  project_manager: string;
  contractor: string;
  notes: string;
  created_at: string;
}

export interface ProjectWithStats extends Project {
  task_count: number;
  completed_tasks: number;
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
  status: string;
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
  status: string;
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
  status: string;
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
  status: string;
  action_taken: string;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  project_id: string;
  date: string | null;
  area: string;
  percent_complete: number;
  weather: string;
  workers: number;
  notes: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  project_id: string;
  activity: string;
  start_date: string | null;
  end_date: string | null;
  duration_days: number;
  progress: number;
  predecessors: string;
  critical_path: boolean;
  responsible: string;
  status: string;
  notes: string;
  created_at: string;
}

export interface Contract {
  id: string;
  project_id: string;
  contract_number: string;
  title: string;
  contractor: string;
  contract_type: string;
  contract_value: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  signed_date: string | null;
  notes: string;
  created_at: string;
}

export interface BOQItem {
  id: string;
  project_id: string;
  item_code: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  amount: number;
  notes: string;
  created_at: string;
}

export interface CashFlowEntry {
  id: string;
  project_id: string;
  date: string | null;
  description: string;
  inflow: number;
  outflow: number;
  net: number;
  cumulative_balance: number;
  category: string;
  notes: string;
  created_at: string;
}

export interface SubcontractorInvoice {
  id: string;
  project_id: string;
  invoice_number: string;
  subcontractor: string;
  boq_reference: string;
  invoice_date: string | null;
  amount: number;
  status: string;
  payment_status: string;
  payment_date: string | null;
  paid_amount: number;
  notes: string;
  created_at: string;
}

export interface ClientInvoice {
  id: string;
  project_id: string;
  invoice_number: string;
  client: string;
  invoice_date: string | null;
  due_date: string | null;
  amount: number;
  status: string;
  payment_status: string;
  payment_date: string | null;
  paid_amount: number;
  notes: string;
  created_at: string;
}

export interface Variation {
  id: string;
  project_id: string;
  variation_number: string;
  type: string;
  title: string;
  description: string;
  cost_impact: number;
  time_impact_days: number;
  status: string;
  approved_by: string;
  approved_date: string | null;
  notes: string;
  created_at: string;
}

export interface DocumentEntry {
  id: string;
  project_id: string;
  document_name: string;
  document_type: string;
  category: string;
  version: string;
  upload_date: string | null;
  status: string;
  responsible: string;
  file_reference: string;
  notes: string;
  created_at: string;
}

export interface WIREntry {
  id: string;
  project_id: string;
  wir_number: string;
  area: string;
  work_type: string;
  inspection_date: string | null;
  inspector: string;
  result: string;
  remarks: string;
  status: string;
  created_at: string;
}

export type ViewKey =
  | 'dashboard' | 'projects' | 'tasks' | 'costs' | 'procurement'
  | 'safety' | 'progress' | 'schedule' | 'contracts' | 'boq'
  | 'cashflow' | 'subinvoices' | 'clientinvoices' | 'variations'
  | 'documents' | 'wir';
