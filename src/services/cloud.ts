/**
 * @file cloud: the shared community feed and visitor lounge on Firebase (CR-31, F18–F20).
 *
 * Phase 1 kept posts in one browser and the lounge between tabs of one browser.
 * This service stores them in Cloud Firestore, so every visitor on every device
 * sees the same feed, and pushes changes live (onSnapshot listeners, no polling).
 *
 *  - Visitors are signed in anonymously; the anonymous id proves who wrote a post,
 *    so a like can add or remove only the caller's own id (see firestore.rules).
 *  - The Firebase SDK is loaded with import() the first time the feed or lounge
 *    opens, so it is not part of the main bundle.
 *  - Nothing here trusts the database: documents pass through cloudMap first.
 *  - Rate limiting (CR-58): each new post, comment or lounge message is written in one
 *    batch with the visitor's limits/{uid} stamp; the rules refuse it if it comes too soon.
 *  - Moderation (CR-58): a visitor listed in admins/ may remove any post, comment or message.
 */
import { BACKEND_FLAG, CLOUD_LIMITS, COLLECTIONS, FIREBASE, RATE_LIMIT_SECONDS, type WriteKind } from '../config/firebase';
import type { CommentItem, PostItem } from '../types/posts';
import { toComment, toPost, withComments, millis, type Raw } from './cloudMap';

/** True when the site was built with a Firebase project and the cloud was not switched off. */
export function cloudEnabled(): boolean {
  if (!FIREBASE.apiKey) return false;
  try {
    return localStorage.getItem(BACKEND_FLAG) !== 'local';
  } catch {
    return true;
  }
}

type Firestore = typeof import('firebase/firestore');

interface Connection {
  fs: Firestore;
  db: import('firebase/firestore').Firestore;
  uid: string;
}

let connection: Promise<Connection> | null = null;

/** Starts Firebase once, signs the visitor in anonymously, and shares the result. */
export function connect(): Promise<Connection> {
  connection ??= (async () => {
    const [{ initializeApp }, { getAuth, signInAnonymously }, fs] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const app = initializeApp(FIREBASE);
    const { user } = await signInAnonymously(getAuth(app));
    return { fs, db: fs.getFirestore(app), uid: user.uid };
  })().catch((err: unknown) => {
    connection = null; // let the next call try again
    throw err;
  });
  return connection;
}

/** Thrown when a write comes before the visitor's rate-limit interval has passed. */
export class TooSoonError extends Error {
  constructor(readonly seconds: number) {
    super(`Please wait ${seconds} s before sending again.`);
    this.name = 'TooSoonError';
  }
}

const lastWrite: Partial<Record<WriteKind, number>> = {};

/** Seconds this visitor still has to wait before the next write of this kind (0 = may send now). */
export function waitSeconds(kind: WriteKind, now = Date.now()): number {
  const last = lastWrite[kind];
  if (last === undefined) return 0;
  return Math.max(0, Math.ceil((last + RATE_LIMIT_SECONDS[kind] * 1000 - now) / 1000));
}

/** Adds a document together with the visitor's rate-limit stamp, in one batch the rules check together. */
async function addLimited(kind: WriteKind, collectionName: string, data: Record<string, unknown>): Promise<void> {
  const wait = waitSeconds(kind);
  if (wait > 0) throw new TooSoonError(wait);
  const { fs, db, uid } = await connect();
  const batch = fs.writeBatch(db);
  batch.set(fs.doc(fs.collection(db, collectionName)), data);
  batch.set(fs.doc(db, COLLECTIONS.limits, uid), { [kind]: fs.serverTimestamp() }, { merge: true });
  try {
    await batch.commit();
  } catch (err) {
    // Rules published before CR-58 know no limits/ collection. A plain write still works there,
    // and the current rules refuse it, so this fallback never skips the rate limit.
    if ((err as { code?: string }).code !== 'permission-denied') throw err;
    await fs.addDoc(fs.collection(db, collectionName), data);
  }
  lastWrite[kind] = Date.now();
}

/** True when this visitor's id is listed in admins/ (set only in the Firebase console). */
export async function isCloudAdmin(): Promise<boolean> {
  const { fs, db, uid } = await connect();
  try {
    return (await fs.getDoc(fs.doc(db, COLLECTIONS.admins, uid))).exists();
  } catch {
    return false;
  }
}

/** Admin: removes a post and its comments. */
export async function removeCloudPost(postId: string): Promise<void> {
  const { fs, db } = await connect();
  const replies = await fs.getDocs(fs.query(fs.collection(db, COLLECTIONS.comments), fs.where('postId', '==', postId)));
  const batch = fs.writeBatch(db);
  replies.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(fs.doc(db, COLLECTIONS.posts, postId));
  await batch.commit();
}

/** Admin: removes one comment. */
export async function removeCloudComment(commentId: string): Promise<void> {
  const { fs, db } = await connect();
  await fs.deleteDoc(fs.doc(db, COLLECTIONS.comments, commentId));
}

/** Admin: removes one lounge message. */
export async function removeLoungeMessage(messageId: string): Promise<void> {
  const { fs, db } = await connect();
  await fs.deleteDoc(fs.doc(db, COLLECTIONS.lounge, messageId));
}

/** The anonymous visitor id, used to show which posts this visitor liked. */
export const visitorId = async (): Promise<string> => (await connect()).uid;

/**
 * Listens to the newest posts and comments. Calls onPosts with the merged list
 * on every change made by anyone. Returns a function that stops listening.
 */
export async function subscribeFeed(onPosts: (posts: PostItem[]) => void, onError: (e: Error) => void): Promise<() => void> {
  const { fs, db } = await connect();
  let posts: PostItem[] = [];
  let comments: ReturnType<typeof toComment>[] = [];
  const emit = () => onPosts(withComments(posts, comments));
  const newest = (name: string, n: number) => fs.query(fs.collection(db, name), fs.orderBy('createdAt', 'desc'), fs.limit(n));
  const stopPosts = fs.onSnapshot(
    newest(COLLECTIONS.posts, CLOUD_LIMITS.posts),
    (snap) => {
      posts = snap.docs.map((d) => toPost(d.id, d.data({ serverTimestamps: 'estimate' }) as Raw));
      emit();
    },
    onError,
  );
  const stopComments = fs.onSnapshot(
    newest(COLLECTIONS.comments, CLOUD_LIMITS.comments),
    (snap) => {
      comments = snap.docs.map((d) => toComment(d.id, d.data({ serverTimestamps: 'estimate' }) as Raw));
      emit();
    },
    onError,
  );
  return () => {
    stopPosts();
    stopComments();
  };
}

export async function addCloudPost(author: string, content: string, image: string | null): Promise<void> {
  const { fs, uid } = await connect();
  await addLimited('post', COLLECTIONS.posts, {
    author,
    authorId: uid,
    content,
    image,
    createdAt: fs.serverTimestamp(),
    likedBy: [],
  });
}

/** Adds or removes this visitor's like. arrayUnion/arrayRemove change only the caller's own id. */
export async function toggleCloudLike(postId: string, liked: boolean): Promise<void> {
  const { fs, db, uid } = await connect();
  await fs.updateDoc(fs.doc(db, COLLECTIONS.posts, postId), { likedBy: liked ? fs.arrayRemove(uid) : fs.arrayUnion(uid) });
}

export async function addCloudComment(postId: string, comment: CommentItem): Promise<void> {
  const { fs, uid } = await connect();
  await addLimited('comment', COLLECTIONS.comments, {
    postId,
    author: comment.author,
    authorId: uid,
    content: comment.content,
    createdAt: fs.serverTimestamp(),
  });
}

/** A lounge message as the chat shows it. */
export interface LoungeMessage {
  id: string;
  from: string;
  text: string;
  t: number;
}

/** Listens to the newest lounge messages, oldest first. Returns a function that stops listening. */
export async function subscribeLounge(onMessages: (m: LoungeMessage[]) => void, onError: (e: Error) => void): Promise<() => void> {
  const { fs, db } = await connect();
  const q = fs.query(fs.collection(db, COLLECTIONS.lounge), fs.orderBy('t', 'desc'), fs.limit(CLOUD_LIMITS.lounge));
  return fs.onSnapshot(
    q,
    (snap) =>
      onMessages(
        snap.docs
          .map((d) => {
            const x = d.data({ serverTimestamps: 'estimate' }) as Raw;
            return { id: d.id, from: String(x.from ?? 'Visitor'), text: String(x.text ?? ''), t: millis(x.t) };
          })
          .reverse(),
      ),
    onError,
  );
}

export async function sendLoungeMessage(from: string, text: string): Promise<void> {
  const { fs, uid } = await connect();
  await addLimited('lounge', COLLECTIONS.lounge, { from, fromId: uid, text, t: fs.serverTimestamp() });
}
