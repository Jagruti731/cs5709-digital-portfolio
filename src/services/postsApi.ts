import type { CommentItem, PostItem } from '../store/postsSlice';

/**
 * The only module that knows where posts are stored.
 *
 * The starter hard-coded http://localhost:5000 in five places, so on a static
 * host every action failed first and then fell back to localStorage (TD-04).
 * Now the API is used only when the site is built with VITE_API_URL;
 * otherwise posts stay in this browser and no request is made.
 */
const API_URL: string | undefined = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'postfeed.posts';

export const usesServer = Boolean(API_URL);

export function loadLocal(): PostItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as PostItem[];
  } catch {
    return [];
  }
}

export function saveLocal(posts: PostItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    /* storage unavailable */
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchPosts(): Promise<PostItem[]> {
  return usesServer ? request<PostItem[]>('/posts') : loadLocal();
}

export async function createPost(post: PostItem, token: string | null): Promise<PostItem> {
  if (!usesServer) return { ...post, _local: true };
  return request<PostItem>('/posts', { method: 'POST', body: JSON.stringify({ content: post.content, image: post.image }) }, token);
}

export async function sendComment(postId: string, comment: CommentItem): Promise<void> {
  if (usesServer) await request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(comment) });
}

export async function sendLike(postId: string, author: string): Promise<void> {
  if (usesServer) await request(`/posts/${postId}/likes`, { method: 'POST', body: JSON.stringify({ author }) });
}

export async function authenticate(mode: 'login' | 'register', username: string, password: string) {
  return request<{ username: string; token: string }>(`/auth/${mode}`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
