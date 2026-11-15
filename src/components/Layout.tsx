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
import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SITE } from '../config/site';
import { AppStatus } from '../features/pwa/AppStatus';
import { useScrollReveal } from '../features/motion/useScrollReveal';
import { loadMotion, reducedMotion } from '../features/motion/gsap';
import { scrollToTop, useSmoothScroll } from '../features/motion/useSmoothScroll';
import { useAppDispatch } from '../hooks/redux';
import { fetchContent } from '../store/contentSlice';
import { preloadPages } from '../routes';
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

  // CR-44: when the first page is idle, fetch the other pages and their main content files,
  // so every later page change is instant.
  const dispatch = useAppDispatch();
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    idle(() => {
      preloadPages();
      (['profile', 'projects', 'career', 'education', 'gallery', 'blog'] as const).forEach((n) => void dispatch(fetchContent(n)));
    });
  }, [dispatch]);

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
            <div className="page" key={pathname}>
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
