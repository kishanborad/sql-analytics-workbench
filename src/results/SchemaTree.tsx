import { useState } from 'react';
import type { DatasetInfo } from '../types';

interface SchemaTreeProps {
  dataset: DatasetInfo;
}

export default function SchemaTree({ dataset }: SchemaTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(dataset.tables.map((t) => t.name)),
  );

  const toggle = (tableName: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) next.delete(tableName);
      else next.add(tableName);
      return next;
    });
  };

  return (
    <div className="p-3 overflow-y-auto h-full">
      <div className="text-[10px] text-dimmed uppercase tracking-wider mb-3 font-medium">
        {dataset.name} schema
      </div>
      <div className="flex flex-col gap-1">
        {dataset.tables.map((table) => (
          <div key={table.name}>
            <button
              onClick={() => toggle(table.name)}
              className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-dimmed">
                {expanded.has(table.name) ? '\u25BC' : '\u25B6'}
              </span>
              <span className="text-xs font-medium text-accent">{table.name}</span>
              <span className="text-[10px] text-dimmed ml-auto">
                {table.columns.length} cols
              </span>
            </button>
            {expanded.has(table.name) && (
              <div className="ml-6 flex flex-col gap-0.5 mb-1">
                {table.columns.map((col) => (
                  <div key={col.name} className="flex items-center gap-2 px-2 py-0.5">
                    <span className="text-[11px] text-surface/70">{col.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      col.type === 'number'
                        ? 'bg-amber-500/10 text-amber-400'
                        : col.type === 'date'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-accent/10 text-accent'
                    }`}>
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
