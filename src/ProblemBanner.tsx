import { useState } from 'react';

export function ProblemBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white/[0.04] border-b border-white/[0.08] text-[11px] text-slate-400">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium uppercase tracking-wider text-[10px]">Free</span>
        <span className="truncate">
          Tools like Mode Analytics cost $35/user/mo and require data uploads. This runs DuckDB compiled to WebAssembly — write SQL, get tables and charts. Zero install, your data never leaves this tab.
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-slate-500 hover:text-slate-300 cursor-pointer" aria-label="Dismiss">✕</button>
    </div>
  );
}
