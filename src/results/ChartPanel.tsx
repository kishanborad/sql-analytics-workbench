import { useEffect, useRef, useState, useMemo } from 'react';
import * as Plot from '@observablehq/plot';
import type { QueryResult, ChartType } from '../types';
import { detectChartType } from '../db/engine';

const CHART_TYPES: { type: ChartType; label: string; icon: string }[] = [
  { type: 'bar', label: 'Bar', icon: '\u2590' },
  { type: 'line', label: 'Line', icon: '\u2307' },
  { type: 'pie', label: 'Pie', icon: '\u25D5' },
  { type: 'scatter', label: 'Scatter', icon: '\u2058' },
  { type: 'area', label: 'Area', icon: '\u25A4' },
  { type: 'heatmap', label: 'Heatmap', icon: '\u25A6' },
];

interface ChartPanelProps {
  result: QueryResult;
}

export default function ChartPanel({ result }: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoType = detectChartType(result.columnTypes);
  const [chartType, setChartType] = useState<ChartType>(autoType);
  const [chartError, setChartError] = useState<string | null>(null);

  const data = useMemo(() => {
    return result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      result.columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }, [result]);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    setChartError(null);
    const cols = result.columns;
    const types = result.columnTypes;
    const width = containerRef.current.clientWidth - 32;
    const height = 360;

    const plotOptions: Plot.PlotOptions = {
      width,
      height,
      style: {
        background: 'transparent',
        color: '#f4f4f6',
        fontSize: '11px',
      },
      x: { label: null },
      y: { label: null, grid: true },
    };

    let plot: SVGSVGElement | HTMLElement;

    try {
      const firstString = types.indexOf('string');
      const firstNumber = types.indexOf('number');
      const firstDate = types.indexOf('date');
      const secondNumber = types.indexOf('number', firstNumber + 1);

      switch (chartType) {
        case 'bar': {
          if (firstString < 0 || firstNumber < 0) {
            setChartError('Bar chart needs a text column and a number column');
            return;
          }
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.barY(data, { x: cols[firstString], y: cols[firstNumber], fill: '#818cf8' }),
              Plot.ruleY([0]),
            ],
          });
          break;
        }
        case 'line': {
          const xCol = firstDate >= 0 ? firstDate : firstString;
          if (xCol < 0 || firstNumber < 0) {
            setChartError('Line chart needs a date or text column and a number column');
            return;
          }
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.lineY(data, { x: cols[xCol], y: cols[firstNumber], stroke: '#818cf8', strokeWidth: 2 }),
              Plot.dot(data, { x: cols[xCol], y: cols[firstNumber], fill: '#818cf8', r: 3 }),
            ],
          });
          break;
        }
        case 'pie': {
          if (firstString < 0 || firstNumber < 0) {
            setChartError('Pie chart needs a text column and a number column');
            return;
          }
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.barX(data, { y: cols[firstString], x: cols[firstNumber], fill: '#818cf8', sort: { y: '-x' } }),
              Plot.ruleX([0]),
            ],
          });
          break;
        }
        case 'scatter': {
          if (firstNumber < 0 || secondNumber < 0) {
            setChartError('Scatter plot needs at least two number columns');
            return;
          }
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.dot(data, {
                x: cols[firstNumber],
                y: cols[secondNumber],
                fill: firstString >= 0 ? cols[firstString] : '#818cf8',
                r: 4,
                opacity: 0.7,
              }),
            ],
            color: firstString >= 0 ? { legend: true } : undefined,
          });
          break;
        }
        case 'area': {
          const xCol = firstDate >= 0 ? firstDate : firstString;
          if (xCol < 0 || firstNumber < 0) {
            setChartError('Area chart needs a date or text column and a number column');
            return;
          }
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.areaY(data, { x: cols[xCol], y: cols[firstNumber], fill: '#818cf8', fillOpacity: 0.3 }),
              Plot.lineY(data, { x: cols[xCol], y: cols[firstNumber], stroke: '#818cf8', strokeWidth: 2 }),
            ],
          });
          break;
        }
        case 'heatmap': {
          const secondString = types.indexOf('string', firstString + 1);
          if (firstString < 0 || secondString < 0 || firstNumber < 0) {
            setChartError('Heatmap needs two text columns and a number column');
            return;
          }
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.cell(data, {
                x: cols[firstString],
                y: cols[secondString],
                fill: cols[firstNumber],
              }),
            ],
            color: { scheme: 'YlOrRd', legend: true },
          });
          break;
        }
      }

      containerRef.current.replaceChildren(plot);
    } catch (err) {
      setChartError(err instanceof Error ? err.message : 'Chart rendering failed');
    }
  }, [data, chartType, result.columns, result.columnTypes]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-3 py-2 border-b border-white/[0.08]">
        {CHART_TYPES.map((ct) => (
          <button
            key={ct.type}
            onClick={() => setChartType(ct.type)}
            title={ct.label}
            className={`px-2.5 py-1 rounded text-xs transition-all duration-200 cursor-pointer ${
              chartType === ct.type
                ? 'gradient-accent text-white shadow-glow'
                : 'text-dimmed hover:text-surface border border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            {ct.icon} {ct.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {chartError ? (
          <div className="text-xs text-red-400 text-center">{chartError}</div>
        ) : (
          <div ref={containerRef} className="w-full" />
        )}
      </div>
    </div>
  );
}
