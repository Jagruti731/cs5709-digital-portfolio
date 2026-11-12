/**
 * @file A small full-text search engine: ranked, typo-tolerant, field-weighted (CR-21, innovation).
 *
 * Phase 1 search was `haystack.includes(query)`: one exact substring, no
 * ranking, no typo tolerance, and pages and case studies only. This module
 * implements the information-retrieval approach used for automated concept
 * location (Marcus et al., 2004; Rajlich & Wilde, 2002):
 *
 *  1. Tokenise every document into terms (lower case, split camelCase, drop stop words).
 *  2. Build an inverted index: term -> the documents and fields it occurs in.
 *  3. Rank with BM25 (Robertson & Zaragoza, 2009), weighting title > tags > body.
 *  4. Expand each query term with prefix matches (search as you type) and
 *     near misses within a small edit distance (Levenshtein, 1966), scored lower.
 *  5. Return the matched terms so the page can highlight them.
 *
 * No library is used, so every step can be read, tested and explained.
 */

export interface SearchDoc {
  id: string;
  kind: string;
  title: string;
  /** Where the result links to: a route (/knowledge?case=ocr) or a full URL. */
  to: string;
  /** Short text shown under the title. */
  text: string;
  tags?: string[];
  /** Longer text that is searched but not shown. */
  body?: string;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
  /** Index terms that matched; used for highlighting. */
  terms: string[];
}

export interface SearchResult {
  hits: SearchHit[];
  /** Set when a query word was not found and a close word was used instead ("did you mean"). */
  corrected: string | null;
}

type Field = 'title' | 'tags' | 'body';
const FIELD_WEIGHT: Record<Field, number> = { title: 3, tags: 2, body: 1 };
const BM25_K1 = 1.2;
const BM25_B = 0.75;
const PREFIX_WEIGHT = 0.7;
const FUZZY_WEIGHT = 0.5;
const MIN_PREFIX = 2;

const STOP_WORDS = new Set(
  'a an and are as at be by for from has have i in is it its me my of on or our so that the this to was we with you your what how where which who'.split(
    ' ',
  ),
);

/** Splits text into search terms. "useChat, C# and .NET" -> ["use", "chat", "c#", ".net"] */
export function tokenize(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
    .toLowerCase()
    .split(/[^a-z0-9#+.]+/)
    .map((t) => t.replace(/^\.+(?![a-z])|\.+$/g, '')) // keep ".net", drop sentence dots
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/** Edit distance between two words, stopping early once it exceeds `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, row[j]);
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

interface Posting {
  doc: number;
  field: Field;
  tf: number;
}

export interface SearchIndex {
  docs: SearchDoc[];
  postings: Map<string, Posting[]>;
  fieldLength: Record<Field, number[]>;
  averageLength: Record<Field, number>;
}

/** Builds the inverted index once; searching it is then fast. */
export function buildIndex(docs: SearchDoc[]): SearchIndex {
  const postings = new Map<string, Posting[]>();
  const fieldLength: Record<Field, number[]> = { title: [], tags: [], body: [] };
  docs.forEach((d, doc) => {
    const fields: Record<Field, string> = { title: d.title, tags: (d.tags ?? []).join(' '), body: `${d.text} ${d.body ?? ''}` };
    for (const field of Object.keys(fields) as Field[]) {
      const terms = tokenize(fields[field]);
      fieldLength[field][doc] = terms.length;
      const counts = new Map<string, number>();
      for (const t of terms) counts.set(t, (counts.get(t) ?? 0) + 1);
      for (const [term, tf] of counts) {
        if (!postings.has(term)) postings.set(term, []);
        postings.get(term)!.push({ doc, field, tf });
      }
    }
  });
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length) || 1;
  return {
    docs,
    postings,
    fieldLength,
    averageLength: { title: avg(fieldLength.title), tags: avg(fieldLength.tags), body: avg(fieldLength.body) },
  };
}

/** Index terms that a query word should match, each with a weight (1 = exact). */
export function expandTerm(index: SearchIndex, word: string): [string, number][] {
  if (index.postings.has(word)) {
    const prefixed = [...index.postings.keys()]
      .filter((t) => t !== word && t.startsWith(word))
      .map((t): [string, number] => [t, PREFIX_WEIGHT]);
    return [[word, 1], ...prefixed];
  }
  const out: [string, number][] = [];
  const maxEdits = word.length <= 4 ? 1 : 2;
  for (const term of index.postings.keys()) {
    if (word.length >= MIN_PREFIX && term.startsWith(word)) out.push([term, PREFIX_WEIGHT]);
    else if (word.length > 3 && editDistance(word, term, maxEdits) <= maxEdits) out.push([term, FUZZY_WEIGHT]);
  }
  return out;
}

/** BM25 score of one term occurrence. */
function bm25(index: SearchIndex, p: Posting, docFreq: number): number {
  const n = index.docs.length;
  const idf = Math.log(1 + (n - docFreq + 0.5) / (docFreq + 0.5));
  const len = index.fieldLength[p.field][p.doc] / index.averageLength[p.field];
  return idf * ((p.tf * (BM25_K1 + 1)) / (p.tf + BM25_K1 * (1 - BM25_B + BM25_B * len)));
}

/** The word to suggest instead of `word`, when it was only found through a near miss. */
function correctionFor(index: SearchIndex, word: string, expansions: [string, number][]): string {
  if (index.postings.has(word) || expansions.some(([, w]) => w === PREFIX_WEIGHT)) return word;
  const best = expansions.filter(([, w]) => w === FUZZY_WEIGHT).sort((a, b) => editDistance(word, a[0]) - editDistance(word, b[0]))[0];
  return best ? best[0] : word;
}

interface Tally {
  score: number;
  terms: Set<string>;
  words: number;
}

/** Adds the score of one query word to every document it matches. */
function scoreWord(index: SearchIndex, expansions: [string, number][], tally: Map<number, Tally>) {
  const hit = new Set<number>();
  for (const [term, weight] of expansions) {
    const list = index.postings.get(term)!;
    const docFreq = new Set(list.map((p) => p.doc)).size;
    for (const p of list) {
      const t = tally.get(p.doc) ?? { score: 0, terms: new Set<string>(), words: 0 };
      t.score += bm25(index, p, docFreq) * FIELD_WEIGHT[p.field] * weight;
      t.terms.add(term);
      tally.set(p.doc, t);
      hit.add(p.doc);
    }
  }
  for (const doc of hit) tally.get(doc)!.words += 1;
}

/**
 * Searches the index. Every query word must match something (AND), so adding
 * words narrows the results, as visitors expect.
 */
export function search(index: SearchIndex, query: string, limit = 50): SearchResult {
  const words = tokenize(query);
  if (words.length === 0) return { hits: [], corrected: null };
  const tally = new Map<number, Tally>();
  const corrections = words.map((word) => {
    const expansions = expandTerm(index, word);
    scoreWord(index, expansions, tally);
    return correctionFor(index, word, expansions);
  });
  const hits = [...tally.entries()]
    .filter(([, t]) => t.words === words.length)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)
    .map(([doc, t]) => ({ doc: index.docs[doc], score: t.score, terms: [...t.terms] }));
  const corrected = corrections.join(' ');
  return { hits, corrected: corrected !== words.join(' ') ? corrected : null };
}

export interface Segment {
  text: string;
  match: boolean;
}

/** Splits `text` into plain and matching parts, so matches can be wrapped in <mark>. */
export function highlight(text: string, terms: string[]): Segment[] {
  const words = terms.filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (words.length === 0) return [{ text, match: false }];
  const pattern = new RegExp(`(${words.sort((a, b) => b.length - a.length).join('|')})`, 'gi');
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, match: pattern.test(part) && (pattern.lastIndex = 0) === 0 }));
}
