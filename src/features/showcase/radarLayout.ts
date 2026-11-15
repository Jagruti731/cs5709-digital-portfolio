/**
 * @file Places the tech radar dots (CR-43). Pure maths, so it is unit tested.
 *
 * The radar has four quadrants (kinds of technology) and three rings (core, growing, learning now).
 * Items that share a quadrant and ring are spread evenly across the quadrant's angle, and alternate
 * between an inner and outer track when there are more than two, so labels do not collide.
 */
export const RADAR = { size: 520, centre: 260, rings: [0, 110, 185, 250] } as const;

/** Quadrant angle ranges in degrees (0 = right, clockwise): top-left, top-right, bottom-right, bottom-left. */
const QUADRANT_ANGLES: [number, number][] = [
  [180, 270],
  [270, 360],
  [0, 90],
  [90, 180],
];

export interface Blip {
  name: string;
  ring: number;
  quadrant: number;
  x: number;
  y: number;
}

export function placeBlips(items: [string, number, number][]): Blip[] {
  const groups = new Map<string, [string, number, number][]>();
  for (const item of items) {
    const key = `${item[1]}-${item[2]}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const blips: Blip[] = [];
  for (const group of groups.values()) {
    group.forEach(([name, quadrant, ring], i) => {
      const [from, to] = QUADRANT_ANGLES[quadrant % 4];
      const angle = ((from + ((i + 1) * (to - from)) / (group.length + 1)) * Math.PI) / 180;
      const inner = RADAR.rings[ring];
      const outer = RADAR.rings[ring + 1];
      const track = group.length > 2 ? (i % 2 ? 0.68 : 0.36) : 0.52;
      const r = inner + (outer - inner) * track;
      blips.push({ name, ring, quadrant, x: RADAR.centre + r * Math.cos(angle), y: RADAR.centre + r * Math.sin(angle) });
    });
  }
  return blips;
}
