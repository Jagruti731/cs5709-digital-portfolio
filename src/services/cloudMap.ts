/**
 * @file cloudMap: turns Firestore documents into the app's own types (CR-31).
 *
 * Kept free of the Firebase SDK so it can be unit tested. Everything read from
 * the database is treated as untrusted input: types are forced and lengths capped,
 * the same way the lounge treats messages from other tabs (useChat.parseIncoming).
 */
import { LIMITS } from '../config/site';
import type { CommentItem, PostItem } from '../types/posts';

/** The fields of a document as plain data (Firestore's DocumentData). */
export type Raw = Record<string, unknown>;

/** A Firestore Timestamp, or null while a server timestamp is still pending. */
interface TimestampLike {
  toMillis(): number;
}

/** Milliseconds from a Firestore Timestamp; "now" while the server time is pending. */
export function millis(value: unknown, now: number = Date.now()): number {
  if (value && typeof (value as TimestampLike).toMillis === 'function') return (value as TimestampLike).toMillis();
  if (typeof value === 'number') return value;
  return now;
}

const text = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '');

export function toComment(id: string, d: Raw): CommentItem & { postId: string } {
  return {
    id,
    postId: text(d.postId, 64),
    author: text(d.author, LIMITS.nameChars) || 'Guest',
    content: text(d.content, LIMITS.commentChars),
    createdAt: new Date(millis(d.createdAt)).toISOString(),
  };
}

export function toPost(id: string, d: Raw): PostItem {
  const image = typeof d.image === 'string' && d.image.startsWith('data:image/') ? d.image : null;
  return {
    id,
    author: text(d.author, LIMITS.nameChars) || 'Guest',
    authorId: text(d.authorId, 128),
    content: text(d.content, LIMITS.postChars),
    image,
    createdAt: new Date(millis(d.createdAt)).toISOString(),
    likedBy: Array.isArray(d.likedBy) ? d.likedBy.filter((x): x is string => typeof x === 'string') : [],
    comments: [],
  };
}

/** Attaches each comment to its post, oldest comment first. Comments of unknown posts are dropped. */
export function withComments(posts: PostItem[], comments: (CommentItem & { postId: string })[]): PostItem[] {
  const byPost = new Map<string, CommentItem[]>();
  for (const { postId, ...c } of [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    byPost.set(postId, [...(byPost.get(postId) ?? []), c]);
  }
  return posts.map((p) => ({ ...p, comments: byPost.get(p.id) ?? [] }));
}
