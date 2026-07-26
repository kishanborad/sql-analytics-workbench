import * as duckdb from '@duckdb/duckdb-wasm';
import type { DatasetInfo, QueryResult } from '../types';

let db: duckdb.AsyncDuckDB | null = null;

export async function initDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) return db;

  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  return db;
}

export async function loadDataset(
  database: duckdb.AsyncDuckDB,
  dataset: DatasetInfo,
  basePath: string,
): Promise<void> {
  const conn = await database.connect();

  try {
    const existing = await conn.query(
      "SELECT name FROM information_schema.tables WHERE table_schema = 'main'",
    );
    const tableNames = existing.toArray().map((row) => (row as Record<string, unknown>).name as string);
    for (const name of tableNames) {
      await conn.query(`DROP TABLE IF EXISTS "${name}"`);
    }

    for (const table of dataset.tables) {
      const csvUrl = `${basePath}${table.csvPath}`;
      await conn.query(
        `CREATE TABLE "${table.name}" AS SELECT * FROM read_csv_auto('${csvUrl}')`,
      );
    }
  } finally {
    await conn.close();
  }
}

export async function executeQuery(
  database: duckdb.AsyncDuckDB,
  sql: string,
): Promise<QueryResult> {
  const conn = await database.connect();

  try {
    const start = performance.now();
    const result = await conn.query(sql);
    const executionMs = Math.round(performance.now() - start);

    const schema = result.schema.fields;
    const columns = schema.map((f) => f.name);
    const rows = result.toArray().map((row) => {
      const values: unknown[] = [];
      for (const col of columns) {
        values.push(row[col]);
      }
      return values;
    });

    const columnTypes = schema.map((f) => {
      const typeStr = f.type.toString().toLowerCase();
      if (typeStr.includes('int') || typeStr.includes('float') || typeStr.includes('double') || typeStr.includes('decimal')) {
        return 'number' as const;
      }
      if (typeStr.includes('date') || typeStr.includes('timestamp')) {
        return 'date' as const;
      }
      return 'string' as const;
    });

    return {
      columns,
      columnTypes,
      rows,
      rowCount: rows.length,
      executionMs,
    };
  } finally {
    await conn.close();
  }
}

export function detectChartType(
  columnTypes: Array<'string' | 'number' | 'date'>,
): import('../types').ChartType {
  const hasDate = columnTypes.includes('date');
  const numericCount = columnTypes.filter((t) => t === 'number').length;
  const hasString = columnTypes.includes('string');

  if (hasDate && numericCount >= 1) return 'line';
  if (numericCount >= 2 && !hasString) return 'scatter';
  if (hasString && numericCount >= 1) return 'bar';

  return 'bar';
}
