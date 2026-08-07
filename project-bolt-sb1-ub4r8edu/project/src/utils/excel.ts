import * as XLSX from 'xlsx';
import type { Project, Task, Cost, Procurement, Safety, ProgressEntry } from '@/types';

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
