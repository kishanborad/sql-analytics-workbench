import { DATASETS } from '../db/datasets';
import type { DatasetInfo, StarterQuery } from '../types';

interface TopBarProps {
  dataset: DatasetInfo;
  onDatasetChange: (id: string) => void;
  onRunQuery: (sql: string) => void;
}

export default function TopBar({ dataset, onDatasetChange, onRunQuery }: TopBarProps) {
  const handleChip = (q: StarterQuery) => {
    onRunQuery(q.sql);
  };

  return (
    <div className="glass-surface border-b border-white/[0.08] flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center shadow-glow flex-shrink-0">
            <span className="text-white text-[10px] font-bold">SQL</span>
          </div>
          <h1 className="text-xs font-semibold text-surface hidden sm:block whitespace-nowrap">
            SQL Analytics Workbench
          </h1>
          <div className="h-4 w-px bg-white/[0.08] mx-0.5 hidden sm:block" />
          <div className="flex gap-1 overflow-x-auto flex-nowrap">
            {DATASETS.map((ds) => (
              <button
                key={ds.id}
                onClick={() => onDatasetChange(ds.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  dataset.id === ds.id
                    ? 'gradient-accent text-white shadow-glow'
                    : 'text-muted border border-white/[0.08] hover:border-white/[0.15] hover:text-surface'
                }`}
              >
                {ds.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto flex-nowrap">
        {dataset.starterQueries.map((q) => (
          <button
            key={q.label}
            onClick={() => handleChip(q)}
            className="px-2.5 py-1 rounded-full text-[10px] text-accent border border-accent/25 bg-accent/10 hover:bg-accent/20 transition-colors duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
