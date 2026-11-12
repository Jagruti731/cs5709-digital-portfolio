/**
 * @file Navbar: the site navigation shown on every page.
 *
 * Links come from the same page list as the router (lib/navigation.ts), so a
 * page can never be missing from the menu. Below 1200px the links fold behind
 * a Menu button, which closes again after each navigation.
 */
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE } from '../config/site';
import { pages } from '../lib/navigation';
import { ThemeToggle } from './ThemeToggle';

/**
 * Site navigation. The links are generated from the same page list as the
 * router, so a page can never be missing from the menu (the starter's menu
 * was a separate list and had lost the Blog page).
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu after every navigation.
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={`navbar${open ? ' open' : ''}`}>
      <div className="container">
        <Link className="logo" to="/">
          <span className="logo-mark">{SITE.initials}</span>
          <span className="logo-name">{SITE.owner}</span>
        </Link>
        <Link className="icon-btn search-link" to="/search" title="Search (press /)" aria-keyshortcuts="/">
          Search
        </Link>
        <ThemeToggle />
        <button
          className="icon-btn menu-btn"
          type="button"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <ul className="nav-links" id="nav-links">
          {pages
            .filter((p) => p.inNav)
            .map((p) => (
              <li key={p.path}>
                <NavLink to={p.path} end={p.path === '/'}>
                  {p.label}
                </NavLink>
              </li>
            ))}
          <li className="nav-search">
            <NavLink to="/search">Search</NavLink>
          </li>
        </ul>
      </div>
    </header>
  );
}
