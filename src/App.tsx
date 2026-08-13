import { useCallback, useEffect, useRef, useState } from 'react';
import { ProblemBanner } from './ProblemBanner';
import TopBar from './layout/TopBar';
import SplitPane from './layout/SplitPane';
import SqlEditor from './editor/SqlEditor';
import QueryHistory from './editor/QueryHistory';
import DatasetBrowser from './results/DatasetBrowser';
import ResultTabs from './results/ResultTabs';
import SchemaTree from './results/SchemaTree';
import { DATASETS } from './db/datasets';
import { initDuckDB, loadDataset, executeQuery } from './db/engine';
import type { QueryHistoryEntry, QueryResult } from './types';

export default function App() {
  const [datasetId, setDatasetId] = useState(DATASETS[0].id);
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
  const [currentSql, setCurrentSql] = useState(DATASETS[0].starterQueries[0].sql);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const dbRef = useRef<Awaited<ReturnType<typeof initDuckDB>> | null>(null);

  const dataset = DATASETS.find((d) => d.id === datasetId) ?? DATASETS[0];

  const ensureDb = useCallback(async () => {
    if (!dbRef.current) {
      dbRef.current = await initDuckDB();
    }
    return dbRef.current;
  }, []);

  const handleDatasetChange = useCallback(async (id: string) => {
    setDatasetId(id);
    const ds = DATASETS.find((d) => d.id === id) ?? DATASETS[0];
    setCurrentSql(ds.starterQueries[0].sql);
    setCurrentResult(null);
    setError(null);

    try {
      const db = await ensureDb();
      const base = import.meta.env.BASE_URL;
      await loadDataset(db, ds, base);
      setDbReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dataset');
    }
  }, [ensureDb]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      handleDatasetChange(DATASETS[0].id);
    }
  }, [handleDatasetChange]);

  const handleRun = useCallback(async (sqlText: string) => {
    setError(null);
    setRunning(true);
    setCurrentSql(sqlText);
    try {
      const db = await ensureDb();
      if (!dbReady) {
        const base = import.meta.env.BASE_URL;
        await loadDataset(db, dataset, base);
        setDbReady(true);
      }

      const result = await executeQuery(db, sqlText);
      setCurrentResult(result);

      const entry: QueryHistoryEntry = {
        id: `q-${Date.now()}`,
        sql: sqlText,
        result,
        error: null,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query failed';
      setError(message);
      setCurrentResult(null);

      const entry: QueryHistoryEntry = {
        id: `q-${Date.now()}`,
        sql: sqlText,
        result: null,
        error: message,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev]);
    } finally {
      setRunning(false);
    }
  }, [ensureDb, dbReady, dataset]);

  const handleHistorySelect = useCallback((entry: QueryHistoryEntry) => {
    setCurrentSql(entry.sql);
    if (entry.result) {
      setCurrentResult(entry.result);
      setError(null);
    }
    if (entry.error) {
      setError(entry.error);
      setCurrentResult(null);
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-navy">
      <ProblemBanner />
      <TopBar
        dataset={dataset}
        onDatasetChange={handleDatasetChange}
        onRunQuery={handleRun}
      />
      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="h-[50%] min-h-[140px]">
              <SqlEditor
                key={currentSql}
                initialSql={currentSql}
                onRun={handleRun}
                running={running}
              />
            </div>
            <div className="flex items-center justify-between px-3 py-1 border-y border-white/[0.08] flex-shrink-0">
              <span className="text-[10px] text-dimmed uppercase tracking-wider font-medium">
                {showSchema ? 'Schema' : 'Data'}
              </span>
              <button
                onClick={() => setShowSchema(!showSchema)}
                className="text-[10px] text-accent hover:text-accent-mid cursor-pointer transition-colors"
              >
                {showSchema ? 'Show data' : 'Show schema'}
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {showSchema ? (
                <SchemaTree dataset={dataset} />
              ) : (
                <DatasetBrowser dataset={dataset} dbReady={dbReady} />
              )}
            </div>
          </div>
        }
        right={
          <ResultTabs
            result={currentResult}
            error={error}
            running={running}
          />
        }
      />
      <QueryHistory entries={history} onSelect={handleHistorySelect} onClear={handleClearHistory} />
    </div>
  );
}
