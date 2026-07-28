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
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-1/2 right-0 z-30 -translate-y-1/2 px-1.5 py-3 rounded-l-md glass-surface text-[10px] text-dimmed hover:text-surface transition-colors cursor-pointer border-r-0"
        style={{ writingMode: 'vertical-rl' }}
      >
        {'\u25C0'} History {entries.length > 0 && `(${entries.length})`}
      </button>

      {open && (
        <div className="fixed top-0 right-0 bottom-0 w-72 z-40 glass-surface border-l border-white/[0.08] flex flex-col shadow-glass">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.08]">
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
                className="text-sm text-dimmed hover:text-surface cursor-pointer leading-none"
              >
                {'\u2715'}
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
                  onClick={() => { onSelect(entry); setOpen(false); }}
                  className="text-left rounded-md px-2.5 py-2 cursor-pointer hover:bg-white/[0.04] transition-all duration-200 group border border-transparent hover:border-white/[0.08]"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-dimmed">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    {entry.error ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">{'\u2717'} error</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        {'\u2713'} {entry.result?.rowCount}r {'\u00B7'} {entry.result?.executionMs}ms
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

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
