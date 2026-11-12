/**
 * @file Tests for the search engine (CR-21).
 */
import { describe, expect, it } from 'vitest';
import { buildIndex, editDistance, expandTerm, highlight, search, tokenize, type SearchDoc } from './searchIndex';

const docs: SearchDoc[] = [
  {
    id: 'ocr',
    kind: 'case study',
    title: 'Bank statement extraction pipeline',
    to: '/k?case=ocr',
    text: 'Reads PDF statements with OCR and Gemini',
    tags: ['C#', 'OCR', 'Gemini'],
  },
  {
    id: 'loan',
    kind: 'case study',
    title: 'Vehicle loan origination',
    to: '/k?case=loan',
    text: 'A .NET microservices platform. Documents are checked with OCR in a pipeline.',
    tags: ['.NET', 'OCR'],
  },
  { id: 'edu', kind: 'page', title: 'Education', to: '/education', text: 'MSc Software Engineering at the University of Limerick' },
  {
    id: 'chat',
    kind: 'code',
    title: 'src/features/chat/useChat.ts',
    to: '#',
    text: 'useChat: instant messaging logic',
    tags: ['useChat', 'appendMessage'],
  },
];
const index = buildIndex(docs);

describe('tokenize', () => {
  it('splits camelCase, keeps .NET and C#, drops stop words', () => {
    expect(tokenize('useChat in the .NET and C# world.')).toEqual(['use', 'chat', '.net', 'c#', 'world']);
  });
});

describe('editDistance', () => {
  it('counts insertions, deletions and substitutions', () => {
    expect(editDistance('limerik', 'limerick')).toBe(1);
    expect(editDistance('gemnii', 'gemini')).toBe(2);
    expect(editDistance('abc', 'xyzxyz')).toBe(3);
  });
});

describe('search', () => {
  it('ranks a title match above a body match', () => {
    const { hits } = search(index, 'pipeline');
    expect(hits.map((h) => h.doc.id)).toEqual(['ocr', 'loan']);
    expect(hits[0].score).toBeGreaterThan(hits[1].score);
  });

  it('requires every word (AND)', () => {
    expect(search(index, 'ocr microservices').hits.map((h) => h.doc.id)).toEqual(['loan']);
  });

  it('matches as you type (prefix)', () => {
    expect(search(index, 'limer').hits[0].doc.id).toBe('edu');
    expect(expandTerm(index, 'gem')).toContainEqual(['gemini', 0.7]);
  });

  it('tolerates typos and suggests the correction', () => {
    const result = search(index, 'limerik');
    expect(result.hits[0].doc.id).toBe('edu');
    expect(result.corrected).toBe('limerick');
  });

  it('finds code by an identifier split from camelCase', () => {
    expect(search(index, 'append message').hits[0].doc.id).toBe('chat');
  });

  it('returns nothing for empty or unknown queries', () => {
    expect(search(index, '   ').hits).toEqual([]);
    expect(search(index, 'zzzzqqq').hits).toEqual([]);
  });
});

describe('highlight', () => {
  it('marks every matching term, ignoring case', () => {
    const parts = highlight('OCR reads PDFs; ocr is fast', ['ocr']);
    expect(parts.filter((p) => p.match).map((p) => p.text)).toEqual(['OCR', 'ocr']);
    expect(parts.map((p) => p.text).join('')).toBe('OCR reads PDFs; ocr is fast');
  });
});
