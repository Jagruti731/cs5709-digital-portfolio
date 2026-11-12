// @vitest-environment jsdom
/**
 * @file Component tests for the Readme page tabs (Requirements, Change log) and useContent.
 * The store is pre-loaded with the real JSON files, so no network is used.
 */
import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it } from 'vitest';
import { useContent } from '../../hooks/useContent';
import contentReducer, { type ContentState } from '../../store/contentSlice';
import { ChangeLog } from './ChangeLog';
import { Requirements } from './Requirements';

afterEach(cleanup);

const real = (name: string) => JSON.parse(readFileSync(`${process.cwd()}/public/data/${name}.json`, 'utf8'));
const storeWith = (content: ContentState) => configureStore({ reducer: { content: contentReducer }, preloadedState: { content } });
const wrap = (content: ContentState) => {
  const store = storeWith(content);
  return ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
};

describe('Requirements tab', () => {
  it('shows every persona and filters the features by phase', () => {
    const data = real('requirements');
    render(<Requirements />, { wrapper: wrap({ requirements: { status: 'ready', data } }) });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(data.personas.length);
    const featureTable = () => screen.getAllByRole('table')[1];
    expect(within(featureTable()).getAllByRole('row')).toHaveLength(data.features.length + 1);
    fireEvent.click(screen.getByRole('button', { name: /^Phase 1/ }));
    const phase1 = data.features.filter((f: { phase: number }) => f.phase === 1).length;
    expect(within(featureTable()).getAllByRole('row')).toHaveLength(phase1 + 1);
  });
});

describe('Change log tab', () => {
  it('filters changes by maintenance type and phase', () => {
    const data = real('changelog');
    render(<ChangeLog />, { wrapper: wrap({ changelog: { status: 'ready', data } }) });
    fireEvent.click(screen.getByRole('button', { name: /^corrective/ }));
    const corrective = data.filter((c: { type: string }) => c.type === 'corrective').length;
    expect(screen.getAllByRole('row')).toHaveLength(corrective + 1);
    fireEvent.click(screen.getByRole('button', { name: 'Phase 2' }));
    const both = data.filter((c: { type: string; phase: number }) => c.type === 'corrective' && c.phase === 2).length;
    expect(screen.getAllByRole('row')).toHaveLength(both + 1);
  });
});

describe('useContent', () => {
  it('returns cached data without a request', () => {
    const { result } = renderHook(() => useContent('videos'), { wrapper: wrap({ videos: { status: 'ready', data: [] } }) });
    expect(result.current.status).toBe('ready');
    expect(result.current.data).toEqual([]);
  });

  it('shows an error state with a reason', () => {
    const { result } = renderHook(() => useContent('blog'), { wrapper: wrap({ blog: { status: 'error', error: 'blog.json: x' } }) });
    expect(result.current.error).toBe('blog.json: x');
  });
});
