import { describe, it, expect } from 'vitest';
import { detectChartType } from '../db/engine';

describe('detectChartType', () => {
  it('date + number => line', () => {
    expect(detectChartType(['date', 'number'])).toBe('line');
  });

  it('string + number => bar', () => {
    expect(detectChartType(['string', 'number'])).toBe('bar');
  });

  it('number + number => scatter', () => {
    expect(detectChartType(['number', 'number'])).toBe('scatter');
  });

  it('date + number + number => line', () => {
    expect(detectChartType(['date', 'number', 'number'])).toBe('line');
  });

  it('string + number + number => bar (string takes priority)', () => {
    expect(detectChartType(['string', 'number', 'number'])).toBe('bar');
  });

  it('string + string => bar fallback', () => {
    expect(detectChartType(['string', 'string'])).toBe('bar');
  });

  it('number only => bar fallback', () => {
    expect(detectChartType(['number'])).toBe('bar');
  });
});
