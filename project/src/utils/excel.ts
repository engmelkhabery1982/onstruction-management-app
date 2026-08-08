import * as XLSX from 'xlsx';
import type {
  Project, Task, Cost, Procurement, Safety, ProgressEntry,
  Schedule, Contract, BOQItem, WIREntry, CashFlowEntry,
  SubcontractorInvoice, ClientInvoice, Variation, DocumentEntry,
} from '@/types';

type Row = Record<string, string | number | null>;

function toCamel(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[^a-z0-9]/gi, '');
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

function date(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

// ============ PROJECTS ============

export function exportProjectsToExcel(projects: Project[], filename = 'projects.xlsx') {
  const rows = projects.map((p) => ({
    Name: p.name, Client: p.client, Location: p.location, Category: p.category,
    'Start Date': p.start_date ?? '', 'End Date': p.end_date ?? '',
    Budget: p.budget, Spent: p.spent, Status: p.status, 'Progress %': p.progress,
    'Project Manager': p.project_manager, Contractor: p.contractor, Notes: p.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Projects');
  XLSX.writeFile(wb, filename);
}

export function parseProjectsExcel(file: File): Promise<Partial<Project>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const projects = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            name: str(obj.name), client: str(obj.client), location: str(obj.location),
            category: str(obj.category), start_date: date(obj.startdate), end_date: date(obj.enddate),
            budget: num(obj.budget), spent: num(obj.spent), status: str(obj.status) || 'Planning',
            progress: Math.min(100, Math.max(0, num(obj.progress))), project_manager: str(obj.projectmanager),
            contractor: str(obj.contractor), notes: str(obj.notes),
          } as Partial<Project>;
        });
        resolve(projects);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ TASKS ============

export function exportTasksToExcel(tasks: Task[], projectName: string, filename = 'tasks.xlsx') {
  const rows = tasks.map((t) => ({
    Project: projectName, Task: t.name, Assignee: t.assignee, Category: t.category,
    'Start Date': t.start_date ?? '', 'End Date': t.end_date ?? '',
    Cost: t.cost, Status: t.status, 'Progress %': t.progress, Priority: t.priority,
    Predecessors: t.predecessors,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 28 }, { wch: 20 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, filename);
}

export function parseTasksExcel(file: File): Promise<Partial<Task>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const tasks = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            name: str(obj.task || obj.name), assignee: str(obj.assignee), category: str(obj.category),
            start_date: date(obj.startdate), end_date: date(obj.enddate),
            cost: num(obj.cost), status: str(obj.status) || 'Not Started',
            progress: Math.min(100, Math.max(0, num(obj.progress))), priority: str(obj.priority) || 'Medium',
            predecessors: str(obj.predecessors),
          } as Partial<Task>;
        });
        resolve(tasks);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ COSTS ============

export function exportCostsToExcel(costs: Cost[], filename = 'costs.xlsx') {
  const rows = costs.map((c) => ({
    Category: c.category, Description: c.description,
    Planned: c.planned, Actual: c.actual, Committed: c.committed,
    Status: c.status, Notes: c.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 18 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Costs');
  XLSX.writeFile(wb, filename);
}

export function parseCostsExcel(file: File): Promise<Partial<Cost>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const costs = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            category: str(obj.category), description: str(obj.description),
            planned: num(obj.planned), actual: num(obj.actual), committed: num(obj.committed),
            status: str(obj.status) || 'On Budget', notes: str(obj.notes),
          } as Partial<Cost>;
        });
        resolve(costs);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ PROCUREMENT ============

export function exportProcurementToExcel(items: Procurement[], filename = 'procurement.xlsx') {
  const rows = items.map((p) => ({
    Item: p.item, Supplier: p.supplier, Quantity: p.quantity, Unit: p.unit,
    'Unit Cost': p.unit_cost, 'Total Cost': p.total_cost, Status: p.status,
    'Order Date': p.order_date ?? '', 'Delivery Date': p.delivery_date ?? '', Notes: p.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 13 }, { wch: 13 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Procurement');
  XLSX.writeFile(wb, filename);
}

export function parseProcurementExcel(file: File): Promise<Partial<Procurement>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            item: str(obj.item), supplier: str(obj.supplier), quantity: num(obj.quantity),
            unit: str(obj.unit) || 'pcs', unit_cost: num(obj.unitcost), total_cost: num(obj.totalcost),
            status: str(obj.status) || 'Requested', order_date: date(obj.orderdate),
            delivery_date: date(obj.deliverydate), notes: str(obj.notes),
          } as Partial<Procurement>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ SAFETY ============

export function exportSafetyToExcel(items: Safety[], filename = 'safety.xlsx') {
  const rows = items.map((s) => ({
    Type: s.type, Severity: s.severity, Date: s.date ?? '',
    Description: s.description, Location: s.location, Responsible: s.responsible,
    Status: s.status, 'Action Taken': s.action_taken,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 13 }, { wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Safety');
  XLSX.writeFile(wb, filename);
}

export function parseSafetyExcel(file: File): Promise<Partial<Safety>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            type: str(obj.type) || 'Inspection', severity: str(obj.severity) || 'Low',
            date: date(obj.date), description: str(obj.description), location: str(obj.location),
            responsible: str(obj.responsible), status: str(obj.status) || 'Open',
            action_taken: str(obj.actiontaken),
          } as Partial<Safety>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ PROGRESS ============

export function exportProgressToExcel(entries: ProgressEntry[], filename = 'progress.xlsx') {
  const rows = entries.map((p) => ({
    Date: p.date, Area: p.area, '% Complete': p.percent_complete,
    Weather: p.weather, Workers: p.workers, Notes: p.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 13 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Progress');
  XLSX.writeFile(wb, filename);
}

export function parseProgressExcel(file: File): Promise<Partial<ProgressEntry>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const entries = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            date: date(obj.date) || new Date().toISOString().slice(0, 10),
            area: str(obj.area), percent_complete: Math.min(100, Math.max(0, num(obj.percentcomplete || obj.complete))),
            weather: str(obj.weather), workers: num(obj.workers), notes: str(obj.notes),
          } as Partial<ProgressEntry>;
        });
        resolve(entries);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ FULL EXPORT ============

export function exportAllToExcel(
  projects: Project[], tasks: Task[], costs: Cost[],
  procurement: Procurement[], safety: Safety[], progress: ProgressEntry[],
  projectNameMap: Record<string, string>,
  filename = 'construction_project_data.xlsx',
) {
  const wb = XLSX.utils.book_new();

  const wsProjects = XLSX.utils.json_to_sheet(projects.map((p) => ({
    Name: p.name, Client: p.client, Location: p.location, Category: p.category,
    'Start Date': p.start_date ?? '', 'End Date': p.end_date ?? '',
    Budget: p.budget, Spent: p.spent, Status: p.status, 'Progress %': p.progress,
    'Project Manager': p.project_manager, Contractor: p.contractor, Notes: p.notes,
  })));
  wsProjects['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsProjects, 'Projects');

  const wsTasks = XLSX.utils.json_to_sheet(tasks.map((t) => ({
    Project: projectNameMap[t.project_id] || '', Task: t.name, Assignee: t.assignee,
    Category: t.category, 'Start Date': t.start_date ?? '', 'End Date': t.end_date ?? '',
    Cost: t.cost, Status: t.status, 'Progress %': t.progress, Priority: t.priority,
    Predecessors: t.predecessors,
  })));
  wsTasks['!cols'] = [{ wch: 28 }, { wch: 28 }, { wch: 20 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');

  const wsCosts = XLSX.utils.json_to_sheet(costs.map((c) => ({
    Project: projectNameMap[c.project_id] || '', Category: c.category, Description: c.description,
    Planned: c.planned, Actual: c.actual, Committed: c.committed, Status: c.status, Notes: c.notes,
  })));
  wsCosts['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsCosts, 'Costs');

  const wsProc = XLSX.utils.json_to_sheet(procurement.map((p) => ({
    Project: projectNameMap[p.project_id] || '', Item: p.item, Supplier: p.supplier,
    Quantity: p.quantity, Unit: p.unit, 'Unit Cost': p.unit_cost, 'Total Cost': p.total_cost,
    Status: p.status, 'Order Date': p.order_date ?? '', 'Delivery Date': p.delivery_date ?? '', Notes: p.notes,
  })));
  wsProc['!cols'] = [{ wch: 28 }, { wch: 28 }, { wch: 20 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 13 }, { wch: 13 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsProc, 'Procurement');

  const wsSafety = XLSX.utils.json_to_sheet(safety.map((s) => ({
    Project: projectNameMap[s.project_id] || '', Type: s.type, Severity: s.severity,
    Date: s.date ?? '', Description: s.description, Location: s.location,
    Responsible: s.responsible, Status: s.status, 'Action Taken': s.action_taken,
  })));
  wsSafety['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 13 }, { wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSafety, 'Safety');

  const wsProgress = XLSX.utils.json_to_sheet(progress.map((p) => ({
    Project: projectNameMap[p.project_id] || '', Date: p.date, Area: p.area,
    '% Complete': p.percent_complete, Weather: p.weather, Workers: p.workers, Notes: p.notes,
  })));
  wsProgress['!cols'] = [{ wch: 28 }, { wch: 13 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsProgress, 'Progress');

  XLSX.writeFile(wb, filename);
}

// ============ TEMPLATES ============

export function downloadProjectTemplate() {
  const ws = XLSX.utils.json_to_sheet([{
    Name: 'Downtown Office Tower', Client: 'Meridian Holdings',
    Location: '45 Market St, San Francisco', Category: 'Commercial',
    'Start Date': '2025-01-15', 'End Date': '2025-12-30', Budget: 4500000, Spent: 1200000,
    Status: 'In Progress', 'Progress %': 28, 'Project Manager': 'John Carter',
    Contractor: 'BuildRight Construction', Notes: '15-story office building',
  }]);
  ws['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Projects');
  XLSX.writeFile(wb, 'project-template.xlsx');
}

// ============ SCHEDULE ============

export function exportScheduleToExcel(items: Schedule[], pmap: Record<string, string>, filename = 'schedule.xlsx') {
  const rows = items.map((s) => ({
    Project: pmap[s.project_id] || '', Activity: s.activity,
    'Start Date': s.start_date ?? '', 'End Date': s.end_date ?? '',
    'Duration (days)': s.duration_days, 'Progress %': s.progress,
    Predecessors: s.predecessors, 'Critical Path': s.critical_path ? 'Yes' : 'No',
    Responsible: s.responsible, Status: s.status, Notes: s.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 30 }, { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
  XLSX.writeFile(wb, filename);
}

export function parseScheduleExcel(file: File): Promise<Partial<Schedule>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            activity: str(obj.activity), start_date: date(obj.startdate), end_date: date(obj.enddate),
            duration_days: num(obj.durationdays || obj.duration), progress: Math.min(100, Math.max(0, num(obj.progress))),
            predecessors: str(obj.predecessors), critical_path: str(obj.criticalpath).toLowerCase() === 'yes',
            responsible: str(obj.responsible), status: str(obj.status) || 'Not Started', notes: str(obj.notes),
          } as Partial<Schedule>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ CONTRACTS ============

export function exportContractsToExcel(items: Contract[], pmap: Record<string, string>, filename = 'contracts.xlsx') {
  const rows = items.map((c) => ({
    Project: pmap[c.project_id] || '', 'Contract Number': c.contract_number, Title: c.title,
    Contractor: c.contractor, Type: c.contract_type, Value: c.contract_value,
    'Start Date': c.start_date ?? '', 'End Date': c.end_date ?? '',
    Status: c.status, 'Signed Date': c.signed_date ?? '', Notes: c.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 13 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contracts');
  XLSX.writeFile(wb, filename);
}

export function parseContractsExcel(file: File): Promise<Partial<Contract>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            contract_number: str(obj.contractnumber), title: str(obj.title), contractor: str(obj.contractor),
            contract_type: str(obj.contracttype || obj.type) || 'Lump Sum', contract_value: num(obj.contractvalue || obj.value),
            start_date: date(obj.startdate), end_date: date(obj.enddate), status: str(obj.status) || 'Draft',
            signed_date: date(obj.signeddate), notes: str(obj.notes),
          } as Partial<Contract>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ BOQ ============

export function exportBOQToExcel(items: BOQItem[], pmap: Record<string, string>, filename = 'boq.xlsx') {
  const rows = items.map((b) => ({
    Project: pmap[b.project_id] || '', 'Item Code': b.item_code, Description: b.description,
    Category: b.category, Unit: b.unit, Quantity: b.quantity, 'Unit Rate': b.unit_rate,
    Amount: b.amount, Notes: b.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 40 }, { wch: 16 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BOQ');
  XLSX.writeFile(wb, filename);
}

export function parseBOQExcel(file: File): Promise<Partial<BOQItem>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          const qty = num(obj.quantity), rate = num(obj.unitrate || obj.rate);
          return {
            item_code: str(obj.itemcode), description: str(obj.description), category: str(obj.category),
            unit: str(obj.unit) || 'pcs', quantity: qty, unit_rate: rate, amount: num(obj.amount) || qty * rate,
            notes: str(obj.notes),
          } as Partial<BOQItem>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ WIR ============

export function exportWIRToExcel(items: WIREntry[], pmap: Record<string, string>, filename = 'wir.xlsx') {
  const rows = items.map((w) => ({
    Project: pmap[w.project_id] || '', 'WIR Number': w.wir_number, Area: w.area,
    'Work Type': w.work_type, 'Inspection Date': w.inspection_date ?? '',
    Inspector: w.inspector, Result: w.result, Remarks: w.remarks, Status: w.status,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 30 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'WIR');
  XLSX.writeFile(wb, filename);
}

export function parseWIRExcel(file: File): Promise<Partial<WIREntry>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            wir_number: str(obj.wirnumber), area: str(obj.area), work_type: str(obj.worktype) || 'Inspection',
            inspection_date: date(obj.inspectiondate), inspector: str(obj.inspector),
            result: str(obj.result) || 'Pending', remarks: str(obj.remarks), status: str(obj.status) || 'Open',
          } as Partial<WIREntry>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ CASH FLOW ============

export function exportCashFlowToExcel(items: CashFlowEntry[], pmap: Record<string, string>, filename = 'cashflow.xlsx') {
  const rows = items.map((c) => ({
    Project: pmap[c.project_id] || '', Date: c.date ?? '', Description: c.description,
    Inflow: c.inflow, Outflow: c.outflow, Net: c.net, 'Cumulative Balance': c.cumulative_balance,
    Category: c.category, Notes: c.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 13 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cash Flow');
  XLSX.writeFile(wb, filename);
}

export function parseCashFlowExcel(file: File): Promise<Partial<CashFlowEntry>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          const inflow = num(obj.inflow), outflow = num(obj.outflow);
          return {
            date: date(obj.date), description: str(obj.description), inflow, outflow,
            net: num(obj.net) || inflow - outflow, cumulative_balance: num(obj.cumulativebalance || obj.balance),
            category: str(obj.category), notes: str(obj.notes),
          } as Partial<CashFlowEntry>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ SUBCONTRACTOR INVOICES ============

export function exportSubInvoicesToExcel(items: SubcontractorInvoice[], pmap: Record<string, string>, filename = 'subcontractor-invoices.xlsx') {
  const rows = items.map((s) => ({
    Project: pmap[s.project_id] || '', 'Invoice Number': s.invoice_number, Subcontractor: s.subcontractor,
    'BOQ Reference': s.boq_reference, 'Invoice Date': s.invoice_date ?? '',
    Amount: s.amount, Status: s.status, 'Payment Status': s.payment_status,
    'Payment Date': s.payment_date ?? '', 'Paid Amount': s.paid_amount, Notes: s.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 14 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sub Invoices');
  XLSX.writeFile(wb, filename);
}

export function parseSubInvoicesExcel(file: File): Promise<Partial<SubcontractorInvoice>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            invoice_number: str(obj.invoicenumber), subcontractor: str(obj.subcontractor),
            boq_reference: str(obj.boqreference), invoice_date: date(obj.invoicedate),
            amount: num(obj.amount), status: str(obj.status) || 'Submitted',
            payment_status: str(obj.paymentstatus) || 'Unpaid', payment_date: date(obj.paymentdate),
            paid_amount: num(obj.paidamount), notes: str(obj.notes),
          } as Partial<SubcontractorInvoice>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ CLIENT INVOICES ============

export function exportClientInvoicesToExcel(items: ClientInvoice[], pmap: Record<string, string>, filename = 'client-invoices.xlsx') {
  const rows = items.map((c) => ({
    Project: pmap[c.project_id] || '', 'Invoice Number': c.invoice_number, Client: c.client,
    'Invoice Date': c.invoice_date ?? '', 'Due Date': c.due_date ?? '',
    Amount: c.amount, Status: c.status, 'Payment Status': c.payment_status,
    'Payment Date': c.payment_date ?? '', 'Paid Amount': c.paid_amount, Notes: c.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 14 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Client Invoices');
  XLSX.writeFile(wb, filename);
}

export function parseClientInvoicesExcel(file: File): Promise<Partial<ClientInvoice>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            invoice_number: str(obj.invoicenumber), client: str(obj.client),
            invoice_date: date(obj.invoicedate), due_date: date(obj.duedate),
            amount: num(obj.amount), status: str(obj.status) || 'Draft',
            payment_status: str(obj.paymentstatus) || 'Unpaid', payment_date: date(obj.paymentdate),
            paid_amount: num(obj.paidamount), notes: str(obj.notes),
          } as Partial<ClientInvoice>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ VARIATIONS ============

export function exportVariationsToExcel(items: Variation[], pmap: Record<string, string>, filename = 'variations.xlsx') {
  const rows = items.map((v) => ({
    Project: pmap[v.project_id] || '', 'Variation Number': v.variation_number, Type: v.type,
    Title: v.title, Description: v.description, 'Cost Impact': v.cost_impact,
    'Time Impact (days)': v.time_impact_days, Status: v.status, 'Approved By': v.approved_by,
    'Approved Date': v.approved_date ?? '', Notes: v.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 40 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 13 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Variations');
  XLSX.writeFile(wb, filename);
}

export function parseVariationsExcel(file: File): Promise<Partial<Variation>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            variation_number: str(obj.variationnumber), type: str(obj.type) || 'Variation',
            title: str(obj.title), description: str(obj.description), cost_impact: num(obj.costimpact),
            time_impact_days: num(obj.timeimpactdays || obj.timeimpact), status: str(obj.status) || 'Pending',
            approved_by: str(obj.approvedby), approved_date: date(obj.approveddate), notes: str(obj.notes),
          } as Partial<Variation>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ============ DOCUMENTS ============

export function exportDocumentsToExcel(items: DocumentEntry[], pmap: Record<string, string>, filename = 'documents.xlsx') {
  const rows = items.map((d) => ({
    Project: pmap[d.project_id] || '', 'Document Name': d.document_name, Type: d.document_type,
    Category: d.category, Version: d.version, 'Upload Date': d.upload_date ?? '',
    Status: d.status, Responsible: d.responsible, 'File Reference': d.file_reference, Notes: d.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 13 }, { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Documents');
  XLSX.writeFile(wb, filename);
}

export function parseDocumentsExcel(file: File): Promise<Partial<DocumentEntry>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });
        const items = json.map((row) => {
          const obj: Record<string, string | number | null> = {};
          for (const k of Object.keys(row)) obj[toCamel(k)] = row[k];
          return {
            document_name: str(obj.documentname), document_type: str(obj.documenttype || obj.type) || 'Drawing',
            category: str(obj.category), version: str(obj.version) || '1.0', upload_date: date(obj.uploaddate),
            status: str(obj.status) || 'Current', responsible: str(obj.responsible),
            file_reference: str(obj.filereference), notes: str(obj.notes),
          } as Partial<DocumentEntry>;
        });
        resolve(items);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
