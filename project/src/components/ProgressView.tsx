import { useMemo, useRef, useState } from 'react';
import { Upload, Download, TrendingUp, Loader2 } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { ProgressEntry, Project } from '@/types';
import { exportProgressToExcel, parseProgressExcel } from '@/utils/excel';

interface ProgressViewProps {
  progress: ProgressEntry[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<ProgressEntry>[]) => Promise<void>;
}

export function ProgressView({ progress, projects, onCellChange, onAddRow, onDeleteRow, onBulkImport }: ProgressViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [filterProject, setFilterProject] = useState('all');

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

  const columns: Column<ProgressEntry>[] = useMemo(() => [
    {
      key: 'project_id', header: 'Project', width: 200, type: 'select', options: projectOptions,
      format: (v) => projectNameMap[v as string] || '—',
    },
    { key: 'date', header: 'Date', width: 120, type: 'date' },
    { key: 'area', header: 'Area / Phase', width: 180, type: 'text' },
    { key: 'percent_complete', header: '% Complete', width: 100, type: 'progress', align: 'center' },
    { key: 'weather', header: 'Weather', width: 140, type: 'text' },
    { key: 'workers', header: 'Workers', width: 90, type: 'number', align: 'right' },
    { key: 'notes', header: 'Notes', width: 280, type: 'text' },
  ], [projectOptions, projectNameMap]);

  const filtered = useMemo(() => {
    const items = progress.filter((p) => filterProject === 'all' || p.project_id === filterProject);
    return [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [progress, filterProject]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseProgressExcel(file);
      const mapped = rows.map((r) => ({
        ...r,
        project_id: filterProject !== 'all' ? filterProject : (projects[0]?.id || ''),
      }));
      await onBulkImport(mapped);
    } catch (err) {
      alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCellChange = (id: string, key: string, value: string | number) => {
    if (key === 'project_id') {
      const pid = projectNameToId[value as string] || value;
      onCellChange(id, 'project_id', pid);
      return;
    }
    onCellChange(id, key, value);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-secondary-600" />
          <h2 className="text-base font-semibold text-neutral-800">Progress Tracking</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>

        <div className="flex-1" />

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400 max-w-48"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div className="h-6 w-px bg-neutral-200" />

        <label className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 cursor-pointer transition-colors border border-primary-200">
          {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Import Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>

        <button
          onClick={() => exportProgressToExcel(filtered)}
          disabled={filtered.length === 0}
          className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={15} /> Export Excel
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<ProgressEntry>
          columns={columns}
          rows={filtered}
          onCellChange={handleCellChange}
          onDeleteRow={onDeleteRow}
          onAddRow={onAddRow}
          getRowId={(p) => p.id}
          emptyMessage="No progress entries yet. Click 'Add Row' or import from Excel to get started."
        />
      </div>
    </div>
  );
}
