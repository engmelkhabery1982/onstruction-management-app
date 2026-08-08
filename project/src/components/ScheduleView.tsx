import { useMemo, useRef, useState } from 'react';
import { Upload, Download, CalendarClock, Loader2 } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { Schedule, Project } from '@/types';
import { SCHEDULE_STATUSES } from '@/types';
import { exportScheduleToExcel, parseScheduleExcel } from '@/utils/excel';

interface ScheduleViewProps {
  schedules: Schedule[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<Schedule>[]) => Promise<void>;
}

export function ScheduleView({ schedules, projects, onCellChange, onAddRow, onDeleteRow, onBulkImport }: ScheduleViewProps) {
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

  const columns: Column<Schedule>[] = useMemo(() => [
    { key: 'project_id', header: 'Project', width: 180, type: 'select', options: projectOptions, format: (v) => projectNameMap[v as string] || '—' },
    { key: 'activity', header: 'Activity', width: 250, type: 'text' },
    { key: 'start_date', header: 'Start', width: 120, type: 'date' },
    { key: 'end_date', header: 'End', width: 120, type: 'date' },
    { key: 'duration_days', header: 'Days', width: 80, type: 'number', align: 'right' },
    { key: 'progress', header: 'Progress', width: 100, type: 'progress', align: 'center' },
    { key: 'predecessors', header: 'Predecessors', width: 120, type: 'text' },
    { key: 'critical_path', header: 'Critical', width: 90, type: 'select', options: ['No', 'Yes'], align: 'center', format: (v) => v ? 'Yes' : 'No' },
    { key: 'responsible', header: 'Responsible', width: 150, type: 'text' },
    { key: 'status', header: 'Status', width: 120, type: 'select', options: SCHEDULE_STATUSES },
    { key: 'notes', header: 'Notes', width: 200, type: 'text' },
  ], [projectOptions, projectNameMap]);

  const filtered = schedules.filter((s) => filterProject === 'all' || s.project_id === filterProject);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseScheduleExcel(file);
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
    if (key === 'critical_path') { onCellChange(id, 'critical_path', value === 'Yes' ? 1 : 0); return; }
    onCellChange(id, key, value);
  };

  const criticalCount = filtered.filter((s) => s.critical_path).length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarClock size={20} className="text-primary-600" />
          <h2 className="text-base font-semibold text-neutral-800">Schedule Management</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Critical Path:</span> <span className="font-semibold text-error-600">{criticalCount}</span>
          </div>
        </div>
        <div className="flex-1" />
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400 max-w-48">
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="h-6 w-px bg-neutral-200" />
        <label className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 cursor-pointer transition-colors border border-primary-200">
          {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Import Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>
        <button onClick={() => exportScheduleToExcel(filtered, projectNameMap)} disabled={filtered.length === 0} className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed">
          <Download size={15} /> Export Excel
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<Schedule> columns={columns} rows={filtered} onCellChange={handleCellChange} onDeleteRow={onDeleteRow} onAddRow={onAddRow} getRowId={(s) => s.id} emptyMessage="No schedule activities yet. Click 'Add Row' or import from Excel." />
      </div>
    </div>
  );
}
