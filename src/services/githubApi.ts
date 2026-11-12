/**
 * @file githubApi: live data from the GitHub REST API (CR-22, innovation).
 *
 * The site is static, but this page is live: every visit asks GitHub for my
 * public repositories, the latest runs of this repository's CI/CD pipeline
 * and its latest commits. No token is needed for public data.
 *
 * GitHub allows 60 unauthenticated requests per hour per visitor. To stay well
 * inside that, every response is stored with its ETag; the next visit sends
 * If-None-Match, and an unchanged answer comes back as "304 Not Modified",
 * which GitHub does not count against the limit.
 */
import { GITHUB } from '../config/site';

const API = 'https://api.github.com';
const CACHE_PREFIX = 'jb.gh.';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
}

export interface WorkflowRun {
  id: number;
  run_number: number;
  display_title: string;
  event: string;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null | string;
  head_branch: string;
  head_sha: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface Commit {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name: string; date: string } };
}

export interface GitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  /** Empty when the repository has no Actions runs yet. */
  runs: WorkflowRun[];
  commits: Commit[];
  /** Requests left this hour, from the X-RateLimit-Remaining header (null if unknown). */
  rateRemaining: number | null;
  fetchedAt: string;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

interface Cached<T> {
  etag: string;
  data: T;
}

const readCache = <T>(key: string): Cached<T> | null => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_PREFIX + key) ?? 'null') as Cached<T> | null;
  } catch {
    return null;
  }
};

const writeCache = <T>(key: string, value: Cached<T>) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: work without the cache */
  }
};

/** Turns an HTTP failure into a message a visitor understands. */
export function explain(status: number, resetEpochSeconds: string | null): string {
  if (status === 403 || status === 429) {
    const at = resetEpochSeconds
      ? new Date(Number(resetEpochSeconds) * 1000).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
      : 'later';
    return `GitHub's hourly limit for this network has been reached. Try again after ${at}.`;
  }
  if (status === 404) return 'GitHub could not find that account or repository.';
  return `GitHub answered with an error (${status}).`;
}

/**
 * GET one API path, using the ETag cache.
 * @returns the data and the remaining rate limit
 */
export async function getJson<T>(path: string, fetcher: typeof fetch = fetch): Promise<{ data: T; remaining: number | null }> {
  const cached = readCache<T>(path);
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (cached) headers['If-None-Match'] = cached.etag;
  let res: Response;
  try {
    res = await fetcher(`${API}${path}`, { headers });
  } catch {
    if (cached) return { data: cached.data, remaining: null }; // offline: show the last copy
    throw new GitHubError('Could not reach GitHub. Check your connection.', 0);
  }
  const remaining = res.headers.get('x-ratelimit-remaining');
  const left = remaining === null ? null : Number(remaining);
  if (res.status === 304 && cached) return { data: cached.data, remaining: left };
  if (!res.ok) {
    if (cached) return { data: cached.data, remaining: left };
    throw new GitHubError(explain(res.status, res.headers.get('x-ratelimit-reset')), res.status);
  }
  const data = (await res.json()) as T;
  const etag = res.headers.get('etag');
  if (etag) writeCache(path, { etag, data });
  return { data, remaining: left };
}

/** Loads everything the dashboard shows, in parallel. Runs and commits are optional (the repo may be new). */
export async function loadGitHub(fetcher: typeof fetch = fetch): Promise<GitHubData> {
  const repoPath = `/repos/${GITHUB.user}/${GITHUB.repo}`;
  const optional = <T>(p: Promise<{ data: T; remaining: number | null }>, empty: T) =>
    p.catch(() => ({ data: empty, remaining: null as number | null }));
  const [user, repos, runs, commits] = await Promise.all([
    getJson<GitHubUser>(`/users/${GITHUB.user}`, fetcher),
    getJson<GitHubRepo[]>(`/users/${GITHUB.user}/repos?sort=updated&per_page=30`, fetcher),
    optional(getJson<{ workflow_runs: WorkflowRun[] }>(`${repoPath}/actions/runs?per_page=10`, fetcher), { workflow_runs: [] }),
    optional(getJson<Commit[]>(`${repoPath}/commits?per_page=8`, fetcher), []),
  ]);
  const remaining = [user, repos, runs, commits].map((r) => r.remaining).filter((n): n is number => n !== null);
  return {
    user: user.data,
    repos: repos.data.filter((r) => !r.fork),
    runs: runs.data.workflow_runs,
    commits: commits.data,
    rateRemaining: remaining.length ? Math.min(...remaining) : null,
    fetchedAt: new Date().toISOString(),
  };
}

/** Share of repositories per language, largest first, e.g. [["TypeScript", 4], ["C#", 3]]. */
export function languageCounts(repos: GitHubRepo[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Share of successful completed runs, 0–100, or null with no completed runs. */
export function successRate(runs: WorkflowRun[]): number | null {
  const done = runs.filter((r) => r.status === 'completed' && r.conclusion !== 'cancelled' && r.conclusion !== 'skipped');
  return done.length ? Math.round((done.filter((r) => r.conclusion === 'success').length / done.length) * 100) : null;
}

/** "success" → "Passed"; a run still going → "Running". */
export function runLabel(run: WorkflowRun): { text: string; tone: 'ok' | 'bad' | 'wait' | 'muted' } {
  if (run.status !== 'completed') return { text: 'Running', tone: 'wait' };
  if (run.conclusion === 'success') return { text: 'Passed', tone: 'ok' };
  if (run.conclusion === 'failure') return { text: 'Failed', tone: 'bad' };
  return { text: String(run.conclusion ?? 'unknown'), tone: 'muted' };
}
