/**
 * @file PostCard: one post with its likes, comments and reply box (CR-13).
 * Pure display plus a reply draft; likes and replies are passed up to usePostFeed.
 */
import { useState } from 'react';
import { LIMITS } from '../../config/site';
import { shortDate } from '../../lib/ids';
import type { PostItem } from '../../store/postsSlice';

interface PostCardProps {
  post: PostItem;
  /** The current visitor's name, used to show whether they liked this post. */
  me: string;
  onLike: () => void;
  onComment: (text: string) => void;
}

export function PostCard({ post, me, onLike, onComment }: PostCardProps) {
  const [reply, setReply] = useState('');
  const likedBy = post.likedBy ?? [];
  const comments = post.comments ?? [];
  const liked = likedBy.includes(me);
  return (
    <article className="post">
      <p className="meta">
        {post.author} · {shortDate(post.createdAt)}
      </p>
      <p className="post-text">{post.content}</p>
      {post.image && <img className="post-image" src={post.image} alt={`Image posted by ${post.author}`} loading="lazy" />}
      <div className="post-actions">
        <button className="text-btn" type="button" aria-pressed={liked} onClick={onLike}>
          {liked ? 'Liked' : 'Like'} ({likedBy.length})
        </button>
        <span className="note">{comments.length} comments</span>
      </div>
      {comments.map((c) => (
        <p className="comment" key={c.id}>
          <b>{c.author}</b> {c.content}
        </p>
      ))}
      <form
        className="comment-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          onComment(reply.trim());
          setReply('');
        }}
      >
        <input
          aria-label="Write a comment"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a comment"
          maxLength={LIMITS.commentChars}
        />
        <button className="text-btn" type="submit">
          Reply
        </button>
      </form>
    </article>
  );
}
