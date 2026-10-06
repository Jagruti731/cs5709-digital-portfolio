# Digital Portfolio – Jagruti Badgujar

CS5709 Software Engineering Evolution, University of Limerick · Assessment 1 (Phase 1).

This repository is the lecturer's starter portfolio ([saaysalim/Salim-Saay](https://github.com/saaysalim/Salim-Saay))
**evolved in place** into my own portfolio. The starter's history is kept; every change since is a separate
commit named with its maintenance type.

```
git log --oneline v0-starter..v1.0     # the nine changes of Phase 1
```

| Tag | Meaning |
| --- | --- |
| `v0-starter` | The starter exactly as downloaded (233176a, 15 Sep 2026) |
| `v1.0-iteration1` | Iteration 1: dead weight removed, URL routing, Home + four pages |
| `v1.0` | Iteration 2: stylesheet, remaining pages, type checking, security and deploy fixes, documentation |

## Pages

Home · About · Education · Professional Knowledge · Pictures · Videos · Blog (articles + community feed) ·
Messages (instant messaging) · Readme (structure and evolution report) · Search · Not found.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # strict TypeScript check, then build/ (static files, relative paths)
npm run deploy       # publish build/ to the gh-pages branch
```

The site works on any static host. The community feed keeps posts in the visitor's browser unless the site
is built with `VITE_API_URL`, in which case it uses the API server:

```bash
cd server && npm install && npm start                 # http://localhost:5000
VITE_API_URL=http://localhost:5000 npm run build
```

## Checks

```bash
npm run typecheck                                      # strict TypeScript
node tools/metrics.mjs v0-starter HEAD                 # size of the system, writes src/data/metrics.json
npx vite preview --port 4173 &                         # serve the build
node tools/browser-test.mjs http://localhost:4173/     # Playwright smoke test
tools/api-test.sh                                      # API security checks with curl
```

## Stack

React 18, TypeScript (strict), Vite 6, React Router 6 (HashRouter), Redux Toolkit, one hand-written CSS file,
self-hosted fonts (@fontsource). Optional Node.js + Express API. See [ARCHITECTURE.md](ARCHITECTURE.md).
