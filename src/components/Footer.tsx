import { Link } from 'react-router-dom';
import { profile } from '../data/profile';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>© 2026 {profile.name} · Portfolio version 1.0</span>
        <span>CS5709 Software Engineering Evolution, University of Limerick</span>
        <Link to="/readme">How this site is built</Link>
      </div>
    </footer>
  );
}
