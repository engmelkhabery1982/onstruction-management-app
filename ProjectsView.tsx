import { useRef, useState } from 'react';
import { Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { Project, ProjectStatus } from '@/types';
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from '@/types';
import {
  exportProjectsToExcel,
  parseProjectsExcel,
  downloadProjectTemplate,
} from '@/utils/excel';

interface ProjectsViewProps {
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<Project>[]) => Promise<void>;
}

const fmtMoney = (n: unknown) => {
  const v = Number(n) || 0;
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toFixed(0)}`;
};

const columns: Column<Project>[] = [
  { key: 'name', header: 'Project Name', width: 220, type: 'text' },
  { key: 'client', header: 'Client', width: 160, type: 'text' },
  { key: 'location', header: 'Location', width: 180, type: 'text' },
  { key: 'category', header: 'Category', width: 130, type: 'select', options: PROJECT_CATEGORIES },
  { key: 'start_date', header: 'Start Date', width: 120, type: 'date' },
  { key: 'end_date', header: 'End Date', width: 120, type: 'date' },
  { key: 'budget', header: 'Budget', width: 110, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
  { key: 'spent', header: 'Spent', width: 110, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
  { key: 'status', header: 'Status', width: 120, type: 'select', options: PROJECT_STATUSES },
  { key: 'progress', header: 'Progress %', width: 90, type: 'progress', align: 'center' },
  { key: 'project_manager', header: 'Project Manager', width: 150, type: 'text' },
  { key: 'contractor', header: 'Contractor', width: 150, type: 'text' },
  { key: 'notes', header: 'Notes', width: 200, type: 'text' },
];

export function ProjectsView({
  projects,
  onCellChange,
  onAddRow,
  onDeleteRow,
  onBulkImport,
}: ProjectsViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseProjectsExcel(file);
      await onBulkImport(rows);
    } catch (err) {
      alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Planning': 'bg-secondary-100 text-secondary-700',
      'In Progress': 'bg-primary-100 text-primary-700',
      'On Hold': 'bg-warning-100 text-warning-700',
      'Completed': 'bg-success-100 text-success-700',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600';
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-primary-600" />
          <h2 className="text-base font-semibold text-neutral-800">Projects</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>

        <div className="flex-1" />

        <input
          type="text"
          placeholder="Search projects or clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg w-56 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400"
        >
          <option value="all">All Statuses</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="h-6 w-px bg-neutral-200" />

        <button
          onClick={downloadProjectTemplate}
          className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 flex items-center gap-1.5 transition-colors"
        >
          <Download size={15} /> Template
        </button>

        <label className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 cursor-pointer transition-colors border border-primary-200">
          {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Import Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>

        <button
          onClick={() => exportProjectsToExcel(filtered, 'projects.xlsx')}
          disabled={filtered.length === 0}
          className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={15} /> Export Excel
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<Project>
          columns={columns}
          rows={filtered}
          onCellChange={onCellChange}
          onDeleteRow={onDeleteRow}
          onAddRow={onAddRow}
          getRowId={(p) => p.id}
          emptyMessage="No projects yet. Click 'Add Row' or import from Excel to get started."
        />
      </div>
    </div>
  );
}
