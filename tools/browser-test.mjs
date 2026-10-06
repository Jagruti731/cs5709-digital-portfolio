// Smoke test of the built site in Chromium (Playwright).
// Usage: npm run build, serve build/ (e.g. npx vite preview --port 4173), then
//   node tools/browser-test.mjs http://localhost:4173/
// Set PW_CHROMIUM to a Chromium binary if Playwright's own browser is not installed.
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4173/';
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const context = await browser.newContext({ viewport: { width: 1360, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const go = async (path) => {
  await page.goto(`${base}#${path}`);
  await page.waitForTimeout(400);
};

// 1. Every route renders a heading; an unknown route renders NotFound.
const routes = ['/', '/about', '/education', '/knowledge', '/gallery', '/videos', '/blog', '/messages', '/search', '/readme'];
let rendered = 0;
for (const r of routes) {
  await go(r);
  if ((await page.locator('main h1').count()) === 1) rendered++;
}
await go('/no-such-page');
const notFound = (await page.locator('main h1').textContent())?.includes('not found');
check('All ten routes render one h1; unknown route shows NotFound', rendered === 10 && notFound, `${rendered + (notFound ? 1 : 0)}/11`);

// 2. Navbar marks the current page; title follows the route.
await go('/education');
check('Navbar marks the current page; title follows the route',
  (await page.locator('.nav-links a[aria-current="page"]').textContent()) === 'Education' && (await page.title()).startsWith('Education'));

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
check('Gallery filter and Lightbox (filter, open, arrow key, Escape, focus return)', places === 3 && open && moved && closed && focusBack, '5/5');

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
check('Blog feed: publish, like, comment; post survives a reload', posted && liked && commented && survived, '4/4');

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
check('Messages: assistant answers; lounge message reaches a second tab once', answered && delivered, '2/2');

// 8. Search.
await go('/search');
await page.fill('#q', 'OCR');
check('Search for "OCR" finds the case study', (await page.locator('.results a', { hasText: 'Bank statement' }).count()) === 1);

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
check('No sideways scrolling at 390px (4 pages); mobile menu opens and closes', noOverflow === 4 && menuOpen === 1 && menuClosed, `${noOverflow + (menuOpen ? 1 : 0) + (menuClosed ? 1 : 0)}/6`);

check('No JavaScript errors in the console during the run', errors.length === 0, errors.join(' | '));
await browser.close();

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
