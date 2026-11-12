/**
 * @file GitHubPanel: live GitHub activity (CR-22, innovation; user story US3).
 *
 * Shows, straight from the GitHub REST API on every visit:
 *  - account summary and the languages of my public repositories
 *  - the repositories, filterable by language and sortable
 *  - the latest runs of this site's CI/CD pipeline, with their result
 *  - the latest commits to this site
 */
import { useMemo, useState } from 'react';
import { LoadState } from '../../components/LoadState';
import { GITHUB } from '../../config/site';
import { shortDate } from '../../lib/ids';
import { languageCounts, runLabel, successRate, type GitHubRepo, type WorkflowRun } from '../../services/githubApi';
import { useGitHub } from './useGitHub';

type Sort = 'updated' | 'stars' | 'name';
const SORTS: Record<Sort, (a: GitHubRepo, b: GitHubRepo) => number> = {
  updated: (a, b) => b.updated_at.localeCompare(a.updated_at),
  stars: (a, b) => b.stargazers_count - a.stargazers_count,
  name: (a, b) => a.name.localeCompare(b.name),
};

function LanguageBars({ repos }: { repos: GitHubRepo[] }) {
  const counts = languageCounts(repos);
  const max = Math.max(1, ...counts.map(([, n]) => n));
  return (
    <ul className="bars" aria-label="Repositories per language">
      {counts.map(([lang, n]) => (
        <li key={lang}>
          <span>{lang}</span>
          <span className="bar" style={{ width: `${(n / max) * 100}%` }} />
          <b>{n}</b>
        </li>
      ))}
    </ul>
  );
}

function Runs({ runs }: { runs: WorkflowRun[] }) {
  if (runs.length === 0) return <p className="note">No pipeline runs yet. They appear here after the first push to GitHub.</p>;
  return (
    <ol className="runs">
      {runs.map((r) => {
        const label = runLabel(r);
        return (
          <li key={r.id}>
            <span className={`badge ${label.tone}`}>{label.text}</span>
            <a href={r.html_url} target="_blank" rel="noopener">
              #{r.run_number} {r.display_title}
            </a>
            <small>
              {r.head_branch} · {r.head_sha.slice(0, 7)} · {shortDate(r.created_at)}
            </small>
          </li>
        );
      })}
    </ol>
  );
}

export function GitHubPanel() {
  const { status, data, error, refresh } = useGitHub();
  const [lang, setLang] = useState('All');
  const [sort, setSort] = useState<Sort>('updated');
  const repos = useMemo(
    () => (data?.repos ?? []).filter((r) => lang === 'All' || r.language === lang).sort(SORTS[sort]),
    [data, lang, sort],
  );
  if (!data) return <LoadState status={status === 'idle' ? 'loading' : status} error={error} retry={refresh} />;
  const rate = successRate(data.runs);

  return (
    <div className="github">
      <div className="metrics">
        <div className="metric">
          <b>{data.user.public_repos}</b>
          <span>public repositories</span>
        </div>
        <div className="metric">
          <b>{languageCounts(data.repos).length}</b>
          <span>languages</span>
        </div>
        <div className="metric">
          <b>{rate === null ? '–' : `${rate}%`}</b>
          <span>pipeline runs passed</span>
        </div>
        <div className="metric">
          <b>{data.commits[0] ? shortDate(data.commits[0].commit.author.date) : '–'}</b>
          <span>last commit to this site</span>
        </div>
      </div>
      <p className="note">
        Live from the GitHub API for{' '}
        <a href={data.user.html_url} target="_blank" rel="noopener">
          @{data.user.login}
        </a>{' '}
        at {new Date(data.fetchedAt).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
        {data.rateRemaining !== null && ` · ${data.rateRemaining} API requests left this hour`}
        {data.stale && ' · GitHub could not be reached, so this is a saved copy'}.{' '}
        <button className="text-btn" type="button" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? 'Refreshing…' : 'Refresh'}
        </button>
      </p>

      <div className="grid g2 start">
        <section>
          <h2>CI/CD pipeline of this site</h2>
          <Runs runs={data.runs} />
          <p className="note">
            <a href={`${GITHUB.repoUrl}/actions`} target="_blank" rel="noopener">
              All runs on GitHub Actions →
            </a>
          </p>
        </section>
        <section>
          <h2>Languages</h2>
          <LanguageBars repos={data.repos} />
          <h2>Latest commits</h2>
          <ol className="commits">
            {data.commits.map((c) => (
              <li key={c.sha}>
                <a href={c.html_url} target="_blank" rel="noopener">
                  <code>{c.sha.slice(0, 7)}</code>
                </a>{' '}
                {c.commit.message.split('\n')[0]}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <h2>Repositories</h2>
      <div className="filter-bar">
        <div className="filters" role="group" aria-label="Filter repositories by language">
          {['All', ...languageCounts(data.repos).map(([l]) => l)].map((l) => (
            <button key={l} type="button" className="chip" aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l}
            </button>
          ))}
        </div>
        <label className="filter-search">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="updated">Last updated</option>
            <option value="stars">Stars</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div className="grid g3">
        {repos.map((r) => (
          <article className="card repo" key={r.id}>
            <h3>
              <a href={r.html_url} target="_blank" rel="noopener">
                {r.name}
              </a>
            </h3>
            <p>{r.description ?? 'No description.'}</p>
            <p className="meta">
              {r.language ?? 'Other'} · ★ {r.stargazers_count} · updated {shortDate(r.updated_at)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
