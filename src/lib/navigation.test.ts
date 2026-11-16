/**
 * @file Checks on the page list that drives the router, the menu and search.
 */
import { expect, it } from 'vitest';
import { pages } from './navigation';

it('has unique ids and paths', () => {
  expect(new Set(pages.map((p) => p.id)).size).toBe(pages.length);
  expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
});

it('keeps the menu short and still has every page the brief asks for (CR-30, CR-33, CR-57)', () => {
  const inMenu = pages.filter((p) => p.inNav).map((p) => p.id);
  expect(inMenu).toEqual(['home', 'about', 'knowledge', 'gallery', 'blog', 'messages', 'dashboard']);
  // Readme (required by the brief) is a page too, reached by its address; Dashboard is in the menu (CR-57).
  expect(pages.some((p) => p.id === 'readme' && !p.inNav)).toBe(true);
});
