import type { MouseEvent, ReactNode } from 'react';
import { PageHeader } from '../components/PageHeader';
import { changes } from '../data/changelog';
import metrics from '../data/metrics.json';
import { pages } from '../lib/navigation';

// ---------------------------------------------------------------------------
// Small presentational helpers used only on this page.
// ---------------------------------------------------------------------------
function Figure({ src, n, title, children }: { src: string; n: number; title: string; children: ReactNode }) {
  return (
    <figure className="figure">
      <div className="scroll">
        <img src={`./diagrams/${src}`} alt={`Figure ${n}: ${title}`} loading="lazy" />
      </div>
      <figcaption>
        <b>
          Figure {n}: {title}.
        </b>{' '}
        {children}
      </figcaption>
    </figure>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table className="skill-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const P1 = () => <span className="phase-tag p1">Phase 1 · done</span>;
const P2 = () => <span className="phase-tag p2">Phase 2 · planned</span>;
const Pass = ({ n }: { n?: string }) => <span className="check">Pass{n ? ` (${n})` : ''}</span>;

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
const toc: [string, string, string, [string, string][]][] = [
  ['discovery', 'Discovery', 'understanding the existing system', [['d-brief', 'Reading the brief'], ['d-history', "Mining the starter's history"], ['d-drift', 'Documented vs actual behaviour'], ['d-debt', 'Technical-debt register'], ['d-features', 'Feature list for Phase 1 and Phase 2'], ['d-scheme', 'Scheme of the portfolio']]],
  ['design', 'Design', 'from as-is to to-be', [['g-asis', 'Recovered as-is architecture'], ['g-block', 'Target architecture (block diagram)'], ['g-tree', 'Structure of the code'], ['g-flow', 'Control flow'], ['g-comp', 'Component diagram']]],
  ['dev1', 'Development, iteration 1', 'Home + four pages · navigation bar · routes', [['i1-pages', 'Home page and four additional pages'], ['i1-nav', 'Navigation bar'], ['i1-routes', 'Route table']]],
  ['dev2', 'Development, iteration 2', 'CSS · rendering · routing', [['i2-css', 'CSS for all pages'], ['i2-resp', 'Responsive layout and themes'], ['i2-render', 'Rendering and routing'], ['i2-log', 'Change log'], ['i2-size', 'Size of the system']]],
  ['evaluation', 'Evaluation', 'testing · critical review · enhancements', [['e-tests', 'Testing'], ['e-review', 'Critical review'], ['e-enh', 'Enhancements and Phase 2'], ['e-lehman', "Lehman's laws"]]],
];

const debt: [string, string, string, string][] = [
  ['TD-01', 'Navigation held in component state: no URLs, refresh returns to the feed, Back leaves the site', 'App.tsx:22', 'perfective'],
  ['TD-02', 'Blog page missing from the 11-item menu list; reachable only through Search', 'lib/navigation.ts:97', 'corrective'],
  ['TD-03', 'Contact form only calls console.log; no instant messaging, which the brief requires', 'Contact.tsx:36', 'corrective'],
  ['TD-04', 'API address http://localhost:5000 hard-coded in five places', 'PostFeed.tsx', 'adaptive'],
  ['TD-05', '40 of 48 UI primitives never imported; unused packages; 40 version-pinned import aliases', 'components/ui, package.json', 'preventive'],
  ['TD-06', 'Passwords stored in plain text; DELETE /posts/:id needs no authentication', 'server/index.js:113,129', 'corrective'],
  ['TD-07', 'No tsconfig and no compiler: 79 strict TypeScript errors never reported', 'repository root', 'preventive'],
  ['TD-08', 'A saved web page (447 files, 43 MB) and a copy of a .git folder committed', 'src/assets, Salim-Saay/', 'preventive'],
  ['TD-09', "Base path tied to '/Salim-Saay/'; deploy script finds only Windows git.exe", 'vite.config.ts:9', 'adaptive'],
  ['TD-10', '58 KB of pre-compiled CSS without the configuration that generated it', 'src/index.css', 'preventive'],
  ['TD-11', 'Video gallery depends on third-party YouTube embeds', 'VideoGallery.tsx', 'adaptive'],
  ['TD-12', 'README and ARCHITECTURE out of step with the code', 'README.md', 'preventive'],
];

const features: [string, string, string, string, boolean][] = [
  ['F01', 'Home page: introduction, key numbers, featured projects, career path', 'Pages', 'New', true],
  ['F02', 'About: story, quick facts, roles, experience timeline', 'Pages', 'Rewritten', true],
  ['F03', 'Education: qualifications timeline, certifications', 'Pages', 'Rewritten', true],
  ['F04', 'Professional Knowledge: case studies, projects, skills', 'Pages', 'Rewritten', true],
  ['F05', 'Pictures gallery: category filter and full-size viewer', 'Media', 'Rewritten', true],
  ['F06', 'Video gallery: player and playlist with local video files', 'Media', 'Evolved', true],
  ['F07', 'Blog: articles with tag filter, reachable from the menu', 'Community', 'Evolved', true],
  ['F08', 'Community feed: posts, images, likes, comments', 'Community', 'Evolved', true],
  ['F09', 'Instant messaging: auto-reply assistant and live lounge', 'Community', 'New', true],
  ['F10', 'Search across pages and case studies', 'Navigation', 'Evolved', true],
  ['F11', 'URL routing with NotFound and deep links', 'Navigation', 'New', true],
  ['F12', 'Navigation bar on every page, current page marked, mobile menu', 'Navigation', 'Evolved', true],
  ['F13', 'One hand-written responsive stylesheet with dark mode', 'Presentation', 'New', true],
  ['F14', 'Typed data modules and reusable components', 'Architecture', 'New', true],
  ['F15', 'Strict TypeScript check in every build', 'Quality', 'New', true],
  ['F16', 'API server: hashed passwords, protected delete, configurable address', 'Platform', 'Fixed', true],
  ['F17', 'Readme page describing the structure (this page)', 'Docs', 'Brief', true],
  ['F18', 'Hosted API so every visitor shares one feed', 'Platform', 'New', false],
  ['F19', 'Database instead of JSON files', 'Platform', 'New', false],
  ['F20', 'Real-time messaging across devices (WebSockets / SignalR)', 'Community', 'New', false],
  ['F21', 'Admin role to moderate posts, comments and messages', 'Platform', 'New', false],
  ['F22', 'Analytics and GitHub pages restored (parked starter code)', 'Pages', 'Starter', false],
  ['F23', 'Content management instead of data files', 'Platform', 'New', false],
  ['F24', 'Unit and end-to-end tests in CI', 'Quality', 'New', false],
  ['F25', 'WCAG 2.2 AA audit; video captions', 'Quality', 'New', false],
  ['F26', 'Route-based code splitting', 'Quality', 'New', false],
];

const references = [
  "Buckley, J., Mens, T., Zenger, M., Rashid, A. and Kniesel, G. (2005) 'Towards a taxonomy of software change', Journal of Software Maintenance and Evolution, 17(5), pp. 309–332.",
  "Chapin, N., Hale, J.E., Khan, K.M., Ramil, J.F. and Tan, W.-G. (2001) 'Types of software evolution and software maintenance', Journal of Software Maintenance and Evolution, 13(1), pp. 3–30.",
  "Chikofsky, E.J. and Cross, J.H. (1990) 'Reverse engineering and design recovery: a taxonomy', IEEE Software, 7(1), pp. 13–17.",
  'ISO/IEC/IEEE 14764:2022 Software engineering — Software life cycle processes — Maintenance.',
  "Lehman, M.M. (1980) 'Programs, life cycles, and laws of software evolution', Proceedings of the IEEE, 68(9), pp. 1060–1076.",
  'Lientz, B.P. and Swanson, E.B. (1980) Software Maintenance Management. Reading, MA: Addison-Wesley.',
  'Saay, S. (2026) Salim-Saay: Digital Portfolio [source code]. Available at: https://github.com/saaysalim/Salim-Saay (Accessed: 6 October 2026).',
];

export default function Readme() {
  const { before: v0, after: v1 } = metrics;
  return (
    <>
      <PageHeader
        title="Readme"
        crumb="Readme"
        intro="How this portfolio is structured, and how it evolved from the lecturer's starter portfolio. The sections follow the five stages of the CS5709 Assessment 1 marking scheme."
      />
      <div className="container report">
        <section className="section">
          <div className="prose">
            <p>
              This is Phase 1 of my CS5709 Software Engineering Evolution project. I treated the portfolio provided by the lecturer (
              <a href="https://github.com/saaysalim/Salim-Saay">saaysalim/Salim-Saay</a>) as an existing system: I analysed its code and its history,
              then fixed, restructured and extended it into my own portfolio in nine typed commits. It is a React 18 + TypeScript single-page
              application built with Vite, routed with React Router, with Redux Toolkit for the community feed and an optional Express API.
            </p>
            <p>
              <b>Run it locally:</b> <code>npm install</code>, then <code>npm run dev</code>. <code>npm run build</code> type-checks and creates{' '}
              <code>build/</code>. Optional server: <code>cd server &amp;&amp; npm install &amp;&amp; npm start</code>, then build the site with{' '}
              <code>VITE_API_URL=http://localhost:5000</code>. History: <code>git log --oneline v0-starter..v1.0</code>.
            </p>
          </div>
          <h3 className="sub-h">Table of contents</h3>
          <ol className="toc">
            {toc.map(([id, title, meta, subs], i) => (
              <li key={id}>
                <a href={`#${id}`} onClick={(e) => jump(e, id)}>
                  <span className="n">{i + 1}</span>
                  <span>
                    <b>{title}</b>
                  </span>
                  <span className="m">{meta}</span>
                </a>
                <ol>
                  {subs.map(([sid, st], j) => (
                    <li key={sid}>
                      <a href={`#${sid}`} onClick={(e) => jump(e, sid)}>
                        <span className="n">
                          {i + 1}.{j + 1}
                        </span>
                        <span>{st}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
            <li>
              <a href="#refs" onClick={(e) => jump(e, 'refs')}>
                <span className="n">6</span>
                <span>
                  <b>References</b>
                </span>
              </a>
            </li>
          </ol>
        </section>

        {/* 1 DISCOVERY */}
        <section className="section" id="discovery">
          <h2>1. Discovery</h2>
          <h3 className="sub-h" id="d-brief">
            1.1 Reading the brief
          </h3>
          <div className="prose">
            <p>
              The brief begins with "download an existing portfolio … and analyse that". In a module on software evolution I read that as the
              real task: understand a system I did not write before changing it, then change it in a controlled, measurable way. I cloned the
              starter with its full history and tagged it <code>v0-starter</code>, built it, ran a strict TypeScript check, started the API server
              and called every endpoint, and read every source file.
            </p>
          </div>
          <h3 className="sub-h" id="d-history">
            1.2 Mining the starter's history
          </h3>
          <div className="prose">
            <p>
              The starter has 20 commits between 10 October 2025 and 15 September 2026. Measured after each commit, its code grew from 7,105
              to 8,143 TypeScript lines (+15%) and its runtime dependencies from 44 to 47. By maintenance type: 7 perfective, 5 adaptive,
              4 documentation, 2 corrective, 2 other and <b>0 preventive</b>. Nothing was ever removed or simplified: Lehman's law of
              increasing complexity, visible in the history.
            </p>
          </div>
          <Figure src="history.svg" n={1} title="The starter's history">
            TypeScript lines in src/ after each of the 20 commits, with each commit's maintenance type.
          </Figure>
          <h3 className="sub-h" id="d-drift">
            1.3 Documented vs actual behaviour
          </h3>
          <Table
            head={['The documentation says', 'The code actually does']}
            rows={[
              ['Blog is one of the portfolio sections', 'Blog is not in the menu list, so it can only be reached through Search'],
              ['UI primitives give "consistent look and reduced duplicated markup"', '40 of the 48 files in components/ui are never imported'],
              ['Styling uses a "utility-first class approach"', '58 KB of pre-compiled CSS; new utility classes cannot be generated'],
              ['Write flow: try the API, on failure save locally', 'The API address is localhost:5000, so on the live site every write fails first'],
              ['Contact lets visitors get in touch', 'The submit handler only logs the form to the console'],
              ['Backend auth is "for development/demo use only"', 'Beyond demo: plain-text passwords, and anyone can delete any post'],
            ]}
          />
          <h3 className="sub-h" id="d-debt">
            1.4 Technical-debt register
          </h3>
          <Table
            head={['ID', 'Debt', 'Evidence', 'Fix type']}
            rows={debt.map(([id, text, where, type]) => [<b>{id}</b>, text, <code>{where}</code>, <span className={`pill ${type}`}>{type}</span>])}
          />
          <div className="grid g2">
            <div className="panel">
              <h3>Worth keeping</h3>
              <ul>
                <li>Component structure with one app shell (header, page, footer)</li>
                <li>Redux Toolkit posts and auth slices; optional API with a localStorage fallback</li>
                <li>A page descriptor list that drives the menu and Search</li>
                <li>Dark mode, a mobile menu and a GitHub Actions deploy workflow</li>
              </ul>
            </div>
            <div className="panel">
              <h3>Why evolve rather than rewrite</h3>
              <p>
                The parts above work and are understood. Evolving in place keeps the history, so every change is visible, reversible and typed;
                a rewrite would throw that away, and a reskin would leave all twelve debt items open.
              </p>
            </div>
          </div>
          <h3 className="sub-h" id="d-features">
            1.5 Feature list for Phase 1 and Phase 2
          </h3>
          <div className="prose">
            <p>
              26 features in 9 groups: 17 delivered in Phase 1 (everything the brief lists) and 9 planned for Phase 2, which moves the shared
              parts (feed, chat, accounts) onto real infrastructure, in the same order the starter itself was built.
            </p>
          </div>
          <Table head={['ID', 'Feature', 'Group', 'Origin', 'Phase']} rows={features.map(([id, f, g, o, p1]) => [<b>{id}</b>, f, g, o, p1 ? <P1 /> : <P2 />])} />
          <h3 className="sub-h" id="d-scheme">
            1.6 Scheme of the portfolio
          </h3>
          <Figure src="site-scheme.svg" n={2} title="Site scheme">
            Home links to eight menu pages; Search and NotFound sit outside the menu; every page shares the same Layout.
          </Figure>
          <div className="grid g2">
            <div className="panel">
              <h3>Page scheme</h3>
              <ol>
                <li>Navigation bar: name, menu, Search, theme toggle</li>
                <li>Page banner: breadcrumb, title, one-line summary</li>
                <li>Content sections on alternating backgrounds</li>
                <li>Footer: version, module, link to this Readme</li>
              </ol>
            </div>
            <div className="panel">
              <h3>Visual scheme: "field notebook"</h3>
              <p>Libre Caslon Display for headings, Karla for text, Courier Prime for labels; ruled lines instead of boxes.</p>
              <ul className="swatches">
                <li>
                  <i style={{ background: '#E9E7E0' }} />
                  paper
                  <br />
                  #E9E7E0
                </li>
                <li>
                  <i style={{ background: '#1D1C19' }} />
                  ink
                  <br />
                  #1D1C19
                </li>
                <li>
                  <i style={{ background: '#3F5236' }} />
                  moss
                  <br />
                  #3F5236
                </li>
                <li>
                  <i style={{ background: '#BEB9AD' }} />
                  rule
                  <br />
                  #BEB9AD
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2 DESIGN */}
        <section className="section" id="design">
          <h2>2. Design</h2>
          <h3 className="sub-h" id="g-asis">
            2.1 Recovered as-is architecture (version 0)
          </h3>
          <Figure src="as-is.svg" n={3} title="The starter as it actually runs">
            Recovered from the code, not from its documentation. Numbered markers are debt items from section 1.4.
          </Figure>
          <Figure src="before-after.svg" n={4} title="Before and after">
            Page switching by state (version 0) becomes URL routing through a route table into a shared Layout; pages read typed data.
          </Figure>
          <h3 className="sub-h" id="g-block">
            2.2 Target architecture (block diagram)
          </h3>
          <Figure src="block.svg" n={5} title="Block diagram">
            Build time produces build/, which any static host serves. In the browser, the router picks a page, the page is built from shared
            components, and components read typed data or the Redux store. The API is used only when VITE_API_URL is set.
          </Figure>
          <h3 className="sub-h" id="g-tree">
            2.3 Structure of the code
          </h3>
          <pre className="tree">{`Salim-Saay/                   (the starter repository, evolved in place)
├── index.html · vite.config.ts (base './') · tsconfig.json (strict)
├── public/                   images/ videos/ diagrams/ favicon.svg
├── src/
│   ├── main.tsx              Redux Provider, fonts, stylesheet
│   ├── App.tsx               HashRouter + routes inside Layout
│   ├── routes.tsx            page metadata joined with page components
│   ├── lib/navigation.ts     one page list: path, label, keywords
│   ├── components/           Layout, Navbar, Footer, ThemeToggle, PageHeader,
│   │                         Section, Card, Timeline, Lightbox, CommunityFeed, Chat
│   ├── pages/                Home About Education Knowledge Gallery Videos
│   │                         Blog Messages Search Readme NotFound
│   ├── data/                 typed content, change log, metrics.json
│   ├── services/postsApi.ts  API or localStorage: the only place that knows
│   ├── store/                posts and auth slices (from the starter)
│   ├── hooks/                useStoredState, typed Redux hooks
│   └── styles/global.css     the only stylesheet
├── server/                   Express API (from the starter, hardened)
├── legacy/phase2-candidates/ Analytics and GitHub pages, parked
├── tools/                    metrics, browser test, API test
└── .github/workflows/        build and deploy`}</pre>
          <h3 className="sub-h" id="g-flow">
            2.4 Control flow
          </h3>
          <Figure src="flow-navigation.svg" n={6} title="Navigation and rendering">
            A click changes the URL hash; the router matches a route or falls back to NotFound; Layout renders the page and resets title and scroll.
          </Figure>
          <Figure src="flow-post.svg" n={7} title="Posting to the community feed">
            Without VITE_API_URL the post goes straight into Redux and localStorage; with it, the post is sent with a token and added only on 201.
          </Figure>
          <h3 className="sub-h" id="g-comp">
            2.5 Component diagram
          </h3>
          <Figure src="components.svg" n={8} title="Component diagram">
            App provides the store and the router; Layout composes Navbar, Footer and the routed page. Dashed arrows are dependencies.
          </Figure>
        </section>

        {/* 3 DEV 1 */}
        <section className="section" id="dev1">
          <h2>3. Development, iteration 1</h2>
          <h3 className="sub-h" id="i1-pages">
            3.1 Home page and four additional pages
          </h3>
          <div className="prose">
            <p>
              Iteration 1 (tag <code>v1.0-iteration1</code>: CR-01 to CR-03) cleared the dead weight, replaced state-based page switching with URL
              routing, and built the Home page (new: the starter opened on its feed) and four further pages: About, Education, Professional
              Knowledge and Pictures. Each page maps typed data from <code>src/data</code> to markup.
            </p>
          </div>
          <h3 className="sub-h" id="i1-nav">
            3.2 Navigation bar
          </h3>
          <div className="prose">
            <p>
              The starter's menu was a second, hand-kept list that had lost the Blog page. The Navbar is now generated from the same page list as
              the router, so a page cannot exist without a menu entry. NavLink marks the current page with <code>aria-current="page"</code>.
            </p>
          </div>
          <pre className="code">{`{pages.filter((p) => p.inNav).map((p) => (
  <li key={p.path}>
    <NavLink to={p.path} end={p.path === '/'}>{p.label}</NavLink>
  </li>
))}`}</pre>
          <h3 className="sub-h" id="i1-routes">
            3.3 Route table
          </h3>
          <Table head={['Path', 'Page', 'In menu']} rows={[...pages.map((p) => [<code>{p.path}</code>, p.title, p.inNav ? 'yes' : 'no']), [<code>*</code>, 'Not found', 'no']]} />
        </section>

        {/* 4 DEV 2 */}
        <section className="section" id="dev2">
          <h2>4. Development, iteration 2</h2>
          <h3 className="sub-h" id="i2-css">
            4.1 CSS for all pages
          </h3>
          <div className="prose">
            <p>
              One stylesheet, <code>src/styles/global.css</code>, formats every page. It replaces 58 KB of pre-compiled utilities that could not be
              regenerated. Colours and fonts exist only as CSS variables, so the dark theme is a small override of the variables.
            </p>
          </div>
          <h3 className="sub-h" id="i2-resp">
            4.2 Responsive layout and themes
          </h3>
          <Table
            head={['Width or setting', 'What changes']}
            rows={[
              ['Above 1200px', 'Full menu; case studies, video and chat in two columns'],
              ['900–1200px', 'Menu folds behind a Menu button; Search moves into it'],
              ['Below 900px', 'Case studies, timelines, video and chat stack into one column'],
              ['Below 720px / 420px', 'Tighter spacing; key numbers stack / logo mark hidden'],
              ['Dark setting or toggle', 'Colour variables switch; choice saved in this browser'],
              ['Print', 'Navigation and forms hidden'],
            ]}
          />
          <h3 className="sub-h" id="i2-render">
            4.3 Rendering and routing
          </h3>
          <div className="prose">
            <p>
              HashRouter keeps every route inside index.html (<code>/#/about</code>), so any static host works without rewrite rules; refresh, Back
              and links now work. <code>/knowledge?case=ocr</code> deep-links to a case study. Layout sets the page title and scrolls to the top on
              every route change. The feed renders from Redux, and <code>services/postsApi</code> is the only module that chooses between the API
              and localStorage.
            </p>
          </div>
          <h3 className="sub-h" id="i2-log">
            4.4 Change log: version 0 to 1.0
          </h3>
          <Table
            head={['ID', 'Change', 'Type', 'Closes', 'Commit']}
            rows={changes.map((c) => [<b>{c.id}</b>, c.change, <span className={`pill ${c.type}`}>{c.type}</span>, c.closes, <code>{c.commit}</code>])}
          />
          <h3 className="sub-h" id="i2-size">
            4.5 Size of the system
          </h3>
          <Table
            head={['Measure', `Version 0 (${v0.commit})`, 'Version 1.0']}
            rows={[
              ['Strict TypeScript errors', '79 (never checked)', '0 (checked in every build)'],
              ['Pages with their own URL', '0', '10 + NotFound'],
              ['Source files in src/ (ts, tsx, css)', v0.sourceFiles, v1.sourceFiles],
              ['Source lines in src/', v0.sourceLines.toLocaleString('en-IE'), v1.sourceLines.toLocaleString('en-IE')],
              ['Runtime dependencies', v0.runtimeDependencies, v1.runtimeDependencies],
              ['Files in the repository', v0.filesInRepository, v1.filesInRepository],
              ['Size of tracked files', `${v0.trackedMB} MB`, `${v1.trackedMB} MB`],
            ]}
          />
          <p className="note">Measured with tools/metrics.mjs from git on {metrics.measuredOn}.</p>
        </section>

        {/* 5 EVALUATION */}
        <section className="section" id="evaluation">
          <h2>5. Evaluation</h2>
          <h3 className="sub-h" id="e-tests">
            5.1 Testing
          </h3>
          <Table
            head={['Test (tools/browser-test.mjs, tools/api-test.sh)', 'Result']}
            rows={[
              ['Build: strict type check and bundle with no errors', <Pass />],
              ['All ten routes render one heading; an unknown route renders NotFound', <Pass n="11/11" />],
              ['Navbar marks the current page; the title follows the route', <Pass />],
              ['Home "Read the case study" opens that case study', <Pass />],
              ['Gallery filter and Lightbox: filter, open, arrow key, Escape, focus return', <Pass n="5/5" />],
              ['Video playlist switches the player', <Pass />],
              ['Blog feed: publish, like, comment; the post survives a reload', <Pass n="4/4" />],
              ['Messages: the assistant answers; a lounge message reaches a second tab once', <Pass n="2/2" />],
              ['Search for "OCR" finds the case study; dark mode survives a reload', <Pass n="2/2" />],
              ['390px: no sideways scrolling on 4 pages; the mobile menu opens and closes', <Pass n="6/6" />],
              ['No JavaScript errors in the console during the run', <Pass />],
              ['API: register, wrong password rejected, delete without token 401, by another user 403, by author 200', <Pass n="5/5" />],
            ]}
          />
          <h3 className="sub-h" id="e-review">
            5.2 Critical review
          </h3>
          <div className="grid g2">
            <div className="panel">
              <h3>What worked</h3>
              <ul>
                <li>Reading the code before using the site found the two security faults and the hidden Blog page.</li>
                <li>Evolving in place kept the working parts and made every change reviewable in git.</li>
                <li>Features grew while dependencies fell from 47 to 8, mostly by deleting what was never used.</li>
                <li>Generating the menu from the route list removes the cause of TD-02, not just one occurrence of it.</li>
              </ul>
            </div>
            <div className="panel">
              <h3>What I would question</h3>
              <ul>
                <li>The lounge connects tabs in one browser only. Two people on different devices cannot talk yet.</li>
                <li>Large deletions were checked by the type checker and a browser run, not by unit tests.</li>
                <li>HashRouter URLs contain #, which is worse for sharing and search engines.</li>
                <li>Analytics and GitHub pages are parked: a deliberate, but real, loss of function.</li>
              </ul>
            </div>
          </div>
          <h3 className="sub-h" id="e-enh">
            5.3 Enhancements and Phase 2
          </h3>
          <Table
            head={['#', 'Enhancement', 'Why', 'Type']}
            rows={[
              ['1', 'Hosted API (ASP.NET Core) with a database', 'One shared feed for every visitor', 'perfective'],
              ['2', 'Real-time messaging across devices with SignalR', 'Chat between people, not just tabs', 'perfective'],
              ['3', 'Expiring sessions, rate limiting, admin moderation', 'Production-ready security', 'preventive'],
              ['4', 'Unit tests for the posts slice and postsApi; browser test in CI', 'Catch regressions before deploy', 'preventive'],
              ['5', 'Route-based code splitting with React.lazy', 'Faster first load', 'perfective'],
              ['6', 'Restore Analytics and GitHub pages in the new design', 'Bring back parked features', 'adaptive'],
              ['7', 'Video captions and a WCAG 2.2 AA audit', 'Accessibility', 'corrective'],
            ]}
          />
          <Figure src="phase2.svg" n={9} title="Phase 2 architecture">
            The Phase 1 site becomes the front end of an ASP.NET Core API with a database, authentication and a SignalR hub.
          </Figure>
          <h3 className="sub-h" id="e-lehman">
            5.4 Lehman's laws
          </h3>
          <div className="prose">
            <p>
              <b>Continuing change.</b> The starter changed in three bursts over eleven months; version 1.0 is a further change (new owner, new
              content, any host) and Phase 2 is planned, not optional.
            </p>
            <p>
              <b>Increasing complexity.</b> The starter's history has no simplifying commit. Phase 1 put simplification first (CR-01, CR-06) and
              only then added features.
            </p>
            <p>
              <b>Continuing growth and declining quality.</b> Functionality grew while size fell; type checks now run on every build and the
              structure is documented inside the product, against the documentation drift found in section 1.3.
            </p>
          </div>
        </section>

        <section className="section" id="refs">
          <h2>6. References</h2>
          <div className="prose refs">
            {references.map((r) => (
              <p key={r}>{r}</p>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

// Hash links would change the route under HashRouter, so scroll instead.
function jump(e: MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
