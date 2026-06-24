'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (info: { row: T }) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  // Selection
  selectedRows?: Set<string>;
  onSelectRow?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  getRowId?: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  pageIndex = 0,
  pageSize = 10,
  pageCount = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  onSort,
  selectedRows,
  onSelectRow,
  onSelectAll,
  getRowId,
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!onSort) return;
    const direction = sortCol === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortCol(key);
    setSortDir(direction);
    onSort(key, direction);
  };

  const isAllSelected = data.length > 0 && selectedRows && getRowId && data.every(row => selectedRows.has(getRowId(row)));

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <table className="w-full border-collapse text-left text-xs font-semibold text-white/80">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {selectedRows && onSelectAll && (
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected || false}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-black text-primary focus:ring-primary focus:ring-offset-black accent-primary cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "py-4 px-6 uppercase tracking-widest text-[10px] text-white/40 font-black",
                    col.sortable && "cursor-pointer hover:text-white transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.accessorKey as string)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="w-3.5 h-3.5" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {selectedRows && <td className="py-4 px-6"><div className="h-4 w-4 bg-white/5 rounded mx-auto" /></td>}
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="py-4 px-6">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectedRows ? 1 : 0)} className="py-12 text-center text-white/40">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const rowId = getRowId ? getRowId(row) : String(rowIdx);
                const isSelected = selectedRows?.has(rowId) || false;
                return (
                  <tr 
                    key={rowId} 
                    className={cn(
                      "hover:bg-white/[0.02] transition-colors",
                      isSelected && "bg-primary/5 hover:bg-primary/[0.08]"
                    )}
                  >
                    {selectedRows && onSelectRow && (
                      <td className="py-4 px-6 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow(rowId, e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 bg-black text-primary focus:ring-primary focus:ring-offset-black accent-primary cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => {
                      const value = (row as any)[col.accessorKey];
                      return (
                        <td key={colIdx} className="py-4 px-6 font-medium text-white/95">
                          {col.cell ? col.cell({ row }) : String(value ?? '-')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {onPageChange && pageCount > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4">
          <div className="text-xs text-white/40 font-semibold">
            Showing <span className="text-white">{pageIndex * pageSize + 1}</span> to{' '}
            <span className="text-white">
              {Math.min((pageIndex + 1) * pageSize, totalItems)}
            </span>{' '}
            of <span className="text-white">{totalItems}</span> records
          </div>

          <div className="flex items-center gap-6">
            {onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 font-semibold">Page size</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="bg-black/45 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange(0)}
                disabled={pageIndex === 0 || loading}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(pageIndex - 1)}
                disabled={pageIndex === 0 || loading}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs text-white/60 font-semibold px-2">
                Page <span className="text-white">{pageIndex + 1}</span> of{' '}
                <span className="text-white">{pageCount}</span>
              </span>

              <button
                onClick={() => onPageChange(pageIndex + 1)}
                disabled={pageIndex >= pageCount - 1 || loading}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1 || loading}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
