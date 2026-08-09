import { useMemo, useRef, useState } from 'react';
import { Upload, Download, ClipboardCheck, Loader as Loader2, Search } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { WIREntry, Project } from '@/types';
import { WIR_STATUSES, WIR_RESULTS } from '@/types';
import { exportWIRToExcel, parseWIRExcel } from '@/utils/excel';

interface WIRViewProps {
  wirEntries: WIREntry[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<WIREntry>[]) => Promise<void>;
}

export function WIRView({ wirEntries, projects, onCellChange, onAddRow, onDeleteRow, onBulkImport }: WIRViewProps) {
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

  const columns: Column<WIREntry>[] = useMemo(() => [
    { key: 'project_id', header: 'Project', width: 180, type: 'select', options: projectOptions, format: (v) => projectNameMap[v as string] || '—' },
    { key: 'wir_number', header: 'WIR #', width: 120, type: 'text' },
    { key: 'area', header: 'Area', width: 160, type: 'text' },
    { key: 'work_type', header: 'Work Type', width: 140, type: 'text' },
    { key: 'inspection_date', header: 'Inspection Date', width: 140, type: 'date' },
    { key: 'inspector', header: 'Inspector', width: 150, type: 'text' },
    { key: 'result', header: 'Result', width: 130, type: 'select', options: WIR_RESULTS },
    { key: 'remarks', header: 'Remarks', width: 250, type: 'text' },
    { key: 'status', header: 'Status', width: 120, type: 'select', options: WIR_STATUSES },
  ], [projectOptions, projectNameMap]);

  const filtered = wirEntries.filter((w) => {
    if (filterProject !== 'all' && w.project_id !== filterProject) return false;
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    if (search && !w.area.toLowerCase().includes(search.toLowerCase()) && !w.inspector.toLowerCase().includes(search.toLowerCase()) && !w.wir_number.toLowerCase().includes(search.toLowerCase()) && !w.remarks.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseWIRExcel(file);
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

  const passedCount = filtered.filter((w) => w.result === 'Passed').length;
  const failedCount = filtered.filter((w) => w.result === 'Failed').length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={20} className="text-primary-600" />
          <h2 className="text-base font-semibold text-neutral-800">WIR Tracking</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Passed:</span> <span className="font-semibold text-success-600">{passedCount}</span>
          </div>
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Failed:</span> <span className="font-semibold text-error-600">{failedCount}</span>
          </div>
        </div>
        <div className="flex-1" />
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400 max-w-48">
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400">
          <option value="all">All Statuses</option>
          {WIR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input type="text" placeholder="Search area, inspector..." value={search} onChange={(e) => setSearch(e.target.value)} className="text-sm pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg w-48 focus:outline-none focus:border-primary-400" />
        </div>
        <div className="h-6 w-px bg-neutral-200" />
        <label className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 cursor-pointer transition-colors border border-primary-200">
          {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Import Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>
        <button onClick={() => exportWIRToExcel(filtered, projectNameMap)} disabled={filtered.length === 0} className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed">
          <Download size={15} /> Export Excel
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<WIREntry> columns={columns} rows={filtered} onCellChange={handleCellChange} onDeleteRow={onDeleteRow} onAddRow={onAddRow} getRowId={(w) => w.id} emptyMessage="No WIR entries yet. Click 'Add Row' or import from Excel." />
      </div>
    </div>
  )
  );
}
