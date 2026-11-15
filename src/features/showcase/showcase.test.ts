import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { highlight } from './highlight';
import { placeBlips, RADAR } from './radarLayout';

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

describe('placeBlips', () => {
  const dist = (b: { x: number; y: number }) => Math.hypot(b.x - RADAR.centre, b.y - RADAR.centre);
  it('keeps every dot inside its own ring', () => {
    const blips = placeBlips([
      ['a', 0, 0],
      ['b', 1, 1],
      ['c', 2, 2],
    ]);
    blips.forEach((b) => {
      expect(dist(b)).toBeGreaterThan(RADAR.rings[b.ring]);
      expect(dist(b)).toBeLessThan(RADAR.rings[b.ring + 1]);
    });
  });
  it('puts each dot in its quadrant', () => {
    const [tl, tr, br, bl] = placeBlips([
      ['tl', 0, 1],
      ['tr', 1, 1],
      ['br', 2, 1],
      ['bl', 3, 1],
    ]);
    expect(tl.x < RADAR.centre && tl.y < RADAR.centre).toBe(true);
    expect(tr.x > RADAR.centre && tr.y < RADAR.centre).toBe(true);
    expect(br.x > RADAR.centre && br.y > RADAR.centre).toBe(true);
    expect(bl.x < RADAR.centre && bl.y > RADAR.centre).toBe(true);
  });
  it('places every item of the real radar, with no two dots on the same spot', () => {
    const data = JSON.parse(readFileSync(new URL('../../../public/data/showcase.json', import.meta.url), 'utf8'));
    const blips = placeBlips(data.radar.items);
    expect(blips).toHaveLength(data.radar.items.length);
    const spots = new Set(blips.map((b) => `${Math.round(b.x)},${Math.round(b.y)}`));
    expect(spots.size).toBe(blips.length);
  });
});
