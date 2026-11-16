/**
 * @file Content Security Policy for the built site (CR-58).
 *
 * GitHub Pages cannot send custom HTTP headers, so the policy is added to index.html
 * as a <meta http-equiv="Content-Security-Policy"> tag at build time (vite.config.ts).
 * Browsers apply it the same way as the header, except frame-ancestors and reporting,
 * which only work as a header. Only the development server is left without it, because
 * Vite's hot reload needs inline scripts.
 *
 * What it allows, and why:
 *  - scripts, styles, fonts, videos, the manifest and the service worker: this site only
 *  - images: this site, plus data: and blob: for pictures attached to feed posts
 *  - style attributes: React and GSAP set inline styles for layout and motion
 *  - connections: this site, the GitHub REST API (Dashboard) and Google APIs (Firebase
 *    sign-in and Firestore for the shared feed and lounge)
 *  - no plugins, no frames, no forms sent elsewhere, no <base> changes
 */
export const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'media-src': ["'self'"],
  'connect-src': ["'self'", 'https://api.github.com', 'https://*.googleapis.com'],
  'worker-src': ["'self'"],
  'manifest-src': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/** The policy as one string, as it goes into the meta tag. */
export const contentSecurityPolicy = (): string =>
  Object.entries(CSP_DIRECTIVES)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
