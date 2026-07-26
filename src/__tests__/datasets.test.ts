import { describe, it, expect } from 'vitest';
import { DATASETS } from '../db/datasets';

describe('DATASETS', () => {
  it('contains exactly 3 datasets', () => {
    expect(DATASETS).toHaveLength(3);
  });

  it('each dataset has an id, name, tables, and starter queries', () => {
    for (const ds of DATASETS) {
      expect(ds.id).toBeTruthy();
      expect(ds.name).toBeTruthy();
      expect(ds.tables.length).toBeGreaterThan(0);
      expect(ds.starterQueries.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('each table has a name, csvPath, and columns', () => {
    for (const ds of DATASETS) {
      for (const table of ds.tables) {
        expect(table.name).toBeTruthy();
        expect(table.csvPath).toMatch(/\.csv$/);
        expect(table.columns.length).toBeGreaterThan(0);
      }
    }
  });

  it('each column has a name and valid type', () => {
    const validTypes = ['string', 'number', 'date'];
    for (const ds of DATASETS) {
      for (const table of ds.tables) {
        for (const col of table.columns) {
          expect(col.name).toBeTruthy();
          expect(validTypes).toContain(col.type);
        }
      }
    }
  });

  it('starter queries have label and sql', () => {
    for (const ds of DATASETS) {
      for (const q of ds.starterQueries) {
        expect(q.label).toBeTruthy();
        expect(q.sql).toContain('SELECT');
      }
    }
  });
});
