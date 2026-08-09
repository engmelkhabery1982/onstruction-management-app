import { useState, useMemo } from 'react';
import { Plus, Search, Download, Loader as Loader2, X, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'money' | 'date' | 'status' | 'progress' | 'boolean';
  width?: string;
  editable?: boolean;
  options?: string[];
}

export interface FilterDef {
  key: string;
  label: string;
  options: string[];
}

interface DataTableViewProps {
  tableName: string;
  title: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  data: Record<string, any>[];
  columns: ColumnDef[];
  filters?: FilterDef[];
  projects: Project[];
  showProjectFilter?: boolean;
  onChanged: () => void;
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (['completed', 'delivered', 'approved', 'closed', 'current', 'paid'].includes(s))
    return 'bg-success-100 text-success-700 border-success-200';
  if (['in progress', 'active', 'ordered', 'under review', 'partially delivered', 'investigating', 'submitted'].includes(s))
    return 'bg-primary-100 text-primary-700 border-primary-200';
  if (['planning', 'requested', 'pending', 'draft'].includes(s))
    return 'bg-secondary-100 text-secondary-700 border-secondary-200';
  if (['on hold', 'delayed', 'open', 'overdue', 'rejected'].includes(s))
    return 'bg-warning-100 text-warning-700 border-warning-200';
  if (['cancelled', 'critical', 'high'].includes(s))
    return 'bg-error-100 text-error-700 border-error-200';
  return 'bg-neutral-100 text-neutral-600 border-neutral-200';
}

function fmtMoney(n: number): string {
  const v = Math.abs(n || 0);
  if (v >= 1_000_000) return `${n < 0 ? '-' : ''}$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${n < 0 ? '-' : ''}$${(v / 1_000).toFixed(1)}K`;
  return `${n < 0 ? '-' : ''}$${v.toFixed(0)}`;
}

function renderCell(value: any, col: ColumnDef): React.ReactNode {
  if (value === null || value === undefined || value === '') return <span className="text-neutral-300">—</span>;
  switch (col.type) {
    case 'money': return <span className="font-medium text-neutral-700">{fmtMoney(Number(value))}</span>;
    case 'number': return <span className="text-neutral-600">{Number(value).toLocaleString()}</span>;
    case 'date': return <span className="text-neutral-500 text-sm">{new Date(value).toLocaleDateString()}</span>;
    case 'status':
      return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(String(value))}`}>{value}</span>;
    case 'progress':
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden min-w-12">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${value}%` }} />
          </div>
          <span className="text-xs text-neutral-500 w-8">{value}%</span>
        </div>
      );
    case 'boolean':
      return <span className={value ? 'text-success-600 font-medium' : 'text-neutral-400'}>{value ? 'Yes' : 'No'}</span>;
    default: return <span className="text-neutral-700 text-sm">{String(value)}</span>;
  }
}

export function DataTableView({
  tableName, title, icon: Icon, data, columns, filters, projects, showProjectFilter, onChanged,
}: DataTableViewProps) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [projectFilter, setProjectFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Record<string, any>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...data];
    if (showProjectFilter && projectFilter !== 'all') {
      result = result.filter((r) => r.project_id === projectFilter);
    }
    Object.entries(filterValues).forEach(([key, val]) => {
      if (val !== 'all') result = result.filter((r) => r[key] === val);
    });
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        columns.some((c) => String(r[c.key] || '').toLowerCase().includes(q))
      );
    }
    return result;
  }, [data, search, filterValues, projectFilter, columns, showProjectFilter]);

  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach((p) => { m[p.id] = p.name; });
    return m;
  }, [projects]);

  function coerceTypes(row: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      const col = columns.find((c) => c.key === key);
      if (col) {
        if (col.type === 'number' || col.type === 'money') {
          out[key] = val === '' || val === null || val === undefined ? 0 : Number(val);
        } else if (col.type === 'boolean') {
          out[key] = val === true || val === 'true';
        } else if (col.type === 'progress') {
          const n = Number(val);
          out[key] = isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
        } else {
          out[key] = val;
        }
      } else if (key === 'project_id') {
        out[key] = val;
      } else {
        out[key] = val;
      }
    }
    return out;
  }

  async function handleAdd() {
    setSaving(true);
    const { error } = await supabase.from(tableName).insert([coerceTypes(newRow)]);
    setSaving(false);
    if (error) { alert(`Error: ${error.message}`); return; }
    setShowAdd(false);
    setNewRow({});
    onChanged();
  }

  async function handleEdit() {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from(tableName).update(coerceTypes(editRow)).eq('id', editingId);
    setSaving(false);
    if (error) { alert(`Error: ${error.message}`); return; }
    setEditingId(null);
    setEditRow({});
    onChanged();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    const { error } = await supabase.from(tableName).delete().eq('id', deleteId);
    setSaving(false);
    if (error) { alert(`Error: ${error.message}`); return; }
    setDeleteId(null);
    onChanged();
  }

  function startEdit(row: Record<string, any>) {
    setEditingId(row.id);
    setEditRow({ ...row });
  }

  function exportCSV() {
    const headers = columns.map((c) => c.label).join(',');
    const rows = filtered.map((r) =>
      columns.map((c) => {
        const v = r[c.key];
        if (v === null || v === undefined) return '';
        if (c.type === 'money') return Number(v).toFixed(2);
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const editableCols = columns.filter((c) => c.editable);
  const allColsForForm = showProjectFilter
    ? [{ key: 'project_id', label: 'Project', type: 'text' as const, options: projects.map((p) => p.id) }, ...editableCols]
    : editableCols;

  return (
    <div className="flex-1 overflow-auto scrollbar-thin bg-neutral-50">
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Icon size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
              <p className="text-sm text-neutral-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">
              <Download size={15} /> Export
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
              <Plus size={15} /> Add New
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm pl-9 pr-3 py-2 border border-neutral-200 rounded-lg w-56 focus:outline-none focus:border-primary-400 bg-white"
            />
          </div>
          {showProjectFilter && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="text-sm px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          )}
          {filters?.map((f) => (
            <select
              key={f.key}
              value={filterValues[f.key] || 'all'}
              onChange={(e) => setFilterValues({ ...filterValues, [f.key]: e.target.value })}
              className="text-sm px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-primary-400"
            >
              <option value="all">All {f.label}</option>
              {f.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          ))}
          {(search || Object.values(filterValues).some((v) => v !== 'all') || projectFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterValues({}); setProjectFilter('all'); }}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  {showProjectFilter && <th className="text-left text-xs font-semibold text-neutral-500 px-4 py-3">Project</th>}
                  {columns.map((col) => (
                    <th key={col.key} className="text-left text-xs font-semibold text-neutral-500 px-4 py-3 whitespace-nowrap" style={col.width ? { width: col.width } : undefined}>
                      {col.label}
                    </th>
                  ))}
                  <th className="text-right text-xs font-semibold text-neutral-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (showProjectFilter ? 2 : 1)} className="text-center text-sm text-neutral-400 py-12">
                      No records found. {data.length === 0 ? 'Click "Add New" to create the first record.' : 'Try adjusting your filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      {showProjectFilter && (
                        <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{projectMap[row.project_id] || '—'}</td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                          {renderCell(row[col.key], col)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(row)} className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded hover:bg-primary-50 transition-colors">Edit</button>
                          <button onClick={() => setDeleteId(row.id)} className="text-xs text-error-600 hover:text-error-700 font-medium px-2 py-1 rounded hover:bg-error-50 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-auto scrollbar-thin p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Add {title}</h3>
              <button onClick={() => setShowAdd(false)} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {allColsForForm.map((col) => (
                <div key={col.key}>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">{col.label}</label>
                  {col.type === 'boolean' ? (
                    <select value={newRow[col.key] ?? 'false'} onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value === 'true' })} className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : col.options ? (
                    <div className="relative">
                      <select value={newRow[col.key] || ''} onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value })} className="w-full appearance-none text-sm px-3 py-2 pr-9 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400">
                        <option value="">Select...</option>
                        {col.key === 'project_id'
                          ? projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))
                          : col.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={col.type === 'number' || col.type === 'money' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                      value={newRow[col.key] ?? ''}
                      onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-auto scrollbar-thin p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Edit {title}</h3>
              <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {allColsForForm.map((col) => (
                <div key={col.key}>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">{col.label}</label>
                  {col.type === 'boolean' ? (
                    <select value={editRow[col.key] ?? 'false'} onChange={(e) => setEditRow({ ...editRow, [col.key]: e.target.value === 'true' })} className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : col.options ? (
                    <div className="relative">
                      <select value={editRow[col.key] || ''} onChange={(e) => setEditRow({ ...editRow, [col.key]: e.target.value })} className="w-full appearance-none text-sm px-3 py-2 pr-9 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400">
                        <option value="">Select...</option>
                        {col.key === 'project_id'
                          ? projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))
                          : col.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={col.type === 'number' || col.type === 'money' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                      value={editRow[col.key] ?? ''}
                      onChange={(e) => setEditRow({ ...editRow, [col.key]: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : null} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Record?</h3>
            <p className="text-sm text-neutral-500 mb-5">This action cannot be undone. The record will be permanently removed.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-error-600 rounded-lg hover:bg-error-700 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
