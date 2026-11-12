/**
 * @file Filtering case studies by technology and by free text (CR-20).
 * Pure functions, so the rules are unit-tested apart from the page.
 */
import type { CaseStudy } from '../../types/content';

export const ALL = 'All';

/** Every tool used in at least one case study, most used first, then A–Z. */
export function technologies(cases: CaseStudy[]): string[] {
  const counts = new Map<string, number>();
  for (const c of cases) for (const t of c.tools) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
}

/** Case studies that use `tech` (or any, for ALL) and contain every word of `text`. */
export function filterCases(cases: CaseStudy[], tech: string, text: string): CaseStudy[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return cases.filter((c) => {
    if (tech !== ALL && !c.tools.includes(tech)) return false;
    const haystack = [c.title, c.kind, c.summary, c.problem, ...c.did, ...c.tools].join(' ').toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}
