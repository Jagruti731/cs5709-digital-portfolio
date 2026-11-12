import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { useContent } from '../hooks/useContent';
import { pages } from '../lib/navigation';
import type { CaseStudy } from '../types/content';

interface Entry {
  to: string;
  title: string;
  text: string;
  kind: string;
  haystack: string;
}

// Index every page and case study.
const buildIndex = (caseStudies: CaseStudy[]): Entry[] =>
  [
    ...pages
      .filter((p) => p.id !== 'search')
      .map((p) => ({
        to: p.path,
        title: p.title,
        text: p.description,
        kind: 'page',
        haystack: [p.title, p.description, ...p.keywords].join(' '),
      })),
    ...caseStudies.map((c) => ({
      to: `/knowledge?case=${c.id}`,
      title: c.title,
      text: c.summary,
      kind: 'case study',
      haystack: [c.id, c.title, c.kind, c.summary, c.problem, ...c.did, ...c.tools].join(' '),
    })),
  ].map((e) => ({ ...e, haystack: e.haystack.toLowerCase() }));

export default function Search() {
  const { data } = useContent('projects');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const index = useMemo(() => buildIndex(data?.caseStudies ?? []), [data]);
  const results = useMemo(() => (q ? index.filter((e) => e.haystack.includes(q)) : index), [q, index]);

  return (
    <>
      <PageHeader title="Search" crumb="Search" intro="Find a page or a case study." />
      <Section>
        <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="q">Search the portfolio</label>
          <input
            id="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. OCR, Limerick, Lehman"
            autoComplete="off"
          />
        </form>
        <p className="note" aria-live="polite">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
        <ul className="results">
          {results.map((r) => (
            <li key={r.to}>
              <span className="kind">{r.kind}</span>
              <Link to={r.to}>{r.title}</Link>
              <p>{r.text}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
