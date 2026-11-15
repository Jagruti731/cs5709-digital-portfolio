/**
 * @file Pure helpers for the tech stack section (CR-46): which technologies match a trend,
 * and how many technologies sit at each level. Unit tested.
 */
import type { Showcase, StackLevel } from '../../types/content';

type Stack = Showcase['stack'];

/** True when the item belongs to the selected trend, or when no trend is selected. */
export const matches = (trends: string[], selected: string | null): boolean => selected === null || trends.includes(selected);

/** Number of technologies per level, across every layer. */
export function countLevels(stack: Stack): Record<StackLevel, number> {
  const counts: Record<StackLevel, number> = { core: 0, grow: 0, learn: 0 };
  stack.layers.forEach((layer) => layer.items.forEach(([, level]) => (counts[level] += 1)));
  return counts;
}

/** Number of technologies that back each trend, so every trend shown has real evidence in the stack. */
export function trendCoverage(stack: Stack): Record<string, number> {
  const cover: Record<string, number> = Object.fromEntries(stack.trends.map((t) => [t.id, 0]));
  stack.layers.forEach((layer) =>
    layer.items.forEach(([, , trends]) =>
      trends.forEach((t) => {
        if (t in cover) cover[t] += 1;
      }),
    ),
  );
  return cover;
}
