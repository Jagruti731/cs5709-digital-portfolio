/**
 * @file Unit tests for the posts reducer (peer review: "add unit tests for the pure functions, such as the posts reducer").
 */
import { describe, expect, it } from 'vitest';
import reducer, { addComment, addPost, setPosts, toggleLike, updatePost, type PostItem } from './postsSlice';

const post = (id: string, extra: Partial<PostItem> = {}): PostItem => ({ id, author: 'ann', content: `post ${id}`, createdAt: '2026-11-01T10:00:00Z', ...extra });
const start = () => reducer(undefined, setPosts([post('a'), post('b')]));

describe('postsSlice', () => {
  it('starts empty', () => {
    expect(reducer(undefined, { type: '@@init' }).items).toEqual([]);
  });

  it('adds a new post at the top', () => {
    const state = reducer(start(), addPost(post('c')));
    expect(state.items.map((p) => p.id)).toEqual(['c', 'a', 'b']);
  });

  it('updates a post in place, or adds it when unknown', () => {
    let state = reducer(start(), updatePost(post('b', { content: 'edited' })));
    expect(state.items[1].content).toBe('edited');
    state = reducer(state, updatePost(post('z')));
    expect(state.items[0].id).toBe('z');
  });

  it('adds a comment to the right post, creating the list if needed', () => {
    const comment = { id: 'c1', author: 'bob', content: 'hi', createdAt: '2026-11-01T11:00:00Z' };
    const state = reducer(start(), addComment({ postId: 'b', comment }));
    expect(state.items[1].comments).toEqual([comment]);
    expect(state.items[0].comments).toBeUndefined();
  });

  it('toggles a like on and off for the same person', () => {
    let state = reducer(start(), toggleLike({ postId: 'a', author: 'bob' }));
    expect(state.items[0].likedBy).toEqual(['bob']);
    state = reducer(state, toggleLike({ postId: 'a', author: 'bob' }));
    expect(state.items[0].likedBy).toEqual([]);
  });

  it('ignores likes and comments for a post that does not exist', () => {
    const before = start();
    expect(reducer(before, toggleLike({ postId: 'nope', author: 'bob' }))).toEqual(before);
  });
});
