import { useCallback, useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { sql } from '@codemirror/lang-sql';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const sqlTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0a0a1a',
    color: '#f4f4f6',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  '.cm-content': {
    caretColor: '#818cf8',
    padding: '8px 10px',
  },
  '.cm-cursor': { borderLeftColor: '#818cf8' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(99, 102, 241, 0.2) !important' },
  '.cm-gutters': {
    backgroundColor: '#0a0a1a',
    color: '#64648a',
    border: 'none',
    paddingLeft: '4px',
    minWidth: '32px',
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
  running: boolean;
}

export default function SqlEditor({ initialSql, onRun, running }: SqlEditorProps) {
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
        lineNumbers(),
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.08]">
        <span className="text-[10px] text-dimmed uppercase tracking-wider font-medium">SQL Editor</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-dimmed hidden sm:block">Ctrl+Enter to run</span>
          <button
            onClick={handleRun}
            disabled={running}
            className="gradient-accent text-white text-[11px] font-medium px-3 py-1 rounded-md shadow-glow hover:shadow-glow-strong hover:scale-105 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {running ? 'Running...' : 'Run \u25B6'}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div ref={editorRef} className="h-full overflow-auto" />
      </div>
    </div>
  );
}
