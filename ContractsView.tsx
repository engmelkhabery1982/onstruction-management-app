import { useMemo, useRef, useState } from 'react';
import { Upload, Download, FileSignature, Loader2 } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { Contract, Project } from '@/types';
import { CONTRACT_STATUSES, CONTRACT_TYPES } from '@/types';
import { exportContractsToExcel, parseContractsExcel } from '@/utils/excel';

interface ContractsViewProps {
  contracts: Contract[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<Contract>[]) => Promise<void>;
}

const fmtMoney = (n: unknown) => {
  const v = Number(n) || 0;
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toFixed(0)}`;
};

export function ContractsView({ contracts, projects, onCellChange, onAddRow, onDeleteRow, onBulkImport }: ContractsViewProps) {
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

  const columns: Column<Contract>[] = useMemo(() => [
    { key: 'project_id', header: 'Project', width: 180, type: 'select', options: projectOptions, format: (v) => projectNameMap[v as string] || '—' },
    { key: 'contract_number', header: 'Contract #', width: 140, type: 'text' },
    { key: 'title', header: 'Title', width: 220, type: 'text' },
    { key: 'contractor', header: 'Contractor', width: 160, type: 'text' },
    { key: 'contract_type', header: 'Type', width: 140, type: 'select', options: CONTRACT_TYPES },
    { key: 'contract_value', header: 'Value', width: 130, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'start_date', header: 'Start', width: 120, type: 'date' },
    { key: 'end_date', header: 'End', width: 120, type: 'date' },
    { key: 'status', header: 'Status', width: 120, type: 'select', options: CONTRACT_STATUSES },
    { key: 'signed_date', header: 'Signed', width: 120, type: 'date' },
    { key: 'notes', header: 'Notes', width: 200, type: 'text' },
  ], [projectOptions, projectNameMap]);

  const filtered = contracts.filter((c) => filterProject === 'all' || c.project_id === filterProject);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseContractsExcel(file);
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

  const totalValue = filtered.reduce((s, c) => s + (c.contract_value || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FileSignature size={20} className="text-primary-600" />
          <h2 className="text-base font-semibold text-neutral-800">Contract Management</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Total Value:</span> <span className="font-semibold text-neutral-700">{fmtMoney(totalValue)}</span>
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
        <button onClick={() => exportContractsToExcel(filtered, projectNameMap)} disabled={filtered.length === 0} className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed">
          <Download size={15} /> Export Excel
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<Contract> columns={columns} rows={filtered} onCellChange={handleCellChange} onDeleteRow={onDeleteRow} onAddRow={onAddRow} getRowId={(c) => c.id} emptyMessage="No contracts yet. Click 'Add Row' or import from Excel." />
      </div>
    </div>
  );
}
