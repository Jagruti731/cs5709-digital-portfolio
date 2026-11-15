import { describe, expect, it } from 'vitest';
import type { Change } from '../../types/content';
import { countByType, latest } from './summary';

const c = (id: string, type: string): Change => ({ id, change: id, type, closes: '—', commit: 'x', phase: 2 }) as Change;

describe('countByType', () => {
  it('counts each maintenance type and gives percentages', () => {
    const r = countByType([c('1', 'corrective'), c('2', 'perfective'), c('3', 'perfective'), c('4', 'preventive')]);
    expect(r.find((x) => x.type === 'perfective')).toEqual({ type: 'perfective', count: 2, percent: 50 });
    expect(r.find((x) => x.type === 'adaptive')?.count).toBe(0);
  });
  it('is safe on an empty list', () => {
    expect(countByType([]).every((x) => x.count === 0 && x.percent === 0)).toBe(true);
  });
  it('ignores unknown types', () => {
    expect(countByType([c('1', 'other')]).reduce((s, x) => s + x.count, 0)).toBe(0);
  });
});

describe('latest', () => {
  it('returns the newest changes first', () => {
    expect(latest([c('1', 'adaptive'), c('2', 'adaptive'), c('3', 'adaptive')], 2).map((x) => x.id)).toEqual(['3', '2']);
  });
});
