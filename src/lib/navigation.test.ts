/**
 * @file Checks on the page list that drives the router, the menu and search.
 */
import { expect, it } from 'vitest';
import { pages } from './navigation';

it('has unique ids and paths', () => {
  expect(new Set(pages.map((p) => p.id)).size).toBe(pages.length);
  expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
});

it('keeps the menu short and still has every page the brief asks for (CR-30)', () => {
  const inMenu = pages.filter((p) => p.inNav).map((p) => p.id);
  expect(inMenu).toEqual(['home', 'about', 'education', 'knowledge', 'gallery', 'blog', 'messages']);
  // Readme (required by the brief) and Dashboard are pages too, linked from the footer.
  for (const id of ['readme', 'dashboard']) expect(pages.some((p) => p.id === id && !p.inNav)).toBe(true);
});
