import { useMemo, useRef, useState } from 'react';
import { Upload, Download, GitBranch, Loader as Loader2, Search } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { Variation, Project } from '@/types';
import { VARIATION_STATUSES, VARIATION_TYPES } from '@/types';
import { exportVariationsToExcel, parseVariationsExcel } from '@/utils/excel';

interface VariationsViewProps {
  variations: Variation[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<Variation>[]) => Promise<void>;
}

const fmtMoney = (n: unknown) => {
  const v = Number(n) || 0;
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toFixed(0)}`;
};

export function VariationsView({ variations, projects, onCellChange, onAddRow, onDeleteRow, onBulkImport }: VariationsViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const projectNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => { map[p.id] = p.name; });
    return map;
  }, [projects]);
  const projectOptions = useMemo(() => projects.map((p) => p.name), [projects]);
  const projectNameToId = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => { map[p.name] = p.id; });
    return map;
  }, [projects]);

  const columns: Column<Variation>[] = useMemo(() => [
    { key: 'project_id', header: 'Project', width: 180, type: 'select', options: projectOptions, format: (v) => projectNameMap[v as string] || '—' },
    { key: 'variation_number', header: 'Variation #', width: 140, type: 'text' },
    { key: 'type', header: 'Type', width: 140, type: 'select', options: VARIATION_TYPES },
    { key: 'title', header: 'Title', width: 200, type: 'text' },
    { key: 'description', header: 'Description', width: 300, type: 'text' },
    { key: 'cost_impact', header: 'Cost Impact', width: 130, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'time_impact_days', header: 'Time (days)', width: 110, type: 'number', align: 'right' },
    { key: 'status', header: 'Status', width: 120, type: 'select', options: VARIATION_STATUSES },
    { key: 'approved_by', header: 'Approved By', width: 150, type: 'text' },
    { key: 'approved_date', header: 'Approved Date', width: 130, type: 'date' },
    { key: 'notes', header: 'Notes', width: 200, type: 'text' },
  ], [projectOptions, projectNameMap]);

  const filtered = variations.filter((v) => {
    if (filterProject !== 'all' && v.project_id !== filterProject) return false;
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.description.toLowerCase().includes(search.toLowerCase()) && !v.variation_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseVariationsExcel(file);
      const mapped = rows.map((r) => ({ ...r, project_id: filterProject !== 'all' ? filterProject : (projects[0]?.id || '') }));
      await onBulkImport(mapped);
    } catch (err) {
      alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCellChange = (id: string, key: string, value: string | number) => {
    if (key === 'project_id') { onCellChange(id, 'project_id', projectNameToId[value as string] || value); return; }
    onCellChange(id, key, value);
  };

  const totalCostImpact = filtered.reduce((s, v) => s + (v.cost_impact || 0), 0);
  const approvedCount = filtered.filter((v) => v.status === 'Approved').length;
  const pendingCount = filtered.filter((v) => v.status === 'Pending' || v.status === 'Submitted').length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <GitBranch size={20} className="text-accent-600" />
          <h2 className="text-base font-semibold text-neutral-800">Variations</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Cost Impact:</span> <span className="font-semibold text-neutral-700">{fmtMoney(totalCostImpact)}</span>
          </div>
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Approved:</span> <span className="font-semibold text-success-600">{approvedCount}</span>
          </div>
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Pending:</span> <span className="font-semibold text-warning-600">{pendingCount}</span>
          </div>
        </div>
        <div className="flex-1" />
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400 max-w-48">
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400">
          <option value="all">All Statuses</option>
          {VARIATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input type="text" placeholder="Search title..." value={search} onChange={(e) => setSearch(e.target.value)} className="text-sm pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg w-48 focus:outline-none focus:border-primary-400" />
        </div>
        <div className="h-6 w-px bg-neutral-200" />
        <label className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 cursor-pointer transition-colors border border-primary-200">
          {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Import Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>
        <button onClick={() => exportVariationsToExcel(filtered, projectNameMap)} disabled={filtered.length === 0} className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed">
          <Download size={15} /> Export Excel
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<Variation> columns={columns} rows={filtered} onCellChange={handleCellChange} onDeleteRow={onDeleteRow} onAddRow={onAddRow} getRowId={(v) => v.id} emptyMessage="No variations yet. Click 'Add Row' or import from Excel." />
      </div>
    </div>
  )
  );
}
