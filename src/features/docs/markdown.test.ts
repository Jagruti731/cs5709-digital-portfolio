/**
 * @file Tests for the README renderer used by the Readme page.
 */
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { renderMarkdown, sitePath, slug } from './markdown';

it('makes stable heading ids', () => {
  expect(slug('2.1 Iteration 3: peer review')).toBe('2-1-iteration-3-peer-review');
});

it('rewrites public/ paths for the built site', () => {
  expect(sitePath('public/diagrams/a.svg')).toBe('./diagrams/a.svg');
  expect(sitePath('https://example.com/a.svg')).toBe('https://example.com/a.svg');
});

it('renders the real README with a table of contents and working image paths', () => {
  const { html, headings } = renderMarkdown(readFileSync(new URL('../../../README.md', import.meta.url), 'utf8'));
  expect(headings.length).toBeGreaterThan(10);
  expect(html).not.toContain('src="public/');
  expect(html).toContain('src="./diagrams/');
});
