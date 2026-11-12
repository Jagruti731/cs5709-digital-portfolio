/**
 * @file Layout: the shell around every page – skip link, navigation bar, the routed page and the footer.
 *
 * Also sets the browser tab title, scrolls to the top on each navigation, and
 * moves focus to the page content when the skip link is used (CR-14).
 * GSAP animations for every page start here: a page entrance and scroll reveals (CR-20).
 */
import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SITE } from '../config/site';
import { usePageIntro } from '../features/motion/usePageIntro';
import { useScrollReveal } from '../features/motion/useScrollReveal';
import { pages } from '../lib/navigation';
import { Footer } from './Footer';
import { LoadState } from './LoadState';
import { PageErrorBoundary } from './PageErrorBoundary';
import { Navbar } from './Navbar';

/** The app shell shared by every route: skip link, navigation bar, the routed page and the footer. */
export function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  useScrollReveal(mainRef);
  usePageIntro(mainRef, pathname);

  useEffect(() => {
    const page = pages.find((p) => p.path === pathname);
    document.title = page && page.path !== '/' ? `${page.title} | ${SITE.owner}` : `${SITE.owner} | Portfolio`;
    window.scrollTo(0, 0);
  }, [pathname]);

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
      <main id="main" tabIndex={-1} ref={mainRef}>
        <PageErrorBoundary resetKey={pathname}>
          <Suspense fallback={<LoadState status="loading" />}>
            <Outlet />
          </Suspense>
        </PageErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
