import { useMemo, useRef, useState } from 'react';
import { Upload, Download, Package, Loader as Loader2, Search } from 'lucide-react';
import { SpreadsheetGrid, type Column } from '@/components/SpreadsheetGrid';
import type { Procurement, Project } from '@/types';
import { PROCUREMENT_STATUSES } from '@/types';
import { exportProcurementToExcel, parseProcurementExcel } from '@/utils/excel';

interface ProcurementViewProps {
  procurement: Procurement[];
  projects: Project[];
  onCellChange: (id: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onBulkImport: (rows: Partial<Procurement>[]) => Promise<void>;
}

const fmtMoney = (n: unknown) => {
  const v = Number(n) || 0;
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toFixed(0)}`;
};

export function ProcurementView({ procurement, projects, onCellChange, onAddRow, onDeleteRow, onBulkImport }: ProcurementViewProps) {
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

  const columns: Column<Procurement>[] = useMemo(() => [
    {
      key: 'project_id', header: 'Project', width: 200, type: 'select', options: projectOptions,
      format: (v) => projectNameMap[v as string] || '—',
    },
    { key: 'item', header: 'Item', width: 220, type: 'text' },
    { key: 'supplier', header: 'Supplier', width: 160, type: 'text' },
    { key: 'quantity', header: 'Qty', width: 80, type: 'number', align: 'right' },
    { key: 'unit', header: 'Unit', width: 80, type: 'text' },
    { key: 'unit_cost', header: 'Unit Cost', width: 110, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'total_cost', header: 'Total Cost', width: 120, type: 'number', align: 'right', format: (v) => fmtMoney(v) },
    { key: 'status', header: 'Status', width: 150, type: 'select', options: PROCUREMENT_STATUSES },
    { key: 'order_date', header: 'Order Date', width: 120, type: 'date' },
    { key: 'delivery_date', header: 'Delivery Date', width: 120, type: 'date' },
    { key: 'notes', header: 'Notes', width: 180, type: 'text' },
  ], [projectOptions, projectNameMap]);

  const filtered = procurement.filter((p) => {
    if (filterProject !== 'all' && p.project_id !== filterProject) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search && !p.item.toLowerCase().includes(search.toLowerCase()) && !p.supplier.toLowerCase().includes(search.toLowerCase()) && !p.notes.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseProcurementExcel(file);
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
    if (key === 'quantity' || key === 'unit_cost') {
      onCellChange(id, key, value);
      const row = procurement.find((p) => p.id === id);
      if (row) {
        const newQty = key === 'quantity' ? Number(value) || 0 : row.quantity;
        const newCost = key === 'unit_cost' ? Number(value) || 0 : row.unit_cost;
        onCellChange(id, 'total_cost', Math.round(newQty * newCost * 100) / 100);
      }
      return;
    }
    onCellChange(id, key, value);
  };

  const totalCost = filtered.reduce((s, p) => s + (p.total_cost || 0), 0);
  const deliveredCount = filtered.filter((p) => p.status === 'Delivered').length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-primary-600" />
          <h2 className="text-base font-semibold text-neutral-800">Procurement</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>

        <div className="flex items-center gap-4 ml-4">
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Total:</span> <span className="font-semibold text-neutral-700">{fmtMoney(totalCost)}</span>
          </div>
          <div className="text-xs text-neutral-500">
            <span className="text-neutral-400">Delivered:</span> <span className="font-semibold text-neutral-700">{deliveredCount}/{filtered.length}</span>
          </div>
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
          {PROCUREMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search item, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm pl-9 pr-3 py-1.5 border border-neutral-200 rounded-lg w-48 focus:outline-none focus:border-primary-400"
          />
        </div>

        <div className="h-6 w-px bg-neutral-200" />

        <label className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 cursor-pointer transition-colors border border-primary-200">
          {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Import Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>

        <button
          onClick={() => exportProcurementToExcel(filtered)}
          disabled={filtered.length === 0}
          className="text-sm px-3 py-1.5 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 flex items-center gap-1.5 transition-colors border border-success-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={15} /> Export Excel
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid<Procurement>
          columns={columns}
          rows={filtered}
          onCellChange={handleCellChange}
          onDeleteRow={onDeleteRow}
          onAddRow={onAddRow}
          getRowId={(p) => p.id}
          emptyMessage="No procurement items yet. Click 'Add Row' or import from Excel to get started."
        />
      </div>
    </div>
  )
  );
}
