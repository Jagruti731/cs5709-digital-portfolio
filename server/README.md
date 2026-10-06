# Portfolio API (development server)

JSON-file backed Express API for the community feed. Data files (`posts.json`, `users.json`,
`sessions.json`) are created at runtime and are not committed.

    npm install && npm start      # http://localhost:5000 (PORT to change)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | /posts | – | newest first |
| POST | /posts | Bearer token | `{ content, image? }` |
| DELETE | /posts/:id | Bearer token | author only (403 otherwise) |
| POST | /posts/:id/comments | – | `{ author, content }` |
| POST | /posts/:id/likes | – | `{ author }` toggles |
| POST | /auth/register | – | `{ username, password }`, password stored as salted scrypt hash |
| POST | /auth/login | – | returns `{ token, username }` |

Development use only: sessions do not expire and there is no rate limiting (Phase 2).
