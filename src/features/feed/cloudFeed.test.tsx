// @vitest-environment jsdom
/**
 * @file Tests of the shared feed and lounge with the cloud service replaced by a fake (CR-31).
 * The real Firebase calls are checked by the security rules tests in the emulator.
 */
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
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
  admin: false,
  removeCloudPost: vi.fn(async () => {}),
  removeCloudComment: vi.fn(async () => {}),
  removeLoungeMessage: vi.fn(async () => {}),
}));

class FakeTooSoon extends Error {}

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
  isCloudAdmin: async () => fake.admin,
  removeCloudPost: fake.removeCloudPost,
  removeCloudComment: fake.removeCloudComment,
  removeLoungeMessage: fake.removeLoungeMessage,
  TooSoonError: FakeTooSoon,
}));

const { store } = await import('../../store/store');
const { CommunityFeed } = await import('./CommunityFeed');
const { useChat } = await import('../chat/useChat');

beforeEach(() => {
  vi.clearAllMocks();
  fake.admin = false;
});
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
        <MemoryRouter>
          <CommunityFeed />
        </MemoryRouter>
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
        <MemoryRouter>
          <CommunityFeed />
        </MemoryRouter>
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

describe('moderation and rate limiting (CR-58)', () => {
  const withComment: PostItem = { ...shared, comments: [{ id: 'c1', author: 'Bob', content: 'spam', createdAt: shared.createdAt }] };
  const show = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommunityFeed />
        </MemoryRouter>
      </Provider>,
    );

  it('shows no Remove buttons to ordinary visitors', async () => {
    show();
    act(() => fake.emitPosts([withComment]));
    await waitFor(() => expect(screen.getByText('spam')).toBeTruthy());
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
  });

  it('lets an admin remove a comment and a post', async () => {
    fake.admin = true;
    show();
    act(() => fake.emitPosts([withComment]));
    fireEvent.click(await screen.findByRole('button', { name: 'Remove comment by Bob' }));
    expect(fake.removeCloudComment).toHaveBeenCalledWith('c1');
    fireEvent.click(screen.getByRole('button', { name: 'Remove post by Ann' }));
    expect(fake.removeCloudPost).toHaveBeenCalledWith('p1');
  });

  it('shows the visitor id to a would-be moderator with ?moderate', async () => {
    fake.admin = true;
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/blog?moderate']}>
          <CommunityFeed />
        </MemoryRouter>
      </Provider>,
    );
    expect(await screen.findByText(/Moderator: yes/)).toBeTruthy();
    expect(screen.getByText('me-uid')).toBeTruthy();
  });

  it('tells the visitor to wait when they post too soon', async () => {
    fake.addCloudPost.mockRejectedValueOnce(new FakeTooSoon('Please wait 25 s before sending again.'));
    show();
    fireEvent.change(screen.getByLabelText('Write a post'), { target: { value: 'again' } });
    fireEvent.submit(screen.getByLabelText('Write a post').closest('form')!);
    expect(await screen.findByText('Please wait 25 s before sending again.')).toBeTruthy();
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
    expect(result.current.canRemove).toBe(false);
  });

  it('lets an admin remove a lounge message', async () => {
    fake.admin = true;
    const { result } = renderHook(() => useChat(), { wrapper: ({ children }: { children: ReactNode }) => <>{children}</> });
    act(() => result.current.switchRoom('lounge'));
    await waitFor(() => expect(result.current.canRemove).toBe(true));
    act(() => result.current.remove('m1'));
    expect(fake.removeLoungeMessage).toHaveBeenCalledWith('m1');
  });
});

describe('fitInside', () => {
  it('shrinks large pictures to fit the box and keeps small ones', () => {
    expect(fitInside(4000, 2000, 1000)).toEqual({ width: 1000, height: 500 });
    expect(fitInside(300, 200, 1000)).toEqual({ width: 300, height: 200 });
  });
});
