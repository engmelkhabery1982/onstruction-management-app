import { useState } from 'react';
import { LayoutDashboard, FolderKanban, SquareCheck as CheckSquare, DollarSign, Package, ShieldAlert, TrendingUp, CalendarClock, Signature as FileSignature, ClipboardList, Banknote, Receipt, FileText, GitBranch, FolderOpen, FileCheck as FileCheck2, Building2, Menu, ListOrdered } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Dashboard } from '@/components/Dashboard';
import { DataTableView, type ColumnDef, type FilterDef } from '@/components/DataTableView';
import type { ViewKey, Project } from '@/types';

type IconType = React.ComponentType<{ size?: number | string; className?: string }>;
const NAV_ITEMS: { key: ViewKey; label: string; icon: IconType; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { key: 'projects', label: 'Projects', icon: FolderKanban, group: 'Overview' },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare, group: 'Overview' },
  { key: 'schedule', label: 'Schedule', icon: CalendarClock, group: 'Planning' },
  { key: 'progress', label: 'Progress', icon: TrendingUp, group: 'Planning' },
  { key: 'costs', label: 'Cost Control', icon: DollarSign, group: 'Financial' },
  { key: 'costEntries', label: 'Cost Entries', icon: ListOrdered, group: 'Financial' },
  { key: 'boq', label: 'BOQ', icon: ClipboardList, group: 'Financial' },
  { key: 'boqItems', label: 'BOQ Items', icon: ListOrdered, group: 'Financial' },
  { key: 'cashflow', label: 'Cash Flow', icon: Banknote, group: 'Financial' },
  { key: 'contracts', label: 'Contracts', icon: FileSignature, group: 'Financial' },
  { key: 'subinvoices', label: 'Sub Invoices', icon: Receipt, group: 'Financial' },
  { key: 'clientinvoices', label: 'Client Invoices', icon: FileText, group: 'Financial' },
  { key: 'variations', label: 'Variations', icon: GitBranch, group: 'Financial' },
  { key: 'procurement', label: 'Procurement', icon: Package, group: 'Operations' },
  { key: 'safety', label: 'Safety', icon: ShieldAlert, group: 'Operations' },
  { key: 'documents', label: 'Documents', icon: FolderOpen, group: 'Operations' },
  { key: 'wir', label: 'WIR', icon: FileCheck2, group: 'Operations' },
];

const PROJECT_STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Delayed'];
const TASK_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Delayed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const COST_STATUSES = ['Planned', 'Committed', 'Actual', 'Over Budget'];
const COST_TYPES = ['Labor', 'Equipment', 'Materials', 'Miscellaneous', 'Other'];
const PROC_STATUSES = ['Requested', 'Ordered', 'Partially Delivered', 'Delivered'];
const SAFETY_STATUSES = ['Open', 'Investigating', 'Closed'];
const SAFETY_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const SAFETY_TYPES = ['Incident', 'Near Miss', 'Hazard', 'Inspection', 'Violation'];
const SCHEDULE_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Delayed'];
const CONTRACT_STATUSES = ['Draft', 'Active', 'Completed', 'Terminated'];
const CONTRACT_TYPES = ['Lump Sum', 'Unit Price', 'Cost Plus', 'Time & Materials', 'Design-Build', 'GMP', 'Cost Reimbursable'];
const INVOICE_STATUSES = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'];
const PAYMENT_STATUSES = ['Unpaid', 'Partially Paid', 'Paid'];
const VARIATION_STATUSES = ['Draft', 'Submitted', 'Pending', 'Approved', 'Rejected'];
const VARIATION_TYPES = ['Scope Change', 'Design Change', 'Site Condition', 'Client Request', 'Cost Adjustment'];
const DOC_STATUSES = ['Draft', 'Under Review', 'Approved', 'Current', 'Superseded'];
const DOC_TYPES = ['Drawing', 'Specification', 'Report', 'Permit', 'Contract', 'Invoice', 'Plan', 'Other'];
const WIR_STATUSES = ['Pending', 'Approved', 'Rejected'];
const WIR_RESULTS = ['Pass', 'Fail', 'Conditional Pass'];
const BOQ_CLASSIFICATIONS = ['Main', 'Subcontractor'];

const PROJECT_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'boq_code', label: 'BOQ Code', type: 'text', editable: true },
  { key: 'name', label: 'Project Name', type: 'text', editable: true },
  { key: 'client', label: 'Client', type: 'text', editable: true },
  { key: 'location', label: 'Location', type: 'text', editable: true },
  { key: 'category', label: 'Category', type: 'text', editable: true, options: ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Renovation'] },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: PROJECT_STATUSES },
  { key: 'budget', label: 'Budget', type: 'money', editable: true },
  { key: 'spent', label: 'Spent', type: 'money' },
  { key: 'total_value', label: 'Total Value', type: 'money' },
  { key: 'progress', label: 'Progress', type: 'progress', editable: true },
  { key: 'project_manager', label: 'Manager', type: 'text', editable: true },
  { key: 'contractor', label: 'Contractor', type: 'text', editable: true },
  { key: 'start_date', label: 'Start Date', type: 'date', editable: true },
  { key: 'end_date', label: 'End Date', type: 'date', editable: true },
];

const TASK_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Task Name', type: 'text', editable: true },
  { key: 'assignee', label: 'Assignee', type: 'text', editable: true },
  { key: 'category', label: 'Category', type: 'text', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: TASK_STATUSES },
  { key: 'priority', label: 'Priority', type: 'status', editable: true, options: PRIORITIES },
  { key: 'cost', label: 'Cost', type: 'money', editable: true },
  { key: 'progress', label: 'Progress', type: 'progress', editable: true },
  { key: 'start_date', label: 'Start', type: 'date', editable: true },
  { key: 'end_date', label: 'End', type: 'date', editable: true },
];

const COST_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'item_code', label: 'Item Code', type: 'text', editable: true },
  { key: 'company_name', label: 'Company', type: 'text', editable: true },
  { key: 'boq_item_code', label: 'BOQ Item Code', type: 'text', editable: true, autoFillFrom: 'boqItems', autoFillKey: 'item_code' },
  { key: 'boq_item_name', label: 'BOQ Item Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text', editable: true, options: ['Labor', 'Materials', 'Equipment', 'Subcontractor', 'Overhead', 'Other'] },
  { key: 'description', label: 'Description', type: 'text', editable: true },
  { key: 'planned', label: 'Planned', type: 'money' },
  { key: 'actual', label: 'Actual', type: 'money' },
  { key: 'committed', label: 'Committed', type: 'money', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: COST_STATUSES },
];

const COST_ENTRY_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'boq_code', label: 'BOQ Code', type: 'text', editable: true },
  { key: 'company_name', label: 'Company', type: 'text', editable: true },
  { key: 'boq_item_code', label: 'BOQ Item Code', type: 'text', editable: true, autoFillFrom: 'boqItems', autoFillKey: 'item_code' },
  { key: 'boq_item_name', label: 'BOQ Item Name', type: 'text' },
  { key: 'date', label: 'Date', type: 'date', editable: true },
  { key: 'cost_type', label: 'Cost Type', type: 'text', editable: true, options: COST_TYPES },
  { key: 'invoice_number', label: 'Invoice #', type: 'text', editable: true },
  { key: 'payment_order_number', label: 'Payment Order #', type: 'text', editable: true },
  { key: 'amount', label: 'Amount', type: 'money', editable: true },
];

const PROCUREMENT_COLUMNS: ColumnDef[] = [
  { key: 'item', label: 'Item', type: 'text', editable: true },
  { key: 'supplier', label: 'Supplier', type: 'text', editable: true },
  { key: 'quantity', label: 'Qty', type: 'number', editable: true },
  { key: 'unit', label: 'Unit', type: 'text', editable: true },
  { key: 'unit_cost', label: 'Unit Cost', type: 'money', editable: true },
  { key: 'total_cost', label: 'Total', type: 'money' },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: PROC_STATUSES },
  { key: 'order_date', label: 'Order Date', type: 'date', editable: true },
  { key: 'delivery_date', label: 'Delivery Date', type: 'date', editable: true },
];

const SAFETY_COLUMNS: ColumnDef[] = [
  { key: 'type', label: 'Type', type: 'status', editable: true, options: SAFETY_TYPES },
  { key: 'severity', label: 'Severity', type: 'status', editable: true, options: SAFETY_SEVERITIES },
  { key: 'description', label: 'Description', type: 'text', editable: true },
  { key: 'location', label: 'Location', type: 'text', editable: true },
  { key: 'responsible', label: 'Responsible', type: 'text', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: SAFETY_STATUSES },
  { key: 'date', label: 'Date', type: 'date', editable: true },
  { key: 'action_taken', label: 'Action Taken', type: 'text', editable: true },
];

const PROGRESS_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'company_name', label: 'Company', type: 'text', editable: true },
  { key: 'date', label: 'Date', type: 'date', editable: true },
  { key: 'area', label: 'Area', type: 'text', editable: true },
  { key: 'prev_value', label: 'Previous Value', type: 'money' },
  { key: 'prev_pct', label: 'Previous %', type: 'progress' },
  { key: 'current_value', label: 'Current Value', type: 'money', editable: true },
  { key: 'current_pct', label: 'Current %', type: 'progress' },
  { key: 'total_value', label: 'Total Value', type: 'money' },
  { key: 'total_pct', label: 'Total %', type: 'progress' },
  { key: 'percent_complete', label: '% Complete', type: 'progress', editable: true },
  { key: 'weather', label: 'Weather', type: 'text', editable: true },
  { key: 'workers', label: 'Workers', type: 'number', editable: true },
  { key: 'notes', label: 'Notes', type: 'text', editable: true },
];

const SCHEDULE_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'boq_code', label: 'BOQ Code', type: 'text', editable: true },
  { key: 'boq_item_code', label: 'BOQ Item Code', type: 'text', editable: true, autoFillFrom: 'boqItems', autoFillKey: 'item_code' },
  { key: 'boq_item_name', label: 'BOQ Item Name', type: 'text' },
  { key: 'activity', label: 'Activity', type: 'text', editable: true },
  { key: 'start_date', label: 'Start', type: 'date', editable: true },
  { key: 'end_date', label: 'End', type: 'date', editable: true },
  { key: 'duration_days', label: 'Duration (days)', type: 'number' },
  { key: 'planned_value', label: 'Planned Value', type: 'money', editable: true },
  { key: 'progress', label: 'Progress', type: 'progress', editable: true },
  { key: 'predecessor_item', label: 'Predecessor Item', type: 'text', editable: true },
  { key: 'critical_path', label: 'Critical Path', type: 'boolean', editable: true },
  { key: 'is_critical_item', label: 'Critical Item', type: 'boolean', editable: true },
  { key: 'responsible', label: 'Responsible', type: 'text', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: SCHEDULE_STATUSES },
  { key: 'predecessors', label: 'Predecessors', type: 'text', editable: true },
  { key: 'notes', label: 'Notes', type: 'text', editable: true },
];

const CONTRACT_COLUMNS: ColumnDef[] = [
  { key: 'contract_number', label: 'Contract #', type: 'text', editable: true },
  { key: 'title', label: 'Title', type: 'text', editable: true },
  { key: 'contractor', label: 'Contractor', type: 'text', editable: true },
  { key: 'contract_type', label: 'Type', type: 'status', editable: true, options: CONTRACT_TYPES },
  { key: 'contract_value', label: 'Value', type: 'money', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: CONTRACT_STATUSES },
  { key: 'start_date', label: 'Start', type: 'date', editable: true },
  { key: 'end_date', label: 'End', type: 'date', editable: true },
  { key: 'signed_date', label: 'Signed Date', type: 'date', editable: true },
];

const BOQ_HEADER_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'boq_code', label: 'BOQ Code', type: 'text', editable: true },
  { key: 'classification', label: 'Classification', type: 'text', editable: true, options: BOQ_CLASSIFICATIONS },
  { key: 'company_name', label: 'Company Name', type: 'text', editable: true },
  { key: 'contract_type', label: 'Contract Type', type: 'text', editable: true, options: CONTRACT_TYPES },
  { key: 'total_value', label: 'Total Value', type: 'money' },
];

const BOQ_ITEM_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'boq_code', label: 'BOQ Code', type: 'text', editable: true },
  { key: 'item_code', label: 'Item Code', type: 'text', editable: true },
  { key: 'item_name', label: 'Item Name', type: 'text', editable: true },
  { key: 'description', label: 'Description', type: 'text', editable: true },
  { key: 'category', label: 'Category', type: 'text', editable: true, options: ['Earthworks', 'Concrete', 'Steel', 'Masonry', 'Finishes', 'MEP', 'Other'] },
  { key: 'unit', label: 'Unit', type: 'text', editable: true },
  { key: 'quantity', label: 'Qty', type: 'number', editable: true },
  { key: 'unit_rate', label: 'Unit Rate', type: 'money', editable: true },
  { key: 'amount', label: 'Amount', type: 'money' },
];

const CASHFLOW_COLUMNS: ColumnDef[] = [
  { key: 'date', label: 'Date', type: 'date', editable: true },
  { key: 'description', label: 'Description', type: 'text', editable: true },
  { key: 'category', label: 'Category', type: 'text', editable: true },
  { key: 'inflow', label: 'Inflow', type: 'money', editable: true },
  { key: 'outflow', label: 'Outflow', type: 'money', editable: true },
  { key: 'net', label: 'Net', type: 'money' },
  { key: 'cumulative_balance', label: 'Cumulative', type: 'money', editable: true },
];

const SUBINV_COLUMNS: ColumnDef[] = [
  { key: 'invoice_number', label: 'Invoice #', type: 'text', editable: true },
  { key: 'subcontractor', label: 'Subcontractor', type: 'text', editable: true },
  { key: 'boq_reference', label: 'BOQ Ref', type: 'text', editable: true },
  { key: 'invoice_date', label: 'Date', type: 'date', editable: true },
  { key: 'amount', label: 'Amount', type: 'money', editable: true },
  { key: 'paid_amount', label: 'Paid', type: 'money', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: INVOICE_STATUSES },
  { key: 'payment_status', label: 'Payment', type: 'status', editable: true, options: PAYMENT_STATUSES },
  { key: 'payment_date', label: 'Payment Date', type: 'date', editable: true },
];

const CLIENTINV_COLUMNS: ColumnDef[] = [
  { key: 'invoice_number', label: 'Invoice #', type: 'text', editable: true },
  { key: 'client', label: 'Client', type: 'text', editable: true },
  { key: 'invoice_date', label: 'Date', type: 'date', editable: true },
  { key: 'due_date', label: 'Due Date', type: 'date', editable: true },
  { key: 'amount', label: 'Amount', type: 'money', editable: true },
  { key: 'paid_amount', label: 'Paid', type: 'money', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: INVOICE_STATUSES },
  { key: 'payment_status', label: 'Payment', type: 'status', editable: true, options: PAYMENT_STATUSES },
  { key: 'payment_date', label: 'Payment Date', type: 'date', editable: true },
];

const VARIATION_COLUMNS: ColumnDef[] = [
  { key: 'variation_number', label: 'Variation #', type: 'text', editable: true },
  { key: 'type', label: 'Type', type: 'status', editable: true, options: VARIATION_TYPES },
  { key: 'title', label: 'Title', type: 'text', editable: true },
  { key: 'description', label: 'Description', type: 'text', editable: true },
  { key: 'cost_impact', label: 'Cost Impact', type: 'money', editable: true },
  { key: 'time_impact_days', label: 'Time Impact (days)', type: 'number', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: VARIATION_STATUSES },
  { key: 'approved_by', label: 'Approved By', type: 'text', editable: true },
  { key: 'approved_date', label: 'Approved Date', type: 'date', editable: true },
];

const DOC_COLUMNS: ColumnDef[] = [
  { key: 'document_name', label: 'Name', type: 'text', editable: true },
  { key: 'document_type', label: 'Type', type: 'status', editable: true, options: DOC_TYPES },
  { key: 'category', label: 'Category', type: 'text', editable: true },
  { key: 'version', label: 'Version', type: 'text', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: DOC_STATUSES },
  { key: 'responsible', label: 'Responsible', type: 'text', editable: true },
  { key: 'upload_date', label: 'Upload Date', type: 'date', editable: true },
  { key: 'file_reference', label: 'File Ref', type: 'text', editable: true },
];

const WIR_COLUMNS: ColumnDef[] = [
  { key: 'project_code', label: 'Project Code', type: 'text', editable: true },
  { key: 'boq_code', label: 'BOQ Code', type: 'text', editable: true },
  { key: 'item_code', label: 'Item Code', type: 'text', editable: true, autoFillFrom: 'boqItems', autoFillKey: 'item_code' },
  { key: 'item_name', label: 'Item Name', type: 'text' },
  { key: 'item_description', label: 'Description', type: 'text' },
  { key: 'company_name', label: 'Company', type: 'text', editable: true },
  { key: 'wir_number', label: 'WIR #', type: 'text', editable: true },
  { key: 'area', label: 'Area', type: 'text', editable: true },
  { key: 'work_type', label: 'Work Type', type: 'text', editable: true },
  { key: 'inspection_date', label: 'Inspection Date', type: 'date', editable: true },
  { key: 'inspector', label: 'Inspector', type: 'text', editable: true },
  { key: 'result', label: 'Result', type: 'status', editable: true, options: WIR_RESULTS },
  { key: 'unit', label: 'Unit', type: 'text' },
  { key: 'quantity', label: 'Qty', type: 'number' },
  { key: 'unit_price', label: 'Unit Price', type: 'money' },
  { key: 'item_amount', label: 'Item Amount', type: 'money' },
  { key: 'completion_pct', label: 'Completion %', type: 'progress' },
  { key: 'remarks', label: 'Remarks', type: 'text', editable: true },
  { key: 'status', label: 'Status', type: 'status', editable: true, options: WIR_STATUSES },
];

const VIEW_CONFIGS: Record<string, { columns: ColumnDef[]; filters?: FilterDef[]; showProjectFilter?: boolean; dateRangeColumn?: string }> = {
  projects: { columns: PROJECT_COLUMNS, filters: [{ key: 'status', label: 'Status', options: PROJECT_STATUSES }, { key: 'category', label: 'Category', options: ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Renovation'] }], dateRangeColumn: 'start_date' },
  tasks: { columns: TASK_COLUMNS, filters: [{ key: 'status', label: 'Status', options: TASK_STATUSES }, { key: 'priority', label: 'Priority', options: PRIORITIES }], showProjectFilter: true, dateRangeColumn: 'start_date' },
  costs: { columns: COST_COLUMNS, filters: [{ key: 'status', label: 'Status', options: COST_STATUSES }, { key: 'category', label: 'Category', options: ['Labor', 'Materials', 'Equipment', 'Subcontractor', 'Overhead', 'Other'] }], showProjectFilter: true },
  costEntries: { columns: COST_ENTRY_COLUMNS, filters: [{ key: 'cost_type', label: 'Cost Type', options: COST_TYPES }], showProjectFilter: true, dateRangeColumn: 'date' },
  procurement: { columns: PROCUREMENT_COLUMNS, filters: [{ key: 'status', label: 'Status', options: PROC_STATUSES }], showProjectFilter: true, dateRangeColumn: 'order_date' },
  safety: { columns: SAFETY_COLUMNS, filters: [{ key: 'status', label: 'Status', options: SAFETY_STATUSES }, { key: 'severity', label: 'Severity', options: SAFETY_SEVERITIES }, { key: 'type', label: 'Type', options: SAFETY_TYPES }], showProjectFilter: true, dateRangeColumn: 'date' },
  progress: { columns: PROGRESS_COLUMNS, filters: [{ key: 'company_name', label: 'Company', options: [] }], showProjectFilter: true, dateRangeColumn: 'date' },
  schedule: { columns: SCHEDULE_COLUMNS, filters: [{ key: 'status', label: 'Status', options: SCHEDULE_STATUSES }, { key: 'is_critical_item', label: 'Critical', options: ['true', 'false'] }], showProjectFilter: true, dateRangeColumn: 'start_date' },
  contracts: { columns: CONTRACT_COLUMNS, filters: [{ key: 'status', label: 'Status', options: CONTRACT_STATUSES }, { key: 'contract_type', label: 'Type', options: CONTRACT_TYPES }], showProjectFilter: true, dateRangeColumn: 'start_date' },
  boq: { columns: BOQ_HEADER_COLUMNS, filters: [{ key: 'classification', label: 'Classification', options: BOQ_CLASSIFICATIONS }, { key: 'contract_type', label: 'Contract Type', options: CONTRACT_TYPES }], showProjectFilter: true },
  boqItems: { columns: BOQ_ITEM_COLUMNS, filters: [{ key: 'category', label: 'Category', options: ['Earthworks', 'Concrete', 'Steel', 'Masonry', 'Finishes', 'MEP', 'Other'] }, { key: 'boq_code', label: 'BOQ Code', options: [] }], showProjectFilter: true },
  cashflow: { columns: CASHFLOW_COLUMNS, showProjectFilter: true, dateRangeColumn: 'date' },
  subinvoices: { columns: SUBINV_COLUMNS, filters: [{ key: 'status', label: 'Status', options: INVOICE_STATUSES }, { key: 'payment_status', label: 'Payment', options: PAYMENT_STATUSES }], showProjectFilter: true, dateRangeColumn: 'invoice_date' },
  clientinvoices: { columns: CLIENTINV_COLUMNS, filters: [{ key: 'status', label: 'Status', options: INVOICE_STATUSES }, { key: 'payment_status', label: 'Payment', options: PAYMENT_STATUSES }], showProjectFilter: true, dateRangeColumn: 'invoice_date' },
  variations: { columns: VARIATION_COLUMNS, filters: [{ key: 'status', label: 'Status', options: VARIATION_STATUSES }, { key: 'type', label: 'Type', options: VARIATION_TYPES }], showProjectFilter: true, dateRangeColumn: 'approved_date' },
  documents: { columns: DOC_COLUMNS, filters: [{ key: 'status', label: 'Status', options: DOC_STATUSES }, { key: 'document_type', label: 'Type', options: DOC_TYPES }], showProjectFilter: true, dateRangeColumn: 'upload_date' },
  wir: { columns: WIR_COLUMNS, filters: [{ key: 'status', label: 'Status', options: WIR_STATUSES }, { key: 'result', label: 'Result', options: WIR_RESULTS }], showProjectFilter: true, dateRangeColumn: 'inspection_date' },
};

const TABLE_NAMES: Record<string, string> = {
  projects: 'projects', tasks: 'tasks', costs: 'costs', costEntries: 'cost_entries',
  procurement: 'procurement', safety: 'safety', progress: 'progress_entries',
  schedule: 'schedules', contracts: 'contracts', boq: 'boq_headers', boqItems: 'boq_items',
  cashflow: 'cash_flow', subinvoices: 'subcontractor_invoices', clientinvoices: 'client_invoices',
  variations: 'variations', documents: 'documents', wir: 'wir_entries',
};

const VIEW_TITLES: Record<string, string> = {
  projects: 'Projects', tasks: 'Tasks', costs: 'Cost Control', costEntries: 'Cost Entries',
  procurement: 'Procurement', safety: 'Safety Records', progress: 'Progress Entries',
  schedule: 'Schedule', contracts: 'Contracts', boq: 'BOQ Headers', boqItems: 'BOQ Items',
  cashflow: 'Cash Flow', subinvoices: 'Subcontractor Invoices', clientinvoices: 'Client Invoices',
  variations: 'Variations', documents: 'Documents', wir: 'Work Inspection Reports',
};

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const data = useData();

  const groups = ['Overview', 'Planning', 'Financial', 'Operations'];

  function renderView() {
    if (activeView === 'dashboard') {
      return (
        <Dashboard
          projects={data.projects}
          tasks={data.tasks}
          costs={data.costs}
          costEntries={data.costEntries}
          procurement={data.procurement}
          safety={data.safety}
          progress={data.progress}
          schedules={data.schedules}
          contracts={data.contracts}
          boqHeaders={data.boqHeaders}
          boqItems={data.boqItems}
          cashFlow={data.cashFlow}
          subInvoices={data.subInvoices}
          clientInvoices={data.clientInvoices}
          variations={data.variations}
          documents={data.documents}
          onNavigate={setActiveView}
        />
      );
    }

    const config = VIEW_CONFIGS[activeView];
    if (!config) return null;
    const tableName = TABLE_NAMES[activeView];
    const title = VIEW_TITLES[activeView];
    const viewData = (data as any)[activeView] || [];
    const navItem = NAV_ITEMS.find((n) => n.key === activeView);

    return (
      <DataTableView
        tableName={tableName}
        title={title}
        icon={navItem?.icon || FolderKanban}
        data={viewData}
        columns={config.columns}
        filters={config.filters}
        projects={data.projects as Project[]}
        showProjectFilter={config.showProjectFilter}
        dateRangeColumn={config.dateRangeColumn}
        boqItems={data.boqItems}
        onChanged={data.reload}
      />
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-neutral-600 flex flex-col transition-transform duration-300 no-print`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-neutral-500">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">BuildTrack</h1>
              <p className="text-xs text-neutral-200">Construction Mgmt</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
          {groups.map((group) => (
            <div key={group} className="mb-4">
              <p className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider px-3 mb-1.5">{group}</p>
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveView(item.key); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-neutral-100 hover:bg-neutral-500 hover:text-white'
                    }`}
                  >
                    <Icon size={17} className={isActive ? 'text-white' : 'text-neutral-300'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-500">
          <p className="text-xs text-neutral-300 text-center">BuildTrack v1.0</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-neutral-100">
            <Menu size={20} className="text-neutral-600" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-primary-600" />
            <span className="text-sm font-bold text-neutral-900">BuildTrack</span>
          </div>
          <div className="w-7" />
        </div>

        {/* Content */}
        {data.loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: '3px' }} />
              <p className="text-sm text-neutral-500">Loading data...</p>
            </div>
          </div>
        ) : (
          renderView()
        )}
      </div>
    </div>
  );
}
