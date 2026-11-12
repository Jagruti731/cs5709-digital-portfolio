/**
 * @file Footer: shown on every page. Version, module name and a link to the Readme page.
 */
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>
          © 2026 {SITE.owner} · Portfolio version {SITE.version}
        </span>
        <span>{SITE.module}</span>
        <Link to="/readme">How this site is built</Link>
      </div>
    </footer>
  );
}
