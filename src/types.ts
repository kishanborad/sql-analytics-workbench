export interface DatasetInfo {
  id: string;
  name: string;
  tables: TableInfo[];
  starterQueries: StarterQuery[];
}

export interface TableInfo {
  name: string;
  csvPath: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date';
}

export interface StarterQuery {
  label: string;
  sql: string;
}

export interface QueryResult {
  columns: string[];
  columnTypes: Array<'string' | 'number' | 'date'>;
  rows: unknown[][];
  rowCount: number;
  executionMs: number;
}

export interface QueryHistoryEntry {
  id: string;
  sql: string;
  result: QueryResult | null;
  error: string | null;
  timestamp: number;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'heatmap';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  columnIndex: number;
  direction: SortDirection;
}
