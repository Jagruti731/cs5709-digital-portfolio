import { useEffect } from 'react';
import { useStoredState } from '../hooks/useStoredState';

/** Light/dark switch. With no saved choice the site follows the operating system setting. */
export function ThemeToggle() {
  const [theme, setTheme] = useStoredState<'light' | 'dark' | null>('jb.theme', null);
  const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme ? theme === 'dark' : systemDark;

  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
    // Legacy pages from the starter still read the Tailwind "dark" class.
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme, isDark]);

  return (
    <button className="icon-btn" type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
