/**
 * @file Pure helpers for the "Evolution" section on Home (CR-40): counts of change requests by maintenance type
 * (Lientz and Swanson, 1980) and by phase, taken from changelog.json.
 */
import type { Change } from '../../types/content';

export const MAINTENANCE_TYPES = ['corrective', 'adaptive', 'perfective', 'preventive'] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export interface TypeShare {
  type: MaintenanceType;
  count: number;
  percent: number;
}

/** Counts the change requests of each maintenance type; percentages are of all counted changes. */
export function countByType(changes: Change[]): TypeShare[] {
  const known = changes.filter((c): c is Change & { type: MaintenanceType } => (MAINTENANCE_TYPES as readonly string[]).includes(c.type));
  return MAINTENANCE_TYPES.map((type) => {
    const count = known.filter((c) => c.type === type).length;
    return { type, count, percent: known.length ? Math.round((count / known.length) * 100) : 0 };
  });
}

/** The newest `n` changes, newest first. */
export const latest = (changes: Change[], n: number): Change[] => changes.slice(-n).reverse();
