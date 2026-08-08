import { useMemo, useRef, useState } from 'react';
import { Upload, Download, ListTodo, Loader2, ChevronRight } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { Task, Project } from '@/types';
import { TASK_STATUSES, TASK_CATEGORIES, TASK_PRIORITIES } from '@/types';
import { exportTasksToExcel, parseTasksExcel } from '@/utils/excel';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<Task>[]) => Promise<void>;
}

const fmtMoney = (n: unknown) => {
  const v = Number(n) || 0;
  return v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toFixed(0)}`;
};

export function TasksView({
  tasks,
  projects,
  onCellChange,
  onAddRow,
  onDeleteRow,
  onBulkImport,
}: TasksViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const columns: Column<Task>[] = useMemo(() => [
    {
      key: 'project_id',
      header: 'Project',
      width: 200,
      type: 'select',
      options: projectOptions,
      format: (v) => projectNameMap[v as string] || '—',
    },
    { key: 'name', header: 'Task Name', width: 200, type: 'text' },
    { key: 'assignee', header: 'Assignee', width: 140, type: 'text' },
    { key: 'category', header: 'Category', width: 130, type: 'select', options: TASK_CATEGORIES },
    { key: 'start_date', header: 'Start Date', width: 120, type: 'date' },
    { key: 'end_date', header: 'End Date', width: 120, type: 'date' },
    { key: 'cost', header: 'Cost', width: 100, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'status', header: 'Status', width: 120, type: 'select', options: TASK_STATUSES },
    { key: 'progress', header: 'Progress %', width: 90, type: 'progress', align: 'center' },
    { key: 'priority', header: 'Priority', width: 100, type: 'select', options: TASK_PRIORITIES },
    { key: 'predecessors', header: 'Predecessors', width: 120, type: 'text' },
  ], [projectOptions, projectNameMap]);

  const filtered = tasks.filter((t) => {
    if (filterProject !== 'all' && t.project_id !== filterProject) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseTasksExcel(file);
      const mapped: Partial<Task>[] = rows.map((r) => ({
        ...r,
        project_id: r.project_id || (projects.length > 0 ? projects[0].id : ''),
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

  const currentProjectName = filterProject !== 'all'
    ? projectNameMap[filterProject] || 'Unknown'
    : 'All Projects';

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ListTodo size={20} className="text-primary-600" />
          <h2 className="text-base font-semibold text-neutral-800">Tasks</h2>
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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400"
        >
          <option value="all">All Statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="h-6 w-px bg-neutral-200" />

        <label className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 cursor-pointer transition-colors border border-primary-200">
          {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Import Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>

        <button
          onClick={() => exportTasksToExcel(filtered, currentProjectName, 'tasks.xlsx')}
          disabled={filtered.length === 0}
          className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={15} /> Export Excel
        </button>
      </div>

      {/* Breadcrumb */}
      {filterProject !== 'all' && (
        <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center gap-1.5 text-xs text-neutral-500">
          <span>Tasks</span>
          <ChevronRight size={12} />
          <span className="font-medium text-neutral-700">{currentProjectName}</span>
          <span className="text-neutral-300">·</span>
          <span>{filtered.length} tasks</span>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<Task>
          columns={columns}
          rows={filtered}
          onCellChange={handleCellChange}
          onDeleteRow={onDeleteRow}
          onAddRow={onAddRow}
          getRowId={(t) => t.id}
          emptyMessage="No tasks yet. Click 'Add Row' or import from Excel to get started."
        />
      </div>
    </div>
  );
}
