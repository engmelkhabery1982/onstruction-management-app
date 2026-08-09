import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { Project, Task, Cost, Procurement, Safety, ProgressEntry, ViewKey, Schedule, Contract, BOQItem, BOQHeader, WIREntry, CashFlowEntry, SubcontractorInvoice, ClientInvoice, Variation, DocumentEntry } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { ProjectsView } from '@/components/ProjectsView';
import { TasksView } from '@/components/TasksView';
import { CostsView } from '@/components/CostsView';
import { ProcurementView } from '@/components/ProcurementView';
import { SafetyView } from '@/components/SafetyView';
import { ProgressView } from '@/components/ProgressView';
import { ScheduleView } from '@/components/ScheduleView';
import { ContractsView } from '@/components/ContractsView';
import { BOQView } from '@/components/BOQView';
import { WIRView } from '@/components/WIRView';
import { CashFlowView } from '@/components/CashFlowView';
import { SubInvoicesView } from '@/components/SubInvoicesView';
import { ClientInvoicesView } from '@/components/ClientInvoicesView';
import { VariationsView } from '@/components/VariationsView';
import { DocumentsView } from '@/components/DocumentsView';

export default function App() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [procurement, setProcurement] = useState<Procurement[]>([]);
  const [safety, setSafety] = useState<Safety[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [boqItems, setBOQItems] = useState<BOQItem[]>([]);
  const [boqHeaders, setBOQHeaders] = useState<BOQHeader[]>([]);
  const [wirEntries, setWIREntries] = useState<WIREntry[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [subInvoices, setSubInvoices] = useState<SubcontractorInvoice[]>([]);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Project[];
  }, []);

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Task[];
  }, []);

  const loadCosts = useCallback(async () => {
    const { data, error } = await supabase.from('costs').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Cost[];
  }, []);

  const loadProcurement = useCallback(async () => {
    const { data, error } = await supabase.from('procurement').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Procurement[];
  }, []);

  const loadSafety = useCallback(async () => {
    const { data, error } = await supabase.from('safety').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Safety[];
  }, []);

  const loadProgress = useCallback(async () => {
    const { data, error } = await supabase.from('progress_entries').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as ProgressEntry[];
  }, []);

  const loadSchedules = useCallback(async () => {
    const { data, error } = await supabase.from('schedules').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Schedule[];
  }, []);

  const loadContracts = useCallback(async () => {
    const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Contract[];
  }, []);

  const loadBOQItems = useCallback(async () => {
    const { data, error } = await supabase.from('boq_items').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as BOQItem[];
  }, []);

  const loadBOQHeaders = useCallback(async () => {
    const { data, error } = await supabase.from('boq_headers').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as BOQHeader[];
  }, []);

  const loadWIREntries = useCallback(async () => {
    const { data, error } = await supabase.from('wir_entries').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as WIREntry[];
  }, []);

  const loadCashFlow = useCallback(async () => {
    const { data, error } = await supabase.from('cash_flow').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as CashFlowEntry[];
  }, []);

  const loadSubInvoices = useCallback(async () => {
    const { data, error } = await supabase.from('subcontractor_invoices').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as SubcontractorInvoice[];
  }, []);

  const loadClientInvoices = useCallback(async () => {
    const { data, error } = await supabase.from('client_invoices').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as ClientInvoice[];
  }, []);

  const loadVariations = useCallback(async () => {
    const { data, error } = await supabase.from('variations').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Variation[];
  }, []);

  const loadDocuments = useCallback(async () => {
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as DocumentEntry[];
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, t, c, pr, s, pg, sc, ct, bq, bqh, wr, cf, si, ci, va, dc] = await Promise.all([
        loadProjects(), loadTasks(), loadCosts(), loadProcurement(), loadSafety(), loadProgress(),
        loadSchedules(), loadContracts(), loadBOQItems(), loadBOQHeaders(), loadWIREntries(), loadCashFlow(),
        loadSubInvoices(), loadClientInvoices(), loadVariations(), loadDocuments(),
      ]);
      setProjects(p); setTasks(t); setCosts(c); setProcurement(pr); setSafety(s); setProgress(pg);
      setSchedules(sc); setContracts(ct); setBOQItems(bq); setBOQHeaders(bqh); setWIREntries(wr); setCashFlow(cf);
      setSubInvoices(si); setClientInvoices(ci); setVariations(va); setDocuments(dc);
      setLoading(false);
    })();
  }, [loadProjects, loadTasks, loadCosts, loadProcurement, loadSafety, loadProgress, loadSchedules, loadContracts, loadBOQItems, loadBOQHeaders, loadWIREntries, loadCashFlow, loadSubInvoices, loadClientInvoices, loadVariations, loadDocuments]);

  // ---- Project CRUD ----
  const updateProjectCell = useCallback(async (id: string, key: string, value: string | number) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
    const update: Record<string, string | number> = { [key]: value };
    if (key === 'progress') update.progress = Math.min(100, Math.max(0, Number(value) || 0));
    const { error } = await supabase.from('projects').update(update).eq('id', id);
    if (error) { setError(error.message); setProjects(await loadProjects()); }
  }, [loadProjects]);

  const addProjectRow = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects').insert({ name: 'New Project', status: 'Planning', budget: 0, spent: 0, progress: 0 })
      .select().single();
    if (error) { setError(error.message); return; }
    setProjects((prev) => [data as Project, ...prev]);
  }, []);

  const deleteProjectRow = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.project_id !== id));
    setCosts((prev) => prev.filter((c) => c.project_id !== id));
    setProcurement((prev) => prev.filter((p) => p.project_id !== id));
    setSafety((prev) => prev.filter((s) => s.project_id !== id));
    setProgress((prev) => prev.filter((p) => p.project_id !== id));
    setSchedules((prev) => prev.filter((s) => s.project_id !== id));
    setContracts((prev) => prev.filter((c) => c.project_id !== id));
    setBOQItems((prev) => prev.filter((b) => b.project_id !== id));
    setWIREntries((prev) => prev.filter((w) => w.project_id !== id));
    setCashFlow((prev) => prev.filter((c) => c.project_id !== id));
    setSubInvoices((prev) => prev.filter((s) => s.project_id !== id));
    setClientInvoices((prev) => prev.filter((c) => c.project_id !== id));
    setVariations((prev) => prev.filter((v) => v.project_id !== id));
    setDocuments((prev) => prev.filter((d) => d.project_id !== id));
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportProjects = useCallback(async (rows: Partial<Project>[]) => {
    const valid = rows.filter((r) => r.name && r.name.trim());
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      name: r.name, client: r.client || '', location: r.location || '',
      category: r.category || 'Residential', start_date: r.start_date, end_date: r.end_date,
      budget: r.budget || 0, spent: r.spent || 0, status: r.status || 'Planning',
      progress: r.progress || 0, project_manager: r.project_manager || '',
      contractor: r.contractor || '', notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('projects').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setProjects((prev) => [...(data as Project[]), ...prev]);
  }, []);

  // ---- Task CRUD ----
  const updateTaskCell = useCallback(async (id: string, key: string, value: string | number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
    const update: Record<string, string | number> = { [key]: value };
    if (key === 'progress') update.progress = Math.min(100, Math.max(0, Number(value) || 0));
    const { error } = await supabase.from('tasks').update(update).eq('id', id);
    if (error) { setError(error.message); setTasks(await loadTasks()); }
  }, [loadTasks]);

  const addTaskRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first before adding tasks.'); return; }
    const { data, error } = await supabase
      .from('tasks').insert({ name: 'New Task', project_id: projects[0].id, status: 'Not Started', cost: 0, progress: 0, priority: 'Medium' })
      .select().single();
    if (error) { setError(error.message); return; }
    setTasks((prev) => [data as Task, ...prev]);
  }, [projects]);

  const deleteTaskRow = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportTasks = useCallback(async (rows: Partial<Task>[]) => {
    const valid = rows.filter((r) => r.name && r.name.trim() && r.project_id);
    if (valid.length === 0) { setError('Imported tasks need a Task Name. Also ensure at least one project exists.'); return; }
    const insert = valid.map((r) => ({
      name: r.name, project_id: r.project_id, assignee: r.assignee || '', category: r.category || '',
      start_date: r.start_date, end_date: r.end_date, cost: r.cost || 0,
      status: r.status || 'Not Started', progress: r.progress || 0,
      priority: r.priority || 'Medium', predecessors: r.predecessors || '',
    }));
    const { data, error } = await supabase.from('tasks').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setTasks((prev) => [...(data as Task[]), ...prev]);
  }, []);

  // ---- Cost CRUD ----
  const updateCostCell = useCallback(async (id: string, key: string, value: string | number) => {
    setCosts((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    const { error } = await supabase.from('costs').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setCosts(await loadCosts()); }
  }, [loadCosts]);

  const addCostRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('costs').insert({ project_id: projects[0].id, category: 'Materials', description: '', planned: 0, actual: 0, committed: 0, status: 'On Budget', notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setCosts((prev) => [data as Cost, ...prev]);
  }, [projects]);

  const deleteCostRow = useCallback(async (id: string) => {
    setCosts((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from('costs').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportCosts = useCallback(async (rows: Partial<Cost>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, category: r.category || 'Materials', description: r.description || '',
      planned: r.planned || 0, actual: r.actual || 0, committed: r.committed || 0,
      status: r.status || 'On Budget', notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('costs').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setCosts((prev) => [...(data as Cost[]), ...prev]);
  }, []);

  // ---- Procurement CRUD ----
  const updateProcurementCell = useCallback(async (id: string, key: string, value: string | number) => {
    setProcurement((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
    const { error } = await supabase.from('procurement').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setProcurement(await loadProcurement()); }
  }, [loadProcurement]);

  const addProcurementRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('procurement').insert({ project_id: projects[0].id, item: '', supplier: '', quantity: 1, unit: 'pcs', unit_cost: 0, total_cost: 0, status: 'Requested', notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setProcurement((prev) => [data as Procurement, ...prev]);
  }, [projects]);

  const deleteProcurementRow = useCallback(async (id: string) => {
    setProcurement((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('procurement').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportProcurement = useCallback(async (rows: Partial<Procurement>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, item: r.item || '', supplier: r.supplier || '',
      quantity: r.quantity || 1, unit: r.unit || 'pcs', unit_cost: r.unit_cost || 0,
      total_cost: r.total_cost || 0, status: r.status || 'Requested',
      order_date: r.order_date, delivery_date: r.delivery_date, notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('procurement').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setProcurement((prev) => [...(data as Procurement[]), ...prev]);
  }, []);

  // ---- Safety CRUD ----
  const updateSafetyCell = useCallback(async (id: string, key: string, value: string | number) => {
    setSafety((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
    const { error } = await supabase.from('safety').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setSafety(await loadSafety()); }
  }, [loadSafety]);

  const addSafetyRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('safety').insert({ project_id: projects[0].id, type: 'Inspection', severity: 'Low', date: new Date().toISOString().slice(0, 10), description: '', location: '', responsible: '', status: 'Open', action_taken: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setSafety((prev) => [data as Safety, ...prev]);
  }, [projects]);

  const deleteSafetyRow = useCallback(async (id: string) => {
    setSafety((prev) => prev.filter((s) => s.id !== id));
    const { error } = await supabase.from('safety').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportSafety = useCallback(async (rows: Partial<Safety>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, type: r.type || 'Inspection', severity: r.severity || 'Low',
      date: r.date, description: r.description || '', location: r.location || '',
      responsible: r.responsible || '', status: r.status || 'Open', action_taken: r.action_taken || '',
    }));
    const { data, error } = await supabase.from('safety').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setSafety((prev) => [...(data as Safety[]), ...prev]);
  }, []);

  // ---- Progress CRUD ----
  const updateProgressCell = useCallback(async (id: string, key: string, value: string | number) => {
    setProgress((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
    const update: Record<string, string | number> = { [key]: value };
    if (key === 'percent_complete') update.percent_complete = Math.min(100, Math.max(0, Number(value) || 0));
    const { error } = await supabase.from('progress_entries').update(update).eq('id', id);
    if (error) { setError(error.message); setProgress(await loadProgress()); }
  }, [loadProgress]);

  const addProgressRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('progress_entries').insert({ project_id: projects[0].id, date: new Date().toISOString().slice(0, 10), area: '', percent_complete: 0, weather: '', workers: 0, notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setProgress((prev) => [data as ProgressEntry, ...prev]);
  }, [projects]);

  const deleteProgressRow = useCallback(async (id: string) => {
    setProgress((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('progress_entries').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportProgress = useCallback(async (rows: Partial<ProgressEntry>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, date: r.date || new Date().toISOString().slice(0, 10),
      area: r.area || '', percent_complete: r.percent_complete || 0, weather: r.weather || '',
      workers: r.workers || 0, notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('progress_entries').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setProgress((prev) => [...(data as ProgressEntry[]), ...prev]);
  }, []);

  // ---- Schedule CRUD ----
  const updateScheduleCell = useCallback(async (id: string, key: string, value: string | number) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
    const update: Record<string, string | number | boolean> = { [key]: value };
    if (key === 'critical_path') update.critical_path = value === 1 || value === 'Yes';
    if (key === 'progress') update.progress = Math.min(100, Math.max(0, Number(value) || 0));
    const { error } = await supabase.from('schedules').update(update).eq('id', id);
    if (error) { setError(error.message); setSchedules(await loadSchedules()); }
  }, [loadSchedules]);

  const addScheduleRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('schedules').insert({ project_id: projects[0].id, activity: '', duration_days: 0, progress: 0, critical_path: false, predecessors: '', responsible: '', status: 'Not Started', notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setSchedules((prev) => [data as Schedule, ...prev]);
  }, [projects]);

  const deleteScheduleRow = useCallback(async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportSchedules = useCallback(async (rows: Partial<Schedule>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, activity: r.activity || '', start_date: r.start_date, end_date: r.end_date,
      duration_days: r.duration_days || 0, progress: r.progress || 0, predecessors: r.predecessors || '',
      critical_path: r.critical_path || false, responsible: r.responsible || '', status: r.status || 'Not Started', notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('schedules').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setSchedules((prev) => [...(data as Schedule[]), ...prev]);
  }, []);

  // ---- Contract CRUD ----
  const updateContractCell = useCallback(async (id: string, key: string, value: string | number) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    const { error } = await supabase.from('contracts').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setContracts(await loadContracts()); }
  }, [loadContracts]);

  const addContractRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('contracts').insert({ project_id: projects[0].id, contract_number: '', title: '', contractor: '', contract_type: 'Lump Sum', contract_value: 0, status: 'Draft', notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setContracts((prev) => [data as Contract, ...prev]);
  }, [projects]);

  const deleteContractRow = useCallback(async (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportContracts = useCallback(async (rows: Partial<Contract>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, contract_number: r.contract_number || '', title: r.title || '', contractor: r.contractor || '',
      contract_type: r.contract_type || 'Lump Sum', contract_value: r.contract_value || 0, start_date: r.start_date, end_date: r.end_date,
      status: r.status || 'Draft', signed_date: r.signed_date, notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('contracts').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setContracts((prev) => [...(data as Contract[]), ...prev]);
  }, []);

  // ---- BOQ CRUD ----
  const updateBOQCell = useCallback(async (id: string, key: string, value: string | number) => {
    setBOQItems((prev) => prev.map((b) => (b.id === id ? { ...b, [key]: value } : b)));
    const { error } = await supabase.from('boq_items').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setBOQItems(await loadBOQItems()); }
  }, [loadBOQItems]);

  const addBOQRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('boq_items').insert({ project_id: projects[0].id, item_code: '', description: '', category: '', unit: 'pcs', quantity: 0, unit_rate: 0, amount: 0, notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setBOQItems((prev) => [data as BOQItem, ...prev]);
  }, [projects]);

  const deleteBOQRow = useCallback(async (id: string) => {
    setBOQItems((prev) => prev.filter((b) => b.id !== id));
    const { error } = await supabase.from('boq_items').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportBOQ = useCallback(async (rows: Partial<BOQItem>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, item_code: r.item_code || '', description: r.description || '', category: r.category || '',
      unit: r.unit || 'pcs', quantity: r.quantity || 0, unit_rate: r.unit_rate || 0, amount: r.amount || 0, notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('boq_items').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setBOQItems((prev) => [...(data as BOQItem[]), ...prev]);
  }, []);

  // ---- WIR CRUD ----
  const updateWIRCell = useCallback(async (id: string, key: string, value: string | number) => {
    setWIREntries((prev) => prev.map((w) => (w.id === id ? { ...w, [key]: value } : w)));
    const { error } = await supabase.from('wir_entries').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setWIREntries(await loadWIREntries()); }
  }, [loadWIREntries]);

  const addWIRRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('wir_entries').insert({ project_id: projects[0].id, wir_number: '', area: '', work_type: 'Inspection', inspector: '', result: 'Pending', remarks: '', status: 'Open' })
      .select().single();
    if (error) { setError(error.message); return; }
    setWIREntries((prev) => [data as WIREntry, ...prev]);
  }, [projects]);

  const deleteWIRRow = useCallback(async (id: string) => {
    setWIREntries((prev) => prev.filter((w) => w.id !== id));
    const { error } = await supabase.from('wir_entries').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportWIR = useCallback(async (rows: Partial<WIREntry>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, wir_number: r.wir_number || '', area: r.area || '', work_type: r.work_type || 'Inspection',
      inspection_date: r.inspection_date, inspector: r.inspector || '', result: r.result || 'Pending', remarks: r.remarks || '', status: r.status || 'Open',
    }));
    const { data, error } = await supabase.from('wir_entries').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setWIREntries((prev) => [...(data as WIREntry[]), ...prev]);
  }, []);

  // ---- Cash Flow CRUD ----
  const updateCashFlowCell = useCallback(async (id: string, key: string, value: string | number) => {
    setCashFlow((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    const { error } = await supabase.from('cash_flow').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setCashFlow(await loadCashFlow()); }
  }, [loadCashFlow]);

  const addCashFlowRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('cash_flow').insert({ project_id: projects[0].id, description: '', inflow: 0, outflow: 0, net: 0, cumulative_balance: 0, category: '', notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setCashFlow((prev) => [data as CashFlowEntry, ...prev]);
  }, [projects]);

  const deleteCashFlowRow = useCallback(async (id: string) => {
    setCashFlow((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from('cash_flow').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportCashFlow = useCallback(async (rows: Partial<CashFlowEntry>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, date: r.date, description: r.description || '', inflow: r.inflow || 0, outflow: r.outflow || 0,
      net: r.net || 0, cumulative_balance: r.cumulative_balance || 0, category: r.category || '', notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('cash_flow').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setCashFlow((prev) => [...(data as CashFlowEntry[]), ...prev]);
  }, []);

  // ---- Subcontractor Invoice CRUD ----
  const updateSubInvoiceCell = useCallback(async (id: string, key: string, value: string | number) => {
    setSubInvoices((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
    const { error } = await supabase.from('subcontractor_invoices').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setSubInvoices(await loadSubInvoices()); }
  }, [loadSubInvoices]);

  const addSubInvoiceRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('subcontractor_invoices').insert({ project_id: projects[0].id, invoice_number: '', subcontractor: '', boq_reference: '', amount: 0, status: 'Submitted', payment_status: 'Unpaid', paid_amount: 0, notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setSubInvoices((prev) => [data as SubcontractorInvoice, ...prev]);
  }, [projects]);

  const deleteSubInvoiceRow = useCallback(async (id: string) => {
    setSubInvoices((prev) => prev.filter((s) => s.id !== id));
    const { error } = await supabase.from('subcontractor_invoices').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportSubInvoices = useCallback(async (rows: Partial<SubcontractorInvoice>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, invoice_number: r.invoice_number || '', subcontractor: r.subcontractor || '',
      boq_reference: r.boq_reference || '', invoice_date: r.invoice_date, amount: r.amount || 0,
      status: r.status || 'Submitted', payment_status: r.payment_status || 'Unpaid', payment_date: r.payment_date,
      paid_amount: r.paid_amount || 0, notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('subcontractor_invoices').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setSubInvoices((prev) => [...(data as SubcontractorInvoice[]), ...prev]);
  }, []);

  // ---- Client Invoice CRUD ----
  const updateClientInvoiceCell = useCallback(async (id: string, key: string, value: string | number) => {
    setClientInvoices((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    const { error } = await supabase.from('client_invoices').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setClientInvoices(await loadClientInvoices()); }
  }, [loadClientInvoices]);

  const addClientInvoiceRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('client_invoices').insert({ project_id: projects[0].id, invoice_number: '', client: '', amount: 0, status: 'Draft', payment_status: 'Unpaid', paid_amount: 0, notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setClientInvoices((prev) => [data as ClientInvoice, ...prev]);
  }, [projects]);

  const deleteClientInvoiceRow = useCallback(async (id: string) => {
    setClientInvoices((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from('client_invoices').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportClientInvoices = useCallback(async (rows: Partial<ClientInvoice>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, invoice_number: r.invoice_number || '', client: r.client || '',
      invoice_date: r.invoice_date, due_date: r.due_date, amount: r.amount || 0,
      status: r.status || 'Draft', payment_status: r.payment_status || 'Unpaid', payment_date: r.payment_date,
      paid_amount: r.paid_amount || 0, notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('client_invoices').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setClientInvoices((prev) => [...(data as ClientInvoice[]), ...prev]);
  }, []);

  // ---- Variation CRUD ----
  const updateVariationCell = useCallback(async (id: string, key: string, value: string | number) => {
    setVariations((prev) => prev.map((v) => (v.id === id ? { ...v, [key]: value } : v)));
    const { error } = await supabase.from('variations').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setVariations(await loadVariations()); }
  }, [loadVariations]);

  const addVariationRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('variations').insert({ project_id: projects[0].id, variation_number: '', type: 'Variation', title: '', description: '', cost_impact: 0, time_impact_days: 0, status: 'Pending', approved_by: '', notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setVariations((prev) => [data as Variation, ...prev]);
  }, [projects]);

  const deleteVariationRow = useCallback(async (id: string) => {
    setVariations((prev) => prev.filter((v) => v.id !== id));
    const { error } = await supabase.from('variations').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportVariations = useCallback(async (rows: Partial<Variation>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, variation_number: r.variation_number || '', type: r.type || 'Variation', title: r.title || '',
      description: r.description || '', cost_impact: r.cost_impact || 0, time_impact_days: r.time_impact_days || 0,
      status: r.status || 'Pending', approved_by: r.approved_by || '', approved_date: r.approved_date, notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('variations').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setVariations((prev) => [...(data as Variation[]), ...prev]);
  }, []);

  // ---- Document CRUD ----
  const updateDocumentCell = useCallback(async (id: string, key: string, value: string | number) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, [key]: value } : d)));
    const { error } = await supabase.from('documents').update({ [key]: value }).eq('id', id);
    if (error) { setError(error.message); setDocuments(await loadDocuments()); }
  }, [loadDocuments]);

  const addDocumentRow = useCallback(async () => {
    if (projects.length === 0) { setError('Create a project first.'); return; }
    const { data, error } = await supabase
      .from('documents').insert({ project_id: projects[0].id, document_name: '', document_type: 'Drawing', category: '', version: '1.0', status: 'Current', responsible: '', file_reference: '', notes: '' })
      .select().single();
    if (error) { setError(error.message); return; }
    setDocuments((prev) => [data as DocumentEntry, ...prev]);
  }, [projects]);

  const deleteDocumentRow = useCallback(async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportDocuments = useCallback(async (rows: Partial<DocumentEntry>[]) => {
    const valid = rows.filter((r) => r.project_id);
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      project_id: r.project_id, document_name: r.document_name || '', document_type: r.document_type || 'Drawing',
      category: r.category || '', version: r.version || '1.0', upload_date: r.upload_date, status: r.status || 'Current',
      responsible: r.responsible || '', file_reference: r.file_reference || '', notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('documents').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setDocuments((prev) => [...(data as DocumentEntry[]), ...prev]);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Loading your construction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-neutral-50 overflow-hidden">
      <Sidebar
        active={view}
        onNavigate={setView}
        projectCount={projects.length}
        taskCount={tasks.length}
        costCount={costs.length}
        procurementCount={procurement.length}
        safetyCount={safety.length}
        progressCount={progress.length}
        scheduleCount={schedules.length}
        contractCount={contracts.length}
        boqCount={boqItems.length}
        wirCount={wirEntries.length}
        cashFlowCount={cashFlow.length}
        subInvoiceCount={subInvoices.length}
        clientInvoiceCount={clientInvoices.length}
        variationCount={variations.length}
        documentCount={documents.length}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="bg-error-50 border-b border-error-200 px-4 py-2 flex items-center justify-between">
            <p className="text-sm text-error-700">{error}</p>
            <button onClick={() => setError(null)} className="text-error-500 hover:text-error-700 text-sm">Dismiss</button>
          </div>
        )}
        {view === 'dashboard' && (
          <Dashboard
            projects={projects}
            tasks={tasks}
            costs={costs}
            procurement={procurement}
            safety={safety}
            progress={progress}
            schedules={schedules}
            contracts={contracts}
            boqItems={boqItems}
            cashFlow={cashFlow}
            subInvoices={subInvoices}
            clientInvoices={clientInvoices}
            variations={variations}
            documents={documents}
            onNavigate={setView}
          />
        )}
        {view === 'projects' && (
          <ProjectsView
            projects={projects}
            onCellChange={updateProjectCell}
            onAddRow={addProjectRow}
            onDeleteRow={deleteProjectRow}
            onBulkImport={bulkImportProjects}
          />
        )}
        {view === 'tasks' && (
          <TasksView
            tasks={tasks}
            projects={projects}
            onCellChange={updateTaskCell}
            onAddRow={addTaskRow}
            onDeleteRow={deleteTaskRow}
            onBulkImport={bulkImportTasks}
          />
        )}
        {view === 'costs' && (
          <CostsView
            costs={costs}
            projects={projects}
            onCellChange={updateCostCell}
            onAddRow={addCostRow}
            onDeleteRow={deleteCostRow}
            onBulkImport={bulkImportCosts}
          />
        )}
        {view === 'procurement' && (
          <ProcurementView
            procurement={procurement}
            projects={projects}
            onCellChange={updateProcurementCell}
            onAddRow={addProcurementRow}
            onDeleteRow={deleteProcurementRow}
            onBulkImport={bulkImportProcurement}
          />
        )}
        {view === 'safety' && (
          <SafetyView
            safety={safety}
            projects={projects}
            onCellChange={updateSafetyCell}
            onAddRow={addSafetyRow}
            onDeleteRow={deleteSafetyRow}
            onBulkImport={bulkImportSafety}
          />
        )}
        {view === 'progress' && (
          <ProgressView
            progress={progress}
            projects={projects}
            onCellChange={updateProgressCell}
            onAddRow={addProgressRow}
            onDeleteRow={deleteProgressRow}
            onBulkImport={bulkImportProgress}
          />
        )}
        {view === 'schedule' && (
          <ScheduleView
            schedules={schedules}
            projects={projects}
            onCellChange={updateScheduleCell}
            onAddRow={addScheduleRow}
            onDeleteRow={deleteScheduleRow}
            onBulkImport={bulkImportSchedules}
          />
        )}
        {view === 'contracts' && (
          <ContractsView
            contracts={contracts}
            projects={projects}
            onCellChange={updateContractCell}
            onAddRow={addContractRow}
            onDeleteRow={deleteContractRow}
            onBulkImport={bulkImportContracts}
          />
        )}
        {view === 'boq' && (
          <BOQView
            boqItems={boqItems}
            projects={projects}
            onCellChange={updateBOQCell}
            onAddRow={addBOQRow}
            onDeleteRow={deleteBOQRow}
            onBulkImport={bulkImportBOQ}
          />
        )}
        {view === 'wir' && (
          <WIRView
            wirEntries={wirEntries}
            projects={projects}
            onCellChange={updateWIRCell}
            onAddRow={addWIRRow}
            onDeleteRow={deleteWIRRow}
            onBulkImport={bulkImportWIR}
          />
        )}
        {view === 'cashflow' && (
          <CashFlowView
            cashFlow={cashFlow}
            projects={projects}
            onCellChange={updateCashFlowCell}
            onAddRow={addCashFlowRow}
            onDeleteRow={deleteCashFlowRow}
            onBulkImport={bulkImportCashFlow}
          />
        )}
        {view === 'subinvoices' && (
          <SubInvoicesView
            subInvoices={subInvoices}
            projects={projects}
            onCellChange={updateSubInvoiceCell}
            onAddRow={addSubInvoiceRow}
            onDeleteRow={deleteSubInvoiceRow}
            onBulkImport={bulkImportSubInvoices}
          />
        )}
        {view === 'clientinvoices' && (
          <ClientInvoicesView
            clientInvoices={clientInvoices}
            projects={projects}
            onCellChange={updateClientInvoiceCell}
            onAddRow={addClientInvoiceRow}
            onDeleteRow={deleteClientInvoiceRow}
            onBulkImport={bulkImportClientInvoices}
          />
        )}
        {view === 'variations' && (
          <VariationsView
            variations={variations}
            projects={projects}
            onCellChange={updateVariationCell}
            onAddRow={addVariationRow}
            onDeleteRow={deleteVariationRow}
            onBulkImport={bulkImportVariations}
          />
        )}
        {view === 'documents' && (
          <DocumentsView
            documents={documents}
            projects={projects}
            onCellChange={updateDocumentCell}
            onAddRow={addDocumentRow}
            onDeleteRow={deleteDocumentRow}
            onBulkImport={bulkImportDocuments}
          />
        )}
      </main>
    </div>
  );
}
