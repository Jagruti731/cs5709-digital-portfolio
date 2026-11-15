/**
 * @file Tests for the README renderer used by the Readme page.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { decodeEntities, renderMarkdown, sitePath, slug } from './markdown';

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

it('shows quotes and apostrophes in the table of contents as characters, not entities', () => {
  const { headings } = renderMarkdown('## An engineer\'s "portfolio" & more');
  expect(headings[0].text).toBe('An engineer\'s "portfolio" & more');
  expect(decodeEntities('&lt;b&gt;')).toBe('<b>');
});

it('ships every README diagram as valid SVG markup (so it displays as an image)', () => {
  const svgs = readdirSync(new URL('../../../public/diagrams/', import.meta.url)).filter(
    (f) => f.endsWith('-v2.svg') || ['pipeline.svg', 'flow-content.svg'].includes(f),
  );
  for (const f of svgs) {
    const text = readFileSync(new URL(`../../../public/diagrams/${f}`, import.meta.url), 'utf8');
    const svgTag = text.slice(0, text.indexOf('>'));
    expect(svgTag.match(/ style="/g)?.length ?? 0).toBeLessThanOrEqual(1);
    expect(text.includes('<foreignObject')).toBe(false);
  }
});
