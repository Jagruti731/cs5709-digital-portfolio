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
  addDoc,
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
} from 'firebase/firestore';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const env = await initializeTestEnvironment({
  projectId: 'demo-portfolio',
  firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
});

const results = [];
async function check(name, attempt) {
  try {
    await attempt();
    results.push({ name, ok: true });
    console.log(`  ok   ${name}`);
  } catch (err) {
    results.push({ name, ok: false, detail: String(err?.message ?? err).slice(0, 200) });
    console.log(`  FAIL ${name}\n       ${err?.message ?? err}`);
  }
}

const anna = env.authenticatedContext('anna').firestore();
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
  await setDoc(doc(ctx.firestore(), 'posts/p1'), { ...post('anna'), createdAt: Timestamp.now(), likedBy: ['carl'] });
});

console.log('Firestore security rules');

// Reading
await check('anyone can read posts', () => assertSucceeds(getDoc(doc(nobody, 'posts/p1'))));
await check('nothing outside posts, comments and lounge can be read', () => assertFails(getDoc(doc(nobody, 'secrets/x'))));

// Creating posts
await check('a signed-in visitor can post', () => assertSucceeds(addDoc(collection(anna, 'posts'), post('anna'))));
await check('a visitor who is not signed in cannot post', () => assertFails(addDoc(collection(nobody, 'posts'), post('anna'))));
await check('nobody can post in someone else’s name', () => assertFails(addDoc(collection(ben, 'posts'), post('anna'))));
await check('an empty post is refused', () => assertFails(addDoc(collection(anna, 'posts'), post('anna', { content: '' }))));
await check('a post over 1000 characters is refused', () =>
  assertFails(addDoc(collection(anna, 'posts'), post('anna', { content: 'x'.repeat(1001) }))),
);
await check('a time sent by the browser is refused', () =>
  assertFails(addDoc(collection(anna, 'posts'), post('anna', { createdAt: Timestamp.fromMillis(0) }))),
);
await check('a post cannot start with likes', () => assertFails(addDoc(collection(anna, 'posts'), post('anna', { likedBy: ['anna'] }))));
await check('unknown fields are refused', () => assertFails(addDoc(collection(anna, 'posts'), post('anna', { admin: true }))));
await check('a small JPEG picture is accepted', () =>
  assertSucceeds(addDoc(collection(anna, 'posts'), post('anna', { image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' }))),
);
await check('a picture close to the 400 KB limit is accepted', () =>
  assertSucceeds(addDoc(collection(anna, 'posts'), post('anna', { image: 'data:image/jpeg;base64,' + 'A'.repeat(399_000) }))),
);
await check('a picture over 400 KB is refused', () =>
  assertFails(addDoc(collection(anna, 'posts'), post('anna', { image: 'data:image/jpeg;base64,' + 'A'.repeat(400_001) }))),
);
await check('a picture that is not an image data URL is refused', () =>
  assertFails(addDoc(collection(anna, 'posts'), post('anna', { image: 'javascript:alert(1)' }))),
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
await check('a visitor can comment on a post', () => assertSucceeds(addDoc(collection(ben, 'comments'), comment('ben'))));
await check('a comment on a post that does not exist is refused', () =>
  assertFails(addDoc(collection(ben, 'comments'), comment('ben', 'missing'))),
);
await check('a comment over 400 characters is refused', () =>
  assertFails(addDoc(collection(ben, 'comments'), comment('ben', 'p1', { content: 'x'.repeat(401) }))),
);
await check('comments cannot be edited', async () => {
  const ref = await addDoc(collection(ben, 'comments'), comment('ben'));
  await assertFails(updateDoc(ref, { content: 'edited' }));
});

// Lounge
const message = (uid, extra = {}) => ({ from: 'Visitor-1234', fromId: uid, text: 'Hi everyone', t: serverTimestamp(), ...extra });
await check('a visitor can send a lounge message', () => assertSucceeds(addDoc(collection(ben, 'lounge'), message('ben'))));
await check('a lounge message in someone else’s name is refused', () => assertFails(addDoc(collection(ben, 'lounge'), message('anna'))));
await check('a lounge message cannot be deleted', async () => {
  const ref = await addDoc(collection(ben, 'lounge'), message('ben'));
  await assertFails(deleteDoc(ref));
});

// Deleting posts
await check('only the author can delete a post', () => assertFails(deleteDoc(doc(ben, 'posts/p1'))));
await check('the author can delete their post', () => assertSucceeds(deleteDoc(doc(anna, 'posts/p1'))));

await env.cleanup();

mkdirSync(new URL('../coverage', import.meta.url), { recursive: true });
writeFileSync(new URL('../coverage/rules-results.json', import.meta.url), JSON.stringify({ results }, null, 2) + '\n');
const failed = results.filter((r) => !r.ok).length;
console.log(`${results.length - failed}/${results.length} rules checks passed`);
process.exit(failed ? 1 : 0);
