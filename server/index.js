/**
 * @file Optional API server for the community feed (Express, JSON files).
 *
 * The site works without it: on GitHub Pages posts stay in the visitor's
 * browser. When the site is built with VITE_API_URL, posts, comments, likes
 * and accounts are stored here instead.
 *
 * Phase 2 fixes from the peer review (Aggarwal, 2026, Table 3), CR-14:
 *  - comments and likes take their author from the session token, not the body
 *  - a corrupt data file stops the request (500) instead of being overwritten with []
 *  - every write goes to a temporary file first, then is renamed (no half-written files)
 *  - JSON body limit raised to 2 MB so a 1 MB image (about 1.37 MB as base64) fits
 *  - DATA_DIR lets the tests use a throw-away folder instead of the real data
 *
 * Security additions (CR-58):
 *  - rate limiting: too many sign-in attempts or writes from one client get 429 Too Many Requests
 *  - sessions expire (SESSION_HOURS, default 24) instead of lasting for ever
 *  - an admin role: users named in ADMIN_USERS may remove any post or comment (moderation)
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/** Largest accepted request body. Must stay above LIMITS.postImageBytes in src/config/site.ts once base64-encoded. */
const BODY_LIMIT = '2mb';
const DATA_DIR = process.env.DATA_DIR || __dirname;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';
/** How long a sign-in lasts. */
const SESSION_MS = Number(process.env.SESSION_HOURS || 24) * 3600 * 1000;
/** Moderators: user names that may remove any post or comment, e.g. ADMIN_USERS=jagruti. */
const ADMINS = new Set(
  (process.env.ADMIN_USERS || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
);
/** Rate limits per client and minute: sign-in attempts and writes. */
const AUTH_PER_MINUTE = Number(process.env.AUTH_PER_MINUTE || 10);
const WRITES_PER_MINUTE = Number(process.env.WRITES_PER_MINUTE || 30);

const app = express();
app.use(express.json({ limit: BODY_LIMIT }));
// CORS: the site is served from a different origin (GitHub Pages or Vite) than this API.
// Set CORS_ORIGIN to the site's address in production; '*' is for local development.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/**
 * Fixed-window rate limiter kept in memory: at most `max` requests per minute for each key
 * (the client's IP address). Over the limit the request is refused with 429 and Retry-After.
 */
function rateLimit(max) {
  const windows = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const w = windows.get(key);
    if (!w || now - w.start >= 60_000) {
      windows.set(key, { start: now, count: 1 });
      return next();
    }
    w.count += 1;
    if (w.count <= max) return next();
    res.set('Retry-After', String(Math.ceil((w.start + 60_000 - now) / 1000)));
    return res.status(429).json({ error: 'too many requests, please wait a minute' });
  };
}
const authLimit = rateLimit(AUTH_PER_MINUTE);
const writeLimit = rateLimit(WRITES_PER_MINUTE);

/** Random URL-safe id for posts, comments, users and session tokens (replaces the nanoid package). */
const nanoid = () => crypto.randomBytes(12).toString('base64url');

const DB_PATH = path.join(DATA_DIR, 'posts.json');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const SESSIONS_PATH = path.join(DATA_DIR, 'sessions.json');

/**
 * Reads a JSON data file. A missing file means "no data yet" and returns the fallback.
 * A file that exists but cannot be parsed THROWS: returning [] here (as the starter did)
 * meant the next write replaced every post with an empty list.
 */
function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.trim() === '') return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`${path.basename(file)} is not valid JSON: ${e.message}`);
  }
}

/** Writes a JSON data file atomically: a temporary file first, then a rename. */
function writeJson(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

const readDB = () => readJson(DB_PATH, []);
const writeDB = (posts) => writeJson(DB_PATH, posts);
const readUsers = () => readJson(USERS_PATH, []);
const writeUsers = (users) => writeJson(USERS_PATH, users);
const readSessions = () => readJson(SESSIONS_PATH, {});
const writeSessions = (sessions) => writeJson(SESSIONS_PATH, sessions);

// Passwords are stored as salted scrypt hashes, never in plain text (CR-07).
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
}

// Returns the username for a valid "Authorization: Bearer <token>" header, or null.
function userFromRequest(req) {
  const header = (req.get('authorization') || '').trim();
  if (!header.startsWith('Bearer ')) return null;
  const session = readSessions()[header.slice(7)];
  if (!session || typeof session !== 'object' || session.expires < Date.now()) return null; // expired or old format
  return session.user;
}

/** Starts a session for a user and returns its token. Expired sessions are cleaned up at the same time. */
function startSession(username) {
  const now = Date.now();
  const sessions = Object.fromEntries(Object.entries(readSessions()).filter(([, s]) => s && typeof s === 'object' && s.expires > now));
  const token = nanoid();
  sessions[token] = { user: username, expires: now + SESSION_MS };
  writeSessions(sessions);
  return token;
}

app.get('/posts', (req, res) => {
  const posts = readDB();
  // ensure posts have expected fields and return latest first
  const normalized = posts.map((p) => ({
    id: p.id,
    author: p.author || 'Anonymous',
    content: p.content || '',
    createdAt: p.createdAt || new Date().toISOString(),
    image: p.image || null, // optional data URL or remote URL
    comments: p.comments || [],
    likedBy: p.likedBy || [],
  }));
  res.json(normalized.reverse()); // latest first
});

app.post('/posts', writeLimit, (req, res) => {
  // require authentication to post
  const authorFromToken = userFromRequest(req);
  const { content, image } = req.body || {};
  if (!authorFromToken) {
    return res.status(401).json({ error: 'authentication required to create posts' });
  }
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'content is required' });
  }
  const posts = readDB();
  const post = {
    id: nanoid(),
    author: authorFromToken,
    content,
    image: image || null,
    comments: [],
    likedBy: [],
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  writeDB(posts);
  res.status(201).json(post);
});

// Only the signed-in author of a post, or an admin, may delete it. The starter allowed anyone (CR-07, CR-58).
app.delete('/posts/:id', writeLimit, (req, res) => {
  const user = userFromRequest(req);
  if (!user) return res.status(401).json({ error: 'authentication required' });
  const posts = readDB();
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'not found' });
  if (post.author !== user && !ADMINS.has(user)) return res.status(403).json({ error: 'only the author or an admin can delete this post' });
  writeDB(posts.filter((p) => p.id !== post.id));
  res.json({ success: true });
});

// Register a user. Development server: data lives in JSON files.
app.post('/auth/register', authLimit, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readUsers();
  if (users.find((u) => u.username === username)) return res.status(400).json({ error: 'username taken' });
  const user = { id: nanoid(), username, passwordHash: hashPassword(password) };
  users.push(user);
  writeUsers(users);
  // create session token and return it so client can auto-login
  const token = startSession(username);
  res.status(201).json({ id: user.id, username: user.username, token });
});

// Login: returns a simple token stored in sessions.json
app.post('/auth/login', authLimit, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readUsers();
  const user = users.find((u) => u.username === username && checkPassword(password, u.passwordHash));
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const token = startSession(username);
  res.json({ token, username, admin: ADMINS.has(username) });
});

// Add a comment. The author is the signed-in user (CR-14); the starter trusted an 'author' field in the body.
app.post('/posts/:id/comments', writeLimit, (req, res) => {
  const id = req.params.id;
  const author = userFromRequest(req);
  if (!author) return res.status(401).json({ error: 'authentication required to comment' });
  const { content } = req.body || {};
  if (!content || String(content).trim() === '') return res.status(400).json({ error: 'content is required' });
  const posts = readDB();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'post not found' });
  const comment = { id: nanoid(), author, content, createdAt: new Date().toISOString() };
  posts[idx].comments = posts[idx].comments || [];
  posts[idx].comments.push(comment);
  writeDB(posts);
  res.status(201).json(comment);
});

// Toggle the signed-in user's like (CR-14). The starter accepted any author name, or counted anonymous likes without limit.
app.post('/posts/:id/likes', writeLimit, (req, res) => {
  const author = userFromRequest(req);
  if (!author) return res.status(401).json({ error: 'authentication required to like' });
  const posts = readDB();
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  post.likedBy = post.likedBy || [];
  const found = post.likedBy.indexOf(author);
  if (found === -1) post.likedBy.push(author);
  else post.likedBy.splice(found, 1);
  writeDB(posts);
  res.json({ likes: post.likedBy.length });
});

// Moderation (CR-58): an admin may remove any comment; the comment's author may remove their own.
app.delete('/posts/:id/comments/:commentId', writeLimit, (req, res) => {
  const user = userFromRequest(req);
  if (!user) return res.status(401).json({ error: 'authentication required' });
  const posts = readDB();
  const post = posts.find((p) => p.id === req.params.id);
  const comment = post && (post.comments || []).find((c) => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'not found' });
  if (comment.author !== user && !ADMINS.has(user))
    return res.status(403).json({ error: 'only the author or an admin can remove this comment' });
  post.comments = post.comments.filter((c) => c.id !== comment.id);
  writeDB(posts);
  res.json({ success: true });
});

// Any error above (for example a corrupt data file) ends here: answer 500 and change nothing.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: `request body larger than ${BODY_LIMIT}` });
  console.error(err.message);
  res.status(500).json({ error: 'server error, no data was changed' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT} (data in ${DATA_DIR})`));
