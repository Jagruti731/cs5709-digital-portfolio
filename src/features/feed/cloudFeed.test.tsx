// @vitest-environment jsdom
/**
 * @file Tests of the shared feed and lounge with the cloud service replaced by a fake (CR-31).
 * The real Firebase calls are checked by the security rules tests in the emulator.
 */
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostItem } from '../../types/posts';
import { fitInside } from './shrinkImage';

const fake = vi.hoisted(() => ({
  emitPosts: (() => {}) as (posts: PostItem[]) => void,
  emitLounge: (() => {}) as (m: { id: string; from: string; text: string; t: number }[]) => void,
  addCloudPost: vi.fn(async () => {}),
  toggleCloudLike: vi.fn(async () => {}),
  addCloudComment: vi.fn(async () => {}),
  sendLoungeMessage: vi.fn(async () => {}),
}));

vi.mock('../../services/cloud', () => ({
  cloudEnabled: () => true,
  visitorId: async () => 'me-uid',
  subscribeFeed: async (on: (p: PostItem[]) => void) => {
    fake.emitPosts = on;
    return () => {};
  },
  subscribeLounge: async (on: typeof fake.emitLounge) => {
    fake.emitLounge = on;
    return () => {};
  },
  addCloudPost: fake.addCloudPost,
  toggleCloudLike: fake.toggleCloudLike,
  addCloudComment: fake.addCloudComment,
  sendLoungeMessage: fake.sendLoungeMessage,
}));

const { store } = await import('../../store/store');
const { CommunityFeed } = await import('./CommunityFeed');
const { useChat } = await import('../chat/useChat');

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

const shared: PostItem = {
  id: 'p1',
  author: 'Ann',
  authorId: 'ann-uid',
  content: 'Hello from another device',
  createdAt: '2026-11-10T10:00:00Z',
  likedBy: ['me-uid'],
  comments: [],
};

describe('shared feed (cloud mode)', () => {
  it('shows posts pushed by the database and says they are shared', async () => {
    render(
      <Provider store={store}>
        <CommunityFeed />
      </Provider>,
    );
    expect(screen.getByText('Posts are shared live with every visitor.')).toBeTruthy();
    await waitFor(() => expect(typeof fake.emitPosts).toBe('function'));
    act(() => fake.emitPosts([shared]));
    expect(screen.getByText('Hello from another device')).toBeTruthy();
    // Liked is decided by the anonymous visitor id, not by the name.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Liked (1)' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Liked (1)' }));
    expect(fake.toggleCloudLike).toHaveBeenCalledWith('p1', true);
  });

  it('sends posts and comments to the cloud instead of the local store', async () => {
    render(
      <Provider store={store}>
        <CommunityFeed />
      </Provider>,
    );
    act(() => fake.emitPosts([shared]));
    fireEvent.change(screen.getByLabelText('Write a post'), { target: { value: '  New post  ' } });
    fireEvent.submit(screen.getByLabelText('Write a post').closest('form')!);
    await waitFor(() => expect(fake.addCloudPost).toHaveBeenCalledWith('Guest', 'New post', null));
    const box = screen.getByLabelText('Write a comment');
    fireEvent.change(box, { target: { value: 'Nice' } });
    fireEvent.submit(box.closest('form')!);
    expect(fake.addCloudComment).toHaveBeenCalledWith('p1', expect.objectContaining({ content: 'Nice', author: 'Guest' }));
  });
});

describe('shared lounge (cloud mode)', () => {
  it('shows messages from the database and sends new ones there', async () => {
    const { result } = renderHook(() => useChat(), { wrapper: ({ children }: { children: ReactNode }) => <>{children}</> });
    act(() => result.current.switchRoom('lounge'));
    expect(result.current.cloud).toBe(true);
    await waitFor(() => expect(typeof fake.emitLounge).toBe('function'));
    act(() => fake.emitLounge([{ id: 'm1', from: 'Visitor-1', text: 'x'.repeat(2000), t: 1 }]));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toHaveLength(1000); // capped like any untrusted message
    act(() => result.current.send('  hi all  '));
    expect(fake.sendLoungeMessage).toHaveBeenCalledWith(result.current.me, 'hi all');
  });
});

describe('fitInside', () => {
  it('shrinks large pictures to fit the box and keeps small ones', () => {
    expect(fitInside(4000, 2000, 1000)).toEqual({ width: 1000, height: 500 });
    expect(fitInside(300, 200, 1000)).toEqual({ width: 300, height: 200 });
  });
});
