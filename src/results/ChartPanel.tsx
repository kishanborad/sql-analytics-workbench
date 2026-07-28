import { useEffect, useRef, useState, useMemo } from 'react';
import * as Plot from '@observablehq/plot';
import type { QueryResult, ChartType } from '../types';
import { detectChartType } from '../db/engine';

const ALL_CHART_TYPES: { type: ChartType; label: string; icon: string }[] = [
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
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + (Number(d[valueCol]) || 0), 0);
  if (total === 0) return <div className="text-xs text-dimmed">No data to display</div>;

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 105;
  const innerRadius = 55;

  let currentAngle = -Math.PI / 2;
  const slices = data.slice(0, 15).map((d, i) => {
    const value = Number(d[valueCol]) || 0;
    const angle = (value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const r = hovered === i ? radius + 6 : radius;
    const ir = hovered === i ? innerRadius - 2 : innerRadius;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(endAngle);
    const iy2 = cy + ir * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const path = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${ir} ${ir} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    return { path, color: PIE_COLORS[i % PIE_COLORS.length], label: String(d[labelCol]), value, pct: ((value / total) * 100).toFixed(1) };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size + 20} height={size + 20} viewBox={`-10 -10 ${size + 20} ${size + 20}`}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            stroke="rgba(10,10,26,0.8)"
            strokeWidth="2"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ transition: 'all 0.15s ease', cursor: 'pointer', opacity: hovered !== null && hovered !== i ? 0.5 : 1 }}
          />
        ))}
        {hovered !== null && slices[hovered] && (
          <>
            <text x={cx} y={cy - 10} textAnchor="middle" fill="#f4f4f6" fontSize="13" fontWeight="600">
              {slices[hovered].label}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="#818cf8" fontSize="16" fontWeight="700">
              {slices[hovered].pct}%
            </text>
            <text x={cx} y={cy + 24} textAnchor="middle" fill="#64648a" fontSize="10">
              {typeof slices[hovered].value === 'number' ? slices[hovered].value.toLocaleString() : slices[hovered].value}
            </text>
          </>
        )}
        {hovered === null && (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" fill="#f4f4f6" fontSize="16" fontWeight="bold">
              {data.length}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#64648a" fontSize="10">
              categories
            </text>
          </>
        )}
      </svg>
      <div className="flex flex-col gap-0.5 max-h-[240px] overflow-y-auto text-[11px]">
        {slices.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            style={{ backgroundColor: hovered === i ? 'rgba(255,255,255,0.05)' : 'transparent' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-surface/80">{s.label}</span>
            <span className="text-dimmed ml-auto pl-2">{s.pct}%</span>
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

  const data = useMemo(() => {
    return result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      result.columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }, [result]);

  const cols = result.columns;
  const types = result.columnTypes;
  const firstString = types.indexOf('string');
  const firstNumber = types.indexOf('number');
  const firstDate = types.indexOf('date');
  const secondNumber = types.indexOf('number', firstNumber + 1);

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

  const compatibleTypes = ALL_CHART_TYPES.filter((ct) => validForType(ct.type));

  useEffect(() => {
    if (!validForType(chartType) && compatibleTypes.length > 0) {
      setChartType(compatibleTypes[0].type);
    }
  }, [result]);

  const isPie = chartType === 'pie';

  useEffect(() => {
    if (!containerRef.current || data.length === 0 || isPie) return;

    const width = containerRef.current.clientWidth - 16;
    const height = Math.min(280, containerRef.current.clientHeight - 16);

    const plotOptions: Plot.PlotOptions = {
      width,
      height,
      style: {
        background: 'transparent',
        color: '#f4f4f6',
        fontSize: '10px',
      },
      x: { label: null },
      y: { label: null, grid: true },
    };

    let plot: SVGSVGElement | HTMLElement;

    try {
      switch (chartType) {
        case 'bar': {
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.barY(data, {
                x: cols[firstString],
                y: cols[firstNumber],
                fill: '#818cf8',
                title: (d: Record<string, unknown>) => `${d[cols[firstString]]}\n${cols[firstNumber]}: ${d[cols[firstNumber]]}`,
              }),
              Plot.ruleY([0]),
            ],
          });
          break;
        }
        case 'line': {
          const xCol = firstDate >= 0 ? firstDate : firstString;
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.lineY(data, { x: cols[xCol], y: cols[firstNumber], stroke: '#818cf8', strokeWidth: 2 }),
              Plot.dot(data, {
                x: cols[xCol],
                y: cols[firstNumber],
                fill: '#818cf8',
                r: 3,
                title: (d: Record<string, unknown>) => `${d[cols[xCol]]}\n${cols[firstNumber]}: ${d[cols[firstNumber]]}`,
              }),
            ],
          });
          break;
        }
        case 'scatter': {
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.dot(data, {
                x: cols[firstNumber],
                y: cols[secondNumber],
                fill: firstString >= 0 ? cols[firstString] : '#818cf8',
                r: 4,
                opacity: 0.7,
                title: (d: Record<string, unknown>) => {
                  const parts = [`${cols[firstNumber]}: ${d[cols[firstNumber]]}`, `${cols[secondNumber]}: ${d[cols[secondNumber]]}`];
                  if (firstString >= 0) parts.unshift(String(d[cols[firstString]]));
                  return parts.join('\n');
                },
              }),
            ],
            color: firstString >= 0 ? { legend: true } : undefined,
          });
          break;
        }
        case 'area': {
          const xCol = firstDate >= 0 ? firstDate : firstString;
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.areaY(data, { x: cols[xCol], y: cols[firstNumber], fill: '#818cf8', fillOpacity: 0.3 }),
              Plot.lineY(data, { x: cols[xCol], y: cols[firstNumber], stroke: '#818cf8', strokeWidth: 2 }),
              Plot.dot(data, {
                x: cols[xCol],
                y: cols[firstNumber],
                fill: '#818cf8',
                r: 2,
                title: (d: Record<string, unknown>) => `${d[cols[xCol]]}\n${cols[firstNumber]}: ${d[cols[firstNumber]]}`,
              }),
            ],
          });
          break;
        }
        case 'heatmap': {
          const secondString = types.indexOf('string', firstString + 1);
          plot = Plot.plot({
            ...plotOptions,
            marks: [
              Plot.cell(data, {
                x: cols[firstString],
                y: cols[secondString],
                fill: cols[firstNumber],
                title: (d: Record<string, unknown>) =>
                  `${cols[firstString]}: ${d[cols[firstString]]}\n${cols[secondString]}: ${d[cols[secondString]]}\n${cols[firstNumber]}: ${d[cols[firstNumber]]}`,
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
    } catch {
      // silently ignore chart rendering errors
    }
  }, [data, chartType, cols, types, firstString, firstNumber, firstDate, secondNumber, isPie]);

  if (compatibleTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-dimmed p-4">
        No chart types available for this data shape
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.08] flex-shrink-0">
        <span className="text-[10px] text-dimmed uppercase tracking-wider font-medium mr-2">Chart</span>
        {compatibleTypes.map((ct) => (
          <button
            key={ct.type}
            onClick={() => { setChartType(ct.type); }}
            className={`px-2 py-0.5 rounded text-[11px] transition-all duration-200 cursor-pointer ${
              chartType === ct.type
                ? 'gradient-accent text-white shadow-glow'
                : 'text-dimmed hover:text-surface border border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            {ct.icon} {ct.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-3 overflow-auto min-h-0">
        {isPie && firstString >= 0 && firstNumber >= 0 ? (
          <PieChart data={data} labelCol={cols[firstString]} valueCol={cols[firstNumber]} />
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
