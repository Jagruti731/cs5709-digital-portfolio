/**
 * @file usePostFeed: all logic of the community feed, with no markup (CR-13).
 *
 * Peer review (Aggarwal, 2026): "CommunityFeed.tsx (192 lines) mixes storage,
 * sign-in, messaging and UI. Move logic into hooks such as usePostFeed()".
 * This hook owns loading, saving, posting, liking and commenting. The
 * components in this folder only display what it returns, so changing the
 * storage (for example to a hosted API in a later phase) touches this file
 * and services/postsApi.ts only.
 *
 * CR-31 proved that: the shared feed on Firebase (services/cloud.ts) was added
 * here without changing any component. Three modes, chosen once:
 *   cloud  – Firestore, live for every visitor (when the site has a Firebase project)
 *   server – the Express API (when built with VITE_API_URL)
 *   local  – this browser only (Phase 1 behaviour, and the fallback)
 */
import { useEffect, useMemo, useState } from 'react';
import { LIMITS } from '../../config/site';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { newId } from '../../lib/ids';
import { addCloudComment, addCloudPost, cloudEnabled, subscribeFeed, toggleCloudLike, visitorId } from '../../services/cloud';
import { authenticate, createPost, fetchPosts, saveLocal, sendComment, sendLike, usesServer } from '../../services/postsApi';
import { login, logout } from '../../store/authSlice';
import { shrinkImage } from './shrinkImage';
import { addComment, addPost, setPosts, toggleLike, type CommentItem, type PostItem } from '../../store/postsSlice';

/** "1 MB", "1.5 MB", "500 KB": a size people can read (inspection D2: 500 KB used to print as "1 MB" or "0 MB"). */
export const formatBytes = (bytes: number): string =>
  bytes >= 1_000_000 ? `${Number((bytes / 1_000_000).toFixed(1))} MB` : `${Math.round(bytes / 1000)} KB`;

/** Reads an image file as a data URL, or rejects when it is too large. */
export function readImage(file: File, maxBytes: number = LIMITS.postImageBytes): Promise<string> {
  if (file.size > maxBytes) return Promise.reject(new Error(`Choose an image under ${formatBytes(maxBytes)}.`));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
}

export type FeedMode = 'cloud' | 'server' | 'local';

export function usePostFeed() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.items);
  const auth = useAppSelector((s) => s.auth);
  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState('');
  const [viewer, setViewer] = useState('');
  const mode: FeedMode = useMemo(() => (cloudEnabled() ? 'cloud' : usesServer ? 'server' : 'local'), []);

  // Cloud: listen live to everyone's posts. Server and local: load once.
  useEffect(() => {
    if (mode !== 'cloud') {
      fetchPosts()
        .then((items) => dispatch(setPosts(items)))
        .catch(() => setStatus('Could not reach the server.'));
      return;
    }
    let stop: (() => void) | undefined;
    let closed = false;
    subscribeFeed(
      (items) => dispatch(setPosts(items)),
      () => setStatus('The shared feed is not reachable right now.'),
    )
      .then((s) => (closed ? s() : (stop = s)))
      .catch(() => setStatus('The shared feed is not reachable right now.'));
    visitorId()
      .then(setViewer)
      .catch(() => undefined);
    return () => {
      closed = true;
      stop?.();
    };
  }, [dispatch, mode]);

  // Local mode: this hook is the single place that saves posts.
  useEffect(() => {
    if (mode === 'local') saveLocal(posts);
  }, [posts, mode]);

  /** The name shown on new posts, comments and likes. */
  const me = auth.username || guestName.trim() || 'Guest';
  /** What a like records: the anonymous visitor id in the cloud, the name otherwise. */
  const likeId = mode === 'cloud' ? viewer : me;

  /** Publishes a post. Returns true when it was saved, so the form can clear itself. */
  const publish = async (text: string, image: string | null): Promise<boolean> => {
    if (!text.trim()) return false;
    try {
      if (mode === 'cloud') {
        await addCloudPost(me, text.trim(), image && (await shrinkImage(image)));
      } else {
        const post: PostItem = {
          id: newId(),
          author: me,
          content: text.trim(),
          image,
          createdAt: new Date().toISOString(),
          comments: [],
          likedBy: [],
        };
        dispatch(addPost(await createPost(post, auth.token)));
      }
      setStatus('Posted.');
      return true;
    } catch (err) {
      const fallback = mode === 'server' ? 'Sign in to post.' : 'Could not save the post.';
      setStatus(err instanceof Error && /image/i.test(err.message) ? err.message : fallback);
      return false;
    }
  };

  const like = (postId: string) => {
    if (mode === 'cloud') {
      const liked = posts.find((p) => p.id === postId)?.likedBy?.includes(viewer) ?? false;
      toggleCloudLike(postId, liked).catch(() => setStatus('Your like was not saved.'));
      return;
    }
    dispatch(toggleLike({ postId, author: me }));
    sendLike(postId, me, auth.token).catch(() => setStatus('Your like was not saved on the server.'));
  };

  const comment = (postId: string, content: string) => {
    const item: CommentItem = { id: newId(), author: me, content, createdAt: new Date().toISOString() };
    if (mode === 'cloud') {
      addCloudComment(postId, item).catch(() => setStatus('Your reply was not saved.'));
      return;
    }
    dispatch(addComment({ postId, comment: item }));
    sendComment(postId, item, auth.token).catch(() => setStatus('Sign in to reply.'));
  };

  const signIn = async (mode: 'login' | 'register', username: string, password: string) => {
    const res = await authenticate(mode, username, password);
    dispatch(login({ username: res.username, token: res.token }));
  };

  return {
    posts,
    me,
    likeId,
    mode,
    status,
    setStatus,
    signedInAs: auth.username,
    guestName,
    setGuestName,
    publish,
    like,
    comment,
    signIn,
    signOut: () => dispatch(logout()),
  };
}
