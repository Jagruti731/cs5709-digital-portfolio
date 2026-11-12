# Digital Portfolio – Jagruti Badgujar

**Live site: https://jagruti731.github.io/cs5709-digital-portfolio/** · Repository: https://github.com/Jagruti731/cs5709-digital-portfolio

CS5709 Software Engineering Evolution, University of Limerick (2026–27). Student ID 26352893.
Version 2.0 is Phase 2 (Assessment 3). It continues Phase 1, which evolved the lecturer's starter
portfolio ([saaysalim/Salim-Saay](https://github.com/saaysalim/Salim-Saay)) in place, so the whole history,
from the starter to this version, is in this repository.

This file is the single source of documentation. GitHub shows it on the repository page, and the site
shows the same file on its **Readme** page (`src/pages/Readme.tsx` imports it), so the two cannot drift apart.

## 1. Overview

| Item | Detail |
| --- | --- |
| What | A personal portfolio: Home, About, Education, Professional Knowledge, Pictures, Videos, Blog with a community feed, Messages (instant messaging), Readme and Search |
| Stack | React 18, TypeScript (strict), Vite 6, React Router 6 (HashRouter), Redux Toolkit, plain CSS |
| Phase 1 (v1.0) | Starter analysed and evolved: 10 typed change requests, CR-01 to CR-10 |
| Phase 2 (v2.0) | Peer review and lecturer feedback applied, JSON content, CI/CD, live on GitHub Pages, innovation features |

| Tag | Meaning |
| --- | --- |
| `v0-starter` | The starter exactly as downloaded |
| `v1.0` | End of Phase 1 (Assessment 1) |
| `v2.0` | End of Phase 2 (Assessment 3) |

```bash
git log --oneline v1.0..v2.0     # every Phase 2 change, one commit each
```

## 2. Quick start

Requires Node.js 22 or later.

```bash
npm ci               # install exactly the versions in package-lock.json
npm run dev          # http://localhost:3000
npm run build        # strict type check, then the static site in build/
npm run preview      # serve build/ on http://localhost:4173
```

| Script | What it does |
| --- | --- |
| `npm run lint` | ESLint with TypeScript and React hooks rules, zero warnings allowed |
| `npm run format:check` | Prettier: fails if any file is not formatted |
| `npm run typecheck` | `tsc --noEmit` in strict mode |
| `npm test` | Vitest unit and component tests |
| `npm run test:coverage` | the same, with a coverage report and minimum thresholds |
| `npm run test:api` | API server tests against a temporary data folder |
| `npm run test:e2e` | Playwright walkthrough of the built site |
| `npm run ci` | everything the pipeline checks, in the same order |

Optional API server for a shared community feed:

```bash
cd server && npm ci && npm start                       # http://localhost:5000
VITE_API_URL=http://localhost:5000 npm run dev
```

## 3. Project structure

```text
├── .github/workflows/        CI/CD pipeline
├── docs/diagrams/            Mermaid sources of every diagram (rendered to public/diagrams)
├── public/
│   ├── data/                 JSON content files (dynamic data, loaded at run time)
│   ├── diagrams/             rendered diagrams (SVG)
│   └── images/ videos/       media
├── server/                   optional Express API (posts, comments, likes, accounts)
├── src/
│   ├── main.tsx · App.tsx    entry point and router
│   ├── routes.tsx            page list joined with page components
│   ├── config/site.ts        site constants and limits (no magic numbers in components)
│   ├── types/content.ts      typed contracts for every JSON file
│   ├── services/             the only code that talks to the network or storage
│   ├── store/                Redux slices: content, posts, auth, github
│   ├── hooks/                useContent, useStoredState, typed Redux hooks
│   ├── features/             feature folders: logic in a hook, display in components
│   │   ├── feed/             usePostFeed · PostForm · PostCard · SignInForm
│   │   ├── chat/             useChat · answers · Chat
│   │   └── docs/             README renderer · Requirements · ChangeLog
│   ├── components/           shared UI: Layout, Navbar, Section, Card, LoadState …
│   ├── pages/                one file per route
│   └── styles/global.css     the only stylesheet
└── tools/                    API test, browser test, diagram renderer, metrics
```

Every source file starts with an `@file` JSDoc comment that says what the file does and where its data
comes from, and exported functions have JSDoc comments.

## 4. Architecture

![Phase 2 architecture](public/diagrams/architecture-v2.svg)

**Figure 1. Block diagram.** Content and code are checked and built by GitHub Actions and published to
GitHub Pages. In the browser, the router loads each page on demand, pages read content through the Redux
store, and the store fetches JSON files from the site and live data from the GitHub API.

![Module view](public/diagrams/modules-v2.svg)

**Figure 2. Component (module) view.** Dependencies only point downwards: pages use features and shared
components; features use the store; only `services/` talks to the network.

### 4.1 Why each folder is its own part (partitioning)

| Part | Responsibility | May depend on |
| --- | --- | --- |
| `pages/` | Lay out one route | components, features, hooks |
| `features/` | One user-facing feature: logic in a `use…` hook, display in components | store, services, config |
| `components/` | Shared presentation with no data access | config, types |
| `hooks/` | Connect React to the store | store |
| `store/` | Shared state and its transitions | services, types |
| `services/` | Network and storage, nothing else | config, types |
| `config/`, `types/` | Constants and contracts | nothing |

The rule "dependencies point downwards" keeps a change local: for example, moving the feed to a hosted
API changes `services/postsApi.ts` and `features/feed/usePostFeed.ts` only.

### 4.2 Loading content (control flow)

![Content loading flow](public/diagrams/flow-content.svg)

**Figure 3. Control flow of `useContent`.** A content file is fetched once, checked against its shape
rule, and cached in the store. Every failure has a readable reason and a *Try again* button.

## 5. Requirements

Phase 1 took its requirements from the brief. Phase 2 starts from three personas, each with a scenario
(Cooper, 2004; Carroll, 2000), eleven user stories, and a feature list in which every feature is traced to
the stories it serves. They live in `public/data/requirements.json` and are shown, with a phase filter,
on the Readme page under **Requirements**.

| Persona | Scenario in one line |
| --- | --- |
| P1 Aoife, hiring manager in Dublin | Two minutes between interviews: projects first, filter by .NET, check GitHub activity |
| P2 Dr Saay, module assessor | Checks every brief item, follows the review table to commits, checks the pipeline is green |
| P3 Rahul, fellow MSc student | Reads a post, asks the assistant, comments, re-reads offline on the bus |

A unit test fails if a story points to a persona or feature that does not exist.

## 6. Dynamic data with JSON files

All page content is in `public/data/*.json`, separate from the code. Editing text never touches a
component, and the files are fetched at run time, cached in the Redux store, and validated before use.

| File | Used by |
| --- | --- |
| `profile.json` | Home, About |
| `projects.json` | Home, Professional Knowledge, Search |
| `career.json` | Home, About |
| `education.json` | Education |
| `gallery.json` | Pictures |
| `videos.json` | Videos |
| `blog.json` | Blog |
| `requirements.json` | Readme → Requirements |
| `changelog.json` | Readme → Change log |

## 7. State management

Redux Toolkit holds state that more than one component needs:

| Slice | Holds |
| --- | --- |
| `content` | each JSON file with its status: idle, loading, ready or error |
| `posts` | community feed posts, comments and likes |
| `auth` | the user signed in to the optional API |
| `github` | live data from the GitHub API, with its loading status |

State that belongs to one component (a form draft, an open picture) stays in `useState`, and state that
must survive a reload (theme, chat history, local posts) is saved with `useStoredState`.

## 8. Testing

| Level | Tool | What is checked |
| --- | --- | --- |
| Unit | Vitest | reducers, content validation of every real JSON file, chat answers, README renderer |
| Component | Vitest + Testing Library | PostCard, LoadState, image size limit |
| API | bash + curl (`tools/api-test.sh`) | 16 checks: auth, ownership, body limit, corrupt-file safety |
| Browser | Playwright (`tools/browser-test.mjs`) | every route renders, navigation, filters, chat, no console errors |

## 9. CI/CD pipeline

`.github/workflows/ci-cd.yml` runs on every push to any branch, on pull requests to `main`, and by hand
(*Run workflow*). It has four jobs:

![CI/CD pipeline](public/diagrams/pipeline.svg)

**Figure 4. The pipeline.** `quality` and `api` run in parallel; `build` starts only if both pass;
`deploy` runs only for a push to `main`.

| Job | Steps | Fails when |
| --- | --- | --- |
| `quality` | `npm ci`, ESLint, Prettier, `tsc`, Vitest with coverage; reports kept as an artifact | any lint warning, unformatted file, type error, failing test, or coverage below 50% |
| `api` | `npm ci` in `server/`, `tools/api-test.sh` | any of the 16 API checks returns the wrong status |
| `build` | `vite build`, Playwright walkthrough of the built site, upload of `build/` as the Pages artifact | the build fails, or any walkthrough step fails |
| `deploy` | `actions/deploy-pages` to the `github-pages` environment | (only runs after `build` passes on `main`) |

Design decisions:

- **Fail fast, deploy once.** Cheap checks run first and in parallel; the site is built once, tested,
  and that exact artifact is deployed. Nothing reaches the live site without passing every check.
- **Least privilege.** The workflow token can only read the repository; only `deploy` gets
  `pages: write` and `id-token: write`.
- **Reproducible.** `npm ci` installs exactly the versions in `package-lock.json`; Node 22 everywhere.
- **No wasted runs.** A newer push cancels the older run on the same branch, but a deployment that
  has started is never cancelled.
- **Kept evidence.** Test, coverage and browser reports are uploaded as artifacts for 14 days.
- **Dependencies stay current.** Dependabot (`.github/dependabot.yml`) opens weekly update pull
  requests, and each one has to pass the same pipeline.

Run the same checks locally before pushing: `npm run ci`.

## 10. Deployment (GitHub Pages)

The site is static, so GitHub Pages serves it directly; there is no server to run.

1. One-time setup: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. The `deploy` job publishes the tested `build/` folder.
3. The URL appears on the run summary and under **Environments → github-pages**.

Two choices make the same build work under the repository sub-folder (`/cs5709-digital-portfolio/`):
Vite builds with relative paths (`base: './'`), and `HashRouter` keeps every route inside `index.html`
(`/#/about`), so a refresh on any page never returns a 404.

## 11. Interactivity and performance

### 11.1 GSAP animations

GSAP (with its ScrollTrigger and Flip plugins) adds movement that explains rather than decorates.
All of it lives in `src/features/motion/`:

| Hook | Where | What it does |
| --- | --- | --- |
| `usePageIntro` | every page (Layout) | the banner title and summary slide in when a page opens |
| `useScrollReveal` | every page (Layout) | cards, case studies, timeline entries and pictures fade up as they scroll into view; a MutationObserver picks up content that loads later |
| `useCountUp` | Home | the key numbers count up from zero when they appear |
| `useFlip` | Professional Knowledge, Pictures | when a filter changes, the remaining cards glide to their new places and new ones fade in |

Rules every animation follows:

- **Reduced motion is respected.** If the visitor's system asks for less motion, GSAP is never even
  downloaded and everything appears at once (WCAG 2.2, success criterion 2.3.3).
- **Nothing visible flickers.** Only blocks below the fold are hidden before they animate.
- **GSAP is lazy-loaded.** It is imported dynamically, so its 70 kB arrive after the page is usable.
- **One rhythm.** Durations, distances and easing come from one `MOTION` constant.

### 11.2 Search and filters

| Page | Filter |
| --- | --- |
| Professional Knowledge | case studies by technology and by free text (user story US2), animated with Flip |
| Pictures | by category (places, work, life), animated with Flip |
| Blog | articles by tag |
| Readme → Requirements | features by phase |
| Readme → Change log | changes by phase and maintenance type |
| Search | the whole site, see section 12 |

### 11.3 Lazy loading

- **Pages:** every page is a `React.lazy` chunk downloaded on its first visit, inside `Suspense`
  (skeleton while loading) and an error boundary (reload button if a chunk cannot be fetched).
  The main bundle fell from 257 kB to 206 kB.
- **Libraries:** GSAP and the Markdown renderer load only on the pages that use them.
- **Media:** images use `loading="lazy"` and `decoding="async"`; videos load metadata only.
- **Data:** each JSON file is fetched only when a page first needs it.

## 12. Innovation

Four features go beyond a static GitHub Pages portfolio and beyond what was covered in class.

### 12.1 Smart search and concept location in the code

`src/features/search/searchIndex.ts` is a small search engine written for this site (no library), so
every step can be read and tested:

1. **Tokenise:** lower case, split `camelCase`, keep `.NET` and `C#`, drop stop words.
2. **Inverted index:** each term points to the documents and fields it appears in.
3. **Rank with BM25** (Robertson & Zaragoza, 2009), with field weights title 3, tags 2, body 1.
4. **Expand each query word:** prefix matches (search as you type) and near misses within one or two
   edits (Levenshtein distance), each scored lower than an exact match. When a word was only found as a
   near miss, the page says *Showing results for …* (try `Gemni bank`).
5. **Highlight** the matched terms in each result.

Two collections can be searched:

- **This site:** 51 items: pages, case studies, projects, skills, articles, qualifications, jobs, pictures and videos.
  Results can be filtered by type, and the query is kept in the URL, so a search can be shared.
- **Source code:** *concept location*, a core software-evolution task (Rajlich & Wilde, 2002): given a
  concept, find the code that implements it. `tools/build-code-index.mjs` indexes every source file
  (its `@file` header, exported names and comments) at build time; the same BM25 engine ranks the files
  (an information-retrieval approach to concept location, as in Marcus et al., 2004). Searching `skip link` returns
  `src/components/Layout.tsx` first, and each result opens the file on GitHub. This only works because
  Phase 2 gave every file a descriptive header comment.

Press `/` anywhere on the site to open Search.

### 12.2 Live GitHub data

The **Dashboard** page (tab *GitHub (live)*) calls the GitHub REST API from the visitor's browser on
every visit (`src/services/githubApi.ts`, state in `store/githubSlice.ts`):

| Shown | API endpoint |
| --- | --- |
| account summary and languages | `GET /users/Jagruti731`, `GET /users/Jagruti731/repos` |
| the latest 10 runs of this site's CI/CD pipeline, passed or failed | `GET /repos/Jagruti731/cs5709-digital-portfolio/actions/runs` |
| the latest commits to this site | `GET /repos/Jagruti731/cs5709-digital-portfolio/commits` |

- **Rate limit:** GitHub allows 60 requests an hour without a token. Every answer is cached with its
  ETag; the next request sends `If-None-Match`, and an unchanged answer (`304`) does not count.
  The page shows how many requests are left.
- **Failure:** offline, the last copy is shown; at the limit, the page says when to try again; a
  repository with no runs yet says so instead of failing.
- **Interaction:** repositories can be filtered by language and sorted; *Refresh* reloads everything.
- **Testing:** unit tests replace `fetch`; the browser test answers GitHub requests itself, so CI never
  depends on GitHub's limit.

This replaces the starter's parked `legacy/phase2-candidates/GitHubIntegration.tsx`, which was deleted.

## 13. Response to the reviews

Phase 2 started from two reviews of Phase 1: the lecturer's feedback (12.5/15) and the peer review by
Chirag Aggarwal (2026).

| # | Recommendation | Source | Action | Change |
| --- | --- | --- | --- | --- |
| 1 | Add personas and scenarios to requirements discovery | Lecturer, peer | 3 personas, scenarios, 11 user stories, traced features | CR-15 |
| 2 | Explain the code structure in code comments | Lecturer | `@file` JSDoc header on every source file | CR-13 |
| 3 | Divide the report into clear sections | Lecturer | README and report follow the template sections | CR-17 |
| 4 | Split CommunityFeed and Chat; move logic into hooks | Peer | `usePostFeed`, `useChat` and small view components | CR-13 |
| 5 | Add Prettier and ESLint and run them in CI | Peer | Both added; zero warnings enforced | CR-11 |
| 6 | Name constants instead of magic numbers | Peer | `config/site.ts` (LIMITS, CHAT_TIMING) | CR-12, CR-13 |
| 7 | Skip link breaks HashRouter | Peer | Link now focuses `<main>` | CR-14 |
| 8 | Comment author taken from the request body | Peer | Author from the session token; likes too | CR-14 |
| 9 | Corrupt data file is overwritten with `[]` | Peer | Request fails with 500; file untouched; atomic writes | CR-14 |
| 10 | Tests delete the real data files | Peer | Tests use a temporary `DATA_DIR` | CR-14 |
| 11 | 1 MB images exceed the 100 kB body limit | Peer | Limit 2 MB, covered by a test | CR-14 |
| 12 | Replace hard-coded pass counts with assertions; unit tests | Peer | 16 asserted API checks; Vitest suite | CR-14, CR-16 |
| 13 | Generate the README page from one source | Peer | Readme page renders this file | CR-17 |
| 14 | Add the debt register as a numbered table | Peer | Section 16 | CR-17 |
| 15 | Name the recovery methods; add a generated dependency graph | Peer | Section 4.1 (partitioning) and the quality dashboard | CR-17, CR-24 |
| 16 | Add the live link to the README | Peer | First line of this file | CR-17 |
| 17 | Switch references to APA style | Peer | Section 17 | CR-17 |
| 18 | Remove the 18 pages of CSS from the report | Peer | The Phase 2 report links to the code instead | report |

Not applied: the suggestion to keep stories in a Volere shell. A JSON file in the repository was chosen
instead, because it is versioned with the code and checked by a unit test.

## 14. Coding standards

- TypeScript strict mode; no `any` outside tests.
- ESLint (`eslint.config.js`): recommended JavaScript and TypeScript rules, React hooks rules,
  complexity warning above 12, functions longer than 120 lines flagged. CI allows zero warnings.
- Prettier (`.prettierrc.json`): 140-character lines, single quotes, trailing commas.
- File names: components and pages in PascalCase, hooks start with `use`, tests end in `.test.ts(x)`.
- Commits: `<maintenance type>: <what changed> (CR-nn)`, with the reason in the body.

## 15. Change log

The full list, with a filter by phase and maintenance type, is on the Readme page under **Change log**
(`public/data/changelog.json`).

## 16. Technical-debt register (Phase 1)

| ID | Debt found in the starter | Fixed by |
| --- | --- | --- |
| TD-01 | Navigation held in component state: no URLs, refresh returns to the feed | CR-02 |
| TD-02 | Blog page missing from the menu list | CR-02 |
| TD-03 | Contact form only calls `console.log`; no instant messaging | CR-05 |
| TD-04 | API address `http://localhost:5000` hard-coded in five places | CR-05 |
| TD-05 | 40 of 48 UI primitives never imported; unused packages | CR-01, CR-06 |
| TD-06 | Passwords stored in plain text; delete needs no authentication | CR-07 |
| TD-07 | No compiler check: 79 strict TypeScript errors never reported | CR-06 |
| TD-08 | A saved web page (43 MB) and a copy of a `.git` folder committed | CR-01 |
| TD-09 | Base path tied to `/Salim-Saay/`; deploy script Windows-only | CR-08 |
| TD-10 | 58 KB of pre-compiled CSS without its configuration | CR-04 |
| TD-11 | Video gallery depends on YouTube embeds | CR-05 |
| TD-12 | README and architecture document out of step with the code | CR-09, CR-17 |

## 17. References

Aggarwal, C. (2026). *Assessment 2: Project peer review of “Digital Portfolio: Phase 1”* [Unpublished peer review]. University of Limerick.

Carroll, J. M. (2000). *Making use: Scenario-based design of human-computer interactions*. MIT Press.

Cooper, A. (2004). *The inmates are running the asylum: Why high-tech products drive us crazy and how to restore the sanity*. Sams.

Levenshtein, V. I. (1966). Binary codes capable of correcting deletions, insertions, and reversals. *Soviet Physics Doklady, 10*(8), 707–710.

Lientz, B. P., & Swanson, E. B. (1980). *Software maintenance management*. Addison-Wesley.

Marcus, A., Sergeyev, A., Rajlich, V., & Maletic, J. I. (2004). An information retrieval approach to concept location in source code. In *Proceedings of the 11th Working Conference on Reverse Engineering* (pp. 214–223). IEEE. https://doi.org/10.1109/WCRE.2004.10

Rajlich, V., & Wilde, N. (2002). The role of concepts in program comprehension. In *Proceedings of the 10th International Workshop on Program Comprehension* (pp. 271–278). IEEE. https://doi.org/10.1109/WPC.2002.1021348

Robertson, S., & Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval, 3*(4), 333–389. https://doi.org/10.1561/1500000019

Saay, S. (2026). *Salim-Saay: Digital portfolio* [Source code]. GitHub. https://github.com/saaysalim/Salim-Saay
