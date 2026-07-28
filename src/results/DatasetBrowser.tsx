import { useState, useEffect, useCallback } from 'react';
import type { DatasetInfo } from '../types';
import { initDuckDB, executeQuery } from '../db/engine';
import type { QueryResult } from '../types';

interface DatasetBrowserProps {
  dataset: DatasetInfo;
  dbReady: boolean;
}

export default function DatasetBrowser({ dataset, dbReady }: DatasetBrowserProps) {
  const [selectedTable, setSelectedTable] = useState(dataset.tables[0]?.name ?? '');
  const [preview, setPreview] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState<number | null>(null);

  const loadPreview = useCallback(async (tableName: string) => {
    if (!dbReady) return;
    setLoading(true);
    try {
      const db = await initDuckDB();

      const countResult = await executeQuery(db, `SELECT COUNT(*) AS cnt FROM "${tableName}"`);
      const count = Number(countResult.rows[0]?.[0] ?? 0);
      setTotalRows(count);

      const result = await executeQuery(db, `SELECT * FROM "${tableName}" LIMIT 100`);
      setPreview(result);
    } catch {
      setPreview(null);
      setTotalRows(null);
    } finally {
      setLoading(false);
    }
  }, [dbReady]);

  useEffect(() => {
    setSelectedTable(dataset.tables[0]?.name ?? '');
  }, [dataset]);

  useEffect(() => {
    if (selectedTable) loadPreview(selectedTable);
  }, [selectedTable, loadPreview]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.08]">
        {dataset.tables.map((t) => (
          <button
            key={t.name}
            onClick={() => setSelectedTable(t.name)}
            className={`px-2.5 py-1 rounded text-xs transition-all duration-200 cursor-pointer ${
              selectedTable === t.name
                ? 'gradient-accent text-white shadow-glow'
                : 'text-dimmed hover:text-surface border border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            {t.name}
          </button>
        ))}
        {totalRows !== null && (
          <span className="ml-auto text-[10px] text-dimmed">
            {totalRows.toLocaleString()} total rows {totalRows > 100 && '(showing first 100)'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-dimmed">
            Loading table data...
          </div>
        ) : preview ? (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-navy-deep">
              <tr>
                {preview.columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-3 py-2 text-muted font-medium border-b border-white/[0.08] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, ri) => (
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
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-dimmed">
            {dbReady ? 'Select a table to preview its data' : 'Database is loading...'}
          </div>
        )}
      </div>
    </div>
  );
}
