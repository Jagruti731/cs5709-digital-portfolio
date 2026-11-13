/**
 * @file Unit tests for cloudMap: Firestore documents become safe app types (CR-31).
 */
import { describe, expect, it } from 'vitest';
import { millis, toComment, toPost, withComments } from './cloudMap';

const stamp = (ms: number) => ({ toMillis: () => ms });

describe('millis', () => {
  it('reads a Firestore timestamp, a number, or "now" while the server time is pending', () => {
    expect(millis(stamp(5))).toBe(5);
    expect(millis(7)).toBe(7);
    expect(millis(null, 99)).toBe(99);
  });
});

describe('toPost', () => {
  it('keeps a valid post', () => {
    const p = toPost('a', { author: 'Ann', authorId: 'u1', content: 'Hi', image: null, createdAt: stamp(0), likedBy: ['u2'] });
    expect(p).toMatchObject({ id: 'a', author: 'Ann', authorId: 'u1', content: 'Hi', image: null, likedBy: ['u2'], comments: [] });
    expect(p.createdAt).toBe('1970-01-01T00:00:00.000Z');
  });

  it('treats the document as untrusted: wrong types, long text and non-image URLs are cleaned', () => {
    const p = toPost('b', { author: 42, content: 'x'.repeat(5000), image: 'javascript:alert(1)', likedBy: ['ok', 3] });
    expect(p.author).toBe('Guest');
    expect(p.content).toHaveLength(1000);
    expect(p.image).toBeNull();
    expect(p.likedBy).toEqual(['ok']);
  });
});

describe('withComments', () => {
  it('attaches comments to their post, oldest first, and drops comments of unknown posts', () => {
    const posts = [toPost('p1', { content: 'a' }), toPost('p2', { content: 'b' })];
    const comments = [
      toComment('c2', { postId: 'p1', content: 'second', createdAt: stamp(2000) }),
      toComment('c1', { postId: 'p1', content: 'first', createdAt: stamp(1000) }),
      toComment('c3', { postId: 'gone', content: 'orphan', createdAt: stamp(3000) }),
    ];
    const merged = withComments(posts, comments);
    expect(merged[0].comments?.map((c) => c.content)).toEqual(['first', 'second']);
    expect(merged[1].comments).toEqual([]);
    expect(merged[0].comments?.[0]).not.toHaveProperty('postId');
  });
});
