/**
 * @file Footer: shown on every page. Copyright and the Dashboard and LinkedIn links.
 * CR-47: the module name and the Readme link were removed from the footer, so the site reads as a
 * personal portfolio; the Readme page still exists for anyone given its address.
 */
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>© 2026 {SITE.owner} · Limerick, Ireland</span>
        <nav className="footer-links" aria-label="More">
          <Link to="/dashboard">Dashboard</Link>
          <a href={SITE.linkedin}>LinkedIn</a>
        </nav>
      </div>
    </footer>
  );
}
