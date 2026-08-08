import { useState, useRef, useEffect, useCallback } from 'react';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'progress';

export interface Column<T> {
  key: keyof T & string;
  header: string;
  width: number;
  type: ColumnType;
  options?: string[];
  editable?: boolean;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown, row: T) => string;
}

interface SpreadsheetGridProps<T> {
  columns: Column<T>[];
  rows: T[];
  onCellChange: (rowId: string, key: string, value: string | number) => void;
  onDeleteRow?: (rowId: string) => void;
  onAddRow?: () => void;
  getRowId: (row: T) => string;
  rowMenu?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

export function SpreadsheetGrid<T>({
  columns,
  rows,
  onCellChange,
  onDeleteRow,
  onAddRow,
  getRowId,
  rowMenu,
  emptyMessage = 'No data. Click "Add Row" to start.',
}: SpreadsheetGridProps<T>) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editing, setEditing] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [menuForRow, setMenuForRow] = useState<number | null>(null);
  const editRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      if (editRef.current instanceof HTMLInputElement) {
        editRef.current.select();
      }
    }
  }, [editing]);

  const startEdit = useCallback(
    (row: number, col: number) => {
      const colDef = columns[col];
      if (colDef.editable === false) return;
      const rowId = getRowId(rows[row]);
      const currentVal = rows[row][colDef.key as keyof T];
      setEditValue(currentVal === null || currentVal === undefined ? '' : String(currentVal));
      setEditing({ row, col });
    },
    [columns, rows, getRowId],
  );

  const commitEdit = useCallback(() => {
    if (!editing) return;
    const colDef = columns[editing.col];
    const rowId = getRowId(rows[editing.row]);
    let value: string | number = editValue;
    if (colDef.type === 'number') {
      value = editValue === '' ? 0 : Number(editValue);
      if (isNaN(value as number)) value = 0;
    }
    if (colDef.type === 'progress') {
      const n = Number(editValue);
      value = isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
    }
    onCellChange(rowId, colDef.key, value);
    setEditing(null);
  }, [editing, columns, rows, getRowId, editValue, onCellChange]);

  const cancelEdit = useCallback(() => setEditing(null), []);

  const moveSelection = useCallback(
    (dr: number, dc: number) => {
      setSelectedCell((prev) => {
        if (!prev) return null;
        const newRow = Math.min(rows.length - 1, Math.max(0, prev.row + dr));
        const newCol = Math.min(columns.length - 1, Math.max(0, prev.col + dc));
        return { row: newRow, col: newCol };
      });
    },
    [rows.length, columns.length],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editing) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitEdit();
          moveSelection(1, 0);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelEdit();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          commitEdit();
          moveSelection(0, e.shiftKey ? -1 : 1);
        }
        return;
      }
      if (!selectedCell) return;
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        startEdit(selectedCell.row, selectedCell.col);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        moveSelection(0, e.shiftKey ? -1 : 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveSelection(-1, 0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveSelection(1, 0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveSelection(0, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveSelection(0, 1);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const colDef = columns[selectedCell.col];
        if (colDef.editable !== false) {
          onCellChange(getRowId(rows[selectedCell.row]), colDef.key, '');
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        startEdit(selectedCell.row, selectedCell.col);
        setEditValue(e.key);
      }
    },
    [editing, selectedCell, columns, rows, getRowId, onCellChange, startEdit, commitEdit, cancelEdit, moveSelection],
  );

  const colLetter = (i: number) => {
    let s = '';
    i++;
    while (i > 0) {
      const r = (i - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      i = Math.floor((i - 1) / 26);
    }
    return s;
  };

  const renderCell = (row: T, rowIdx: number, colIdx: number) => {
    const colDef = columns[colIdx];
    const isEditing = editing?.row === rowIdx && editing?.col === colIdx;
    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
    const rawValue = row[colDef.key as keyof T];
    const displayValue = colDef.format
      ? colDef.format(rawValue, row)
      : rawValue === null || rawValue === undefined
        ? ''
        : String(rawValue);

    if (isEditing) {
      if (colDef.type === 'select' && colDef.options) {
        return (
          <select
            ref={editRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              const rowId = getRowId(rows[rowIdx]);
              onCellChange(rowId, colDef.key, e.target.value);
              setEditing(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            className="w-full h-full px-1 text-sm bg-white border-2 border-primary-500 outline-none rounded-none"
          >
            <option value="">—</option>
            {colDef.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      return (
        <input
          ref={editRef as React.RefObject<HTMLInputElement>}
          type={colDef.type === 'number' || colDef.type === 'progress' ? 'number' : colDef.type === 'date' ? 'date' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitEdit}
          className="w-full h-full px-1 text-sm bg-white border-2 border-primary-500 outline-none rounded-none"
        />
      );
    }

    return (
      <div
        onClick={() => {
          setSelectedCell({ row: rowIdx, col: colIdx });
        }}
        onDoubleClick={() => startEdit(rowIdx, colIdx)}
        className={`w-full h-full px-2 py-1 text-sm cursor-cell select-none truncate ${
          colDef.align === 'right' ? 'text-right' : colDef.align === 'center' ? 'text-center' : 'text-left'
        } ${isSelected ? 'ring-2 ring-primary-400 ring-inset' : ''}`}
      >
        {displayValue}
      </div>
    );
  };

  const totalWidth = columns.reduce((s, c) => s + c.width, 0) + 48;

  return (
    <div className="flex flex-col h-full bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="border-collapse" style={{ minWidth: totalWidth }}>
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 bg-neutral-100 border border-neutral-200 w-12 min-w-12 h-8 text-xs font-semibold text-neutral-500" />
              {columns.map((col, i) => (
                <th
                  key={i}
                  style={{ width: col.width, minWidth: col.width }}
                  className={`bg-neutral-100 border border-neutral-200 h-8 text-xs font-semibold text-neutral-600 px-2 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-300 font-mono text-[10px]">{colLetter(i)}</span>
                    <span>{col.header}</span>
                  </div>
                </th>
              ))}
              {rowMenu && <th className="bg-neutral-100 border border-neutral-200 w-10 h-8" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center text-sm text-neutral-400 py-12 border border-neutral-200">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => {
                const rowId = getRowId(row);
                const isRowSelected = selectedCell?.row === rowIdx;
                return (
                  <tr key={rowId} className={`group ${isRowSelected ? 'bg-primary-50/40' : ''} hover:bg-neutral-50`}>
                    <td
                      className={`sticky left-0 z-10 border border-neutral-200 w-12 min-w-12 h-8 text-xs text-center font-mono ${
                        isRowSelected ? 'bg-primary-100 text-primary-700' : 'bg-neutral-50 text-neutral-400'
                      }`}
                    >
                      {rowIdx + 1}
                    </td>
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        style={{ width: col.width, minWidth: col.width }}
                        className="border border-neutral-200 h-8 p-0"
                      >
                        {renderCell(row, rowIdx, colIdx)}
                      </td>
                    ))}
                    {rowMenu && (
                      <td className="border border-neutral-200 w-10 h-8 p-0 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuForRow(menuForRow === rowIdx ? null : rowIdx);
                          }}
                          className="w-full h-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                        </button>
                        {menuForRow === rowIdx && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setMenuForRow(null)} />
                            <div className="absolute right-0 top-full z-40 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-40">
                              {onDeleteRow && (
                                <button
                                  onClick={() => {
                                    onDeleteRow(rowId);
                                    setMenuForRow(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-sm text-error-600 hover:bg-error-50"
                                >
                                  Delete row
                                </button>
                              )}
                              {rowMenu(row)}
                            </div>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {onAddRow && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-3 py-2 flex items-center gap-3">
          <button
            onClick={onAddRow}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Row
          </button>
          <span className="text-xs text-neutral-400">
            {rows.length} {rows.length === 1 ? 'row' : 'rows'} · Click a cell to select, double-click or press Enter to edit
          </span>
        </div>
      )}
    </div>
  );
}
