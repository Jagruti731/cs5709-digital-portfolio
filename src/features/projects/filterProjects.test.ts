/**
 * @file Tests for the case-study filter on the Professional Knowledge page.
 */
import { expect, it } from 'vitest';
import type { CaseStudy } from '../../types/content';
import { ALL, filterCases, technologies } from './filterProjects';

const make = (id: string, tools: string[], summary = ''): CaseStudy => ({
  id,
  title: id,
  tools,
  summary,
  image: '',
  kind: '',
  meta: '',
  problem: '',
  did: [],
});
const cases = [
  make('loan', ['.NET', 'OCR'], 'vehicle loans'),
  make('ocr', ['C#', 'OCR', 'Gemini'], 'bank statements'),
  make('lex', ['React']),
];

it('lists technologies by how often they are used', () => {
  expect(technologies(cases)[0]).toBe('OCR');
  expect(technologies(cases)).toHaveLength(5);
});

it('filters by technology and by every word of the text', () => {
  expect(filterCases(cases, 'OCR', '').map((c) => c.id)).toEqual(['loan', 'ocr']);
  expect(filterCases(cases, ALL, 'bank STATEMENTS').map((c) => c.id)).toEqual(['ocr']);
  expect(filterCases(cases, 'React', 'bank')).toEqual([]);
  expect(filterCases(cases, ALL, '   ')).toHaveLength(3);
});
