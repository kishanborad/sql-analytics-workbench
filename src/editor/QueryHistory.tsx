import { useState } from 'react';
import type { QueryHistoryEntry } from '../types';

interface QueryHistoryProps {
  entries: QueryHistoryEntry[];
  onSelect: (entry: QueryHistoryEntry) => void;
  onClear: () => void;
}

export default function QueryHistory({ entries, onSelect, onClear }: QueryHistoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col h-full relative">
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-2 right-0 z-10 flex items-center gap-1 px-2 py-1 rounded-l-md glass-surface text-[10px] text-dimmed hover:text-surface transition-colors cursor-pointer"
        style={{ writingMode: open ? undefined : 'vertical-rl' }}
      >
        {open ? '\u2715' : '\u25C0'} History {entries.length > 0 && `(${entries.length})`}
      </button>

      {open && (
        <div className="absolute top-0 right-0 bottom-0 w-64 glass-surface border-l border-white/[0.08] z-20 flex flex-col shadow-glass">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08]">
            <span className="text-[10px] text-dimmed uppercase tracking-wider font-medium">Query Log</span>
            <div className="flex items-center gap-2">
              {entries.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-[10px] text-dimmed hover:text-red-400 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-dimmed hover:text-surface cursor-pointer"
              >
                \u2715
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {entries.length === 0 ? (
              <div className="flex items-center justify-center text-dimmed text-[11px] py-8">
                No queries yet
              </div>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelect(entry)}
                  className="text-left rounded-md px-2.5 py-2 cursor-pointer hover:bg-white/[0.04] transition-all duration-200 group border border-transparent hover:border-white/[0.08]"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-dimmed">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    {entry.error ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">\u2717 error</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        \u2713 {entry.result?.rowCount}r · {entry.result?.executionMs}ms
                      </span>
                    )}
                  </div>
                  <pre className="text-[10px] text-muted font-mono truncate group-hover:text-surface transition-colors">
                    {entry.sql.slice(0, 60)}{entry.sql.length > 60 ? '...' : ''}
                  </pre>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
