import type { QueryHistoryEntry } from '../types';

interface QueryHistoryProps {
  entries: QueryHistoryEntry[];
  onSelect: (entry: QueryHistoryEntry) => void;
}

export default function QueryHistory({ entries, onSelect }: QueryHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-dimmed text-xs p-4">
        Query history will appear here
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
      {entries.map((entry) => (
        <button
          key={entry.id}
          onClick={() => onSelect(entry)}
          className="text-left glass-surface rounded-lg px-3 py-2 cursor-pointer hover:border-white/[0.15] transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-dimmed">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            {entry.error ? (
              <span className="text-[10px] text-red-400">error</span>
            ) : (
              <span className="text-[10px] text-green-400">
                {entry.result?.rowCount} rows · {entry.result?.executionMs}ms
              </span>
            )}
          </div>
          <pre className="text-[11px] text-muted font-mono truncate group-hover:text-surface transition-colors">
            {entry.sql.slice(0, 80)}{entry.sql.length > 80 ? '...' : ''}
          </pre>
        </button>
      ))}
    </div>
  );
}
