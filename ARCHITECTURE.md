# Architecture – version 1.0

## Style
Component-based single-page application with URL routing. Content is data; pages map data to markup.

## Layers (browser)
1. **Router** – `App.tsx` uses `HashRouter`; `routes.tsx` joins the page list in `lib/navigation.ts`
   with page components. Unknown paths render `pages/NotFound.tsx`.
2. **Layout** – `components/Layout.tsx`: skip link, `Navbar`, the routed page (`Outlet`), `Footer`.
   Sets the document title and scroll position on every route change.
3. **Pages** – `src/pages/*.tsx`, one per route.
4. **Shared components** – `PageHeader`, `Section`, `Card`, `Timeline`, `Lightbox`, `CommunityFeed`, `Chat`.
5. **Data and state** – typed modules in `src/data`; Redux store (`posts`, `auth` slices) for the feed;
   `services/postsApi.ts` is the only module that talks to the API or localStorage.

## Navigation
`lib/navigation.ts` holds one list of pages (path, label, title, description, keywords, inNav).
The router, the navigation bar and Search all read it, so they cannot drift apart.

## Community feed
`CommunityFeed` dispatches to the Redux `posts` slice. Without `VITE_API_URL` it saves the slice to
localStorage (key `postfeed.posts`) and makes no network request. With it, posts, likes and comments are
sent to the API; creating a post needs a token from `/auth/login` or `/auth/register`.

## Instant messaging
`Chat` has two conversations: an assistant that answers from keyword rules, and a lounge that sends
messages to every open tab of the site through `BroadcastChannel`. History is kept in localStorage.
Messaging between devices needs a server (Phase 2).

## API server (`server/`)
Express with JSON files (created at runtime, not committed). Passwords are salted scrypt hashes; only the
signed-in author can delete a post. Endpoints: `GET/POST /posts`, `DELETE /posts/:id`,
`POST /posts/:id/comments`, `POST /posts/:id/likes`, `POST /auth/register`, `POST /auth/login`.

## Build and deployment
`tsc --noEmit` (strict) then Vite → `build/` with relative paths (`base: './'`), so any static host or
repository name works. `npm run deploy` or the GitHub Actions workflow publishes `build/` to `gh-pages`.

## Parked
`legacy/phase2-candidates/` keeps the starter's Analytics and GitHub pages for Phase 2.
