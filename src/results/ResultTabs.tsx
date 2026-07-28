import { useState } from 'react';
import DataTable from './DataTable';
import ChartPanel from './ChartPanel';
import SchemaTree from './SchemaTree';
import DatasetBrowser from './DatasetBrowser';
import type { DatasetInfo, QueryResult } from '../types';

type Tab = 'table' | 'chart' | 'schema' | 'data';

interface ResultTabsProps {
  result: QueryResult | null;
  error: string | null;
  dataset: DatasetInfo;
  dbReady: boolean;
  running: boolean;
}

export default function ResultTabs({ result, error, dataset, dbReady, running }: ResultTabsProps) {
  const [tab, setTab] = useState<Tab>('table');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'table', label: 'Results' },
    { id: 'chart', label: 'Chart' },
    { id: 'data', label: 'Data' },
    { id: 'schema', label: 'Schema' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-white/[0.08]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer relative ${
              tab === t.id ? 'text-surface' : 'text-dimmed hover:text-muted'
            }`}
          >
            {t.label}
            {tab === t.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-accent" />
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center px-3 gap-3">
          {running && (
            <span className="text-[10px] text-accent animate-pulse">Running...</span>
          )}
          {result && !running && (
            <span className="text-[10px] text-dimmed">
              {result.rowCount} rows · {result.executionMs}ms
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {error && tab !== 'data' && tab !== 'schema' && (
          <div className="m-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {tab === 'schema' && <SchemaTree dataset={dataset} />}

        {tab === 'data' && <DatasetBrowser dataset={dataset} dbReady={dbReady} />}

        {tab === 'table' && result && !error && <DataTable result={result} />}

        {tab === 'chart' && result && !error && <ChartPanel result={result} />}

        {(tab === 'table' || tab === 'chart') && !result && !error && (
          <div className="flex items-center justify-center text-dimmed text-xs h-full">
            Run a query to see results
          </div>
        )}
      </div>
    </div>
  );
}
