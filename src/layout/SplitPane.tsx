import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

export default function SplitPane({ left, right }: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(50);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (isMobile) return;
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(Math.max(pct, 25), 75);
      setLeftWidth(clamped);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <div className="min-h-[300px]">{left}</div>
        <div className="h-px bg-white/[0.08]" />
        <div className="min-h-[300px] flex-1">{right}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-1 min-h-0">
      <div
        className="flex flex-col min-w-0 overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-white/[0.08] hover:bg-accent/30 cursor-col-resize flex-shrink-0 transition-colors duration-200 relative group"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-0.5 h-0.5 rounded-full bg-muted" />
          <div className="w-0.5 h-0.5 rounded-full bg-muted" />
          <div className="w-0.5 h-0.5 rounded-full bg-muted" />
        </div>
      </div>
      <div className="flex flex-col min-w-0 overflow-hidden flex-1">
        {right}
      </div>
    </div>
  );
}
