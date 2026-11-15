/**
 * @file Route table: page metadata from lib/navigation.ts joined with the component that renders each page.
 *
 * Every page is loaded lazily (CR-19): React.lazy turns each import into its
 * own JavaScript chunk, which the browser downloads only when that page is
 * first visited. The first visit downloads the shell and the Home page only.
 * CR-44: once the first page is idle, the other pages are downloaded in the background.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { pages, type PageMeta } from './lib/navigation';

const loaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  home: () => import('./pages/Home'),
  about: () => import('./pages/About'),
  knowledge: () => import('./pages/Knowledge'),
  gallery: () => import('./pages/Gallery'),
  blog: () => import('./pages/Blog'),
  messages: () => import('./pages/Messages'),
  search: () => import('./pages/Search'),
  readme: () => import('./pages/Readme'),
  dashboard: () => import('./pages/Dashboard'),
};

const components: Record<string, LazyExoticComponent<ComponentType>> = Object.fromEntries(
  Object.entries(loaders).map(([id, load]) => [id, lazy(load)]),
);

/**
 * Downloads every page chunk in the background (CR-44), so moving between pages never waits
 * for a download. Called once the first page is idle; each import is cached by the browser.
 */
export function preloadPages(): void {
  Object.values(loaders).forEach((load) => void load().catch(() => undefined));
}

export const NotFound = lazy(() => import('./pages/NotFound'));

export interface AppRoute extends PageMeta {
  Component: LazyExoticComponent<ComponentType>;
}

/** Page metadata joined with the lazily loaded component that renders each page. */
export const routes: AppRoute[] = pages.map((p) => ({ ...p, Component: components[p.id] }));
