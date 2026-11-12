/**
 * @file Footer: shown on every page. Version, module, and the links that left the menu in CR-30:
 * Readme (how the site is built, required by the brief) and Dashboard (GitHub and code quality).
 */
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>
          © 2026 {SITE.owner} · v{SITE.version} · {SITE.module}
        </span>
        <nav className="footer-links" aria-label="About this site">
          <Link to="/readme">Readme</Link>
          <Link to="/dashboard">Dashboard</Link>
          <a href={SITE.linkedin}>LinkedIn</a>
        </nav>
      </div>
    </footer>
  );
}
