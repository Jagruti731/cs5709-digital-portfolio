/**
 * @file End-to-end walkthrough of the built site in Chromium (Playwright).
 *
 * Each check follows a step a persona takes (see README section 5, Requirements) and
 * asserts the result; the script exits with status 1 if any check fails,
 * so the CI/CD pipeline stops before deployment.
 * Results are also written to coverage/e2e-results.json for the quality dashboard.
 * Usage: npm run build && npm run preview, then
 *   node tools/browser-test.mjs http://localhost:4173/
 * Set PW_CHROMIUM to a Chromium binary if Playwright's own browser is not installed.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4173/';
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const context = await browser.newContext({ viewport: { width: 1360, height: 900 } });
// The GitHub API is replaced by a recorded-style answer, so the test never depends on
// the network or on GitHub's hourly limit (shared CI machines often reach it).
const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const fakeGitHub = {
  user: { login: 'Jagruti731', html_url: 'https://github.com/Jagruti731', public_repos: 2, followers: 0, created_at: hoursAgo(9000) },
  repos: [
    {
      id: 1,
      name: 'cs5709-digital-portfolio',
      language: 'TypeScript',
      description: 'Portfolio',
      html_url: '#',
      stargazers_count: 0,
      forks_count: 0,
      updated_at: hoursAgo(1),
      fork: false,
    },
    {
      id: 2,
      name: 'IMSWebApp',
      language: 'C#',
      description: 'Inventory',
      html_url: '#',
      stargazers_count: 1,
      forks_count: 0,
      updated_at: hoursAgo(90),
      fork: false,
    },
  ],
  runs: {
    workflow_runs: [
      {
        id: 1,
        run_number: 3,
        display_title: 'test run',
        event: 'push',
        status: 'completed',
        conclusion: 'success',
        head_branch: 'main',
        head_sha: 'abcdef1234',
        html_url: '#',
        created_at: hoursAgo(1),
        updated_at: hoursAgo(1),
      },
    ],
  },
  commits: [{ sha: 'abcdef1234', html_url: '#', commit: { message: 'test commit', author: { name: 'J', date: hoursAgo(1) } } }],
};
await context.route('https://api.github.com/**', (route) => {
  const url = route.request().url();
  const body = url.includes('/actions/runs')
    ? fakeGitHub.runs
    : url.includes('/commits')
      ? fakeGitHub.commits
      : url.includes('/repos?')
        ? fakeGitHub.repos
        : fakeGitHub.user;
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(body),
  });
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const go = async (path) => {
  await page.goto(`${base}#${path}`);
  await page.waitForTimeout(400);
};

// 1. Every route renders a heading; an unknown route renders NotFound.
const routes = ['/', '/about', '/education', '/knowledge', '/gallery', '/videos', '/blog', '/messages', '/search', '/readme', '/dashboard'];
const failedRoutes = [];
let rendered = 0;
for (const r of routes) {
  await go(r);
  if ((await page.locator('main h1').count()) === 1) rendered++;
  else failedRoutes.push(r);
}
await go('/no-such-page');
const notFound = (await page.locator('main h1').textContent())?.includes('not found');
check(
  `All ${routes.length} routes render one h1; unknown route shows NotFound`,
  rendered === routes.length && notFound,
  `${rendered + (notFound ? 1 : 0)}/${routes.length + 1}${failedRoutes.length ? `, failed: ${failedRoutes.join(' ')}` : ''}`,
);

// 1b. The skip link moves focus to the content without changing the route (CR-14).
await go('/about');
await page.reload(); // a fresh load, so Tab starts from the top of the page
await page.waitForTimeout(400);
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');
check(
  'Skip link focuses the content and keeps the route',
  page.url().endsWith('#/about') && (await page.evaluate(() => document.activeElement?.id)) === 'main',
);

// 2. Navbar marks the current page; title follows the route.
await go('/education');
check(
  'Navbar marks the current page; title follows the route',
  (await page.locator('.nav-links a[aria-current="page"]').textContent()) === 'Education' && (await page.title()).startsWith('Education'),
);

// 3. Home case-study link deep-links into Professional Knowledge.
await go('/');
await page.locator('.work-card a').nth(1).click();
await page.waitForTimeout(800);
check('Home "Read the case study" opens that case study', page.url().includes('case=ocr') && (await page.locator('#ocr').isVisible()));

// 4. Gallery filter and Lightbox.
await go('/gallery');
await page.getByRole('button', { name: 'Places' }).click();
const places = await page.locator('.shot').count();
await page.getByRole('button', { name: /^All/ }).click();
await page.locator('.shot button').first().click();
const open = await page.locator('.lightbox').isVisible();
await page.keyboard.press('ArrowRight');
const moved = (await page.locator('.lightbox figcaption').textContent())?.includes('2 of 10');
await page.keyboard.press('Escape');
const closed = (await page.locator('.lightbox').count()) === 0;
const focusBack = await page.evaluate(() => document.activeElement?.closest('.shot') !== null);
const galleryParts = [places === 3, open, moved, closed, focusBack];
check(
  'Gallery filter and Lightbox (filter, open, arrow key, Escape, focus return)',
  galleryParts.every(Boolean),
  `${galleryParts.filter(Boolean).length}/${galleryParts.length}`,
);

// 5. Video playlist.
await go('/videos');
await page.locator('.playlist button').nth(2).click();
await page.waitForTimeout(300);
check('Video playlist switches the player', (await page.locator('.player source').getAttribute('src'))?.includes('lehman-laws'));

// 6. Blog feed: post, like, comment, reload.
await go('/blog');
await page.fill('#pf-name', 'Tester');
await page.fill('#pf-text', 'Hello from the browser test');
await page.getByRole('button', { name: 'Post' }).click();
await page.waitForTimeout(300);
const posted = (await page.locator('.post').count()) >= 1;
await page.locator('.post .text-btn', { hasText: 'Like' }).first().click();
const liked = (await page.locator('.post .text-btn').first().textContent())?.includes('Liked (1)');
await page.locator('.comment-form input').first().fill('Nice');
await page.locator('.comment-form button').first().click();
const commented = (await page.locator('.comment').count()) >= 1;
await page.reload();
await page.waitForTimeout(500);
const survived = (await page.locator('.post-text', { hasText: 'Hello from the browser test' }).count()) === 1;
const feedParts = [posted, liked, commented, survived];
check('Blog feed: publish, like, comment; post survives a reload', feedParts.every(Boolean), `${feedParts.filter(Boolean).length}/4`);

// 7. Messaging: assistant reply and lounge delivery to a second tab.
await go('/messages');
await page.fill('.chat-compose input', 'Where did you study?');
await page.locator('.chat-compose button').click();
await page.waitForTimeout(2500);
const answered = (await page.locator('.bubble', { hasText: 'University of Limerick' }).count()) >= 1;
const second = await context.newPage();
await second.goto(`${base}#/messages`);
await second.getByRole('tab', { name: /Visitor lounge/ }).click();
await page.getByRole('tab', { name: /Visitor lounge/ }).click();
await page.fill('.chat-compose input', 'Hello other tab');
await page.locator('.chat-compose button').click();
await second.waitForTimeout(600);
const delivered = (await second.locator('.bubble', { hasText: 'Hello other tab' }).count()) === 1;
await second.close();
check(
  'Messages: assistant answers; lounge message reaches a second tab once',
  answered && delivered,
  `${[answered, delivered].filter(Boolean).length}/2`,
);

// 7b. Readme page: README rendered with contents; requirements traced; change log filter.
await go('/readme');
const tocItems = await page.locator('.readme-toc li').count();
await page.getByRole('tab', { name: 'Requirements' }).click();
await page.waitForTimeout(400);
const personas = await page.locator('.requirements .card').count();
await page.getByRole('button', { name: /^Phase 2/ }).click();
const phase2Rows = await page.locator('.requirements tbody tr').count();
await page.getByRole('tab', { name: 'Change log' }).click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /^corrective/ }).click();
const correctiveRows = await page.locator('tbody tr').count();
check(
  'Readme: contents, 3 personas, Phase 2 feature filter, change-log type filter',
  tocItems > 10 && personas === 3 && phase2Rows > 11 && correctiveRows >= 2,
  `toc ${tocItems}, personas ${personas}, rows ${phase2Rows}/${correctiveRows}`,
);

// 8. Search.
await go('/search');
await page.fill('#q', 'OCR');
const ocrFound = (await page.locator('.results a', { hasText: 'Bank statement' }).count()) === 1;
await page.fill('#q', 'Gemni bank'); // typo on purpose
await page.waitForTimeout(300);
const corrected = (await page.locator('.note', { hasText: 'Showing results for' }).count()) === 1;
const firstIsOcr = (await page.locator('.results li a').first().textContent())?.includes('Bank statement');
const marked = (await page.locator('.results mark').count()) > 0;
await page.getByRole('tab', { name: /Source code/ }).click();
await page.fill('#q', 'skip link');
await page.waitForTimeout(500);
const codeHit = (await page.locator('.results li a').first().textContent()) === 'src/components/Layout.tsx';
await go('/about');
await page.keyboard.press('/');
await page.waitForTimeout(400);
const shortcut = page.url().includes('#/search');
const searchParts = [ocrFound, corrected, firstIsOcr, marked, codeHit, shortcut];
check(
  'Smart search: finds OCR; corrects a typo and ranks; highlights; locates "skip link" in Layout.tsx; "/" shortcut',
  searchParts.every(Boolean),
  `${searchParts.filter(Boolean).length}/${searchParts.length}`,
);

// 8b. Dashboard: live GitHub data (US3) and the language filter.
await go('/dashboard');
await page.waitForTimeout(500);
const metrics = await page.locator('.github .metric').count();
const passed = (await page.locator('.runs .badge.ok').count()) === 1;
await page.getByRole('button', { name: 'C#', exact: true }).click();
const filtered = (await page.locator('.repo').count()) === 1;
check(
  'Dashboard: GitHub summary, pipeline run status, repository language filter',
  metrics === 4 && passed && filtered,
  `${metrics} metrics`,
);

// 9. Theme survives a reload.
await go('/');
await page.getByRole('button', { name: 'Dark mode' }).click();
await page.reload();
await page.waitForTimeout(300);
check('Dark mode choice survives a reload', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
await page.getByRole('button', { name: 'Light mode' }).click();

// 10. Mobile width.
await page.setViewportSize({ width: 390, height: 844 });
let noOverflow = 0;
for (const r of ['/', '/knowledge', '/blog', '/messages']) {
  await go(r);
  if (await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)) noOverflow++;
}
await page.getByRole('button', { name: 'Menu' }).click();
const menuOpen = await page.locator('.navbar.open').count();
await page.locator('.nav-links a', { hasText: 'About' }).click();
await page.waitForTimeout(300);
const menuClosed = (await page.locator('.navbar.open').count()) === 0;
check(
  'No sideways scrolling at 390px (4 pages); mobile menu opens and closes',
  noOverflow === 4 && menuOpen === 1 && menuClosed,
  `${noOverflow + (menuOpen ? 1 : 0) + (menuClosed ? 1 : 0)}/6`,
);

check('No JavaScript errors in the console during the run', errors.length === 0, errors.join(' | '));
await browser.close();

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
mkdirSync(new URL('../coverage/', import.meta.url), { recursive: true });
writeFileSync(
  new URL('../coverage/e2e-results.json', import.meta.url),
  JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2),
);
process.exit(results.every((r) => r.ok) ? 0 : 1);
