import { useMemo, useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, FolderKanban, CheckCircle2, AlertTriangle,
  Clock, Package, ShieldAlert, Users, CalendarClock, FileSignature, ClipboardList,
  Banknote, Receipt, FileText, GitBranch, FolderOpen, HardHat, Target, Gauge,
  Activity, AlertCircle, ArrowRightCircle, Lightbulb, ChevronDown, Building2,
} from 'lucide-react';
import type {
  Project, Task, Cost, Procurement, Safety, ProgressEntry, ProjectWithStats, ViewKey,
  Schedule, Contract, BOQItem, CashFlowEntry, SubcontractorInvoice, ClientInvoice,
  Variation, DocumentEntry,
} from '@/types';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  costs: Cost[];
  procurement: Procurement[];
  safety: Safety[];
  progress: ProgressEntry[];
  schedules: Schedule[];
  contracts: Contract[];
  boqItems: BOQItem[];
  cashFlow: CashFlowEntry[];
  subInvoices: SubcontractorInvoice[];
  clientInvoices: ClientInvoice[];
  variations: Variation[];
  documents: DocumentEntry[];
  onNavigate: (view: ViewKey) => void;
}

function statusColor(status: string): string {
  switch (status) {
    case 'Completed': return 'bg-success-100 text-success-700 border-success-200';
    case 'In Progress': return 'bg-primary-100 text-primary-700 border-primary-200';
    case 'Planning': return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    case 'On Hold': return 'bg-warning-100 text-warning-700 border-warning-200';
    case 'Delayed': return 'bg-error-100 text-error-700 border-error-200';
    case 'Not Started': return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  }
}

function fmtMoney(n: number): string {
  const v = Math.abs(n);
  if (v >= 1_000_000) return `${n < 0 ? '-' : ''}$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${n < 0 ? '-' : ''}$${(v / 1_000).toFixed(1)}K`;
  return `${n < 0 ? '-' : ''}$${v.toFixed(0)}`;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? '' : ''}${n.toFixed(1)}%`;
}

export function Dashboard({
  projects, tasks, costs, procurement, safety, progress, schedules, contracts,
  boqItems, cashFlow, subInvoices, clientInvoices, variations, documents, onNavigate,
}: DashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // ---- Filter all data by selected project ----
  const pid = selectedProjectId;
  const fProjects = pid === 'all' ? projects : projects.filter((p) => p.id === pid);
  const fTasks = pid === 'all' ? tasks : tasks.filter((t) => t.project_id === pid);
  const fCosts = pid === 'all' ? costs : costs.filter((c) => c.project_id === pid);
  const fProcurement = pid === 'all' ? procurement : procurement.filter((p) => p.project_id === pid);
  const fSafety = pid === 'all' ? safety : safety.filter((s) => s.project_id === pid);
  const fProgress = pid === 'all' ? progress : progress.filter((p) => p.project_id === pid);
  const fSchedules = pid === 'all' ? schedules : schedules.filter((s) => s.project_id === pid);
  const fContracts = pid === 'all' ? contracts : contracts.filter((c) => c.project_id === pid);
  const fBOQ = pid === 'all' ? boqItems : boqItems.filter((b) => b.project_id === pid);
  const fCashFlow = pid === 'all' ? cashFlow : cashFlow.filter((c) => c.project_id === pid);
  const fSubInv = pid === 'all' ? subInvoices : subInvoices.filter((s) => s.project_id === pid);
  const fClientInv = pid === 'all' ? clientInvoices : clientInvoices.filter((c) => c.project_id === pid);
  const fVariations = pid === 'all' ? variations : variations.filter((v) => v.project_id === pid);
  const fDocuments = pid === 'all' ? documents : documents.filter((d) => d.project_id === pid);

  const selectedProject = pid !== 'all' ? projects.find((p) => p.id === pid) : null;

  // ---- Core stats ----
  const stats = useMemo(() => {
    const totalBudget = fProjects.reduce((s, p) => s + (p.budget || 0), 0);
    const totalSpent = fProjects.reduce((s, p) => s + (p.spent || 0), 0);
    const activeProjects = fProjects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = fProjects.filter((p) => p.status === 'Completed').length;
    const delayedTasks = fTasks.filter((t) => t.status === 'Delayed').length;
    const completedTasks = fTasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = fTasks.filter((t) => t.status === 'In Progress').length;
    const avgProgress = fProjects.length
      ? Math.round(fProjects.reduce((s, p) => s + (p.progress || 0), 0) / fProjects.length)
      : 0;
    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const byStatus: Record<string, number> = {};
    fProjects.forEach((p) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

    const byCategory: Record<string, { budget: number; spent: number }> = {};
    fProjects.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { budget: 0, spent: 0 };
      byCategory[cat].budget += p.budget || 0;
      byCategory[cat].spent += p.spent || 0;
    });

    const taskStatusCounts: Record<string, number> = {};
    fTasks.forEach((t) => { taskStatusCounts[t.status] = (taskStatusCounts[t.status] || 0) + 1; });

    const totalPlannedCosts = fCosts.reduce((s, c) => s + (c.planned || 0), 0);
    const totalActualCosts = fCosts.reduce((s, c) => s + (c.actual || 0), 0);
    const totalCommittedCosts = fCosts.reduce((s, c) => s + (c.committed || 0), 0);
    const costVariance = totalPlannedCosts - totalActualCosts;

    const openSafety = fSafety.filter((s) => s.status === 'Open').length;
    const highSeverity = fSafety.filter((s) => s.severity === 'High' || s.severity === 'Critical').length;

    const deliveredProcurement = fProcurement.filter((p) => p.status === 'Delivered').length;
    const pendingProcurement = fProcurement.filter((p) => p.status !== 'Delivered').length;
    const totalProcurementValue = fProcurement.reduce((s, p) => s + (p.total_cost || 0), 0);

    const totalWorkers = fProgress.reduce((s, p) => s + (p.workers || 0), 0);

    const criticalPathCount = fSchedules.filter((s) => s.critical_path).length;
    const delayedSchedules = fSchedules.filter((s) => s.status === 'Delayed').length;
    const totalContractValue = fContracts.reduce((s, c) => s + (c.contract_value || 0), 0);
    const activeContracts = fContracts.filter((c) => c.status === 'Active').length;
    const totalBOQAmount = fBOQ.reduce((s, b) => s + (b.amount || 0), 0);
    const totalInflow = fCashFlow.reduce((s, c) => s + (c.inflow || 0), 0);
    const totalOutflow = fCashFlow.reduce((s, c) => s + (c.outflow || 0), 0);
    const netCashFlow = totalInflow - totalOutflow;
    const subInvoiceTotal = fSubInv.reduce((s, i) => s + (i.amount || 0), 0);
    const subInvoicePaid = fSubInv.reduce((s, i) => s + (i.paid_amount || 0), 0);
    const subOutstanding = subInvoiceTotal - subInvoicePaid;
    const clientInvoiceTotal = fClientInv.reduce((s, i) => s + (i.amount || 0), 0);
    const clientInvoicePaid = fClientInv.reduce((s, i) => s + (i.paid_amount || 0), 0);
    const clientOutstanding = clientInvoiceTotal - clientInvoicePaid;
    const variationCostImpact = fVariations.reduce((s, v) => s + (v.cost_impact || 0), 0);
    const pendingVariations = fVariations.filter((v) => v.status === 'Pending' || v.status === 'Submitted').length;
    const currentDocs = fDocuments.filter((d) => d.status === 'Current').length;

    return {
      totalBudget, totalSpent, activeProjects, completedProjects, delayedTasks,
      completedTasks, inProgressTasks, avgProgress, budgetUtilization,
      byStatus, byCategory, taskStatusCounts,
      totalPlannedCosts, totalActualCosts, totalCommittedCosts, costVariance,
      openSafety, highSeverity,
      deliveredProcurement, pendingProcurement, totalProcurementValue,
      totalWorkers,
      criticalPathCount, delayedSchedules, totalContractValue, activeContracts,
      totalBOQAmount, totalInflow, totalOutflow, netCashFlow,
      subInvoiceTotal, subInvoicePaid, subOutstanding,
      clientInvoiceTotal, clientInvoicePaid, clientOutstanding,
      variationCostImpact, pendingVariations, currentDocs,
    };
  }, [fProjects, fTasks, fCosts, fProcurement, fSafety, fProgress, fSchedules, fContracts, fBOQ, fCashFlow, fSubInv, fClientInv, fVariations, fDocuments]);

  // ---- EVM (Earned Value Management) ----
  const evm = useMemo(() => {
    const BAC = stats.totalBudget || stats.totalPlannedCosts || 0;
    // PV = Planned Value (budgeted cost of scheduled work)
    const PV = stats.totalPlannedCosts > 0 ? stats.totalPlannedCosts : BAC * (stats.avgProgress / 100);
    // EV = Earned Value (budgeted cost of performed work)
    const EV = BAC * (stats.avgProgress / 100);
    // AC = Actual Cost
    const AC = stats.totalActualCosts > 0 ? stats.totalActualCosts : stats.totalSpent;
    // Variances
    const CV = EV - AC;
    const SV = EV - PV;
    // Indices
    const CPI = AC > 0 ? EV / AC : 0;
    const SPI = PV > 0 ? EV / PV : 0;
    // Forecasts
    const EAC = CPI > 0 ? BAC / CPI : BAC;
    const ETC = EAC - AC;
    const VAC = BAC - EAC;
    const TCPI = (BAC - AC) > 0 && (BAC - EV) > 0 ? (BAC - EV) / (BAC - AC) : 0;

    return { BAC, PV, EV, AC, CV, SV, CPI, SPI, EAC, ETC, VAC, TCPI };
  }, [stats]);

  // ---- Decision support / action items ----
  const actionItems = useMemo(() => {
    const items: { severity: 'high' | 'medium' | 'low'; icon: typeof AlertCircle; text: string; view: ViewKey }[] = [];

    if (stats.highSeverity > 0)
      items.push({ severity: 'high', icon: AlertCircle, text: `${stats.highSeverity} high/critical safety issue${stats.highSeverity > 1 ? 's' : ''} require immediate attention`, view: 'safety' });
    if (stats.delayedTasks > 0)
      items.push({ severity: 'high', icon: AlertCircle, text: `${stats.delayedTasks} task${stats.delayedTasks > 1 ? 's' : ''} delayed — review schedule and assign resources`, view: 'tasks' });
    if (stats.delayedSchedules > 0)
      items.push({ severity: 'high', icon: AlertCircle, text: `${stats.delayedSchedules} schedule activit${stats.delayedSchedules > 1 ? 'ies' : 'y'} delayed — impact on critical path likely`, view: 'schedule' });
    if (evm.CPI < 0.9 && evm.CPI > 0)
      items.push({ severity: 'high', icon: TrendingDown, text: `Cost Performance Index at ${evm.CPI.toFixed(2)} — project is over budget. EAC: ${fmtMoney(evm.EAC)}`, view: 'costs' });
    if (evm.SPI < 0.9 && evm.SPI > 0)
      items.push({ severity: 'high', icon: TrendingDown, text: `Schedule Performance Index at ${evm.SPI.toFixed(2)} — project is behind schedule`, view: 'schedule' });
    if (stats.budgetUtilization > 90)
      items.push({ severity: 'high', icon: AlertTriangle, text: `Budget utilization at ${stats.budgetUtilization}% — approaching budget limit`, view: 'costs' });
    if (stats.openSafety > 0)
      items.push({ severity: 'medium', icon: ShieldAlert, text: `${stats.openSafety} open safety issue${stats.openSafety > 1 ? 's' : ''} need${stats.openSafety > 1 ? '' : 's'} resolution`, view: 'safety' });
    if (stats.pendingVariations > 0)
      items.push({ severity: 'medium', icon: GitBranch, text: `${stats.pendingVariations} variation${stats.pendingVariations > 1 ? 's' : ''} pending approval — cost impact: ${fmtMoney(stats.variationCostImpact)}`, view: 'variations' });
    if (stats.subOutstanding > 0)
      items.push({ severity: 'medium', icon: Receipt, text: `${fmtMoney(stats.subOutstanding)} outstanding subcontractor invoice payments`, view: 'subinvoices' });
    if (stats.clientOutstanding > 0)
      items.push({ severity: 'medium', icon: FileText, text: `${fmtMoney(stats.clientOutstanding)} outstanding client invoice collections`, view: 'clientinvoices' });
    if (stats.pendingProcurement > 0)
      items.push({ severity: 'medium', icon: Package, text: `${stats.pendingProcurement} procurement item${stats.pendingProcurement > 1 ? 's' : ''} pending delivery`, view: 'procurement' });
    if (stats.netCashFlow < 0)
      items.push({ severity: 'medium', icon: Banknote, text: `Negative net cash flow of ${fmtMoney(stats.netCashFlow)} — review inflows vs outflows`, view: 'cashflow' });
    if (stats.criticalPathCount > 0)
      items.push({ severity: 'low', icon: CalendarClock, text: `${stats.criticalPathCount} activit${stats.criticalPathCount > 1 ? 'ies' : 'y'} on critical path — monitor closely`, view: 'schedule' });
    if (evm.VAC < 0)
      items.push({ severity: 'low', icon: DollarSign, text: `Projected to exceed budget by ${fmtMoney(Math.abs(evm.VAC))} at completion`, view: 'costs' });

    return items;
  }, [stats, evm]);

  // ---- Cash flow trend (cumulative) ----
  const cashFlowTrend = useMemo(() => {
    const sorted = [...fCashFlow].sort((a, b) => {
      const da = a.date || a.created_at || '';
      const db = b.date || b.created_at || '';
      return da.localeCompare(db);
    });
    let cumulative = 0;
    return sorted.map((c) => {
      cumulative += (c.net || ((c.inflow || 0) - (c.outflow || 0)));
      return { label: c.date || c.description || '', cumulative, inflow: c.inflow || 0, outflow: c.outflow || 0 };
    });
  }, [fCashFlow]);

  // ---- Cost breakdown by category ----
  const costByCategory = useMemo(() => {
    const map: Record<string, { planned: number; actual: number }> = {};
    fCosts.forEach((c) => {
      const cat = c.category || 'Uncategorized';
      if (!map[cat]) map[cat] = { planned: 0, actual: 0 };
      map[cat].planned += c.planned || 0;
      map[cat].actual += c.actual || 0;
    });
    return map;
  }, [fCosts]);

  // ---- Schedule progress by activity (top 8) ----
  const scheduleProgress = useMemo(() => {
    return fSchedules.slice(0, 8).map((s) => ({
      activity: s.activity || 'Unnamed',
      progress: s.progress || 0,
      critical: s.critical_path,
      status: s.status,
    }));
  }, [fSchedules]);

  const projectsWithStats: ProjectWithStats[] = useMemo(() => {
    return fProjects.map((p) => {
      const pTasks = fTasks.filter((t) => t.project_id === p.id);
      return { ...p, task_count: pTasks.length, completed_tasks: pTasks.filter((t) => t.status === 'Completed').length };
    });
  }, [fProjects, fTasks]);

  const statusColors: Record<string, string> = {
    'Planning': 'var(--color-secondary-500)',
    'In Progress': 'var(--color-primary-500)',
    'On Hold': 'var(--color-warning-500)',
    'Completed': 'var(--color-success-500)',
  };

  const maxCategoryBudget = Math.max(...Object.values(stats.byCategory).map((c) => c.budget), 1);
  const maxCostCategory = Math.max(...Object.values(costByCategory).map((c) => Math.max(c.planned, c.actual)), 1);

  const kpis = [
    {
      label: pid === 'all' ? 'Total Projects' : 'Project Status',
      value: pid === 'all' ? projects.length.toString() : (selectedProject?.status || '—'),
      sub: pid === 'all' ? `${stats.activeProjects} active · ${stats.completedProjects} done` : `${selectedProject?.client || ''}`,
      icon: FolderKanban,
      color: 'from-primary-500 to-primary-600',
      trend: 'up' as const,
      view: 'projects' as ViewKey,
    },
    {
      label: 'Total Budget',
      value: fmtMoney(stats.totalBudget),
      sub: `${fmtMoney(stats.totalSpent)} spent (${stats.budgetUtilization}%)`,
      icon: DollarSign,
      color: 'from-success-500 to-success-600',
      trend: stats.budgetUtilization > 80 ? ('down' as const) : ('up' as const),
      view: 'costs' as ViewKey,
    },
    {
      label: 'Tasks Progress',
      value: `${stats.completedTasks}/${fTasks.length}`,
      sub: `${stats.inProgressTasks} in progress · ${stats.delayedTasks} delayed`,
      icon: CheckCircle2,
      color: 'from-secondary-500 to-secondary-600',
      trend: stats.delayedTasks > 0 ? ('down' as const) : ('up' as const),
      view: 'tasks' as ViewKey,
    },
    {
      label: 'Safety Alerts',
      value: stats.openSafety.toString(),
      sub: stats.highSeverity > 0 ? `${stats.highSeverity} high/critical` : 'No critical issues',
      icon: AlertTriangle,
      color: stats.openSafety > 0 ? 'from-error-500 to-error-600' : 'from-success-500 to-success-600',
      trend: stats.openSafety > 0 ? ('down' as const) : ('up' as const),
      view: 'safety' as ViewKey,
    },
  ];

  const evmCards = [
    {
      label: 'BAC', desc: 'Budget at Completion', value: fmtMoney(evm.BAC),
      icon: Target, color: 'text-neutral-700 bg-neutral-100',
    },
    {
      label: 'PV', desc: 'Planned Value', value: fmtMoney(evm.PV),
      icon: Clock, color: 'text-secondary-600 bg-secondary-50',
    },
    {
      label: 'EV', desc: 'Earned Value', value: fmtMoney(evm.EV),
      icon: CheckCircle2, color: 'text-primary-600 bg-primary-50',
    },
    {
      label: 'AC', desc: 'Actual Cost', value: fmtMoney(evm.AC),
      icon: DollarSign, color: 'text-accent-600 bg-accent-50',
    },
    {
      label: 'CV', desc: 'Cost Variance', value: fmtMoney(evm.CV),
      icon: evm.CV >= 0 ? TrendingUp : TrendingDown,
      color: evm.CV >= 0 ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50',
      sub: evm.CV >= 0 ? 'Under budget' : 'Over budget',
    },
    {
      label: 'SV', desc: 'Schedule Variance', value: fmtMoney(evm.SV),
      icon: evm.SV >= 0 ? TrendingUp : TrendingDown,
      color: evm.SV >= 0 ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50',
      sub: evm.SV >= 0 ? 'Ahead of schedule' : 'Behind schedule',
    },
    {
      label: 'CPI', desc: 'Cost Performance Index', value: evm.CPI > 0 ? evm.CPI.toFixed(2) : '—',
      icon: Gauge, color: evm.CPI >= 1 ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50',
      sub: evm.CPI >= 1 ? 'Cost efficient' : 'Cost overrun',
    },
    {
      label: 'SPI', desc: 'Schedule Performance Index', value: evm.SPI > 0 ? evm.SPI.toFixed(2) : '—',
      icon: Gauge, color: evm.SPI >= 1 ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50',
      sub: evm.SPI >= 1 ? 'On schedule' : 'Behind schedule',
    },
    {
      label: 'EAC', desc: 'Estimate at Completion', value: fmtMoney(evm.EAC),
      icon: Activity, color: evm.VAC >= 0 ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50',
    },
    {
      label: 'ETC', desc: 'Estimate to Complete', value: fmtMoney(evm.ETC),
      icon: ArrowRightCircle, color: 'text-primary-600 bg-primary-50',
    },
    {
      label: 'VAC', desc: 'Variance at Completion', value: fmtMoney(evm.VAC),
      icon: evm.VAC >= 0 ? TrendingUp : TrendingDown,
      color: evm.VAC >= 0 ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50',
      sub: evm.VAC >= 0 ? 'Under budget' : 'Over budget',
    },
    {
      label: 'TCPI', desc: 'To-Complete Performance Index', value: evm.TCPI > 0 ? evm.TCPI.toFixed(2) : '—',
      icon: Gauge,
      color: evm.TCPI <= 1 ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50',
      sub: evm.TCPI <= 1 ? 'Achievable' : 'Hard to achieve',
    },
  ];

  const severityStyles = {
    high: 'border-error-200 bg-error-50',
    medium: 'border-warning-200 bg-warning-50',
    low: 'border-primary-200 bg-primary-50',
  };
  const severityIconColors = {
    high: 'text-error-600',
    medium: 'text-warning-600',
    low: 'text-primary-600',
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-thin bg-neutral-50">
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        {/* Header with project selector */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Project Dashboard</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {pid === 'all'
                ? 'Complete overview of all construction projects, costs, procurement, safety, and progress'
                : `Detailed view for ${selectedProject?.name || 'project'}`}
            </p>
          </div>
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="appearance-none pl-9 pr-10 py-2.5 text-sm font-medium border border-neutral-200 rounded-xl bg-white shadow-sm hover:border-primary-300 focus:outline-none focus:border-primary-400 transition-colors min-w-56"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <button
                key={i}
                onClick={() => onNavigate(kpi.view)}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend === 'up' ? 'text-success-600' : 'text-error-600'}`}>
                    <TrendIcon size={14} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
                <p className="text-sm text-neutral-500 mt-0.5">{kpi.label}</p>
                <p className="text-xs text-neutral-400 mt-1">{kpi.sub}</p>
              </button>
            );
          })}
        </div>

        {/* EVM Section */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm mb-6">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
            <Activity size={18} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-neutral-700">Earned Value Management (EVM)</h3>
            <span className="text-xs text-neutral-400 ml-auto">Project performance & forecasting</span>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {evmCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="rounded-lg border border-neutral-100 p-3 hover:border-neutral-200 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${card.color}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-700">{card.label}</p>
                      <p className="text-[10px] text-neutral-400 leading-tight">{card.desc}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-neutral-900">{card.value}</p>
                  {'sub' in card && card.sub && (
                    <p className={`text-[10px] mt-0.5 font-medium ${card.color.split(' ')[0]}`}>{card.sub}</p>
                  )}
                </div>
              );
            })}
          </div>
          {/* EVM performance indicators bar */}
          <div className="px-5 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CPI gauge */}
              <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600">Cost Performance (CPI)</span>
                  <span className={`text-sm font-bold ${evm.CPI >= 1 ? 'text-success-600' : 'text-error-600'}`}>{evm.CPI > 0 ? evm.CPI.toFixed(2) : '—'}</span>
                </div>
                <div className="relative h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-error-300" />
                    <div className="w-1/2 bg-success-300" />
                  </div>
                  {evm.CPI > 0 && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-primary-500 shadow-sm transition-all duration-500" style={{ left: `calc(${Math.min(evm.CPI / 2, 1) * 100}% - 6px)` }} />
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-neutral-400">
                  <span>Over Budget</span>
                  <span>1.0</span>
                  <span>Under Budget</span>
                </div>
              </div>
              {/* SPI gauge */}
              <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600">Schedule Performance (SPI)</span>
                  <span className={`text-sm font-bold ${evm.SPI >= 1 ? 'text-success-600' : 'text-error-600'}`}>{evm.SPI > 0 ? evm.SPI.toFixed(2) : '—'}</span>
                </div>
                <div className="relative h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-error-300" />
                    <div className="w-1/2 bg-success-300" />
                  </div>
                  {evm.SPI > 0 && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-secondary-500 shadow-sm transition-all duration-500" style={{ left: `calc(${Math.min(evm.SPI / 2, 1) * 100}% - 6px)` }} />
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-neutral-400">
                  <span>Behind</span>
                  <span>1.0</span>
                  <span>Ahead</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Support / Action Items */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm mb-6">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
            <Lightbulb size={18} className="text-warning-600" />
            <h3 className="text-sm font-semibold text-neutral-700">Decision Support — Action Required</h3>
            <span className="text-xs text-neutral-400 ml-auto">{actionItems.length} item{actionItems.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-4">
            {actionItems.length > 0 ? (
              <div className="space-y-2">
                {actionItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => onNavigate(item.view)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${severityStyles[item.severity]} hover:shadow-sm transition-all text-left group`}
                    >
                      <Icon size={18} className={`${severityIconColors[item.severity]} flex-shrink-0`} />
                      <span className="text-sm text-neutral-700 flex-1">{item.text}</span>
                      <span className={`text-xs font-medium ${severityIconColors[item.severity]} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        View →
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 py-6 text-sm text-success-600">
                <CheckCircle2 size={18} />
                <span>All clear — no critical actions required at this time.</span>
              </div>
            )}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Status distribution */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Project Status Distribution</h3>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => {
                const pct = fProjects.length > 0 ? (count / fProjects.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-600">{status}</span>
                      <span className="text-xs text-neutral-400">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: statusColors[status] || 'var(--color-neutral-400)' }} />
                    </div>
                  </div>
                );
              })}
              {fProjects.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No projects yet</p>}
            </div>
          </div>

          {/* Cost breakdown by category (planned vs actual) */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Cost Breakdown — Planned vs Actual</h3>
            <div className="space-y-3">
              {Object.entries(costByCategory).map(([cat, data]) => {
                const plannedPct = (data.planned / maxCostCategory) * 100;
                const actualPct = (data.actual / maxCostCategory) * 100;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-600">{cat}</span>
                      <span className="text-xs text-neutral-400">{fmtMoney(data.actual)} / {fmtMoney(data.planned)}</span>
                    </div>
                    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden relative">
                      <div className="h-full rounded-full bg-primary-300 transition-all duration-500" style={{ width: `${plannedPct}%` }} />
                      <div className="absolute top-0 h-full rounded-full bg-primary-600 transition-all duration-500" style={{ width: `${actualPct}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(costByCategory).length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No cost data yet</p>}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary-300" /> Planned</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary-600" /> Actual</span>
            </div>
          </div>
        </div>

        {/* Charts row 2 — Schedule progress + Cash flow trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Schedule progress by activity */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Schedule Progress by Activity</h3>
            <div className="space-y-2.5">
              {scheduleProgress.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`text-xs font-medium w-32 truncate ${s.critical ? 'text-error-600' : 'text-neutral-600'}`}>{s.activity}</span>
                  {s.critical && <AlertTriangle size={12} className="text-error-500 flex-shrink-0" />}
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${s.status === 'Delayed' ? 'bg-error-500' : s.status === 'Completed' ? 'bg-success-500' : 'bg-primary-500'}`} style={{ width: `${s.progress}%` }} />
                  </div>
                  <span className="text-xs text-neutral-400 w-8 text-right">{s.progress}%</span>
                </div>
              ))}
              {scheduleProgress.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No schedule data yet</p>}
            </div>
          </div>

          {/* Cash flow trend */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Cash Flow Trend (Cumulative)</h3>
            {cashFlowTrend.length > 0 ? (
              <div className="relative h-48">
                <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-success-400)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--color-success-400)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const values = cashFlowTrend.map((d) => d.cumulative);
                    const min = Math.min(...values, 0);
                    const max = Math.max(...values, 1);
                    const range = max - min || 1;
                    const points = cashFlowTrend.map((d, i) => {
                      const x = (i / Math.max(cashFlowTrend.length - 1, 1)) * 380 + 10;
                      const y = 170 - ((d.cumulative - min) / range) * 150;
                      return `${x},${y}`;
                    });
                    const areaPoints = `10,170 ${points.join(' ')} 390,170`;
                    return (
                      <>
                        <polygon points={areaPoints} fill="url(#cfGrad)" />
                        <polyline points={points.join(' ')} fill="none" stroke="var(--color-success-500)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                        {/* Zero line */}
                        {min < 0 && (
                          <line x1="0" y1={170 - ((0 - min) / range) * 150} x2="400" y2={170 - ((0 - min) / range) * 150} stroke="var(--color-neutral-300)" strokeWidth="1" strokeDasharray="4,4" />
                        )}
                      </>
                    );
                  })()}
                </svg>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-neutral-400">Start: {fmtMoney(cashFlowTrend[0]?.cumulative || 0)}</span>
                  <span className={`font-semibold ${cashFlowTrend[cashFlowTrend.length - 1]?.cumulative >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                    Current: {fmtMoney(cashFlowTrend[cashFlowTrend.length - 1]?.cumulative || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-12">No cash flow data yet</p>
            )}
          </div>
        </div>

        {/* EVM Variance chart — CV & SV bars */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4">EVM Variance Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cost Variance bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600">Cost Variance (CV = EV - AC)</span>
                <span className={`text-sm font-bold ${evm.CV >= 0 ? 'text-success-600' : 'text-error-600'}`}>{fmtMoney(evm.CV)}</span>
              </div>
              <div className="relative h-6 bg-neutral-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-neutral-300" />
                </div>
                {evm.CV !== 0 && (
                  <div
                    className={`absolute top-0 h-full ${evm.CV >= 0 ? 'bg-success-400' : 'bg-error-400'} transition-all duration-700`}
                    style={{
                      left: evm.CV >= 0 ? '50%' : `${50 - Math.min(Math.abs(evm.CV) / Math.max(Math.abs(evm.EV), 1) * 50, 50)}%`,
                      width: `${Math.min(Math.abs(evm.CV) / Math.max(Math.abs(evm.EV), 1) * 50, 50)}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-neutral-400">
                <span>Over Budget</span><span>0</span><span>Under Budget</span>
              </div>
            </div>
            {/* Schedule Variance bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600">Schedule Variance (SV = EV - PV)</span>
                <span className={`text-sm font-bold ${evm.SV >= 0 ? 'text-success-600' : 'text-error-600'}`}>{fmtMoney(evm.SV)}</span>
              </div>
              <div className="relative h-6 bg-neutral-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-neutral-300" />
                </div>
                {evm.SV !== 0 && (
                  <div
                    className={`absolute top-0 h-full ${evm.SV >= 0 ? 'bg-success-400' : 'bg-error-400'} transition-all duration-700`}
                    style={{
                      left: evm.SV >= 0 ? '50%' : `${50 - Math.min(Math.abs(evm.SV) / Math.max(Math.abs(evm.EV), 1) * 50, 50)}%`,
                      width: `${Math.min(Math.abs(evm.SV) / Math.max(Math.abs(evm.EV), 1) * 50, 50)}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-neutral-400">
                <span>Behind</span><span>0</span><span>Ahead</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost + Safety + Procurement summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={16} className="text-success-600" />
              <h3 className="text-sm font-semibold text-neutral-700">Cost Control</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Planned</span>
                <span className="text-sm font-semibold text-neutral-800">{fmtMoney(stats.totalPlannedCosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Actual</span>
                <span className="text-sm font-semibold text-neutral-800">{fmtMoney(stats.totalActualCosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Committed</span>
                <span className="text-sm font-semibold text-neutral-800">{fmtMoney(stats.totalCommittedCosts)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500">Variance</span>
                <span className={`text-sm font-bold ${stats.costVariance >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {stats.costVariance >= 0 ? '+' : ''}{fmtMoney(stats.costVariance)}
                </span>
              </div>
            </div>
            <button onClick={() => onNavigate('costs')} className="w-full mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium">View cost details →</button>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-error-600" />
              <h3 className="text-sm font-semibold text-neutral-700">Safety & HSE</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Open Issues</span>
                <span className={`text-sm font-semibold ${stats.openSafety > 0 ? 'text-error-600' : 'text-success-600'}`}>{stats.openSafety}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">High/Critical</span>
                <span className={`text-sm font-semibold ${stats.highSeverity > 0 ? 'text-accent-600' : 'text-success-600'}`}>{stats.highSeverity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Total Records</span>
                <span className="text-sm font-semibold text-neutral-800">{fSafety.length}</span>
              </div>
            </div>
            <button onClick={() => onNavigate('safety')} className="w-full mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium">View safety records →</button>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-primary-600" />
              <h3 className="text-sm font-semibold text-neutral-700">Procurement</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Delivered</span>
                <span className="text-sm font-semibold text-success-600">{stats.deliveredProcurement}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Pending</span>
                <span className="text-sm font-semibold text-warning-600">{stats.pendingProcurement}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Total Value</span>
                <span className="text-sm font-semibold text-neutral-800">{fmtMoney(stats.totalProcurementValue)}</span>
              </div>
            </div>
            <button onClick={() => onNavigate('procurement')} className="w-full mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium">View procurement →</button>
          </div>
        </div>

        {/* Budget + Task + Progress donuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Budget Utilization</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary-500)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(stats.budgetUtilization / 100) * 264} 264`} className="transition-all duration-700" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900">{stats.budgetUtilization}%</span>
                  <span className="text-xs text-neutral-400">utilized</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div><span className="text-neutral-400">Spent</span><p className="font-semibold text-neutral-700">{fmtMoney(stats.totalSpent)}</p></div>
              <div className="text-right"><span className="text-neutral-400">Budget</span><p className="font-semibold text-neutral-700">{fmtMoney(stats.totalBudget)}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Task Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Completed', icon: CheckCircle2, color: 'text-success-600 bg-success-50' },
                { label: 'In Progress', icon: Clock, color: 'text-primary-600 bg-primary-50' },
                { label: 'Not Started', icon: Clock, color: 'text-neutral-500 bg-neutral-100' },
                { label: 'Delayed', icon: AlertTriangle, color: 'text-error-600 bg-error-50' },
              ].map((s) => {
                const count = stats.taskStatusCounts[s.label] || 0;
                const pct = fTasks.length > 0 ? (count / fTasks.length) * 100 : 0;
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}><Icon size={16} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-600">{s.label}</span>
                        <span className="text-xs text-neutral-400">{count}</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-current rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {fTasks.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No tasks yet</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Average Progress</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-secondary-500)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(stats.avgProgress / 100) * 264} 264`} className="transition-all duration-700" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900">{stats.avgProgress}%</span>
                  <span className="text-xs text-neutral-400">avg complete</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <Users size={14} /><span>{stats.totalWorkers} worker-days logged</span>
            </div>
            <button onClick={() => onNavigate('projects')} className="w-full mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium">View all projects →</button>
          </div>
        </div>

        {/* New modules summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button onClick={() => onNavigate('schedule')} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center"><CalendarClock size={17} className="text-primary-600" /></div>
              <h3 className="text-sm font-semibold text-neutral-700">Schedule</h3>
            </div>
            <p className="text-xl font-bold text-neutral-900">{fSchedules.length}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{stats.criticalPathCount} critical · {stats.delayedSchedules} delayed</p>
          </button>

          <button onClick={() => onNavigate('contracts')} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center"><FileSignature size={17} className="text-primary-600" /></div>
              <h3 className="text-sm font-semibold text-neutral-700">Contracts</h3>
            </div>
            <p className="text-xl font-bold text-neutral-900">{fmtMoney(stats.totalContractValue)}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{stats.activeContracts} active · {fContracts.length} total</p>
          </button>

          <button onClick={() => onNavigate('boq')} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center"><ClipboardList size={17} className="text-primary-600" /></div>
              <h3 className="text-sm font-semibold text-neutral-700">BOQ</h3>
            </div>
            <p className="text-xl font-bold text-neutral-900">{fmtMoney(stats.totalBOQAmount)}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{fBOQ.length} line items</p>
          </button>

          <button onClick={() => onNavigate('cashflow')} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center"><Banknote size={17} className="text-success-600" /></div>
              <h3 className="text-sm font-semibold text-neutral-700">Cash Flow</h3>
            </div>
            <p className={`text-xl font-bold ${stats.netCashFlow >= 0 ? 'text-success-600' : 'text-error-600'}`}>{fmtMoney(stats.netCashFlow)}</p>
            <p className="text-xs text-neutral-400 mt-0.5">In: {fmtMoney(stats.totalInflow)} · Out: {fmtMoney(stats.totalOutflow)}</p>
          </button>
        </div>

        {/* Invoices + Variations + Documents row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button onClick={() => onNavigate('subinvoices')} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300">
            <div className="flex items-center gap-2 mb-4"><Receipt size={16} className="text-accent-600" /><h3 className="text-sm font-semibold text-neutral-700">Subcontractor Invoices</h3></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Total Invoiced</span><span className="text-sm font-semibold text-neutral-800">{fmtMoney(stats.subInvoiceTotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Paid</span><span className="text-sm font-semibold text-success-600">{fmtMoney(stats.subInvoicePaid)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Outstanding</span><span className="text-sm font-semibold text-error-600">{fmtMoney(stats.subOutstanding)}</span></div>
            </div>
          </button>

          <button onClick={() => onNavigate('clientinvoices')} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300">
            <div className="flex items-center gap-2 mb-4"><FileText size={16} className="text-primary-600" /><h3 className="text-sm font-semibold text-neutral-700">Client Invoices</h3></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Total Invoiced</span><span className="text-sm font-semibold text-neutral-800">{fmtMoney(stats.clientInvoiceTotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Received</span><span className="text-sm font-semibold text-success-600">{fmtMoney(stats.clientInvoicePaid)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Outstanding</span><span className="text-sm font-semibold text-error-600">{fmtMoney(stats.clientOutstanding)}</span></div>
            </div>
          </button>

          <button onClick={() => onNavigate('variations')} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all text-left hover:border-primary-300">
            <div className="flex items-center gap-2 mb-4"><GitBranch size={16} className="text-accent-600" /><h3 className="text-sm font-semibold text-neutral-700">Variations</h3></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Cost Impact</span><span className="text-sm font-semibold text-neutral-800">{fmtMoney(stats.variationCostImpact)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Pending</span><span className="text-sm font-semibold text-warning-600">{stats.pendingVariations}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Total</span><span className="text-sm font-semibold text-neutral-800">{fVariations.length}</span></div>
            </div>
          </button>
        </div>

        {/* Documents summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4"><FolderOpen size={16} className="text-primary-600" /><h3 className="text-sm font-semibold text-neutral-700">Documents</h3></div>
          <div className="flex items-center gap-6">
            <div><p className="text-2xl font-bold text-neutral-900">{fDocuments.length}</p><p className="text-xs text-neutral-400">Total documents</p></div>
            <div><p className="text-2xl font-bold text-primary-600">{stats.currentDocs}</p><p className="text-xs text-neutral-400">Current</p></div>
            <button onClick={() => onNavigate('documents')} className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium">View all documents →</button>
          </div>
        </div>

        {/* Active projects table (only when All Projects) */}
        {pid === 'all' && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700">Active Projects</h3>
              <button onClick={() => onNavigate('projects')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all →</button>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left text-xs font-semibold text-neutral-500 px-5 py-2.5">Project</th>
                    <th className="text-left text-xs font-semibold text-neutral-500 px-3 py-2.5">Client</th>
                    <th className="text-left text-xs font-semibold text-neutral-500 px-3 py-2.5">Status</th>
                    <th className="text-right text-xs font-semibold text-neutral-500 px-3 py-2.5">Budget</th>
                    <th className="text-left text-xs font-semibold text-neutral-500 px-5 py-2.5">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projectsWithStats.slice(0, 6).map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => setSelectedProjectId(p.id)}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-neutral-800">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.location}</p>
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-600">{p.client}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-600 text-right">{fmtMoney(p.budget)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden min-w-16">
                            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs text-neutral-500 w-8">{p.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projectsWithStats.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-sm text-neutral-400 py-8">No projects yet. Go to the Projects tab to add one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
