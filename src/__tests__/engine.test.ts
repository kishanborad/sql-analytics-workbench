import { describe, it, expect } from 'vitest';
import { detectChartType } from '../db/engine';

describe('detectChartType', () => {
  it('returns line for date + number', () => {
    expect(detectChartType(['date', 'number'])).toBe('line');
  });

  it('returns bar for string + number', () => {
    expect(detectChartType(['string', 'number'])).toBe('bar');
  });

  it('returns scatter for two numbers without string', () => {
    expect(detectChartType(['number', 'number'])).toBe('scatter');
  });

  it('returns bar for string + number + number', () => {
    expect(detectChartType(['string', 'number', 'number'])).toBe('bar');
  });

  it('returns line for date + number + number', () => {
    expect(detectChartType(['date', 'number', 'number'])).toBe('line');
  });

  it('returns bar as fallback for string only', () => {
    expect(detectChartType(['string', 'string'])).toBe('bar');
  });
});
