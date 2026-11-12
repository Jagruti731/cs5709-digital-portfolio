/**
 * @file Route table: page metadata from lib/navigation.ts joined with the component that renders each page.
 *
 * Every page is loaded lazily (CR-19): React.lazy turns each import into its
 * own JavaScript chunk, which the browser downloads only when that page is
 * first visited. The first visit downloads the shell and the Home page only.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { pages, type PageMeta } from './lib/navigation';

const components: Record<string, LazyExoticComponent<ComponentType>> = {
  home: lazy(() => import('./pages/Home')),
  about: lazy(() => import('./pages/About')),
  education: lazy(() => import('./pages/Education')),
  knowledge: lazy(() => import('./pages/Knowledge')),
  gallery: lazy(() => import('./pages/Gallery')),
  videos: lazy(() => import('./pages/Videos')),
  blog: lazy(() => import('./pages/Blog')),
  messages: lazy(() => import('./pages/Messages')),
  search: lazy(() => import('./pages/Search')),
  readme: lazy(() => import('./pages/Readme')),
  dashboard: lazy(() => import('./pages/Dashboard')),
};

export const NotFound = lazy(() => import('./pages/NotFound'));

export interface AppRoute extends PageMeta {
  Component: LazyExoticComponent<ComponentType>;
}

/** Page metadata joined with the lazily loaded component that renders each page. */
export const routes: AppRoute[] = pages.map((p) => ({ ...p, Component: components[p.id] }));
