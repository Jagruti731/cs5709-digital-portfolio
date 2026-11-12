// @vitest-environment jsdom
/**
 * @file Tests for the live GitHub service (CR-22). The network is replaced by a fake fetch.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { explain, getJson, languageCounts, loadGitHub, runLabel, successRate, type GitHubRepo, type WorkflowRun } from './githubApi';

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(status === 304 ? null : JSON.stringify(body), { status, headers: { 'x-ratelimit-remaining': '59', ...headers } });

beforeEach(() => localStorage.clear());

describe('getJson', () => {
  it('stores the ETag and reuses the copy when GitHub answers 304', async () => {
    const sent: (string | undefined)[] = [];
    const answers = [json({ n: 1 }, 200, { etag: '"abc"' }), json(null, 304)];
    const fetcher = (async (_url: string, init: RequestInit) => {
      sent.push((init.headers as Record<string, string>)['If-None-Match']);
      return answers.shift()!;
    }) as unknown as typeof fetch;
    expect((await getJson('/x', fetcher)).data).toEqual({ n: 1 });
    expect((await getJson('/x', fetcher)).data).toEqual({ n: 1 });
    expect(sent).toEqual([undefined, '"abc"']);
  });

  it('explains the hourly limit', async () => {
    const fetcher = (async () => json({}, 403, { 'x-ratelimit-reset': '1800000000' })) as unknown as typeof fetch;
    await expect(getJson('/limited', fetcher)).rejects.toThrow('hourly limit');
  });

  it('shows the last copy when offline', async () => {
    await getJson('/y', (async () => json([1], 200, { etag: 'e' })) as unknown as typeof fetch);
    const offline = (async () => {
      throw new TypeError('offline');
    }) as unknown as typeof fetch;
    expect((await getJson('/y', offline)).data).toEqual([1]);
  });
});

describe('loadGitHub', () => {
  it('works for a new repository with no pipeline runs yet', async () => {
    const fetcher = (async (url: string) => {
      if (url.endsWith('/users/Jagruti731')) return json({ login: 'Jagruti731', public_repos: 2 });
      if (url.includes('/repos?'))
        return json([
          { id: 1, name: 'a', fork: false },
          { id: 2, name: 'b', fork: true },
        ]);
      return json({ message: 'Not Found' }, 404);
    }) as unknown as typeof fetch;
    const data = await loadGitHub(fetcher);
    expect(data.repos.map((r) => r.name)).toEqual(['a']); // forks are hidden
    expect(data.runs).toEqual([]);
    expect(data.rateRemaining).toBe(59);
  });
});

describe('summaries', () => {
  const repo = (language: string | null) => ({ language }) as GitHubRepo;
  const run = (status: string, conclusion: string | null) => ({ status, conclusion }) as WorkflowRun;

  it('counts languages, largest first', () => {
    expect(languageCounts([repo('C#'), repo('TypeScript'), repo('C#'), repo(null)])).toEqual([
      ['C#', 2],
      ['TypeScript', 1],
    ]);
  });

  it('computes the pipeline pass rate from completed runs only', () => {
    expect(
      successRate([run('completed', 'success'), run('completed', 'failure'), run('in_progress', null), run('completed', 'cancelled')]),
    ).toBe(50);
    expect(successRate([])).toBeNull();
  });

  it('labels runs for people', () => {
    expect(runLabel(run('in_progress', null)).text).toBe('Running');
    expect(runLabel(run('completed', 'success')).tone).toBe('ok');
    expect(runLabel(run('completed', 'failure')).text).toBe('Failed');
  });

  it('turns status codes into plain messages', () => {
    expect(explain(404, null)).toContain('could not find');
    expect(explain(500, null)).toContain('500');
  });
});
