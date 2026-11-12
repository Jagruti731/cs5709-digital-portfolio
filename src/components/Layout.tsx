/**
 * @file Layout: the shell around every page – skip link, navigation bar, the routed page and the footer.
 *
 * Also sets the browser tab title, scrolls to the top on each navigation, and
 * moves focus to the page content when the skip link is used (CR-14).
 */
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SITE } from '../config/site';
import { pages } from '../lib/navigation';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

/** The app shell shared by every route: skip link, navigation bar, the routed page and the footer. */
export function Layout() {
  const { pathname } = useLocation();

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
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
