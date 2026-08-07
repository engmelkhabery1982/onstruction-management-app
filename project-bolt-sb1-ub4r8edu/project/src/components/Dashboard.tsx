import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, FolderKanban, CheckCircle2, AlertTriangle, Clock, Package, ShieldAlert, HardHat, Users } from 'lucide-react';
import type { Project, Task, Cost, Procurement, Safety, ProgressEntry, ProjectWithStats, ViewKey } from '@/types';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  costs: Cost[];
  procurement: Procurement[];
  safety: Safety[];
  progress: ProgressEntry[];
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
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function Dashboard({ projects, tasks, costs, procurement, safety, progress, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
    const totalSpent = projects.reduce((s, p) => s + (p.spent || 0), 0);
    const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const delayedTasks = tasks.filter((t) => t.status === 'Delayed').length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const avgProgress = projects.length
      ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length)
      : 0;
    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const byStatus: Record<string, number> = {};
    projects.forEach((p) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

    const byCategory: Record<string, { budget: number; spent: number }> = {};
    projects.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { budget: 0, spent: 0 };
      byCategory[cat].budget += p.budget || 0;
      byCategory[cat].spent += p.spent || 0;
    });

    const taskStatusCounts: Record<string, number> = {};
    tasks.forEach((t) => { taskStatusCounts[t.status] = (taskStatusCounts[t.status] || 0) + 1; });

    const totalPlannedCosts = costs.reduce((s, c) => s + (c.planned || 0), 0);
    const totalActualCosts = costs.reduce((s, c) => s + (c.actual || 0), 0);
    const costVariance = totalPlannedCosts - totalActualCosts;

    const openSafety = safety.filter((s) => s.status === 'Open').length;
    const highSeverity = safety.filter((s) => s.severity === 'High' || s.severity === 'Critical').length;

    const deliveredProcurement = procurement.filter((p) => p.status === 'Delivered').length;
    const pendingProcurement = procurement.filter((p) => p.status !== 'Delivered').length;
    const totalProcurementValue = procurement.reduce((s, p) => s + (p.total_cost || 0), 0);

    const totalWorkers = progress.reduce((s, p) => s + (p.workers || 0), 0);
    const latestProgress = progress.length > 0 ? progress[0] : null;

    return {
      totalBudget, totalSpent, activeProjects, completedProjects, delayedTasks,
      completedTasks, inProgressTasks, avgProgress, budgetUtilization,
      byStatus, byCategory, taskStatusCounts,
      totalPlannedCosts, totalActualCosts, costVariance,
      openSafety, highSeverity,
      deliveredProcurement, pendingProcurement, totalProcurementValue,
      totalWorkers, latestProgress,
    };
  }, [projects, tasks, costs, procurement, safety, progress]);

  const projectsWithStats: ProjectWithStats[] = useMemo(() => {
    return projects.map((p) => {
      const pTasks = tasks.filter((t) => t.project_id === p.id);
      return { ...p, task_count: pTasks.length, completed_tasks: pTasks.filter((t) => t.status === 'Completed').length };
    });
  }, [projects, tasks]);

  const statusColors: Record<string, string> = {
    'Planning': 'var(--color-secondary-500)',
    'In Progress': 'var(--color-primary-500)',
    'On Hold': 'var(--color-warning-500)',
    'Completed': 'var(--color-success-500)',
  };

  const kpis = [
    {
      label: 'Total Projects',
      value: projects.length.toString(),
      sub: `${stats.activeProjects} active · ${stats.completedProjects} done`,
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
      value: `${stats.completedTasks}/${tasks.length}`,
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

  const maxCategoryBudget = Math.max(...Object.values(stats.byCategory).map((c) => c.budget), 1);

  return (
    <div className="flex-1 overflow-auto scrollbar-thin bg-neutral-50">
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Project Dashboard</h2>
          <p className="text-sm text-neutral-500 mt-1">Complete overview of all construction projects, costs, procurement, safety, and progress</p>
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

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Status distribution */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Project Status Distribution</h3>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => {
                const pct = projects.length > 0 ? (count / projects.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-600">{status}</span>
                      <span className="text-xs text-neutral-400">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: statusColors[status] || 'var(--color-neutral-400)' }}
                      />
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">No projects yet</p>
              )}
            </div>
          </div>

          {/* Budget by category */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Budget by Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.byCategory).map(([cat, data]) => {
                const pct = (data.budget / maxCategoryBudget) * 100;
                const utilPct = data.budget > 0 ? (data.spent / data.budget) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-600">{cat}</span>
                      <span className="text-xs text-neutral-400">{fmtMoney(data.budget)} · {utilPct.toFixed(0)}% used</span>
                    </div>
                    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="absolute top-0 h-full bg-accent-400/60 rounded-full"
                        style={{ width: `${pct * (utilPct / 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats.byCategory).length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Cost + Safety + Procurement summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Cost variance */}
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
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500">Variance</span>
                <span className={`text-sm font-bold ${stats.costVariance >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {stats.costVariance >= 0 ? '+' : ''}{fmtMoney(stats.costVariance)}
                </span>
              </div>
            </div>
            <button onClick={() => onNavigate('costs')} className="w-full mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium">
              View cost details →
            </button>
          </div>

          {/* Safety summary */}
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
                <span className="text-sm font-semibold text-neutral-800">{safety.length}</span>
              </div>
            </div>
            <button onClick={() => onNavigate('safety')} className="w-full mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium">
              View safety records →
            </button>
          </div>

          {/* Procurement summary */}
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
            <button onClick={() => onNavigate('procurement')} className="w-full mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium">
              View procurement →
            </button>
          </div>
        </div>

        {/* Task + Budget + Avg progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Budget utilization donut */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Budget Utilization</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="var(--color-primary-500)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(stats.budgetUtilization / 100) * 264} 264`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900">{stats.budgetUtilization}%</span>
                  <span className="text-xs text-neutral-400">utilized</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-400">Spent</span>
                <p className="font-semibold text-neutral-700">{fmtMoney(stats.totalSpent)}</p>
              </div>
              <div className="text-right">
                <span className="text-neutral-400">Total Budget</span>
                <p className="font-semibold text-neutral-700">{fmtMoney(stats.totalBudget)}</p>
              </div>
            </div>
          </div>

          {/* Task status breakdown */}
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
                const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                      <Icon size={16} />
                    </div>
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
              {tasks.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">No tasks yet</p>
              )}
            </div>
          </div>

          {/* Average progress */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Average Progress</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="var(--color-secondary-500)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(stats.avgProgress / 100) * 264} 264`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900">{stats.avgProgress}%</span>
                  <span className="text-xs text-neutral-400">avg complete</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <Users size={14} />
              <span>{stats.totalWorkers} worker-days logged</span>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="w-full mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View all projects →
            </button>
          </div>
        </div>

        {/* Recent projects table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700">Active Projects</h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </button>
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
                  <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-neutral-800">{p.name}</p>
                      <p className="text-xs text-neutral-400">{p.location}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{p.client}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
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
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-neutral-400 py-8">
                      No projects yet. Go to the Projects tab to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
