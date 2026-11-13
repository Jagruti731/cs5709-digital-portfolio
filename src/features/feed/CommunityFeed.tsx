/**
 * @file CommunityFeed: puts the feed together (CR-13).
 *
 * Phase 1 had one 192-line component. Phase 2 splits it by responsibility:
 *   usePostFeed  – state, storage and API calls (no markup)
 *   SignInForm   – optional sign-in
 *   PostForm     – writing a post
 *   PostCard     – one post, its likes and comments
 * This file only wires them together.
 */
import { PostCard } from './PostCard';
import { PostForm } from './PostForm';
import { SignInForm } from './SignInForm';
import { usePostFeed, type FeedMode } from './usePostFeed';

const SAVED_WHERE: Record<FeedMode, string> = {
  cloud: 'Posts are shared live with every visitor.',
  server: 'Posts are saved on the server.',
  local: 'Posts are saved in this browser.',
};

export function CommunityFeed() {
  const feed = usePostFeed();
  return (
    <div className="feed">
      {feed.mode === 'server' && <SignInForm signedInAs={feed.signedInAs} onSignIn={feed.signIn} onSignOut={feed.signOut} />}
      <PostForm
        askName={!feed.signedInAs}
        guestName={feed.guestName}
        onGuestName={feed.setGuestName}
        onPublish={feed.publish}
        status={feed.status}
        onStatus={feed.setStatus}
        savedWhere={SAVED_WHERE[feed.mode]}
      />
      {feed.posts.length === 0 && <p className="muted">No posts yet. Be the first to write one.</p>}
      {feed.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          me={feed.likeId}
          onLike={() => feed.like(post.id)}
          onComment={(text) => feed.comment(post.id, text)}
        />
      ))}
    </div>
  );
}
