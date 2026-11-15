// @vitest-environment jsdom
/**
 * @file Component tests for the Dashboard tabs: code quality and live GitHub (CR-22, CR-24).
 * quality.fixture.json is a real report produced by tools/quality-report.mjs.
 */
import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';
import githubReducer, { type GitHubState } from '../../store/githubSlice';
import { GitHubPanel } from '../github/GitHubPanel';
import fixture from './quality.fixture.json';
import { QualityPanel } from './QualityPanel';
import { passRate, statusRows, type QualityReport } from './report';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('QualityPanel', () => {
  it('shows the headline numbers and the reflexion model from quality.json', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(fixture))),
    );
    render(<QualityPanel />);
    await screen.findByText('automated checks passed');
    expect(screen.getByText('lint errors / warnings')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Architecture conformance (reflexion model)' })).toBeTruthy();
    expect(document.querySelectorAll('.matrix td.conv').length).toBe(fixture.architecture.convergences.length);
    expect(document.querySelectorAll('.matrix td.div').length).toBe(fixture.architecture.divergences.length);
  });

  it('explains that the report comes from the pipeline when it is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 404 })),
    );
    render(<QualityPanel />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('created by the CI/CD pipeline'));
  });

  it('computes pass rates', () => {
    expect(passRate({ passed: 3, total: 4 })).toBe(75);
    expect(passRate(null)).toBeNull();
  });
});

describe('Home status panel (CR-33)', () => {
  const report = fixture as unknown as QualityReport;

  it('summarises the report and flags what is below target', () => {
    // The fixture is an early real report: all checks pass, but coverage was 47% and there were 2 divergences.
    const rows = statusRows(report, true);
    expect(rows.map((r) => r.label)).toEqual(['pipeline', 'checks', 'coverage', 'architecture', 'community']);
    expect(rows.map((r) => r.ok)).toEqual([true, true, false, false, true]);
    expect(rows[1].value).toBe('101/101 passing');
    expect(rows[3].value).toBe('2 rule breaks');
  });

  it('marks failing checks and a local build honestly', () => {
    const failing = { ...report, tests: { ...report.tests, api: { passed: 15, total: 16 } } };
    expect(statusRows(failing, false).find((r) => r.label === 'checks')?.ok).toBe(false);
    expect(statusRows(failing, false).at(-1)).toEqual({ label: 'community', value: 'this browser only', ok: false });
    expect(statusRows(undefined, false)[0]).toEqual({ label: 'pipeline', value: 'not measured yet', ok: false });
  });
});

describe('GitHubPanel', () => {
  const ago = (h: number) => new Date(Date.now() - h * 3600e3).toISOString();
  const github: GitHubState = {
    status: 'ready',
    data: {
      user: { login: 'Jagruti731', name: null, avatar_url: '', html_url: '#', public_repos: 2, followers: 0, created_at: ago(900) },
      repos: [
        {
          id: 1,
          name: 'portfolio',
          description: null,
          html_url: '#',
          language: 'TypeScript',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: ago(1),
          fork: false,
        },
        {
          id: 2,
          name: 'IMSWebApp',
          description: 'Inventory',
          html_url: '#',
          language: 'C#',
          stargazers_count: 3,
          forks_count: 0,
          updated_at: ago(50),
          fork: false,
        },
      ],
      runs: [
        {
          id: 1,
          run_number: 2,
          display_title: 'ok',
          event: 'push',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'main',
          head_sha: 'abcdef12',
          html_url: '#',
          created_at: ago(1),
          updated_at: ago(1),
        },
        {
          id: 2,
          run_number: 1,
          display_title: 'bad',
          event: 'push',
          status: 'completed',
          conclusion: 'failure',
          head_branch: 'main',
          head_sha: 'abcdef13',
          html_url: '#',
          created_at: ago(2),
          updated_at: ago(2),
        },
      ],
      commits: [{ sha: 'abcdef12', html_url: '#', commit: { message: 'perfective: x', author: { name: 'J', date: ago(1) } } }],
      rateRemaining: 58,
      stale: false,
      fetchedAt: ago(0),
    },
  };
  const renderPanel = () =>
    render(
      <Provider store={configureStore({ reducer: { github: githubReducer }, preloadedState: { github } })}>
        <GitHubPanel />
      </Provider>,
    );

  it('summarises the account and the pipeline', () => {
    renderPanel();
    expect(screen.getByText('50%')).toBeTruthy(); // 1 of 2 completed runs passed
    expect(screen.getByText('Passed')).toBeTruthy();
    expect(screen.getByText('Failed')).toBeTruthy();
    expect(screen.getByText(/58 API requests left/)).toBeTruthy();
  });

  it('filters repositories by language and sorts them', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'C#' }));
    expect(document.querySelectorAll('.repo')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'stars' } });
    expect(document.querySelector('.repo h3')?.textContent).toBe('IMSWebApp');
  });
});
