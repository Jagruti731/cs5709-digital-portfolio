/**
 * @file Security rules tests for the shared feed and lounge (CR-31).
 *
 * Runs firestore.rules in the Firestore emulator and checks, as real visitors would
 * try it, what is allowed and what is refused. Run by the CI/CD "rules" job:
 *
 *   npx firebase emulators:exec --only firestore --project demo-portfolio "node tools/rules-test.mjs"
 *
 * Writes coverage/rules-results.json in the same shape as the API and browser tests,
 * so the quality report counts these checks too. Exits with 1 if any check fails.
 */
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const env = await initializeTestEnvironment({
  projectId: 'demo-portfolio',
  firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
});

const results = [];
// Each check starts with no rate-limit history, so earlier checks do not slow it down.
async function resetLimits() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const uid of ['anna', 'ben', 'mod']) await deleteDoc(doc(ctx.firestore(), `limits/${uid}`));
  });
}

async function check(name, attempt) {
  await resetLimits();
  try {
    await attempt();
    results.push({ name, ok: true });
    console.log(`  ok   ${name}`);
  } catch (err) {
    results.push({ name, ok: false, detail: String(err?.message ?? err).slice(0, 200) });
    console.log(`  FAIL ${name}\n       ${err?.message ?? err}`);
  }
}

const KIND = { posts: 'post', comments: 'comment', lounge: 'lounge' };

/** Writes a new document the way the site does: in one batch with the caller's rate-limit stamp. */
async function send(db, uid, col, data, stamp = { [KIND[col]]: serverTimestamp() }) {
  const batch = writeBatch(db);
  const ref = doc(collection(db, col));
  batch.set(ref, data);
  if (stamp) batch.set(doc(db, `limits/${uid}`), stamp, { merge: true });
  await batch.commit();
  return ref;
}

const anna = env.authenticatedContext('anna').firestore();
const mod = env.authenticatedContext('mod').firestore();
const ben = env.authenticatedContext('ben').firestore();
const nobody = env.unauthenticatedContext().firestore();

const post = (uid, extra = {}) => ({
  author: 'Anna',
  authorId: uid,
  content: 'Hello from the test',
  image: null,
  createdAt: serverTimestamp(),
  likedBy: [],
  ...extra,
});

// A post written directly (rules off), used by the update, delete and comment checks.
await env.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), 'admins/mod'), { note: 'moderator for the tests' });
  await setDoc(doc(ctx.firestore(), 'posts/p1'), { ...post('anna'), createdAt: Timestamp.now(), likedBy: ['carl'] });
});

console.log('Firestore security rules');

// Reading
await check('anyone can read posts', () => assertSucceeds(getDoc(doc(nobody, 'posts/p1'))));
await check('nothing outside posts, comments and lounge can be read', () => assertFails(getDoc(doc(nobody, 'secrets/x'))));

// Creating posts
await check('a signed-in visitor can post', () => assertSucceeds(send(anna, 'anna', 'posts', post('anna'))));
await check('a visitor who is not signed in cannot post', () => assertFails(send(nobody, 'nobody', 'posts', post('anna'))));
await check('nobody can post in someone else’s name', () => assertFails(send(ben, 'ben', 'posts', post('anna'))));
await check('an empty post is refused', () => assertFails(send(anna, 'anna', 'posts', post('anna', { content: '' }))));
await check('a post over 1000 characters is refused', () =>
  assertFails(send(anna, 'anna', 'posts', post('anna', { content: 'x'.repeat(1001) }))),
);
await check('a time sent by the browser is refused', () =>
  assertFails(send(anna, 'anna', 'posts', post('anna', { createdAt: Timestamp.fromMillis(0) }))),
);
await check('a post cannot start with likes', () => assertFails(send(anna, 'anna', 'posts', post('anna', { likedBy: ['anna'] }))));
await check('unknown fields are refused', () => assertFails(send(anna, 'anna', 'posts', post('anna', { admin: true }))));
await check('a small JPEG picture is accepted', () =>
  assertSucceeds(send(anna, 'anna', 'posts', post('anna', { image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' }))),
);
await check('a picture close to the 400 KB limit is accepted', () =>
  assertSucceeds(send(anna, 'anna', 'posts', post('anna', { image: 'data:image/jpeg;base64,' + 'A'.repeat(399_000) }))),
);
await check('a picture over 400 KB is refused', () =>
  assertFails(send(anna, 'anna', 'posts', post('anna', { image: 'data:image/jpeg;base64,' + 'A'.repeat(400_001) }))),
);
await check('a picture that is not an image data URL is refused', () =>
  assertFails(send(anna, 'anna', 'posts', post('anna', { image: 'javascript:alert(1)' }))),
);

// Likes
await check('a visitor can like a post', () => assertSucceeds(updateDoc(doc(ben, 'posts/p1'), { likedBy: arrayUnion('ben') })));
await check('a visitor can take back their like', () => assertSucceeds(updateDoc(doc(ben, 'posts/p1'), { likedBy: arrayRemove('ben') })));
await check('nobody can add a like for someone else', () => assertFails(updateDoc(doc(ben, 'posts/p1'), { likedBy: arrayUnion('dora') })));
await check('nobody can remove someone else’s like', () => assertFails(updateDoc(doc(ben, 'posts/p1'), { likedBy: arrayRemove('carl') })));
await check('a like cannot change the text of a post', () =>
  assertFails(updateDoc(doc(ben, 'posts/p1'), { likedBy: arrayUnion('ben'), content: 'changed' })),
);

// Comments
const comment = (uid, postId = 'p1', extra = {}) => ({
  postId,
  author: 'Ben',
  authorId: uid,
  content: 'Nice post',
  createdAt: serverTimestamp(),
  ...extra,
});
await check('a visitor can comment on a post', () => assertSucceeds(send(ben, 'ben', 'comments', comment('ben'))));
await check('a comment on a post that does not exist is refused', () =>
  assertFails(send(ben, 'ben', 'comments', comment('ben', 'missing'))),
);
await check('a comment over 400 characters is refused', () =>
  assertFails(send(ben, 'ben', 'comments', comment('ben', 'p1', { content: 'x'.repeat(401) }))),
);
await check('comments cannot be edited', async () => {
  const ref = await send(ben, 'ben', 'comments', comment('ben'));
  await assertFails(updateDoc(ref, { content: 'edited' }));
});

// Lounge
const message = (uid, extra = {}) => ({ from: 'Visitor-1234', fromId: uid, text: 'Hi everyone', t: serverTimestamp(), ...extra });
await check('a visitor can send a lounge message', () => assertSucceeds(send(ben, 'ben', 'lounge', message('ben'))));
await check('a lounge message in someone else’s name is refused', () => assertFails(send(ben, 'ben', 'lounge', message('anna'))));
await check('a lounge message cannot be deleted', async () => {
  const ref = await send(ben, 'ben', 'lounge', message('ben'));
  await assertFails(deleteDoc(ref));
});

// Rate limiting (CR-58)
await check('a post without the rate-limit stamp is refused', () => assertFails(send(anna, 'anna', 'posts', post('anna'), null)));
await check('a second post within 30 seconds is refused', async () => {
  await send(anna, 'anna', 'posts', post('anna'));
  await assertFails(send(anna, 'anna', 'posts', post('anna')));
});
await check('a comment right after a post is still allowed (separate limits)', async () => {
  await send(ben, 'ben', 'posts', post('ben', { author: 'Ben' }));
  await assertSucceeds(send(ben, 'ben', 'comments', comment('ben')));
});
await check('a second lounge message within 3 seconds is refused', async () => {
  await send(ben, 'ben', 'lounge', message('ben'));
  await assertFails(send(ben, 'ben', 'lounge', message('ben')));
});
await check('a rate-limit stamp with a time from the browser is refused', () =>
  assertFails(send(anna, 'anna', 'posts', post('anna'), { post: Timestamp.fromMillis(0) })),
);
await check('nobody can write another visitor’s rate-limit record', () =>
  assertFails(setDoc(doc(ben, 'limits/anna'), { post: serverTimestamp() })),
);
await check('a visitor cannot delete their rate-limit record to skip the wait', async () => {
  await send(anna, 'anna', 'posts', post('anna'));
  await assertFails(deleteDoc(doc(anna, 'limits/anna')));
});

// Moderation (CR-58)
await check('nobody can make themselves an admin', () => assertFails(setDoc(doc(ben, 'admins/ben'), { note: 'me' })));
await check('a visitor can see whether they are an admin, but not who else is', async () => {
  await assertSucceeds(getDoc(doc(mod, 'admins/mod')));
  await assertFails(getDoc(doc(ben, 'admins/mod')));
});
await check('a visitor cannot delete someone else’s comment', async () => {
  const ref = await send(ben, 'ben', 'comments', comment('ben'));
  await assertFails(deleteDoc(doc(anna, ref.path)));
});
await check('an admin can remove a comment', async () => {
  const ref = await send(ben, 'ben', 'comments', comment('ben'));
  await assertSucceeds(deleteDoc(doc(mod, ref.path)));
});
await check('an admin can remove a lounge message', async () => {
  const ref = await send(ben, 'ben', 'lounge', message('ben'));
  await assertSucceeds(deleteDoc(doc(mod, ref.path)));
});

// Deleting posts
await check('only the author can delete a post', () => assertFails(deleteDoc(doc(ben, 'posts/p1'))));
await check('an admin can remove anyone’s post', async () => {
  const ref = await send(anna, 'anna', 'posts', post('anna'));
  await assertSucceeds(deleteDoc(doc(mod, ref.path)));
});
await check('the author can delete their post', () => assertSucceeds(deleteDoc(doc(anna, 'posts/p1'))));

await env.cleanup();

mkdirSync(new URL('../coverage', import.meta.url), { recursive: true });
writeFileSync(new URL('../coverage/rules-results.json', import.meta.url), JSON.stringify({ results }, null, 2) + '\n');
const failed = results.filter((r) => !r.ok).length;
console.log(`${results.length - failed}/${results.length} rules checks passed`);
process.exit(failed ? 1 : 0);
