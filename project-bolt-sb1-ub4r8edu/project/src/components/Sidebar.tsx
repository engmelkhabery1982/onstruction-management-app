import { LayoutDashboard, FolderKanban, ListTodo, DollarSign, Package, ShieldAlert, TrendingUp, HardHat } from 'lucide-react';
import type { ViewKey } from '@/types';

interface SidebarProps {
  active: ViewKey;
  onNavigate: (view: ViewKey) => void;
  projectCount: number;
  taskCount: number;
  costCount: number;
  procurementCount: number;
  safetyCount: number;
  progressCount: number;
}

const navItems: { key: ViewKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'tasks', label: 'Tasks', icon: ListTodo },
  { key: 'costs', label: 'Cost Control', icon: DollarSign },
  { key: 'procurement', label: 'Procurement', icon: Package },
  { key: 'safety', label: 'Safety & HSE', icon: ShieldAlert },
  { key: 'progress', label: 'Progress', icon: TrendingUp },
];

export function Sidebar({ active, onNavigate, projectCount, taskCount, costCount, procurementCount, safetyCount, progressCount }: SidebarProps) {
  const counts: Record<string, number> = {
    projects: projectCount,
    tasks: taskCount,
    costs: costCount,
    procurement: procurementCount,
    safety: safetyCount,
    progress: progressCount,
  };

  return (
    <aside className="w-64 shrink-0 bg-neutral-900 text-neutral-300 flex flex-col h-full">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
          <HardHat size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">BuildTrack</h1>
          <p className="text-neutral-500 text-xs">Construction Control</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          const count = counts[item.key];
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-neutral-800">
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Excel-compatible data. Import and export your projects and tasks directly to .xlsx files.
          </p>
        </div>
      </div>
    </aside>
  );
}
