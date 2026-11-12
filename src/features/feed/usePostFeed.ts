/**
 * @file usePostFeed: all logic of the community feed, with no markup (CR-13).
 *
 * Peer review (Aggarwal, 2026): "CommunityFeed.tsx (192 lines) mixes storage,
 * sign-in, messaging and UI. Move logic into hooks such as usePostFeed()".
 * This hook owns loading, saving, posting, liking and commenting. The
 * components in this folder only display what it returns, so changing the
 * storage (for example to a hosted API in a later phase) touches this file
 * and services/postsApi.ts only.
 */
import { useEffect, useState } from 'react';
import { LIMITS } from '../../config/site';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { newId } from '../../lib/ids';
import { authenticate, createPost, fetchPosts, saveLocal, sendComment, sendLike, usesServer } from '../../services/postsApi';
import { login, logout } from '../../store/authSlice';
import { addComment, addPost, setPosts, toggleLike, type CommentItem, type PostItem } from '../../store/postsSlice';

/** Reads an image file as a data URL, or rejects when it is too large. */
export function readImage(file: File, maxBytes: number = LIMITS.postImageBytes): Promise<string> {
  if (file.size > maxBytes) return Promise.reject(new Error(`Choose an image under ${Math.round(maxBytes / 1_000_000)} MB.`));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
}

export function usePostFeed() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.items);
  const auth = useAppSelector((s) => s.auth);
  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState('');

  // Load once when the feed first appears.
  useEffect(() => {
    fetchPosts()
      .then((items) => dispatch(setPosts(items)))
      .catch(() => setStatus('Could not reach the server.'));
  }, [dispatch]);

  // Local mode: this hook is the single place that saves posts.
  useEffect(() => {
    if (!usesServer) saveLocal(posts);
  }, [posts]);

  /** The name shown on new posts, comments and likes. */
  const me = auth.username || guestName.trim() || 'Guest';

  /** Publishes a post. Returns true when it was saved, so the form can clear itself. */
  const publish = async (text: string, image: string | null): Promise<boolean> => {
    if (!text.trim()) return false;
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
      setStatus('Posted.');
      return true;
    } catch {
      setStatus(usesServer ? 'Sign in to post.' : 'Could not save the post.');
      return false;
    }
  };

  const like = (postId: string) => {
    dispatch(toggleLike({ postId, author: me }));
    sendLike(postId, me, auth.token).catch(() => setStatus('Your like was not saved on the server.'));
  };

  const comment = (postId: string, content: string) => {
    const item: CommentItem = { id: newId(), author: me, content, createdAt: new Date().toISOString() };
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
    status,
    setStatus,
    usesServer,
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
