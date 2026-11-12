/**
 * @file Search page: ranked, typo-tolerant search of the whole site, and of the source code (CR-21, innovation).
 *
 * - Site: every page, case study, project, skill, article, qualification, job, picture and video.
 * - Source code: concept location. Type a concept ("skip link", "comment author") to find the files
 *   that implement it; each result opens the file on GitHub.
 * Results are ranked (BM25), filtered by type, and matches are highlighted.
 * The query lives in the URL (/search?q=...), so a search can be shared or bookmarked.
 */
import { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { highlight, type SearchHit } from '../features/search/searchIndex';
import { useSearch, type Scope } from '../features/search/useSearch';

const EXAMPLES: Record<Scope, string[]> = {
  site: ['OCR', 'Limerick', 'Lehman', 'Gemni', '.NET microservices'],
  code: ['skip link', 'comment author', 'lazy', 'BroadcastChannel', 'coverage'],
};

function Marked({ text, terms }: { text: string; terms: string[] }) {
  return <>{highlight(text, terms).map((s, i) => (s.match ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>))}</>;
}

/** Scope tabs, the search box and example queries. */
function SearchControls({
  scope,
  query,
  onChange,
  autoFocus,
}: {
  scope: Scope;
  query: string;
  onChange: (next: { q?: string; in?: Scope }) => void;
  /** Only when opened with the "/" shortcut; otherwise focus is not moved (inspection D9). */
  autoFocus: boolean;
}) {
  const site = scope === 'site';
  return (
    <>
      <div className="tabs" role="tablist" aria-label="What to search">
        <button role="tab" type="button" aria-selected={site} onClick={() => onChange({ in: 'site' })}>
          This site
        </button>
        <button role="tab" type="button" aria-selected={!site} onClick={() => onChange({ in: 'code' })}>
          Source code (concept location)
        </button>
      </div>
      <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="q">{site ? 'Search the portfolio' : 'Find the code for a concept'}</label>
        <input
          id="q"
          type="search"
          value={query}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder={site ? 'e.g. OCR, Limerick, Lehman' : 'e.g. skip link, comment author'}
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </form>
      <p className="note examples">
        Try:{' '}
        {EXAMPLES[scope].map((ex) => (
          <button key={ex} type="button" className="text-btn" onClick={() => onChange({ q: ex })}>
            {ex}
          </button>
        ))}
      </p>
    </>
  );
}

/** The ranked results, with matches highlighted. Code results open the file on GitHub. */
function ResultList({ hits }: { hits: SearchHit[] }) {
  return (
    <ol className="results">
      {hits.map((h) => (
        <li key={h.doc.id}>
          <span className="kind">{h.doc.kind}</span>
          {h.doc.to.startsWith('http') ? (
            <a href={h.doc.to} target="_blank" rel="noopener">
              <Marked text={h.doc.title} terms={h.terms} />
            </a>
          ) : (
            <Link to={h.doc.to}>
              <Marked text={h.doc.title} terms={h.terms} />
            </Link>
          )}
          <p>
            <Marked text={h.doc.text} terms={h.terms} />
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Result counts per type, most common first. */
const countKinds = (hits: SearchHit[]) => {
  const counts = new Map<string, number>();
  for (const h of hits) counts.set(h.doc.kind, (counts.get(h.doc.kind) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

export default function Search() {
  const [params, setParams] = useSearchParams();
  const focusSearch = (useLocation().state as { focusSearch?: boolean } | null)?.focusSearch;
  const query = params.get('q') ?? '';
  const scope: Scope = params.get('in') === 'code' ? 'code' : 'site';
  const [kind, setKind] = useState('All');
  const { hits, corrected, total, codeCommit } = useSearch(scope, query);

  const update = (next: { q?: string; in?: Scope }) => {
    const q = next.q ?? query;
    const s = next.in ?? scope;
    setParams({ ...(q ? { q } : {}), ...(s === 'code' ? { in: 'code' } : {}) }, { replace: true });
    setKind('All');
  };

  const kinds = useMemo(() => countKinds(hits), [hits]);
  const shown = kind === 'All' ? hits : hits.filter((h) => h.doc.kind === kind);

  return (
    <>
      <PageHeader
        title="Search"
        crumb="Search"
        intro="Ranked search with typo tolerance. Search the site, or switch to the source code to find where a feature is implemented."
      />
      <Section>
        <SearchControls scope={scope} query={query} onChange={update} autoFocus={Boolean(focusSearch)} />

        {corrected && (
          <p className="note">
            No exact match. Showing results for{' '}
            <button type="button" className="text-btn" onClick={() => update({ q: corrected })}>
              <b>{corrected}</b>
            </button>
            .
          </p>
        )}

        {query.trim() && (
          <>
            <div className="filters" role="group" aria-label="Filter results by type">
              {[['All', hits.length] as const, ...kinds].map(([k, n]) => (
                <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
                  {k} ({n})
                </button>
              ))}
            </div>
            <p className="note" aria-live="polite">
              {shown.length} {shown.length === 1 ? 'result' : 'results'} from {total}{' '}
              {scope === 'site' ? 'items' : `files (commit ${codeCommit ?? '…'})`}
            </p>
          </>
        )}

        <ResultList hits={shown} />
        {query.trim() && hits.length === 0 && <p className="muted">Nothing found. Check the spelling or try a shorter word.</p>}
      </Section>
    </>
  );
}
