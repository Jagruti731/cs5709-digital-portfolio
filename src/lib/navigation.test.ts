/**
 * @file Checks on the page list that drives the router, the menu and search.
 */
import { expect, it } from 'vitest';
import { pages } from './navigation';

it('has unique ids and paths', () => {
  expect(new Set(pages.map((p) => p.id)).size).toBe(pages.length);
  expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
});

it('includes every page the brief asks for, in the menu', () => {
  const inMenu = pages.filter((p) => p.inNav).map((p) => p.id);
  for (const id of ['home', 'about', 'education', 'knowledge', 'gallery', 'videos', 'blog', 'messages', 'readme'])
    expect(inMenu).toContain(id);
});
