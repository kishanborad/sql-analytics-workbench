import { DATASETS } from '../db/datasets';
import type { DatasetInfo } from '../types';

interface TopBarProps {
  dataset: DatasetInfo;
  onDatasetChange: (id: string) => void;
  onClearHistory: () => void;
}

export default function TopBar({ dataset, onDatasetChange, onClearHistory }: TopBarProps) {
  return (
    <div className="glass-surface flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shadow-glow">
          <span className="text-white text-xs font-bold">SQL</span>
        </div>
        <h1 className="text-sm font-semibold text-surface hidden sm:block">
          SQL Analytics Workbench
        </h1>

        <div className="h-5 w-px bg-white/[0.08] mx-1 hidden sm:block" />

        <div className="flex gap-1.5 overflow-x-auto flex-nowrap">
          {DATASETS.map((ds) => (
            <button
              key={ds.id}
              onClick={() => onDatasetChange(ds.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
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

      <button
        onClick={onClearHistory}
        className="text-xs text-dimmed hover:text-surface transition-colors duration-200 cursor-pointer whitespace-nowrap ml-2"
      >
        Clear history
      </button>
    </div>
  );
}
