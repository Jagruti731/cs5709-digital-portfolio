/**
 * @file useStoredState: useState that is also saved in localStorage.
 * Storage can be blocked (private mode, full quota), so every access is guarded and the value falls back to memory.
 */
import { useEffect, useState } from 'react';

/** useState that is also saved in localStorage. Storage can be blocked, so every access is guarded. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: keep the value in memory only */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
