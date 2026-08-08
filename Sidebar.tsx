import {
  LayoutDashboard, FolderKanban, ListTodo, DollarSign, Package, ShieldAlert, TrendingUp, HardHat,
  CalendarClock, FileSignature, ClipboardList, ClipboardCheck, Banknote, Receipt, FileText, GitBranch, FolderOpen,
} from 'lucide-react';
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
  scheduleCount: number;
  contractCount: number;
  boqCount: number;
  wirCount: number;
  cashFlowCount: number;
  subInvoiceCount: number;
  clientInvoiceCount: number;
  variationCount: number;
  documentCount: number;
}

const navGroups: { label: string; items: { key: ViewKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] }[] = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Project',
    items: [
      { key: 'projects', label: 'Projects', icon: FolderKanban },
      { key: 'tasks', label: 'Tasks', icon: ListTodo },
      { key: 'progress', label: 'Progress', icon: TrendingUp },
      { key: 'safety', label: 'Safety & HSE', icon: ShieldAlert },
    ],
  },
  {
    label: 'Schedule & Contracts',
    items: [
      { key: 'schedule', label: 'Schedule', icon: CalendarClock },
      { key: 'contracts', label: 'Contracts', icon: FileSignature },
      { key: 'variations', label: 'Variations', icon: GitBranch },
    ],
  },
  {
    label: 'Cost & Finance',
    items: [
      { key: 'costs', label: 'Cost Control', icon: DollarSign },
      { key: 'boq', label: 'BOQ', icon: ClipboardList },
      { key: 'cashflow', label: 'Cash Flow', icon: Banknote },
      { key: 'subinvoices', label: 'Sub Invoices', icon: Receipt },
      { key: 'clientinvoices', label: 'Client Invoices', icon: FileText },
    ],
  },
  {
    label: 'Site & Procurement',
    items: [
      { key: 'procurement', label: 'Procurement', icon: Package },
      { key: 'wir', label: 'WIR Tracking', icon: ClipboardCheck },
      { key: 'documents', label: 'Documents', icon: FolderOpen },
    ],
  },
];

export function Sidebar({
  active, onNavigate,
  projectCount, taskCount, costCount, procurementCount, safetyCount, progressCount,
  scheduleCount, contractCount, boqCount, wirCount, cashFlowCount, subInvoiceCount, clientInvoiceCount, variationCount, documentCount,
}: SidebarProps) {
  const counts: Record<string, number> = {
    projects: projectCount,
    tasks: taskCount,
    costs: costCount,
    procurement: procurementCount,
    safety: safetyCount,
    progress: progressCount,
    schedule: scheduleCount,
    contracts: contractCount,
    boq: boqCount,
    wir: wirCount,
    cashflow: cashFlowCount,
    subinvoices: subInvoiceCount,
    clientinvoices: clientInvoiceCount,
    variations: variationCount,
    documents: documentCount,
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

      <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold px-3 mb-1">{group.label}</p>
            {group.items.map((item) => {
              const isActive = active === item.key;
              const Icon = item.icon;
              const count = counts[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <Icon size={17} />
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
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-neutral-800">
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Excel-compatible data. Import and export all modules directly to .xlsx files.
          </p>
        </div>
      </div>
    </aside>
  );
}
