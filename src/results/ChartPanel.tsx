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

const PIE_COLORS = [
  '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#f87171',
  '#a78bfa', '#22d3ee', '#fb923c', '#a3e635', '#e879f9',
  '#6ee7b7', '#fca5a1', '#93c5fd', '#fdba74', '#86efac',
];

interface ChartPanelProps {
  result: QueryResult;
}

function PieChart({ data, labelCol, valueCol }: { data: Record<string, unknown>[]; labelCol: string; valueCol: string }) {
  const total = data.reduce((sum, d) => sum + (Number(d[valueCol]) || 0), 0);
  if (total === 0) return <div className="text-xs text-dimmed">No data to display</div>;

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 120;
  const innerRadius = 60;

  let currentAngle = -Math.PI / 2;
  const slices = data.slice(0, 15).map((d, i) => {
    const value = Number(d[valueCol]) || 0;
    const angle = (value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const ix1 = cx + innerRadius * Math.cos(startAngle);
    const iy1 = cy + innerRadius * Math.sin(startAngle);
    const ix2 = cx + innerRadius * Math.cos(endAngle);
    const iy2 = cy + innerRadius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const path = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    const midAngle = startAngle + angle / 2;
    const labelR = radius + 18;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { path, color: PIE_COLORS[i % PIE_COLORS.length], label: String(d[labelCol]), pct: ((value / total) * 100).toFixed(1), lx, ly, midAngle, angle };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="rgba(10,10,26,0.8)" strokeWidth="2">
            <title>{s.label}: {s.pct}%</title>
          </path>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#f4f4f6" fontSize="18" fontWeight="bold">
          {data.length}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#64648a" fontSize="11">
          categories
        </text>
      </svg>
      <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto text-xs">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-surface/80">{s.label}</span>
            <span className="text-dimmed ml-auto pl-3">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
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

  const handleTypeChange = (type: ChartType) => {
    setChartType(type);
    setChartError(null);
  };

  const cols = result.columns;
  const types = result.columnTypes;
  const firstString = types.indexOf('string');
  const firstNumber = types.indexOf('number');
  const firstDate = types.indexOf('date');
  const secondNumber = types.indexOf('number', firstNumber + 1);

  const isPie = chartType === 'pie';
  const showPie = isPie && firstString >= 0 && firstNumber >= 0;

  useEffect(() => {
    if (!containerRef.current || data.length === 0 || isPie) return;

    setChartError(null);
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
        default:
          return;
      }

      containerRef.current.replaceChildren(plot);
    } catch (err) {
      setChartError(err instanceof Error ? err.message : 'Chart rendering failed');
    }
  }, [data, chartType, cols, types, firstString, firstNumber, firstDate, secondNumber, isPie]);

  const validForType = (type: ChartType): boolean => {
    const s = firstString >= 0;
    const n = firstNumber >= 0;
    const d = firstDate >= 0;
    const n2 = secondNumber >= 0;
    const s2 = types.indexOf('string', firstString + 1) >= 0;

    switch (type) {
      case 'bar': return s && n;
      case 'line': return (d || s) && n;
      case 'pie': return s && n;
      case 'scatter': return n && n2;
      case 'area': return (d || s) && n;
      case 'heatmap': return s && s2 && n;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-3 py-2 border-b border-white/[0.08]">
        {CHART_TYPES.map((ct) => {
          const valid = validForType(ct.type);
          return (
            <button
              key={ct.type}
              onClick={() => handleTypeChange(ct.type)}
              disabled={!valid}
              title={valid ? ct.label : `${ct.label} — incompatible with current data`}
              className={`px-2.5 py-1 rounded text-xs transition-all duration-200 ${
                !valid
                  ? 'text-dimmed/40 cursor-not-allowed opacity-40'
                  : chartType === ct.type
                    ? 'gradient-accent text-white shadow-glow cursor-pointer'
                    : 'text-dimmed hover:text-surface border border-white/[0.08] hover:border-white/[0.15] cursor-pointer'
              }`}
            >
              {ct.icon} {ct.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {chartError ? (
          <div className="text-xs text-red-400 text-center">{chartError}</div>
        ) : showPie ? (
          <PieChart data={data} labelCol={cols[firstString]} valueCol={cols[firstNumber]} />
        ) : (
          <div ref={containerRef} className="w-full" />
        )}
      </div>
    </div>
  );
}
