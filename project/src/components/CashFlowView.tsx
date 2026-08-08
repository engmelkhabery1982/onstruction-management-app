import { useMemo, useRef, useState } from 'react';
import { Upload, Download, Banknote, Loader2 } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { CashFlowEntry, Project } from '@/types';
import { CASHFLOW_CATEGORIES } from '@/types';
import { exportCashFlowToExcel, parseCashFlowExcel } from '@/utils/excel';

interface CashFlowViewProps {
  cashFlow: CashFlowEntry[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<CashFlowEntry>[]) => Promise<void>;
}

const fmtMoney = (n: unknown) => {
  const v = Number(n) || 0;
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toFixed(0)}`;
};

export function CashFlowView({ cashFlow, projects, onCellChange, onAddRow, onDeleteRow, onBulkImport }: CashFlowViewProps) {
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

  const columns: Column<CashFlowEntry>[] = useMemo(() => [
    { key: 'project_id', header: 'Project', width: 180, type: 'select', options: projectOptions, format: (v) => projectNameMap[v as string] || '—' },
    { key: 'date', header: 'Date', width: 120, type: 'date' },
    { key: 'description', header: 'Description', width: 250, type: 'text' },
    { key: 'inflow', header: 'Inflow', width: 130, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'outflow', header: 'Outflow', width: 130, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'net', header: 'Net', width: 130, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'cumulative_balance', header: 'Cumulative', width: 150, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'category', header: 'Category', width: 140, type: 'select', options: CASHFLOW_CATEGORIES },
    { key: 'notes', header: 'Notes', width: 200, type: 'text' },
  ], [projectOptions, projectNameMap]);

  const filtered = cashFlow.filter((c) => filterProject === 'all' || c.project_id === filterProject);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseCashFlowExcel(file);
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

  const totalInflow = filtered.reduce((s, c) => s + (c.inflow || 0), 0);
  const totalOutflow = filtered.reduce((s, c) => s + (c.outflow || 0), 0);
  const totalNet = totalInflow - totalOutflow;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Banknote size={20} className="text-success-600" />
          <h2 className="text-base font-semibold text-neutral-800">Cash Flow</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Inflow:</span> <span className="font-semibold text-success-600">{fmtMoney(totalInflow)}</span>
          </div>
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Outflow:</span> <span className="font-semibold text-error-600">{fmtMoney(totalOutflow)}</span>
          </div>
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Net:</span> <span className={`font-semibold ${totalNet >= 0 ? 'text-success-600' : 'text-error-600'}`}>{fmtMoney(totalNet)}</span>
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
        <button onClick={() => exportCashFlowToExcel(filtered, projectNameMap)} disabled={filtered.length === 0} className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed">
          <Download size={15} /> Export Excel
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<CashFlowEntry> columns={columns} rows={filtered} onCellChange={handleCellChange} onDeleteRow={onDeleteRow} onAddRow={onAddRow} getRowId={(c) => c.id} emptyMessage="No cash flow entries yet. Click 'Add Row' or import from Excel." />
      </div>
    </div>
  );
}
