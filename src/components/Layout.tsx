/**
 * @file Layout: the shell around every page – skip link, navigation bar, the routed page and the footer.
 *
 * Also sets the browser tab title, scrolls to the top on each navigation, and
 * moves focus to the page content when the skip link is used (CR-14).
 * GSAP scroll reveals for every page start here (CR-20). The page entrance and count-up
 * animations were removed in CR-30 to make the site feel lighter.
 * CR-43: smooth scrolling (Lenis), magnetic buttons and the scanner cursor start here too.
 * CR-44: smoother page changes: the jump to the top goes through Lenis, each new page enters with a
 * short scan wipe, and the other pages are preloaded in the background.
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SITE } from '../config/site';
import { AppStatus } from '../features/pwa/AppStatus';
import { useScrollReveal } from '../features/motion/useScrollReveal';
import { loadMotion, reducedMotion } from '../features/motion/gsap';
import { scrollToTop, useSmoothScroll } from '../features/motion/useSmoothScroll';
import { usePrefetchContent } from '../hooks/usePrefetchContent';
import { preloadPages, preloadPath } from '../routes';
import { pages } from '../lib/navigation';
import { Footer } from './Footer';
import { LoadState } from './LoadState';
import { PageErrorBoundary } from './PageErrorBoundary';
import { Navbar } from './Navbar';
import { ScanCursor } from './ScanCursor';

/** The app shell shared by every route: skip link, navigation bar, the routed page and the footer. */
export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  useScrollReveal(mainRef);
  useSmoothScroll();

  useEffect(() => {
    const page = pages.find((p) => p.path === pathname);
    document.title = page && page.path !== '/' ? `${page.title} | ${SITE.owner}` : `${SITE.owner} | Portfolio`;
    scrollToTop();
    // New content changes the page height, so scroll animations measure again once it has rendered.
    if (reducedMotion()) return;
    const timer = window.setTimeout(() => void loadMotion().then(({ ScrollTrigger }) => ScrollTrigger.refresh()), 400);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // CR-44, CR-50: a page is fetched as soon as the visitor points at or focuses a link to it,
  // and all pages and main content files are fetched a few seconds after load, so page changes
  // are instant without slowing down the first page.
  const prefetch = usePrefetchContent();
  useEffect(() => {
    const intent = (e: Event) => {
      const href = (e.target as Element | null)?.closest?.('a[href^="#/"]')?.getAttribute('href');
      if (href) preloadPath(href.slice(1).split('?')[0]);
    };
    document.addEventListener('pointerover', intent);
    document.addEventListener('focusin', intent);
    const timer = window.setTimeout(() => {
      preloadPages();
      prefetch(['profile', 'projects', 'career', 'education', 'gallery', 'blog', 'videos']);
    }, 6000);
    return () => {
      document.removeEventListener('pointerover', intent);
      document.removeEventListener('focusin', intent);
      window.clearTimeout(timer);
    };
  }, [prefetch]);

  // The page entrance plays only on page changes, not on the first load (CR-50).
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (!first) return;
    const t = window.setTimeout(() => setFirst(false), 50);
    return () => window.clearTimeout(t);
  }, [first]);

  // Keyboard shortcut: "/" anywhere (outside a text field) opens Search (CR-21).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The target can be the document itself, which has no closest() (inspection D4).
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]');
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate('/search', { state: { focusSearch: true } });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <>
      {/* With HashRouter, href="#main" would change the route to /main (a 404).
          So the link moves focus to the content itself (peer review: "skip link breaks HashRouter, Layout:20"). */}
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <Navbar />
      <ScanCursor />
      <main id="main" tabIndex={-1} ref={mainRef}>
        <PageErrorBoundary resetKey={pathname}>
          <Suspense fallback={<LoadState status="loading" />}>
            {/* Keyed by route, so each new page plays the entrance and the scan wipe (CR-44). */}
            <div className={first ? 'page first' : 'page'} key={pathname}>
              <i className="route-wipe" aria-hidden="true" />
              <Outlet />
            </div>
          </Suspense>
        </PageErrorBoundary>
      </main>
      <AppStatus />
      <Footer />
    </>
  );
}
