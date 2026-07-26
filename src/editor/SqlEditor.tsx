import { useCallback, useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { sql } from '@codemirror/lang-sql';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { StarterQuery } from '../types';

const sqlTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0a0a1a',
    color: '#f4f4f6',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  '.cm-content': {
    caretColor: '#818cf8',
    padding: '12px',
  },
  '.cm-cursor': { borderLeftColor: '#818cf8' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(99, 102, 241, 0.2) !important' },
  '.cm-gutters': {
    backgroundColor: '#0a0a1a',
    color: '#64648a',
    border: 'none',
    paddingLeft: '8px',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(99, 102, 241, 0.25) !important' },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    backdropFilter: 'blur(12px)',
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
    color: '#f4f4f6',
    padding: '4px 12px',
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#f4f4f6',
  },
});

const sqlHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#818cf8' },
  { tag: tags.string, color: '#22c55e' },
  { tag: tags.number, color: '#f59e0b' },
  { tag: tags.comment, color: '#64648a', fontStyle: 'italic' },
  { tag: tags.operator, color: '#aaa6c3' },
  { tag: tags.function(tags.variableName), color: '#818cf8' },
  { tag: tags.typeName, color: '#6366f1' },
]);

interface SqlEditorProps {
  initialSql: string;
  onRun: (sql: string) => void;
  starterQueries: StarterQuery[];
}

export default function SqlEditor({ initialSql, onRun, starterQueries }: SqlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const handleRun = useCallback(() => {
    if (!viewRef.current) return;
    const content = viewRef.current.state.doc.toString().trim();
    if (content) onRun(content);
  }, [onRun]);

  useEffect(() => {
    if (!editorRef.current) return;

    const runKeymap = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          handleRun();
          return true;
        },
      },
    ]);

    const state = EditorState.create({
      doc: initialSql,
      extensions: [
        runKeymap,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        sql(),
        autocompletion(),
        syntaxHighlighting(sqlHighlight),
        sqlTheme,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });
    viewRef.current = view;

    return () => view.destroy();
  }, [initialSql, handleRun]);

  const handleChipClick = (query: StarterQuery) => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: query.sql },
      });
    }
    onRun(query.sql);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-hidden border-b border-white/[0.08]">
        <div ref={editorRef} className="h-full overflow-auto" />
      </div>

      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto flex-nowrap sm:flex-wrap sm:overflow-visible min-w-0 flex-1">
          {starterQueries.map((q) => (
            <button
              key={q.label}
              onClick={() => handleChipClick(q)}
              className="px-2.5 py-1 rounded-full text-[10px] text-accent border border-accent/25 bg-accent/10 hover:bg-accent/20 transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              {q.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleRun}
          className="gradient-accent text-white text-xs font-medium px-4 py-1.5 rounded-lg shadow-glow hover:shadow-glow-strong hover:scale-105 transition-all duration-200 cursor-pointer flex-shrink-0"
        >
          Run ▶
        </button>
      </div>
    </div>
  );
}
