export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
export type ProcurementStatus = 'Requested' | 'Ordered' | 'Partially Delivered' | 'Delivered';
export type SafetyStatus = 'Open' | 'Closed' | 'Investigating';
export type CostStatus = 'On Budget' | 'Over Budget' | 'Under Budget';

export interface Project {
  id: string;
  project_code: string;
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

export type ViewKey =
  | 'dashboard' | 'projects' | 'tasks' | 'costs' | 'procurement' | 'safety' | 'progress'
  | 'schedule' | 'contracts' | 'boq' | 'wir' | 'cashflow'
  | 'subinvoices' | 'clientinvoices' | 'variations' | 'documents';

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

// ---- Schedule ----
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
export const SCHEDULE_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Delayed', 'On Hold'];

// ---- Contract ----
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
export const CONTRACT_STATUSES = ['Draft', 'Negotiation', 'Signed', 'Active', 'Completed', 'Terminated'];
export const CONTRACT_TYPES = ['Lump Sum', 'Unit Price', 'Cost Plus', 'Design-Build', 'GMP', 'Time & Materials'];

// ---- BOQ ----
export interface BOQItem {
  id: string;
  project_id: string;
  boq_code: string;
  item_code: string;
  item_name: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  amount: number;
  notes: string;
  created_at: string;
}
export const BOQ_CATEGORIES = ['Preliminaries', 'Substructure', 'Superstructure', 'Finishes', 'MEP', 'External Works', 'Contingency'];

// ---- BOQ Header (the BOQ itself — one per project/company/contract) ----
export interface BOQHeader {
  id: string;
  project_id: string;
  boq_code: string;
  classification: string;
  company_name: string;
  contract_type: string;
  notes: string;
  created_at: string;
}
export const BOQ_CLASSIFICATIONS = ['Main Contractor', 'Subcontractor'];
// Reuses the existing contract type list already defined above for Contract.

// ---- WIR ----
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
export const WIR_STATUSES = ['Open', 'Passed', 'Failed', 'Pending', 'Re-Inspection'];
export const WIR_RESULTS = ['Pending', 'Passed', 'Failed', 'Conditional Pass'];

// ---- Cash Flow ----
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
export const CASHFLOW_CATEGORIES = ['Client Payment', 'Labor', 'Materials', 'Equipment', 'Subcontractor', 'Overhead', 'Other'];

// ---- Subcontractor Invoice ----
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
export const SUB_INVOICE_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Rejected'];
export const PAYMENT_STATUSES = ['Unpaid', 'Partially Paid', 'Paid', 'Disputed'];

// ---- Client Invoice ----
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
export const CLIENT_INVOICE_STATUSES = ['Draft', 'Submitted', 'Approved', 'Overdue'];

// ---- Variation ----
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
export const VARIATION_STATUSES = ['Pending', 'Submitted', 'Approved', 'Rejected', 'On Hold'];
export const VARIATION_TYPES = ['Variation', 'Claim', 'Instruction', 'Design Change', 'Scope Change'];

// ---- Document ----
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
export const DOCUMENT_TYPES = ['Drawing', 'Specification', 'Contract', 'Permit', 'Report', 'Correspondence', 'Method Statement', 'Calculation'];
export const DOCUMENT_STATUSES = ['Current', 'Superseded', 'Under Review', 'Approved', 'Rejected'];
