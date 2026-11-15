import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { highlight } from './highlight';
import { countLevels, matches, trendCoverage } from './stackFilter';

describe('highlight', () => {
  it('marks text between stars', () => {
    expect(highlight('One platform. *15 people.* More')).toEqual([
      { text: 'One platform. ', em: false },
      { text: '15 people.', em: true },
      { text: ' More', em: false },
    ]);
  });
  it('handles text with no stars and a leading star', () => {
    expect(highlight('plain')).toEqual([{ text: 'plain', em: false }]);
    expect(highlight('*all*')).toEqual([{ text: 'all', em: true }]);
  });
});

describe('tech stack', () => {
  const data = JSON.parse(readFileSync(new URL('../../../public/data/showcase.json', import.meta.url), 'utf8'));
  it('matches every item when no trend is picked, and only tagged items otherwise', () => {
    expect(matches([], null)).toBe(true);
    expect(matches(['llm'], 'llm')).toBe(true);
    expect(matches(['llm'], 'agentic')).toBe(false);
  });
  it('counts the technologies per level', () => {
    const c = countLevels(data.stack);
    const all = data.stack.layers.reduce((n: number, l: { items: unknown[] }) => n + l.items.length, 0);
    expect(c.core + c.grow + c.learn).toBe(all);
    expect(c.core).toBeGreaterThan(c.learn);
  });
  it('backs every trend with at least two technologies', () => {
    Object.values(trendCoverage(data.stack)).forEach((n) => expect(n).toBeGreaterThanOrEqual(2));
  });
  it('uses only known levels and trends', () => {
    const trends = new Set(data.stack.trends.map((t: { id: string }) => t.id));
    data.stack.layers.forEach((l: { items: [string, string, string[]][] }) =>
      l.items.forEach(([, level, ts]) => {
        expect(['core', 'grow', 'learn']).toContain(level);
        ts.forEach((t) => expect(trends.has(t)).toBe(true));
      }),
    );
  });
});
