import ChartPanel from './ChartPanel';
import DataTable from './DataTable';
import type { QueryResult } from '../types';

interface ResultTabsProps {
  result: QueryResult | null;
  error: string | null;
  running: boolean;
}

export default function ResultTabs({ result, error, running }: ResultTabsProps) {
  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex-shrink-0">
          {error}
        </div>
      )}

      {running && !result && (
        <div className="flex items-center justify-center h-full text-xs text-accent animate-pulse">
          Executing query...
        </div>
      )}

      {!result && !error && !running && (
        <div className="flex items-center justify-center h-full text-xs text-dimmed">
          Run a query to see results
        </div>
      )}

      {result && (
        <>
          <div className="h-[45%] min-h-[200px] border-b border-white/[0.08] flex-shrink-0">
            <ChartPanel result={result} />
          </div>

          <div className="flex items-center px-3 py-1.5 border-b border-white/[0.08] flex-shrink-0">
            <span className="text-[10px] text-dimmed uppercase tracking-wider font-medium">Results</span>
            <span className="text-[10px] text-dimmed ml-auto">
              {result.rowCount} rows · {result.executionMs}ms
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <DataTable result={result} />
          </div>
        </>
      )}
    </div>
  );
}
