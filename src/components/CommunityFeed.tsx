import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { authenticate, createPost, fetchPosts, saveLocal, sendComment, sendLike, usesServer } from '../services/postsApi';
import { login, logout } from '../store/authSlice';
import { addComment, addPost, setPosts, toggleLike, type CommentItem, type PostItem } from '../store/postsSlice';

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });

/** The starter's PostFeed, evolved: one storage path, typed state, optional sign-in only when an API is configured. */
export function CommunityFeed() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.items);
  const auth = useAppSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPosts()
      .then((items) => dispatch(setPosts(items)))
      .catch(() => setStatus('Could not reach the server.'));
  }, [dispatch]);

  // Local mode: the feed component is the single place that saves posts.
  useEffect(() => {
    if (!usesServer) saveLocal(posts);
  }, [posts]);

  const me = auth.username || name.trim() || 'Guest';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const post: PostItem = {
      id: newId(),
      author: me,
      content: text.trim(),
      image,
      createdAt: new Date().toISOString(),
      comments: [],
      likedBy: [],
    };
    try {
      dispatch(addPost(await createPost(post, auth.token)));
      setText('');
      setImage(null);
      setStatus('Posted.');
    } catch {
      setStatus(usesServer ? 'Sign in to post.' : 'Could not save the post.');
    }
  };

  const pickImage = (file?: File) => {
    if (!file) return setImage(null);
    if (file.size > 1_000_000) return setStatus('Choose an image under 1 MB.');
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="feed">
      {usesServer && (
        <SignIn
          signedInAs={auth.username}
          onSignedIn={(username, token) => dispatch(login({ username, token }))}
          onSignOut={() => dispatch(logout())}
        />
      )}
      <form className="post-form" onSubmit={submit}>
        {!auth.username && (
          <div className="field">
            <label htmlFor="pf-name">Your name</label>
            <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Guest" />
          </div>
        )}
        <div className="field">
          <label htmlFor="pf-text">Write a post</label>
          <textarea id="pf-text" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000} required />
        </div>
        <div className="post-form-row">
          <label className="file-label">
            Add an image
            <input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} />
          </label>
          {image && <img className="thumb" src={image} alt="Selected" />}
          <button className="btn" type="submit">
            Post
          </button>
        </div>
        <p className="note" role="status">
          {status || (usesServer ? 'Posts are saved on the server.' : 'Posts are saved in this browser.')}
        </p>
      </form>
      {posts.length === 0 && <p className="muted">No posts yet. Be the first to write one.</p>}
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          me={me}
          onLike={() => {
            dispatch(toggleLike({ postId: post.id, author: me }));
            sendLike(post.id, me).catch(() => {});
          }}
          onComment={(content) => {
            const comment: CommentItem = { id: newId(), author: me, content, createdAt: new Date().toISOString() };
            dispatch(addComment({ postId: post.id, comment }));
            sendComment(post.id, comment).catch(() => {});
          }}
        />
      ))}
    </div>
  );
}

function Post({ post, me, onLike, onComment }: { post: PostItem; me: string; onLike: () => void; onComment: (text: string) => void }) {
  const [reply, setReply] = useState('');
  const liked = (post.likedBy || []).includes(me);
  return (
    <article className="post">
      <p className="meta">
        {post.author} · {formatDate(post.createdAt)}
      </p>
      <p className="post-text">{post.content}</p>
      {post.image && <img className="post-image" src={post.image} alt={`Image posted by ${post.author}`} />}
      <div className="post-actions">
        <button className="text-btn" type="button" aria-pressed={liked} onClick={onLike}>
          {liked ? 'Liked' : 'Like'} ({(post.likedBy || []).length})
        </button>
        <span className="note">{(post.comments || []).length} comments</span>
      </div>
      {(post.comments || []).map((c) => (
        <p className="comment" key={c.id}>
          <b>{c.author}</b> {c.content}
        </p>
      ))}
      <form
        className="comment-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (reply.trim()) {
            onComment(reply.trim());
            setReply('');
          }
        }}
      >
        <input
          aria-label="Write a comment"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a comment"
          maxLength={400}
        />
        <button className="text-btn" type="submit">
          Reply
        </button>
      </form>
    </article>
  );
}

function SignIn({
  signedInAs,
  onSignedIn,
  onSignOut,
}: {
  signedInAs: string | null;
  onSignedIn: (u: string, t: string) => void;
  onSignOut: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (signedInAs)
    return (
      <p className="note">
        Signed in as {signedInAs}.{' '}
        <button className="text-btn" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </p>
    );
  const go = async (mode: 'login' | 'register') => {
    try {
      const res = await authenticate(mode, username, password);
      onSignedIn(res.username, res.token);
    } catch {
      setError('That did not work. Check the name and password.');
    }
  };
  return (
    <div className="signin">
      <div className="field">
        <label htmlFor="si-u">Username</label>
        <input id="si-u" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="si-p">Password</label>
        <input id="si-p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="btn-row">
        <button className="btn" type="button" onClick={() => go('login')}>
          Sign in
        </button>
        <button className="btn outline" type="button" onClick={() => go('register')}>
          Create account
        </button>
      </div>
      {error && <p className="note">{error}</p>}
    </div>
  );
}
