// @vitest-environment jsdom
/**
 * @file Component tests for the community feed parts (CR-13/CR-15).
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoadState } from '../../components/LoadState';
import { PostCard } from './PostCard';
import { readImage } from './usePostFeed';

afterEach(cleanup);

describe('PostCard', () => {
  const post = { id: 'p1', author: 'ann', content: 'Hello Limerick', createdAt: '2026-11-01T10:00:00Z', likedBy: ['bob'], comments: [] };

  it('shows the post and whether I liked it', () => {
    render(<PostCard post={post} me="bob" onLike={() => {}} onComment={() => {}} />);
    expect(screen.getByText('Hello Limerick')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Liked (1)' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('sends a trimmed reply and clears the box', () => {
    const onComment = vi.fn();
    render(<PostCard post={post} me="ann" onLike={() => {}} onComment={onComment} />);
    const box = screen.getByLabelText('Write a comment') as HTMLInputElement;
    fireEvent.change(box, { target: { value: '  nice  ' } });
    fireEvent.submit(box.closest('form')!);
    expect(onComment).toHaveBeenCalledWith('nice');
    expect(box.value).toBe('');
  });
});

describe('readImage', () => {
  it('refuses images over the limit', async () => {
    const big = new File([new Uint8Array(2_000_001)], 'big.png', { type: 'image/png' });
    await expect(readImage(big, 2_000_000)).rejects.toThrow('under 2 MB');
  });

  it('reads a small image as a data URL', async () => {
    const small = new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' });
    await expect(readImage(small)).resolves.toMatch(/^data:image\/png;base64,/);
  });
});

describe('LoadState', () => {
  it('offers a retry after an error', () => {
    const retry = vi.fn();
    render(<LoadState status="error" error="blog.json: the server returned 500" retry={retry} />);
    expect(screen.getByRole('alert').textContent).toContain('the server returned 500');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
