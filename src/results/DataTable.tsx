import { useMemo, useState } from 'react';
import type { QueryResult, SortState } from '../types';

const PAGE_SIZE = 50;

interface DataTableProps {
  result: QueryResult;
}

export default function DataTable({ result }: DataTableProps) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ columnIndex: -1, direction: null });

  const sortedRows = useMemo(() => {
    if (sort.direction === null || sort.columnIndex < 0) return result.rows;
    const idx = sort.columnIndex;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...result.rows].sort((a, b) => {
      const av = a[idx];
      const bv = b[idx];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [result.rows, sort]);

  const pageRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);

  const handleSort = (colIdx: number) => {
    setSort((prev) => {
      if (prev.columnIndex !== colIdx) return { columnIndex: colIdx, direction: 'asc' };
      if (prev.direction === 'asc') return { columnIndex: colIdx, direction: 'desc' };
      return { columnIndex: -1, direction: null };
    });
    setPage(0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-navy-deep">
            <tr>
              {result.columns.map((col, i) => (
                <th
                  key={col}
                  onClick={() => handleSort(i)}
                  className="text-left px-3 py-2 text-muted font-medium border-b border-white/[0.08] cursor-pointer hover:text-surface transition-colors select-none whitespace-nowrap"
                >
                  {col}
                  {sort.columnIndex === i && (
                    <span className="ml-1 text-accent">
                      {sort.direction === 'asc' ? '\u2191' : '\u2193'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                {row.map((val, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-surface/80 border-b border-white/[0.04] whitespace-nowrap">
                    {val == null ? <span className="text-dimmed italic">null</span> : String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.08] text-xs text-dimmed">
          <span>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedRows.length)} of {sortedRows.length} rows
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 rounded border border-white/[0.08] hover:border-white/[0.15] disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 rounded border border-white/[0.08] hover:border-white/[0.15] disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
